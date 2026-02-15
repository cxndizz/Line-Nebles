/**
 * 6. Execute as: "Me", Who has access: "Anyone".
 * 7. Copy the Web App URL and use it in your frontend.
 */

/**
 * Run this function ONCE to authorize the script to access Google Drive and Sheets.
 * Click "Run" -> Select "setupAuth" -> Review Permissions.
 */
function setupAuth() {
    DriveApp.getRootFolder();
    SpreadsheetApp.getActiveSpreadsheet();
    console.log("Authorization Successful! You can now Deploy.");
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // --- SECURITY CHECK ---
        // Replace 'YOUR_SECRET_KEY_HERE' with the same key in your .env file
        const API_SECRET = "5b9c405a365ebf88383c1b805d505e920cbf21f9dc4559aba3ff020eca00e369";

        if (!data.secret || data.secret !== API_SECRET) {
            return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unauthorized: Invalid or Missing Secret Key" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const timestamp = new Date();

        // Common Data
        const lineName = data.lineDisplayName || "";
        const lineId = data.lineUserId || "";

        // Determine Source
        const source = (data.metadata && data.metadata.source) || "";

        if (source === 'LIFF_RENTER_FORM' || (!source && (data.preferences || data.locationPreference))) {
            // --- RENTER LOGIC ---
            handleRenterSubmission(ss, data, timestamp, lineName, lineId);
        } else if (source === 'LIFF_OWNER_FORM' || data.ownerName) {
            // --- OWNER LOGIC ---
            handleOwnerSubmission(ss, data, timestamp, lineName, lineId);
        } else {
            return createJSONOutput("error", "Unknown Data Source");
        }

        return createJSONOutput("success", "Data saved successfully");

    } catch (error) {
        return createJSONOutput("error", error.toString());
    }
}

