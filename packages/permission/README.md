# @ooneex/permission

A flexible permission system for TypeScript/JavaScript applications, built on top of CASL with full type safety. This package provides both a modern permission-based authorization system with TypeScript support and maintains backward compatibility with the legacy role-based system.

## Installation

```bash
npm install @ooneex/permission
# or
bun add @ooneex/permission
```

## Quick Start

### Using the Type-Safe Permission Class

```typescript
import { Permission, EPermissionAction, type IUser } from '@ooneex/permission';
import { ERole } from '@ooneex/role';

// Create a permission instance
const permission = new Permission();

// Define a user
const user: IUser = {
  id: "user-123",
  email: "john@example.com",
  name: "John Doe",
  firstName: "John",
  lastName: "Doe",
  role: ERole.USER
};

// Set common permissions based on user role
permission
  .setCommonPermissions(user)
  .build();

// Check permissions with type safety
console.log(permission.can('read', 'UserEntity')); // true
console.log(permission.can('delete', 'UserEntity')); // false
console.log(permission.cannot('manage', 'SystemEntity')); // true

// Use type-safe helper methods with conditions
permission
  .allowUserEntity('update', { id: user.id })
  .forbidUserEntity('delete', { role: ERole.SUPER_ADMIN })
  .build();
```

### Legacy Quick Start

```typescript
import { allow, can, cannot, authorize } from '@ooneex/permission';

// Define some classes
class User {
  constructor(public id: number, public role: string = 'user') {}
}

class Post {
  constructor(public id: number, public authorId: number, public isPublished: boolean = false) {}
}

// Define permissions
allow(User, 'view', Post, { isPublished: true }); // Users can view published posts
allow(User, 'edit', Post, (user: User, post: Post) => post.authorId === user.id); // Users can edit their own posts

// Check permissions
const user = new User(1);
const post = new Post(1, 1, true);

console.log(can(user, 'view', post)); // true
console.log(can(user, 'edit', post)); // true
console.log(cannot(user, 'delete', post)); // true

// Throw error if permission denied
authorize(user, 'view', post); // OK
// authorize(user, 'delete', post); // Throws error
```

## API Reference

### Type-Safe Permission System

The modern Permission class provides full TypeScript support with CASL integration:

#### `Permission` Class

```typescript
import { Permission, EPermissionAction } from '@ooneex/permission';

const permission = new Permission();
```

#### Core Methods

- **`allow(action, subject, conditions?)`**: Grant permissions with type safety
- **`forbid(action, subject, conditions?)`**: Deny permissions with type safety
- **`build()`**: Build the permission rules (required before checking permissions)
- **`can(action, subject, field?)`**: Check if action is allowed
- **`cannot(action, subject, field?)`**: Check if action is denied
- **`canWithObject(action, object)`**: Check permissions against an actual object
- **`setCommonPermissions(user)`**: Set role-based permissions automatically

#### Type-Safe Helper Methods

The Permission class provides type-safe helper methods for each entity:

```typescript
// UserEntity helpers
permission.allowUserEntity('read', { id: 'user-123' });
permission.forbidUserEntity('delete', { role: ERole.ADMIN });

// AuthUserEntity helpers
permission.allowAuthUserEntity('update', { verified: true });
permission.forbidAuthUserEntity('create');

// SystemEntity helpers
permission.allowSystemEntity('read');
permission.forbidSystemEntity('manage');

// SuperAdminEntity helpers
permission.allowSuperAdminEntity('read', { id: 'admin-456' });
permission.forbidSuperAdminEntity('delete');
```

#### Available Actions

```typescript
import { EPermissionAction } from '@ooneex/permission';

// Use enum values for type safety
EPermissionAction.CREATE    // "create"
EPermissionAction.READ      // "read"  
EPermissionAction.UPDATE    // "update"
EPermissionAction.DELETE    // "delete"
EPermissionAction.MANAGE    // "manage" (all actions)
EPermissionAction.VIEW      // "view"
EPermissionAction.EDIT      // "edit"
// ... and many more
```

