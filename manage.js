// DOM elements
const medicationList = document.getElementById("medication-list");
const toggleAddMedButton = document.getElementById("toggle-add-med");
const addMedForm = document.getElementById("add-medication-form");
const medicationForm = document.getElementById("medication-form");
const validationError = document.getElementById("validation-error");
const clearAllButton = document.getElementById("clear-all");
const generateShareCodeButton = document.getElementById("generate-share-code");
const shareCodeContainer = document.getElementById("share-code-container");
const shareCodeInput = document.getElementById("share-code");
const copyCodeButton = document.getElementById("copy-code");
const importCodeInput = document.getElementById("import-code");
const importCodeButton = document.getElementById("import-code-button");
const toggleShareCodeButton = document.getElementById("toggle-share-code");
const shareCodeSection = document.getElementById("share-code-section");
const toggleImportCodeButton = document.getElementById("toggle-import-code");
const importCodeSection = document.getElementById("import-code-section");
const checkRefillButton = document.getElementById("check-refill");

// Initial Medications Data (static demo data for 3-4 medications)
let medications = [
    {
        id: 1,
        name: "Aspirin",
        dosage: "100mg",
        frequency: "Daily",
        time: "08:00",
        refillDate: "2024-11-25", // Date for refill reminder
        pillsLeft: 5, // Number of pills left for the refill reminder
        taken: false
    },
    {
        id: 2,
        name: "Ibuprofen",
        dosage: "200mg",
        frequency: "Every 6 hours",
        time: "09:00",
        refillDate: "2024-12-01", // Date for refill reminder
        pillsLeft: 10,
        taken: false
    },
    {
        id: 3,
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "As needed",
        time: "12:00",
        refillDate: "2024-11-28",
        pillsLeft: 2, // Urgent refill with low pills
        taken: false
    },
    {
        id: 4,
        name: "Vitamin D",
        dosage: "1000 IU",
        frequency: "Weekly",
        time: "10:00",
        refillDate: "2024-12-10",
        pillsLeft: 30,
        taken: false
    }
];

// Render Medications
function renderMedications() {
    medicationList.innerHTML = "";
    if (medications.length === 0) {
        medicationList.innerHTML = "<p>No medications added yet.</p>";
    } else {
        medications.forEach((med) => {
            const medDiv = document.createElement("div");
            medDiv.classList.add("medication-item");

            // Calculate days left for refill
            let daysLeft = med.refillDate ? Math.ceil((new Date(med.refillDate) - new Date()) / (1000 * 3600 * 24)) : null;
            const pillsLeft = med.pillsLeft; // Track the number of pills left

            // Add class to change color if pills left are less than 3
            const pillStatusClass = pillsLeft <= 3 ? "urgent" : ""; 

            medDiv.innerHTML = `
                <div class="medication-info ${pillStatusClass}">
                    <h3>${med.name}</h3>
                    <p>${med.dosage} • ${med.frequency} • ${med.time}</p>
                    ${daysLeft !== null ? `<p class="med-days-left">${daysLeft} days left for refill</p>` : ""}
                    ${pillsLeft <= 3 ? `<p class="urgent-refill">Only ${pillsLeft} pills left!</p>` : ""}
                </div>
                <div class="medication-actions">
                    <button class="button outline" onclick="editMedication(${med.id})">✎ Edit</button>
                    <button class="button danger" onclick="deleteMedication(${med.id})">Delete</button>
                </div>
            `;
            medicationList.appendChild(medDiv);
        });
    }
}
toggleAddMedButton.addEventListener("click", () => {
    addMedForm.classList.toggle("hidden");
});
// Add or Edit Medication
medicationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("med-name").value;
    const dosage = document.getElementById("med-dosage").value;
    const frequency = document.getElementById("med-frequency").value;
    const time = document.getElementById("med-time").value;
    const refillDate = document.getElementById("med-refill-date").value;
    const pillsLeft = document.getElementById("med-pills-left").value;

    if (!name || !dosage || !frequency || !time || !pillsLeft) {
        validationError.classList.remove("hidden");
        return;
    }
    validationError.classList.add("hidden");

    const editingMedId = medicationForm.dataset.editId;

    // If editing a medication
    if (editingMedId) {
        medications = medications.map(med =>
            med.id === parseInt(editingMedId)
                ? { ...med, name, dosage, frequency, time, refillDate, pillsLeft: parseInt(pillsLeft) }
                : med
        );
    } else {
        // Adding a new medication
        medications.push({
            id: Date.now(),
            name,
            dosage,
            frequency,
            time,
            refillDate: refillDate || null,  // Store refillDate if provided
            pillsLeft: parseInt(pillsLeft),  // Store the number of pills left
            taken: false
        });
    }

    saveMedications();
    renderMedications();
    medicationForm.reset();
    addMedForm.classList.add("hidden");
    delete medicationForm.dataset.editId; // Remove the edit ID after form submission
});

