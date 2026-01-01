import { UserRole } from '@prisma/client'

export function canEditPredictions(role: string | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canManageUsers(role: string | undefined): boolean {
  return role === 'admin'
}

export function canView(role: string | undefined): boolean {
  return !!role && ['admin', 'editor', 'viewer'].includes(role)
}

