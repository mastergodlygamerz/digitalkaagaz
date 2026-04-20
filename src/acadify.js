// Acadify app logic migrated into src/
// Uses `window._firebase` when available, falls back to localStorage.

const STORAGE_KEYS = {
	CHAT: 'acadify_chat_',
	CALENDAR: 'acadify_calendar',
	AVAILABILITY: 'acadify_availability_'
};

function getFirebase() {
	return window._firebase || null;
}

function fbAvailable() {
	return !!(window._firebase && window._firebase.db);
}

document.addEventListener('DOMContentLoaded', () => {
	try { initChat(); } catch(e){console.warn('initChat failed',e);} 
	try { initCalendar(); } catch(e){console.warn('initCalendar failed',e);} 
	try { initAvailabilityCalendar(); } catch(e){console.warn('initAvailability failed',e);} 
});

// ==================== CHAT FUNCTIONALITY ====================

function initChat() {
	const classSelect = document.getElementById('classSelect');
	const chatInput = document.getElementById('chatInput');
	const chatSendBtn = document.getElementById('chatSendBtn');
	const chatWindow = document.getElementById('chatWindow');
	if (!classSelect) return;

	classSelect.addEventListener('change', (e) => {
		const selectedClass = e.target.value;
		if (selectedClass) {
			loadChat(selectedClass);
		} else {
			if (chatWindow) chatWindow.innerHTML = '';
		}
	});

	if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
	if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });
}

