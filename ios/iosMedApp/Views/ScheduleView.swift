import SwiftUI

struct ScheduleView: View {
    @EnvironmentObject var medicationStore: MedicationStore
    @State private var selectedDate = Date()
    @State private var showingAddMedication = false
    
    private var calendar = Calendar.current
    
    var body: some View {
        NavigationView {
            VStack {
                dateSelector
                
                if medicationSchedules.isEmpty {
                    emptyStateView
                } else {
                    scheduleListView
                }
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingAddMedication = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddMedication) {
                AddMedicationView()
            }
        }
    }
    
    private var dateSelector: some View {
        VStack {
            HStack {
                Button(action: {
                    withAnimation {
                        selectedDate = calendar.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.blue)
                }
                
                Spacer()
                
                Text(formattedDate(selectedDate))
                    .font(.headline)
                
                Spacer()
                
                Button(action: {
                    withAnimation {
                        selectedDate = calendar.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.blue)
                }
            }
            .padding(.horizontal)
            
            // Calendar week view
            HStack(spacing: 0) {
                ForEach(-3...3, id: \.self) { offset in
                    let date = calendar.date(byAdding: .day, value: offset, to: selectedDate) ?? selectedDate
                    
                    DateButton(date: date, isSelected: calendar.isDate(date, inSameDayAs: selectedDate)) {
                        withAnimation {
                            selectedDate = date
                        }
                    }
                }
            }
            .padding(.vertical, 10)
            
            Divider()
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "calendar.badge.clock")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("No medications scheduled")
                .font(.title2)
                .fontWeight(.medium)
            
            Text("Add medications to view your schedule")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            Button(action: {
                showingAddMedication = true
            }) {
                Text("Add Medication")
                    .fontWeight(.semibold)
                    .padding()
                    .frame(maxWidth: 200)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.top)
        }
        .padding()
        .frame(maxHeight: .infinity)
    }
    
    private var scheduleListView: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(timeSlots, id: \.self) { timeSlot in
                    let schedulesForTime = schedulesAtTime(timeSlot)
                    
                    if !schedulesForTime.isEmpty {
                        VStack(alignment: .leading, spacing: 0) {
                            HStack {
                                Text(formatTime(timeSlot))
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                Spacer()
                            }
                            .padding(.horizontal)
                            .padding(.top, 12)
                            .padding(.bottom, 4)
                            
                            ForEach(schedulesForTime) { scheduleInfo in
                                ScheduleTimeRow(scheduleInfo: scheduleInfo)
                                    .padding(.horizontal)
                                    .padding(.vertical, 8)
                                
                                if scheduleInfo != schedulesForTime.last {
                                    Divider()
                                        .padding(.leading)
                                }
                            }
                        }
                        .background(Color(.systemBackground))
                        .cornerRadius(10)
                        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.vertical)
        }
    }
    
    // Get all medication schedules for the selected date
    private var medicationSchedules: [ScheduleInfo] {
        var schedules: [ScheduleInfo] = []
        
        for medication in medicationStore.medications {
            if medication.isActive {
                for schedule in medication.schedules {
                    let info = ScheduleInfo(
                        id: UUID(),
                        medicationId: medication.id,
                        scheduleId: schedule.id,
                        medicationName: medication.name,
                        dosage: medication.dosage,
                        timeOfDay: schedule.timeOfDay,
                        color: medication.color,
                        taken: schedule.taken,
                        isAvailable: schedule.isAvailable,
                        isOverdue: schedule.isOverdue
                    )
                    schedules.append(info)
                }
            }
        }
        
        return schedules.sorted { $0.timeOfDay < $1.timeOfDay }
    }
    
    // Group schedules by hour for display
    private var timeSlots: [Date] {
        var slots: [Date] = []
        var times: Set<Int> = []
        
        for schedule in medicationSchedules {
            let components = calendar.dateComponents([.hour], from: schedule.timeOfDay)
            if let hour = components.hour, !times.contains(hour) {
                times.insert(hour)
                
                var dateComponents = DateComponents()
                dateComponents.year = calendar.component(.year, from: selectedDate)
                dateComponents.month = calendar.component(.month, from: selectedDate)
                dateComponents.day = calendar.component(.day, from: selectedDate)
                dateComponents.hour = hour
                dateComponents.minute = 0
                
                if let slotDate = calendar.date(from: dateComponents) {
                    slots.append(slotDate)
                }
            }
        }
        
        return slots.sorted()
    }
    
