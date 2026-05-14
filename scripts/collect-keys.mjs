/**
 * Autonomous API key collection script using Playwright
 * Navigates to service dashboards and extracts API keys
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PROFILE = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
const OUTPUT_FILE = path.join(process.cwd(), 'scripts', 'collected-keys.json');

const keys = {};

async function waitForNavigation(page, url, timeout = 15000) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
}

async function collectClerkKeys(page) {
  console.log('\n[1/4] Collecting Clerk keys...');
  await waitForNavigation(page, 'https://dashboard.clerk.com');
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('  Page:', title);

  // Check if already logged in
  if (title.includes('Sign in') || page.url().includes('sign-in')) {
    console.log('  Not logged in to Clerk. Trying Google OAuth...');
    const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google")').first();
    if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await googleBtn.click();
      await page.waitForTimeout(5000);
    }
  }

  await page.waitForTimeout(2000);
  const url = page.url();
  console.log('  Current URL:', url);

  if (url.includes('dashboard.clerk.com') && !url.includes('sign-in')) {
    // Navigate to API Keys
    await page.goto('https://dashboard.clerk.com/last-active?path=api-keys', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Try to find and click "Show secret key" or similar
    const showBtn = page.locator('button:has-text("Reveal"), button:has-text("Show"), button:has-text("Copy")').first();
    if (await showBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showBtn.click();
      await page.waitForTimeout(1000);
    }

    const content = await page.content();
    const pkMatch = content.match(/pk_(?:test|live)_[A-Za-z0-9]+/);
    const skMatch = content.match(/sk_(?:test|live)_[A-Za-z0-9]+/);

    if (pkMatch) keys.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pkMatch[0];
    if (skMatch) keys.CLERK_SECRET_KEY = skMatch[0];

    console.log('  PK found:', !!pkMatch, pkMatch ? pkMatch[0].substring(0, 20) + '...' : 'N/A');
    console.log('  SK found:', !!skMatch);
  } else {
    console.log('  Could not access Clerk dashboard - not logged in');
  }
}

async function collectSupabaseKeys(page) {
  console.log('\n[2/4] Collecting Supabase keys...');
  await waitForNavigation(page, 'https://supabase.com/dashboard');
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log('  Current URL:', url);

  if (url.includes('sign-in') || url.includes('login')) {
    console.log('  Not logged in to Supabase. Trying GitHub OAuth...');
    const ghBtn = page.locator('button:has-text("GitHub"), a:has-text("GitHub")').first();
    if (await ghBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ghBtn.click();
      await page.waitForTimeout(8000);
    }
  }

  const finalUrl = page.url();
  console.log('  After auth URL:', finalUrl);

  if (finalUrl.includes('dashboard') && !finalUrl.includes('sign-in') && !finalUrl.includes('login')) {
    // Get list of projects
    const content = await page.content();
    const projectLinks = await page.locator('a[href*="/project/"]').all();

    let projectRef = null;
    for (const link of projectLinks) {
      const href = await link.getAttribute('href');
      const match = href?.match(/\/project\/([a-zA-Z0-9]+)/);
      if (match) {
        projectRef = match[1];
        break;
      }
    }

    if (projectRef) {
      console.log('  Found project:', projectRef);
      await page.goto(`https://supabase.com/dashboard/project/${projectRef}/settings/api`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);

      const pageContent = await page.content();

      // Extract URL
      const urlMatch = pageContent.match(/https:\/\/[a-zA-Z0-9]+\.supabase\.co/);
      if (urlMatch) keys.NEXT_PUBLIC_SUPABASE_URL = urlMatch[0];

      // Extract anon key
      const anonMatch = pageContent.match(/eyJ[A-Za-z0-9+/=]{100,}/g);
      if (anonMatch) {
        keys.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonMatch[0];
        if (anonMatch.length > 1) keys.SUPABASE_SERVICE_ROLE_KEY = anonMatch[1];
      }

      // Get database URL from settings
      await page.goto(`https://supabase.com/dashboard/project/${projectRef}/settings/database`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      const dbContent = await page.content();
      const dbMatch = dbContent.match(/postgresql:\/\/[^\s"'<>]+/);
      if (dbMatch) keys.DATABASE_URL = dbMatch[0].replace(/\?.*/, '') + '?pgbouncer=true&connection_limit=1';

      keys._supabaseProjectRef = projectRef;
    } else {
      console.log('  No existing projects found - may need to create one');
    }
  } else {
    console.log('  Could not access Supabase dashboard');
  }
}

