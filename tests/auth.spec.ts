import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@adoption-test.com';
const ADMIN_PASSWORD = 'мой_надёжный_пароль';
const USER_EMAIL = 'user@adoption-test.com';
const USER_PASSWORD = 'мой_надёжный_пароль';

async function getRoleFromStorage(page: any): Promise<string | null> {
  return page.evaluate(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      const user = JSON.parse(userJson);
      return user.role || null;
    } catch {
      return null;
    }
  });
}

async function getRoleFromToken(page: any): Promise<string | null> {
  return page.evaluate(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || null;  
    } catch {
      return null;
    }
  });
}

test.describe('Авторизация — проверка role в JWT', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('админ логинится → role === "admin" в JWT', async ({ page }) => {
    await page.click('text=Войти');
    await expect(page.locator('text=Введите данные чтобы войти')).toBeVisible();

    await page.fill('input#email', ADMIN_EMAIL);
    await page.fill('input#password', ADMIN_PASSWORD);
    await page.click('button:has-text("Войти")');

    await expect(page.locator('text=Введите данные чтобы войти')).toBeHidden({ timeout: 10000 });

    const roleFromToken = await getRoleFromToken(page);

    expect(roleFromToken).toBe('admin');  });

  test('обычный пользователь логинится → role === "user" в JWT', async ({ page }) => {
    await page.click('text=Войти');
    await page.fill('input#email', USER_EMAIL);
    await page.fill('input#password', USER_PASSWORD);
    await page.click('button:has-text("Войти")');

    await expect(page.locator('text=Введите данные чтобы войти')).toBeHidden();

    const roleFromToken = await getRoleFromToken(page);

    expect(roleFromToken).toBe('user');
  });
});