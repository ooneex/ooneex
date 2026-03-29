# Changelog

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
