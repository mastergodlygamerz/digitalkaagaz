var _role="",_name="",_class="",_board="";
var _chatUnsub=null;
function sd(id,v){var e=document.getElementById(id);if(e)e.style.setProperty("display",v,"important");}
function escH(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function isToday(ds){return new Date(ds).toDateString()===new Date().toDateString();}
function isFuture(ds){var d=new Date(ds);d.setHours(0,0,0,0);var t=new Date();t.setHours(0,0,0,0);return d>=t;}
function waitForDb(cb){if(window._adb&&window._adb.db){cb(window._adb);}else{setTimeout(function(){waitForDb(cb);},80);}}

document.addEventListener("DOMContentLoaded",function(){
  var r=localStorage.getItem("ac_role")||localStorage.getItem("acadify_user_role");
  var n=localStorage.getItem("ac_name")||localStorage.getItem("acadify_user_name");
  var c=localStorage.getItem("ac_class")||localStorage.getItem("acadify_user_class");
  var b=localStorage.getItem("ac_board")||localStorage.getItem("acadify_user_board");
  if(r&&n){
    localStorage.setItem("ac_role",r);localStorage.setItem("ac_name",n);
    if(c)localStorage.setItem("ac_class",c);if(b)localStorage.setItem("ac_board",b);
    _role=r;_name=n;_class=c||"";_board=b||"";
    showDash();
  } else {
    waitForDb(function(fb){
      var unsub=fb.onAuthStateChanged(fb.auth,function(user){
        unsub();
        if(user){
          var autoName=user.displayName||user.email.split("@")[0];
          var autoRole=localStorage.getItem("ac_role")||"student";
          var autoClass=localStorage.getItem("ac_class")||"";
          var autoBoard=localStorage.getItem("ac_board")||"";
          localStorage.setItem("ac_role",autoRole);
          localStorage.setItem("ac_name",autoName);
          _role=autoRole;_name=autoName;_class=autoClass;_board=autoBoard;
          showDash();
        } else {
          document.documentElement.setAttribute("data-ac-show","login");
        }
      });
    });
  }
});

function selectRole(role){
  document.getElementById("lStudentBtn").classList.toggle("active",role==="student");
  document.getElementById("lTeacherBtn").classList.toggle("active",role==="teacher");
  document.getElementById("lRoleInput").value=role;
  sd("studentFields",role==="student"?"block":"none");
}

function submitLogin(){
  var n=document.getElementById("lName").value.trim();
  var role=document.getElementById("lRoleInput").value;
  if(!n){alert("Please enter your name");return;}
  if(!role){alert("Please select Student or Teacher");return;}
  if(role==="student"){
    var c=document.getElementById("lClass").value;
    var b=document.getElementById("lBoard").value;
    if(!c){alert("Please select your class");return;}
    if(!b){alert("Please select your board");return;}
    _class=c;_board=b;
    localStorage.setItem("ac_class",c);localStorage.setItem("ac_board",b);
  }
  _role=role;_name=n;
  localStorage.setItem("ac_role",role);localStorage.setItem("ac_name",n);
  showDash();
}

function showDash(){
  document.documentElement.setAttribute("data-ac-show",_role==="student"?"student":"teacher");
  sd("loginSection","none");
  if(_role==="student"){
    sd("studentDash","block");sd("teacherDash","none");
    document.getElementById("sUserName").textContent=_name+" | Class "+_class+" | "+_board;
    var lbl=document.getElementById("sChatLabel");if(lbl)lbl.textContent="(Class "+_class+")";
    listenStudentChat();
    loadStudentEvents();
  }else{
    sd("studentDash","none");sd("teacherDash","block");
    document.getElementById("tUserName").textContent=_name;
  }
}

function logout(){
  document.documentElement.setAttribute("data-ac-show","login");
  if(_chatUnsub){try{_chatUnsub();}catch(e){}_chatUnsub=null;}
  ["ac_role","ac_name","ac_class","ac_board"].forEach(function(k){localStorage.removeItem(k);});
  _role="";_name="";_class="";_board="";
  var el=document.getElementById("lName");if(el)el.value="";
  var ri=document.getElementById("lRoleInput");if(ri)ri.value="";
  ["lStudentBtn","lTeacherBtn"].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove("active");});
  sd("studentFields","none");sd("studentDash","none");sd("teacherDash","none");sd("loginSection","flex");
}

