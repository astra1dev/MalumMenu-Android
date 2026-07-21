<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html">
    <img src="https://img.shields.io/badge/license-GPL-yellow.svg?style=plastic&logo=GNU&label=License" alt="GPL">
  </a>

  <a href="https://discord.gg/ue9x6TnMC3">
    <img src="https://img.shields.io/badge/Join%20Us%20on-Discord-blue?style=flat&logo=discord" alt="Discord">
  </a>

  <a href="https://github.com/astra1dev#%EF%B8%8F-support-me">
    <img src="https://img.shields.io/badge/Support%20me-Monero-FF6600?style=flat&logo=monero" alt="Monero">
  </a>

  <a href="https://github.com/astra1dev/MalumMenu-Android/releases">
    <img src="https://img.shields.io/github/downloads/astra1dev/MalumMenu-Android/total?style=flat&logo=github&label=Total%20Downloads&color=2ECC71" alt="Downloads">
  </a>

  <a href="https://github.com/astra1dev/MalumMenu-Android/releases/latest">
    <img src="https://img.shields.io/github/downloads/astra1dev/MalumMenu-Android/latest/total?style=flat&logo=github&label=Downloads@Latest&color=2ECC71" alt="Downloads">
  </a>
</p>

<p align="center">
  <b>An Among Us cheat menu for Android</b>
</p>

# 🎉 Features

<img src="https://github.com/user-attachments/assets/d0db15eb-daed-474e-a27b-2eb7b5395dd1" alt="Preview">

### Movement
- NoClip
- Speedhack

### ESP

- No Shadows

### Ship

- Call Meeting
- Sabotage Reactor
- Open Sabotage Map
- Unlock Vents
- Kick all from Vents
- Walk in Vents

### Passive

- Unlock Cosmetics

### Other

- UwUify Game
- Show Unity Logs

# 🔥 Releases

Before you download anything, make sure your platform is supported:

