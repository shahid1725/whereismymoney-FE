import { expect, test } from '@playwright/test'

test('login through budget creation updates the dashboard', async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD for a disposable backend user.')
  await page.goto('/login')
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  await page.getByRole('link', { name: 'Accounts' }).click()
  await page.getByRole('button', { name: 'Add account' }).click()
  await page.getByLabel('Account name').fill(`E2E Account ${Date.now()}`)
  await page.getByRole('button', { name: 'Save account' }).click()
  await expect(page.getByText('Account added')).toBeVisible()

  await page.getByRole('link', { name: 'Categories' }).click()
  await page.getByRole('button', { name: 'Create category' }).click()
  await page.getByLabel('Name').fill(`E2E Expense ${Date.now()}`)
  await page.getByRole('button', { name: 'Save category' }).click()
  await expect(page.getByText('Category created')).toBeVisible()

  await page.getByRole('link', { name: 'Add transaction' }).first().click()
  await page.getByLabel('Amount').fill('100')
  await page.getByLabel('Description').fill('E2E test purchase')
  await page.getByLabel('Account').selectOption({ index: 1 })
  await page.getByLabel('Category').selectOption({ label: /E2E Expense/ })
  await page.getByRole('button', { name: 'Save transaction' }).click()
  await expect(page.getByText('Transaction added')).toBeVisible()

  await page.getByRole('link', { name: 'Budgets' }).click()
  await page.getByRole('button', { name: 'Create budget' }).click()
  await page.getByText('Category', { exact: true }).click()
  await page.getByLabel('Expense category').selectOption({ label: /E2E Expense/ })
  await page.getByLabel('Budget amount').fill('500')
  await page.getByRole('button', { name: 'Save budget' }).click()
  await expect(page.getByText('Budget created')).toBeVisible()

  await page.getByRole('link', { name: 'Overview' }).click()
  await expect(page.getByText('E2E test purchase')).toBeVisible()
  await expect(page.getByText('₹100.00')).toBeVisible()
})
