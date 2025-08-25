import { test, expect } from '@playwright/test';

test.describe('Appointment Edit Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to appointments page
    await page.goto('http://localhost:4200/appointments');

    // Wait for the page to load
    await page.waitForSelector('h3:has-text("Citas")');
  });

  test('should edit appointment from appointments list', async ({ page }) => {
    // Find the first appointment with edit button (future appointment)
    const editButton = page.locator('.btn.secondary').first();

    // Verify edit button exists and is visible
    await expect(editButton).toBeVisible();
    await expect(editButton).toHaveText('✏️');

    // Click the edit button
    await editButton.click();

    // Verify navigation to appointment detail page with edit parameter
    await expect(page).toHaveURL(/\/appointments\/.*\?edit=true/);

    // Verify we're on the appointment detail page
    await expect(page.locator('h1')).toContainText('davidjordana1234@gmail.com');

    // Verify edit form is shown
    await expect(page.locator('h2')).toContainText('Editar detalles de la cita');

    // Verify form fields are present
    await expect(page.locator('input[placeholder*="Nombre del cliente"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Hora"]')).toBeVisible();

    // Verify save and cancel buttons are present
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
  });

  test('should edit appointment from appointment detail page', async ({ page }) => {
    // First navigate to an appointment detail page
    await page.goto('http://localhost:4200/appointments/0280301a-e592-4105-a2af-9a2738609127');

    // Wait for the page to load
    await page.waitForSelector('h1');

    // Find and click the edit button in the detail page
    const editButton = page.locator('button:has-text("✏️")').first();
    await expect(editButton).toBeVisible();

    await editButton.click();

    // Verify edit form is shown
    await expect(page.locator('h2')).toContainText('Editar detalles de la cita');

    // Verify form fields are present and populated
    const clientNameInput = page.locator('input[placeholder*="Nombre del cliente"]');
    await expect(clientNameInput).toBeVisible();
    await expect(clientNameInput).toHaveValue('davidjordana1234@gmail.com');

    const timeInput = page.locator('input[placeholder*="Hora"]');
    await expect(timeInput).toBeVisible();
    await expect(timeInput).toHaveValue('11:30');
  });

  test('should not show edit button for past appointments', async ({ page }) => {
    // Scroll down to find past appointments
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Find a past appointment (should not have edit button)
    const pastAppointment = page.locator('.appointment-item').filter({ hasText: 'Pasado' }).first();

    // Verify past appointment doesn't have edit button
    await expect(pastAppointment.locator('.btn.secondary')).not.toBeVisible();

    // Verify it only has view and delete buttons
    await expect(pastAppointment.locator('.btn.primary')).toBeVisible(); // View button
    await expect(pastAppointment.locator('.btn.danger')).toBeVisible(); // Delete button
  });

  test('should not show edit button for today appointments', async ({ page }) => {
    // Scroll down to find today appointments
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Find a today appointment (should not have edit button)
    const todayAppointment = page.locator('.appointment-item').filter({ hasText: 'Hoy' }).first();

    // Verify today appointment doesn't have edit button
    await expect(todayAppointment.locator('.btn.secondary')).not.toBeVisible();

    // Verify it only has view and delete buttons
    await expect(todayAppointment.locator('.btn.primary')).toBeVisible(); // View button
    await expect(todayAppointment.locator('.btn.danger')).toBeVisible(); // Delete button
  });

  test('should show edit button only for future appointments', async ({ page }) => {
    // Find future appointments (should have edit button)
    const futureAppointments = page.locator('.appointment-item').filter({ hasText: 'Próximo' });

    // Verify at least one future appointment exists
    await expect(futureAppointments.first()).toBeVisible();

    // Verify future appointments have edit button
    const editButtons = futureAppointments.locator('.btn.secondary');
    await expect(editButtons.first()).toBeVisible();
    await expect(editButtons.first()).toHaveText('✏️');
  });
});
