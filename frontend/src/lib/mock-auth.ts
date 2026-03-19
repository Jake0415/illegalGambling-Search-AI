'use client'

// ---------------------------------------------------------------------------
// Key constants
// ---------------------------------------------------------------------------

const SETUP_COMPLETE_KEY = 'gambleguard_setup_complete'
const AUTH_TOKEN_KEY = 'gambleguard_auth_token'
const CURRENT_USER_KEY = 'gambleguard_current_user'
const REGISTERED_USERS_KEY = 'gambleguard_users'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MockUser {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  department: string
  phone: string
  password: string // stored in plain text for mock only
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/** Check if initial setup has been completed (localStorage 폴백) */
export function isSetupComplete(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true'
}

/** 백엔드 DB에서 슈퍼어드민 존재 여부 확인 (비동기) */
export async function checkSetupStatus(): Promise<boolean> {
  try {
    // Next.js API 라우트를 프록시로 사용 (자체 서명 인증서 문제 회피)
    const res = await fetch('/api/auth/setup-status', {
      cache: 'no-store',
    })
    if (res.ok) {
      const json = await res.json()
      const complete = json?.data?.isSetupComplete === true
      // localStorage도 동기화
      if (complete) {
        localStorage.setItem(SETUP_COMPLETE_KEY, 'true')
      }
      return complete
    }
  } catch {
    // API 연결 실패 시 localStorage 폴백
  }
  return isSetupComplete()
}

/** Complete setup and register the super admin user */
export function completeSetup(
  user: Omit<MockUser, 'id' | 'role'>,
): MockUser {
  const superAdmin: MockUser = {
    ...user,
    id: 'user-001',
    role: 'SUPER_ADMIN',
  }
  const users = [superAdmin]
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  localStorage.setItem(SETUP_COMPLETE_KEY, 'true')
  return superAdmin
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Login with email/password – returns null on failure */
export function mockLogin(
  email: string,
  password: string,
): MockUser | null {
  const users = getRegisteredUsers()
  const user = users.find(
    (u) => u.email === email && u.password === password,
  )
  if (!user) return null
  localStorage.setItem(AUTH_TOKEN_KEY, `mock-token-${user.id}`)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

/** Logout – clears auth token and current user */
export function mockLogout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

/** Get the currently logged-in user, or null */
export function getCurrentUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return null
  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/** Check if a user is currently authenticated (JWT 토큰 존재 확인) */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  return !!token
}

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

/** Get all registered users */
export function getRegisteredUsers(): MockUser[] {
  if (typeof window === 'undefined') return []
  const usersStr = localStorage.getItem(REGISTERED_USERS_KEY)
  if (!usersStr) return []
  try {
    return JSON.parse(usersStr)
  } catch {
    return []
  }
}

/** Add a new user (super admin only) */
export function addUser(user: Omit<MockUser, 'id'>): MockUser {
  const users = getRegisteredUsers()
  const newUser: MockUser = {
    ...user,
    id: `user-${String(users.length + 1).padStart(3, '0')}`,
  }
  users.push(newUser)
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  return newUser
}