async function collectLiveKitKeys(page) {
  console.log('\n[3/4] Collecting LiveKit keys...');
  await waitForNavigation(page, 'https://cloud.livekit.io');
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log('  Current URL:', url);

  if (!url.includes('/projects') && (url.includes('sign-in') || url.includes('login') || url.includes('livekit.io') && !url.includes('cloud'))) {
    console.log('  Not logged in to LiveKit. Trying GitHub OAuth...');
    const ghBtn = page.locator('button:has-text("GitHub"), a:has-text("GitHub"), button:has-text("Sign in with GitHub")').first();
    if (await ghBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ghBtn.click();
      await page.waitForTimeout(8000);
    }
  }

  const finalUrl = page.url();
  console.log('  After auth URL:', finalUrl);

  if (finalUrl.includes('cloud.livekit.io')) {
    // Navigate to settings/keys
    await page.goto('https://cloud.livekit.io/projects', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Find project and go to keys
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (await projectLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await projectLink.getAttribute('href');
      const projMatch = href?.match(/\/projects\/([^/]+)/);
      if (projMatch) {
        await page.goto(`https://cloud.livekit.io/projects/${projMatch[1]}/keys`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(3000);
      }
    }

    const content = await page.content();
    const wsMatch = content.match(/wss:\/\/[a-zA-Z0-9\-]+\.livekit\.cloud/);
    const apiKeyMatch = content.match(/API[a-zA-Z0-9]{10,}/);

    if (wsMatch) keys.NEXT_PUBLIC_LIVEKIT_URL = wsMatch[0];
    if (apiKeyMatch) keys.LIVEKIT_API_KEY = apiKeyMatch[0];

    // Try to reveal secret
    const revealBtn = page.locator('button:has-text("Reveal"), button:has-text("Show"), svg[class*="eye"]').first();
    if (await revealBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await revealBtn.click();
      await page.waitForTimeout(1000);
      const updatedContent = await page.content();
      // LiveKit secrets are typically base64-like strings
      const secretMatch = updatedContent.match(/[A-Za-z0-9+/]{40,}={0,2}/g);
      if (secretMatch) keys.LIVEKIT_API_SECRET = secretMatch[0];
    }
  } else {
    console.log('  Could not access LiveKit dashboard');
  }
}

async function collectAnthropicKey(page) {
  console.log('\n[4/4] Collecting Anthropic API key...');
  await waitForNavigation(page, 'https://console.anthropic.com/settings/keys');
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log('  Current URL:', url);

  if (url.includes('login') || url.includes('sign-in') || !url.includes('console')) {
    console.log('  Not logged in to Anthropic. Trying Google OAuth...');
    const googleBtn = page.locator('button:has-text("Google"), [data-provider="google"], a:has-text("Google")').first();
    if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await googleBtn.click();
      await page.waitForTimeout(8000);
    }
  }

  const finalUrl = page.url();
  if (finalUrl.includes('console.anthropic.com')) {
    await page.goto('https://console.anthropic.com/settings/keys', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Try to create a new key if none exist, or find existing
    const createBtn = page.locator('button:has-text("Create Key"), button:has-text("New Key"), button:has-text("Create API Key")').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      // Fill in key name
      const nameInput = page.locator('input[placeholder*="name"], input[type="text"]').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill('Voon Production');
        await page.locator('button:has-text("Create"), button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }
    }

    const content = await page.content();
    const keyMatch = content.match(/sk-ant-api[0-9]+-[A-Za-z0-9\-_]+/);
    if (keyMatch) keys.ANTHROPIC_API_KEY = keyMatch[0];
    console.log('  Key found:', !!keyMatch);
  } else {
    console.log('  Could not access Anthropic console');
  }
}

async function main() {
  console.log('=== Voon Autonomous Key Collection ===');
  console.log('Using Chrome profile:', CHROME_PROFILE);

  let browser, context;

  try {
    // Try to launch with existing Chrome profile for logged-in sessions
    context = await chromium.launchPersistentContext(CHROME_PROFILE, {
      channel: 'chrome',
      headless: false,
      args: ['--no-first-run', '--no-default-browser-check', '--disable-blink-features=AutomationControlled'],
      viewport: { width: 1280, height: 800 },
    });
  } catch (err) {
    console.log('Failed to use Chrome profile, using fresh context:', err.message);
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
  }

  const page = await context.newPage();

  try {
    await collectClerkKeys(page);
    await collectSupabaseKeys(page);
    await collectLiveKitKeys(page);
    await collectAnthropicKey(page);
  } catch (err) {
    console.error('Error during collection:', err.message);
  }

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(keys, null, 2));
  console.log('\n=== COLLECTED KEYS ===');
  console.log(JSON.stringify(keys, null, 2));
  console.log('\nSaved to:', OUTPUT_FILE);

  await context.close();
  if (browser) await browser.close();
}

main().catch(console.error);
