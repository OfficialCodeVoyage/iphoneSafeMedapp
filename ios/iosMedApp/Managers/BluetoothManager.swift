import Foundation
import CoreBluetooth
import Combine

class BluetoothManager: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published var isScanning = false
    @Published var connectedDevice: CBPeripheral?
    @Published var discoveredDevices: [CBPeripheral] = []
    @Published var connectionState: ConnectionState = .disconnected
    @Published var batteryLevel: Int = 0
    @Published var isLocked: Bool = true
    
    // MARK: - Private Properties
    private var centralManager: CBCentralManager!
    private var batteryCharacteristic: CBCharacteristic?
    private var lockCharacteristic: CBCharacteristic?
    
    // Service and characteristic UUIDs
    private let medCapServiceUUID = CBUUID(string: "5F1E0000-8D53-11E9-9669-0800200C9A66")
    private let batteryServiceUUID = CBUUID(string: "180F")
    private let batteryLevelCharacteristicUUID = CBUUID(string: "2A19")
    private let lockStateCharacteristicUUID = CBUUID(string: "5F1E0001-8D53-11E9-9669-0800200C9A66")
    
    // MARK: - Initialization
    
    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }
    
    // MARK: - Public Methods
    
    func startScanning() {
        guard centralManager.state == .poweredOn else { return }
        
        isScanning = true
        discoveredDevices.removeAll()
        
        // Scan for devices with our specific service
        centralManager.scanForPeripherals(withServices: [medCapServiceUUID], options: nil)
        
        // Stop scanning after 10 seconds to save battery
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
            self?.stopScanning()
        }
    }
    
    func stopScanning() {
        centralManager.stopScan()
        isScanning = false
    }
    
    func connect(to peripheral: CBPeripheral) {
        connectionState = .connecting
        centralManager.connect(peripheral, options: nil)
    }
    
    func disconnect() {
        if let peripheral = connectedDevice {
            centralManager.cancelPeripheralConnection(peripheral)
        }
    }
    
    func toggleLockState() {
        guard let peripheral = connectedDevice,
              let characteristic = lockCharacteristic else {
            return
        }
        
        // Toggle lock state (0 = unlocked, 1 = locked)
        let value = isLocked ? Data([0]) : Data([1])
        peripheral.writeValue(value, for: characteristic, type: .withResponse)
    }
    
    // MARK: - Helper Methods
    
    private func discoverServices() {
        guard let peripheral = connectedDevice else { return }
        peripheral.discoverServices([medCapServiceUUID, batteryServiceUUID])
    }
}

// MARK: - CBCentralManagerDelegate

extension BluetoothManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            print("Bluetooth is powered on")
            if isScanning {
                startScanning()
            }
        case .poweredOff:
            print("Bluetooth is powered off")
            connectionState = .disconnected
            isScanning = false
        case .resetting:
            print("Bluetooth is resetting")
        case .unauthorized:
            print("Bluetooth is unauthorized")
        case .unsupported:
            print("Bluetooth is unsupported")
        case .unknown:
            print("Bluetooth state is unknown")
        @unknown default:
            print("Unknown Bluetooth state")
        }
    }
    
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        if !discoveredDevices.contains(where: { $0.identifier == peripheral.identifier }) {
            discoveredDevices.append(peripheral)
        }
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        connectionState = .connected
        connectedDevice = peripheral
        peripheral.delegate = self
        discoverServices()
    }
    
    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        connectionState = .failed
        print("Failed to connect to \(peripheral). Error: \(error?.localizedDescription ?? "Unknown error")")
    }
    
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        connectionState = .disconnected
        connectedDevice = nil
        
        // Try to reconnect if disconnection was unexpected
        if let error = error {
            print("Disconnected from \(peripheral) with error: \(error.localizedDescription)")
            // Attempt to reconnect
            connect(to: peripheral)
        } else {
            print("Disconnected from \(peripheral) successfully")
        }
    }
}

// MARK: - CBPeripheralDelegate

extension BluetoothManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error = error {
            print("Error discovering services: \(error.localizedDescription)")
            return
        }
        
        guard let services = peripheral.services else { return }
        
        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error = error {
            print("Error discovering characteristics: \(error.localizedDescription)")
            return
        }
        
        guard let characteristics = service.characteristics else { return }
        
        for characteristic in characteristics {
            if characteristic.uuid == batteryLevelCharacteristicUUID {
                batteryCharacteristic = characteristic
                peripheral.readValue(for: characteristic)
                // Subscribe to battery level updates
                peripheral.setNotifyValue(true, for: characteristic)
            } else if characteristic.uuid == lockStateCharacteristicUUID {
                lockCharacteristic = characteristic
                peripheral.readValue(for: characteristic)
                // Subscribe to lock state updates
                peripheral.setNotifyValue(true, for: characteristic)
            }
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error = error {
            print("Error updating value for characteristic: \(error.localizedDescription)")
            return
        }
        
        if characteristic.uuid == batteryLevelCharacteristicUUID, let data = characteristic.value {
            if data.count > 0 {
                batteryLevel = Int(data[0])
            }
        } else if characteristic.uuid == lockStateCharacteristicUUID, let data = characteristic.value {
            if data.count > 0 {
                isLocked = data[0] == 1
            }
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error = error {
            print("Error writing value for characteristic: \(error.localizedDescription)")
            return
        }
        
        if characteristic.uuid == lockStateCharacteristicUUID {
            // Read the current lock state to confirm the change took effect
            peripheral.readValue(for: characteristic)
        }
    }
}

// MARK: - ConnectionState Enum

enum ConnectionState: String {
    case disconnected = "Disconnected"
    case connecting = "Connecting..."
    case connected = "Connected"
    case failed = "Connection Failed"
} 