import { test, expect } from '@playwright/test';

test('главная страница открывается и название правильное', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL('https://adoption-one.vercel.app/');

  const title = await page.title();
  console.log('Title:', title);
  expect(title).toBe('Усыновление питомцев');
});