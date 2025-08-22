# Firebase Configuration Guide

## Required Files

For Firebase to work properly, you need to add the following configuration files:

### For Android:
- Download `google-services.json` from your Firebase project console
- Place it in the root directory of your project (same level as package.json)

### For iOS:
- Download `GoogleService-Info.plist` from your Firebase project console  
- Place it in the root directory of your project (same level as package.json)

## Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Add your Android/iOS app to the project
4. Download the configuration files 
5. Enable Cloud Messaging in the Firebase console

## Current Status

The app is configured to handle notifications with proper error handling, but requires the Firebase configuration files to be added for full functionality.

## Testing

You can test notifications by:
1. Adding the configuration files
2. Building the app with EAS or expo-dev-client
3. Using the notification bell in the header to view notifications
4. Testing with the `useNotificationTest` hook if needed

## Package Configuration

Make sure these packages are installed:
- @react-native-firebase/app: ^22.2.1
- @react-native-firebase/messaging: ^22.2.1

The app uses the new modular Firebase v22 API and includes proper error handling for missing configuration files.
