import { expect, test } from '@playwright/test'

test('loads the dashboard and changes a task status', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Vista general' })).toBeVisible()
  await expect(page.getByText('Cargando tu espacio de trabajo…')).toBeHidden()
  await page.getByRole('button', { name: /Mapa de contenidos/ }).click()
  await page.getByLabel('Estado').selectOption('Completada')
  await page.getByRole('button', { name: 'Cerrar tarea' }).click()
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: 'Progreso promedio' }).getByText('33%')).toBeVisible()

  await page.getByRole('button', { name: 'Agencia' }).click()
  await page.getByRole('button', { name: /Desarrollo de software/ }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Desarrollo de software' })).toBeVisible()
})

test('confirms local deletion and can undo it', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Mapa de contenidos/ }).click()
  await page.getByLabel('Estado').selectOption('Completada')
  await page.getByRole('button', { name: 'Cerrar tarea' }).click()
  await page.getByRole('button', { name: 'Agencia' }).click()
  await page.getByRole('button', { name: 'Borrar datos locales' }).click()
  await expect(page.getByRole('dialog', { name: '¿Borrar los datos locales?' })).toBeVisible()
  await page.getByRole('dialog', { name: '¿Borrar los datos locales?' }).getByRole('button', { name: 'Borrar datos' }).click()
  await expect(page.getByRole('article').filter({ hasText: 'Progreso promedio' }).getByText('17%')).toBeVisible()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByRole('article').filter({ hasText: 'Progreso promedio' }).getByText('33%')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: 'Progreso promedio' }).getByText('33%')).toBeVisible()
})
