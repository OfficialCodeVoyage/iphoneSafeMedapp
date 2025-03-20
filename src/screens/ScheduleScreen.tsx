import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMedicationStore } from '../hooks/useMedicationStore';
import { Medication, Schedule } from '../models/MedicationModels';

const ScheduleScreen = () => {
  const navigation = useNavigation();
  const { medications } = useMedicationStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedulesByTime, setSchedulesByTime] = useState<
    Array<{ time: string; medications: Array<{ medication: Medication; schedule: Schedule }> }>
  >([]);

  // Generate next 7 days for header
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format weekday for display
  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Organize schedules by time
  useEffect(() => {
    const schedules: Array<{ time: string; medications: Array<{ medication: Medication; schedule: Schedule }> }> = [];
    const selectedDay = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    medications.forEach(medication => {
      medication.schedule.forEach(schedule => {
        // Check if schedule is for selected day of week
        if (schedule.daysOfWeek.includes(selectedDay) && schedule.enabled) {
          const timeString = schedule.time;
          
          // Find if this time already exists in our array
          let timeGroup = schedules.find(group => group.time === timeString);
          
          if (!timeGroup) {
            timeGroup = { time: timeString, medications: [] };
            schedules.push(timeGroup);
          }
          
          timeGroup.medications.push({ medication, schedule });
        }
      });
    });

    // Sort by time
    schedules.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });

    setSchedulesByTime(schedules);
  }, [medications, selectedDate]);

  // Handle marking medication as taken
  const handleMedicationTaken = (medication: Medication, schedule: Schedule) => {
    Alert.alert(
      'Mark as Taken',
      `Have you taken ${medication.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Would mark medication as taken here
            // This would update the medication's taken status
            Alert.alert('Success', `${medication.name} marked as taken!`);
          },
        },
      ]
    );
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <View style={styles.container}>
      {/* Date selector */}
      <View style={styles.dateSelector}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={weekDays}
          keyExtractor={(item) => item.toISOString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateItem,
                isSelected(item) && styles.selectedDateItem,
                isToday(item) && styles.todayDateItem,
              ]}
              onPress={() => setSelectedDate(item)}
            >
              <Text
                style={[
                  styles.weekdayText,
                  isSelected(item) && styles.selectedDateText,
                ]}
              >
                {formatWeekday(item)}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isSelected(item) && styles.selectedDateText,
                ]}
              >
                {formatDate(item)}
              </Text>
              {isToday(item) && (
                <View style={styles.todayIndicator}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Schedule content */}
      {schedulesByTime.length > 0 ? (
        <ScrollView style={styles.scheduleContainer}>
          {schedulesByTime.map((group, index) => (
            <View key={index} style={styles.timeGroup}>
              <View style={styles.timeHeader}>
                <Icon name="clock-outline" size={24} color="#4caf50" />
                <Text style={styles.timeText}>{formatTime(group.time)}</Text>
              </View>
              
              {group.medications.map((item, medIndex) => (
                <View key={medIndex} style={styles.medicationCard}>
                  <View style={styles.medicationInfo}>
                    <View
                      style={[
                        styles.medicationColor,
                        { backgroundColor: item.medication.color || '#4caf50' },
                      ]}
                    />
                    <View style={styles.medicationDetails}>
                      <Text style={styles.medicationName}>
                        {item.medication.name}
                      </Text>
                      <Text style={styles.medicationDosage}>
                        {item.medication.dosage}
                      </Text>
                      {item.medication.instructions && (
                        <Text style={styles.medicationInstructions}>
                          {item.medication.instructions}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.takenButton}
                    onPress={() => handleMedicationTaken(item.medication, item.schedule)}
                  >
                    <Icon name="check" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank" size={80} color="#e0e0e0" />
          <Text style={styles.emptyText}>
            No medications scheduled for this day
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddMedication' as never)}
          >
            <Text style={styles.addButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    width: 70,
  },
  selectedDateItem: {
    backgroundColor: '#4caf50',
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  weekdayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayIndicator: {
    marginTop: 4,
  },
  todayText: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: '600',
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  timeGroup: {
    marginBottom: 24,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicationInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  medicationColor: {
    width: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicationInstructions: {
    fontSize: 12,
    color: '#888',
  },
  takenButton: {
    backgroundColor: '#4caf50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen; 