function sendChatMessage() {
	const classSelect = document.getElementById('classSelect');
	const chatInput = document.getElementById('chatInput');
	const selectedClass = classSelect ? classSelect.value : '';
	const message = chatInput ? chatInput.value.trim() : '';

	if (!selectedClass) { alert('Please select a class first'); return; }
	if (!message) return;

	const storageKey = STORAGE_KEYS.CHAT + selectedClass;

	if (fbAvailable()) {
		const fb = getFirebase();
		const instCode = localStorage.getItem('ac_institute_code') || 'public';
		fb.addDoc(fb.collection(fb.db, `institutes/${instCode}/chats`), {
			text: message,
			role: 'student',
			createdAt: fb.serverTimestamp()
		}).then(() => {
			if (chatInput) chatInput.value = '';
			loadChat(selectedClass);
		}).catch(err => { console.error('chat add failed', err); alert('Failed to send message'); });
		return;
	}

	const chatHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
	const newMessage = { id: Date.now(), text: message, timestamp: new Date().toLocaleTimeString(), role: 'student' };
	chatHistory.push(newMessage);
	localStorage.setItem(storageKey, JSON.stringify(chatHistory));
	if (chatInput) chatInput.value = '';
	loadChat(selectedClass);
	const chatWindow = document.getElementById('chatWindow');
	if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function loadChat(selectedClass) {
	const chatWindow = document.getElementById('chatWindow');
	if (!chatWindow) return;
	chatWindow.innerHTML = '';

	if (fbAvailable()) {
		const fb = getFirebase();
		const instCode = localStorage.getItem('ac_institute_code') || 'public';
		fb.getDocs(fb.query(fb.collection(fb.db, `institutes/${instCode}/chats`), fb.orderBy('createdAt', 'asc'), fb.limit(200)))
			.then(snap => {
				if (snap.empty) {
					chatWindow.innerHTML = '<div style="color: rgba(234,246,255,0.4); text-align: center; padding: 20px;">No messages yet. Start a conversation!</div>';
					return;
				}
				snap.forEach(doc => {
					const msg = doc.data();
					const msgEl = document.createElement('div');
					msgEl.className = `chat-message ${msg.role || 'student'}`;
					msgEl.innerHTML = `<strong style="color: ${msg.role === 'teacher' ? '#7c3aed' : '#00e5ff'}">${msg.role === 'teacher' ? 'Teacher' : 'Student'}:</strong> ${msg.text}<div style="font-size:0.7rem;opacity:0.6;margin-top:4px;">${msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleTimeString() : ''}</div>`;
					chatWindow.appendChild(msgEl);
				});
			}).catch(err => { console.error('loadChat failed', err); chatWindow.innerHTML = '<div style="color: rgba(234,246,255,0.4); text-align: center; padding: 20px;">Unable to load messages.</div>'; });
		return;
	}

	const storageKey = STORAGE_KEYS.CHAT + selectedClass;
	const chatHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
	if (chatHistory.length === 0) {
		chatWindow.innerHTML = '<div style="color: rgba(234,246,255,0.4); text-align: center; padding: 20px;">No messages yet. Start a conversation!</div>';
		return;
	}
	chatHistory.forEach(msg => {
		const msgEl = document.createElement('div');
		msgEl.className = `chat-message ${msg.role}`;
		msgEl.innerHTML = `<strong style="color: ${msg.role === 'teacher' ? '#7c3aed' : '#00e5ff'}">${msg.role === 'teacher' ? 'Teacher' : 'Student'}:</strong> ${msg.text}<div style="font-size: 0.7rem; opacity: 0.6; margin-top: 4px;">${msg.timestamp}</div>`;
		chatWindow.appendChild(msgEl);
	});
}

// ==================== CALENDAR FUNCTIONALITY ====================

function initCalendar() {
	const addEventBtn = document.getElementById('addEventBtn');
	const clearEventsBtn = document.getElementById('clearEventsBtn');
	if (addEventBtn) addEventBtn.addEventListener('click', addEvent);
	if (clearEventsBtn) clearEventsBtn.addEventListener('click', clearAllEvents);
	loadCalendar();
}

function addEvent() {
	const title = document.getElementById('eventTitle').value.trim();
	const date = document.getElementById('eventDate').value;
	const time = document.getElementById('eventTime').value;
	const type = document.getElementById('eventType').value;

	if (!title || !date || !time) { alert('Please fill all fields'); return; }

	const newEvent = { id: Date.now(), title, date, time, type, createdAt: new Date().toISOString() };

	if (fbAvailable()) {
		const fb = getFirebase();
		const instCode = localStorage.getItem('ac_institute_code') || 'public';
		fb.addDoc(fb.collection(fb.db, `institutes/${instCode}/events`), Object.assign({}, newEvent, { createdAt: fb.serverTimestamp() }))
			.then(() => { loadCalendar(); })
			.catch(err => { console.error('addEvent failed', err); alert('Failed to add event'); });
		return;
	}

	const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');
	events.push(newEvent);
	events.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
	localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
	document.getElementById('eventTitle').value = '';
	document.getElementById('eventDate').value = '';
	document.getElementById('eventTime').value = '';
	document.getElementById('eventType').value = 'exam';
	loadCalendar();
}

function loadCalendar() {
	const calendarList = document.getElementById('calendarList');
	if (!calendarList) return;

	if (fbAvailable()) {
		const fb = getFirebase();
		const instCode = localStorage.getItem('ac_institute_code') || 'public';
		fb.getDocs(fb.query(fb.collection(fb.db, `institutes/${instCode}/events`), fb.orderBy('createdAt', 'asc')))
			.then(snap => {
				const listHTML = '<h3>Upcoming Events</h3>' + (snap.empty ? '<div style="color: rgba(234,246,255,0.4); padding: 20px; text-align: center;">No events scheduled</div>' : Array.from(snap.docs).map(doc => {
					const event = doc.data();
					const typeEmoji = ({'exam':'📝','assignment':'📋','class':'👥','other':'📌'})[event.type] || '📌';
					return `<div class="cal-row"><div class="cal-row-content"><div class="cal-row-title">${typeEmoji} ${event.title}</div><div class="cal-row-meta">${event.date} at ${event.time}</div></div><div class="cal-row-actions"><button class="btn-small danger" onclick="deleteEvent(${event.id})">Delete</button></div></div>`;
				}).join(''));
				calendarList.innerHTML = listHTML;
			}).catch(err => { console.error('loadCalendar failed', err); calendarList.innerHTML = '<h3>Upcoming Events</h3><div style="color: rgba(234,246,255,0.4); padding: 20px; text-align: center;">Unable to load events.</div>'; });
		return;
	}

	const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');
	const listHTML = '<h3>Upcoming Events</h3>' + (events.length === 0 ? '<div style="color: rgba(234,246,255,0.4); padding: 20px; text-align: center;">No events scheduled</div>' : events.map(event => {
		const typeEmoji = ({'exam':'📝','assignment':'📋','class':'👥','other':'📌'})[event.type] || '📌';
		return `<div class="cal-row"><div class="cal-row-content"><div class="cal-row-title">${typeEmoji} ${event.title}</div><div class="cal-row-meta">${event.date} at ${event.time}</div></div><div class="cal-row-actions"><button class="btn-small danger" onclick="deleteEvent(${event.id})">Delete</button></div></div>`;
	}).join(''));
	calendarList.innerHTML = listHTML;
}

function deleteEvent(eventId) {
	if (fbAvailable()) { console.warn('deleteEvent not implemented for Firestore in this migration'); }
	let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDAR) || '[]');
	events = events.filter(e => e.id !== eventId);
	localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
	loadCalendar();
}

function clearAllEvents() { if (confirm('Are you sure you want to delete all events?')) { localStorage.removeItem(STORAGE_KEYS.CALENDAR); loadCalendar(); } }

// ==================== AVAILABILITY CALENDAR FUNCTIONALITY ====================

const TIME_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const STATUS_CYCLE = ['','available','busy','out-of-office','tentative'];
let currentWeekStart = new Date();

