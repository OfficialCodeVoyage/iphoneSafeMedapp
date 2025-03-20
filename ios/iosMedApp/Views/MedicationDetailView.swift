import SwiftUI

struct MedicationDetailView: View {
    @State var medication: Medication
    @State private var editedMedication: Medication
    @State private var isEditing = false
    @EnvironmentObject var medicationStore: MedicationStore
    
    init(medication: Medication) {
        self._medication = State(initialValue: medication)
        self._editedMedication = State(initialValue: medication)
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                headerSection
                statusSection
                schedulesSection
                
                if isEditing {
                    editButtonsSection
                }
            }
            .padding()
        }
        .navigationTitle(medication.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if isEditing {
                    Button("Done") {
                        saveChanges()
                    }
                } else {
                    Button("Edit") {
                        isEditing = true
                    }
                }
            }
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            if isEditing {
                TextField("Medication Name", text: $editedMedication.name)
                    .font(.title)
                    .fontWeight(.bold)
                
                TextField("Dosage", text: $editedMedication.dosage)
                    .font(.title3)
                
                Picker("Color", selection: $editedMedication.color) {
                    Text("Blue").tag("blue")
                    Text("Red").tag("red")
                    Text("Green").tag("green")
                    Text("Purple").tag("purple")
                    Text("Orange").tag("orange")
                }
                .pickerStyle(MenuPickerStyle())
                
                Toggle("Active", isOn: $editedMedication.isActive)
            } else {
                HStack {
                    Circle()
                        .fill(colorFromString(medication.color))
                        .frame(width: 16, height: 16)
                    
                    Text(medication.name)
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Spacer()
                    
                    if medication.isActive {
                        Text("Active")
                            .font(.caption)
                            .padding(6)
                            .background(Color.green.opacity(0.2))
                            .foregroundColor(.green)
                            .cornerRadius(4)
                    } else {
                        Text("Inactive")
                            .font(.caption)
                            .padding(6)
                            .background(Color.red.opacity(0.2))
                            .foregroundColor(.red)
                            .cornerRadius(4)
                    }
                }
                
                Text(medication.dosage)
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
    
    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Today's Status")
                .font(.headline)
            
            HStack {
                VStack(alignment: .leading) {
                    let total = medication.schedules.count
                    let taken = medication.schedules.filter { $0.taken }.count
                    
                    Text("\(taken) of \(total) doses taken")
                        .font(.subheadline)
                    
                    ProgressView(value: Double(taken), total: Double(total))
                        .accentColor(colorFromString(medication.color))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
        }
    }
    
    private var schedulesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Schedules")
                    .font(.headline)
                
                Spacer()
                
                if isEditing {
                    Button(action: {
                        withAnimation {
                            let now = Date()
                            let windowStart = Calendar.current.date(byAdding: .minute, value: -15, to: now) ?? now
                            let windowEnd = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
                            let newSchedule = MedicationSchedule(
                                timeOfDay: now,
                                windowStart: windowStart,
                                windowEnd: windowEnd
                            )
                            editedMedication.schedules.append(newSchedule)
                        }
                    }) {
                        Label("Add", systemImage: "plus")
                            .font(.subheadline)
                    }
                }
            }
            
            if isEditing {
                ForEach(editedMedication.schedules.indices, id: \.self) { index in
                    VStack {
                        ScheduleEditorRow(schedule: $editedMedication.schedules[index])
                        
                        if editedMedication.schedules.count > 1 {
                            HStack {
                                Spacer()
                                
                                Button(action: {
                                    withAnimation {
                                        editedMedication.schedules.remove(at: index)
                                    }
                                }) {
                                    Text("Remove")
                                        .foregroundColor(.red)
                                        .font(.caption)
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
            } else {
                ForEach(sortedSchedules) { schedule in
                    ScheduleDetailRow(schedule: schedule, medicationId: medication.id)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                }
            }
        }
    }
    
    private var editButtonsSection: some View {
        VStack(spacing: 16) {
            Divider()
            
            Button(action: {
                withAnimation {
                    isEditing = false
                    editedMedication = medication
                }
            }) {
                Text("Cancel")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .foregroundColor(.primary)
                    .cornerRadius(8)
            }
            
            Button(action: {
                withAnimation {
                    if let index = medicationStore.medications.firstIndex(where: { $0.id == medication.id }) {
                        medicationStore.medications.remove(at: index)
                    }
                }
            }) {
                Text("Delete Medication")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(8)
            }
        }
        .padding(.top)
    }
    
    private var sortedSchedules: [MedicationSchedule] {
        medication.schedules.sorted { $0.timeOfDay < $1.timeOfDay }
    }
    
    private func saveChanges() {
        medication = editedMedication
        medicationStore.updateMedication(medication)
        isEditing = false
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

struct ScheduleDetailRow: View {
    let schedule: MedicationSchedule
    let medicationId: UUID
    @EnvironmentObject var medicationStore: MedicationStore
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(formattedTime(schedule.timeOfDay))
                        .font(.headline)
                    
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
                
                Text("Window: \(formattedTime(schedule.windowStart)) - \(formattedTime(schedule.windowEnd))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let lastTaken = schedule.lastTakenDate, schedule.taken {
                    Text("Last taken: \(formattedDateTime(lastTaken))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if schedule.taken {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.title2)
            } else if schedule.isAvailable {
                Button(action: {
                    medicationStore.markMedicationTaken(medicationId: medicationId, scheduleId: schedule.id)
                }) {
                    Text("Take Now")
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            } else {
                Text(schedule.timeRemainingText)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func formattedTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
    
    private func formattedDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct ScheduleEditorRow: View {
    @Binding var schedule: MedicationSchedule
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            DatePicker("Time", selection: $schedule.timeOfDay, displayedComponents: .hourAndMinute)
                .font(.headline)
            
            Text("Available window")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Start")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    DatePicker("", selection: $schedule.windowStart, displayedComponents: .hourAndMinute)
                        .labelsHidden()
                }
                
                Spacer()
                
                VStack(alignment: .leading) {
                    Text("End")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    DatePicker("", selection: $schedule.windowEnd, displayedComponents: .hourAndMinute)
                        .labelsHidden()
                }
            }
            
            if schedule.taken {
                Toggle("Taken", isOn: $schedule.taken)
            }
        }
    }
}

struct MedicationDetailView_Previews: PreviewProvider {
    static var previews: some View {
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
        
        let medication = Medication(
            name: "Aspirin",
            dosage: "81mg",
            schedules: [schedule1, schedule2, schedule3],
            color: "blue"
        )
        
        let store = MedicationStore()
        store.medications = [medication]
        
        return NavigationView {
            MedicationDetailView(medication: medication)
                .environmentObject(store)
        }
    }
} 