function handleRenterSubmission(ss, data, timestamp, lineName, lineId) {
    var sheet = ss.getSheetByName("Renter_Data");
    if (!sheet) {
        sheet = ss.insertSheet("Renter_Data");
        sheet.appendRow([
            "Timestamp", "Line User ID", "Display Name", "Full Name", "Contact Method", "Phone", "Email",
            "Zones", "Budget Min", "Budget Max", "Pet Friendly?", "Pet Details",
            "Unit Types", "Contract (Months)", "Move In Date", "Source"
        ]);
    }

    var prefs = data.preferences || {};
    var budget = prefs.budget || {};

    // fallback for legacy structure
    var location = (prefs.location_zones || []).join(", ") || data.locationPreference || "";
    var budgetMin = budget.min || data.budgetMin || 0;
    var budgetMax = budget.max || data.budgetMax || 0;
    var petInfo = (prefs.pet_tags || []).join(", ") || (data.hasPet ? ("Yes: " + (data.petType || "")) : "No");
    if (prefs.is_pet_friendly === true) petInfo = "Yes (" + petInfo + ")";
    else if (prefs.is_pet_friendly === false) petInfo = "No";

    // Ensure phone starts with + if it has content
    var rawPhone = data.phone_number || data.phoneNumber || "";
    var formattedPhone = rawPhone ? ("'+" + rawPhone.replace(/^\+/, '')) : "";

    var rowData = [
        timestamp,
        lineId,
        sanitizeInput(lineName),
        sanitizeInput(data.full_name || data.fullName || ""),
        sanitizeInput(data.contactMethod || ""), // Added Contact Method
        formattedPhone,
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
}

function handleOwnerSubmission(ss, data, timestamp, lineName, lineId) {
    var sheet = ss.getSheetByName("Owner_Data");
    if (!sheet) {
        sheet = ss.insertSheet("Owner_Data");
        // Header with New Columns (Up to 5 images + Status)
        sheet.appendRow([
            "Timestamp", "LINE Name", "LINE ID", "Owner Name", "Phone", "LINE ID (Manual)",
            "Project Name", "Room Number", "Zone", "Unit Type", "Size (sqm)", "Floor",
            "Description", "Price (Short)", "Price (Middle)", "Price (Long)", "Contract Types",
            "Facilities", "Pet Policy", "Status",
            "Image 1", "Image 2", "Image 3", "Image 4", "Image 5"
        ]);
    }

    // Determine Folder for Images
    // Sanitize and create a safe folder name
    var safeProject = sanitizeInput(data.projectName || "UnknownProject").toString().replace(/[\/\\:*?"<>|]/g, '').trim();
    var safeRoom = sanitizeInput(data.roomNumber || "UnknownRoom").toString().replace(/[\/\\:*?"<>|]/g, '').trim();
    var specificFolderName = safeProject + "_" + safeRoom;

    // Handle Images (Max 5)
    var imageUrls = ["", "", "", "", ""];
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach(function (base64, index) {
            if (base64 && base64.length > 0 && index < 5) {
                try {
                    var fileName = "Owner_" + (lineName.replace(/\s/g, '_') || "User") + "_" + timestamp.getTime() + "_" + (index + 1) + ".jpg";
                    var url = saveImageToSubfolder(base64, fileName, specificFolderName);
                    imageUrls[index] = url;
                } catch (e) {
                    imageUrls[index] = "Error: " + e.toString();
                }
            }
        });
    }

    // Map Pet Policy
    var petPolicy = "No";
    if (data.isPetFriendly) {
        petPolicy = "Yes";
        if (data.acceptedPets && data.acceptedPets.length > 0) {
            petPolicy += " (" + data.acceptedPets.join(", ") + ")";
        }
    }

    // Facilities
    var facilities = (data.facilities || []).join(", ");

    var rowData = [
        timestamp,
        sanitizeInput(lineName),
        lineId,
        sanitizeInput(data.ownerName || ""),
        "'" + sanitizeInput(data.ownerPhone || ""),
        sanitizeInput(data.ownerLineId || ""),
        sanitizeInput(data.projectName || ""),
        sanitizeInput(data.roomNumber || ""),
        sanitizeInput(data.zone || data.locationPreference || ""),
        sanitizeInput(data.unitType || ""),
        sanitizeInput(data.sizeSqm || ""),
        sanitizeInput(data.floor || ""),
        sanitizeInput(data.roomDetails || ""),
        sanitizeInput(data.priceShort || ""),   // Split Pricing
        sanitizeInput(data.priceMiddle || ""),
        sanitizeInput(data.priceLong || ""),
        sanitizeInput(data.rentalPeriod || ""), // Kept as Contract Types summary
        sanitizeInput(facilities),              // New Facilities
        sanitizeInput(petPolicy),
        sanitizeInput("Available"),             // Hardcoded Available
        imageUrls[0],
        imageUrls[1],
        imageUrls[2],
        imageUrls[3],
        imageUrls[4]
    ];

    sheet.appendRow(rowData);
}

/**
 * Saves Base64 Image string to Google Drive in "Nebles_Room_Images/Subfolder"
 * Returns public View URL
 */
function saveImageToSubfolder(base64Data, fileName, subfolderName) {
    const ROOT_FOLDER_NAME = "Nebles_Room_Images";

    // 1. Get or Create Root Folder
    var rootFolders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    var rootFolder;
    if (rootFolders.hasNext()) {
        rootFolder = rootFolders.next();
    } else {
        rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
    }

    // 2. Get or Create Subfolder
    var subFolders = rootFolder.getFoldersByName(subfolderName);
    var targetFolder;
    if (subFolders.hasNext()) {
        targetFolder = subFolders.next();
    } else {
        targetFolder = rootFolder.createFolder(subfolderName);
        targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // Ensure folder is accessible if needed, or just files.
    }

    // Expect format: "data:image/jpeg;base64,/9j/4AAQ..."
    // If just raw base64, assume jpeg
    var dataPart = base64Data;
    var contentType = "image/jpeg"; // default

    if (base64Data.indexOf('base64,') > -1) {
        var parts = base64Data.split('base64,');
        var header = parts[0];
        dataPart = parts[1];
        // extract content type
        // data:image/png;base64,
        if (header.indexOf(':') > -1 && header.indexOf(';') > -1) {
            contentType = header.split(':')[1].split(';')[0];
        }
    }

    var bytes = Utilities.base64Decode(dataPart);
    var blob = Utilities.newBlob(bytes, contentType, fileName);

    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Return direct view URL
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    if (input.startsWith('=')) {
        return "'" + input;
    }
    return input;
}

function createJSONOutput(status, message) {
    return ContentService.createTextOutput(JSON.stringify({ status: status, message: message }))
        .setMimeType(ContentService.MimeType.JSON);
}