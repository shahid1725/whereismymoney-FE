import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/app-shell'
import { ProtectedRoute } from '../routes/protected-route'
import { LoadingSkeleton } from '../components/page-states'

const LoginPage = lazy(() => import('../features/auth/login-page').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('../features/auth/register-page').then((module) => ({ default: module.RegisterPage })))
const DashboardPage = lazy(() => import('../features/dashboard/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const TransactionsPage = lazy(() => import('../features/transactions/transactions-page').then((module) => ({ default: module.TransactionsPage })))
const TransactionFormPage = lazy(() => import('../features/transactions/transaction-form-page').then((module) => ({ default: module.TransactionFormPage })))
const AccountsPage = lazy(() => import('../features/accounts/accounts-page').then((module) => ({ default: module.AccountsPage })))
const CategoriesPage = lazy(() => import('../features/categories/categories-page').then((module) => ({ default: module.CategoriesPage })))
const BudgetsPage = lazy(() => import('../features/budgets/budgets-page').then((module) => ({ default: module.BudgetsPage })))
const SettingsPage = lazy(() => import('../features/settings/settings-page').then((module) => ({ default: module.SettingsPage })))
const ProfilePage = lazy(() => import('../features/profile/profile-page').then((module) => ({ default: module.ProfilePage })))

export function App() {
  return <BrowserRouter><Suspense fallback={<main className="mx-auto max-w-6xl p-6"><LoadingSkeleton rows={4} /></main>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<TransactionFormPage />} />
        <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Suspense></BrowserRouter>
}
