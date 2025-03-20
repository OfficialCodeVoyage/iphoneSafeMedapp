import Foundation

struct Medication: Identifiable, Codable {
    var id = UUID()
    var name: String
    var dosage: String
    var schedules: [MedicationSchedule]
    var color: String = "blue"
    var isActive: Bool = true
}

struct MedicationSchedule: Identifiable, Codable {
    var id = UUID()
    var timeOfDay: Date
    var windowStart: Date
    var windowEnd: Date
    var taken: Bool = false
    var lastTakenDate: Date?
    
    var isAvailable: Bool {
        guard !taken else { return false }
        
        let now = Date()
        return now >= windowStart && now <= windowEnd
    }
    
    var isOverdue: Bool {
        guard !taken else { return false }
        
        let now = Date()
        return now > windowEnd
    }
    
    var timeRemainingText: String {
        if taken {
            return "Taken"
        }
        
        let now = Date()
        if now < windowStart {
            let formatter = DateComponentsFormatter()
            formatter.allowedUnits = [.hour, .minute]
            formatter.unitsStyle = .abbreviated
            
            if let timeString = formatter.string(from: now, to: windowStart) {
                return "Available in \(timeString)"
            }
        } else if now <= windowEnd {
            let formatter = DateComponentsFormatter()
            formatter.allowedUnits = [.hour, .minute]
            formatter.unitsStyle = .abbreviated
            
            if let timeString = formatter.string(from: now, to: windowEnd) {
                return "Available for \(timeString)"
            }
        } else {
            return "Overdue"
        }
        
        return "Unknown"
    }
}

struct NotificationSettings: Codable {
    var enabled: Bool = true
    var soundEnabled: Bool = true
    var vibrationEnabled: Bool = true
    var reminderMinutesBefore: Int = 15
    var selectedSoundName: String = "default"
} 