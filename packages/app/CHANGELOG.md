# Changelog

## [1.8.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.8.2) - 2026-04-12

### Changed

- Bump package versions and fix description dashes — Franck ([78bf3699](https://github.com/ooneex/ooneex/commit/78bf3699))

## [1.8.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.8.0) - 2026-04-12

### Added

- Enforce permission check and return 403 on denial — Franck ([4b0e50bd](https://github.com/ooneex/ooneex/commit/4b0e50bd))
- Add default 300s TTL to route cache entries — Franck ([7b6cd01a](https://github.com/ooneex/ooneex/commit/7b6cd01a))
- Add response caching for HTTP and WebSocket routes — Franck ([ecb50d08](https://github.com/ooneex/ooneex/commit/ecb50d08))
- Pass route roles to HTTP context — Franck ([68db524e](https://github.com/ooneex/ooneex/commit/68db524e))

### Changed

- Remove generateRouteDoc and generateRouteType — Franck ([45846849](https://github.com/ooneex/ooneex/commit/45846849))
- Cache logger and role instances and reduce socket serialization — Franck ([2e70e31b](https://github.com/ooneex/ooneex/commit/2e70e31b))
- Pass context to permission setUserPermissions — Franck ([0dabb260](https://github.com/ooneex/ooneex/commit/0dabb260))

## [1.7.9](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.9) - 2026-04-09

### Changed

- Update container usage to remove alias references — Franck ([a5b08f22](https://github.com/ooneex/ooneex/commit/a5b08f22))

## [1.7.8](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.8) - 2026-04-09

### Changed

- Change workspace deps from workspace:* to workspace:^ — Franck ([7d1cfa51](https://github.com/ooneex/ooneex/commit/7d1cfa51))

## [1.7.7](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.7) - 2026-04-09

### Fixed

- Build proper route context for 404 handler and add version to logs — Franck ([479ebb8d](https://github.com/ooneex/ooneex/commit/479ebb8d))

## [1.7.6](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.6) - 2026-04-08

### Changed

- Bump version to 1.7.5 — Franck ([d27717d9](https://github.com/ooneex/ooneex/commit/d27717d9))

## [1.7.4](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.4) - 2026-04-08

### Changed

- Bump all package versions — Franck ([3444f39f](https://github.com/ooneex/ooneex/commit/3444f39f))

## [1.7.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.2) - 2026-04-07

### Changed

- Remove health check feature — Franck ([754fa342](https://github.com/ooneex/ooneex/commit/754fa342))

### Fixed

- Use getConstant for logger in HTTP context builder — Franck ([bb756c5b](https://github.com/ooneex/ooneex/commit/bb756c5b))

## [1.7.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.1) - 2026-04-07

### Changed

- Improve URL building and make routing config required — Franck ([98aff1f6](https://github.com/ooneex/ooneex/commit/98aff1f6))

## [1.7.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.7.0) - 2026-04-07

### Added

- Add health check URL logging — Franck ([dedd1a55](https://github.com/ooneex/ooneex/commit/dedd1a55))

## [1.6.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.6.1) - 2026-04-07

### Changed

- Add @ooneex/database and @ooneex/permission dependencies — Franck ([a637b596](https://github.com/ooneex/ooneex/commit/a637b596))

## [1.6.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.6.0) - 2026-04-07

### Added

- Add error keys to all exception and validation error responses — Franck ([48db6b65](https://github.com/ooneex/ooneex/commit/48db6b65))

### Changed

- @ooneex/app@1.5.0 — Franck ([1bc660e0](https://github.com/ooneex/ooneex/commit/1bc660e0))
- Add @types/bun to tsconfig types across all packages — Franck ([6faa8fe0](https://github.com/ooneex/ooneex/commit/6faa8fe0))
- Update module example with all required fields — Franck ([321d2de9](https://github.com/ooneex/ooneex/commit/321d2de9))
- Rename language to lang in context and request data — Franck ([be549cb4](https://github.com/ooneex/ooneex/commit/be549cb4))

## [1.5.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.5.0) - 2026-04-07

### Added

- Add error keys to all exception and validation error responses — Franck ([7990ee7b](https://github.com/ooneex/ooneex/commit/7990ee7b))

### Changed

- Add @types/bun to tsconfig types across all packages — Franck ([afd2c522](https://github.com/ooneex/ooneex/commit/afd2c522))
- Update module example with all required fields — Franck ([9577061e](https://github.com/ooneex/ooneex/commit/9577061e))
- Rename language to lang in context and request data — Franck ([ac1ff9ad](https://github.com/ooneex/ooneex/commit/ac1ff9ad))

## [1.4.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.4.0) - 2026-04-05

### Added

- Propagate exception key through route error handling — Franck ([e4658ea5](https://github.com/ooneex/ooneex/commit/e4658ea5))

### Changed

- Update postgres image to 18.3-alpine3.23 in docker template — Franck ([86c7fe24](https://github.com/ooneex/ooneex/commit/86c7fe24))
- Rename PostHog API key env var in example and docs — Franck ([8923b79a](https://github.com/ooneex/ooneex/commit/8923b79a))

## [1.3.8](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.8) - 2026-04-02

### Fixed

- Fix server URL protocol format and improve test coverage — Franck ([83bed600](https://github.com/ooneex/ooneex/commit/83bed600))

## [1.3.7](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.7) - 2026-04-02

### Fixed

- Register AppEnv in container if not already present — Franck ([b99fdc67](https://github.com/ooneex/ooneex/commit/b99fdc67))

## [1.3.6](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.6) - 2026-04-02

### Fixed

- Use getConstant for exception logger and fix env property name — Franck ([7c1193b2](https://github.com/ooneex/ooneex/commit/7c1193b2))

## [1.3.5](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.5) - 2026-04-01

### Changed

- Disable minification in bunup configs across all packages — Franck ([29f840e1](https://github.com/ooneex/ooneex/commit/29f840e1))

## [1.3.4](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.4) - 2026-04-01

### Fixed

- Guard container.add calls with has check to prevent duplicates — Franck ([f697729d](https://github.com/ooneex/ooneex/commit/f697729d))

## [1.3.3](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.3) - 2026-04-01

### Fixed

- Restore try-catch error handling in run method — Franck ([c83b1a43](https://github.com/ooneex/ooneex/commit/c83b1a43))

## [1.3.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.2) - 2026-04-01

### Changed

- Remove try-catch in run method and fix optional params access — Franck ([823cad61](https://github.com/ooneex/ooneex/commit/823cad61))
- Restructure config with routing and check nested objects — Franck ([25336779](https://github.com/ooneex/ooneex/commit/25336779))

## [1.3.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.1) - 2026-03-30

### Changed

- Rename healthCheckPath to healthcheckPath — Franck ([12ec59b7](https://github.com/ooneex/ooneex/commit/12ec59b7))

## [1.3.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.3.0) - 2026-03-30

### Added

- Add per-route permission handling in HTTP and socket route utils — Franck ([e1864c6b](https://github.com/ooneex/ooneex/commit/e1864c6b))
- Replace generateRouteDoc with healthCheckPath — Franck ([93a0e8f0](https://github.com/ooneex/ooneex/commit/93a0e8f0))

### Changed

- Remove permissions handling from App, HTTP and socket route utils — Franck ([09cb75ba](https://github.com/ooneex/ooneex/commit/09cb75ba))

## [1.2.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/app@1.2.2) - 2026-03-29

### Changed

- Remove Unreleased sections from changelogs — Franck ([971c3895](https://github.com/ooneex/ooneex/commit/971c3895))

## [1.2.1] - 2026-03-29

### Changed

- Replace truthy checks with optional chaining in checkAllowedUsers — Franck ([6a7aac07](https://github.com/ooneex/ooneex/commit/6a7aac07))
- Replace non-null assertions with optional chaining in tests — Franck ([5125257a](https://github.com/ooneex/ooneex/commit/5125257a))
- Format checkAllowedUsers function signature — Franck ([8db76c87](https://github.com/ooneex/ooneex/commit/8db76c87))
- Bump versions and fix em-dash encoding in descriptions — Franck ([70391f14](https://github.com/ooneex/ooneex/commit/70391f14))
