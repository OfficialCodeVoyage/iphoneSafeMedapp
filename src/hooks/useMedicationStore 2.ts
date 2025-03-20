import { useContext } from 'react';
import { MedicationContext } from '../services/MedicationStore';
import { useMedicationStore } from '../services/MedicationStore';

export const useMedicationStore = () => {
  const context = useContext(MedicationContext);
  
  if (!context) {
    throw new Error('useMedicationStore must be used within a MedicationProvider');
  }
  
  return context;
};

// Re-export the medication store hook from services
export { useMedicationStore } from '../services/MedicationStore'; 