#### Supported Entities

- `"UserEntity"`: User data with fields like `id`, `role`, `public`
- `"AuthUserEntity"`: Authentication data with `id`, `role`, `public`, `verified`
- `"SystemEntity"`: System resources with `id`, `name`, `type`
- `"SuperAdminEntity"`: Super admin resources with `id`
- `"User"`: Generic user reference
- `"all"`: All entities

#### TypeScript Interfaces

```typescript
import type { 
  IUserEntity, 
  IAuthUserEntity, 
  ISystemEntity, 
  ISuperAdminEntity,
  AppSubjects,
  PermissionActionType
} from '@ooneex/permission';

// Type-safe conditions
const userConditions: MongoQuery<IUserEntity> = {
  id: "user-123",
  role: ERole.USER,
  public: true
};

permission.allowUserEntity('read', userConditions);
```

### Legacy API - Core Functions

#### `allow(model, action, target, condition?)`

Defines a permission rule.

- **model**: Class constructor that this rule applies to
- **action**: Action name(s) - string or array of strings. Use `'manage'` for all actions
- **target**: Target class, string, or `'all'` for all targets
- **condition**: Optional condition function or object

```typescript
// Simple permission
allow(User, 'view', Post);

// Multiple actions
allow(User, ['create', 'update', 'delete'], Post);

// All actions
allow(AdminUser, 'manage', Post);

// All targets
allow(AdminUser, 'manage', 'all');

// Object condition
allow(User, 'view', Post, { isPublished: true });

// Function condition
allow(User, 'edit', Post, (user: User, post: Post) => post.authorId === user.id);

// Complex condition with options
allow(User, 'update', User, (user: User, target: User, options?: any) => {
  if (user.role === 'admin') return true;
  return user.id === target.id && !options?.fields?.includes('role');
});
```

#### `can(instance, action, target, options?)`

Checks if an action is allowed.

```typescript
const user = new User(1);
const post = new Post(1, 1);

can(user, 'view', post); // boolean
can(user, 'edit', post, { fields: ['title'] }); // with options
```

#### `cannot(instance, action, target, options?)`

Inverse of `can()`.

```typescript
cannot(user, 'delete', post); // true if user cannot delete post
```

#### `authorize(instance, action, target, options?)`

Same as `can()` but throws an error if permission is denied.

```typescript
try {
  authorize(user, 'delete', post);
} catch (error) {
  console.log(error.message); // "Access denied: User cannot delete Post"
}
```

### Permission Class

You can also create your own permission instances:

```typescript
import { Permission } from '@ooneex/permission';

const permissions = new Permission();
permissions.allow(User, 'view', Post);
permissions.can(user, 'view', post);
permissions.clear(); // Remove all rules
```

### Permission Actions Constants

Predefined action constants for common operations:

```typescript
import { PERMISSION_ACTIONS } from '@ooneex/permission';

allow(User, PERMISSION_ACTIONS.VIEW, Post);
allow(User, PERMISSION_ACTIONS.CREATE, Post);
allow(User, PERMISSION_ACTIONS.UPDATE, Post);
allow(User, PERMISSION_ACTIONS.DELETE, Post);
allow(AdminUser, PERMISSION_ACTIONS.MANAGE, 'all');

// Available constants:
// CREATE, READ, UPDATE, DELETE, MANAGE, VIEW, EDIT, 
// PUBLISH, ARCHIVE, APPROVE, REJECT
```

## Advanced Usage

### Conditional Permissions

#### Object Conditions

Object conditions check if the target object has matching properties:

```typescript
// Users can view public posts
allow(User, 'view', Post, { isPublic: true });

// Users can view published and public posts
allow(User, 'view', Post, { isPublished: true, isPublic: true });
```

