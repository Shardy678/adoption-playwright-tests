import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@adoption-test.com';
const ADMIN_PASSWORD = 'мой_надёжный_пароль';

test.describe('Создание животного', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('админ создаёт новое животное успешно', async ({ page }) => {
    // Логин как админ
    await page.click('text=Войти');
    await expect(page.locator('text=Введите данные чтобы войти')).toBeVisible();
    await page.fill('input#email', ADMIN_EMAIL);
    await page.fill('input#password', ADMIN_PASSWORD);
    await page.click('button:has-text("Войти")');
    await expect(page.locator('text=Введите данные чтобы войти')).toBeHidden({ timeout: 10000 });

    // Клик на "Админка" в навбаре для перехода в админ-панель
    await page.click('text=Админка');
    // await expect(page.locator('text=Дэшборд')).toBeVisible();

    // Переключаемся на таб "Управление животными"
    await page.click('text=Управление животными');

    // Клик на "Добавить новое"
    await page.click('text=Добавить новое');
    await expect(page).toHaveURL(/\/animals\/create/);
    await expect(page.locator('text=Add New Pet')).toBeVisible();

    // Заполнение формы
    const uniqueName = `Test Pet ${Date.now()}`;
    await page.fill('#name', uniqueName);

    // Выбор вида (Species)
    await page.getByText('Select species').click();
    await page.getByRole('option', { name: 'Собака' }).click();

    await page.fill('#breed', 'Test Breed');
    await page.fill('#age', '5');

    // Выбор пола (Sex)
    await page.getByText('Select sex').click();
    await page.locator('role=option[name="Male"]').click();

    // Image — предоставляем dummy URL, чтобы избежать 400 ошибки
    await page.fill('#image', 'https://example.com/test-image.jpg');

    // Включаем некоторые switches
    await page.getByLabel('Vaccinated').check();
    await page.getByLabel('Sterilized').check();
    await page.getByLabel('Healthy').check();
    await page.getByLabel('Available').check();
    await page.getByLabel('Good with Cats').check();
    await page.getByLabel('Good with Dogs').check();
    await page.getByLabel('Good with People').check();
    await page.getByLabel('Good with Kids').check();

    // Submit
    await page.click('button:has-text("Add Pet")');

    // Ожидание редиректа обратно в /admin
    await page.waitForURL(/\/admin/);
    // await expect(page.locator('text=Дэшборд')).toBeVisible();

    // Проверка, что новое животное появилось в списке (ищем по уникальному имени)
    // Переключаемся на таб "Управление животными" если нужно (по умолчанию dashboard, но после редиректа на admin)
    await page.click('text=Управление животными');
    await page.fill('input[placeholder="Найти животное..."]', uniqueName);
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 10000 });
  });
});