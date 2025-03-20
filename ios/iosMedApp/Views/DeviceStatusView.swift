import SwiftUI
import CoreBluetooth

struct DeviceStatusView: View {
    @EnvironmentObject var bluetoothManager: BluetoothManager
    @State private var showingPairDeviceSheet = false
    @State private var showingConfirmationDialog = false
    @State private var isScanning = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    if bluetoothManager.connectedDevice != nil {
                        connectedDeviceView
                    } else {
                        noDeviceView
                    }
                    
                    disclaimerView
                }
                .padding()
            }
            .navigationTitle("Device")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if bluetoothManager.connectedDevice != nil {
                        Button(action: {
                            bluetoothManager.disconnect()
                        }) {
                            Text("Disconnect")
                                .foregroundColor(.red)
                        }
                    } else {
                        Button(action: {
                            showingPairDeviceSheet = true
                        }) {
                            Text("Pair Device")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingPairDeviceSheet) {
                PairDeviceView(isPresented: $showingPairDeviceSheet)
            }
            .alert(isPresented: $showingConfirmationDialog) {
                Alert(
                    title: Text("Confirm Action"),
                    message: Text(bluetoothManager.isLocked ? "Are you sure you want to unlock the medication cap?" : "Are you sure you want to lock the medication cap?"),
                    primaryButton: .destructive(Text(bluetoothManager.isLocked ? "Unlock" : "Lock")) {
                        bluetoothManager.toggleLockState()
                    },
                    secondaryButton: .cancel()
                )
            }
        }
    }
    
    private var connectedDeviceView: some View {
        VStack(spacing: 20) {
            // Device image and connection status
            VStack {
                Image(systemName: "pill.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text(bluetoothManager.connectedDevice?.name ?? "MedCap Device")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                HStack {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 10, height: 10)
                    
                    Text(bluetoothManager.connectionState.rawValue)
                        .font(.subheadline)
                }
                .padding(.top, 4)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue.opacity(0.1))
            .cornerRadius(12)
            
            // Battery status
            VStack(alignment: .leading, spacing: 8) {
                Text("Battery Status")
                    .font(.headline)
                
                HStack(spacing: 16) {
                    Image(systemName: batteryIcon)
                        .font(.system(size: 30))
                        .foregroundColor(batteryColor)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(bluetoothManager.batteryLevel)%")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text(batteryStatusText)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
            
            // Lock status
            VStack(alignment: .leading, spacing: 8) {
                Text("Lock Status")
                    .font(.headline)
                
                HStack(spacing: 16) {
                    Image(systemName: bluetoothManager.isLocked ? "lock.fill" : "lock.open.fill")
                        .font(.system(size: 30))
                        .foregroundColor(bluetoothManager.isLocked ? .blue : .green)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(bluetoothManager.isLocked ? "Locked" : "Unlocked")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text(bluetoothManager.isLocked ? "Medication access is restricted" : "Medication is accessible")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
            
            // Manual override button
            Button(action: {
                showingConfirmationDialog = true
            }) {
                HStack {
                    Image(systemName: bluetoothManager.isLocked ? "lock.open.fill" : "lock.fill")
                    Text(bluetoothManager.isLocked ? "Unlock Cap" : "Lock Cap")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
        }
    }
    
    private var noDeviceView: some View {
        VStack(spacing: 20) {
            Image(systemName: "pill.circle")
                .font(.system(size: 80))
                .foregroundColor(.gray)
            
            Text("No Device Connected")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Pair your MedCap device to monitor battery level, lock status, and control access.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            Button(action: {
                showingPairDeviceSheet = true
            }) {
                Text("Pair Device")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.top, 10)
            
            if isScanning {
                ProgressView("Scanning for devices...")
                    .padding(.top, 20)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
    
    private var disclaimerView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Disclaimer")
                .font(.headline)
            
            Text("This application is a wellness and convenience aid only, not a medical device. It is not intended to diagnose, treat, cure, or prevent any disease. Always follow your healthcare provider's instructions and contact them with any medical concerns.")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.yellow.opacity(0.1))
        .cornerRadius(12)
    }
    
    // Helper computed properties for battery status
    private var batteryIcon: String {
        let level = bluetoothManager.batteryLevel
        
        if level <= 10 {
            return "battery.0"
        } else if level <= 25 {
            return "battery.25"
        } else if level <= 50 {
            return "battery.50"
        } else if level <= 75 {
            return "battery.75"
        } else {
            return "battery.100"
        }
    }
    
    private var batteryColor: Color {
        let level = bluetoothManager.batteryLevel
        
        if level <= 20 {
            return .red
        } else if level <= 40 {
            return .orange
        } else {
            return .green
        }
    }
    
    private var batteryStatusText: String {
        let level = bluetoothManager.batteryLevel
        
        if level <= 10 {
            return "Critically Low - Charge Now"
        } else if level <= 20 {
            return "Low Battery - Charge Soon"
        } else if level <= 40 {
            return "Battery OK"
        } else if level <= 70 {
            return "Battery Good"
        } else {
            return "Battery Excellent"
        }
    }
}

struct PairDeviceView: View {
    @Binding var isPresented: Bool
    @EnvironmentObject var bluetoothManager: BluetoothManager
    @State private var selectedDevice: CBPeripheral?
    
    var body: some View {
        NavigationView {
            VStack {
                if bluetoothManager.discoveredDevices.isEmpty {
                    VStack(spacing: 20) {
                        ProgressView()
                            .padding()
                        
                        Text("Scanning for MedCap devices...")
                            .foregroundColor(.secondary)
                        
                        Text("Make sure your device is powered on and nearby")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    List {
                        Section(header: Text("Available Devices")) {
                            ForEach(bluetoothManager.discoveredDevices, id: \.identifier) { device in
                                Button(action: {
                                    selectedDevice = device
                                    bluetoothManager.connect(to: device)
                                    isPresented = false
                                }) {
                                    HStack {
                                        Image(systemName: "pill.circle")
                                            .foregroundColor(.blue)
                                        
                                        Text(device.name ?? "Unknown Device")
                                            .foregroundColor(.primary)
                                        
                                        Spacer()
                                        
                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                        
                        Section(footer: Text("If your device isn't shown, make sure it's powered on and in pairing mode.")) {
                            Button(action: {
                                bluetoothManager.startScanning()
                            }) {
                                HStack {
                                    Spacer()
                                    Text(bluetoothManager.isScanning ? "Scanning..." : "Scan Again")
                                        .foregroundColor(.blue)
                                    Spacer()
                                }
                            }
                            .disabled(bluetoothManager.isScanning)
                        }
                    }
                }
            }
            .navigationTitle("Pair Device")
            .navigationBarItems(trailing: Button("Cancel") {
                isPresented = false
            })
            .onAppear {
                bluetoothManager.startScanning()
            }
            .onDisappear {
                bluetoothManager.stopScanning()
            }
        }
    }
}

struct DeviceStatusView_Previews: PreviewProvider {
    static var previews: some View {
        let bluetoothManager = BluetoothManager()
        // For testing connected state
        //bluetoothManager.connectionState = .connected
        //bluetoothManager.batteryLevel = 75
        
        return DeviceStatusView()
            .environmentObject(bluetoothManager)
    }
} 