var _role='',_name='',_class='',_board='',_loginRole='';
function sd(id,v){var e=document.getElementById(id);if(e)e.style.setProperty('display',v,'important');}
document.addEventListener('DOMContentLoaded',function(){
  var r=localStorage.getItem('ac_role'),n=localStorage.getItem('ac_name'),c=localStorage.getItem('ac_class'),b=localStorage.getItem('ac_board');
  if(r&&n){_role=r;_name=n;_class=c||'';_board=b||'';showDash();}
});
function showLoginForm(role){
  _loginRole=role;
  document.getElementById('loginFormTitle').textContent=role==='student'?'Student Login':'Teacher Login';
  sd('studentFields',role==='student'?'block':'none');
  sd('loginFormArea','block');
  document.getElementById('loginName').focus();
}
function hideLoginForm(){sd('loginFormArea','none');_loginRole='';}
function submitLogin(){
  var n=document.getElementById('loginName').value.trim();
  if(!n){alert('Please enter your name');return;}
  if(_loginRole==='student'){
    var c=document.getElementById('loginClass').value;
    var b=document.getElementById('loginBoard').value;
    if(!c){alert('Please select your class');return;}
    if(!b){alert('Please select your board');return;}
    localStorage.setItem('ac_class',c);localStorage.setItem('ac_board',b);_class=c;_board=b;
  }
  localStorage.setItem('ac_role',_loginRole);localStorage.setItem('ac_name',n);_role=_loginRole;_name=n;
  showDash();
}
function showDash(){
  sd('welcomePage','none');
  if(_role==='student'){
    sd('studentDash','block');sd('teacherDash','none');
    document.getElementById('sUserInfo').textContent=_name+' | Class '+_class+' | '+_board;
    loadStudentChat();loadStudentEvents();
  } else {
    sd('studentDash','none');sd('teacherDash','block');
    document.getElementById('tUserInfo').textContent=_name;
    loadTeacherChat();loadTeacherEvents();
  }
}
function logout(){
  localStorage.removeItem('ac_role');localStorage.removeItem('ac_name');localStorage.removeItem('ac_class');localStorage.removeItem('ac_board');
  _role='';_name='';_class='';_board='';
  sd('studentDash','none');sd('teacherDash','none');sd('welcomePage','flex');sd('loginFormArea','none');
  document.getElementById('loginName').value='';
}
function loadStudentChat(){
  var cw=document.getElementById('sChatWin');if(!cw)return;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+_class)||'[]');
  cw.innerHTML='';
  if(!msgs.length){cw.innerHTML='<p style="color:#555;font-size:0.88rem;padding:8px;">No messages yet</p>';return;}
  msgs.forEach(function(m){var d=document.createElement('div');d.className='msg'+(m.role==='teacher'?' tmsg':'');d.innerHTML='<strong>'+(m.role==='teacher'?'Teacher':_name)+'</strong>'+m.text+'<br><small>'+m.time+'</small>';cw.appendChild(d);});
  cw.scrollTop=cw.scrollHeight;
}
function sendStudentMsg(){
  var i=document.getElementById('sChatInput');var msg=i.value.trim();if(!msg)return;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+_class)||'[]');
  msgs.push({role:'student',name:_name,text:msg,time:new Date().toLocaleString()});
  localStorage.setItem('ac_chat_'+_class,JSON.stringify(msgs));i.value='';loadStudentChat();
}
function loadStudentEvents(){
  var el=document.getElementById('sEventList');if(!el)return;
  var evts=JSON.parse(localStorage.getItem('ac_ev_s_'+_name+'_'+_class)||'[]');
  var today=new Date();today.setHours(0,0,0,0);
  var future=evts.filter(function(e){return new Date(e.date)>=today;});
  future.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
  el.innerHTML='';
  if(!future.length){el.innerHTML='<p style="color:#555;font-size:0.88rem;">No upcoming events</p>';return;}
  future.forEach(function(e){
    var isT=new Date(e.date).toDateString()===new Date().toDateString();
    var d=document.createElement('div');d.className='ev-item';
    d.innerHTML='<div class="ev-title">'+e.title+(isT?'<span class="today-badge">Today</span>':'')+'</div><div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+'</div><button class="del-btn" onclick="delStudentEv('+e.id+')">Delete</button>';
    el.appendChild(d);
  });
}
function addStudentEvent(){
  var t=document.getElementById('sEvTitle').value.trim(),d=document.getElementById('sEvDate').value,ti=document.getElementById('sEvTime').value;
  if(!t||!d){alert('Please fill title and date');return;}
  var key='ac_ev_s_'+_name+'_'+_class;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  evts.push({id:Date.now(),title:t,date:d,time:ti||''});
  localStorage.setItem(key,JSON.stringify(evts));
  document.getElementById('sEvTitle').value='';document.getElementById('sEvDate').value='';document.getElementById('sEvTime').value='';
  loadStudentEvents();
}
function delStudentEv(id){
  var key='ac_ev_s_'+_name+'_'+_class;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==id;})));loadStudentEvents();
}
function clearStudentEvents(){if(!confirm('Clear all events?'))return;localStorage.removeItem('ac_ev_s_'+_name+'_'+_class);loadStudentEvents();}
function loadTeacherChat(){
  var cw=document.getElementById('tChatWin');if(!cw)return;
  var cls=document.getElementById('tClassSel').value;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+(cls||'general'))||'[]');
  cw.innerHTML='';
  if(!msgs.length){cw.innerHTML='<p style="color:#555;font-size:0.88rem;padding:8px;">No messages</p>';return;}
  msgs.forEach(function(m){var d=document.createElement('div');d.className='msg'+(m.role==='teacher'?' tmsg':'');d.innerHTML='<strong>'+(m.role==='teacher'?'You (Teacher)':'Student: '+m.name)+'</strong>'+m.text+'<br><small>'+m.time+'</small>';cw.appendChild(d);});
  cw.scrollTop=cw.scrollHeight;
}
function sendTeacherMsg(){
  var i=document.getElementById('tChatInput');var msg=i.value.trim();if(!msg)return;
  var cls=document.getElementById('tClassSel').value;
  var key='ac_chat_'+(cls||'general');
  var msgs=JSON.parse(localStorage.getItem(key)||'[]');
  msgs.push({role:'teacher',name:_name,text:msg,time:new Date().toLocaleString()});
  localStorage.setItem(key,JSON.stringify(msgs));i.value='';loadTeacherChat();
}
function loadTeacherEvents(){
  var el=document.getElementById('tEventList');if(!el)return;
  var evts=JSON.parse(localStorage.getItem('ac_ev_t_'+_name)||'[]');
  var today=new Date();today.setHours(0,0,0,0);
  var future=evts.filter(function(e){return new Date(e.date)>=today;});
  future.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
  el.innerHTML='';
  if(!future.length){el.innerHTML='<p style="color:#555;font-size:0.88rem;">No slots added</p>';return;}
  future.forEach(function(e){
    var isT=new Date(e.date).toDateString()===new Date().toDateString();
    var meta=(e.cls?'Class '+e.cls:'')+(e.subject?' | '+e.subject:'');
    var d=document.createElement('div');d.className='ev-item';
    d.innerHTML='<div class="ev-title">'+e.title+(isT?'<span class="today-badge">Today</span>':'')+'</div><div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+(meta?' — '+meta:'')+'</div><button class="del-btn" onclick="delTeacherEv('+e.id+')">Delete</button>';
    el.appendChild(d);
  });
}
function addTeacherEvent(){
  var t=document.getElementById('tEvTitle').value.trim(),d=document.getElementById('tEvDate').value,ti=document.getElementById('tEvTime').value;
  var cls=document.getElementById('tEvClass').value,sub=document.getElementById('tEvSubject').value;
  if(!t||!d){alert('Please fill title and date');return;}
  var key='ac_ev_t_'+_name;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  evts.push({id:Date.now(),title:t,date:d,time:ti||'',cls:cls,subject:sub});
  localStorage.setItem(key,JSON.stringify(evts));
  document.getElementById('tEvTitle').value='';document.getElementById('tEvDate').value='';document.getElementById('tEvTime').value='';
  loadTeacherEvents();
}
function delTeacherEv(id){
  var key='ac_ev_t_'+_name;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==id;})));loadTeacherEvents();
}
function clearTeacherEvents(){if(!confirm('Clear all slots?'))return;localStorage.removeItem('ac_ev_t_'+_name);loadTeacherEvents();}