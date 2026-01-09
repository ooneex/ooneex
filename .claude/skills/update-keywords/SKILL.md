---
name: update-keywords
description: Update keywords in package.json for @ooneex packages. Analyzes the package name, description, and source code to generate relevant keywords for npm discoverability.
---

# Update Keywords

Automatically update the `keywords` field in package.json files for @ooneex packages based on package analysis.

## Workflow

1. **Identify target package(s)**
   - If a specific package is provided, update that package
   - If no package specified, ask which package to update or update all

2. **Analyze package**
   - Read package.json for name and description
   - Scan source files for key functionality
   - Identify domain-specific terms

3. **Generate keywords**
   - Always include base keywords
   - Add package-specific keywords based on analysis
   - Ensure keywords are relevant for npm search

4. **Update package.json**
   - Add or replace the keywords array
   - Preserve all other fields

## Base Keywords

Every @ooneex package MUST include these base keywords:

```json
["ooneex", "typescript", "bun"]
```

## Keyword Generation Rules

### From Package Name

Extract meaningful terms from the package name:

| Package Name | Generated Keywords |
|-------------|-------------------|
| `@ooneex/cache` | `cache`, `caching` |
| `@ooneex/http-request` | `http`, `request`, `http-request` |
| `@ooneex/database` | `database`, `db` |
| `@ooneex/rate-limit` | `rate-limit`, `rate-limiting`, `throttle` |

### From Package Description

Extract key terms from the description:

| Description Contains | Add Keywords |
|---------------------|-------------|
| "dependency injection" | `di`, `dependency-injection`, `ioc` |
| "Redis" | `redis` |
| "file" or "filesystem" | `filesystem`, `fs` |
| "decorator" | `decorator`, `decorators` |
| "HTTP" | `http` |
| "REST" or "API" | `api`, `rest` |
| "authentication" or "auth" | `auth`, `authentication` |
| "validation" | `validation`, `validator` |
| "ORM" or "TypeORM" | `orm`, `typeorm` |

### Domain-Specific Keywords

Based on package functionality:

| Package Domain | Keywords |
|---------------|----------|
| HTTP/Web | `http`, `web`, `server`, `client` |
| Database | `database`, `db`, `orm`, `query` |
| Security | `security`, `auth`, `jwt`, `encryption` |
| Caching | `cache`, `caching`, `memory`, `storage` |
| Messaging | `queue`, `pubsub`, `messaging`, `events` |
| Validation | `validation`, `schema`, `validator` |
| Logging | `logging`, `logger`, `logs` |
| File System | `filesystem`, `fs`, `file`, `storage` |
| Utilities | `utilities`, `utils`, `helpers` |

## Package-Specific Keyword Mappings

Use these predefined mappings for known packages:

```
ai: ai, artificial-intelligence, llm, machine-learning
analytics: analytics, tracking, metrics, statistics
app: application, framework, web-app
app-env: environment, env, config, configuration
auth: authentication, auth, login, security
book: book, ebook, publishing
cache: cache, caching, memory, storage, redis
category: category, categories, taxonomy, classification
cli: cli, command-line, terminal, console
color: color, colors, palette, css
container: container, di, dependency-injection, ioc, inversify
controller: controller, mvc, routing, http
country: country, countries, locale, i18n
cron: cron, scheduler, job, task, scheduling
currencies: currency, currencies, money, finance
database: database, db, sql, query
education: education, learning, courses, training
entity: entity, model, domain, ddd
exception: exception, error, error-handling
fetcher: fetcher, http-client, fetch, api-client
folder: folder, directory, filesystem
fs: filesystem, fs, file, io
gamification: gamification, game, achievements, rewards
html: html, dom, markup, template
http-header: http, headers, http-header
http-mimes: mime, mime-type, content-type, http
http-request: http, request, http-request, web
http-request-file: http, file-upload, multipart, form-data
http-response: http, response, http-response, web
http-status: http, status-code, http-status
image: image, images, picture, graphics
jwt: jwt, json-web-token, authentication, token
logger: logger, logging, logs, debug
mailer: mailer, email, smtp, mail
middleware: middleware, http, pipeline, handler
migrations: migrations, database, schema, versioning
module: module, modular, plugin
notification: notification, notifications, alerts, push
payment: payment, payments, billing, stripe
pdf: pdf, document, generator
permission: permission, permissions, authorization, rbac
pub-sub: pubsub, pub-sub, messaging, events
queue: queue, job-queue, background-jobs, worker
rate-limit: rate-limit, rate-limiting, throttle, api
react: react, reactjs, frontend, ui
repository: repository, data-access, dao, pattern
role: role, roles, rbac, authorization
routing: routing, router, routes, http
seeds: seeds, seeding, fixtures, database
service: service, services, business-logic, layer
socket: socket, websocket, realtime, ws
status: status, state, lifecycle
storage: storage, file-storage, blob, s3
tag: tag, tags, tagging, taxonomy
translation: translation, i18n, localization, l10n
typeorm: typeorm, orm, database, sql
types: types, typescript, typings, definitions
url: url, uri, routing, path
user: user, users, account, profile
utils: utils, utilities, helpers, tools
validation: validation, validator, schema, constraints
video: video, media, streaming, player
youtube: youtube, video, embed, api
```