// Edit Medication
function editMedication(id) {
    const med = medications.find(med => med.id === id);
    document.getElementById("med-name").value = med.name;
    document.getElementById("med-dosage").value = med.dosage;
    document.getElementById("med-frequency").value = med.frequency;
    document.getElementById("med-time").value = med.time;
    document.getElementById("med-refill-date").value = med.refillDate || "";
    document.getElementById("med-pills-left").value = med.pillsLeft || "";
    medicationForm.dataset.editId = med.id;
    addMedForm.classList.remove("hidden");
}

// Delete Medication with Confirmation
function deleteMedication(id) {
    const isConfirmed = window.confirm("Are you sure you want to delete this medication?");
    if (isConfirmed) {
        medications = medications.filter(med => med.id !== id);
        saveMedications();
        renderMedications();
    }
}

// Clear All Medications with Confirmation
clearAllButton.addEventListener("click", () => {
    const isConfirmed = window.confirm("Are you sure you want to delete all medications?");
    if (isConfirmed) {
        medications = [];
        saveMedications();
        renderMedications();
    }
});

// Generate a random 8-character code
function generateRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate Share Code
generateShareCodeButton.addEventListener("click", () => {
    const shareCode = generateRandomCode();
    shareCodeInput.value = shareCode;
    shareCodeContainer.classList.remove("hidden");
});

// Copy Share Code to Clipboard
copyCodeButton.addEventListener("click", () => {
    shareCodeInput.select();
    document.execCommand("copy");
    alert("Share code copied to clipboard!");
});

// Import Medications from Share Code
importCodeButton.addEventListener("click", () => {
    const shareCode = importCodeInput.value;
    if (shareCode) {
        alert("This feature can be expanded to import medications based on the code.");
    }
});

// Save Data to Local Storage
function saveMedications() {
    localStorage.setItem("medications", JSON.stringify(medications));
}

// Check Refill Status (and update each medication)
checkRefillButton.addEventListener("click", () => {
    medications.forEach(med => {
        if (med.refillDate && new Date(med.refillDate) <= new Date()) {
            showRefillNotification(med);
        }
    });
});

// Display Refill Notification (for specific medication)
function showRefillNotification(med) {
    const notificationSection = document.getElementById("refill-notification-section");
    const notification = document.querySelector("#refill-notification-section .notification");
    notification.innerHTML = `
        <p><strong>Refill Reminder:</strong> Your medication <strong>${med.name}</strong> is due for a refill!</p>
        <button class="button" onclick="openRefillPage()">Order Refill</button>
    `;
    notificationSection.classList.remove("hidden");
}

// Open Refill Page (Placeholder function)
function openRefillPage() {
    alert("Redirecting to refill page...");
}

// Toggle Share Code Section visibility
toggleShareCodeButton.addEventListener("click", () => {
    shareCodeSection.classList.toggle("hidden");
});

// Toggle Import Code Section visibility
toggleImportCodeButton.addEventListener("click", () => {
    importCodeSection.classList.toggle("hidden");
});

// Render medications initially
renderMedications();
