import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  MedicationDetailScreenNavigationProp, 
  MedicationDetailScreenRouteProp 
} from '../types/navigation';
import { useMedicationStore } from '../services/MedicationStore';

const MedicationDetailScreen = () => {
  const navigation = useNavigation<MedicationDetailScreenNavigationProp>();
  const route = useRoute<MedicationDetailScreenRouteProp>();
  const { medications, deleteMedication } = useMedicationStore();
  
  // Get the medication ID from route params
  const { medicationId } = route.params;
  
  // Find the medication in the store
  const medication = medications.find(med => med.id === medicationId);
  
  // If medication not found, show an error and go back
  if (!medication) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Medication not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (time: string) => {
    return time;
  };
  
  // Handle edit medication
  const handleEdit = () => {
    navigation.navigate('EditMedication', { medicationId });
  };
  
  // Handle delete medication
  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${medication.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMedication(medicationId);
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  // Render days of week
  const renderDaysOfWeek = (days: number[]) => {
    const daysAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => daysAbbr[day]).join(', ');
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
        <Text style={styles.headerTitle}>Medication Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEdit}
          >
            <Icon name="pencil" size={24} color="#2196f3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
          >
            <Icon name="delete" size={24} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.medicationHeader, { backgroundColor: medication.color }]}>
          <View style={styles.iconContainer}>
            <Icon name="pill" size={60} color="white" />
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationDosage}>{medication.dosage}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {medication.schedule.map((schedule, index) => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTime}>{formatTime(schedule.time)}</Text>
                <View style={[styles.statusBadge, schedule.enabled ? styles.activeStatus : styles.inactiveStatus]}>
                  <Text style={styles.statusText}>{schedule.enabled ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
              <Text style={styles.scheduleDays}>
                {renderDaysOfWeek(schedule.daysOfWeek)}
              </Text>
            </View>
          ))}
        </View>
        
        {medication.instructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{medication.instructions}</Text>
          </View>
        ) : null}
        
        {medication.refillReminder && medication.refillDate ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refill Information</Text>
            <View style={styles.refillInfo}>
              <Icon name="calendar-refresh" size={24} color="#666" style={styles.refillIcon} />
              <Text style={styles.refillDate}>
                Refill Date: {formatDate(medication.refillDate)}
              </Text>
            </View>
          </View>
        ) : null}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(medication.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(medication.updatedAt)}</Text>
          </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 18,
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scheduleItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  scheduleDays: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#e8f5e9',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  refillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refillIcon: {
    marginRight: 8,
  },
  refillDate: {
    fontSize: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default MedicationDetailScreen; 