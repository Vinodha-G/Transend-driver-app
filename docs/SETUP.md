# Setup Guide - Transend Driver App

## Quick Start

### Prerequisites
- **Node.js**: v16 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: For testing on physical devices (iOS/Android)

### Installation

```bash
# Clone or navigate to project directory
cd Transend-driver-app-1

# Install dependencies
npm install
# or
yarn install

# Start development server
npm start
# or
expo start
```

### Running on Devices

**Using Expo Go (Recommended for Development):**
1. Install Expo Go app on your device (iOS App Store / Google Play)
2. Start the dev server: `npm start`
3. Scan QR code with Expo Go app

**Using Emulators/Simulators:**
```bash
# Android Emulator
npm run android

# iOS Simulator (macOS only)
npm run ios

# Web Browser
npm run web
```

---

## Configuration

### Environment Setup

The app uses `app.json` for configuration (Expo doesn't support `.env` files directly).

**Current Configuration** (`app.json`):
```json
{
  "expo": {
    "extra": {
      "currentEnvironment": "development",
      "apiBaseUrlDev": "https://devtrans.transend.ca/api",
      "oauthBaseUrl": "https://devtrans.transend.ca",
      ...
    }
  }
}
```

**For Production:**
1. Update `app.json.extra.currentEnvironment` to `"production"`
2. Or use EAS Build secrets for sensitive credentials
3. Create environment-specific `app.json` files if needed

---

## Troubleshooting

### Common Issues

**Metro Bundler Errors:**
```bash
# Clear cache and restart
expo start -c
# or
npm start -- --clear
```

**Dependencies Issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**iOS Simulator Not Starting:**
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`
- Open Xcode and install additional components if prompted

**Android Emulator Not Starting:**
- Ensure Android Studio is installed
- Create an AVD (Android Virtual Device) in Android Studio
- Ensure ANDROID_HOME is set in environment variables

---

## Development Workflow

1. **Start Dev Server**: `npm start`
2. **Make Changes**: Edit files in `src/`
3. **See Changes**: App auto-reloads (Fast Refresh)
4. **Debug**: Use React Native Debugger or Chrome DevTools

---

## Project Structure

```
Transend-driver-app-1/
├── src/
│   ├── api/           # API services and configuration
│   ├── components/    # Reusable UI components
│   ├── context/       # State management (AppContext, ThemeContext)
│   ├── navigation/    # Navigation setup
│   ├── screens/       # Screen components
│   ├── styles/        # Common styles and colors
│   └── utils/         # Utility functions
├── assets/            # Images, fonts, etc.
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── FIXES.md           # List of fixes applied
```

---

## Next Steps

1. Review `FIXES.md` for all fixes applied
2. Test all screens and navigation flows
3. Verify API integration works correctly
4. Test on both iOS and Android devices
5. Prepare for production build with EAS

---

*For detailed fixes and changes, see `FIXES.md`*

