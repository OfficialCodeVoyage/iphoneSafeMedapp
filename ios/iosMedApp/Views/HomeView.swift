import SwiftUI

struct HomeView: View {
    @EnvironmentObject var medicationStore: MedicationStore
    @State private var showingAddMedication = false
    
    var body: some View {
        NavigationView {
            VStack {
                if medicationStore.medications.isEmpty {
                    emptyStateView
                } else {
                    medicationListView
                }
            }
            .navigationTitle("My Medications")
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
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "pills")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("No medications added")
                .font(.title2)
                .fontWeight(.medium)
            
            Text("Tap the + button to add your first medication and schedule")
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
    }
    
    private var medicationListView: some View {
        List {
            ForEach(medicationStore.medications) { medication in
                MedicationCard(medication: medication)
            }
            .onDelete(perform: medicationStore.deleteMedication)
        }
        .listStyle(InsetGroupedListStyle())
    }
}

struct MedicationCard: View {
    let medication: Medication
    @EnvironmentObject var medicationStore: MedicationStore
    
    var body: some View {
        NavigationLink(destination: MedicationDetailView(medication: medication)) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Circle()
                        .fill(colorFromString(medication.color))
                        .frame(width: 12, height: 12)
                    
                    Text(medication.name)
                        .font(.headline)
                    
                    Spacer()
                    
                    if medication.isActive {
                        Text(getNextDoseTime())
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Inactive")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                if !nextSchedules.isEmpty {
                    Text(medication.dosage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    ForEach(nextSchedules.prefix(2)) { schedule in
                        ScheduleRow(schedule: schedule, medicationId: medication.id)
                    }
                }
            }
            .padding(.vertical, 8)
        }
    }
    
    private var nextSchedules: [MedicationSchedule] {
        let sortedSchedules = medication.schedules.sorted { schedule1, schedule2 in
            if schedule1.taken == schedule2.taken {
                return schedule1.timeOfDay < schedule2.timeOfDay
            }
            return !schedule1.taken && schedule2.taken
        }
        
        return sortedSchedules
    }
    
    private func getNextDoseTime() -> String {
        if let nextSchedule = nextSchedules.first(where: { !$0.taken }) {
            let formatter = DateFormatter()
            formatter.timeStyle = .short
            return formatter.string(from: nextSchedule.timeOfDay)
        }
        return "All taken"
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

struct ScheduleRow: View {
    let schedule: MedicationSchedule
    let medicationId: UUID
    @EnvironmentObject var medicationStore: MedicationStore
    
    var body: some View {
        HStack {
            Image(systemName: schedule.taken ? "checkmark.circle.fill" : "circle")
                .foregroundColor(schedule.taken ? .green : (schedule.isOverdue ? .red : .gray))
            
            VStack(alignment: .leading) {
                HStack {
                    Text(formattedTime(schedule.timeOfDay))
                        .font(.subheadline)
                        .foregroundColor(schedule.taken ? .secondary : .primary)
                    
                    if schedule.isAvailable && !schedule.taken {
                        Text("Available Now")
                            .font(.caption)
                            .padding(4)
                            .background(Color.green.opacity(0.2))
                            .foregroundColor(.green)
                            .cornerRadius(4)
                    } else if schedule.isOverdue && !schedule.taken {
                        Text("Overdue")
                            .font(.caption)
                            .padding(4)
                            .background(Color.red.opacity(0.2))
                            .foregroundColor(.red)
                            .cornerRadius(4)
                    }
                }
                
                Text(schedule.timeRemainingText)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if schedule.isAvailable && !schedule.taken {
                Button(action: {
                    medicationStore.markMedicationTaken(medicationId: medicationId, scheduleId: schedule.id)
                }) {
                    Text("Take")
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formattedTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// Placeholder for AddMedicationView
struct AddMedicationView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var medicationStore: MedicationStore
    
    @State private var name = ""
    @State private var dosage = ""
    @State private var schedules: [MedicationSchedule] = [defaultSchedule()]
    @State private var selectedColor = "blue"
    
    private static func defaultSchedule() -> MedicationSchedule {
        let now = Date()
        let windowStart = Calendar.current.date(byAdding: .minute, value: -15, to: now) ?? now
        let windowEnd = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
        return MedicationSchedule(id: UUID(), timeOfDay: now, windowStart: windowStart, windowEnd: windowEnd)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Medication Details")) {
                    TextField("Name", text: $name)
                    TextField("Dosage (e.g., 10mg)", text: $dosage)
                    
                    Picker("Color", selection: $selectedColor) {
                        Text("Blue").tag("blue")
                        Text("Red").tag("red")
                        Text("Green").tag("green")
                        Text("Purple").tag("purple")
                        Text("Orange").tag("orange")
                    }
                }
                
                Section(header: Text("Schedules")) {
                    ForEach(0..<schedules.count, id: \.self) { index in
                        ScheduleEditor(schedule: $schedules[index])
                    }
                    
                    Button(action: {
                        withAnimation {
                            schedules.append(Self.defaultSchedule())
                        }
                    }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Add Schedule")
                        }
                    }
                }
            }
            .navigationTitle("Add Medication")
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Save") {
                    let medication = Medication(
                        name: name,
                        dosage: dosage,
                        schedules: schedules,
                        color: selectedColor
                    )
                    medicationStore.addMedication(medication)
                    presentationMode.wrappedValue.dismiss()
                }
                .disabled(name.isEmpty || dosage.isEmpty || schedules.isEmpty)
            )
        }
    }
}

