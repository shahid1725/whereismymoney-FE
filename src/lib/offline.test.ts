import { expect, it } from 'vitest'
import { assertOnline } from './offline'

it('blocks mutations while offline', () => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
  expect(() => assertOnline()).toThrow('OFFLINE_MUTATION')
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
})
