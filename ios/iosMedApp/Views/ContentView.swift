import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(0)
            
            ScheduleView()
                .tabItem {
                    Label("Schedule", systemImage: "calendar")
                }
                .tag(1)
            
            NotificationSettingsView()
                .tabItem {
                    Label("Alerts", systemImage: "bell")
                }
                .tag(2)
            
            DeviceStatusView()
                .tabItem {
                    Label("Device", systemImage: "medicaldevice")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(BluetoothManager())
            .environmentObject(NotificationManager())
            .environmentObject(MedicationStore())
    }
} 