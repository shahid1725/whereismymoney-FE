import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api-client'
import { accountsApi } from './accounts-api'

describe('accountsApi multipart upload', () => {
  it('uses FormData for account image creation', async () => {
    const file = new File(['image'], 'bank.png', { type: 'image/png' })
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 1, name: 'Main Bank', img: null } })
    await accountsApi.create({ name: 'Main Bank', img: file })
    const body = post.mock.calls[0]?.[1]
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('name')).toBe('Main Bank')
    expect((body as FormData).get('img')).toBe(file)
  })
})
