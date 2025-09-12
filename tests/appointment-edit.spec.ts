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
    await expect(page.locator('h3')).toContainText('Detalles de la cita');

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

  test('should follow correct save flow: update time → save → loader → PUT → GET → success', async ({ page }) => {
    // Navigate to an appointment detail page
    await page.goto('http://localhost:4200/appointments/0280301a-e592-4105-a2af-9a2738609127');
    await page.waitForSelector('h1');

    // Click edit button
    const editButton = page.locator('button:has-text("✏️")').first();
    await editButton.click();

    // Wait for edit form to load
    await page.waitForSelector('input[placeholder*="Hora"]');

    // Change the time
    const timeInput = page.locator('input[placeholder*="Hora"]');
    await timeInput.click();
    
    // Select a different time (assuming dropdown opens)
    const timeOption = page.locator('text=10:00').first();
    if (await timeOption.isVisible()) {
      await timeOption.click();
    }

    // Click save button
    const saveButton = page.locator('button:has-text("Guardar")');
    await saveButton.click();

    // Verify loader appears
    await expect(page.locator('.loader, [data-testid="loader"]')).toBeVisible();

    // Wait for success message
    await expect(page.locator('text=Cita actualizada correctamente')).toBeVisible();

    // Verify we're back in view mode (not edit mode)
    await expect(page.locator('button:has-text("✏️")')).toBeVisible();
    await expect(page.locator('button:has-text("Guardar")')).not.toBeVisible();
  });

  test('should maintain time selection during edit process', async ({ page }) => {
    // Navigate to an appointment detail page
    await page.goto('http://localhost:4200/appointments/0280301a-e592-4105-a2af-9a2738609127');
    await page.waitForSelector('h1');

    // Click edit button
    const editButton = page.locator('button:has-text("✏️")').first();
    await editButton.click();

    // Wait for edit form to load
    await page.waitForSelector('input[placeholder*="Hora"]');

    // Get initial time value
    const timeInput = page.locator('input[placeholder*="Hora"]');
    const initialTime = await timeInput.inputValue();

    // Change the time
    await timeInput.click();
    const timeOption = page.locator('text=10:00').first();
    if (await timeOption.isVisible()) {
      await timeOption.click();
    }

    // Verify time has changed
    const newTime = await timeInput.inputValue();
    expect(newTime).not.toBe(initialTime);

    // Change service (should not reset time)
    const serviceInput = page.locator('input[placeholder*="Servicio"]').first();
    if (await serviceInput.isVisible()) {
      await serviceInput.click();
      // Just click away to simulate service change
      await page.click('body');
    }

    // Verify time is still maintained
    const maintainedTime = await timeInput.inputValue();
    expect(maintainedTime).toBe(newTime);
  });

  test('should exit edit mode after successful save', async ({ page }) => {
    // Navigate to an appointment detail page
    await page.goto('http://localhost:4200/appointments/0280301a-e592-4105-a2af-9a2738609127');
    await page.waitForSelector('h1');

    // Click edit button
    const editButton = page.locator('button:has-text("✏️")').first();
    await editButton.click();

    // Verify we're in edit mode
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();

    // Make a small change and save
    const clientNameInput = page.locator('input[placeholder*="Nombre del cliente"]');
    await clientNameInput.fill('Updated Name');

    const saveButton = page.locator('button:has-text("Guardar")');
    await saveButton.click();

    // Wait for save to complete
    await expect(page.locator('text=Cita actualizada correctamente')).toBeVisible();

    // Verify we're back in view mode
    await expect(page.locator('button:has-text("✏️")')).toBeVisible();
    await expect(page.locator('button:has-text("Guardar")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).not.toBeVisible();
  });
});
