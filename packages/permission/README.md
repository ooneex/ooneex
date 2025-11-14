# @ooneex/permission

A flexible permission system for TypeScript/JavaScript applications, inspired by CanCan. This package provides both a modern permission-based authorization system and maintains backward compatibility with the legacy role-based system.

## Installation

```bash
npm install @ooneex/permission
# or
bun add @ooneex/permission
```

## Quick Start

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

### Core Functions

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

The package is written in TypeScript and provides full type safety:

```typescript
import type { ConditionFunction, PermissionRule } from '@ooneex/permission';

const condition: ConditionFunction<User, Post> = (user, post) => {
  return post.authorId === user.id;
};
```

## License

MIT