struct ScheduleEditor: View {
    @Binding var schedule: MedicationSchedule
    
    var body: some View {
        VStack(alignment: .leading) {
            DatePicker("Time", selection: $schedule.timeOfDay, displayedComponents: .hourAndMinute)
            
            HStack {
                Text("Available window:")
                Spacer()
            }
            
            HStack {
                DatePicker("Start", selection: $schedule.windowStart, displayedComponents: .hourAndMinute)
                    .labelsHidden()
                
                Text("to")
                    .foregroundColor(.secondary)
                
                DatePicker("End", selection: $schedule.windowEnd, displayedComponents: .hourAndMinute)
                    .labelsHidden()
            }
        }
        .onChange(of: schedule.timeOfDay) { newValue in
            // When the time changes, adjust the window to be 15 minutes before and after by default
            schedule.windowStart = Calendar.current.date(byAdding: .minute, value: -15, to: newValue) ?? newValue
            schedule.windowEnd = Calendar.current.date(byAdding: .minute, value: 15, to: newValue) ?? newValue
        }
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        let store = MedicationStore()
        
        // Add sample data
        let now = Date()
        let pastTime = Calendar.current.date(byAdding: .hour, value: -2, to: now)!
        let futureTime = Calendar.current.date(byAdding: .hour, value: 2, to: now)!
        
        let schedule1 = MedicationSchedule(
            timeOfDay: pastTime,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: pastTime)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: pastTime)!,
            taken: true,
            lastTakenDate: pastTime
        )
        
        let schedule2 = MedicationSchedule(
            timeOfDay: now,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: now)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: now)!
        )
        
        let schedule3 = MedicationSchedule(
            timeOfDay: futureTime,
            windowStart: Calendar.current.date(byAdding: .minute, value: -15, to: futureTime)!,
            windowEnd: Calendar.current.date(byAdding: .minute, value: 15, to: futureTime)!
        )
        
        store.medications = [
            Medication(name: "Aspirin", dosage: "81mg", schedules: [schedule1, schedule2, schedule3], color: "blue"),
            Medication(name: "Lisinopril", dosage: "10mg", schedules: [schedule2, schedule3], color: "red")
        ]
        
        return HomeView()
            .environmentObject(store)
    }
} 