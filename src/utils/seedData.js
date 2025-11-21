// src/utils/seedData.js
import prisma from '@/lib/prisma';

export async function seedRoleData() {
  // --- Permissions Catalog (seed if not present) ---
  const permissionsData = [
    {
      code: 'PERM_MANAGE_USERS',
      title: 'Manage Users',
      category: 'User Management',
      type: 'CORE',
      route: '/admin/users',
      active: true,
    },
    {
      code: 'PERM_VIEW_REPORTS',
      title: 'View Reports',
      category: 'Reporting',
      type: 'CORE',
      route: '/admin/reports',
      active: true,
    },
    {
      code: 'PERM_BOOK_PASS',
      title: 'Book Pass',
      category: 'Pass',
      type: 'USER',
      route: '/booking/pass',
      active: true,
    },
    {
      code: 'PERM_MANAGE_PASSES',
      title: 'Manage Passes',
      category: 'Pass',
      type: 'ADMIN',
      route: '/admin/passes',
      active: true,
    }
    // ... add more as desired
  ];

  await prisma.permissionCatalog.createMany({
    data: permissionsData,
    skipDuplicates: true, // Skip permissions that already exist
  });

  // --- Roles (seed if not present) ---
  const rolesData = [
    { name: "ADMIN", description: "System Administrator", isDefault: false, type: "admin" },
    { name: "STAFF", description: "School or Bus Staff", isDefault: false, type: "staff" },
    { name: "STUDENT", description: "Student User", isDefault: true, type: "student" },
    { name: "OFFICER", description: "Officer/Checker", isDefault: false, type: "officer" },
    { name: "CONDUCTOR", description: "Conductor", isDefault: false, type: "conductor" },
  ];

  await prisma.role.createMany({
    data: rolesData,
    skipDuplicates: true, // Skip roles that already exist
  });

  // Fetch roles and permissions by their current state
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permissionCatalog.findMany();

  // --- RolePermission relations (insert if not present) ---
  const rolePermissionMap = {
    'ADMIN': ['PERM_MANAGE_USERS', 'PERM_VIEW_REPORTS', 'PERM_MANAGE_PASSES', 'PERM_BOOK_PASS'],
    'STAFF': ['PERM_VIEW_REPORTS', 'PERM_MANAGE_PASSES'],
    'STUDENT': ['PERM_BOOK_PASS'],
    'OFFICER': [],
    'CONDUCTOR': [],
  };

  const existingRolePermissions = await prisma.rolePermission.findMany();
  const existingRolePermissionKeys = new Set(
    existingRolePermissions.map(rp => `${rp.roleId}_${rp.permissionId}`)
  );

  const rolePermissionData = [];
  for (const role of roles) {
    const allowedCodes = rolePermissionMap[role.name] || [];
    const allowedPerms = permissions.filter(p => allowedCodes.includes(p.code));
    for (const perm of allowedPerms) {
      const key = `${role.id}_${perm.id}`;
      if (!existingRolePermissionKeys.has(key)) {
        rolePermissionData.push({
          roleId: role.id,
          permissionId: perm.id,
        });
      }
    }
  }
  if (rolePermissionData.length > 0) {
    await prisma.rolePermission.createMany({
      data: rolePermissionData,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Seeded Roles/Permissions/RolePermissions (without deleting existing data)`);
}
