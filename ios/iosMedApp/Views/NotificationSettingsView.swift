import SwiftUI

struct NotificationSettingsView: View {
    @EnvironmentObject var medicationStore: MedicationStore
    @EnvironmentObject var notificationManager: NotificationManager
    
    // Create a local copy of notification settings to edit
    @State private var settings: NotificationSettings
    
    // Available notification sounds
    private let availableSounds = ["default", "alert", "bell", "chime", "glass"]
    
    // Available reminder times in minutes
    private let reminderTimes = [5, 10, 15, 30, 60]
    
    init() {
        // Initialize with default values
        _settings = State(initialValue: NotificationSettings())
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Notifications")) {
                    Toggle("Enable Notifications", isOn: $settings.enabled)
                        .onChange(of: settings.enabled) { newValue in
                            if newValue && !notificationManager.isAuthorized {
                                notificationManager.requestAuthorization()
                            }
                            updateSettings()
                        }
                    
                    if settings.enabled {
                        Toggle("Sound", isOn: $settings.soundEnabled)
                            .onChange(of: settings.soundEnabled) { _ in
                                updateSettings()
                            }
                        
                        Toggle("Vibration", isOn: $settings.vibrationEnabled)
                            .onChange(of: settings.vibrationEnabled) { _ in
                                updateSettings()
                            }
                    }
                }
                
                if settings.enabled {
                    Section(header: Text("Reminder Options")) {
                        Picker("Reminder Before", selection: $settings.reminderMinutesBefore) {
                            ForEach(reminderTimes, id: \.self) { minutes in
                                Text("\(minutes) minutes").tag(minutes)
                            }
                        }
                        .onChange(of: settings.reminderMinutesBefore) { _ in
                            updateSettings()
                        }
                        
                        if settings.soundEnabled {
                            Picker("Notification Sound", selection: $settings.selectedSoundName) {
                                ForEach(availableSounds, id: \.self) { sound in
                                    Text(sound.capitalized).tag(sound)
                                }
                            }
                            .onChange(of: settings.selectedSoundName) { _ in
                                updateSettings()
                            }
                        }
                    }
                    
                    Section(header: Text("Test Notifications")) {
                        Button(action: {
                            sendTestNotification()
                        }) {
                            Text("Send Test Notification")
                        }
                    }
                    
                    Section(header: Text("Scheduled Notifications")) {
                        if notificationManager.pendingNotifications.isEmpty {
                            Text("No notifications scheduled")
                                .foregroundColor(.secondary)
                                .font(.subheadline)
                                .padding(.vertical, 8)
                        } else {
                            Text("\(notificationManager.pendingNotifications.count) notifications scheduled")
                                .font(.subheadline)
                        }
                        
                        Button(action: {
                            notificationManager.fetchPendingNotifications()
                        }) {
                            Text("Refresh")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    Section(header: Text("Authorization Status")) {
                        HStack {
                            Text("Notifications Authorized")
                            Spacer()
                            if notificationManager.isAuthorized {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            } else {
                                Button(action: {
                                    openAppSettings()
                                }) {
                                    Text("Enable in Settings")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                } else {
                    Section {
                        Text("Notifications are required for medication reminders. Enable notifications to receive alerts when it's time to take your medication.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("Notifications")
            .onAppear {
                // Initialize the local settings from the store
                settings = medicationStore.notificationSettings
                
                // Refresh notification status
                notificationManager.fetchPendingNotifications()
            }
        }
    }
    
    private func updateSettings() {
        medicationStore.updateNotificationSettings(settings)
    }
    
    private func sendTestNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Test Notification"
        content.body = "This is a test notification for your medication app"
        if settings.soundEnabled {
            content.sound = .default
        }
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: "testNotification", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error sending test notification: \(error.localizedDescription)")
            }
        }
    }
    
    private func openAppSettings() {
        if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(settingsURL)
        }
    }
}

struct NotificationSettingsView_Previews: PreviewProvider {
    static var previews: some View {
        let store = MedicationStore()
        let notificationManager = NotificationManager()
        
        return NotificationSettingsView()
            .environmentObject(store)
            .environmentObject(notificationManager)
    }
} 