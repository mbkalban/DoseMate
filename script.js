// State management for daily tracking
let medications = JSON.parse(localStorage.getItem('medications')) || [];

// DOM Elements
const dailyMedicationList = document.getElementById('daily-medication-list');

// Render daily medications
function renderDailyMedications() {
    dailyMedicationList.innerHTML = '';
    if (medications.length === 0) {
        dailyMedicationList.innerHTML = '<p>No medications added yet. Go to Manage Medications to add some.</p>';
        return;
    }

    medications.forEach(med => {
        const medElement = document.createElement('div');
        medElement.className = `medication-item ${med.taken ? 'taken' : ''}`;
        medElement.innerHTML = `
            <div class="medication-info">
                <h3>${med.name}</h3>
                <p>${med.dosage} • ${med.frequency} • ${med.time}</p>
            </div>
            <div class="medication-actions">
                <button class="button ${med.taken ? 'outline' : 'success'}" 
                        onclick="toggleTaken(${med.id})">
                    ${med.taken ? 'Undo' : 'Mark Taken'}
                </button>
            </div>
        `;
        dailyMedicationList.appendChild(medElement);
    });
    updateProgress();
}

// Update progress bar
function updateProgress() {
    const progress = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const total = medications.length;
    const taken = medications.filter(med => med.taken).length;
    const percentage = total === 0 ? 0 : (taken / total) * 100;
    
    progress.style.width = `${percentage}%`;
    progressText.textContent = `${taken} of ${total} medications taken today`;
}

// Toggle medication taken status
function toggleTaken(id) {
    medications = medications.map(med => 
        med.id === id ? {...med, taken: !med.taken} : med
    );
    localStorage.setItem('medications', JSON.stringify(medications));
    renderDailyMedications();
    const med = medications.find(m => m.id === id);
    showNotification(`${med.name} marked as ${med.taken ? 'taken' : 'not taken'}`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
renderDailyMedications();

// Set up notifications
if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            medications.forEach(med => {
                if (!med.taken) {
                    const [hours, minutes] = med.time.split(':');
                    const now = new Date();
                    const scheduleTime = new Date();
                    scheduleTime.setHours(hours, minutes, 0, 0);
                    
                    if (scheduleTime < now) {
                        scheduleTime.setDate(scheduleTime.getDate() + 1);
                    }
                    
                    const delay = scheduleTime - now;
                    setTimeout(() => {
                        new Notification('Medication Reminder', {
                            body: `Time to take ${med.name} (${med.dosage})`,
                            icon: '💊'
                        });
                    }, delay);
                }
            });
        }
    });
}