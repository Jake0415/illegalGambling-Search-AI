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

/** Check if initial setup has been completed */
export function isSetupComplete(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true'
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

/** Check if a user is currently authenticated */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
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
