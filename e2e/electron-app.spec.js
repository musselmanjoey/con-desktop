// @ts-check
const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

// Electron-specific tests
test.describe('Electron App', () => {
  let electronApp;
  let page;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../src/main/main.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    // Get the first window that the app opens
    page = await electronApp.firstWindow();
    
    // Wait for the app to load
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('electron app launches successfully', async () => {
    // Check that the app launched and has a window
    expect(electronApp).toBeDefined();
    expect(page).toBeDefined();
    
    // Check basic window properties
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('displays professional navigation design', async () => {
    // Check for the professional navigation we designed
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('Con')).toBeVisible();
    await expect(page.getByText('AI Conference Content')).toBeVisible();
  });

  test('shows conference management interface', async () => {
    // Check for main conference management elements
    await expect(page.getByRole('heading', { name: 'Conferences' })).toBeVisible();
    await expect(page.getByText('Manage conference data and sessions')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add New Conference' })).toBeVisible();
  });

  test('has proper desktop window behavior', async () => {
    // Test window can be resized (desktop behavior)
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return {
        isResizable: win.isResizable(),
        isMinimizable: win.isMinimizable(),
        isMaximizable: win.isMaximizable()
      };
    });
    
    expect(windowState.isResizable).toBe(true);
    expect(windowState.isMinimizable).toBe(true);
    expect(windowState.isMaximizable).toBe(true);
  });

  test('electron API is available', async () => {
    // Check that our Electron IPC API is available
    const hasElectronAPI = await page.evaluate(() => {
      return typeof window.electronAPI !== 'undefined';
    });
    
    expect(hasElectronAPI).toBe(true);
  });

  test('can interact with conference form', async () => {
    // Click Add Conference button to test form interaction
    await page.getByRole('button', { name: 'Add New Conference' }).click();
    
    // We should see a form modal (even if basic implementation)
    // This tests the desktop modal interaction
    await page.waitForTimeout(500); // Give time for modal to appear
    
    // The specific form tests would depend on the current form implementation
    // For now, we just test that clicking doesn't crash the app
    const isStillResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    
    expect(isStillResponsive).toBe(true);
  });
});