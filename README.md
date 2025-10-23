# QR Attendance System

A simple, modern web-based attendance tracking system for classrooms. Students scan a QR code and enter their name to mark attendance.

## Quick Start

### Step 1: Start the Server

**Windows:**
1. Double-click `start-server.bat`
2. The script will automatically detect and use Node.js or Python
3. The server will show you two URLs:
   - **Teacher URL** (for your computer): `http://localhost:8000`
   - **Student URL** (for student phones): `http://YOUR-IP:8000`

**If you see an error about missing Node.js/Python:**
- You have Node.js installed (version 22.20.0 detected)
- Just make sure you're in the correct folder when running the script

**Alternative - Run directly with Node.js:**
1. Open Command Prompt in this folder
2. Run: `node server.js`

**Mac/Linux:**
1. Open Terminal in this folder
2. Run: `node server.js`
   OR: `python3 -m http.server 8000`
3. Find your IP address:
   - Mac: System Preferences → Network
   - Linux: Run: `hostname -I`

### Step 2: Access on Teacher Computer

1. Open your browser
2. Go to `http://localhost:8000`
3. **Project this screen** for students to see the QR code

### Step 3: Students Sign In

1. Students must be on the **SAME WiFi network** as your computer
2. Students scan the QR code with their phone camera
3. They enter their first and last name
4. Their name appears instantly on your projected screen!

## Important Notes

### WiFi Network
- Your computer and all student phones **MUST** be on the same WiFi network
- School guest networks often block device-to-device communication
- If it doesn't work, ask your IT department to allow local network access
- Alternative: Use your phone's hotspot (students connect to your hotspot)

### Firewall
If students can't access the page:
1. Windows: Allow Python through Windows Firewall
2. Check Windows Defender Firewall settings
3. Allow incoming connections on port 8000

### Daily Reset
- Attendance data automatically resets each day
- Data is stored in the browser (no database needed)
- Export to CSV before closing if you want to save records

## Features

- ✅ Real-time attendance updates
- ✅ Name validation (exactly 2 words, no numbers)
- ✅ Duplicate prevention
- ✅ Export to CSV
- ✅ Modern, clean UI
- ✅ Mobile-friendly
- ✅ No internet required (after initial load)
- ✅ No database needed

## Teacher Controls

- **Export CSV**: Download attendance as a spreadsheet
- **Clear All**: Reset all attendance for the day

## Troubleshooting

**QR code doesn't appear:**
- Check your internet connection (needed to load QR library first time)
- Refresh the page

**Students can't scan QR code:**
- Make sure you're using `start-server.bat` (not opening the file directly)
- Verify students are on the same WiFi network
- Check the Student URL shown in the terminal

**"This site can't be reached" error:**
- Check Windows Firewall settings
- Make sure the server is still running
- Try using your computer's IP address instead of localhost

**Students see old QR code:**
- Tell them to refresh the page
- The QR code includes today's date, so it changes daily

## System Requirements

- **Teacher Computer**: Windows/Mac/Linux with Python installed
- **Student Phones**: Any smartphone with camera (iOS/Android)
- **Network**: WiFi network that allows local connections
- **Browser**: Chrome, Firefox, Safari, or Edge (modern versions)

## Privacy & Data

- No data leaves your computer
- No external servers or databases
- Attendance stored in browser localStorage
- Data automatically deleted after 24 hours
- Export to CSV to keep permanent records
