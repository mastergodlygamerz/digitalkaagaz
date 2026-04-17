// Acadify - Coaching Institute Management Tool

const STORAGE_KEYS = {
    CHAT: 'acadify_chat_',
    CALENDAR: 'acadify_calendar',
    ATTENDANCE: 'acadify_attendance_'
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    initCalendar();
    initAttendance();
});

// ==================== CHAT FUNCTIONALITY ====================

function initChat() {
    const classSelect = document.getElementById('classSelect');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatWindow = document.getElementById('chatWindow');

    // Load chat on class change
    classSelect.addEventListener('change', (e) => {
        const selectedClass = e.target.value;
        if (selectedClass) {
            loadChat(selectedClass);
        } else {
            chatWindow.innerHTML = '';
        }
    });

    // Send message
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function sendChatMessage() {
    const classSelect = document.getElementById('classSelect');
    const chatInput = document.getElementById('chatInput');
    const selectedClass = classSelect.value;
    const message = chatInput.value.trim();

    if (!selectedClass) {
        alert('Please select a class first');
        return;
    }

    if (!message) {
        return;
    }

    const storageKey = STORAGE_KEYS.CHAT + selectedClass;
    const chatHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const newMessage = {
        id: Date.now(),
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        role: 'student' // Can be extended to support teacher role
    };

    chatHistory.push(newMessage);
    localStorage.setItem(storageKey, JSON.stringify(chatHistory));

    chatInput.value = '';
    loadChat(selectedClass);
    
    // Auto-scroll to bottom
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function loadChat(selectedClass) {
    const storageKey = STORAGE_KEYS.CHAT + selectedClass;
    const chatHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const chatWindow = document.getElementById('chatWindow');

    chatWindow.innerHTML = '';

    if (chatHistory.length === 0) {
        chatWindow.innerHTML = '<div style="color: rgba(234,246,255,0.4); text-align: center; padding: 20px;">No messages yet. Start a conversation!</div>';
        return;
    }

    chatHistory.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = `chat-message ${msg.role}`;
        msgEl.innerHTML = `
            <strong style="color: ${msg.role === 'teacher' ? '#7c3aed' : '#00e5ff'}">${msg.role === 'teacher' ? 'Teacher' : 'Student'}:</strong> ${msg.text}
            <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 4px;">${msg.timestamp}</div>
        `;
        chatWindow.appendChild(msgEl);
    });
}

// ==================== CALENDAR FUNCTIONALITY ====================

function initCalendar() {
    const addEventBtn = document.getElementById('addEventBtn');
    const clearEventsBtn = document.getElementById('clearEventsBtn');

    addEventBtn.addEventListener('click', addEvent);
    clearEventsBtn.addEventListener('click', clearAllEvents);

    // Load calendar on page load
    loadCalendar();
}

function addEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const type = document.getElementById('eventType').value;

    if (!title || !date || !time) {
        alert('Please fill all fields');
        return;
    }

    const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');

    const newEvent = {
        id: Date.now(),
        title,
        date,
        time,
        type,
        createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));

    // Clear form
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    document.getElementById('eventType').value = 'exam';

    loadCalendar();
}

