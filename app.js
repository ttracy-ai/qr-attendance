// Configuration
const CONFIG = {
    storageKey: 'qr-attendance',
    qrSize: 300,
    sessionUrl: window.location.href,
    // Define your 4 class periods
    classPeriods: [
        { hour: 1, start: '08:00', end: '09:15' },
        { hour: 2, start: '09:16', end: '11:00' },
        { hour: 3, start: '11:45', end: '13:05' },
        { hour: 4, start: '13:06', end: '14:45' }
    ]
};

// State Management
let attendanceData = [];
let currentHourFilter = 'all'; // Will be set based on current time in initializeApp

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    // Set up real-time Firebase listener (it will render when data arrives)
    loadAttendanceData();

    // Set default hour filter based on current time
    setDefaultHourFilter();

    generateQRCode();
    updateDateDisplay();
    updateClock(); // Initial clock update
    checkForAutoSignIn();

    // Note: renderAttendanceList() is called by the Firebase listener
}

// Set the default hour filter based on current time
function setDefaultHourFilter() {
    const now = new Date();
    const currentPeriod = getCurrentPeriod(now);

    if (currentPeriod !== null) {
        // We're in a class period, set that as default
        currentHourFilter = currentPeriod.toString();
    } else {
        // We're outside class hours, show all students
        currentHourFilter = 'all';
    }

    // Update the active button to match
    document.querySelectorAll('.hour-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-hour') === currentHourFilter) {
            btn.classList.add('active');
        }
    });
}

// TEMPORARY: Function to add test students - REMOVED (using Firebase now)
// function addTestStudents() {
//     const testNames = [
//         'Emma Anderson', 'Liam Brown', 'Olivia Carter', 'Noah Davis',
//         'Ava Evans', 'Ethan Foster', 'Sophia Garcia', 'Mason Harris',
//         'Isabella Johnson', 'William Jones', 'Mia Kim', 'James Lee',
//         'Charlotte Martinez', 'Benjamin Miller', 'Amelia Moore', 'Lucas Nelson',
//         'Harper O\'Brien', 'Henry Parker', 'Evelyn Roberts', 'Alexander Smith',
//         'Abigail Taylor', 'Michael Thompson', 'Emily White', 'Daniel Wilson'
//     ];
//
//     const hours = [1, 2, 3, 4];
//     const times = ['8:30 AM', '9:45 AM', '12:00 PM', '1:30 PM'];
//
//     testNames.forEach((name, index) => {
//         const randomHour = hours[Math.floor(Math.random() * hours.length)];
//         const randomTime = times[Math.floor(Math.random() * times.length)];
//
//         attendanceData.push({
//             id: Date.now() + index,
//             name: name,
//             timestamp: new Date().toISOString(),
//             time: randomTime,
//             period: randomHour
//         });
//     });
//
//     saveAttendanceData();
// }

// QR Code Generation
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');

    // Generate a unique session ID for today
    const today = getTodayKey();
    const currentUrl = window.location.href.split('?')[0]; // Get base URL without params
    const signInUrl = `${currentUrl}?signin=true&date=${today}`;

    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        qrContainer.parentElement.innerHTML = '<p style="color: #ef4444; padding: 2rem;">Error: QR Code library failed to load.<br>Please check your internet connection.</p>';
        return;
    }

    try {
        // Clear any existing QR code
        qrContainer.innerHTML = '';

        // Generate QR code using QRCodeJS library
        new QRCode(qrContainer, {
            text: signInUrl,
            width: CONFIG.qrSize,
            height: CONFIG.qrSize,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        console.log('QR Code generated successfully');
    } catch (error) {
        console.error('QR Code generation failed:', error);
        qrContainer.parentElement.innerHTML = '<p style="color: #ef4444; padding: 2rem;">Error generating QR code:<br>' + error.message + '</p>';
    }
}

// Check if user arrived via QR code scan
function checkForAutoSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signin') === 'true') {
        // Enable student mode - hide header and attendance list
        document.body.classList.add('student-mode');
        showSignInModal();
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// For testing: Allow clicking QR code to open modal
document.addEventListener('DOMContentLoaded', () => {
    const qrWrapper = document.querySelector('.qr-wrapper');
    if (qrWrapper) {
        qrWrapper.style.cursor = 'pointer';
        qrWrapper.addEventListener('click', () => {
            showSignInModal();
        });
    }
});

// Date and Time Display
function updateDateDisplay() {
    const dateHeaderElement = document.getElementById('current-date-header');
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    if (dateHeaderElement) {
        dateHeaderElement.textContent = today;
    }
}

function updateClock() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        timeElement.textContent = `${displayHours}:${minutes} ${ampm}`;
    }
}