/* ---- STUDENT CHAT ---- */
function listenStudentChat(){
  if(_chatUnsub){try{_chatUnsub();}catch(e){}_chatUnsub=null;}
  var cw=document.getElementById("sChatWin");if(!cw)return;
  cw.innerHTML="<p class=\"no-msg\">Connecting...</p>";
  waitForDb(function(fb){
    var q=fb.query(fb.collection(fb.db,"ac_chat_"+_class),fb.orderBy("ts","asc"));
    _chatUnsub=fb.onSnapshot(q,function(snap){
      cw.innerHTML="";
      if(snap.empty){cw.innerHTML="<p class=\"no-msg\">No messages yet. Be the first!</p>";return;}
      snap.forEach(function(d){
        var m=d.data();var isMine=m.name===_name&&m.role==="student";
        var div=document.createElement("div");
        div.className="msg"+(m.role==="teacher"?" tmsg":isMine?" mymsg":"");
        var senderDiv=document.createElement("div");senderDiv.className="sender";
        senderDiv.textContent=m.name+(m.role==="teacher"?" (Teacher)":" (Student)");
        var textNode=document.createTextNode(m.text);
        var timeDiv=document.createElement("div");timeDiv.className="mtime";
        timeDiv.textContent=(m.ts&&m.ts.toDate?m.ts.toDate().toLocaleString():m.clientTime||"");
        div.appendChild(senderDiv);div.appendChild(textNode);div.appendChild(timeDiv);
        cw.appendChild(div);
      });
      cw.scrollTop=cw.scrollHeight;
    },function(err){cw.innerHTML="<p class=\"no-msg\" style=\"color:#ef4444;\">Chat error: "+(err.code==="permission-denied"?"Firestore rules block access — open Firebase Console \u2192 Firestore \u2192 Rules \u2192 set allow read,write:if true":err.message)+"</p>";});
  });
}

function sendStudentMsg(){
  var i=document.getElementById("sChatInput");var msg=i.value.trim();if(!msg)return;
  i.value="";i.disabled=true;
  waitForDb(function(fb){
    fb.addDoc(fb.collection(fb.db,"ac_chat_"+_class),{role:"student",name:_name,text:msg,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})
    .catch(function(e){i.disabled=false;alert("Send failed: "+e.message);})
    .finally(function(){i.disabled=false;});
  });
}

/* ---- STUDENT EVENTS ---- */
function loadStudentEvents(){
  var el=document.getElementById("sEventList");if(!el)return;
  el.innerHTML="<p class=\"no-msg\">Loading...</p>";
  waitForDb(function(fb){
    fb.getDocs(fb.query(fb.collection(fb.db,"ac_tev_"+_class),fb.orderBy("date","asc")))
    .then(function(snap){
      var tevts=[];
      snap.forEach(function(d){var e=d.data();e._id=d.id;if(isFuture(e.date))tevts.push(e);});
      var sevts=JSON.parse(localStorage.getItem("ac_sev_s_"+_name+"_"+_class)||"[]").filter(function(e){return isFuture(e.date);});
      renderStudentEvents(tevts,sevts);
    })
    .catch(function(){
      var sevts=JSON.parse(localStorage.getItem("ac_sev_s_"+_name+"_"+_class)||"[]").filter(function(e){return isFuture(e.date);});
      renderStudentEvents([],sevts);
    });
  });
}

function makeEvItem(cls,extra){var d=document.createElement("div");d.className="ev-item"+(cls?" "+cls:"");if(extra)Object.assign(d.dataset,extra);return d;}
function makeLabel(text,cls){var d=document.createElement("div");d.className="ev-label "+cls;d.textContent=text;return d;}
function makeDelBtn(handler){var b=document.createElement("button");b.className="del-btn";b.textContent="Delete";b.onclick=handler;return b;}
function makeTitleDiv(title,today){var d=document.createElement("div");d.className="ev-title";d.textContent=title;if(today){var s=document.createElement("span");s.className="today-badge";s.textContent="Today";d.appendChild(s);}return d;}
function makeMetaDiv(text){var d=document.createElement("div");d.className="ev-meta";d.textContent=text;return d;}