    private func schedulesAtTime(_ time: Date) -> [ScheduleInfo] {
        return medicationSchedules.filter { schedule in
            calendar.component(.hour, from: schedule.timeOfDay) == calendar.component(.hour, from: time)
        }
    }
    
    private func formattedDate(_ date: Date) -> String {
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: date)
        }
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct DateButton: View {
    let date: Date
    let isSelected: Bool
    let action: () -> Void
    
    private var calendar = Calendar.current
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Text(dayOfWeek)
                    .font(.caption)
                    .foregroundColor(isSelected ? .white : .secondary)
                
                Text("\(dayNumber)")
                    .font(.system(size: isSelected ? 18 : 16, weight: .medium))
                    .foregroundColor(isSelected ? .white : .primary)
            }
            .frame(width: 40, height: 60)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(isSelected ? Color.blue : Color.clear)
            )
        }
    }
    
    private var dayOfWeek: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "E"
        return formatter.string(from: date)
    }
    
    private var dayNumber: Int {
        return calendar.component(.day, from: date)
    }
}

struct ScheduleInfo: Identifiable, Hashable {
    let id: UUID
    let medicationId: UUID
    let scheduleId: UUID
    let medicationName: String
    let dosage: String
    let timeOfDay: Date
    let color: String
    let taken: Bool
    let isAvailable: Bool
    let isOverdue: Bool
    
    static func == (lhs: ScheduleInfo, rhs: ScheduleInfo) -> Bool {
        lhs.id == rhs.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

struct ScheduleTimeRow: View {
    let scheduleInfo: ScheduleInfo
    @EnvironmentObject var medicationStore: MedicationStore
    
    var body: some View {
        HStack {
            Circle()
                .fill(colorFromString(scheduleInfo.color))
                .frame(width: 10, height: 10)
                .padding(.trailing, 4)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(scheduleInfo.medicationName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(scheduleInfo.dosage)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if scheduleInfo.taken {
                Text("Taken")
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else if scheduleInfo.isAvailable {
                Button(action: {
                    medicationStore.markMedicationTaken(
                        medicationId: scheduleInfo.medicationId,
                        scheduleId: scheduleInfo.scheduleId
                    )
                }) {
                    Text("Take")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            } else if scheduleInfo.isOverdue {
                Text("Missed")
                    .font(.subheadline)
                    .foregroundColor(.red)
            } else {
                Text(formatTime(scheduleInfo.timeOfDay))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
    
    private func colorFromString(_ colorString: String) -> Color {
        switch colorString {
        case "red":
            return .red
        case "green":
            return .green
        case "blue":
            return .blue
        case "purple":
            return .purple
        case "orange":
            return .orange
        default:
            return .blue
        }
    }
}

struct ScheduleView_Previews: PreviewProvider {
    static var previews: some View {
        let store = MedicationStore()
        
        // Sample data
        let now = Date()
        
        let morning = Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: now)!
        let noon = Calendar.current.date(bySettingHour: 12, minute: 0, second: 0, of: now)!
        let evening = Calendar.current.date(bySettingHour: 18, minute: 0, second: 0, of: now)!
        
        let schedule1 = MedicationSchedule(
            timeOfDay: morning,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: morning)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: morning)!,
            taken: true
        )
        
        let schedule2 = MedicationSchedule(
            timeOfDay: noon,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: noon)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: noon)!
        )
        
        let schedule3 = MedicationSchedule(
            timeOfDay: evening,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: evening)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: evening)!
        )
        
        store.medications = [
            Medication(name: "Aspirin", dosage: "81mg", schedules: [schedule1, schedule2], color: "blue"),
            Medication(name: "Lisinopril", dosage: "10mg", schedules: [schedule2, schedule3], color: "red")
        ]
        
        return ScheduleView()
            .environmentObject(store)
    }
} 