// Update clock every second
setInterval(updateClock, 1000);

// Check if we need to switch hour filters every 5 minutes
setInterval(checkAndUpdateHourFilter, 300000); // Check every 5 minutes (300000ms)

function checkAndUpdateHourFilter() {
    const now = new Date();
    const currentPeriod = getCurrentPeriod(now);
    let newFilter;

    if (currentPeriod !== null) {
        newFilter = currentPeriod.toString();
    } else {
        newFilter = 'all';
    }

    // Only update if it's different from current filter
    if (newFilter !== currentHourFilter) {
        console.log(`Auto-switching filter from ${currentHourFilter} to ${newFilter}`);
        setHourFilter(newFilter);
    }
}

// Event Listeners
function setupEventListeners() {
    // Sign-in form
    document.getElementById('signin-form').addEventListener('submit', handleSignIn);

    // Modal controls
    document.getElementById('cancel-btn').addEventListener('click', hideSignInModal);
    document.getElementById('done-btn').addEventListener('click', hideSignInModal);

    // Teacher controls
    document.getElementById('export-btn').addEventListener('click', exportToCSV);
    document.getElementById('clear-btn').addEventListener('click', clearAllAttendance);

    // Hour filter buttons
    document.querySelectorAll('.hour-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hour = e.target.getAttribute('data-hour');
            setHourFilter(hour);
        });
    });

    // Close modal on outside click
    document.getElementById('signin-modal').addEventListener('click', (e) => {
        if (e.target.id === 'signin-modal') {
            hideSignInModal();
        }
    });
}

// Hour Filter Functions
function setHourFilter(hour) {
    currentHourFilter = hour;

    // Update active button
    document.querySelectorAll('.hour-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-hour') === hour) {
            btn.classList.add('active');
        }
    });

    // Re-render the list
    renderAttendanceList();
}

// Modal Management
function showSignInModal() {
    const modal = document.getElementById('signin-modal');
    modal.classList.add('active');
    document.getElementById('name-input').focus();
}

function hideSignInModal() {
    const modal = document.getElementById('signin-modal');
    modal.classList.remove('active');
    clearForm();

    // Reset views
    document.getElementById('signin-form-view').style.display = 'block';
    document.getElementById('success-view').style.display = 'none';

    // If in student mode, close the window/tab after a delay
    if (document.body.classList.contains('student-mode')) {
        setTimeout(() => {
            window.close();
            // If window.close() doesn't work (some browsers block it), show a message
            setTimeout(() => {
                document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;"><div><h1 style="color: var(--accent-primary); margin-bottom: 1rem;">Thanks!</h1><p style="color: var(--text-secondary);">You can close this tab now.</p></div></div>';
            }, 100);
        }, 500);
    }
}

function clearForm() {
    document.getElementById('name-input').value = '';
    document.getElementById('error-message').textContent = '';
}

// Name Validation
function validateName(name) {
    const errors = [];

    // Trim whitespace
    name = name.trim();

    // Check if empty
    if (!name) {
        errors.push('Please enter your name');
        return { valid: false, errors };
    }

    // Split into words
    const words = name.split(/\s+/);

    // Check for exactly 2 words
    if (words.length !== 2) {
        errors.push('Please enter exactly two names (first and last)');
        return { valid: false, errors };
    }

    // Check each word for numbers
    const hasNumbers = words.some(word => /\d/.test(word));
    if (hasNumbers) {
        errors.push('Names cannot contain numbers');
        return { valid: false, errors };
    }

    // Check for valid characters (letters, hyphens, apostrophes)
    const validNamePattern = /^[a-zA-Z\-']+$/;
    const invalidWords = words.filter(word => !validNamePattern.test(word));
    if (invalidWords.length > 0) {
        errors.push('Names can only contain letters, hyphens, and apostrophes');
        return { valid: false, errors };
    }

    // Check minimum length for each word
    const shortWords = words.filter(word => word.length < 2);
    if (shortWords.length > 0) {
        errors.push('Each name must be at least 2 characters long');
        return { valid: false, errors };
    }

    return { valid: true, errors: [], name: name };
}

// Sign In Handler
async function handleSignIn(e) {
    e.preventDefault();

    const nameInput = document.getElementById('name-input');
    const errorElement = document.getElementById('error-message');
    const validation = validateName(nameInput.value);

    if (!validation.valid) {
        errorElement.textContent = validation.errors.join('. ');
        nameInput.classList.add('error');
        return;
    }

    // Check for duplicate
    const normalizedName = validation.name.toLowerCase();
    const isDuplicate = attendanceData.some(
        entry => entry.name.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
        errorElement.textContent = 'You have already signed in today';
        nameInput.classList.add('error');
        return;
    }

    // Determine which hour/period this is
    const now = new Date();
    const currentHour = getCurrentPeriod(now);

    // Add attendance entry
    const entry = {
        id: Date.now(),
        name: validation.name,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }),
        period: currentHour
    };

    // Save to Firebase (real-time listener will update the UI automatically)
    await saveAttendanceData(entry);

    // Show success feedback
    showSuccessAnimation(validation.name);
}

