import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMedicationStore } from '../hooks/useMedicationStore';
import { useBluetoothManager } from '../hooks/useBluetoothManager';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { medications, toggleMedicationTaken } = useMedicationStore();
  const { connectedDevice, batteryLevel } = useBluetoothManager();
  
  const [todaysMedications, setTodaysMedications] = useState<any[]>([]);
  const [upcomingMedication, setUpcomingMedication] = useState<any | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    upcoming: 0,
  });

  // Get current date info
  const now = new Date();
  const currentDay = now.getDay(); // 0-6 (Sunday to Saturday)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Calculate medications for today and upcoming
  useEffect(() => {
    if (!medications || medications.length === 0) return;

    const todayItems: any[] = [];
    let nextMedication = null;
    let closestTime = Infinity;
    
    let totalToday = 0;
    let takenToday = 0;
    let missedToday = 0;
    let upcomingToday = 0;

    // Process medications
    medications.forEach(medication => {
      medication.schedule.forEach(schedule => {
        // Check if schedule is for today
        if (schedule.enabled && schedule.daysOfWeek.includes(currentDay)) {
          totalToday++;
          
          // Parse schedule time
          const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
          const scheduleMinutes = scheduleHour * 60 + scheduleMinute;
          const currentMinutes = currentHour * 60 + currentMinute;
          
          // Create schedule item
          const scheduleItem = {
            id: `${medication.id}-${schedule.id}`,
            medicationId: medication.id,
            scheduleId: schedule.id,
            name: medication.name,
            dosage: medication.dosage,
            time: schedule.time,
            color: medication.color,
            taken: schedule.taken && schedule.taken[currentDay],
            instructions: medication.instructions,
            timeInMinutes: scheduleMinutes,
          };
          
          // Determine if taken, missed, or upcoming
          if (scheduleItem.taken) {
            takenToday++;
          } else if (scheduleMinutes < currentMinutes) {
            missedToday++;
            scheduleItem.status = 'missed';
          } else {
            upcomingToday++;
            scheduleItem.status = 'upcoming';
            
            // Check if this is the next medication
            const timeDiff = scheduleMinutes - currentMinutes;
            if (timeDiff > 0 && timeDiff < closestTime) {
              closestTime = timeDiff;
              nextMedication = scheduleItem;
            }
          }
          
          todayItems.push(scheduleItem);
        }
      });
    });
    
    // Sort by time
    todayItems.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
    
    // Update state
    setTodaysMedications(todayItems);
    setUpcomingMedication(nextMedication);
    setStats({
      total: totalToday,
      taken: takenToday,
      missed: missedToday,
      upcoming: upcomingToday,
    });
  }, [medications, currentDay]);

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Handle taking medication
  const handleTakeMedication = (medicationId: string, scheduleId: string) => {
    console.log('Taking medication:', medicationId, scheduleId);
    toggleMedicationTaken(medicationId, scheduleId, currentDay);
    
    // Show confirmation alert
    Alert.alert(
      'Medication Taken',
      'Great job! Your medication has been marked as taken.',
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.date}>
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedication' as never)}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Device Status Card */}
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => navigation.navigate('DeviceTab' as never)}
      >
        <View style={styles.deviceHeader}>
          <Text style={styles.cardTitle}>Smart Device</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </View>
        
        <View style={styles.deviceStatus}>
          <View style={styles.deviceStatusItem}>
            <Icon 
              name={connectedDevice ? "bluetooth-connect" : "bluetooth-off"} 
              size={24} 
              color={connectedDevice ? "#4caf50" : "#999"}
            />
            <Text style={styles.deviceStatusText}>
              {connectedDevice ? "Connected" : "Disconnected"}
            </Text>
          </View>
          
          {connectedDevice && (
            <>
              <View style={styles.deviceStatusItem}>
                <Icon 
                  name={batteryLevel > 20 ? "battery" : "battery-alert"} 
                  size={24} 
                  color={batteryLevel > 20 ? "#4caf50" : "#f44336"}
                />
                <Text style={styles.deviceStatusText}>
                  {batteryLevel}% Battery
                </Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{stats.taken}</Text>
            <Text style={styles.statsLabel}>Taken</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{stats.missed}</Text>
            <Text style={styles.statsLabel}>Missed</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{stats.upcoming}</Text>
            <Text style={styles.statsLabel}>Upcoming</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{stats.total}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Next Medication Card */}
      {upcomingMedication && (
        <View style={styles.nextMedicationCard}>
          <Text style={styles.cardTitle}>Next Medication</Text>
          <View style={styles.nextMedicationContent}>
            <View style={[styles.colorIndicator, { backgroundColor: upcomingMedication.color || '#4caf50' }]} />
            <View style={styles.nextMedicationInfo}>
              <Text style={styles.nextMedicationName}>{upcomingMedication.name}</Text>
              <Text style={styles.nextMedicationDosage}>{upcomingMedication.dosage}</Text>
              <Text style={styles.nextMedicationTime}>
                {formatTime(upcomingMedication.time)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.takeButton}
              onPress={() => handleTakeMedication(upcomingMedication.medicationId, upcomingMedication.scheduleId)}
            >
              <Text style={styles.takeButtonText}>Take</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Medications */}
      <View style={styles.medicationsCard}>
        <View style={styles.medicationsHeader}>
          <Text style={styles.cardTitle}>Today's Medications</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ScheduleTab' as never)}
          >
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {todaysMedications.length > 0 ? (
          <FlatList
            data={todaysMedications}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.medicationItem}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color || '#4caf50' }]} />
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{item.name}</Text>
                  <Text style={styles.medicationDosage}>{item.dosage}</Text>
                  <Text 
                    style={[
                      styles.medicationTime,
                      item.status === 'missed' && styles.missedText,
                    ]}
                  >
                    {formatTime(item.time)} · {item.taken ? 'Taken' : item.status === 'missed' ? 'Missed' : 'Upcoming'}
                  </Text>
                </View>
                {!item.taken && (
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      item.status === 'missed' && styles.missedButton
                    ]}
                    onPress={() => handleTakeMedication(item.medicationId, item.scheduleId)}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.status === 'missed' ? 'Missed' : 'Take'}
                    </Text>
                  </TouchableOpacity>
                )}
                {item.taken && (
                  <View style={styles.takenIndicator}>
                    <Icon name="check" size={16} color="white" />
                  </View>
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="pill" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No medications scheduled for today</Text>
          </View>
        )}
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
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4caf50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deviceStatusItem: {
    alignItems: 'center',
  },
  deviceStatusText: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  nextMedicationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nextMedicationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  nextMedicationInfo: {
    flex: 1,
  },
  nextMedicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextMedicationDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  nextMedicationTime: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 4,
    fontWeight: '500',
  },
  takeButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  medicationsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '500',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  medicationTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  missedText: {
    color: '#f44336',
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  missedButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  takenIndicator: {
    backgroundColor: '#4caf50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 8,
    color: '#888',
    textAlign: 'center',
  },
});

export default HomeScreen; 