function loadCalendar() {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');
    const calendarList = document.getElementById('calendarList');

    const listHTML = '<h3>Upcoming Events</h3>' + (
        events.length === 0
            ? '<div style="color: rgba(234,246,255,0.4); padding: 20px; text-align: center;">No events scheduled</div>'
            : events.map(event => {
                const typeEmoji = {
                    'exam': '📝',
                    'assignment': '📋',
                    'class': '👥',
                    'other': '📌'
                }[event.type] || '📌';

                return `
                    <div class="cal-row">
                        <div class="cal-row-content">
                            <div class="cal-row-title">${typeEmoji} ${event.title}</div>
                            <div class="cal-row-meta">${event.date} at ${event.time}</div>
                        </div>
                        <div class="cal-row-actions">
                            <button class="btn-small danger" onclick="deleteEvent(${event.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('')
    );

    calendarList.innerHTML = listHTML;
}

function deleteEvent(eventId) {
    let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
    loadCalendar();
}

function clearAllEvents() {
    if (confirm('Are you sure you want to delete all events?')) {
        localStorage.removeItem(STORAGE_KEYS.CALENDAR);
        loadCalendar();
    }
}

// ==================== ATTENDANCE FUNCTIONALITY ====================

const STUDENTS = {
    '10A': ['Aarav', 'Bhavna', 'Chirag', 'Diya', 'Ethan', 'Farida', 'Gaurav', 'Hema'],
    '10B': ['Isha', 'Jatin', 'Karan', 'Lata', 'Meera', 'Nikhil', 'Olivia', 'Prem'],
    '11A': ['Quresh', 'Ritika', 'Sameer', 'Tara', 'Uday', 'Vicky', 'Wira', 'Xander'],
    '12A': ['Yara', 'Zara', 'Aditya', 'Bhumika', 'Chandan', 'Deepika', 'Eshan', 'Fiona']
};

function initAttendance() {
    const attendanceClass = document.getElementById('attendanceClass');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    const markAllPresentBtn = document.getElementById('markAllPresentBtn');

    attendanceClass.addEventListener('change', loadAttendanceGrid);
    saveAttendanceBtn.addEventListener('click', saveAttendance);
    markAllPresentBtn.addEventListener('click', markAllPresent);
}

function loadAttendanceGrid() {
    const selectedClass = document.getElementById('attendanceClass').value;
    const attendanceGrid = document.getElementById('attendanceGrid');

    if (!selectedClass) {
        attendanceGrid.innerHTML = '';
        return;
    }

    const students = STUDENTS[selectedClass] || [];
    const storageKey = STORAGE_KEYS.ATTENDANCE + selectedClass;
    const attendance = JSON.parse(localStorage.getItem(storageKey) || '{}');

    let html = '';
    students.forEach(student => {
        const status = attendance[student] || 'unmarked';
        const buttonClass = status === 'present' ? 'present' : status === 'absent' ? 'absent' : '';
        
        html += `
            <button class="attendance-btn ${buttonClass}" data-student="${student}" onclick="toggleAttendance('${student}')">
                ${student}
            </button>
        `;
    });

    attendanceGrid.innerHTML = html;
}

function toggleAttendance(student) {
    const selectedClass = document.getElementById('attendanceClass').value;
    const storageKey = STORAGE_KEYS.ATTENDANCE + selectedClass;
    const attendance = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const currentStatus = attendance[student] || 'unmarked';
    const nextStatus = currentStatus === 'unmarked' ? 'present' : currentStatus === 'present' ? 'absent' : 'unmarked';
    
    attendance[student] = nextStatus;
    localStorage.setItem(storageKey, JSON.stringify(attendance));

    loadAttendanceGrid();
}

function markAllPresent() {
    const selectedClass = document.getElementById('attendanceClass').value;
    
    if (!selectedClass) {
        alert('Please select a class first');
        return;
    }

    const students = STUDENTS[selectedClass] || [];
    const storageKey = STORAGE_KEYS.ATTENDANCE + selectedClass;
    const attendance = {};

    students.forEach(student => {
        attendance[student] = 'present';
    });

    localStorage.setItem(storageKey, JSON.stringify(attendance));
    loadAttendanceGrid();
}

function saveAttendance() {
    const selectedClass = document.getElementById('attendanceClass').value;
    
    if (!selectedClass) {
        alert('Please select a class first');
        return;
    }

    const storageKey = STORAGE_KEYS.ATTENDANCE + selectedClass;
    const attendance = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const date = new Date().toISOString().split('T')[0];

    const attendanceRecord = JSON.parse(localStorage.getItem('acadify_attendance_records') || '{}');
    attendanceRecord[`${selectedClass}_${date}`] = attendance;
    localStorage.setItem('acadify_attendance_records', JSON.stringify(attendanceRecord));

    alert('Attendance saved for ' + selectedClass + ' on ' + date);
}
