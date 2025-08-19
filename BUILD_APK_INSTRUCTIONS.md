# 🚀 TeamPulse Android APK Build Instructions

Follow these steps to build and distribute your Android APK.

## 📋 Prerequisites

- Android Studio installed
- Node.js and npm
- Git

## 🔧 Step-by-Step Build Process

### 1. Export & Clone Repository
1. Click **"Export to Github"** button in Lovable
2. Clone your repository:
```bash
git clone [your-repo-url]
cd [repo-name]
```

### 2. Install Dependencies & Setup Android
```bash
# Install all dependencies
npm install

# Add Android platform (if not already added)
npx cap add android

# Update native Android dependencies
npx cap update android
```

### 3. Build the Web App
```bash
# Build the web version
npm run build

# Sync with native platforms
npx cap sync
```

### 4. Generate APK

#### Option A: Using Android Studio (Recommended for Release)
```bash
# Open in Android Studio
npx cap open android
```
Then in Android Studio:
1. Go to **Build** → **Generate Signed Bundle / APK**
2. Choose **APK**
3. Create or use existing keystore
4. Select **release** build variant
5. APK will be generated in `android/app/build/outputs/apk/release/`

#### Option B: Using Command Line (Debug APK)
```bash
# Run on emulator/device (generates debug APK)
npx cap run android
```

### 5. Deploy APK for Download

1. Copy the generated APK to `public/downloads/teampulse-schedule.apk`
2. Rebuild and deploy your web app
3. The download button on your landing page will now work!

## 📱 User Installation Instructions

### For End Users:
1. **Enable Unknown Sources**:
   - Go to **Settings** → **Security** → **Unknown Sources**
   - Enable **"Install unknown apps"** for your browser

2. **Download & Install**:
   - Visit your website
   - Click **"Download Android APK"**
   - Tap the downloaded APK file
   - Follow installation prompts

## 🔄 Development vs Production

The Capacitor config automatically:
- **Development**: Uses live Lovable URL (hot reload)
- **Production**: Uses bundled app files (offline capable)

## 🎯 APK Variants

### Online APK (Current Setup)
- **Pros**: Always up-to-date, smaller file size
- **Cons**: Requires internet connection
- **Best for**: Development, frequent updates

### Offline APK (Optional)
To create a fully offline APK, remove the `server.url` from `capacitor.config.ts`:
```typescript
server: {
  cleartext: true
  // Remove url property for offline APK
},
```

## 🚀 Automation Ideas

### GitHub Actions (Optional)
Create `.github/workflows/build-apk.yml`:
```yaml
name: Build APK
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npx cap sync
      # Add Android build steps
```

## 📝 Notes

- APK size: ~50MB (includes WebView)
- Minimum Android version: 7.0 (API 24)
- Permissions: Camera, Storage, Network
- Auto-updates: Not included (manual APK updates)

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check Android Studio SDK installation
2. **APK won't install**: Enable unknown sources
3. **App crashes**: Check console logs in Chrome DevTools
4. **Network issues**: Verify server configuration

### Getting Help:
- Check Capacitor docs: https://capacitorjs.com/docs/android
- Android Studio logs: **View** → **Tool Windows** → **Logcat**

## 🎉 Success!

Once complete, users can download your APK directly from your landing page and install TeamPulse on their Android devices!