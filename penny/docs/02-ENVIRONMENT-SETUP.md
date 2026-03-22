# Environment Setup Guide — Penny

## Prerequisites Checklist

- [x] Node.js v22.14.0
- [x] NPM 11.4.2
- [x] Python 3.13.2
- [x] Git 2.49.0
- [ ] Java Development Kit (JDK 17)
- [ ] Android Studio + Android SDK
- [ ] Expo CLI

---

## Step 1: Install JDK 17

React Native for Android requires JDK 17.

### Option A: Via winget (recommended)
```powershell
winget install Microsoft.OpenJDK.17
```

### Option B: Manual download
1. Go to https://learn.microsoft.com/en-us/java/openjdk/download
2. Download **Microsoft Build of OpenJDK 17** for Windows x64
3. Install and add to PATH

### Verify:
```powershell
java -version
# Should show: openjdk version "17.x.x"
```

---

## Step 2: Install Android Studio

1. Download from https://developer.android.com/studio
2. Run the installer — install with default settings
3. During setup wizard, make sure these are checked:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
4. After install, open Android Studio → **More Actions** → **SDK Manager**
5. In **SDK Platforms** tab, check:
   - **Android 14 (API 34)** — check "Android SDK Platform 34"
6. In **SDK Tools** tab, check:
   - Android SDK Build-Tools 34
   - Android SDK Command-line Tools
   - Android Emulator
   - Android SDK Platform-Tools
7. Click **Apply** to install

### Set Environment Variables

Open PowerShell as Administrator:

```powershell
# Add ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

# Add platform-tools to PATH (for adb)
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

**Restart your terminal after setting** these variables.

### Verify:
```powershell
adb --version
# Should show: Android Debug Bridge version x.x.x
```

### Create an Android Virtual Device (AVD)
1. Open Android Studio → **More Actions** → **Virtual Device Manager**
2. Click **Create Virtual Device**
3. Select **Pixel 7** (or any device)
4. Select **API 34** system image (download if needed — pick x86_64)
5. Click **Finish**
6. Test by clicking the ▶️ play button — emulator should boot

---

## Step 3: Install Expo CLI

```powershell
npm install -g expo-cli eas-cli
```

### Verify:
```powershell
npx expo --version
eas --version
```

---

## Step 4: Create the Penny Project

```powershell
cd C:\Users\karlb\OneDrive\Desktop\Techclinic\penny

# Create Expo project with TypeScript template
npx create-expo-app@latest penny-app --template blank-typescript

cd penny-app
```

---

## Step 5: Install Core Dependencies

```powershell
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Database
npx expo install expo-sqlite

# File system & document picker
npx expo install expo-file-system expo-document-picker

# Styling
npm install nativewind tailwindcss --save-dev

# State management
npm install zustand

# Markdown rendering
npm install react-native-markdown-display

# UUID generation
npm install uuid
npm install -D @types/uuid
```

---

## Step 6: Install llama.rn

This is the core AI engine — React Native bindings for llama.cpp.

```powershell
npm install llama.rn
```

Since this is a native module, you'll need to create an Expo dev build:

```powershell
# Install expo-dev-client
npx expo install expo-dev-client

# Create the dev build for Android
eas build --platform android --profile development --local
```

> **Note:** The first build takes time (~10-20 min) as it compiles llama.cpp from source.

---

## Step 7: Run the App

### On Emulator
```powershell
npx expo run:android
```

### On Physical Device
1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect via USB
4. Run:
```powershell
npx expo run:android --device
```

---

## Troubleshooting

### "ANDROID_HOME is not set"
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### "JDK not found"
Make sure JDK 17 is installed and `JAVA_HOME` is set:
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.x.x-hotspot", "User")
```

### Build fails with "CMake"
llama.rn requires CMake. Install via Android Studio SDK Manager → SDK Tools → CMake.

### Emulator too slow
- Enable **Hardware Acceleration** (HAXM) in BIOS
- Use x86_64 system image (not arm64) for emulators
- Allocate at least 4GB RAM to the AVD

---

## Directory After Setup

```
penny/
├── docs/
│   ├── 01-PROJECT-PLAN.md
│   ├── 02-ENVIRONMENT-SETUP.md
│   └── 03-OPTIMIZATION-STRATEGY.md
└── penny-app/          ← React Native project
    ├── app/
    ├── assets/
    ├── node_modules/
    ├── app.json
    ├── package.json
    └── tsconfig.json
```
