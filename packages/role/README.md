# @ooneex/role

Role-based authorization types and utilities for defining user roles, hierarchies, and access levels in multi-tenant applications.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **40+ Predefined Roles** - Comprehensive set of roles from Guest to System

✅ **Role Hierarchy** - Hierarchical role system with inheritance

✅ **Level-Based Access** - Check permissions based on role levels

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Zero Dependencies** - Lightweight with no external runtime dependencies

✅ **Domain-Specific Roles** - Specialized roles for different business domains

✅ **Framework Integration** - Works seamlessly with Ooneex routing and controllers

## Installation

### Bun
```bash
bun add @ooneex/role
```

### pnpm
```bash
pnpm add @ooneex/role
```

### Yarn
```bash
yarn add @ooneex/role
```

### npm
```bash
npm install @ooneex/role
```

## Usage

### Basic Role Checking

```typescript
import { Role, ERole } from '@ooneex/role';

const role = new Role();

// Check if user has required role level
const userRole = ERole.MANAGER;
const requiredRole = ERole.USER;

if (role.hasRole(userRole, requiredRole)) {
  console.log('Access granted');
} else {
  console.log('Access denied');
}
```

### Getting Role Level

```typescript
import { Role, ERole } from '@ooneex/role';

const role = new Role();

// Get numeric level for a role
const adminLevel = role.getRoleLevel(ERole.ADMIN);
const userLevel = role.getRoleLevel(ERole.USER);

console.log(`Admin level: ${adminLevel}`);  // Higher number
console.log(`User level: ${userLevel}`);    // Lower number

// Admin has higher level, so they have more access
```

### Getting Inherited Roles

```typescript
import { Role, ERole } from '@ooneex/role';

const role = new Role();

// Get all roles a user inherits from their role
const managerRoles = role.getInheritedRoles(ERole.MANAGER);

console.log(managerRoles);
// Includes: BANNED, SUSPENDED, GUEST, TRIAL_USER, USER, MEMBER, 
// SUBSCRIBER, PREMIUM_USER, VIP_USER, CONTRIBUTOR, AUTHOR, etc.
// up to and including MANAGER
```

### Route Protection

```typescript
import { Route } from '@ooneex/routing';
import { ERole } from '@ooneex/role';
import type { IController, ContextType } from '@ooneex/controller';

@Route.http({
  name: 'admin.users.list',
  path: '/admin/users',
  method: 'GET',
  description: 'List all users (admin only)',
  roles: [ERole.ADMIN, ERole.SUPER_ADMIN]
})
class AdminUserListController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    // Only accessible to ADMIN and SUPER_ADMIN roles
    return context.response.json({
      users: await this.userService.findAll()
    });
  }
}
```

### Multiple Role Requirements

```typescript
import { Route } from '@ooneex/routing';
import { ERole } from '@ooneex/role';

@Route.http({
  name: 'api.content.publish',
  path: '/api/content/:id/publish',
  method: 'POST',
  description: 'Publish content',
  roles: [ERole.EDITOR, ERole.CONTENT_MANAGER, ERole.ADMIN]
})
class ContentPublishController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    // Accessible to EDITOR, CONTENT_MANAGER, or ADMIN
    const { id } = context.params;
    await this.contentService.publish(id);
    
    return context.response.json({ published: true });
  }
}
```

## API Reference

### Classes

#### `Role`

Main class for role-based access control operations.

**Constructor:**
```typescript
new Role()
```

**Methods:**

##### `getRoleLevel(role: ERole): number`

Gets the numeric level of a role in the hierarchy.

**Parameters:**
- `role` - The role to get the level for

**Returns:** Numeric level (higher = more permissions)

**Example:**
```typescript
const role = new Role();
const level = role.getRoleLevel(ERole.ADMIN);
console.log(level); // High number indicating admin privileges
```

##### `hasRole(userRole: ERole, requiredRole: ERole): boolean`

Checks if a user's role meets or exceeds the required role level.

**Parameters:**
- `userRole` - The user's current role
- `requiredRole` - The minimum required role

**Returns:** `true` if user has sufficient role level

**Example:**
```typescript
const role = new Role();

role.hasRole(ERole.ADMIN, ERole.USER);      // true - admin > user
role.hasRole(ERole.USER, ERole.ADMIN);      // false - user < admin
role.hasRole(ERole.MANAGER, ERole.MANAGER); // true - equal roles
```