#### Function Conditions

Function conditions provide maximum flexibility:

```typescript
// Users can edit their own posts
allow(User, 'edit', Post, (user: User, post: Post) => {
  return post.authorId === user.id;
});

// Users can update their profile but not change role
allow(User, 'update', User, (user: User, target: User, options?: any) => {
  // Admin can update anyone
  if (user.role === 'admin') return true;
  
  // Users can only update themselves
  if (user.id !== target.id) return false;
  
  // Users cannot change their role
  if (options?.fields?.includes('role')) return false;
  
  return true;
});
```

### Multiple Rules

You can define multiple rules that work together. If any rule matches, permission is granted:

```typescript
// Users can view posts if they are public OR if they are the author
allow(User, 'view', Post, { isPublic: true });
allow(User, 'view', Post, (user: User, post: Post) => post.authorId === user.id);

const user = new User(1);
const publicPost = new Post(1, 2, false, true); // Not author but public
const privatePost = new Post(2, 1, false, false); // Author but private

can(user, 'view', publicPost); // true (public)
can(user, 'view', privatePost); // true (author)
```

### Inheritance

Permission rules respect class inheritance:

```typescript
class User {
  constructor(public id: number) {}
}

class AdminUser extends User {
  constructor(id: number) {
    super(id);
  }
}

allow(User, 'view', Post);

const admin = new AdminUser(1);
can(admin, 'view', post); // true - AdminUser inherits from User
```

### String Targets

You can use strings as targets for abstract permissions:

```typescript
allow(User, 'view', 'dashboard');
allow(AdminUser, 'view', 'admin_panel');

can(user, 'view', 'dashboard'); // true
can(user, 'view', 'admin_panel'); // false
can(admin, 'view', 'admin_panel'); // true
```

## Real-World Examples

### Type-Safe Blog System

```typescript
import { Permission, EPermissionAction } from '@ooneex/permission';
import { ERole } from '@ooneex/role';
import type { IUser } from '@ooneex/user';

const permission = new Permission();

// Admin user
const admin: IUser = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin User",
  firstName: "Admin",
  lastName: "User",
  role: ERole.ADMIN
};

// Regular user  
const user: IUser = {
  id: "user-1", 
  email: "user@example.com",
  name: "Regular User",
  firstName: "Regular",
  lastName: "User", 
  role: ERole.USER
};

// Set permissions based on roles
permission.setCommonPermissions(admin).build();

// Admin can manage everything except system entities
console.log(permission.can('manage', 'all')); // true
console.log(permission.can('manage', 'SystemEntity')); // false

// Reset and set user permissions
const userPermission = new Permission();
userPermission.setCommonPermissions(user).build();

// User can only access their own data
console.log(userPermission.can('read', 'UserEntity')); // true
console.log(userPermission.can('delete', 'UserEntity')); // false

// Custom business logic
const customPermission = new Permission();

customPermission
  .allowUserEntity(['create', 'read'], { public: true })
  .allowUserEntity('update', { id: user.id })
  .forbidUserEntity('delete') // No deletes allowed
  .allowAuthUserEntity('read', { verified: true })
  .build();

// Check custom permissions
console.log(customPermission.can('create', 'UserEntity')); // true
console.log(customPermission.can('delete', 'UserEntity')); // false
```

### Legacy Blog System

### Blog System

```typescript
class User {
  constructor(public id: number, public role: string = 'user') {}
}

class AdminUser extends User {
  constructor(id: number) {
    super(id, 'admin');
  }
}

class Post {
  constructor(
    public id: number,
    public authorId: number,
    public isPublished: boolean = false,
    public isPublic: boolean = true
  ) {}
}

// Basic blog permissions
allow(User, 'view', Post, { isPublished: true }); // View published posts
allow(User, 'create', Post); // Create new posts
allow(User, ['edit', 'delete'], Post, (user: User, post: Post) => post.authorId === user.id); // Edit own posts
allow(AdminUser, 'manage', 'all'); // Admin can do everything

const user = new User(1);
const admin = new AdminUser(2);
const userPost = new Post(1, 1, true);
const otherPost = new Post(2, 3, true);

can(user, 'view', userPost); // true
can(user, 'edit', userPost); // true
can(user, 'edit', otherPost); // false
can(admin, 'delete', otherPost); // true
```

