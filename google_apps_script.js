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

        // --- SECURITY CHECK (1): API Key Validation ---
        // Replace 'YOUR_SECRET_KEY_HERE' with the same key in your .env file
        const API_SECRET = "5b9c405a365ebf88383c1b805d505e920cbf21f9dc4559aba3ff020eca00e369";
        if (data.secret !== API_SECRET) {
            return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unauthorized: Invalid Secret Key" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();

        const timestamp = new Date();
        const lineName = data.lineDisplayName || "";
        const lineId = data.lineUserId || "";

        // Check for New Normalized Renter Data
        if (data.preferences || data.locationPreference) {
            // --- RENTERS ---
            var sheet = ss.getSheetByName("Renter_Data");
            if (!sheet) {
                sheet = ss.insertSheet("Renter_Data");
                // New Header Structure
                sheet.appendRow([
                    "Timestamp",
                    "Line User ID",
                    "Display Name",
                    "Full Name",
                    "Phone",
                    "Email",
                    "Zones",
                    "Budget Min",
                    "Budget Max",
                    "Pet Friendly?",
                    "Pet Details",
                    "Unit Types",
                    "Contract (Months)",
                    "Move In Date",
                    "Source"
                ]);
            }

            // Normalize Data Extraction (Support both new and old if needed, but prioritizing new)
            var prefs = data.preferences || {};
            var budget = prefs.budget || {};

            // Fallback for old fields if prefs is empty (optional backward compatibility)
            var location = (prefs.location_zones || []).join(", ") || data.locationPreference || "";
            var budgetMin = budget.min || data.budgetMin || 0;
            var budgetMax = budget.max || data.budgetMax || 0;
            var petInfo = (prefs.pet_tags || []).join(", ") || (data.hasPet ? ("Yes: " + (data.petType || "")) : "No");
            if (prefs.is_pet_friendly === true) petInfo = "Yes (" + petInfo + ")";
            else if (prefs.is_pet_friendly === false) petInfo = "No";

            var rowData = [
                new Date(), // Timestamp
                lineId, // Already simple string from data.lineUserId
                sanitizeInput(lineName),
                sanitizeInput(data.full_name || data.fullName || ""),
                "'" + sanitizeInput(data.phone_number || data.phoneNumber || ""),
                sanitizeInput(data.email || ""),
                sanitizeInput(location),
                budgetMin,
                budgetMax,
                prefs.is_pet_friendly ? "Yes" : "No",
                sanitizeInput(petInfo),
                sanitizeInput((prefs.unit_types || []).join(", ") || data.roomType || ""),
                prefs.contract_months || data.contractPeriod || "",
                sanitizeInput(prefs.move_in_date || data.moveInDate || ""),
                sanitizeInput((data.metadata && data.metadata.source) || "LIFF_RENTER_FORM")
            ];

            sheet.appendRow(rowData);
        } else {
            // --- OWNERS ---
            let sheet = ss.getSheetByName("Owner_Data");
            if (!sheet) {
                sheet = ss.insertSheet("Owner_Data");
                sheet.appendRow(["Timestamp", "LINE Name", "LINE ID", "Owner Name", "Phone", "LINE ID (Manual)", "Project Name", "Room Details", "Price", "Period", "Conditions"]);
            }

            sheet.appendRow([
                timestamp,
                sanitizeInput(lineName),
                lineId,
                sanitizeInput(data.ownerName || ""),
                sanitizeInput(data.ownerPhone || ""),
                sanitizeInput(data.ownerLineId || ""),
                sanitizeInput(data.projectName || ""),
                sanitizeInput(data.roomDetails || ""),
                sanitizeInput(data.rentalPrice || ""),
                sanitizeInput(data.rentalPeriod || ""),
                sanitizeInput(data.specialConditions || "")
            ]);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Helper function to prevent CSV Injection / Formula Injection
 * Prefixes strings starting with = with a single quote
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    if (input.startsWith('=')) {
        return "'" + input;
    }
    return input;
}