/**
 * Medication Reminder App
 *
 * @format
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { MedicationProvider } from './src/services/MedicationStore';
import { NotificationManagerProvider } from './src/services/NotificationManager';
import { BluetoothManagerProvider } from './src/services/BluetoothManager';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate`',
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  console.log('App with real AppNavigator rendering');
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <MedicationProvider>
            <NotificationManagerProvider>
              <BluetoothManagerProvider>
                <AppNavigator />
              </BluetoothManagerProvider>
            </NotificationManagerProvider>
          </MedicationProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