### User Management

```typescript
// Users can view and edit their own profile
allow(User, ['view', 'edit'], User, (viewer: User, target: User) => viewer.id === target.id);

// Users cannot change their own role
allow(User, 'edit', User, (user: User, target: User, options?: any) => {
  return user.id === target.id && !options?.fields?.includes('role');
});

// Admins can manage all users
allow(AdminUser, 'manage', User);

const user1 = new User(1);
const user2 = new User(2);
const admin = new AdminUser(3);

can(user1, 'view', user1); // true
can(user1, 'edit', user1, { fields: ['name'] }); // true
can(user1, 'edit', user1, { fields: ['role'] }); // false
can(user1, 'edit', user2); // false
can(admin, 'edit', user1, { fields: ['role'] }); // true
```

## Legacy Role System

The package maintains backward compatibility with the previous role-based system:

```typescript
import { Role, ERole } from '@ooneex/permission';

const role = new Role();

role.hasRole(ERole.ADMIN, ERole.USER); // true
role.getRoleLevel(ERole.ADMIN); // 6
role.getInheritedRoles(ERole.ADMIN); // [GUEST, USER, PREMIUM_USER, MODERATOR, EDITOR, MANAGER, ADMIN]
```

## Migration Guide

### From Role-Based to Permission-Based

**Before (Role-based):**
```typescript
if (role.hasRole(user.role, ERole.EDITOR)) {
  // User can edit
}
```

**After (Permission-based):**
```typescript
allow(User, 'edit', Post, (user: User, post: Post) => {
  return user.role === 'editor' || post.authorId === user.id;
});

if (can(user, 'edit', post)) {
  // User can edit
}
```

### Benefits of the New System

1. **More Granular**: Control specific actions on specific resources
2. **Flexible Conditions**: Use functions for complex business logic
3. **Better Testability**: Easy to test specific permission scenarios
4. **Resource-Aware**: Permissions can depend on the actual resource being accessed
5. **Composable**: Multiple rules can work together

## TypeScript Support

The package is written in TypeScript and provides full type safety with CASL integration:

### Type-Safe Permissions

```typescript
import type { 
  PermissionActionType, 
  AppSubjects, 
  IUserEntity,
  MongoQuery 
} from '@ooneex/permission';

// Type-safe action
const action: PermissionActionType = 'read';

// Type-safe subject
const subject: AppSubjects = 'UserEntity';

// Type-safe conditions with IntelliSense
const conditions: MongoQuery<IUserEntity> = {
  id: 'user-123',
  role: ERole.USER,
  public: true
};

const permission = new Permission();
permission.allowUserEntity(action, conditions);
```

### Entity Type Definitions

```typescript
// All entity interfaces are exported for custom use
import type { 
  IUserEntity,
  IAuthUserEntity, 
  ISystemEntity,
  ISuperAdminEntity
} from '@ooneex/permission';

// Custom function with type safety
function checkUserAccess(user: IUserEntity, target: IUserEntity): boolean {
  const permission = new Permission();
  permission.allowUserEntity('read', { id: target.id });
  permission.build();
  
  return permission.canWithObject('read', { 
    id: user.id,
    role: user.role,
    // ... other user properties
  });
}
```

### Legacy Type Support

```typescript
import type { ConditionFunction, PermissionRule } from '@ooneex/permission';

const condition: ConditionFunction<User, Post> = (user, post) => {
  return post.authorId === user.id;
};
```

## License

MIT
