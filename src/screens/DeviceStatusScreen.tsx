import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useBluetoothManager } from '../hooks/useBluetoothManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DeviceStatusScreen = () => {
  const [showPairDeviceModal, setShowPairDeviceModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { 
    connectedDevice,
    connectionState,
    batteryLevel,
    isLocked,
    disconnect,
    toggleLockState,
    discoveredDevices,
    isScanning,
    startScanning,
    stopScanning,
    connect
  } = useBluetoothManager();

  // Handle toggling lock state
  const handleToggleLock = () => {
    Alert.alert(
      'Confirm Action',
      isLocked 
        ? 'Are you sure you want to unlock the medication cap?' 
        : 'Are you sure you want to lock the medication cap?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isLocked ? 'Unlock' : 'Lock',
          style: 'destructive',
          onPress: toggleLockState,
        },
      ],
    );
  };

  // Helper computed property for battery icon
  const getBatteryIcon = () => {
    if (batteryLevel <= 10) {
      return 'battery-10';
    } else if (batteryLevel <= 25) {
      return 'battery-20';
    } else if (batteryLevel <= 50) {
      return 'battery-50';
    } else if (batteryLevel <= 75) {
      return 'battery-70';
    } else {
      return 'battery';
    }
  };

  // Helper computed property for battery color
  const getBatteryColor = () => {
    if (batteryLevel <= 20) {
      return '#FF3B30';
    } else if (batteryLevel <= 40) {
      return '#FF9500';
    } else {
      return '#4CD964';
    }
  };

  // Helper computed property for battery status text
  const getBatteryStatusText = () => {
    if (batteryLevel <= 10) {
      return 'Critically Low - Charge Now';
    } else if (batteryLevel <= 20) {
      return 'Low Battery - Charge Soon';
    } else if (batteryLevel <= 40) {
      return 'Battery OK';
    } else if (batteryLevel <= 70) {
      return 'Battery Good';
    } else {
      return 'Battery Excellent';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {connectedDevice ? (
        <View style={styles.contentContainer}>
          <View style={styles.deviceInfoContainer}>
            <Icon name="pill" size={80} color="#007AFF" />
            <Text style={styles.deviceName}>{connectedDevice.name || 'MedCap Device'}</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{connectionState}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Battery Status</Text>
            <View style={styles.statusCard}>
              <Icon name={getBatteryIcon()} size={30} color={getBatteryColor()} />
              <View style={styles.statusDetails}>
                <Text style={styles.statusValue}>{batteryLevel}%</Text>
                <Text style={styles.statusDescription}>{getBatteryStatusText()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lock Status</Text>
            <View style={styles.statusCard}>
              <Icon 
                name={isLocked ? 'lock' : 'lock-open'} 
                size={30} 
                color={isLocked ? '#007AFF' : '#4CD964'} 
              />
              <View style={styles.statusDetails}>
                <Text style={styles.statusValue}>{isLocked ? 'Locked' : 'Unlocked'}</Text>
                <Text style={styles.statusDescription}>
                  {isLocked ? 'Medication access is restricted' : 'Medication is accessible'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleToggleLock}
            activeOpacity={0.7}
          >
            <Icon 
              name={isLocked ? 'lock-open' : 'lock'} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {isLocked ? 'Unlock Cap' : 'Lock Cap'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.disconnectButton]} 
            onPress={disconnect}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noDeviceContainer}>
          <Icon name="pill-off" size={80} color="#999" />
          <Text style={styles.noDeviceTitle}>No Device Connected</Text>
          <Text style={styles.noDeviceText}>
            Pair your MedCap device to monitor battery level, lock status, and control access.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPairDeviceModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Pair Device</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This application is a wellness and convenience aid only, not a medical device. 
          It is not intended to diagnose, treat, cure, or prevent any disease. Always follow 
          your healthcare provider's instructions and contact them with any medical concerns.
        </Text>
      </View>

      {/* Pair Device Modal */}
      <Modal
        visible={showPairDeviceModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPairDeviceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pair Device</Text>
            <TouchableOpacity onPress={() => {
              setShowPairDeviceModal(false);
              stopScanning();
            }}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {discoveredDevices.length === 0 ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.scanningText}>Scanning for MedCap devices...</Text>
              <Text style={styles.scanningHint}>
                Make sure your device is powered on and nearby
              </Text>
            </View>
          ) : (
            <View style={styles.deviceListContainer}>
              <Text style={styles.deviceListTitle}>Available Devices</Text>
              <FlatList
                data={discoveredDevices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.deviceListItem}
                    onPress={() => {
                      connect(item);
                      setShowPairDeviceModal(false);
                    }}
                  >
                    <Icon name="pill" size={24} color="#007AFF" />
                    <Text style={styles.deviceListItemName}>{item.name || 'Unknown Device'}</Text>
                    <Icon name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={startScanning}
                disabled={isScanning}
              >
                <Text style={styles.rescanButtonText}>
                  {isScanning ? 'Scanning...' : 'Scan Again'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.scanningHint}>
                If your device isn't shown, make sure it's powered on and in pairing mode.
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  deviceInfoContainer: {
    backgroundColor: '#eef6ff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#222',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CD964',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statusDetails: {
    marginLeft: 16,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
  },
  noDeviceContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  noDeviceTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  noDeviceText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  disclaimerContainer: {
    backgroundColor: '#fffde6',
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  scanningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    color: '#333',
  },
  scanningHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  deviceListContainer: {
    padding: 16,
  },
  deviceListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  deviceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  deviceListItemName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  rescanButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  rescanButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DeviceStatusScreen; 