##### `getInheritedRoles(role: ERole): ERole[]`

Gets all roles that a user inherits from their role level.

**Parameters:**
- `role` - The user's role

**Returns:** Array of all inherited roles (from lowest to the given role)

**Example:**
```typescript
const role = new Role();
const inherited = role.getInheritedRoles(ERole.EDITOR);
// Returns all roles from BANNED up to EDITOR
```

### Enums

#### `ERole`

Comprehensive enum of all available roles.

**User Levels:**
| Role | Value | Description |
|------|-------|-------------|
| `GUEST` | `ROLE_GUEST` | Unauthenticated visitor |
| `TRIAL_USER` | `ROLE_TRIAL_USER` | User on trial period |
| `USER` | `ROLE_USER` | Basic authenticated user |
| `MEMBER` | `ROLE_MEMBER` | Registered member |
| `SUBSCRIBER` | `ROLE_SUBSCRIBER` | Subscribed user |
| `PREMIUM_USER` | `ROLE_PREMIUM_USER` | Premium tier user |
| `VIP_USER` | `ROLE_VIP_USER` | VIP tier user |

**Content Roles:**
| Role | Value | Description |
|------|-------|-------------|
| `CONTRIBUTOR` | `ROLE_CONTRIBUTOR` | Can contribute content |
| `AUTHOR` | `ROLE_AUTHOR` | Can author content |
| `REVIEWER` | `ROLE_REVIEWER` | Can review content |
| `EDITOR` | `ROLE_EDITOR` | Can edit content |
| `CURATOR` | `ROLE_CURATOR` | Can curate content |

**Technical Roles:**
| Role | Value | Description |
|------|-------|-------------|
| `DEVELOPER` | `ROLE_DEVELOPER` | Software developer |
| `DESIGNER` | `ROLE_DESIGNER` | UI/UX designer |
| `TESTER` | `ROLE_TESTER` | QA tester |
| `TECHNICAL_LEAD` | `ROLE_TECHNICAL_LEAD` | Technical team lead |
| `DEVOPS` | `ROLE_DEVOPS` | DevOps engineer |

**Support & Analysis:**
| Role | Value | Description |
|------|-------|-------------|
| `SUPPORT_AGENT` | `ROLE_SUPPORT_AGENT` | Customer support |
| `ANALYST` | `ROLE_ANALYST` | Data analyst |
| `MODERATOR` | `ROLE_MODERATOR` | Content moderator |

**Management:**
| Role | Value | Description |
|------|-------|-------------|
| `SUPERVISOR` | `ROLE_SUPERVISOR` | Team supervisor |
| `TEAM_LEAD` | `ROLE_TEAM_LEAD` | Team leader |
| `MANAGER` | `ROLE_MANAGER` | Department manager |
| `DEPARTMENT_HEAD` | `ROLE_DEPARTMENT_HEAD` | Department head |
| `DIRECTOR` | `ROLE_DIRECTOR` | Company director |
| `OWNER` | `ROLE_OWNER` | Business owner |

**Domain Managers:**
| Role | Value | Description |
|------|-------|-------------|
| `CONTENT_MANAGER` | `ROLE_CONTENT_MANAGER` | Content management |
| `MARKETING_MANAGER` | `ROLE_MARKETING_MANAGER` | Marketing department |
| `SALES_MANAGER` | `ROLE_SALES_MANAGER` | Sales department |
| `PRODUCT_MANAGER` | `ROLE_PRODUCT_MANAGER` | Product management |
| `HR_MANAGER` | `ROLE_HR_MANAGER` | Human resources |
| `FINANCE_MANAGER` | `ROLE_FINANCE_MANAGER` | Finance department |

**Governance:**
| Role | Value | Description |
|------|-------|-------------|
| `COMPLIANCE_OFFICER` | `ROLE_COMPLIANCE_OFFICER` | Compliance oversight |
| `SECURITY_OFFICER` | `ROLE_SECURITY_OFFICER` | Security oversight |
| `AUDITOR` | `ROLE_AUDITOR` | System auditor |

**Administrative:**
| Role | Value | Description |
|------|-------|-------------|
| `ADMIN` | `ROLE_ADMIN` | Administrator |
| `SUPER_ADMIN` | `ROLE_SUPER_ADMIN` | Super administrator |
| `SYSTEM` | `ROLE_SYSTEM` | System-level access |

