import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Medication } from '../../models/MedicationModels';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MedicationCardProps {
  medication: Medication;
  onPress: (id: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onPress }) => {
  // Get next scheduled time for this medication
  const getNextScheduleTime = (): string => {
    if (!medication.schedule || medication.schedule.length === 0) {
      return 'No schedule';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Sort schedules by time
    const sortedSchedules = [...medication.schedule]
      .filter(s => s.enabled)
      .sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
        const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
        return timeA - timeB;
      });
    
    if (sortedSchedules.length === 0) {
      return 'No active schedule';
    }
    
    // Find the next schedule after current time
    const nextSchedule = sortedSchedules.find(s => {
      const scheduleTime = parseInt(s.time.split(':')[0]) * 60 + parseInt(s.time.split(':')[1]);
      return scheduleTime > currentTime;
    });
    
    if (nextSchedule) {
      return `Next: ${nextSchedule.time}`;
    } else {
      // If no schedule found today, show the first one for tomorrow
      return `Next: ${sortedSchedules[0].time} (tomorrow)`;
    }
  };

  // Calculate days of supply remaining
  const getDaysRemaining = (): string => {
    if (!medication.refillDate) {
      return '';
    }
    
    const today = new Date();
    const refillDate = new Date(medication.refillDate);
    const diffTime = refillDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Refill needed';
    } else if (diffDays === 1) {
      return '1 day remaining';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Determine if this medication is due soon (within the next hour)
  const isDueSoon = (): boolean => {
    if (!medication.schedule || medication.schedule.length === 0) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return medication.schedule.some(s => {
      if (!s.enabled) return false;
      
      const scheduleTime = parseInt(s.time.split(':')[0]) * 60 + parseInt(s.time.split(':')[1]);
      const timeDiff = scheduleTime - currentTime;
      
      // Due within the next hour
      return timeDiff > 0 && timeDiff <= 60;
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: medication.color || '#4caf50' },
        isDueSoon() && styles.dueSoon
      ]}
      onPress={() => onPress(medication.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {medication.image ? (
          <Image source={{ uri: medication.image }} style={styles.medicationImage} />
        ) : (
          <Icon name="pill" size={32} color={medication.color || '#4caf50'} />
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.dosage}>{medication.dosage}</Text>
        <Text style={styles.nextDose}>{getNextScheduleTime()}</Text>
        
        {medication.refillReminder && (
          <Text style={[
            styles.refill,
            getDaysRemaining() === 'Refill needed' && styles.refillNeeded
          ]}>
            {getDaysRemaining()}
          </Text>
        )}
      </View>
      
      <Icon name="chevron-right" size={24} color="#888" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dueSoon: {
    backgroundColor: '#e8f5e9',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicationImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  nextDose: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  refill: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  refillNeeded: {
    color: '#f44336',
    fontWeight: '500',
  },
  chevron: {
    alignSelf: 'center',
  },
});

export default MedicationCard; 