function renderStudentEvents(tevts,sevts){
  var el=document.getElementById("sEventList");if(!el)return;
  el.innerHTML="";var empty=true;
  if(tevts.length){
    empty=false;el.appendChild(makeLabel("Teacher Availability","lbl-t"));
    tevts.sort(function(a,b){return a.date<b.date?-1:1;});
    tevts.forEach(function(e){
      var item=makeEvItem("ev-t");
      item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
      item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")+(e.subject?" | "+e.subject:"")+(e.tname?" — "+e.tname:"")));
      el.appendChild(item);
    });
  }
  if(sevts.length){
    empty=false;el.appendChild(makeLabel("My Events","lbl-my"));
    sevts.sort(function(a,b){return a.date<b.date?-1:1;});
    sevts.forEach(function(e){
      var item=makeEvItem("");
      item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
      item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")));
      item.appendChild(makeDelBtn((function(id){return function(){delStudentEv(id);};})(e.id)));
      el.appendChild(item);
    });
  }
  if(empty)el.innerHTML="<p class=\"no-msg\">No upcoming events for your class</p>";
}

function addStudentEvent(){
  var t=document.getElementById("sEvTitle").value.trim();
  var d=document.getElementById("sEvDate").value;
  var ti=document.getElementById("sEvTime").value;
  if(!t||!d){alert("Please fill title and date");return;}
  var key="ac_sev_s_"+_name+"_"+_class;
  var evts=JSON.parse(localStorage.getItem(key)||"[]");
  evts.push({id:Date.now(),title:t,date:d,time:ti||""});
  localStorage.setItem(key,JSON.stringify(evts));
  document.getElementById("sEvTitle").value="";document.getElementById("sEvDate").value="";document.getElementById("sEvTime").value="";
  loadStudentEvents();
}

function delStudentEv(id){
  var key="ac_sev_s_"+_name+"_"+_class;
  var evts=JSON.parse(localStorage.getItem(key)||"[]");
  localStorage.setItem(key,JSON.stringify(evts.filter(function(e){return e.id!==id;})));
  loadStudentEvents();
}

function clearStudentEvents(){
  if(!confirm("Clear your events?"))return;
  localStorage.removeItem("ac_sev_s_"+_name+"_"+_class);
  loadStudentEvents();
}

/* ---- TEACHER CLASS CHANGE ---- */
function onTeacherClassChange(){
  var cls=document.getElementById("tClassSel").value;
  var tec=document.getElementById("tEvClass");if(tec&&cls)tec.value=cls;
  if(_chatUnsub){try{_chatUnsub();}catch(e){}_chatUnsub=null;}
  if(cls){listenTeacherChat(cls);}else{document.getElementById("tChatWin").innerHTML="<p class=\"no-msg\">Select a class above to view chat</p>";}
  loadTeacherEvents(cls);
}

/* ---- TEACHER CHAT ---- */
function listenTeacherChat(cls){
  var cw=document.getElementById("tChatWin");if(!cw)return;
  cw.innerHTML="<p class=\"no-msg\">Connecting...</p>";
  waitForDb(function(fb){
    var q=fb.query(fb.collection(fb.db,"ac_chat_"+cls),fb.orderBy("ts","asc"));
    _chatUnsub=fb.onSnapshot(q,function(snap){
      cw.innerHTML="";
      if(snap.empty){cw.innerHTML="<p class=\"no-msg\">No messages for Class "+cls+" yet</p>";return;}
      snap.forEach(function(d){
        var m=d.data();var isMine=m.name===_name&&m.role==="teacher";
        var div=document.createElement("div");
        div.className="msg"+(m.role==="teacher"?(isMine?" mymsg":" tmsg"):"");
        var senderDiv=document.createElement("div");senderDiv.className="sender";
        senderDiv.textContent=m.name+(m.role==="teacher"?" (Teacher)":" (Student)");
        var textNode=document.createTextNode(m.text);
        var timeDiv=document.createElement("div");timeDiv.className="mtime";
        timeDiv.textContent=(m.ts&&m.ts.toDate?m.ts.toDate().toLocaleString():m.clientTime||"");
        div.appendChild(senderDiv);div.appendChild(textNode);div.appendChild(timeDiv);
        cw.appendChild(div);
      });
      cw.scrollTop=cw.scrollHeight;
    },function(err){cw.innerHTML="<p class=\"no-msg\" style=\"color:#ef4444;\">Chat error: "+(err.code==="permission-denied"?"Firestore rules block access — open Firebase Console → Firestore → Rules → set allow read,write:if true":err.message)+"</p>";});
  });
}

function sendTeacherMsg(){
  var cls=document.getElementById("tClassSel").value;
  if(!cls){alert("Please select a class first");return;}
  var i=document.getElementById("tChatInput");var msg=i.value.trim();if(!msg)return;
  i.value="";i.disabled=true;
  waitForDb(function(fb){
    fb.addDoc(fb.collection(fb.db,"ac_chat_"+cls),{role:"teacher",name:_name,text:msg,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})
    .catch(function(e){i.disabled=false;alert("Send failed: "+e.message);})
    .finally(function(){i.disabled=false;});
  });
}

