import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState, ErrorState, LoadingSkeleton } from './page-states'

describe('async page states', () => {
  it('announces loading', () => { render(<LoadingSkeleton />); expect(screen.getByRole('status')).toHaveTextContent('Loading content') })
  it('shows useful empty content', () => { render(<EmptyState title="Nothing here" description="Add one to begin." />); expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument() })
  it('offers error recovery', () => { const retry = vi.fn(); render(<ErrorState message="Unavailable" onRetry={retry} />); screen.getByRole('button', { name: 'Try again' }).click(); expect(retry).toHaveBeenCalled() })
})
