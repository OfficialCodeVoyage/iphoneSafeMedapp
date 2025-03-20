import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Medication, 
  Schedule, 
  NotificationSettings, 
  MedicationState 
} from '../models/MedicationModels';

// Sample medications for first run
const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Aspirin',
    dosage: '100mg',
    instructions: 'Take with food',
    color: '#4caf50',
    refillReminder: true,
    refillDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), // 15 days from now
    schedule: [
      {
        id: '1-1',
        medicationId: '1',
        time: '08:00',
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        enabled: true,
        taken: [] as boolean[],
        takenDates: []
      },
      {
        id: '1-2',
        medicationId: '1',
        time: '20:00',
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        enabled: true,
        taken: [] as boolean[],
        takenDates: []
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Vitamin D',
    dosage: '1000 IU',
    instructions: 'Take daily with a meal',
    color: '#ff9800',
    refillReminder: true,
    refillDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(), // 45 days from now
    schedule: [
      {
        id: '2-1',
        medicationId: '2',
        time: '12:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
        enabled: true,
        taken: [] as boolean[],
        takenDates: []
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    instructions: 'Take twice daily with meals',
    color: '#2196f3',
    refillReminder: true,
    refillDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // 30 days from now
    schedule: [
      {
        id: '3-1',
        medicationId: '3',
        time: '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
        enabled: true,
        taken: [] as boolean[],
        takenDates: []
      },
      {
        id: '3-2',
        medicationId: '3',
        time: '18:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
        enabled: true,
        taken: [] as boolean[],
        takenDates: []
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Default values
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderMinutesBefore: 15,
  selectedSoundName: 'default',
};

// Initial state
const initialState: MedicationState = {
  medications: [],
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  connectedDevice: null,
  isLoading: false,
  error: null,
};

// Context
interface MedicationContextType extends MedicationState {
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedication: (medication: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationTaken: (medicationId: string, scheduleId: string, dayIndex: number) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  clearAll: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

// Provider
interface MedicationProviderProps {
  children: ReactNode;
}

export const MedicationProvider: React.FC<MedicationProviderProps> = ({ children }) => {
  console.log('MedicationProvider initializing...');
  const [state, setState] = useState<MedicationState>(initialState);
  
  // Load data on mount
  useEffect(() => {
    console.log('MedicationProvider loading data...');
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        const storedMedications = await AsyncStorage.getItem('medications');
        const storedSettings = await AsyncStorage.getItem('notificationSettings');
        
        if (!storedMedications) {
          // First time run, set sample data
          console.log('No stored medications found. Adding sample data...');
          await AsyncStorage.setItem('medications', JSON.stringify(SAMPLE_MEDICATIONS));
        }
        
        // Get medications (either stored or newly saved samples)
        const medications = await AsyncStorage.getItem('medications');
        
        setState(prev => ({
          ...prev,
          medications: medications ? JSON.parse(medications) : [],
          notificationSettings: storedSettings 
            ? JSON.parse(storedSettings) 
            : DEFAULT_NOTIFICATION_SETTINGS,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false 
        }));
      }
    };
    
    loadData();
  }, []);

  // Add medication
  const addMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const timestamp = new Date().toISOString();
      const newMedication: Medication = {
        ...medicationData,
        id: Date.now().toString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      const updatedMedications = [...state.medications, newMedication];
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      setState(prev => ({
        ...prev,
        medications: updatedMedications,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to add medication' 
      }));
    }
  };

  // Update medication
  const updateMedication = async (medication: Medication) => {
    try {
      const updatedMedication = {
        ...medication,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedMedications = state.medications.map(med => 
        med.id === medication.id ? updatedMedication : med
      );
      
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      setState(prev => ({
        ...prev,
        medications: updatedMedications,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update medication' 
      }));
    }
  };

  // Delete medication
  const deleteMedication = async (id: string) => {
    try {
      const updatedMedications = state.medications.filter(med => med.id !== id);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      setState(prev => ({
        ...prev,
        medications: updatedMedications,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete medication' 
      }));
    }
  };

  // Toggle medication status (taken/not taken)
  const toggleMedicationTaken = async (medicationId: string, scheduleId: string, dayIndex: number) => {
    try {
      console.log(`Toggling medication ${medicationId}, schedule ${scheduleId}, day ${dayIndex}`);
      
      const updatedMedications = state.medications.map(medication => {
        if (medication.id === medicationId) {
          const updatedSchedules = medication.schedule.map(schedule => {
            if (schedule.id === scheduleId) {
              // Create new taken array if it doesn't exist
              const newTaken = [...(schedule.taken || [])];
              
              // Make sure the taken array is long enough
              while (newTaken.length <= dayIndex) {
                newTaken.push(false);
              }
              
              // Toggle the status for the specific day
              newTaken[dayIndex] = !newTaken[dayIndex];
              
              console.log(`Updated taken status for day ${dayIndex} to ${newTaken[dayIndex]}`);
              
              return {
                ...schedule,
                taken: newTaken,
              };
            }
            return schedule;
          });
          
          return {
            ...medication,
            schedule: updatedSchedules,
            updatedAt: new Date().toISOString(),
          };
        }
        return medication;
      });
      
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      setState(prev => ({
        ...prev,
        medications: updatedMedications,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update medication status' 
      }));
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      setState(prev => ({
        ...prev,
        notificationSettings: settings,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update notification settings' 
      }));
    }
  };

  // Clear all data
  const clearAll = async () => {
    try {
      await AsyncStorage.multiRemove(['medications', 'notificationSettings']);
      
      setState({
        ...initialState,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to clear data' 
      }));
    }
  };

  return (
    <MedicationContext.Provider
      value={{
        ...state,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationTaken,
        updateNotificationSettings,
        clearAll,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

// Custom hook
export const useMedicationStore = () => {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedicationStore must be used within a MedicationProvider');
  }
  return context;
}; 