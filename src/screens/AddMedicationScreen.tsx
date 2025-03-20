import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AddMedicationScreenNavigationProp } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMedicationStore } from '../services/MedicationStore';
import { Schedule } from '../models/MedicationModels';

// Basic color options for medications
const colorOptions = [
  '#4caf50', // Green
  '#2196f3', // Blue
  '#f44336', // Red
  '#ff9800', // Orange
  '#9c27b0', // Purple
  '#009688', // Teal
];

const AddMedicationScreen = () => {
  const navigation = useNavigation<AddMedicationScreenNavigationProp>();
  const { addMedication } = useMedicationStore();

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [refillReminder, setRefillReminder] = useState(false);
  const [refillDate, setRefillDate] = useState('');
  const [schedule, setSchedule] = useState<Schedule[]>([
    {
      id: Date.now().toString(),
      medicationId: '',
      time: '08:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      enabled: true,
      taken: [],
      takenDates: [],
    },
  ]);

  // Validate form before saving
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter a dosage');
      return false;
    }
    if (schedule.length === 0) {
      Alert.alert('Error', 'Please add at least one schedule');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSave = () => {
    if (!validateForm()) return;

    // Create medication object
    const newMedication = {
      name,
      dosage,
      instructions,
      color: selectedColor,
      refillReminder,
      refillDate: refillDate ? new Date(refillDate).toISOString() : undefined,
      schedule: schedule.map(s => ({
        ...s,
        medicationId: 'temp-id' // This will be replaced with the real ID after creation
      })),
    };

    // Add medication through store
    addMedication(newMedication);
    
    Alert.alert('Success', 'Medication added successfully!');
    navigation.goBack();
  };

  // Add new schedule time
  const addSchedule = () => {
    setSchedule([
      ...schedule,
      {
        id: Date.now().toString(),
        medicationId: '',
        time: '08:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        enabled: true,
        taken: [],
        takenDates: [],
      },
    ]);
  };

  // Remove schedule time
  const removeSchedule = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  // Update schedule time
  const updateScheduleTime = (id: string, time: string) => {
    setSchedule(
      schedule.map(item =>
        item.id === id ? { ...item, time } : item
      )
    );
  };

  // Toggle schedule day
  const toggleScheduleDay = (scheduleId: string, day: number) => {
    setSchedule(
      schedule.map(item => {
        if (item.id === scheduleId) {
          const daysOfWeek = [...item.daysOfWeek];
          if (daysOfWeek.includes(day)) {
            // Remove day if already selected
            return {
              ...item,
              daysOfWeek: daysOfWeek.filter(d => d !== day),
            };
          } else {
            // Add day if not selected
            return {
              ...item,
              daysOfWeek: [...daysOfWeek, day].sort(),
            };
          }
        }
        return item;
      })
    );
  };

  // Toggle schedule enabled state
  const toggleScheduleEnabled = (id: string) => {
    setSchedule(
      schedule.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // Get day abbreviation
  const getDayAbbreviation = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Medication</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Icon name="check" size={24} color="#4caf50" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Medication Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter medication name"
          />
        </View>

        {/* Dosage */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="E.g., 10mg, 1 tablet, etc."
          />
        </View>

        {/* Color Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorOptions}>
            {colorOptions.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="E.g., Take with food, etc."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Schedule Section */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          {schedule.map((item, index) => (
            <View key={item.id} style={styles.scheduleItem}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>Time {index + 1}</Text>
                {schedule.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSchedule(item.id)}
                  >
                    <Icon name="minus-circle" size={24} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleLabel}>Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={item.time}
                  onChangeText={(time) => updateScheduleTime(item.id, time)}
                  placeholder="HH:MM"
                />
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleScheduleEnabled(item.id)}
                />
              </View>

              <Text style={styles.scheduleLabel}>Days:</Text>
              <View style={styles.daysContainer}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      item.daysOfWeek.includes(day) && styles.selectedDayButton,
                    ]}
                    onPress={() => toggleScheduleDay(item.id, day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        item.daysOfWeek.includes(day) && styles.selectedDayButtonText,
                      ]}
                    >
                      {getDayAbbreviation(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addSchedule}
          >
            <Icon name="plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Time</Text>
          </TouchableOpacity>
        </View>

        {/* Refill Information */}
        <View style={styles.inputGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Refill Reminder</Text>
            <Switch
              value={refillReminder}
              onValueChange={setRefillReminder}
            />
          </View>

          {refillReminder && (
            <View style={styles.refillDateContainer}>
              <Text style={styles.label}>Refill Date</Text>
              <TextInput
                style={styles.input}
                value={refillDate}
                onChangeText={setRefillDate}
                placeholder="MM/DD/YYYY"
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#333',
  },
  scheduleSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  scheduleItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  selectedDayButton: {
    backgroundColor: '#4caf50',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDayButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refillDateContainer: {
    marginTop: 16,
  },
});

export default AddMedicationScreen; 