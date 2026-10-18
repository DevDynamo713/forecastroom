import { test, expect } from '@playwright/test';
test('forecastroom loads and adds forecast', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('ForecastRoom: demo');
  await page.locator('.metric-input').fill('revenue');
  await page.locator('.pred-input').fill('1500');
  await page.locator('.var-input').fill('100');
  await page.locator('.horizon-input').fill('30d');
  await page.locator('.add-btn').click();
  await expect(page.locator('.forecast-list').locator('div').first()).toBeVisible();
});