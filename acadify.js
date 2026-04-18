var _role='',_name='',_class='',_board='';

document.addEventListener('DOMContentLoaded',function(){
  var r=localStorage.getItem('ac_role');
  var n=localStorage.getItem('ac_name');
  var c=localStorage.getItem('ac_class');
  var b=localStorage.getItem('ac_board');
  if(r&&n){_role=r;_name=n;_class=c||'';_board=b||'';showDash();}
});

function sd(id,v){var e=document.getElementById(id);if(e)e.style.setProperty('display',v,'important');}
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function selectRole(role){
  document.getElementById('lStudentBtn').classList.toggle('active',role==='student');
  document.getElementById('lTeacherBtn').classList.toggle('active',role==='teacher');
  document.getElementById('lRoleInput').value=role;
  sd('studentFields',role==='student'?'block':'none');
}

function submitLogin(){
  var n=document.getElementById('lName').value.trim();
  var role=document.getElementById('lRoleInput').value;
  if(!n){alert('Please enter your name');return;}
  if(!role){alert('Please select Student or Teacher');return;}
  if(role==='student'){
    var c=document.getElementById('lClass').value;
    var b=document.getElementById('lBoard').value;
    if(!c){alert('Please select your class');return;}
    if(!b){alert('Please select your board');return;}
    _class=c;_board=b;
    localStorage.setItem('ac_class',c);
    localStorage.setItem('ac_board',b);
  }
  _role=role;_name=n;
  localStorage.setItem('ac_role',role);
  localStorage.setItem('ac_name',n);
  showDash();
}

function showDash(){
  sd('loginSection','none');
  if(_role==='student'){
    sd('studentDash','block');
    sd('teacherDash','none');
    document.getElementById('sUserName').textContent=_name+' | Class '+_class+' | '+_board;
    var lbl=document.getElementById('sChatLabel');
    if(lbl)lbl.textContent='(Class '+_class+')';
    loadStudentChat();
    loadStudentEvents();
  } else {
    sd('studentDash','none');
    sd('teacherDash','block');
    document.getElementById('tUserName').textContent=_name;
    loadTeacherEvents();
  }
}

function logout(){
  ['ac_role','ac_name','ac_class','ac_board'].forEach(function(k){localStorage.removeItem(k);});
  _role='';_name='';_class='';_board='';
  var el=document.getElementById('lName');if(el)el.value='';
  var ri=document.getElementById('lRoleInput');if(ri)ri.value='';
  var sb=document.getElementById('lStudentBtn');if(sb)sb.classList.remove('active');
  var tb=document.getElementById('lTeacherBtn');if(tb)tb.classList.remove('active');
  sd('studentFields','none');
  sd('studentDash','none');
  sd('teacherDash','none');
  sd('loginSection','flex');
}

/* ---- STUDENT CHAT ---- */
function loadStudentChat(){
  var cw=document.getElementById('sChatWin');if(!cw)return;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+_class)||'[]');
  cw.innerHTML='';
  if(!msgs.length){cw.innerHTML='<p style="color:#555;padding:8px;font-size:.87rem;">No messages yet. Be the first!</p>';return;}
  msgs.forEach(function(m){
    var d=document.createElement('div');
    d.className='msg'+(m.role==='teacher'?' tmsg':'');
    d.innerHTML='<div class="sender">'+escH(m.name)+(m.role==='teacher'?' (Teacher)':' (Student)')+'</div>'+escH(m.text)+'<div class="mtime">'+m.time+'</div>';
    cw.appendChild(d);
  });
  cw.scrollTop=cw.scrollHeight;
}

function sendStudentMsg(){
  var i=document.getElementById('sChatInput');
  var msg=i.value.trim();if(!msg)return;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+_class)||'[]');
  msgs.push({role:'student',name:_name,text:msg,time:new Date().toLocaleString()});
  localStorage.setItem('ac_chat_'+_class,JSON.stringify(msgs));
  i.value='';loadStudentChat();
}

