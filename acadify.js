const STORAGE_KEYS={CHAT:'acadify_chat_',CALENDAR:'acadify_calendar',USER_ROLE:'acadify_user_role',USER_CLASS:'acadify_user_class',USER_BOARD:'acadify_user_board',USER_NAME:'acadify_user_name'};

// Reliable display setter - overrides ANY CSS rule
function sd(id,val){var e=document.getElementById(id);if(e)e.style.setProperty('display',val,'important');}

document.addEventListener('DOMContentLoaded',function(){checkAuthenticationStatus();});

function checkAuthenticationStatus(){
  var role=localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  var name=localStorage.getItem(STORAGE_KEYS.USER_NAME);
  var cls=localStorage.getItem(STORAGE_KEYS.USER_CLASS);
  var board=localStorage.getItem(STORAGE_KEYS.USER_BOARD);
  if(role&&name){showMainContent(role,cls,board,name);}
  else{showSignup();}
}

function showSignup(){
  sd('signupContainer','flex');
  sd('userInfoBar','none');
  sd('studentContent','none');
  sd('teacherContent','none');
}

function showMainContent(userRole,userClass,userBoard,userName){
  sd('signupContainer','none');
  sd('userInfoBar','block');
  var uit=document.getElementById('userInfoText');
  var up=document.getElementById('userProfession');
  if(userRole==='student'){
    sd('studentContent','block');
    sd('teacherContent','none');
    if(uit)uit.textContent=userName+' | Class: '+userClass+' | Board: '+userBoard;
    if(up)up.textContent='Profession: Student';
    initStudentChat(userName,userClass);
    initStudentCalendar(userName);
  }else{
    sd('studentContent','none');
    sd('teacherContent','block');
    if(uit)uit.textContent=userName;
    if(up)up.textContent='Profession: Teacher';
    initTeacherChat();
    initTeacherCalendar(userName);
  }
}

function selectRole(role){
  document.getElementById('studentRoleBtn').classList.remove('active');
  document.getElementById('teacherRoleBtn').classList.remove('active');
  if(role==='student'){
    document.getElementById('studentRoleBtn').classList.add('active');
    document.getElementById('classSelectSignupContainer').classList.add('show');
  }else{
    document.getElementById('teacherRoleBtn').classList.add('active');
    document.getElementById('classSelectSignupContainer').classList.remove('show');
  }
}

function proceedToApp(){
  var nameVal=document.getElementById('nameInput').value.trim();
  if(!nameVal){alert('Please enter your name');return;}
  var sBtn=document.getElementById('studentRoleBtn');
  var tBtn=document.getElementById('teacherRoleBtn');
  if(!sBtn.classList.contains('active')&&!tBtn.classList.contains('active')){alert('Please select a role');return;}
  if(sBtn.classList.contains('active')){
    var sc=document.getElementById('classSelectSignup').value;
    var sb=document.getElementById('boardSelectSignup').value;
    if(!sc){alert('Please select your class');return;}
    if(!sb){alert('Please select your board');return;}
    localStorage.setItem(STORAGE_KEYS.USER_NAME,nameVal);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE,'student');
    localStorage.setItem(STORAGE_KEYS.USER_CLASS,sc);
    localStorage.setItem(STORAGE_KEYS.USER_BOARD,sb);
  }else{
    localStorage.setItem(STORAGE_KEYS.USER_NAME,nameVal);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE,'teacher');
    localStorage.setItem(STORAGE_KEYS.USER_CLASS,'');
    localStorage.setItem(STORAGE_KEYS.USER_BOARD,'');
  }
  checkAuthenticationStatus();
}

function logout(){
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER_CLASS);
  localStorage.removeItem(STORAGE_KEYS.USER_BOARD);
  location.reload();
}