// Success Animation
function showSuccessAnimation(studentName) {
    console.log('Student signed in successfully!');

    // Hide form view, show success view
    document.getElementById('signin-form-view').style.display = 'none';
    document.getElementById('success-view').style.display = 'block';
    document.getElementById('success-name').textContent = studentName;

    // Auto-close after 3 seconds for students
    if (document.body.classList.contains('student-mode')) {
        setTimeout(() => {
            hideSignInModal();
        }, 3000);
    }
}

// Attendance List Rendering
function renderAttendanceList() {
    const listElement = document.getElementById('attendance-list');
    const emptyState = document.getElementById('empty-state');
    const headerCountElement = document.getElementById('header-count');

    // Remove duplicates just in case (defensive programming)
    const uniqueAttendance = [];
    const seenNames = new Set();

    for (const entry of attendanceData) {
        const normalizedName = entry.name.toLowerCase();
        if (!seenNames.has(normalizedName)) {
            seenNames.add(normalizedName);
            uniqueAttendance.push(entry);
        }
    }

    // Update attendanceData if duplicates were found
    if (uniqueAttendance.length !== attendanceData.length) {
        attendanceData = uniqueAttendance;
        saveAttendanceData();
    }

    // Always use the actual length of attendanceData array
    const actualCount = attendanceData.length;

    // Update only the header count (always show total)
    if (headerCountElement) {
        headerCountElement.textContent = actualCount;
    }

    // Filter by hour if needed
    let filteredData = attendanceData;
    if (currentHourFilter !== 'all') {
        const filterHour = parseInt(currentHourFilter);
        filteredData = attendanceData.filter(entry => entry.period === filterHour);
        console.log('Filtering by hour:', filterHour);
        console.log('Total students:', attendanceData.length);
        console.log('Filtered students:', filteredData.length);
        console.log('Sample entry:', attendanceData[0]);
    }

    // Check if filtered data is empty
    if (filteredData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (listElement) listElement.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Sort alphabetically by last name
    const sortedAttendance = [...filteredData].sort((a, b) => {
        const lastNameA = a.name.split(' ').pop().toLowerCase();
        const lastNameB = b.name.split(' ').pop().toLowerCase();
        return lastNameA.localeCompare(lastNameB);
    });

    // Calculate rows needed for 3 columns
    // We want to distribute evenly, so calculate based on filling columns from left to right
    const numColumns = 3;
    const totalStudents = sortedAttendance.length;

    // For even distribution, we need enough rows so that items don't overflow into 2 columns only
    // The grid will fill column by column, so we need rows = ceil(students / columns)
    // But to force 3 columns, we set max rows that ensures the 3rd column gets items
    let rowsNeeded;
    if (totalStudents <= numColumns) {
        // 1-3 students: 1 row, spreads across columns
        rowsNeeded = 1;
    } else {
        // More than 3: calculate minimum rows to use all columns
        rowsNeeded = Math.ceil(totalStudents / numColumns);
    }

    // Update the grid rows dynamically
    listElement.style.gridTemplateRows = `repeat(${rowsNeeded}, auto)`;

    // Just use the sorted array - CSS grid will handle the column layout
    listElement.innerHTML = sortedAttendance.map(entry => {
        const periodNumber = entry.period || '?';
        return `
            <div class="attendance-item">
                <div class="attendance-avatar">${periodNumber}</div>
                <div class="attendance-info">
                    <div class="attendance-name">${entry.name}</div>
                </div>
                <button class="delete-btn" onclick="deleteStudent(${entry.id})" title="Delete this entry">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 4 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// Determine which class period the current time falls into
function getCurrentPeriod(date) {
    const timeStr = date.toTimeString().substring(0, 5); // Format: "HH:MM"

    for (const period of CONFIG.classPeriods) {
        if (timeStr >= period.start && timeStr < period.end) {
            return period.hour;
        }
    }

    // If outside all periods, return null or the closest one
    return null;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Data Persistence - Firebase Firestore with Real-time Updates
function loadAttendanceData() {
    const today = getTodayKey();

    // Wait for Firebase to be ready
    if (!window.firebaseModules || !window.db) {
        console.error('Firebase not initialized yet');
        setTimeout(() => loadAttendanceData(), 100);
        return;
    }

    try {
        const { collection, query, orderBy, onSnapshot } = window.firebaseModules;
        const attendanceRef = collection(window.db, 'attendance');
        const q = query(attendanceRef, orderBy('timestamp', 'desc'));

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allEntries = [];

            querySnapshot.forEach((doc) => {
                allEntries.push({
                    firestoreId: doc.id, // Store Firestore document ID
                    ...doc.data()
                });
            });

            // Load only today's entries into attendanceData
            attendanceData = allEntries.filter(entry => entry.date === today);

            console.log(`Real-time update: ${attendanceData.length} entries for today`);

            // Re-render the list with new data
            renderAttendanceList();
        }, (error) => {
            console.error('Error in real-time listener:', error);
        });

        console.log('Real-time listener attached to Firebase');

        // Store unsubscribe function globally in case we need it
        window.firestoreUnsubscribe = unsubscribe;
    } catch (error) {
        console.error('Error setting up Firebase listener:', error);
        // Fallback to empty array if Firebase fails
        attendanceData = [];
    }
}

async function saveAttendanceData(newEntry) {
    // Save a single new entry to Firestore
    // This function now only handles adding new entries, not bulk updates
    if (!newEntry) return;

    const today = getTodayKey();

    try {
        const { collection, addDoc } = window.firebaseModules;
        const attendanceRef = collection(window.db, 'attendance');

        const entryToSave = {
            ...newEntry,
            date: today
        };

        const docRef = await addDoc(attendanceRef, entryToSave);
        console.log('Entry saved to Firebase with ID:', docRef.id);

        // Update the local entry with Firestore ID
        newEntry.firestoreId = docRef.id;

    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Failed to save attendance. Please check your connection.');
    }
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Export to CSV
async function exportToCSV() {
    // Load ALL attendance data from Firebase
    let allEntries = [];

    try {
        const { collection, getDocs, query, orderBy } = window.firebaseModules;
        const attendanceRef = collection(window.db, 'attendance');
        const q = query(attendanceRef, orderBy('timestamp', 'desc'));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            allEntries.push(doc.data());
        });

    } catch (error) {
        console.error('Error loading data for export:', error);
        alert('Failed to load attendance data for export. Please check your connection.');
        return;
    }

    if (allEntries.length === 0) {
        alert('No attendance data to export');
        return;
    }

    const headers = ['Name', 'Date', 'Time', 'Hour'];

    // Sort by date (newest first), then by last name
    const sortedData = [...allEntries].sort((a, b) => {
        // First sort by date (descending)
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        // Then by last name (ascending)
        const lastNameA = a.name.split(' ').pop().toLowerCase();
        const lastNameB = b.name.split(' ').pop().toLowerCase();
        return lastNameA.localeCompare(lastNameB);
    });

    const csvContent = [
        headers.join(','),
        ...sortedData.map(entry => {
            const period = entry.period || 'N/A';
            const date = entry.date || 'N/A';
            // Convert date from YYYY-MM-DD to readable format
            const dateObj = new Date(date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US');
            return `"${entry.name}","${formattedDate}","${entry.time}","${period}"`;
        })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = getTodayKey();
    a.download = `attendance-all-data-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Delete individual student
async function deleteStudent(studentId) {
    const student = attendanceData.find(entry => entry.id === studentId);
    if (!student) return;

    const confirmed = confirm(
        `Remove ${student.name} from today's attendance?`
    );

    if (confirmed) {
        try {
            // Delete from Firebase (real-time listener will update UI automatically)
            if (student.firestoreId) {
                const { doc, deleteDoc } = window.firebaseModules;
                await deleteDoc(doc(window.db, 'attendance', student.firestoreId));
                console.log('Entry deleted from Firebase');
            }

        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    }
}

// Clear All Attendance
async function clearAllAttendance() {
    if (attendanceData.length === 0) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to clear all ${attendanceData.length} attendance records for today? This cannot be undone.`
    );

    if (confirmed) {
        try {
            // Delete all today's entries from Firebase
            const { doc, deleteDoc } = window.firebaseModules;

            const deletePromises = attendanceData
                .filter(entry => entry.firestoreId)
                .map(entry => deleteDoc(doc(window.db, 'attendance', entry.firestoreId)));

            await Promise.all(deletePromises);
            console.log(`Deleted ${deletePromises.length} entries from Firebase`);
            // Real-time listener will update UI automatically

        } catch (error) {
            console.error('Error clearing attendance:', error);
            alert('Failed to clear all attendance. Please try again.');
        }
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape') {
        hideSignInModal();
    }
});