/* ---- STUDENT EVENTS ---- */
function loadStudentEvents(){
  var el=document.getElementById('sEventList');if(!el)return;
  var today=new Date();today.setHours(0,0,0,0);
  var tevts=JSON.parse(localStorage.getItem('ac_tev_cls_'+_class)||'[]')
    .filter(function(e){return new Date(e.date)>=today;});
  var sevts=JSON.parse(localStorage.getItem('ac_sev_cls_'+_class)||'[]')
    .filter(function(e){return e.sname===_name&&new Date(e.date)>=today;});
  el.innerHTML='';
  var empty=true;
  if(tevts.length){
    empty=false;
    var h=document.createElement('div');h.className='ev-label lbl-t';h.textContent='Teacher Availability';el.appendChild(h);
    tevts.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    tevts.forEach(function(e){
      var isT=new Date(e.date).toDateString()===new Date().toDateString();
      var d=document.createElement('div');d.className='ev-item ev-teacher';
      d.innerHTML='<div class="ev-title">'+escH(e.title)+(isT?'<span class="today-badge">Today</span>':'')+'</div>'
        +'<div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+(e.subject?' | '+e.subject:'')+(e.tname?' — '+escH(e.tname):'')+'</div>';
      el.appendChild(d);
    });
  }
  if(sevts.length){
    empty=false;
    var h2=document.createElement('div');h2.className='ev-label lbl-my';h2.textContent='My Events';el.appendChild(h2);
    sevts.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    sevts.forEach(function(e){
      var isT=new Date(e.date).toDateString()===new Date().toDateString();
      var d=document.createElement('div');d.className='ev-item';
      d.innerHTML='<div class="ev-title">'+escH(e.title)+(isT?'<span class="today-badge">Today</span>':'')+'</div>'
        +'<div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+'</div>'
        +'<button class="del-btn" onclick="delStudentEv('+e.id+')">Delete</button>';
      el.appendChild(d);
    });
  }
  if(empty){el.innerHTML='<p style="color:#555;font-size:.87rem;">No upcoming events for your class</p>';}
}

function addStudentEvent(){
  var t=document.getElementById('sEvTitle').value.trim();
  var d=document.getElementById('sEvDate').value;
  var ti=document.getElementById('sEvTime').value;
  if(!t||!d){alert('Please fill title and date');return;}
  var key='ac_sev_cls_'+_class;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  evts.push({id:Date.now(),sname:_name,title:t,date:d,time:ti||''});
  localStorage.setItem(key,JSON.stringify(evts));
  document.getElementById('sEvTitle').value='';
  document.getElementById('sEvDate').value='';
  document.getElementById('sEvTime').value='';
  loadStudentEvents();
}

function delStudentEv(id){
  var key='ac_sev_cls_'+_class;
  var evts=JSON.parse(localStorage.getItem(key)||'[]');
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==id;})));
  loadStudentEvents();
}

function clearStudentEvents(){
  if(!confirm('Clear your events?'))return;
  var key='ac_sev_cls_'+_class;
  var evts=JSON.parse(localStorage.getItem(key)||'[]').filter(function(e){return e.sname!==_name;});
  localStorage.setItem(key,JSON.stringify(evts));
  loadStudentEvents();
}

/* ---- TEACHER CLASS CHANGE ---- */
function onTeacherClassChange(){
  var cls=document.getElementById('tClassSel').value;
  var tec=document.getElementById('tEvClass');
  if(tec&&cls)tec.value=cls;
  loadTeacherChat();
  loadTeacherEvents();
}

/* ---- TEACHER CHAT ---- */
function loadTeacherChat(){
  var cw=document.getElementById('tChatWin');if(!cw)return;
  var cls=document.getElementById('tClassSel').value;
  if(!cls){cw.innerHTML='<p style="color:#555;padding:8px;font-size:.87rem;">Select a class above to view chat</p>';return;}
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+cls)||'[]');
  cw.innerHTML='';
  if(!msgs.length){cw.innerHTML='<p style="color:#555;padding:8px;font-size:.87rem;">No messages for Class '+cls+' yet</p>';return;}
  msgs.forEach(function(m){
    var d=document.createElement('div');
    d.className='msg'+(m.role==='teacher'?' tmsg':'');
    d.innerHTML='<div class="sender">'+escH(m.name)+(m.role==='teacher'?' (Teacher)':' (Student)')+'</div>'+escH(m.text)+'<div class="mtime">'+m.time+'</div>';
    cw.appendChild(d);
  });
  cw.scrollTop=cw.scrollHeight;
}

function sendTeacherMsg(){
  var cls=document.getElementById('tClassSel').value;
  if(!cls){alert('Please select a class first');return;}
  var i=document.getElementById('tChatInput');
  var msg=i.value.trim();if(!msg)return;
  var msgs=JSON.parse(localStorage.getItem('ac_chat_'+cls)||'[]');
  msgs.push({role:'teacher',name:_name,text:msg,time:new Date().toLocaleString()});
  localStorage.setItem('ac_chat_'+cls,JSON.stringify(msgs));
  i.value='';loadTeacherChat();
}