## Algorithm

```
1. Read package.json
2. Extract package name (without @ooneex/ prefix)
3. Initialize keywords = ["ooneex", "typescript", "bun"]
4. Look up package name in predefined mappings
5. If found, add all mapped keywords
6. If not found:
   a. Add package name as keyword
   b. Parse description for domain terms
   c. Scan src/ files for additional context
7. Deduplicate keywords
8. Sort keywords alphabetically (except base keywords first)
9. Update package.json with new keywords array
```

## Output Format

Keywords should be formatted in package.json as:

```json
{
  "name": "@ooneex/cache",
  "description": "...",
  "version": "...",
  "keywords": [
    "bun",
    "cache",
    "caching",
    "memory",
    "ooneex",
    "redis",
    "storage",
    "typescript"
  ],
  ...
}
```

**Keyword ordering:**
- Sort alphabetically for consistency
- This makes diffs cleaner and easier to review

## Examples

### Example 1: Cache Package

Input `package.json`:
```json
{
  "name": "@ooneex/cache",
  "description": "A flexible caching library with support for filesystem and Redis backends"
}
```

Output keywords:
```json
["bun", "cache", "caching", "memory", "ooneex", "redis", "storage", "typescript"]
```

### Example 2: Container Package

Input `package.json`:
```json
{
  "name": "@ooneex/container",
  "description": "Lightweight dependency injection container built on Inversify"
}
```

Output keywords:
```json
["bun", "container", "dependency-injection", "di", "inversify", "ioc", "ooneex", "typescript"]
```

### Example 3: HTTP Request Package

Input `package.json`:
```json
{
  "name": "@ooneex/http-request",
  "description": "HTTP request handling with body parsing and validation"
}
```

Output keywords:
```json
["bun", "http", "http-request", "ooneex", "request", "typescript", "web"]
```

## Step-by-Step Process

1. **Read the package.json** of the target package
2. **Extract the package name** without the `@ooneex/` prefix
3. **Look up predefined keywords** from the mapping table
4. **Combine with base keywords** (`ooneex`, `typescript`, `bun`)
5. **Sort alphabetically** and deduplicate
6. **Update package.json** with the keywords field
7. **Report the changes**

## Verification

After updating, verify:
- Keywords array is present and non-empty
- Base keywords are included
- Keywords are relevant to the package
- Keywords are sorted alphabetically
- No duplicate keywords

## Batch Update

When updating all packages:

```
For each package in packages/:
  1. Read package.json
  2. Generate keywords
  3. Update package.json
  4. Track changes

Report summary:
  - Packages updated: X
  - Packages unchanged: Y
  - Total keywords added: Z
```

## Output Report

After updating, report:

```
Updated keywords for @ooneex/<package>:

Keywords (X total):
  ooneex, typescript, bun, cache, caching, memory, redis, storage

File: packages/<package>/package.json
```

For batch updates:

```
Updated keywords for X packages:

@ooneex/cache: 8 keywords
@ooneex/container: 8 keywords
@ooneex/database: 7 keywords
...

Total: X packages updated
```
