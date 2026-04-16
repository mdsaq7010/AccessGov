# ShipGovApp

ShipGovApp is a college prototype for India-focused government service access.

Current stack:

- React Native + Expo
- React Navigation (runtime navigation)
- Supabase (database + prototype auth data)
- Gemini API for GovGuide AI assistant

## Prototype Scope

The app supports two user types:

- Citizen flow: login with OTP, browse departments/services, access AI assistant
- Official flow: login with official credentials, view dashboard, access AI assistant

This is intentionally prototype-first and optimized for feature delivery.

## Project Structure

- Runtime entry and providers: App.js, index.js
- Navigation: src/navigation/RootNavigator.js
- Auth and API: src/context/, src/api/
- Screens: src/screens/
- Supabase schema/seed: supabase/setup.sql

Note: The app folder contains Expo starter template files. Current runtime flow is App.js + src/navigation/RootNavigator.js.

## Environment Setup

1. Copy .env.example to .env
2. Fill the values in .env:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_GEMINI_API_KEY

Optional demo-only values:

- EXPO_PUBLIC_DEMO_ADMIN_EMAIL
- EXPO_PUBLIC_DEMO_ADMIN_PASSWORD
- EXPO_PUBLIC_DEMO_OFFICER_EMAIL
- EXPO_PUBLIC_DEMO_OFFICER_PASSWORD

Security notes:

- Never commit real API keys or passwords.
- Keep only placeholder values in .env.example.
- Rotate any key that was previously exposed in local files or screenshots.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

3. Open on Android, iOS, or Web from the Expo prompt.

## Useful Commands

```bash
npm run lint
npm run android
npm run android:local
npm run android:gradle:debug
npm run android:install:debug
npm run build:apk
npm run build:aab
npm run ios
npm run web
npm run web:fixed
```

## Android Build (APK/AAB)

This project is already configured for Android with package id `com.shipgov.app`.

1. Login to Expo/EAS:

```bash
npx eas login
```

2. Build installable APK (for testing on devices):

```bash
npm run build:apk
```

3. Build production AAB (for Play Store upload):

```bash
npm run build:aab
```

4. For local Android native run (Android Studio/SDK required):

```bash
npm run android:local
```

## Run In Android Studio

Native Android project is generated under [android/build.gradle](android/build.gradle) and is ready for Android Studio.

1. Open Android Studio -> Open project -> select the [android](android) folder.
2. Wait for Gradle sync.
3. Ensure Gradle JDK is set to Android Studio JBR (Settings -> Build Tools -> Gradle -> Gradle JDK).
4. Start an emulator and click Run on the `app` configuration.

CLI equivalents:

```bash
npm run android:gradle:debug
npm run android:install:debug
```

## Quick Smoke Checklist

Run this manual flow after major changes:

1. Citizen login -> OTP verify -> Citizen dashboard loads
2. Open AI Assistant -> send one message -> receive response
3. Back to citizen dashboard -> verify appointments/applications sections render
4. Logout -> LoginType screen appears
5. Official login -> Official dashboard -> update one status action

## Prototype Auth Notes

- Development mode includes demo-friendly auth fallback behavior in src/api/auth.js.
- This behavior is for prototype development only.

## Next Planned Build Focus

- Consolidated AI action layer (safe, explicit action mapping)
- Citizen + Official feature parity for core service request lifecycle
- Clean component structure for easy UI redesign later
