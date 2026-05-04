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

  fs.writeFileSync(
    path.join(__dirname, '.e2e-state.json'),
    JSON.stringify({ classId })
  );

  // 3. Set auth cookies so @supabase/ssr picks them up
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/');

  // Set the auth token as a cookie (used by @supabase/ssr)
  await context.addCookies([
    {
      name: `${cookieName}.0`,
      value: JSON.stringify({ access_token, refresh_token, token_type: 'bearer' }),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Also set in localStorage as fallback
  await page.evaluate(
    ({ key, access, refresh }) => {
      localStorage.setItem(key, JSON.stringify({ access_token: access, refresh_token: refresh }));
    },
    { key: cookieName, access: access_token, refresh: refresh_token }
  );

  await context.storageState({ path: path.join(__dirname, '.auth.json') });
  await browser.close();
}
