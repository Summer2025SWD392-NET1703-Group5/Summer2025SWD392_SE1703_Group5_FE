// Auth Components Export
export { ProtectedRoute } from '../ProtectedRoute';
export { default as GuestAllowedRoute } from './GuestAllowedRoute';
export { default as AdminRoute } from './AdminRoute';
export { default as AuthRequiredRoute } from './AuthRequiredRoute';
export { default as StaffRoute } from './StaffRoute';
export { default as RoleGuard } from './RoleGuard';
export { default as ManagerRoleGuard } from './ManagerRoleGuard';

// Re-export existing ProtectedRoute for backward compatibility
// The line below is removed to fix a build error with duplicate exports
// export { ProtectedRoute } from '../ProtectedRoute'; 