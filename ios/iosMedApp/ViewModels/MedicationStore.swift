import Foundation
import Combine

class MedicationStore: ObservableObject {
    @Published var medications: [Medication] = []
    @Published var notificationSettings = NotificationSettings()
    
    private let medicationsKey = "medications"
    private let notificationSettingsKey = "notificationSettings"
    
    init() {
        loadMedications()
        loadNotificationSettings()
    }
    
    // MARK: - Medication Management
    
    func addMedication(_ medication: Medication) {
        medications.append(medication)
        saveMedications()
        scheduleNotifications()
    }
    
    func updateMedication(_ medication: Medication) {
        if let index = medications.firstIndex(where: { $0.id == medication.id }) {
            medications[index] = medication
            saveMedications()
            scheduleNotifications()
        }
    }
    
    func deleteMedication(at indexSet: IndexSet) {
        medications.remove(atOffsets: indexSet)
        saveMedications()
        scheduleNotifications()
    }
    
    func markMedicationTaken(medicationId: UUID, scheduleId: UUID) {
        if let medIndex = medications.firstIndex(where: { $0.id == medicationId }),
           let scheduleIndex = medications[medIndex].schedules.firstIndex(where: { $0.id == scheduleId }) {
            medications[medIndex].schedules[scheduleIndex].taken = true
            medications[medIndex].schedules[scheduleIndex].lastTakenDate = Date()
            saveMedications()
        }
    }
    
    // MARK: - Schedule Management
    
    func resetDailySchedules() {
        // Reset taken status for all schedules at midnight
        for medIndex in 0..<medications.count {
            for scheduleIndex in 0..<medications[medIndex].schedules.count {
                medications[medIndex].schedules[scheduleIndex].taken = false
            }
        }
        saveMedications()
        scheduleNotifications()
    }
    
    // MARK: - Notification Settings
    
    func updateNotificationSettings(_ settings: NotificationSettings) {
        notificationSettings = settings
        saveNotificationSettings()
        scheduleNotifications()
    }
    
    // MARK: - Private Methods
    
    private func scheduleNotifications() {
        // This would be implemented to coordinate with NotificationManager
        // to schedule notifications based on medications and settings
        NotificationCenter.default.post(name: Notification.Name("RescheduleNotifications"), object: nil)
    }
    
    private func saveMedications() {
        if let encoded = try? JSONEncoder().encode(medications) {
            UserDefaults.standard.set(encoded, forKey: medicationsKey)
        }
    }
    
    private func loadMedications() {
        if let data = UserDefaults.standard.data(forKey: medicationsKey),
           let decoded = try? JSONDecoder().decode([Medication].self, from: data) {
            medications = decoded
        }
    }
    
    private func saveNotificationSettings() {
        if let encoded = try? JSONEncoder().encode(notificationSettings) {
            UserDefaults.standard.set(encoded, forKey: notificationSettingsKey)
        }
    }
    
    private func loadNotificationSettings() {
        if let data = UserDefaults.standard.data(forKey: notificationSettingsKey),
           let decoded = try? JSONDecoder().decode(NotificationSettings.self, from: data) {
            notificationSettings = decoded
        }
    }
} 