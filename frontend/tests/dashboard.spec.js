import { test, expect } from '@playwright/test';

const url = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Mojo Marketing Agent - E2E Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(url);
    });

    test('Main Dashboard Integrity', async ({ page }) => {
        // Wait for the dashboard header to settle
        await expect(page.getByText('Performance Dashboard')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Leads (7D)')).toBeVisible();
        await expect(page.getByText('Active Alerts')).toBeVisible();
    });

    test('Multi-Client Dropdown Works', async ({ page }) => {
        // Check initial client (should be Amara by default now)
        await expect(page.getByText('Amara')).toBeVisible({ timeout: 10000 });

        // Hover dropdown (group-hover in CSS)
        await page.locator('div.relative.group').hover();

        // Select client (even if only one for now, check it's clickable)
        const clientItem = page.locator('div.absolute.top-full >> text=Amara');
        await expect(clientItem).toBeVisible();
        await clientItem.click();

        // Verify it stays
        await expect(page.getByText('Amara')).toBeVisible();
    });

    test('Platform Toggling Syncs UI', async ({ page }) => {
        // Current: Meta
        await expect(page.getByText('Meta Ads')).toBeVisible();

        // Switch to Google
        await page.getByRole('button', { name: 'Google' }).click();

        // Verify Change
        await expect(page.getByText('Google Ads')).toBeVisible();
    });

    test('Navigation Views (Campaigns/Adsets/Creatives)', async ({ page }) => {
        // Switch to Campaigns
        await page.getByRole('button', { name: 'Campaigns' }).click();
        await expect(page.getByText('Campaign Performance')).toBeVisible();

        // Switch to Adsets
        await page.getByRole('button', { name: 'Adsets' }).click();
        await expect(page.getByText('Adset Audit')).toBeVisible();

        // Switch to Creatives
        await page.getByRole('button', { name: 'Creatives' }).click();
        await expect(page.getByText('Creative Analysis')).toBeVisible();
    });

    test('Settings Page Accessibility', async ({ page }) => {
        await page.getByRole('button', { name: 'Settings' }).click();
        await expect(page.getByText('Client Settings')).toBeVisible();
        await expect(page.getByText('Meta Ads API')).toBeVisible();
        await expect(page.getByText('Google Ads API')).toBeVisible();
    });

});
