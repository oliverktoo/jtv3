// Test authentication and role system
import { getUserRoles } from './client/src/lib/rbac/roles.js';

// Simulate the mock user from useAuth
const mockUser = {
  id: '1',
  name: 'Super Admin',
  email: 'admin@jamii.com',
  isSuperAdmin: true,
  roles: [] // Empty array as shown in useAuth.ts
};

console.log('Testing authentication system:');
console.log('Mock user:', mockUser);

try {
  const roles = getUserRoles(mockUser);
  console.log('getUserRoles result:', roles);
  console.log('Should include SYSTEM_ADMIN:', roles.includes('system_admin'));
} catch (error) {
  console.error('Error testing getUserRoles:', error.message);
}