/* ---- TEACHER EVENTS ---- */
function loadTeacherEvents(cls){
  var el=document.getElementById("tEventList");if(!el)return;
  if(!cls){el.innerHTML="<p class=\"no-msg\">Select a class to view student events</p>";return;}
  el.innerHTML="<p class=\"no-msg\">Loading...</p>";
  waitForDb(function(fb){
    var p1=fb.getDocs(fb.query(fb.collection(fb.db,"ac_tev_"+cls),fb.orderBy("date","asc")));
    var p2=fb.getDocs(fb.query(fb.collection(fb.db,"ac_sev_"+cls),fb.orderBy("date","asc")));
    Promise.all([p1,p2]).then(function(results){
      var myEvts=[],sEvts=[];
      results[0].forEach(function(d){var e=d.data();e._id=d.id;if(e.tname===_name&&isFuture(e.date))myEvts.push(e);});
      results[1].forEach(function(d){var e=d.data();e._id=d.id;if(isFuture(e.date))sEvts.push(e);});
      renderTeacherEvents(myEvts,sEvts,cls);
    }).catch(function(){renderTeacherEvents([],[],cls);});
  });
}

function renderTeacherEvents(myEvts,sEvts,cls){
  var el=document.getElementById("tEventList");if(!el)return;
  el.innerHTML="";var empty=true;
  if(myEvts.length){
    empty=false;el.appendChild(makeLabel("My Availability (Class "+cls+")","lbl-t"));
    myEvts.forEach(function(e){
      var item=makeEvItem("ev-t");
      item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
      item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")+(e.subject?" | "+e.subject:"")));
      item.appendChild(makeDelBtn((function(eid,ecls){return function(){delTeacherEv(eid,ecls);};})(e._id,cls)));
      el.appendChild(item);
    });
  }
  if(sEvts.length){
    empty=false;el.appendChild(makeLabel("Student Events (Class "+cls+")","lbl-s"));
    sEvts.forEach(function(e){
      var item=makeEvItem("ev-s");
      item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
      item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")+(e.sname?" — "+e.sname:"")));
      el.appendChild(item);
    });
  }
  if(empty)el.innerHTML="<p class=\"no-msg\">No events for Class "+cls+" yet</p>";
}

function addTeacherEvent(){
  var t=document.getElementById("tEvTitle").value.trim();
  var d=document.getElementById("tEvDate").value;
  var ti=document.getElementById("tEvTime").value;
  var cls=document.getElementById("tEvClass").value||document.getElementById("tClassSel").value;
  var sub=document.getElementById("tEvSubject").value;
  if(!t||!d){alert("Please fill title and date");return;}
  if(!cls){alert("Please select a class first");return;}
  waitForDb(function(fb){
    fb.addDoc(fb.collection(fb.db,"ac_tev_"+cls),{tname:_name,title:t,date:d,time:ti||"",subject:sub,ts:fb.serverTimestamp()})
    .then(function(){
      document.getElementById("tEvTitle").value="";document.getElementById("tEvDate").value="";document.getElementById("tEvTime").value="";
      loadTeacherEvents(document.getElementById("tClassSel").value);
    })
    .catch(function(e){alert("Failed to add: "+e.message);});
  });
}

function delTeacherEv(id,cls){
  if(!confirm("Delete this slot?"))return;
  waitForDb(function(fb){
    fb.deleteDoc(fb.doc(fb.db,"ac_tev_"+cls,id))
    .then(function(){loadTeacherEvents(cls);})
    .catch(function(e){alert("Delete failed: "+e.message);});
  });
}

function clearTeacherEvents(){
  var cls=document.getElementById("tClassSel").value;
  if(!cls){alert("Please select a class first");return;}
  if(!confirm("Clear all your slots for Class "+cls+"?"))return;
  waitForDb(function(fb){
    fb.getDocs(fb.collection(fb.db,"ac_tev_"+cls)).then(function(snap){
      var promises=[];
      snap.forEach(function(d){if(d.data().tname===_name)promises.push(fb.deleteDoc(fb.doc(fb.db,"ac_tev_"+cls,d.id)));});
      Promise.all(promises).then(function(){loadTeacherEvents(cls);});
    });
  });
}