function initStudentChat(userName,userClass){
  var ci=document.getElementById('chatInput');
  var csb=document.getElementById('chatSendBtn');
  if(ci)ci.value='';
  if(csb)csb.onclick=function(){sendStudentChatMessage(userName,userClass);};
  var scn=document.getElementById('studentClassName');
  if(scn)scn.textContent=userClass;
  loadStudentChat(userName,userClass);
}

function sendStudentChatMessage(userName,userClass){
  var ci=document.getElementById('chatInput');
  if(!ci)return;
  var msg=ci.value.trim();
  if(!msg)return;
  var key=STORAGE_KEYS.CHAT+userName+'_'+userClass;
  var msgs=JSON.parse(localStorage.getItem(key)||'[]');
  msgs.push({role:'student',name:userName,message:msg,timestamp:new Date().toLocaleString()});
  localStorage.setItem(key,JSON.stringify(msgs));
  ci.value='';
  loadStudentChat(userName,userClass);
}

function loadStudentChat(userName,userClass){
  var cw=document.getElementById('chatWindow');
  if(!cw)return;
  var key=STORAGE_KEYS.CHAT+userName+'_'+userClass;
  var msgs=JSON.parse(localStorage.getItem(key)||'[]');
  cw.innerHTML='';
  if(msgs.length===0){cw.innerHTML='<p style="color:#999;">No messages yet. Start the conversation!</p>';return;}
  msgs.forEach(function(m){
    var d=document.createElement('div');
    d.className='chat-message'+(m.role==='teacher'?' teacher':'');
    d.innerHTML='<strong>'+(m.role==='student'?'You':'Teacher '+m.name)+':</strong> '+m.message+'<br><small style="color:#888;">'+m.timestamp+'</small>';
    cw.appendChild(d);
  });
  cw.scrollTop=cw.scrollHeight;
}

function initTeacherChat(){
  var tcs=document.getElementById('teacherClassSelect');
  if(tcs)tcs.onchange=function(){onTeacherClassSelect();};
  var tcsb=document.getElementById('teacherChatSendBtn');
  if(tcsb)tcsb.onclick=function(){sendTeacherChatMessage();};
}

function onTeacherClassSelect(){
  var tcs=document.getElementById('teacherClassSelect');
  var sc=tcs.value;
  var scs=document.getElementById('teacherSelectedClass');
  if(scs)scs.textContent=sc||'None';
  loadTeacherChat(sc);
  updateStudentsList(sc);
}

function sendTeacherChatMessage(){
  var sc=document.getElementById('teacherClassSelect').value;
  if(!sc){alert('Please select a class');return;}
  var ci=document.getElementById('teacherChatInput');
  if(!ci)return;
  var msg=ci.value.trim();
  if(!msg)return;
  var key=STORAGE_KEYS.CHAT+sc;
  var msgs=JSON.parse(localStorage.getItem(key)||'[]');
  msgs.push({role:'teacher',message:msg,timestamp:new Date().toLocaleString()});
  localStorage.setItem(key,JSON.stringify(msgs));
  ci.value='';
  loadTeacherChat(sc);
}

function loadTeacherChat(sc){
  var cw=document.getElementById('teacherChatWindow');
  if(!cw)return;
  if(!sc){cw.innerHTML='<p style="color:#666;">Select a class to view chat</p>';return;}
  var key=STORAGE_KEYS.CHAT+sc;
  var msgs=JSON.parse(localStorage.getItem(key)||'[]');
  cw.innerHTML='';
  if(msgs.length===0){cw.innerHTML='<p style="color:#999;">No messages yet</p>';return;}
  msgs.forEach(function(m){
    var d=document.createElement('div');
    d.className='chat-message'+(m.role==='teacher'?' teacher':'');
    d.innerHTML='<strong>'+(m.role==='student'?'Student':'You (Teacher)')+':</strong> '+m.message+'<br><small style="color:#888;">'+m.timestamp+'</small>';
    cw.appendChild(d);
  });
  cw.scrollTop=cw.scrollHeight;
}

