import { chromium, type FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const email = process.env.E2E_EMAIL!;
  const password = process.env.E2E_PASSWORD!;

  // Sign in via Supabase REST API
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Supabase sign-in failed: ${await res.text()}`);
  }

  const { access_token, refresh_token } = await res.json();

  // Inject tokens into browser storage so the app treats the user as signed in
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/');

  await page.evaluate(
    ({ url, key, access, refresh }) => {
      const storageKey = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({ access_token: access, refresh_token: refresh })
      );
    },
    { url: supabaseUrl, key: supabaseKey, access: access_token, refresh: refresh_token }
  );

  await context.storageState({ path: 'e2e/.auth.json' });
  await browser.close();
}
