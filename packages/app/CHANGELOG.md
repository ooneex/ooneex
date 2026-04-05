# Changelog

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
