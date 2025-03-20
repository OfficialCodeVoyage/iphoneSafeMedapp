import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform, NativeModules, NativeEventEmitter, PermissionsAndroid } from 'react-native';

// Mocked Bluetooth manager for development
// In a real app, you would use a library like 'react-native-ble-plx'
const BleManager = {
  start: (options: any) => console.log('BleManager started', options),
  scan: (services: string[], seconds: number, allowDuplicates: boolean) => console.log('Scanning...'),
  stopScan: () => console.log('Scan stopped'),
  connect: (deviceId: string) => Promise.resolve('Connected'),
  disconnect: (deviceId: string) => Promise.resolve('Disconnected'),
  // Add other methods as needed
};

export enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnecting = 'Disconnecting',
}

// Context interface
interface BluetoothContextType {
  isScanning: boolean;
  discoveredDevices: any[];
  connectedDevice: any | null;
  connectionState: ConnectionState;
  batteryLevel: number;
  isLocked: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  connect: (device: any) => void;
  disconnect: () => void;
  toggleLockState: () => void;
}

interface BluetoothManagerProviderProps {
  children: ReactNode;
}

// Create the context
export const BluetoothContext = createContext<BluetoothContextType>({
  isScanning: false,
  discoveredDevices: [],
  connectedDevice: null,
  connectionState: ConnectionState.Disconnected,
  batteryLevel: 0,
  isLocked: false,
  startScanning: () => {},
  stopScanning: () => {},
  connect: () => {},
  disconnect: () => {},
  toggleLockState: () => {},
});

export const BluetoothManagerProvider: React.FC<BluetoothManagerProviderProps> = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize BLE manager
  useEffect(() => {
    // In a real app, you would initialize BleManager and set up event listeners
    BleManager.start({ showAlert: false });

    // Request Bluetooth permissions on Android
    const requestPermissions = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Bluetooth Permission',
              message: 'This app requires location permission to scan for Bluetooth devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermissions();

    return () => {
      // Clean up event listeners
    };
  }, []);

  // Start scanning for Bluetooth devices
  const startScanning = () => {
    if (isScanning) return;

    setIsScanning(true);
    setDiscoveredDevices([]);

    // In a real app, you would use BleManager.scan()
    // Here we'll simulate device discovery with a timer
    setTimeout(() => {
      const mockDevices = [
        {
          id: '00:11:22:33:44:55',
          name: 'Smart Pill Dispenser',
          isConnectable: true,
        },
        {
          id: 'AA:BB:CC:DD:EE:FF',
          name: 'Med Reminder Device',
          isConnectable: true,
        },
      ];
      setDiscoveredDevices(mockDevices);
      setIsScanning(false);
    }, 2000);
  };

  // Stop scanning
  const stopScanning = () => {
    if (!isScanning) return;
    // BleManager.stopScan();
    setIsScanning(false);
  };

  // Connect to device
  const connect = (device: any) => {
    setConnectionState(ConnectionState.Connecting);

    // Simulate connection
    setTimeout(() => {
      setConnectedDevice(device);
      setConnectionState(ConnectionState.Connected);
      setBatteryLevel(85); // Mock battery level
      setIsLocked(false);  // Mock lock state
    }, 1500);
  };

  // Disconnect from device
  const disconnect = () => {
    if (!connectedDevice) return;
    
    setConnectionState(ConnectionState.Disconnecting);
    
    // Simulate disconnection
    setTimeout(() => {
      setConnectedDevice(null);
      setConnectionState(ConnectionState.Disconnected);
      setBatteryLevel(0);
    }, 1000);
  };

  // Toggle lock state of the device
  const toggleLockState = () => {
    if (!connectedDevice || connectionState !== ConnectionState.Connected) return;
    
    setIsLocked(!isLocked);
  };

  const contextValue: BluetoothContextType = {
    isScanning,
    discoveredDevices,
    connectedDevice,
    connectionState,
    batteryLevel,
    isLocked,
    startScanning,
    stopScanning,
    connect,
    disconnect,
    toggleLockState,
  };

  return (
    <BluetoothContext.Provider value={contextValue}>
      {children}
    </BluetoothContext.Provider>
  );
};

// Custom hook for using the Bluetooth context
export const useBluetoothManager = () => {
  const context = React.useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error('useBluetoothManager must be used within a BluetoothManagerProvider');
  }
  return context;
}; 