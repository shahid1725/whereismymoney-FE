import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/form-controls'
import { getErrorMessage } from '../../lib/api-error'
import { authApi } from './auth-api'
import { useAuth } from './auth-context'
import { AuthLayout } from './auth-layout'

const schema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(1, 'Password is required') })
type LoginForm = z.infer<typeof schema>

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })
  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  return <AuthLayout title="Welcome back" description="Sign in to see your latest money picture.">
    <form className="grid gap-5" onSubmit={handleSubmit(async (values) => { setServerError(''); try { const tokens = await authApi.login(values); await auth.setSession(tokens.access, tokens.refresh); navigate(destination, { replace: true }) } catch (error) { setServerError(getErrorMessage(error)) } })}>
      {serverError && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{serverError}</div>}
      <Field label="Email address" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} /></Field>
      <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register('password')} /></Field>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300" to="/register">Create an account</Link></p>
  </AuthLayout>
}
