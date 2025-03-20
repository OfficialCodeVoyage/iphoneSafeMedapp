import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import DeviceStatusScreen from '../screens/DeviceStatusScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import MedicationDetailScreen from '../screens/MedicationDetailScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import EditMedicationScreen from '../screens/EditMedicationScreen';

// Providers
import { MedicationProvider } from '../services/MedicationStore';
import { NotificationManagerProvider } from '../services/NotificationManager';
import { BluetoothManagerProvider } from '../services/BluetoothManager';

// Stack navigator types
type HomeStackParamList = {
  Home: undefined;
  MedicationDetail: { medicationId: string };
  AddMedication: undefined;
  EditMedication: { medicationId: string };
};

type ScheduleStackParamList = {
  Schedule: undefined;
  MedicationDetail: { medicationId: string };
  AddMedication: undefined;
};

type DeviceStackParamList = {
  Device: undefined;
};

type SettingsStackParamList = {
  Settings: undefined;
};

// Create navigators
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ScheduleStack = createStackNavigator<ScheduleStackParamList>();
const DeviceStack = createStackNavigator<DeviceStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Home stack navigator
const HomeStackNavigator = () => {
  console.log('Rendering HomeStackNavigator');
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
      <HomeStack.Screen name="AddMedication" component={AddMedicationScreen} />
      <HomeStack.Screen name="EditMedication" component={EditMedicationScreen} />
    </HomeStack.Navigator>
  );
};

// Schedule stack navigator
const ScheduleStackNavigator = () => {
  console.log('Rendering ScheduleStackNavigator');
  return (
    <ScheduleStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ScheduleStack.Screen name="Schedule" component={ScheduleScreen} />
      <ScheduleStack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
      <ScheduleStack.Screen name="AddMedication" component={AddMedicationScreen} />
    </ScheduleStack.Navigator>
  );
};

// Device stack navigator
const DeviceStackNavigator = () => {
  console.log('Rendering DeviceStackNavigator');
  return (
    <DeviceStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <DeviceStack.Screen name="Device" component={DeviceStatusScreen} />
    </DeviceStack.Navigator>
  );
};

// Settings stack navigator
const SettingsStackNavigator = () => {
  console.log('Rendering SettingsStackNavigator');
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen name="Settings" component={NotificationSettingsScreen} />
    </SettingsStack.Navigator>
  );
};

// Tab navigator
const TabNavigator = () => {
  console.log('Rendering TabNavigator');
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ScheduleTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'DeviceTab') {
            iconName = focused ? 'pill' : 'pill-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'bell' : 'bell-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={ScheduleStackNavigator} 
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="DeviceTab" 
        component={DeviceStackNavigator} 
        options={{ title: 'Device' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStackNavigator} 
        options={{ title: 'Notifications' }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator with providers
const AppNavigator = () => {
  console.log('Rendering AppNavigator');
  
  // Add debug logging for error catching
  useEffect(() => {
    console.log('AppNavigator mounted');
  }, []);

  return <TabNavigator />;
};

export default AppNavigator; 