# Changelog

## [1.13.3](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.13.3) - 2026-04-07

### Changed

- Bump version to 1.13.2 and add index tests — Franck ([754de41b](https://github.com/ooneex/ooneex/commit/754de41b))
- Import commands module in CLI entry point — Franck ([0d4abb0a](https://github.com/ooneex/ooneex/commit/0d4abb0a))

## [1.13.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.13.1) - 2026-04-07

### Changed

- Add @ooneex/command to external dependencies in bunup config — Franck ([ee7413fb](https://github.com/ooneex/ooneex/commit/ee7413fb))

## [1.13.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.13.0) - 2026-04-07

### Added

- Add make:command generator, export decorators/types, and fix completions — Franck ([a614e55a](https://github.com/ooneex/ooneex/commit/a614e55a))
- Add MakeCommandCommand and refactor CLI entry point — Franck ([537c7d53](https://github.com/ooneex/ooneex/commit/537c7d53))
- Add order/orderBy support to repository templates and fix status seed names — Franck ([dc794c64](https://github.com/ooneex/ooneex/commit/dc794c64))
- Add YouTube transcript API key to env template — Franck ([9636c260](https://github.com/ooneex/ooneex/commit/9636c260))

### Changed

- Update MakeMigration and MakeSeed commands and skill templates — Franck ([304c5eb3](https://github.com/ooneex/ooneex/commit/304c5eb3))
- Use commandCreate from @ooneex/command in MakeCommandCommand — Franck ([1d753e09](https://github.com/ooneex/ooneex/commit/1d753e09))
- Extract command module into separate @ooneex/command package — Franck ([aa3788d3](https://github.com/ooneex/ooneex/commit/aa3788d3))
- @ooneex/cli@1.12.0 — Franck ([794ac6e1](https://github.com/ooneex/ooneex/commit/794ac6e1))
- Apply coding conventions to MakeDockerCommand — Franck ([4a07780a](https://github.com/ooneex/ooneex/commit/4a07780a))
- Move dev script to docker command and remove @nx/js from app template — Franck ([c89b4f92](https://github.com/ooneex/ooneex/commit/c89b4f92))
- Add @types/bun to tsconfig types across all packages — Franck ([6faa8fe0](https://github.com/ooneex/ooneex/commit/6faa8fe0))
- Rename cron dir to crons, use colon-separated command names, and update paths — Franck ([15312860](https://github.com/ooneex/ooneex/commit/15312860))
- Move docker-compose to modules/app and remove permissions from templates — Franck ([18a75d3d](https://github.com/ooneex/ooneex/commit/18a75d3d))
- Format MakeModuleCommand destructuring — Franck ([6edf22a9](https://github.com/ooneex/ooneex/commit/6edf22a9))
- Add YouTube env section test — Franck ([369cbbd7](https://github.com/ooneex/ooneex/commit/369cbbd7))

## [1.12.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.12.0) - 2026-04-07

### Added

- Add make:command generator, export decorators/types, and fix completions — Franck ([54d433f6](https://github.com/ooneex/ooneex/commit/54d433f6))
- Add MakeCommandCommand and refactor CLI entry point — Franck ([80f6cb69](https://github.com/ooneex/ooneex/commit/80f6cb69))
- Add order/orderBy support to repository templates and fix status seed names — Franck ([7df2d062](https://github.com/ooneex/ooneex/commit/7df2d062))
- Add YouTube transcript API key to env template — Franck ([dea77e87](https://github.com/ooneex/ooneex/commit/dea77e87))

### Changed

- Apply coding conventions to MakeDockerCommand — Franck ([af5885e2](https://github.com/ooneex/ooneex/commit/af5885e2))
- Move dev script to docker command and remove @nx/js from app template — Franck ([0f3a066e](https://github.com/ooneex/ooneex/commit/0f3a066e))
- Add @types/bun to tsconfig types across all packages — Franck ([afd2c522](https://github.com/ooneex/ooneex/commit/afd2c522))
- Rename cron dir to crons, use colon-separated command names, and update paths — Franck ([c31c16f0](https://github.com/ooneex/ooneex/commit/c31c16f0))
- Move docker-compose to modules/app and remove permissions from templates — Franck ([aecc6666](https://github.com/ooneex/ooneex/commit/aecc6666))
- Format MakeModuleCommand destructuring — Franck ([d9ec6504](https://github.com/ooneex/ooneex/commit/d9ec6504))
- Add YouTube env section test — Franck ([0691d20d](https://github.com/ooneex/ooneex/commit/0691d20d))

## [1.11.3](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.11.3) - 2026-04-05

### Changed

- Simplify bunfig.toml template to test config only — Franck ([66b749db](https://github.com/ooneex/ooneex/commit/66b749db))
- Update postgres image to 18.3-alpine3.23 in docker template — Franck ([86c7fe24](https://github.com/ooneex/ooneex/commit/86c7fe24))
- Add exception key parameter across all packages — Franck ([b7c45c0c](https://github.com/ooneex/ooneex/commit/b7c45c0c))
- Use UpstashRedisRateLimiter in app template — Franck ([2ad5cfa7](https://github.com/ooneex/ooneex/commit/2ad5cfa7))
- Add Upstash Redis rate limit env vars to app template — Franck ([ac13f6e4](https://github.com/ooneex/ooneex/commit/ac13f6e4))
- Use UpstashRedisCache in app template — Franck ([c40eb596](https://github.com/ooneex/ooneex/commit/c40eb596))
- Update env template with ANALYTICS_POSTHOG_PROJECT_TOKEN — Franck ([8a0532c5](https://github.com/ooneex/ooneex/commit/8a0532c5))
- Update templates to use BetterstackExceptionLogger — Franck ([d5dfa6ae](https://github.com/ooneex/ooneex/commit/d5dfa6ae))
- Update env template vars and default confirm for release push — Franck ([48c367ff](https://github.com/ooneex/ooneex/commit/48c367ff))

## [1.11.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.11.2) - 2026-04-01

### Changed

- Fix import ordering and update resource command tests — Franck ([eba308a3](https://github.com/ooneex/ooneex/commit/eba308a3))
- Disable minification in bunup configs across all packages — Franck ([29f840e1](https://github.com/ooneex/ooneex/commit/29f840e1))

## [1.11.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.11.1) - 2026-04-01

### Fixed

- Use @module/app filter in package.json template scripts — Franck ([9e17a9a3](https://github.com/ooneex/ooneex/commit/9e17a9a3))

## [1.11.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.11.0) - 2026-04-01

### Added

- Add react and react-dom to app scaffold dependencies — Franck ([4c96aab4](https://github.com/ooneex/ooneex/commit/4c96aab4))
- Add resource generation commands for all resource types — Franck ([e073b459](https://github.com/ooneex/ooneex/commit/e073b459))

### Changed

- Update app template to use new routing and check config structure — Franck ([f7bd2041](https://github.com/ooneex/ooneex/commit/f7bd2041))
- Remove generics from service templates and add bin to tsconfig — Franck ([cd67dc62](https://github.com/ooneex/ooneex/commit/cd67dc62))

## [1.10.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.10.2) - 2026-04-01

### Changed

- Skip dependency install if already present in package.json — Franck ([b81b6270](https://github.com/ooneex/ooneex/commit/b81b6270))
- Update service template and controller response types — Franck ([f4a7ec21](https://github.com/ooneex/ooneex/commit/f4a7ec21))

### Fixed

- Rename query to queries in list controller templates — Franck ([87e46845](https://github.com/ooneex/ooneex/commit/87e46845))

## [1.10.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.10.1) - 2026-04-01

### Changed

- Simplify controller response types to use entity references — Franck ([0916e5bd](https://github.com/ooneex/ooneex/commit/0916e5bd))
- Update resource templates and add module creation to book command — Franck ([a368a00b](https://github.com/ooneex/ooneex/commit/a368a00b))

## [1.10.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.10.0) - 2026-04-01

### Added

- Register book resource command and update completions — Franck ([41b3db9f](https://github.com/ooneex/ooneex/commit/41b3db9f))

## [1.9.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.9.0) - 2026-04-01

### Added

- Add book resource generation command — Franck ([2d62af22](https://github.com/ooneex/ooneex/commit/2d62af22))
- Add seed resource templates for color and status — Franck ([1d16e4c8](https://github.com/ooneex/ooneex/commit/1d16e4c8))
- Add color resource templates — Franck ([43476767](https://github.com/ooneex/ooneex/commit/43476767))
- Add video resource templates — Franck ([15b3f67b](https://github.com/ooneex/ooneex/commit/15b3f67b))
- Add task resource templates — Franck ([ae8ff7f1](https://github.com/ooneex/ooneex/commit/ae8ff7f1))
- Add note resource templates — Franck ([6828b89f](https://github.com/ooneex/ooneex/commit/6828b89f))
- Add image resource templates — Franck ([c9b521c8](https://github.com/ooneex/ooneex/commit/c9b521c8))
- Add lang field to folder resource templates — Franck ([95f8fd2b](https://github.com/ooneex/ooneex/commit/95f8fd2b))
- Add folder resource templates — Franck ([f1897efc](https://github.com/ooneex/ooneex/commit/f1897efc))
- Add discount resource templates — Franck ([7cb886da](https://github.com/ooneex/ooneex/commit/7cb886da))
- Add book resource templates — Franck ([bb496e64](https://github.com/ooneex/ooneex/commit/bb496e64))
- Add status resource templates — Franck ([6a1510b4](https://github.com/ooneex/ooneex/commit/6a1510b4))
- Add indexes to migration templates and fix default role — Franck ([28a50be5](https://github.com/ooneex/ooneex/commit/28a50be5))
- Add calendar-event resource templates — Franck ([1215f2dd](https://github.com/ooneex/ooneex/commit/1215f2dd))
- Add category resource templates and use random.id() — Franck ([c93f19e8](https://github.com/ooneex/ooneex/commit/c93f19e8))
- Add topic resource templates — Franck ([e0977d40](https://github.com/ooneex/ooneex/commit/e0977d40))
- Add tag resource templates — Franck ([ecbc501a](https://github.com/ooneex/ooneex/commit/ecbc501a))
- Update user templates with repository sync and nullable entity types — Franck ([93692924](https://github.com/ooneex/ooneex/commit/93692924))

### Changed

- Inline route type into controller template — Franck ([5228a63b](https://github.com/ooneex/ooneex/commit/5228a63b))
- Update entity and repository templates — Franck ([fe4f92bb](https://github.com/ooneex/ooneex/commit/fe4f92bb))

### Fixed

- Rename hexa to hex in color resource templates — Franck ([3c409db3](https://github.com/ooneex/ooneex/commit/3c409db3))
- Make lang field nullable in book resource templates — Franck ([f4769f5c](https://github.com/ooneex/ooneex/commit/f4769f5c))

## [1.8.4](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.8.4) - 2026-03-31

### Changed

- Suppress stdout output from spawned processes — Franck ([57b658ff](https://github.com/ooneex/ooneex/commit/57b658ff))

## [1.8.3](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.8.3) - 2026-03-31

### Changed

- Use husky init and move dev deps install after runtime deps — Franck ([474cc08e](https://github.com/ooneex/ooneex/commit/474cc08e))

## [1.8.2](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.8.2) - 2026-03-31

### Changed

- Install dev dependencies before runtime dependencies — Franck ([9a6c6160](https://github.com/ooneex/ooneex/commit/9a6c6160))

## [1.8.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.8.1) - 2026-03-31

### Changed

- Replace permissions with middlewares in module test template — Franck ([d143cf84](https://github.com/ooneex/ooneex/commit/d143cf84))
- Remove permissions from module template and update imports — Franck ([74618a2b](https://github.com/ooneex/ooneex/commit/74618a2b))

## [1.8.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.8.0) - 2026-03-30

### Added

- Fix module path resolution and add Zed settings to app template — Franck ([03ab5dc0](https://github.com/ooneex/ooneex/commit/03ab5dc0))
- Add auto-install of package dependencies in Make commands — Franck ([185a65de](https://github.com/ooneex/ooneex/commit/185a65de))

### Changed

- Update health check path to /healthcheck — Franck ([c1904f98](https://github.com/ooneex/ooneex/commit/c1904f98))
- Replace hardcoded template deps with explicit bun add install — Franck ([7b7fccd8](https://github.com/ooneex/ooneex/commit/7b7fccd8))
- Mock Bun.spawn in Make command tests to skip bun add — Franck ([af3f3bcf](https://github.com/ooneex/ooneex/commit/af3f3bcf))

## [1.7.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.7.0) - 2026-03-30

### Added

- Add @ooneex/controller dependency to app template — Franck ([8df4fa2b](https://github.com/ooneex/ooneex/commit/8df4fa2b))

## [1.6.1](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.6.1) - 2026-03-30

### Changed

- Format MakeAppCommand spec Bun.spawn mock condition — Franck ([4b8d4541](https://github.com/ooneex/ooneex/commit/4b8d4541))
- Replace bun install with git init in app generation — Franck ([4205de51](https://github.com/ooneex/ooneex/commit/4205de51))

## [1.6.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.6.0) - 2026-03-30

### Added

- Run bun install and update after app generation — Franck ([3d2e68e2](https://github.com/ooneex/ooneex/commit/3d2e68e2))
- Add commit skill template and health check controller generation — Franck ([d15f624a](https://github.com/ooneex/ooneex/commit/d15f624a))

### Changed

- Remove permissions from app template and tests — Franck ([6e8761dd](https://github.com/ooneex/ooneex/commit/6e8761dd))
- Format MakeReleaseCommand and update MakeAppCommand test setup — Franck ([7b201d0e](https://github.com/ooneex/ooneex/commit/7b201d0e))

## [1.5.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.5.0) - 2026-03-29

### Added

- Add optimize Claude skill template — Franck ([7bd0ad65](https://github.com/ooneex/ooneex/commit/7bd0ad65))

### Changed

- Disable logger formatting for no unreleased commits message — Franck ([d54f399e](https://github.com/ooneex/ooneex/commit/d54f399e))

## [1.4.0](https://github.com/ooneex/ooneex/releases/tag/@ooneex/cli@1.4.0) - 2026-03-29

### Added

- Add API section to env template — Franck ([baecb85e](https://github.com/ooneex/ooneex/commit/baecb85e))
- Add CLI documentation section to app README template — Franck ([fc563407](https://github.com/ooneex/ooneex/commit/fc563407))
- Add README template and auto module scope registration — Franck ([9b7cd53f](https://github.com/ooneex/ooneex/commit/9b7cd53f))

### Changed

- Add version links to changelog and remove Unreleased section — Franck ([882156b3](https://github.com/ooneex/ooneex/commit/882156b3))

### Fixed

- Fix logger mock and nullish coalescing in MakeModuleCommand — Franck ([27510298](https://github.com/ooneex/ooneex/commit/27510298))

## [1.3.1] - 2026-03-29

### Changed

- Use async fs APIs in MakeReleaseCommand and update tests — Franck ([ff7a1dc8](https://github.com/ooneex/ooneex/commit/ff7a1dc8))
- Simplify MakeReleaseCommand logging and changelog template — Franck ([7828b82a](https://github.com/ooneex/ooneex/commit/7828b82a))


## [1.3.0] - 2026-03-29

### Added

- Add author and commit links to changelog entries — Franck ([a8d0cd86](https://github.com/ooneex/ooneex/commit/a8d0cd86))
- Add MakeReleaseCommand for package releases — Franck ([91088002](https://github.com/ooneex/ooneex/commit/91088002))
- Move bin file creation to individual commands and update templates — Franck ([3fe22e9a](https://github.com/ooneex/ooneex/commit/3fe22e9a))
- Update skill structure, templates, and error handling — Franck ([8b976cfc](https://github.com/ooneex/ooneex/commit/8b976cfc))
- Add destination option to make:app and fix app module self-registration — Franck ([636d756a](https://github.com/ooneex/ooneex/commit/636d756a))

### Changed

- Improve MakeReleaseCommand logging and use annotated tags — Franck ([b33ad2d9](https://github.com/ooneex/ooneex/commit/b33ad2d9))
- Replace execSync with Bun shell in MakeReleaseCommand — Franck ([6ef624eb](https://github.com/ooneex/ooneex/commit/6ef624eb))
- Remove unused fields from app package.json template — Franck ([82603508](https://github.com/ooneex/ooneex/commit/82603508))
- Update skill templates to use standard method syntax — Franck ([1b0b205a](https://github.com/ooneex/ooneex/commit/1b0b205a))
- Update skill templates with coding conventions and arrow function syntax — Franck ([e6331c2c](https://github.com/ooneex/ooneex/commit/e6331c2c))
- Update CompletionZshCommand test to use --destination flag — Franck ([927f5d87](https://github.com/ooneex/ooneex/commit/927f5d87))
- Bump version and update app template dependencies — Franck ([3d340439](https://github.com/ooneex/ooneex/commit/3d340439))
- Replace non-null assertions with optional chaining and remove outdated test — Franck ([cdce2612](https://github.com/ooneex/ooneex/commit/cdce2612))
- Replace non-null assertions with optional chaining in tests — Franck ([a40a0dde](https://github.com/ooneex/ooneex/commit/a40a0dde))

### Fixed

- Add --no-pager flag to git commands in MakeReleaseCommand — Franck ([2aec10d6](https://github.com/ooneex/ooneex/commit/2aec10d6))
- Use regex for env template replacements in MakeAppCommand — Franck ([a17552b5](https://github.com/ooneex/ooneex/commit/a17552b5))
