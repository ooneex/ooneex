---
name: class-to-interface
description: Convert TypeScript classes to interfaces using arrow function syntax. Use when converting a class to an interface, extracting an interface from a class, or when refactoring class methods to arrow function properties.
---

# Class to Interface Conversion

Convert a TypeScript class to an interface using arrow function syntax for all methods.

## Rules

1. **Convert class declaration to interface declaration**
   - Replace `class ClassName` with `interface IClassName`
   - Remove `implements`, `extends`, and access modifiers (`public`, `private`, `protected`)
   - Remove constructor

2. **Convert methods to arrow function properties**
   - Transform `methodName(params): ReturnType` to `methodName: (params) => ReturnType`
   - Remove method bodies (implementation)
   - Remove access modifiers from methods

3. **Handle fluent methods (methods returning `this`)**
   - Replace `this` return type with the interface name
   - Example: `setName(name: string): this` becomes `setName: (name: string) => IClassName`

4. **Keep only public members**
   - Only include `public` properties and methods in the interface
   - Omit `private` and `protected` members entirely
   - Remove access modifiers from the output
   - Remove property initializers

5. **If interface already exists**
   - Convert any traditional method signatures to arrow function syntax
   - Update `this` return types to use the interface name

## Examples

### Input: Class

```typescript
class UserService {
  private readonly name: string;
  public age: number;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public setAge(age: number): this {
    this.age = age;
    return this;
  }

  public async fetchUser(id: string): Promise<User> {
    return await api.getUser(id);
  }

  public validate(data: unknown): data is User {
    return typeof data === 'object';
  }
}
```

### Output: Interface

```typescript
interface IUserService {
  age: number;
  getName: () => string;
  setAge: (age: number) => IUserService;
  fetchUser: (id: string) => Promise<User>;
  validate: (data: unknown) => data is User;
}
```

### Input: Existing Interface with Traditional Methods

```typescript
interface ICache {
  get(key: string): unknown;
  set(key: string, value: unknown): this;
  delete(key: string): boolean;
}
```

### Output: Interface with Arrow Functions

```typescript
interface ICache {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => ICache;
  delete: (key: string) => boolean;
}
```

## Additional Considerations

- Preserve generic type parameters: `class Service<T>` becomes `interface IService<T>`
- Preserve JSDoc comments above methods and properties
- Handle overloaded methods by creating multiple arrow function signatures
- Static methods should be omitted (interfaces cannot have static members)
- Readonly modifiers on properties should be preserved: `readonly name: string`
