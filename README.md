# Medication Reminder App

A cross-platform mobile application for managing medications, schedules, and reminders. Built with React Native.

## Features

- **Medication Management**: Add, edit, and delete medications with customizable dosage information.
- **Scheduling**: Create complex medication schedules with different times and days of the week.
- **Reminders**: Get notified when it's time to take your medications.
- **Tracking**: Mark medications as taken and track your adherence over time.
- **Refill Reminders**: Set reminders for when you need to refill your prescriptions.
- **Device Integration**: Connect to Bluetooth-enabled pill dispensers (optional).

## Screens

- **Home**: Overview of today's medications, next upcoming dose, and daily stats.
- **Schedule**: Calendar view of all medication schedules.
- **Medication Details**: View and edit details for each medication.
- **Add/Edit Medication**: Forms for adding or editing medications.
- **Device Status**: Connect to and manage Bluetooth-enabled pill dispensers.
- **Settings**: Configure notification preferences.

## Getting Started

### Prerequisites

- Node.js (14 or newer)
- npm or yarn
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medication-reminder-app.git
   cd medication-reminder-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install iOS dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```

4. Run the app:

   For iOS:
   ```bash
   npx react-native run-ios
   ```

   For Android:
   ```bash
   npx react-native run-android
   ```

## Project Structure

```
iosMedApp/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── models/           # TypeScript interfaces and types
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── services/         # Business logic and data management
│   └── utils/            # Utility functions
├── App.tsx               # Main app component
└── index.js              # Entry point
```

## Data Management

The app uses AsyncStorage for persistent data storage with the following structure:

- Medications: Array of medication objects with schedules
- Notification Settings: User preferences for notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original iOS Swift app that inspired this cross-platform version
- React Native and the entire open-source community
