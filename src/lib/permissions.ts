import type { PermissionResource } from '@/types/permissions';

export const MODULE_PERMISSIONS: Record<string, PermissionResource[]> = {
  ai: ['files', 'photos', 'contacts', 'calendar'],
  chat: ['contacts', 'notifications'],
  family: ['family_data', 'photos', 'location'],
  finance: ['financial_data'],
  medai: ['health_data'],
  camera: ['photos'],
  'smart-home': ['location'],
  cloud: ['files', 'photos'],
  files: ['files'],
  media: ['photos', 'files'],
};

export function hasPermission(
  grantedPermissions: { moduleId: string; resource: PermissionResource; granted: boolean }[],
  moduleId: string,
  resource: PermissionResource
): boolean {
  const permission = grantedPermissions.find(
    (p) => p.moduleId === moduleId && p.resource === resource
  );
  return permission?.granted ?? false;
}

export function getRequiredPermissions(moduleId: string): PermissionResource[] {
  return MODULE_PERMISSIONS[moduleId] ?? [];
}