**Restricted:**
| Role | Value | Description |
|------|-------|-------------|
| `SUSPENDED` | `ROLE_SUSPENDED` | Temporarily suspended |
| `BANNED` | `ROLE_BANNED` | Permanently banned |

### Constants

#### `ROLE_HIERARCHY`

Array defining the order of roles from lowest to highest privilege.

```typescript
import { ROLE_HIERARCHY } from '@ooneex/role';

// Ordered from BANNED (lowest) to SYSTEM (highest)
console.log(ROLE_HIERARCHY);
```

### Types

#### `RoleType`

String literal type representing role values.

```typescript
type RoleType = `${ERole}`;
// "ROLE_GUEST" | "ROLE_USER" | "ROLE_ADMIN" | ...
```

#### `IRole`

Interface for role service implementations.

```typescript
interface IRole {
  getRoleLevel: (role: ERole) => number;
  hasRole: (userRole: ERole, requiredRole: ERole) => boolean;
  getInheritedRoles: (role: ERole) => ERole[];
}
```

#### `RoleClassType`

Type for role class constructors.

```typescript
type RoleClassType = new (...args: any[]) => IRole;
```

## Advanced Usage

### Custom Role Checking Service

```typescript
import { Role, ERole, type IRole } from '@ooneex/role';
import { container } from '@ooneex/container';

class CustomRoleService extends Role {
  public canAccessResource(userRole: ERole, resourceType: string): boolean {
    const roleLevel = this.getRoleLevel(userRole);
    
    switch (resourceType) {
      case 'public':
        return roleLevel >= this.getRoleLevel(ERole.GUEST);
      case 'members-only':
        return roleLevel >= this.getRoleLevel(ERole.MEMBER);
      case 'premium':
        return roleLevel >= this.getRoleLevel(ERole.PREMIUM_USER);
      case 'admin':
        return roleLevel >= this.getRoleLevel(ERole.ADMIN);
      default:
        return false;
    }
  }
}

container.add(CustomRoleService);
```

### Role-Based UI Rendering

```typescript
import { Role, ERole } from '@ooneex/role';

const role = new Role();
const userRole = ERole.EDITOR;

const menuItems = [
  { label: 'Dashboard', minRole: ERole.USER },
  { label: 'Content', minRole: ERole.CONTRIBUTOR },
  { label: 'Analytics', minRole: ERole.ANALYST },
  { label: 'Users', minRole: ERole.ADMIN },
  { label: 'Settings', minRole: ERole.SUPER_ADMIN },
];

const visibleItems = menuItems.filter(item => 
  role.hasRole(userRole, item.minRole)
);

console.log(visibleItems);
// Shows Dashboard, Content (user is EDITOR)
```

### Middleware with Role Validation

```typescript
import { decorator } from '@ooneex/middleware';
import { Role, ERole } from '@ooneex/role';
import type { IMiddleware, ContextType } from '@ooneex/middleware';

@decorator.middleware()
class RoleMiddleware implements IMiddleware {
  private readonly roleService = new Role();

  public async handle(context: ContextType): Promise<ContextType> {
    const user = context.user;
    
    if (!user) {
      context.response.exception('Unauthorized', { status: 401 });
      return context;
    }
    
    // Check if user is not banned or suspended
    if (user.role === ERole.BANNED || user.role === ERole.SUSPENDED) {
      context.response.exception('Account restricted', { status: 403 });
      return context;
    }
    
    return context;
  }
}
```

### Role Upgrade Logic

```typescript
import { Role, ERole } from '@ooneex/role';

class SubscriptionService {
  private readonly role = new Role();

  public getRoleForPlan(plan: string): ERole {
    switch (plan) {
      case 'free':
        return ERole.USER;
      case 'basic':
        return ERole.MEMBER;
      case 'premium':
        return ERole.PREMIUM_USER;
      case 'vip':
        return ERole.VIP_USER;
      default:
        return ERole.GUEST;
    }
  }

  public isUpgrade(currentRole: ERole, newRole: ERole): boolean {
    return this.role.getRoleLevel(newRole) > this.role.getRoleLevel(currentRole);
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun run test`
4. Build the project: `bun run build`

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

Made with ❤️ by the Ooneex team
