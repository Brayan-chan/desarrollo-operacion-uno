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
})
