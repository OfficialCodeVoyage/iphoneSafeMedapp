import Foundation
import UserNotifications
import Combine

class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    @Published var isAuthorized = false
    @Published var pendingNotifications: [UNNotificationRequest] = []
    
    private var notificationCenter = UNUserNotificationCenter.current()
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        super.init()
        notificationCenter.delegate = self
        checkAuthorization()
        
        NotificationCenter.default.publisher(for: Notification.Name("RescheduleNotifications"))
            .sink { [weak self] _ in
                self?.updateScheduledNotifications()
            }
            .store(in: &cancellables)
    }
    
    func requestAuthorization() {
        notificationCenter.requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, error in
            DispatchQueue.main.async {
                self?.isAuthorized = granted
                if granted {
                    self?.updateScheduledNotifications()
                }
            }
        }
    }
    
    func updateScheduledNotifications() {
        guard isAuthorized else { return }
        
        // First remove all pending notifications
        notificationCenter.removeAllPendingNotificationRequests()
        
        // This would access the MedicationStore to get medication schedules
        // and schedule notifications based on those
        fetchPendingNotifications()
    }
    
    func scheduleNotification(for medication: Medication, schedule: MedicationSchedule, settings: NotificationSettings) {
        guard isAuthorized, settings.enabled else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Time for your medication"
        content.body = "It's time to take \(medication.name) - \(medication.dosage)"
        content.sound = settings.soundEnabled ? .default : nil
        
        // Create a calendar-based trigger
        let dateComponents = Calendar.current.dateComponents([.hour, .minute], from: schedule.timeOfDay)
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        // Create a request with a unique identifier
        let requestIdentifier = "\(medication.id)-\(schedule.id)"
        let request = UNNotificationRequest(identifier: requestIdentifier, content: content, trigger: trigger)
        
        // Add the notification request
        notificationCenter.add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error.localizedDescription)")
            }
        }
        
        // If reminder is enabled, schedule a reminder before the medication window
        if settings.reminderMinutesBefore > 0 {
            let reminderContent = UNMutableNotificationContent()
            reminderContent.title = "Upcoming Medication"
            reminderContent.body = "Reminder: \(medication.name) is scheduled in \(settings.reminderMinutesBefore) minutes"
            reminderContent.sound = settings.soundEnabled ? .default : nil
            
            var reminderComponents = dateComponents
            if let hour = dateComponents.hour, let minute = dateComponents.minute {
                let reminderDate = Calendar.current.date(bySettingHour: hour, minute: minute, second: 0, of: Date()) ?? Date()
                let adjustedDate = Calendar.current.date(byAdding: .minute, value: -settings.reminderMinutesBefore, to: reminderDate) ?? reminderDate
                reminderComponents = Calendar.current.dateComponents([.hour, .minute], from: adjustedDate)
            }
            
            let reminderTrigger = UNCalendarNotificationTrigger(dateMatching: reminderComponents, repeats: true)
            let reminderRequest = UNNotificationRequest(identifier: "\(requestIdentifier)-reminder", content: reminderContent, trigger: reminderTrigger)
            
            notificationCenter.add(reminderRequest) { error in
                if let error = error {
                    print("Error scheduling reminder notification: \(error.localizedDescription)")
                }
            }
        }
    }
    
    func fetchPendingNotifications() {
        notificationCenter.getPendingNotificationRequests { [weak self] requests in
            DispatchQueue.main.async {
                self?.pendingNotifications = requests
            }
        }
    }
    
    private func checkAuthorization() {
        notificationCenter.getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                self?.isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show the notification even when the app is in the foreground
        completionHandler([.badge, .sound, .banner])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // Parse the notification identifier to get medication and schedule IDs
        let identifier = response.notification.request.identifier
        let components = identifier.split(separator: "-").map(String.init)
        
        if components.count >= 2, let medicationId = UUID(uuidString: components[0]), let scheduleId = UUID(uuidString: components[1]) {
            if response.actionIdentifier == UNNotificationDefaultActionIdentifier {
                // User tapped the notification
                // We would navigate to the specific medication in the app
                NotificationCenter.default.post(
                    name: Notification.Name("NavigateToMedication"),
                    object: nil,
                    userInfo: ["medicationId": medicationId, "scheduleId": scheduleId]
                )
            }
        }
        
        completionHandler()
    }
} 