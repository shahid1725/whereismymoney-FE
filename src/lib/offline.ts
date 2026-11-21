export function assertOnline() {
  if (!navigator.onLine) throw new Error('OFFLINE_MUTATION')
}
