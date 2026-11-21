import { useEffect, useState } from 'react'
import type { User } from '../../types/api'

export interface LocalProfile {
  name: string
  email: string
  image: string | null
}

const PROFILE_KEY = 'wimm.profile'
const PROFILE_EVENT = 'profile:updated'

export function getLocalProfile(user: User | null): LocalProfile {
  const fallback = { name: user?.name ?? '', email: user?.email ?? '', image: null }
  try {
    const stored = localStorage.getItem(`${PROFILE_KEY}.${user?.id ?? 'guest'}`)
    if (!stored) return fallback
    const parsed = JSON.parse(stored) as Partial<LocalProfile>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : fallback.name,
      email: typeof parsed.email === 'string' ? parsed.email : fallback.email,
      image: typeof parsed.image === 'string' ? parsed.image : null
    }
  } catch {
    return fallback
  }
}

export function saveLocalProfile(userId: number, profile: LocalProfile) {
  localStorage.setItem(`${PROFILE_KEY}.${userId}`, JSON.stringify(profile))
  window.dispatchEvent(new Event(PROFILE_EVENT))
}

export function useLocalProfile(user: User | null) {
  const [profile, setProfile] = useState(() => getLocalProfile(user))
  useEffect(() => {
    const update = () => setProfile(getLocalProfile(user))
    update()
    window.addEventListener(PROFILE_EVENT, update)
    return () => window.removeEventListener(PROFILE_EVENT, update)
  }, [user])
  return profile
}
