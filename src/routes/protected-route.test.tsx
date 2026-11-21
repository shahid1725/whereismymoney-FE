import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './protected-route'

const mockUseAuth = vi.fn()
vi.mock('../features/auth/auth-context', () => ({ useAuth: () => mockUseAuth() }))

beforeEach(() => mockUseAuth.mockReset())

it('redirects unauthenticated visitors to login', () => {
  mockUseAuth.mockReturnValue({ isRestoring: false, isAuthenticated: false })
  render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/login" element={<h1>Login</h1>} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<h1>Dashboard</h1>} /></Route></Routes></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

it('renders protected content for authenticated visitors', () => {
  mockUseAuth.mockReturnValue({ isRestoring: false, isAuthenticated: true })
  render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<h1>Dashboard</h1>} /></Route></Routes></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
})
