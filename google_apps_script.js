/**
 * Google Apps Script to receive data from Next.js Form and save to Google Sheets
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select "Web App".
 * 6. Execute as: "Me", Who has access: "Anyone".
 * 7. Copy the Web App URL and use it in your frontend.
 */

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheets()[0]; // Default to first sheet

        // Check if it's a Renter or Owner submission to potentially use different sheets
        // For simplicity, we'll use the same sheet but adjust the columns

        const timestamp = new Date();
        const lineName = data.lineDisplayName || "";
        const lineId = data.lineUserId || "";

        // Determine form type and prepare row
        let rowData = [];

        if (data.locationPreference) {
            // Renter Form
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(["Timestamp", "LINE Name", "LINE ID", "Type", "Name", "Phone", "LINE ID (Manual)", "Location", "Budget", "Room Type", "Pet?", "Move-in Date", "Period"]);
            }
            rowData = [
                timestamp,
                lineName,
                lineId,
                "Renter",
                data.fullName || "",
                data.phoneNumber || "",
                data.lineId || "",
                data.locationPreference || "",
                (data.budgetMin || "0") + " - " + (data.budgetMax || "Any"),
                data.roomType || "",
                data.hasPet ? ("Yes: " + (data.petType || "")) : "No",
                data.moveInDate || "",
                data.contractPeriod || ""
            ];
        } else {
            // Owner Form
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(["Timestamp", "LINE Name", "LINE ID", "Type", "Name", "Phone", "LINE ID (Manual)", "Project Name", "Room Details", "Price", "Period", "Conditions"]);
            }
            rowData = [
                timestamp,
                lineName,
                lineId,
                "Owner",
                data.ownerName || "",
                data.ownerPhone || "",
                data.ownerLineId || "",
                data.projectName || "",
                data.roomDetails || "",
                data.rentalPrice || "",
                data.rentalPeriod || "",
                data.specialConditions || ""
            ];
        }

        sheet.appendRow(rowData);

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