function initAvailabilityCalendar() {
	const userType = document.getElementById('userType');
	const availabilityClass = document.getElementById('availabilityClass');
	const prevWeekBtn = document.getElementById('prevWeekBtn');
	const nextWeekBtn = document.getElementById('nextWeekBtn');
	const saveAvailabilityBtn = document.getElementById('saveAvailabilityBtn');
	const clearAvailabilityBtn = document.getElementById('clearAvailabilityBtn');

	if (userType) userType.addEventListener('change', () => { if (userType.value) renderAvailabilityGrid(); });
	if (availabilityClass) availabilityClass.addEventListener('change', renderAvailabilityGrid);
	if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() - 7); renderAvailabilityGrid(); });
	if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() + 7); renderAvailabilityGrid(); });
	if (saveAvailabilityBtn) saveAvailabilityBtn.addEventListener('click', saveAvailability);
	if (clearAvailabilityBtn) clearAvailabilityBtn.addEventListener('click', clearAvailability);

	setCurrentWeekStart(new Date());
	renderAvailabilityGrid();
}

function setCurrentWeekStart(date) {
	const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); currentWeekStart = new Date(d.setDate(diff));
}

function getWeekString() { const weekEnd = new Date(currentWeekStart); weekEnd.setDate(weekEnd.getDate() + 4); const options = { month: 'short', day: 'numeric' }; return `${currentWeekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`; }

function renderAvailabilityGrid() {
	const userTypeVal = (document.getElementById('userType')||{}).value;
	const availabilityClassVal = (document.getElementById('availabilityClass')||{}).value;
	const grid = document.getElementById('availabilityGrid');
	const weekDisplay = document.getElementById('weekDisplay');
	if (!grid) return;
	if (!userTypeVal) { grid.innerHTML = '<div style="grid-column:1/-1;color: rgba(234,246,255,0.4); padding:20px; text-align:center;">Please select a user type first</div>'; return; }
	if (weekDisplay) weekDisplay.textContent = `Week of ${getWeekString()}`;

	const storageKey = `acadify_availability_${userTypeVal}_${availabilityClassVal || 'default'}`;
	const availability = JSON.parse(localStorage.getItem(storageKey) || '{}');

	let gridHTML = '';
	gridHTML += '<div class="availability-header"></div>';
	DAYS_OF_WEEK.forEach(day => { const date = new Date(currentWeekStart); date.setDate(currentWeekStart.getDate() + DAYS_OF_WEEK.indexOf(day)); const dateStr = date.toLocaleDateString('en-US', { month:'short', day:'numeric'}); gridHTML += `<div class="availability-header">${day}<br><span style="font-size:0.7rem;opacity:0.7;">${dateStr}</span></div>`; });

	TIME_SLOTS.forEach(timeSlot => {
		gridHTML += `<div class="availability-time">${timeSlot}</div>`;
		DAYS_OF_WEEK.forEach((day, dayIndex) => {
			const cellKey = `${currentWeekStart.toISOString().split('T')[0]}_${dayIndex}_${timeSlot}`;
			const status = availability[cellKey] || '';
			const cellClass = status ? ` ${status}` : '';
			gridHTML += `<div class="availability-cell${cellClass}" data-cell-key="${cellKey}" onclick="toggleAvailabilityStatus('${cellKey}')"></div>`;
		});
	});

	grid.innerHTML = gridHTML;
}

function toggleAvailabilityStatus(cellKey) {
	const userType = document.getElementById('userType').value;
	const availabilityClass = document.getElementById('availabilityClass').value;
	const storageKey = `acadify_availability_${userType}_${availabilityClass || 'default'}`;
	const availability = JSON.parse(localStorage.getItem(storageKey) || '{}');
	const currentStatus = availability[cellKey] || '';
	const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
	const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
	if (nextStatus === '') delete availability[cellKey]; else availability[cellKey] = nextStatus;
	localStorage.setItem(storageKey, JSON.stringify(availability));
	renderAvailabilityGrid();
}

function saveAvailability() {
	const userType = document.getElementById('userType').value;
	const availabilityClass = document.getElementById('availabilityClass').value;
	if (!userType) { alert('Please select a user type first'); return; }
	const storageKey = `acadify_availability_${userType}_${availabilityClass || 'default'}`;
	const availability = JSON.parse(localStorage.getItem(storageKey) || '{}');
	const timestamp = new Date().toISOString();
	const allRecords = JSON.parse(localStorage.getItem('acadify_availability_records') || '{}');
	const recordKey = `${userType}_${availabilityClass}_${timestamp}`;
	allRecords[recordKey] = availability;
	localStorage.setItem('acadify_availability_records', JSON.stringify(allRecords));
	alert(`✓ Availability saved for ${userType} ${availabilityClass ? '- ' + availabilityClass : ''}`);
}

function clearAvailability() { const userType = document.getElementById('userType').value; const availabilityClass = document.getElementById('availabilityClass').value; if (!userType) { alert('Please select a user type first'); return; } if (confirm('Clear all availability for this user?')) { const storageKey = `acadify_availability_${userType}_${availabilityClass || 'default'}`; localStorage.removeItem(storageKey); renderAvailabilityGrid(); } }

