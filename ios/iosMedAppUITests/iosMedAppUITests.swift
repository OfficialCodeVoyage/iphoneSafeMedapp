import XCTest

class iosMedAppUITests: XCTestCase {
    
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    func testTabNavigation() throws {
        // Check initial state
        XCTAssertTrue(app.tabBars.buttons["Home"].exists)
        XCTAssertTrue(app.tabBars.buttons["Schedule"].exists)
        XCTAssertTrue(app.tabBars.buttons["Alerts"].exists)
        XCTAssertTrue(app.tabBars.buttons["Device"].exists)
        
        // Test navigation to each tab
        app.tabBars.buttons["Schedule"].tap()
        XCTAssertTrue(app.navigationBars["Schedule"].exists)
        
        app.tabBars.buttons["Alerts"].tap()
        XCTAssertTrue(app.navigationBars["Notifications"].exists)
        
        app.tabBars.buttons["Device"].tap()
        XCTAssertTrue(app.navigationBars["Device"].exists)
        
        app.tabBars.buttons["Home"].tap()
        XCTAssertTrue(app.navigationBars["My Medications"].exists)
    }
    
    func testAddMedicationFlow() throws {
        // Start on Home tab
        app.tabBars.buttons["Home"].tap()
        
        // Should show empty state with "Add Medication" button
        let addMedicationButton = app.buttons["Add Medication"]
        XCTAssertTrue(addMedicationButton.exists)
        
        // Tap button to add medication
        addMedicationButton.tap()
        
        // Fill out form
        let nameTextField = app.textFields["Name"]
        XCTAssertTrue(nameTextField.waitForExistence(timeout: 2))
        nameTextField.tap()
        nameTextField.typeText("Test Medicine")
        
        let dosageTextField = app.textFields["Dosage (e.g., 10mg)"]
        dosageTextField.tap()
        dosageTextField.typeText("50mg")
        
        // Navigate to save button and tap it
        let saveButton = app.navigationBars.buttons["Save"]
        XCTAssertTrue(saveButton.exists)
        saveButton.tap()
        
        // Verify we're back on the home screen with our new medication
        XCTAssertTrue(app.navigationBars["My Medications"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["Test Medicine"].exists)
    }
    
    func testNotificationSettings() throws {
        // Navigate to Notifications tab
        app.tabBars.buttons["Alerts"].tap()
        
        // Check that we can toggle settings
        let enableNotificationsToggle = app.switches.firstMatch
        XCTAssertTrue(enableNotificationsToggle.exists)
        
        // Get initial state
        let initialValue = enableNotificationsToggle.value as! String
        
        // Toggle it
        enableNotificationsToggle.tap()
        
        // Check that it changed
        let newValue = enableNotificationsToggle.value as! String
        XCTAssertNotEqual(initialValue, newValue)
        
        // Toggle it back
        enableNotificationsToggle.tap()
        
        // Should be back to initial value
        let finalValue = enableNotificationsToggle.value as! String
        XCTAssertEqual(initialValue, finalValue)
    }
    
    func testDeviceScreen() throws {
        // Navigate to Device tab
        app.tabBars.buttons["Device"].tap()
        
        // Check for "Pair Device" button
        let pairDeviceButton = app.buttons["Pair Device"]
        XCTAssertTrue(pairDeviceButton.exists)
        
        // Check for disclaimer text
        let disclaimerText = app.staticTexts["Disclaimer"]
        XCTAssertTrue(disclaimerText.exists)
        
        // Tap on Pair Device button
        pairDeviceButton.tap()
        
        // Should see a sheet with "Pair Device" title
        XCTAssertTrue(app.navigationBars["Pair Device"].waitForExistence(timeout: 2))
        
        // Dismiss it with Cancel
        let cancelButton = app.navigationBars.buttons["Cancel"]
        XCTAssertTrue(cancelButton.exists)
        cancelButton.tap()
        
        // Should be back on Device screen
        XCTAssertTrue(app.navigationBars["Device"].waitForExistence(timeout: 2))
    }
} 