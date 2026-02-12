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

        const timestamp = new Date();
        const lineName = data.lineDisplayName || "";
        const lineId = data.lineUserId || "";

        if (data.locationPreference) {
            // --- RENTERS ---
            let sheet = ss.getSheetByName("Renter_Data");
            if (!sheet) {
                sheet = ss.insertSheet("Renter_Data");
                sheet.appendRow(["Timestamp", "LINE Name", "LINE ID", "Name", "Phone", "LINE ID (Manual)", "Location", "Budget", "Room Type", "Pet Info", "Move-in Date", "Period"]);
            }

            sheet.appendRow([
                timestamp,
                lineName,
                lineId,
                data.fullName || "",
                data.phoneNumber || "",
                data.lineId || "",
                data.locationPreference || "",
                (data.budgetMin || "0") + " - " + (data.budgetMax || "Any"),
                data.roomType || "",
                data.hasPet ? ("Yes: " + (data.petType || "")) : "No",
                data.moveInDate || "",
                data.contractPeriod || ""
            ]);
        } else {
            // --- OWNERS ---
            let sheet = ss.getSheetByName("Owner_Data");
            if (!sheet) {
                sheet = ss.insertSheet("Owner_Data");
                sheet.appendRow(["Timestamp", "LINE Name", "LINE ID", "Owner Name", "Phone", "LINE ID (Manual)", "Project Name", "Room Details", "Price", "Period", "Conditions"]);
            }

            sheet.appendRow([
                timestamp,
                lineName,
                lineId,
                data.ownerName || "",
                data.ownerPhone || "",
                data.ownerLineId || "",
                data.projectName || "",
                data.roomDetails || "",
                data.rentalPrice || "",
                data.rentalPeriod || "",
                data.specialConditions || ""
            ]);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