function updateStudentsList(sc){
  var sl=document.getElementById('studentsList');
  if(!sl)return;
  if(!sc){sl.innerHTML='<p style="color:#666;">No class selected</p>';return;}
  var students=['Rajesh Kumar','Priya Singh','Amit Patel','Neha Verma','Vikram Reddy'];
  sl.innerHTML='<ul style="list-style:none;padding:0;margin:0;">'+students.map(function(s,i){return'<li style="padding:5px;border-bottom:1px solid rgba(0,229,255,0.1);">'+(i+1)+'. '+s+'</li>';}).join('')+'</ul>';
}

function initStudentCalendar(userName){
  var ab=document.getElementById('addEventBtn');
  var cb=document.getElementById('clearEventsBtn');
  var et=document.getElementById('eventTitle');
  var ed=document.getElementById('eventDate');
  var eti=document.getElementById('eventTime');
  if(!ab)return;
  ab.onclick=function(){
    var title=et.value.trim();
    var date=ed.value;
    var time=eti.value||'00:00';
    if(!title||!date){alert('Please fill in title and date');return;}
    var key=STORAGE_KEYS.CALENDAR+'_'+userName;
    var evts=JSON.parse(localStorage.getItem(key)||'[]');
    evts.push({id:Date.now(),title:title,date:date,time:time});
    localStorage.setItem(key,JSON.stringify(evts));
    et.value='';ed.value='';eti.value='';
    loadStudentCalendarList(userName);
  };
  if(cb)cb.onclick=function(){if(confirm('Clear all events?')){localStorage.removeItem(STORAGE_KEYS.CALENDAR+'_'+userName);loadStudentCalendarList(userName);}};
  loadStudentCalendarList(userName);
}

function loadStudentCalendarList(userName){
  var cl=document.getElementById('calendarList');
  if(!cl)return;
  var key=STORAGE_KEYS.CALENDAR+'_'+userName;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  cl.innerHTML='<h3 style="color:#00e5ff;margin-bottom:10px;">Events</h3>';
  if(evts.length===0){cl.innerHTML+='<p style="color:#999;">No events scheduled</p>';return;}
  evts.forEach(function(e){
    var d=document.createElement('div');
    d.style.cssText='padding:8px;background:rgba(0,229,255,0.05);margin-bottom:8px;border-radius:6px;border-left:2px solid rgba(0,229,255,0.3);';
    var safeName=userName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    d.innerHTML='<strong style="color:#eaf6ff;">'+e.title+'</strong><br><small style="color:#888;">'+e.date+' at '+e.time+'</small><br><button onclick="deleteStudentEvent('+e.id+',\''+safeName+'\')" style="margin-top:5px;padding:3px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:3px;cursor:pointer;font-size:12px;">Delete</button>';
    cl.appendChild(d);
  });
}

function deleteStudentEvent(eventId,userName){
  var key=STORAGE_KEYS.CALENDAR+'_'+userName;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==eventId;})));
  loadStudentCalendarList(userName);
}

function initTeacherCalendar(userName){
  var ab=document.getElementById('teacherAddEventBtn');
  var cb=document.getElementById('teacherClearEventsBtn');
  var et=document.getElementById('teacherEventTitle');
  var ed=document.getElementById('teacherEventDate');
  var eti=document.getElementById('teacherEventTime');
  if(!ab)return;
  ab.onclick=function(){
    var title=et.value.trim();
    var date=ed.value;
    var time=eti.value||'00:00';
    if(!title||!date){alert('Please fill in title and date');return;}
    var key=STORAGE_KEYS.CALENDAR+'_'+userName;
    var evts=JSON.parse(localStorage.getItem(key)||'[]');
    evts.push({id:Date.now(),title:title,date:date,time:time});
    localStorage.setItem(key,JSON.stringify(evts));
    et.value='';ed.value='';eti.value='';
    loadTeacherCalendarList(userName);
  };
  if(cb)cb.onclick=function(){if(confirm('Clear all events?')){localStorage.removeItem(STORAGE_KEYS.CALENDAR+'_'+userName);loadTeacherCalendarList(userName);}};
  loadTeacherCalendarList(userName);
}

