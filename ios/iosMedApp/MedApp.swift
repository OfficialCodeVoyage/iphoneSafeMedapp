import SwiftUI

@main
struct MedApp: App {
    @StateObject private var bluetoothManager = BluetoothManager()
    @StateObject private var notificationManager = NotificationManager()
    @StateObject private var medicationStore = MedicationStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(bluetoothManager)
                .environmentObject(notificationManager)
                .environmentObject(medicationStore)
                .onAppear {
                    notificationManager.requestAuthorization()
                    bluetoothManager.startScanning()
                }
        }
    }
} 