# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions CI workflow to build and upload the script and APK on every commit

## [2.0.0] - 2026-08-23

The released APK comes with game version `18.0.0` (`2026.8.18`).

### Added

- Use system accent color for UI elements
- Full Resolution
- Complete My Tasks
- Unlock Vents
- Open Sabotage Map

### Changed

- Bump TypeScript from 5.6.3 to 6.0.3
- Move UwUify Game from Other Tab to Passive Tab
- Bump frida from 17.16.4 to 17.17.0 by [@dependabot] ([#22])
- Bump frida from 17.16.3 to 17.16.4 by [@dependabot] ([#11])
- Bump frida from 17.15.5 to 17.16.3 by [@dependabot] ([#10])
- Bump frida from 17.15.4 to 17.15.5 by [@dependabot] ([#7])

### Fixed

- Ensure ghosts can see through walls when No Shadows is disabled (restore vanilla behavior)
- Black screen after one game by [@repinek] ([#6])

## [1.0.1] - 2026-07-10

The released APK comes with game version `17.4.0` (`2026.6.5`).

### Added

- Unlock Cosmetics
- PID and Unity Version in Debug Tab

## [1.0.0] - 2026-07-08

Initial release

[@repinek]: https://github.com/repinek
[@dependabot]: https://github.com/dependabot

[#22]: https://github.com/astra1dev/MalumMenu-Android/pull/22
[#11]: https://github.com/astra1dev/MalumMenu-Android/pull/11
[#10]: https://github.com/astra1dev/MalumMenu-Android/pull/10
[#7]: https://github.com/astra1dev/MalumMenu-Android/pull/7
[#6]: https://github.com/astra1dev/MalumMenu-Android/pull/6

[unreleased]: https://github.com/astra1dev/MalumMenu-Android/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/astra1dev/MalumMenu-Android/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/astra1dev/MalumMenu-Android/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/astra1dev/MalumMenu-Android/releases/tag/v1.0.0
