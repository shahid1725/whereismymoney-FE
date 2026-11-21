import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/form-controls'
import { applyFieldErrors, getErrorMessage } from '../../lib/api-error'
import { authApi } from './auth-api'
import { useAuth } from './auth-context'
import { AuthLayout } from './auth-layout'

const schema = z.object({ name: z.string().trim().min(2, 'Enter your name'), email: z.email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters') })
type RegisterForm = z.infer<typeof schema>

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } })
  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />
  return <AuthLayout title="Create your account" description="Start building a clearer view of your finances.">
    <form className="grid gap-5" onSubmit={handleSubmit(async (values) => { setServerError(''); try { await authApi.register(values); navigate('/login', { replace: true, state: { registered: true } }) } catch (error) { if (!applyFieldErrors(error, setError)) setServerError(getErrorMessage(error)) } })}>
      {serverError && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{serverError}</div>}
      <Field label="Full name" error={errors.name?.message}><Input autoComplete="name" placeholder="John Doe" {...register('name')} /></Field>
      <Field label="Email address" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="john@example.com" {...register('email')} /></Field>
      <Field label="Password" error={errors.password?.message} hint="Use at least 8 characters."><Input type="password" autoComplete="new-password" {...register('password')} /></Field>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300" to="/login">Sign in</Link></p>
  </AuthLayout>
}