- ✅ Any Android version where Among Us works (root not required)
- ❓ Custom / OEM ROMs (may or may not work)
- ❌ Emulators (`frida-java-bridge`, which is required for the menu, doesn't work on them)

The table below lists the most recent MalumMenu-Android release for each Among Us version. Release notes can be found below each new [release](../../releases) and in [CHANGELOG.md](/docs/CHANGELOG.md).

|    Among Us Version     |      MalumMenu-Android Version      |
|:-----------------------:|:-----------------------------------:|
|  `17.4.0` (`2026.6.5`)  | [v1.0.1](../../releases/tag/v1.0.1) |

# 💾 Installation

Download and install the .apk from [releases](https://github.com/astra1dev/MalumMenu-Android/releases/latest).

> [!WARNING]
> This mod relies on the unstable `frida-java-bridge`. Random crashes and inconsistent behavior may occur.

# ❓ FAQ

- **Q:** How do I know the menu is loaded?  
**A:** You will see a mod icon in the top left corner when you open Among Us.

- **Q:** The menu doesn't appear.  
**A:** Ensure you granted the "Display over other apps" permission. The game should ask for it on the first launch. If not, grant it manually.

- **Q:** Do I need to uninstall the original Among Us before using MalumMenu-Android?  
**A:** Currently yes, as MalumMenu-Android has the same package name, but this may change in the future.

# 👷‍♂️ Compiling

Requirements:

- Android SDK Build Tools (for objection)
- Python 3.10+ (for Frida & objection)
- Node.js
- Java Development Kit (for APKEditor and apktool)

## Basic Setup

### Create project & install dependencies

```sh
# Clone the repository
git clone https://github.com/astra1dev/MalumMenu-Android
cd MalumMenu-Android

# Create a virtual environment (Not necessary, but considered good practice)
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Install Frida and objection
pip install -r requirements.txt

# Install node.js dependencies
npm install
```

### Getting the original game APK

- `pip install gplaydl`
- `gplaydl auth`
- `gplaydl download com.innersloth.spacemafia`
- Copy the 4 downloaded apks to `./data/split`

### Merging the split APKs

- Download the latest `.jar` from [APKEditor releases](https://github.com/REAndroid/APKEditor/releases/latest)
- `java -jar APKEditor.jar m -i data/split -o data/merged.apk`

### Editing the merged APK

- Decompile the merged APK: `java -jar APKEditor.jar d -i data/merged.apk -o data/edited`
- Edit `AndroidManifest.xml` in a text editor to add overlay permission: `<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>`
- Optional: Change `package="com.astra1dev.MalumMenu"`
- Optional: Change the app display name: `resources/package_1/res/values/strings.xml` Among Us to MalumMenu

### Building the edited APK

- `java -jar APKEditor.jar b -i data/edited -o data/build.apk`

## Development workflow

The following commands compile the script into `./dist/agent.js`:

- `npm run build:release` - release version (minified, optimized)
- `npm run build:dev` - development version
- `npm run watch` - development version with watch mode (rebuilds automatically on file changes)

You should also periodically ensure code quality:

- `npm run lint` - runs [eslint](https://eslint.org/) to check for errors
- `npm run prettier` - runs [prettier](https://prettier.io/) to format code

### Script Mode

- Inject script into APK: `objection patchapk -c objection.cfg.json -s data/build.apk -l dist/agent.js -a arm64-v8a -V 17.16.3`
- Connect your device via ADB and run `adb install -i com.android.vending data/build.objection.apk` to install the APK on your device. (You can also manually copy the APK to your device and install it, but this is the fastest way)
- Start the game. The first time you start it, it will ask for "Display over other apps" permission. You should now see the mod icon in the top left corner.

### Listen Mode

If you are modifying the code, use this mode to avoid rebuilding the APK constantly.

- Inject Frida into APK: `objection patchapk -s data/build.apk -a arm64-v8a -V 17.16.3`
- Connect your device via ADB and run `adb install -i com.android.vending data/build.objection.apk` to install the APK on your device. (You can also manually copy the APK to your device and install it, but this is the fastest way)
- Start the game. The first time you start it, it will ask for "Display over other apps" permission. 
- Every time you start the game, it will immediately pause and wait until you manually inject the script. (If you check `adb logcat`, something similar to `Frida: Listening on TCP port 27042` should be shown)
- `npm run spawn` - spawn script in gadget mode
- `npm run spawn:server` - spawn script using frida-server (app name needs to be "Among Us")
- You should now see the mod icon in the top left corner.

# 👨‍💻 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

# 🙏 Credits

- [Frida](https://frida.re/) - dynamic instrumentation toolkit
- [frida-il2cpp-bridge](https://github.com/vfsfitvnm/frida-il2cpp-bridge/) - hijack any IL2CPP game at runtime
- [frida-java-menu](https://github.com/astra1dev/frida-java-menu) - create custom floating menus on Android
- [objection](https://github.com/sensepost/objection) - runtime mobile exploration toolkit (used to inject Frida into APKs)
- [fallguys-frida-modmenu](https://github.com/repinek/fallguys-frida-modmenu) - main inspiration for this project, utils & modules & i18n logic
- [MalumMenu](https://github.com/scp222thj/MalumMenu) - Among Us cheat menu for PC
- [gplaydl](https://github.com/rehmatworks/gplaydl) - CLI Google Play Store APK downloader

# ⚠️ Disclaimer

This mod is not affiliated with Among Us or Innersloth LLC, and the content contained therein is not endorsed or otherwise sponsored by Innersloth LLC. Portions of the materials contained herein are property of Innersloth LLC. © Innersloth LLC.

This mod is not intended to be used in any manner that interferes with Innersloth's services, Innersloth's operation of Among Us, the integrity or availability of the game, or the normal gameplay experience of other players. The creator does not endorse, encourage, or condone using this mod to disrupt games, negatively affect other users, bypass rules or protections, or gain an unfair advantage in any setting where such use is prohibited. Any misuse is solely the responsibility of the user.

Usage of this mod can violate the terms of service of Among Us, which may lead to punitive action including temporary or permanent bans from the game. The creator is not responsible for any consequences you may face due to usage. Use at your own risk.
