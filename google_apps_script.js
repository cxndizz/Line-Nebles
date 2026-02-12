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
        const sheet = ss.getSheets()[0]; // Use the first sheet

        // Create header row if sheet is empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "Timestamp",
                "LINE Name",
                "LINE User ID",
                "Owner Name",
                "Phone",
                "Project Name",
                "Room Details",
                "Price",
                "Period",
                "Conditions"
            ]);
        }

        // Append data
        sheet.appendRow([
            new Date(),
            data.lineDisplayName || "",
            data.lineUserId || "",
            data.ownerName || "",
            data.ownerPhone || "",
            data.projectName || "",
            data.roomDetails || "",
            data.rentalPrice || "",
            data.rentalPeriod || "",
            data.specialConditions || ""
        ]);

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
