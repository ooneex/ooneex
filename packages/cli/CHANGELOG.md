# Changelog

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
