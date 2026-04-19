var _role="",_name="",_class="",_board="";
var _chatUnsub=null;
function sd(id,v){var e=document.getElementById(id);if(e)e.style.setProperty("display",v,"important");}
function escH(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function isToday(ds){return new Date(ds).toDateString()===new Date().toDateString();}
function isFuture(ds){var d=new Date(ds);d.setHours(0,0,0,0);var t=new Date();t.setHours(0,0,0,0);return d>=t;}
function waitForDb(cb){if(window._adb&&window._adb.db){cb(window._adb);}else{setTimeout(function(){waitForDb(cb);},80);}}

document.addEventListener("DOMContentLoaded",function(){
  // Always verify identity from Firebase Auth - never trust stale localStorage name
  waitForDb(function(fb){
    var unsub=fb.onAuthStateChanged(fb.auth,function(user){
      unsub();
      if(user){
        var authName=user.displayName||user.email.split("@")[0];
        var r=localStorage.getItem("ac_role")||"student";
        var c=localStorage.getItem("ac_class")||"";
        var b=localStorage.getItem("ac_board")||"";
        localStorage.setItem("ac_role",r);
        localStorage.setItem("ac_name",authName);
        _role=r;_name=authName;_class=c;_board=b;
        showDash();
      } else {
        ["ac_role","ac_name","ac_class","ac_board"].forEach(function(k){localStorage.removeItem(k);});
        document.documentElement.setAttribute("data-ac-show","login");
      }
    });
  });
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
    document.getElementById("sUserName").textContent="Student | "+_name+(_class?" | Class "+_class:"")+(_board?" | "+_board:"");
    var lbl=document.getElementById("sChatLabel");if(lbl)lbl.textContent="(Class "+_class+")";
    listenStudentChat();
    loadStudentEvents();
    loadStudentTeacherGrouped();
  }else{
    sd("studentDash","none");sd("teacherDash","block");
    document.getElementById("tUserName").textContent="Teacher | "+_name;
  }
}

function logout(){
  if(_chatUnsub){try{_chatUnsub();}catch(e){}_chatUnsub=null;}
  ["ac_role","ac_name","ac_class","ac_board"].forEach(function(k){localStorage.removeItem(k);});
  _role="";_name="";_class="";_board="";
  waitForDb(function(fb){
    fb.auth.signOut().catch(function(){}).finally(function(){window.location.href="/";});
  });
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
    fb.getDocs(fb.query(fb.collection(fb.db,"ac_sev_"+_class),fb.orderBy("date","asc")))
    .then(function(snap){
      var sevts=[];
      snap.forEach(function(d){var e=d.data();e._id=d.id;if(e.sname===_name&&isFuture(e.date))sevts.push(e);});
      renderStudentEvents(sevts);
    }).catch(function(){renderStudentEvents([]);});
  });
}

function makeEvItem(cls,extra){var d=document.createElement("div");d.className="ev-item"+(cls?" "+cls:"");if(extra)Object.assign(d.dataset,extra);return d;}
function makeLabel(text,cls){var d=document.createElement("div");d.className="ev-label "+cls;d.textContent=text;return d;}
function makeDelBtn(handler){var b=document.createElement("button");b.className="del-btn";b.textContent="Delete";b.onclick=handler;return b;}
function makeTitleDiv(title,today){var d=document.createElement("div");d.className="ev-title";d.textContent=title;if(today){var s=document.createElement("span");s.className="today-badge";s.textContent="Today";d.appendChild(s);}return d;}
function makeMetaDiv(text){var d=document.createElement("div");d.className="ev-meta";d.textContent=text;return d;}

function renderStudentEvents(sevts){
  var el=document.getElementById("sEventList");if(!el)return;
  el.innerHTML="";
  if(!sevts.length){el.innerHTML="<p class=\"no-msg\">No upcoming events yet. Add one below!</p>";return;}
  sevts.sort(function(a,b){return a.date<b.date?-1:1;});
  sevts.forEach(function(e){
    var item=makeEvItem("");
    item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
    item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")));
    item.appendChild(makeDelBtn((function(id){return function(){delStudentEv(id);};})(e._id)));
    el.appendChild(item);
  });
}

