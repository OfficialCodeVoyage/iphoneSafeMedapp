export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: Schedule[];
  instructions: string;
  refillDate?: string;
  refillReminder: boolean;
  color: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  medicationId: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
  taken: boolean[];
  takenDates: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderMinutesBefore: number;
  selectedSoundName: string;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
  batteryLevel: number;
  isLocked: boolean;
}

export interface MedicationState {
  medications: Medication[];
  notificationSettings: NotificationSettings;
  connectedDevice: BluetoothDevice | null;
  isLoading: boolean;
  error: string | null;
} 