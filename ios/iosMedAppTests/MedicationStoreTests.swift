import XCTest
@testable import iosMedApp

class MedicationStoreTests: XCTestCase {
    
    var medicationStore: MedicationStore!
    
    override func setUp() {
        super.setUp()
        medicationStore = MedicationStore()
        
        // Clear any existing medications
        UserDefaults.standard.removeObject(forKey: "medications")
        UserDefaults.standard.removeObject(forKey: "notificationSettings")
    }
    
    override func tearDown() {
        medicationStore = nil
        super.tearDown()
    }
    
    func testAddMedication() {
        // Given
        let initialCount = medicationStore.medications.count
        let medication = createSampleMedication()
        
        // When
        medicationStore.addMedication(medication)
        
        // Then
        XCTAssertEqual(medicationStore.medications.count, initialCount + 1, "Medication count should increase by 1")
        XCTAssertEqual(medicationStore.medications.last?.name, "Test Medication", "Medication name should match")
        XCTAssertEqual(medicationStore.medications.last?.dosage, "10mg", "Medication dosage should match")
    }
    
    func testUpdateMedication() {
        // Given
        let medication = createSampleMedication()
        medicationStore.addMedication(medication)
        
        // Create a modified copy with the same ID
        var updatedMedication = medication
        updatedMedication.name = "Updated Medication"
        updatedMedication.dosage = "20mg"
        
        // When
        medicationStore.updateMedication(updatedMedication)
        
        // Then
        if let index = medicationStore.medications.firstIndex(where: { $0.id == medication.id }) {
            XCTAssertEqual(medicationStore.medications[index].name, "Updated Medication", "Medication name should be updated")
            XCTAssertEqual(medicationStore.medications[index].dosage, "20mg", "Medication dosage should be updated")
        } else {
            XCTFail("Updated medication not found in store")
        }
    }
    
    func testDeleteMedication() {
        // Given
        let medication1 = createSampleMedication()
        let medication2 = createSampleMedication()
        
        medicationStore.addMedication(medication1)
        medicationStore.addMedication(medication2)
        
        let initialCount = medicationStore.medications.count
        
        // When
        medicationStore.deleteMedication(at: IndexSet(integer: 0))
        
        // Then
        XCTAssertEqual(medicationStore.medications.count, initialCount - 1, "Medication count should decrease by 1")
    }
    
    func testMarkMedicationTaken() {
        // Given
        let medication = createSampleMedication()
        medicationStore.addMedication(medication)
        
        let medicationId = medication.id
        let scheduleId = medication.schedules[0].id
        
        // When
        medicationStore.markMedicationTaken(medicationId: medicationId, scheduleId: scheduleId)
        
        // Then
        if let medIndex = medicationStore.medications.firstIndex(where: { $0.id == medicationId }),
           let scheduleIndex = medicationStore.medications[medIndex].schedules.firstIndex(where: { $0.id == scheduleId }) {
            XCTAssertTrue(medicationStore.medications[medIndex].schedules[scheduleIndex].taken, "Schedule should be marked as taken")
            XCTAssertNotNil(medicationStore.medications[medIndex].schedules[scheduleIndex].lastTakenDate, "Last taken date should be set")
        } else {
            XCTFail("Medication or schedule not found")
        }
    }
    
    func testResetDailySchedules() {
        // Given
        let medication = createSampleMedication()
        medicationStore.addMedication(medication)
        
        let medicationId = medication.id
        let scheduleId = medication.schedules[0].id
        
        medicationStore.markMedicationTaken(medicationId: medicationId, scheduleId: scheduleId)
        
        // Verify it's marked as taken
        if let medIndex = medicationStore.medications.firstIndex(where: { $0.id == medicationId }),
           let scheduleIndex = medicationStore.medications[medIndex].schedules.firstIndex(where: { $0.id == scheduleId }) {
            XCTAssertTrue(medicationStore.medications[medIndex].schedules[scheduleIndex].taken, "Schedule should be marked as taken before reset")
        }
        
        // When
        medicationStore.resetDailySchedules()
        
        // Then
        if let medIndex = medicationStore.medications.firstIndex(where: { $0.id == medicationId }),
           let scheduleIndex = medicationStore.medications[medIndex].schedules.firstIndex(where: { $0.id == scheduleId }) {
            XCTAssertFalse(medicationStore.medications[medIndex].schedules[scheduleIndex].taken, "Schedule should be reset to not taken")
        } else {
            XCTFail("Medication or schedule not found")
        }
    }
    
    func testUpdateNotificationSettings() {
        // Given
        var settings = NotificationSettings()
        settings.enabled = true
        settings.soundEnabled = false
        settings.vibrationEnabled = true
        settings.reminderMinutesBefore = 30
        settings.selectedSoundName = "bell"
        
        // When
        medicationStore.updateNotificationSettings(settings)
        
        // Then
        XCTAssertEqual(medicationStore.notificationSettings.enabled, true)
        XCTAssertEqual(medicationStore.notificationSettings.soundEnabled, false)
        XCTAssertEqual(medicationStore.notificationSettings.vibrationEnabled, true)
        XCTAssertEqual(medicationStore.notificationSettings.reminderMinutesBefore, 30)
        XCTAssertEqual(medicationStore.notificationSettings.selectedSoundName, "bell")
    }
    
    // MARK: - Helper Methods
    
    private func createSampleMedication() -> Medication {
        let now = Date()
        let windowStart = Calendar.current.date(byAdding: .minute, value: -15, to: now) ?? now
        let windowEnd = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
        
        let schedule = MedicationSchedule(
            timeOfDay: now,
            windowStart: windowStart,
            windowEnd: windowEnd
        )
        
        return Medication(
            name: "Test Medication",
            dosage: "10mg",
            schedules: [schedule],
            color: "blue"
        )
    }
} 