function loadTeacherCalendarList(userName){
  var cl=document.getElementById('teacherCalendarList');
  if(!cl)return;
  var key=STORAGE_KEYS.CALENDAR+'_'+userName;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  cl.innerHTML='<h3 style="color:#00e5ff;margin-bottom:10px;">Events</h3>';
  if(evts.length===0){cl.innerHTML+='<p style="color:#999;">No events scheduled</p>';return;}
  evts.forEach(function(e){
    var d=document.createElement('div');
    d.style.cssText='padding:8px;background:rgba(0,229,255,0.05);margin-bottom:8px;border-radius:6px;border-left:2px solid rgba(0,229,255,0.3);';
    var safeName=userName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    d.innerHTML='<strong style="color:#eaf6ff;">'+e.title+'</strong><br><small style="color:#888;">'+e.date+' at '+e.time+'</small><br><button onclick="deleteTeacherEvent('+e.id+',\''+safeName+'\')" style="margin-top:5px;padding:3px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:3px;cursor:pointer;font-size:12px;">Delete</button>';
    cl.appendChild(d);
  });
}

function deleteTeacherEvent(eventId,userName){
  var key=STORAGE_KEYS.CALENDAR+'_'+userName;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==eventId;})));
  loadTeacherCalendarList(userName);
}
const STORAGE_KEYS={CHAT:'acadify_chat_',CALENDAR:'acadify_calendar',USER_ROLE:'acadify_user_role',USER_CLASS:'acadify_user_class',USER_BOARD:'acadify_user_board',USER_NAME:'acadify_user_name'};function sd(id,val){var e=document.getElementById(id);if(e)e.style.setProperty('display',val,'important');}
function checkAuthenticationStatus(){const userRole=localStorage.getItem(STORAGE_KEYS.USER_ROLE);const userClass=localStorage.getItem(STORAGE_KEYS.USER_CLASS);const userBoard=localStorage.getItem(STORAGE_KEYS.USER_BOARD);const userName=localStorage.getItem(STORAGE_KEYS.USER_NAME);console.log('Auth Check - Role:',userRole,'Name:',userName);if(userRole&&userName){showMainContent(userRole,userClass,userBoard,userName);}else{showSignup();}}document.addEventListener('DOMContentLoaded',()=>{checkAuthenticationStatus();});window.addEventListener('load',()=>{checkAuthenticationStatus();});function showSignup(){const signupContainer=document.getElementById('signupContainer');const userInfoBar=document.getElementById('userInfoBar');const studentContent=document.getElementById('studentContent');const teacherContent=document.getElementById('teacherContent');if(signupContainer){signupContainer.classList.add('show');}if(userInfoBar)userInfoBar.style.display='none';if(studentContent)studentContent.classList.remove('show');if(teacherContent)teacherContent.classList.remove('show');}function showMainContent(userRole,userClass,userBoard,userName){const signupContainer=document.getElementById('signupContainer');const userInfoBar=document.getElementById('userInfoBar');const userInfoText=document.getElementById('userInfoText');const studentContent=document.getElementById('studentContent');const teacherContent=document.getElementById('teacherContent');if(signupContainer){signupContainer.classList.remove('show');}if(userInfoBar){userInfoBar.style.display='block';}if(userRole==='student'){if(studentContent){studentContent.classList.add('show');}if(teacherContent){teacherContent.classList.remove('show');}if(userInfoText)userInfoText.textContent=userName+' | Class: '+userClass+' | Board: '+userBoard;initStudentChat(userName,userClass);initStudentCalendar(userName);}else{if(studentContent){studentContent.classList.remove('show');}if(teacherContent){teacherContent.classList.add('show');}if(userInfoText)userInfoText.textContent=userName;initTeacherChat();initTeacherCalendar(userName);}const userProfession=document.getElementById('userProfession');if(userProfession){if(userRole==='student'){userProfession.textContent='Profession: 👤 Student';}else{userProfession.textContent='Profession: 👨‍🏫 Teacher';}}}function selectRole(role){document.getElementById('studentRoleBtn').classList.remove('active');document.getElementById('teacherRoleBtn').classList.remove('active');if(role==='student'){document.getElementById('studentRoleBtn').classList.add('active');document.getElementById('classSelectSignupContainer').classList.add('show');}else{document.getElementById('teacherRoleBtn').classList.add('active');document.getElementById('classSelectSignupContainer').classList.remove('show');}}function proceedToApp(){const nameInput=document.getElementById('nameInput').value.trim();if(!nameInput){alert('Please enter your name');return;}const studentRoleBtn=document.getElementById('studentRoleBtn');const teacherRoleBtn=document.getElementById('teacherRoleBtn');if(!studentRoleBtn.classList.contains('active')&&!teacherRoleBtn.classList.contains('active')){alert('Please select a role');return;}if(studentRoleBtn.classList.contains('active')){const selectedClass=document.getElementById('classSelectSignup').value;const selectedBoard=document.getElementById('boardSelectSignup').value;if(!selectedClass){alert('Please select your class');return;}if(!selectedBoard){alert('Please select your board');return;}localStorage.setItem(STORAGE_KEYS.USER_NAME,nameInput);localStorage.setItem(STORAGE_KEYS.USER_ROLE,'student');localStorage.setItem(STORAGE_KEYS.USER_CLASS,selectedClass);localStorage.setItem(STORAGE_KEYS.USER_BOARD,selectedBoard);}else{localStorage.setItem(STORAGE_KEYS.USER_NAME,nameInput);localStorage.setItem(STORAGE_KEYS.USER_ROLE,'teacher');localStorage.setItem(STORAGE_KEYS.USER_CLASS,'');localStorage.setItem(STORAGE_KEYS.USER_BOARD,'');}checkAuthenticationStatus();}function logout(){localStorage.removeItem(STORAGE_KEYS.USER_NAME);localStorage.removeItem(STORAGE_KEYS.USER_ROLE);localStorage.removeItem(STORAGE_KEYS.USER_CLASS);localStorage.removeItem(STORAGE_KEYS.USER_BOARD);location.reload();}function initStudentChat(userName,userClass){const chatInput=document.getElementById('chatInput');const chatSendBtn=document.getElementById('chatSendBtn');if(chatInput)chatInput.value='';if(chatSendBtn)chatSendBtn.onclick=()=>sendStudentChatMessage(userName,userClass);if(document.getElementById('studentClassName'))document.getElementById('studentClassName').textContent=userClass;loadStudentChat(userName,userClass);}function sendStudentChatMessage(userName,userClass){const chatInput=document.getElementById('chatInput');if(!chatInput)return;const message=chatInput.value.trim();if(!message)return;const storageKey=STORAGE_KEYS.CHAT+userName+'_'+userClass;const messages=JSON.parse(localStorage.getItem(storageKey)||'[]');messages.push({role:'student',name:userName,message:message,timestamp:new Date().toLocaleString()});localStorage.setItem(storageKey,JSON.stringify(messages));chatInput.value='';loadStudentChat(userName,userClass);}function loadStudentChat(userName,userClass){const chatWindow=document.getElementById('chatWindow');if(!chatWindow)return;const storageKey=STORAGE_KEYS.CHAT+userName+'_'+userClass;const messages=JSON.parse(localStorage.getItem(storageKey)||'[]');chatWindow.innerHTML='';if(messages.length===0){chatWindow.innerHTML='<p style="color:#999;">No messages yet</p>';return;}messages.forEach(msg=>{const msgDiv=document.createElement('div');msgDiv.className='chat-message'+(msg.role==='teacher'?' teacher':'');msgDiv.innerHTML='<strong>'+(msg.role==='student'?'👤 You':'👨‍🏫 '+msg.name)+':</strong> '+msg.message+'<br><small>'+msg.timestamp+'</small>';chatWindow.appendChild(msgDiv);});chatWindow.scrollTop=chatWindow.scrollHeight;}function initTeacherChat(){const teacherClassSelect=document.getElementById('teacherClassSelect');if(teacherClassSelect)teacherClassSelect.onchange=()=>onTeacherClassSelect();const teacherChatSendBtn=document.getElementById('teacherChatSendBtn');if(teacherChatSendBtn)teacherChatSendBtn.onclick=()=>sendTeacherChatMessage();}function onTeacherClassSelect(){const teacherClassSelect=document.getElementById('teacherClassSelect');const selectedClass=teacherClassSelect.value;const selectedClassSpan=document.getElementById('teacherSelectedClass');if(selectedClassSpan)selectedClassSpan.textContent=selectedClass||'None';loadTeacherChat(selectedClass);updateStudentsList(selectedClass);}function sendTeacherChatMessage(){const selectedClass=document.getElementById('teacherClassSelect').value;if(!selectedClass){alert('Please select a class');return;}const chatInput=document.getElementById('teacherChatInput');if(!chatInput)return;const message=chatInput.value.trim();if(!message)return;const storageKey=STORAGE_KEYS.CHAT+selectedClass;const messages=JSON.parse(localStorage.getItem(storageKey)||'[]');messages.push({role:'teacher',message:message,timestamp:new Date().toLocaleString()});localStorage.setItem(storageKey,JSON.stringify(messages));chatInput.value='';loadTeacherChat(selectedClass);}function loadTeacherChat(selectedClass){const teacherChatWindow=document.getElementById('teacherChatWindow');if(!teacherChatWindow)return;if(!selectedClass){teacherChatWindow.innerHTML='<p style="color:#666;">Select a class to view chat</p>';return;}const storageKey=STORAGE_KEYS.CHAT+selectedClass;const messages=JSON.parse(localStorage.getItem(storageKey)||'[]');teacherChatWindow.innerHTML='';messages.forEach(msg=>{const msgDiv=document.createElement('div');msgDiv.className='chat-message'+(msg.role==='teacher'?' teacher':'');msgDiv.innerHTML='<strong>'+(msg.role==='student'?'👤 Student':'👨‍🏫 You')+':</strong> '+msg.message+'<br><small>'+msg.timestamp+'</small>';teacherChatWindow.appendChild(msgDiv);});teacherChatWindow.scrollTop=teacherChatWindow.scrollHeight;}function updateStudentsList(selectedClass){const studentsList=document.getElementById('studentsList');if(!studentsList)return;if(!selectedClass){studentsList.innerHTML='No class selected';return;}const mockStudents=['Rajesh Kumar','Priya Singh','Amit Patel','Neha Verma','Vikram Reddy'];studentsList.innerHTML='<ul style="list-style:none;padding:0;margin:0;">'+mockStudents.map((s,i)=>'<li style="padding:5px;border-bottom:1px solid rgba(0,229,255,0.1);">'+(i+1)+'. '+s+'</li>').join('')+'</ul>';}function initStudentCalendar(userName){const addEventBtn=document.getElementById('addEventBtn');const clearEventsBtn=document.getElementById('clearEventsBtn');const eventTitle=document.getElementById('eventTitle');const eventDate=document.getElementById('eventDate');const eventTime=document.getElementById('eventTime');if(!addEventBtn)return;addEventBtn.onclick=()=>{const title=eventTitle.value.trim();const date=eventDate.value;const time=eventTime.value||'00:00';if(!title||!date){alert('Please fill in title and date');return;}const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');events.push({id:Date.now(),title,date,time});localStorage.setItem(calendarKey,JSON.stringify(events));eventTitle.value='';eventDate.value='';eventTime.value='';loadStudentCalendarList(userName);};if(clearEventsBtn)clearEventsBtn.onclick=()=>{if(confirm('Clear all events?')){const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;localStorage.removeItem(calendarKey);loadStudentCalendarList(userName);}};loadStudentCalendarList(userName);}function loadStudentCalendarList(userName){const calendarList=document.getElementById('calendarList');if(!calendarList)return;const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');calendarList.innerHTML='<h3>Events</h3>';if(events.length===0){calendarList.innerHTML+='No events scheduled';return;}events.forEach(e=>{const eventDiv=document.createElement('div');eventDiv.style.padding='8px';eventDiv.style.background='rgba(0,229,255,0.05)';eventDiv.style.marginBottom='8px';eventDiv.style.borderRadius='6px';const eName=userName.replace(/'/g,"\\\\'");eventDiv.innerHTML='<strong>'+e.title+'</strong><br><small>'+e.date+' '+e.time+'</small><br><button onclick="deleteStudentEvent('+e.id+",\\'"+eName+"\\'"+\')" style="margin-top:5px;padding:3px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:3px;cursor:pointer;">Delete</button>';calendarList.appendChild(eventDiv);});}function deleteStudentEvent(eventId,userName){const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');const filtered=events.filter(e=>e.id!==eventId);localStorage.setItem(calendarKey,JSON.stringify(filtered));loadStudentCalendarList(userName);}function initTeacherCalendar(userName){const addEventBtn=document.getElementById('teacherAddEventBtn');const clearEventsBtn=document.getElementById('teacherClearEventsBtn');const eventTitle=document.getElementById('teacherEventTitle');const eventDate=document.getElementById('teacherEventDate');const eventTime=document.getElementById('teacherEventTime');if(!addEventBtn)return;addEventBtn.onclick=()=>{const title=eventTitle.value.trim();const date=eventDate.value;const time=eventTime.value||'00:00';if(!title||!date){alert('Please fill in title and date');return;}const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');events.push({id:Date.now(),title,date,time});localStorage.setItem(calendarKey,JSON.stringify(events));eventTitle.value='';eventDate.value='';eventTime.value='';loadTeacherCalendarList(userName);};if(clearEventsBtn)clearEventsBtn.onclick=()=>{if(confirm('Clear all events?')){const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;localStorage.removeItem(calendarKey);loadTeacherCalendarList(userName);}};loadTeacherCalendarList(userName);}function loadTeacherCalendarList(userName){const calendarList=document.getElementById('teacherCalendarList');if(!calendarList)return;const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');calendarList.innerHTML='<h3>Events</h3>';if(events.length===0){calendarList.innerHTML+='No events scheduled';return;}events.forEach(e=>{const eventDiv=document.createElement('div');eventDiv.style.padding='8px';eventDiv.style.background='rgba(0,229,255,0.05)';eventDiv.style.marginBottom='8px';eventDiv.style.borderRadius='6px';const eName=userName.replace(/'/g,"\\\\'");eventDiv.innerHTML='<strong>'+e.title+'</strong><br><small>'+e.date+' '+e.time+'</small><br><button onclick="deleteTeacherEvent('+e.id+",\\'"+eName+"\\'"+\')" style="margin-top:5px;padding:3px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:3px;cursor:pointer;">Delete</button>';calendarList.appendChild(eventDiv);});}function deleteTeacherEvent(eventId,userName){const calendarKey=STORAGE_KEYS.CALENDAR+'_'+userName;const events=JSON.parse(localStorage.getItem(calendarKey)||'[]');const filtered=events.filter(e=>e.id!==eventId);localStorage.setItem(calendarKey,JSON.stringify(filtered));loadTeacherCalendarList(userName);}
