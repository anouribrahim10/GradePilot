import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const email = process.env.E2E_EMAIL!;
  const password = process.env.E2E_PASSWORD!;

  // 1. Sign in via Supabase REST API
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(`Supabase sign-in failed: ${await res.text()}`);
  const { access_token, refresh_token } = await res.json();

  // 2. Create the e2e test class via backend API
  const classRes = await fetch(`${BACKEND_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ title: 'E2E Test Class' }),
  });

  if (!classRes.ok) {
    const body = await classRes.text();
    throw new Error(`Failed to create test class (${classRes.status}): ${body}`);
  }

  const cls = await classRes.json();
  const classId: string = cls.id;
  console.log(`[global-setup] created class id=${classId}`);

  // 3. Save class ID for tests to use
  fs.writeFileSync(
    path.join(__dirname, '.e2e-state.json'),
    JSON.stringify({ classId })
  );

  // 4. Inject tokens into browser storage
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/');

  await page.evaluate(
    ({ url, access, refresh }) => {
      const storageKey = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({ access_token: access, refresh_token: refresh })
      );
    },
    { url: supabaseUrl, access: access_token, refresh: refresh_token }
  );

  await context.storageState({ path: path.join(__dirname, '.auth.json') });
  await browser.close();
}