function addStudentEvent(){
  var t=document.getElementById("sEvTitle").value.trim();
  var d=document.getElementById("sEvDate").value;
  var ti=document.getElementById("sEvTime").value;
  if(!t||!d){alert("Please fill title and date");return;}
  waitForDb(function(fb){
    fb.addDoc(fb.collection(fb.db,"ac_sev_"+_class),{sname:_name,title:t,date:d,time:ti||"",ts:fb.serverTimestamp()})
    .then(function(){
      document.getElementById("sEvTitle").value="";document.getElementById("sEvDate").value="";document.getElementById("sEvTime").value="";
      loadStudentEvents();
    })
    .catch(function(e){alert("Failed to add: "+e.message);});
  });
}

function delStudentEv(id){
  waitForDb(function(fb){
    fb.deleteDoc(fb.doc(fb.db,"ac_sev_"+_class,id))
    .then(function(){loadStudentEvents();})
    .catch(function(e){alert("Delete failed: "+e.message);});
  });
}

function clearStudentEvents(){
  if(!confirm("Clear your events?"))return;
  waitForDb(function(fb){
    fb.getDocs(fb.collection(fb.db,"ac_sev_"+_class)).then(function(snap){
      var promises=[];
      snap.forEach(function(d){if(d.data().sname===_name)promises.push(fb.deleteDoc(fb.doc(fb.db,"ac_sev_"+_class,d.id)));});
      Promise.all(promises).then(function(){loadStudentEvents();});
    });
  });
}

/* ---- TEACHER CLASS CHANGE ---- */
function onTeacherClassChange(){
  var cls=document.getElementById("tClassSel").value;
  var tec=document.getElementById("tEvClass");if(tec&&cls)tec.value=cls;
  if(_chatUnsub){try{_chatUnsub();}catch(e){}_chatUnsub=null;}
  if(cls){listenTeacherChat(cls);}else{document.getElementById("tChatWin").innerHTML="<p class=\"no-msg\">Select a class above to view chat</p>";}
  loadTeacherEvents(cls);
  loadTeacherStudentGrouped(cls);
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
  if(!cls){el.innerHTML="<p class=\"no-msg\">Select a class to view events</p>";return;}
  el.innerHTML="<p class=\"no-msg\">Loading...</p>";
  waitForDb(function(fb){
    fb.getDocs(fb.query(fb.collection(fb.db,"ac_tev_"+cls),fb.orderBy("date","asc")))
    .then(function(snap){
      var myEvts=[];
      snap.forEach(function(d){var e=d.data();e._id=d.id;if(e.tname===_name&&isFuture(e.date))myEvts.push(e);});
      renderTeacherEvents(myEvts,cls);
    }).catch(function(){renderTeacherEvents([],cls);});
  });
}

