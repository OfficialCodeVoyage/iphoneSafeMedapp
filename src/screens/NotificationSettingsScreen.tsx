import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMedicationStore } from '../hooks/useMedicationStore';
import { useNotificationManager } from '../hooks/useNotificationManager';
import { NotificationSettings } from '../models/MedicationModels';

const NotificationSettingsScreen = () => {
  const { notificationSettings, updateNotificationSettings } = useMedicationStore();
  const { 
    isAuthorized, 
    requestAuthorization, 
    pendingNotifications, 
    fetchPendingNotifications, 
    scheduleTestNotification 
  } = useNotificationManager();

  // Local state for form
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    reminderMinutesBefore: 15,
    selectedSoundName: 'default',
  });

  // Available notification sounds
  const availableSounds = ["default", "alert", "bell", "chime", "glass"];
  
  // Available reminder times in minutes
  const reminderTimes = [5, 10, 15, 30, 60];

  // Update local state when settings change
  useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings]);

  // Handle notifications toggle
  const handleToggleNotifications = (value: boolean) => {
    if (value && !isAuthorized) {
      requestAuthorization();
    }
    const updatedSettings = { ...settings, enabled: value };
    setSettings(updatedSettings);
    updateNotificationSettings(updatedSettings);
  };

  // Handle other setting changes
  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    updateNotificationSettings(updatedSettings);
  };

  // Send test notification
  const handleTestNotification = () => {
    scheduleTestNotification();
    Alert.alert(
      'Test Notification',
      'A test notification will be sent in a few seconds'
    );
  };

  // Open app settings
  const openAppSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
          />
        </View>

        {settings.enabled && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Sound</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => handleSettingChange('soundEnabled', value)}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vibration</Text>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => handleSettingChange('vibrationEnabled', value)}
              />
            </View>
          </>
        )}
      </View>

      {settings.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Options</Text>
            <Text style={styles.label}>Reminder Before</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.reminderMinutesBefore}
                onValueChange={(value) => handleSettingChange('reminderMinutesBefore', value)}
                style={styles.picker}
              >
                {reminderTimes.map(minutes => (
                  <Picker.Item key={minutes} label={`${minutes} minutes`} value={minutes} />
                ))}
              </Picker>
            </View>

            {settings.soundEnabled && (
              <>
                <Text style={styles.label}>Notification Sound</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={settings.selectedSoundName}
                    onValueChange={(value) => handleSettingChange('selectedSoundName', value)}
                    style={styles.picker}
                  >
                    {availableSounds.map(sound => (
                      <Picker.Item key={sound} label={sound.charAt(0).toUpperCase() + sound.slice(1)} value={sound} />
                    ))}
                  </Picker>
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleTestNotification}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
            {pendingNotifications.length === 0 ? (
              <Text style={styles.secondaryText}>No notifications scheduled</Text>
            ) : (
              <Text style={styles.secondaryText}>{pendingNotifications.length} notifications scheduled</Text>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.outlineButton]} 
              onPress={fetchPendingNotifications}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authorization Status</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Notifications Authorized</Text>
              {isAuthorized ? (
                <View style={styles.authorizedIcon}>
                  <Text style={styles.authorizedText}>✓</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.settingsButton} 
                  onPress={openAppSettings}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingsButtonText}>Enable in Settings</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {!settings.enabled && (
        <View style={styles.section}>
          <Text style={styles.secondaryText}>
            Notifications are required for medication reminders. Enable 
            notifications to receive alerts when it's time to take your medication.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  authorizedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CD964',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorizedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default NotificationSettingsScreen; 