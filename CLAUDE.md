# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QR Attendance is a web-based attendance tracking system for high school classrooms. Students scan a QR code displayed on the teacher's screen and enter their name to mark attendance. The app features a split-screen interface with real-time updates and Magic UI-inspired design.

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, and JavaScript (no build tools required)
- **QR Code Generation**: qrcode.js library (v1.5.3) via CDN
- **Data Storage**: Browser localStorage (no backend required)
- **Design System**: Custom CSS with Magic UI-inspired aesthetics

## Running the Application

### For Classroom Use (Recommended)

**Windows:**
```bash
# Double-click start-server.bat
# OR run in terminal:
python -m http.server 8000
```

**Mac/Linux:**
```bash
python3 -m http.server 8000
```

Then:
1. Teacher opens `http://localhost:8000` on their computer
2. Project the screen so students can see the QR code
3. Students scan QR code with their phones (must be on same WiFi)
4. The server will display the student access URL (e.g., `http://192.168.1.100:8000`)

**IMPORTANT:** Opening `index.html` directly (file://) will NOT work for QR code scanning. You must run a local server so students can access it via HTTP on the network.

### Network Requirements

- Teacher computer and student phones must be on the **same WiFi network**
- Firewall must allow incoming connections on port 8000
- School networks may block local device communication - test before class
- Alternative: Use teacher's phone hotspot if school WiFi blocks local connections

## Architecture

### File Structure
```
index.html    - Main HTML structure
styles.css    - Magic UI-inspired styling
app.js        - Application logic and state management
```

### Key Components

**Left Side (QR Section)**:
- Displays a QR code that encodes the current page URL with `?signin=true` parameter
- Shows current date
- Has animated gradient background

**Right Side (Attendance List)**:
- Real-time list of students who have signed in
- Shows student initials in colored avatars
- Displays sign-in time for each student
- Export to CSV and Clear All controls for teachers

**Sign-In Modal**:
- Appears when QR code is scanned
- Validates name input (exactly 2 words, no numbers)
- Prevents duplicate sign-ins

### Data Flow

1. Teacher opens app and displays QR code on screen
2. QR code encodes: `{current_url}?signin=true`
3. Student scans QR code on their device
4. App detects `signin=true` parameter and shows modal
5. Student enters first and last name
6. Validation checks:
   - Exactly 2 words
   - No numbers allowed
   - Only letters, hyphens, apostrophes
   - Minimum 2 characters per word
   - No duplicate names for today
7. On success:
   - Entry saved to localStorage with timestamp
   - Attendance list updates in real-time
   - Modal closes

### Data Persistence

Attendance data is stored in localStorage with the key `qr-attendance`. Data structure:
```javascript
{
  date: "2025-10-22",  // YYYY-MM-DD format
  entries: [
    {
      id: 1729612800000,
      name: "John Doe",
      timestamp: "2025-10-22T09:30:00.000Z",
      time: "9:30 AM"
    }
  ]
}
```

Data automatically resets each day - when the app loads, it checks if stored data matches today's date. If not, it starts fresh.

### Name Validation Rules

The `validateName()` function enforces:
- Exactly 2 words (first and last name)
- No numeric characters
- Only letters, hyphens (-), and apostrophes (')
- Each word must be at least 2 characters
- Names are case-insensitive for duplicate checking

### Design Philosophy

Inspired by Magic UI (magicui.design):
- Dark theme with gradient accents (indigo to purple)
- Smooth animations and transitions
- Glassmorphism effects with backdrop blur
- Modern spacing and typography
- Subtle hover states and micro-interactions
- Responsive design for mobile and desktop

## Teacher Controls

**Export CSV**: Downloads attendance data as CSV file with format:
```
Name,Date,Time
"John Doe","10/22/2025","9:30 AM"
```

**Clear All**: Removes all attendance entries for the day (with confirmation)

## Browser Compatibility

Requires modern browser with:
- ES6+ JavaScript support
- CSS Grid and Flexbox
- localStorage API
- Canvas API (for QR code generation)