function renderTeacherEvents(myEvts,cls){
  var el=document.getElementById("tEventList");if(!el)return;
  el.innerHTML="";
  if(!myEvts.length){el.innerHTML="<p class=\"no-msg\">No availability slots for Class "+cls+" yet. Add one below!</p>";return;}
  myEvts.forEach(function(e){
    var item=makeEvItem("ev-t");
    item.appendChild(makeTitleDiv(e.title,isToday(e.date)));
    item.appendChild(makeMetaDiv(e.date+(e.time?" at "+e.time:"")+(e.subject?" | "+e.subject:"")));
    item.appendChild(makeDelBtn((function(eid,ecls){return function(){delTeacherEv(eid,ecls);};})(e._id,cls)));
    el.appendChild(item);
  });
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
/* ---- GROUPED: TEACHER sees each student's upcoming events ---- */
function loadTeacherStudentGrouped(cls){
  var card=document.getElementById("tStudentSummaryCard");if(!card)return;
  if(!cls){card.style.display="none";return;}
  card.style.display="";
  var lbl=document.getElementById("tStudentSummaryClass");if(lbl)lbl.textContent="Class "+cls;
  var el=document.getElementById("tStudentGroupList");if(!el)return;
  el.innerHTML="<p class=\"no-msg\">Loading...</p>";
  waitForDb(function(fb){
    fb.getDocs(fb.query(fb.collection(fb.db,"ac_sev_"+cls),fb.orderBy("date","asc")))
    .then(function(snap){
      var byStudent={};
      snap.forEach(function(d){
        var e=d.data();
        if(!isFuture(e.date))return;
        var nm=e.sname||"Unknown Student";
        if(!byStudent[nm])byStudent[nm]=[];
        byStudent[nm].push(e);
      });
      el.innerHTML="";
      var names=Object.keys(byStudent).sort();
      if(!names.length){el.innerHTML="<p class=\"no-msg\">No student events for Class "+cls+" yet</p>";return;}
      names.forEach(function(nm){
        var grp=document.createElement("div");grp.className="grp-block";
        var hdr=document.createElement("div");hdr.className="grp-header grp-s";hdr.textContent=nm+" Events";
        grp.appendChild(hdr);
        byStudent[nm].forEach(function(e){
          var item=document.createElement("div");item.className="ev-item ev-s";
          var title=document.createElement("div");title.className="ev-title";title.textContent=e.title;
          if(isToday(e.date)){var badge=document.createElement("span");badge.className="today-badge";badge.textContent="Today";title.appendChild(badge);}
          var meta=document.createElement("div");meta.className="ev-meta";meta.textContent=e.date+(e.time?" at "+e.time:"");
          item.appendChild(title);item.appendChild(meta);
          grp.appendChild(item);
        });
        el.appendChild(grp);
      });
    }).catch(function(){el.innerHTML="<p class=\"no-msg\">Could not load student events</p>";});
  });
}

/* ---- GROUPED: STUDENT sees each teacher's upcoming events ---- */
function loadStudentTeacherGrouped(){
  var card=document.getElementById("sTeacherSummaryCard");if(!card)return;
  card.style.display="";
  var el=document.getElementById("sTeacherGroupList");if(!el)return;
  el.innerHTML="<p class=\"no-msg\">Loading teacher events...</p>";
  waitForDb(function(fb){
    fb.getDocs(fb.query(fb.collection(fb.db,"ac_tev_"+_class),fb.orderBy("date","asc")))
    .then(function(snap){
      var byTeacher={};
      snap.forEach(function(d){
        var e=d.data();
        if(!isFuture(e.date))return;
        var nm=e.tname||"Unknown Teacher";
        if(!byTeacher[nm])byTeacher[nm]=[];
        byTeacher[nm].push(e);
      });
      el.innerHTML="";
      var names=Object.keys(byTeacher).sort();
      if(!names.length){el.innerHTML="<p class=\"no-msg\">No teacher events for Class "+_class+" yet</p>";return;}
      names.forEach(function(nm){
        var grp=document.createElement("div");grp.className="grp-block";
        var hdr=document.createElement("div");hdr.className="grp-header grp-t";hdr.textContent=nm+" Events";
        grp.appendChild(hdr);
        byTeacher[nm].forEach(function(e){
          var item=document.createElement("div");item.className="ev-item ev-t";
          var title=document.createElement("div");title.className="ev-title";title.textContent=e.title;
          if(isToday(e.date)){var badge=document.createElement("span");badge.className="today-badge";badge.textContent="Today";title.appendChild(badge);}
          var meta=document.createElement("div");meta.className="ev-meta";meta.textContent=e.date+(e.time?" at "+e.time:"")+(e.subject?" | "+e.subject:"");
          item.appendChild(title);item.appendChild(meta);
          grp.appendChild(item);
        });
        el.appendChild(grp);
      });
    }).catch(function(){el.innerHTML="<p class=\"no-msg\">Could not load teacher events</p>";});
  });
}