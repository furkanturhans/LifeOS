export type PermissionResource =
  | 'files'
  | 'photos'
  | 'family_data'
  | 'health_data'
  | 'financial_data'
  | 'location'
  | 'contacts'
  | 'calendar'
  | 'notifications';

export interface Permission {
  moduleId: string;
  resource: PermissionResource;
  granted: boolean;
  grantedAt?: string;
}

export interface ModulePermissionRequest {
  moduleId: string;
  resource: PermissionResource;
  reason: string;
}