/* ---- TEACHER EVENTS ---- */
function loadTeacherEvents(){
  var el=document.getElementById('tEventList');if(!el)return;
  var cls=document.getElementById('tClassSel').value;
  var today=new Date();today.setHours(0,0,0,0);
  var myEvts=JSON.parse(localStorage.getItem('ac_tev_own_'+_name)||'[]')
    .filter(function(e){return new Date(e.date)>=today&&(!cls||!e.cls||e.cls===cls);});
  var sevts=cls?JSON.parse(localStorage.getItem('ac_sev_cls_'+cls)||'[]')
    .filter(function(e){return new Date(e.date)>=today;}):[];
  el.innerHTML='';
  var empty=true;
  if(myEvts.length){
    empty=false;
    var h=document.createElement('div');h.className='ev-label lbl-t';
    h.textContent='My Availability'+(cls?' (Class '+cls+')':'');el.appendChild(h);
    myEvts.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    myEvts.forEach(function(e){
      var isT=new Date(e.date).toDateString()===new Date().toDateString();
      var d=document.createElement('div');d.className='ev-item ev-teacher';
      d.innerHTML='<div class="ev-title">'+escH(e.title)+(isT?'<span class="today-badge">Today</span>':'')+'</div>'
        +'<div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+(e.subject?' | '+e.subject:'')+(e.cls?' | Class '+e.cls:'')+'</div>'
        +'<button class="del-btn" onclick="delTeacherEv('+e.id+')">Delete</button>';
      el.appendChild(d);
    });
  }
  if(sevts.length){
    empty=false;
    var h2=document.createElement('div');h2.className='ev-label lbl-s';
    h2.textContent='Student Events (Class '+cls+')';el.appendChild(h2);
    sevts.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    sevts.forEach(function(e){
      var isT=new Date(e.date).toDateString()===new Date().toDateString();
      var d=document.createElement('div');d.className='ev-item ev-student';
      d.innerHTML='<div class="ev-title">'+escH(e.title)+(isT?'<span class="today-badge">Today</span>':'')+'</div>'
        +'<div class="ev-meta">'+e.date+(e.time?' at '+e.time:'')+(e.sname?' — '+escH(e.sname):'')+'</div>';
      el.appendChild(d);
    });
  }
  if(empty){
    var msg=cls?'No events for Class '+cls+' yet':'Select a class to view student events';
    el.innerHTML='<p style="color:#555;font-size:.87rem;">'+msg+'</p>';
  }
}

function addTeacherEvent(){
  var t=document.getElementById('tEvTitle').value.trim();
  var d=document.getElementById('tEvDate').value;
  var ti=document.getElementById('tEvTime').value;
  var cls=document.getElementById('tEvClass').value;
  var sub=document.getElementById('tEvSubject').value;
  if(!t||!d){alert('Please fill title and date');return;}
  var obj={id:Date.now(),tname:_name,title:t,date:d,time:ti||'',cls:cls,subject:sub};
  var ownKey='ac_tev_own_'+_name;
  var ownEvts=JSON.parse(localStorage.getItem(ownKey)||'[]');
  ownEvts.push(obj);localStorage.setItem(ownKey,JSON.stringify(ownEvts));
  if(cls){
    var ck='ac_tev_cls_'+cls;
    var ce=JSON.parse(localStorage.getItem(ck)||'[]');
    ce.push(obj);localStorage.setItem(ck,JSON.stringify(ce));
  }
  document.getElementById('tEvTitle').value='';
  document.getElementById('tEvDate').value='';
  document.getElementById('tEvTime').value='';
  loadTeacherEvents();
}

function delTeacherEv(id){
  var ownKey='ac_tev_own_'+_name;
  var ownEvts=JSON.parse(localStorage.getItem(ownKey)||'[]');
  var toDelete=ownEvts.filter(function(e){return e.id===id;})[0];
  localStorage.setItem(ownKey,JSON.stringify(ownEvts.filter(function(e){return e.id!==id;})));
  if(toDelete&&toDelete.cls){
    var ck='ac_tev_cls_'+toDelete.cls;
    var ce=JSON.parse(localStorage.getItem(ck)||'[]');
    localStorage.setItem(ck,JSON.stringify(ce.filter(function(e){return e.id!==id;})));
  }
  loadTeacherEvents();
}

function clearTeacherEvents(){
  if(!confirm('Clear all your availability slots?'))return;
  var ownKey='ac_tev_own_'+_name;
  var myEvts=JSON.parse(localStorage.getItem(ownKey)||'[]');
  var myIds=myEvts.map(function(e){return e.id;});
  ['7','8','9','10','11','12'].forEach(function(cls){
    var ck='ac_tev_cls_'+cls;
    var ce=JSON.parse(localStorage.getItem(ck)||'[]');
    localStorage.setItem(ck,JSON.stringify(ce.filter(function(e){return myIds.indexOf(e.id)===-1;})));
  });
  localStorage.removeItem(ownKey);
  loadTeacherEvents();
}