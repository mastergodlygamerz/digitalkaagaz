// Acadify — Firestore-backed Chat & Events
(function () {

  /* ── Wait for Firebase (window._adb set by module script) ── */
  function waitForDB(cb) {
    if (window._adb && window._adb.db) { cb(); }
    else { setTimeout(function () { waitForDB(cb); }, 60); }
  }

  /* ── User info from localStorage ─────────────────────── */
  var role      = localStorage.getItem("ac_role")      || "";
  var userName  = localStorage.getItem("ac_name")      || "User";
  var userClass = localStorage.getItem("ac_class")     || "";
  var userBoard = localStorage.getItem("ac_board")     || "";
  var institute = localStorage.getItem("ac_institute") || "";

  /* ── Firestore collection name helpers ───────────────── */
  function instCode() {
    return (localStorage.getItem("ac_institute_code") || "").toUpperCase().trim();
  }
  function chatCol(cls) { return "ac_chat_" + instCode() + "_" + cls; }
  function sEvCol()     { return "ac_sev_"  + instCode(); }
  function tEvCol()     { return "ac_tev_"  + instCode(); }

  /* ── Misc helpers ────────────────────────────────────── */
  function todayStr() {
    var d  = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  function fmtDate(s) {
    if (!s) return "";
    return new Date(s + "T00:00:00")
      .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }
  function esc(s) {
    return String(s || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function currentUid() {
    return (window._adb && window._adb.auth && window._adb.auth.currentUser)
      ? window._adb.auth.currentUser.uid : null;
  }

  /* ── Top-bar names ───────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    var sn = document.getElementById("sUserName");
    var tn = document.getElementById("tUserName");
    if (sn) sn.textContent = userName;
    if (tn) tn.textContent = userName;
    var lbl = document.getElementById("sChatLabel");
    if (lbl && userClass) lbl.textContent = "— Class " + userClass;
    ["sInstitutePill","tInstitutePill"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && institute) { el.textContent = "🏫 " + institute; el.style.display = ""; }
    });
  });

  /* ── Login (local form) ──────────────────────────────── */
  window.selectRole = function (r) {
    var sb = document.getElementById("lStudentBtn");
    var tb = document.getElementById("lTeacherBtn");
    if (sb) sb.classList.toggle("active", r === "student");
    if (tb) tb.classList.toggle("active", r === "teacher");
    var ri = document.getElementById("lRoleInput");
    if (ri) ri.value = r;
    var sf = document.getElementById("studentFields");
    if (sf) sf.style.display = r === "student" ? "block" : "none";
  };

  window.submitLogin = function () {
    var name  = ((document.getElementById("lName")      || {}).value || "").trim();
    var r     =  (document.getElementById("lRoleInput") || {}).value || "";
    if (!name || !r) { alert("Please enter your name and choose a role."); return; }
    var cls   = r === "student" ? ((document.getElementById("lClass") || {}).value || "") : "";
    var board = r === "student" ? ((document.getElementById("lBoard") || {}).value || "") : "";
    var inst  = ((document.getElementById("lInstitute") || {}).value || "");
    if (r === "student" && (!cls || !board)) { alert("Please select your class and board."); return; }
    localStorage.setItem("ac_name", name);
    localStorage.setItem("ac_role", r);
    if (cls)   localStorage.setItem("ac_class", cls);
    if (board) localStorage.setItem("ac_board", board);
    if (inst)  localStorage.setItem("ac_institute", inst);
    window.location.reload();
  };

  /* ── Logout ──────────────────────────────────────────── */
  window.logout = function () {
    ["ac_role","ac_name","ac_class","ac_board","ac_institute","ac_institute_code",
     "ac_entry_code","ac_entry_institute"].forEach(function (k) {
      localStorage.removeItem(k); sessionStorage.removeItem(k);
    });
    if (window._adb && window._adb.auth) window._adb.auth.signOut().catch(function(){});
    window.location.href = "acadify-entry.html";
  };

  /* ══════════ CHAT (real-time onSnapshot) ════════════════
     Collection : ac_chat_{INST_CODE}_{class}
     Doc fields : { text, senderName, role, ts }
     Teacher msgs → LEFT  (.msg.tmsg)
     Student msgs → RIGHT (.msg.mymsg)
  ════════════════════════════════════════════════════════*/
  var _chatUnsub = null;

  function subscribeChat(colName, winEl) {
    if (_chatUnsub) { _chatUnsub(); _chatUnsub = null; }
    winEl.innerHTML = "<p class=\"no-msg\">Loading chat…</p>";
    waitForDB(function () {
      var _r = window._adb;
      var q  = _r.query(_r.collection(_r.db, colName), _r.orderBy("ts","asc"));
      _chatUnsub = _r.onSnapshot(q, function (snap) {
        if (snap.empty) {
          winEl.innerHTML = "<p class=\"no-msg\">No messages yet — say hello! 👋</p>";
          return;
        }
        winEl.innerHTML = "";
        snap.forEach(function (d) {
          var data      = d.data();
          var isTeacher = data.role === "teacher";
          var div       = document.createElement("div");
          div.className = "msg " + (isTeacher ? "tmsg" : "mymsg");
          var t = data.ts
            ? new Date(data.ts.seconds*1000)
                .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
            : "";
          div.innerHTML =
            "<div class=\"sender\">" + esc(data.senderName||"Unknown") +
              " <span style=\"font-size:.68rem;opacity:.6;font-weight:400\">" +
                (isTeacher ? "[Teacher]" : "[Student]") +
              "</span></div>" +
            esc(data.text) +
            "<div class=\"mtime\">" + t + "</div>";
          winEl.appendChild(div);
        });
        winEl.scrollTop = winEl.scrollHeight;
      }, function () {
        winEl.innerHTML = "<p class=\"no-msg\">⚠ Could not load chat.</p>";
      });
    });
  }

  function sendMsg(colName, text) {
    if (!text.trim()) return;
    waitForDB(function () {
      var _r = window._adb;
      _r.addDoc(_r.collection(_r.db, colName), {
        text: text.trim(), senderName: userName, role: role, ts: _r.serverTimestamp()
      });
    });
  }

  /* Student — auto-subscribe on load */
  if (role === "student" && userClass) {
    document.addEventListener("DOMContentLoaded", function () {
      subscribeChat(chatCol(userClass), document.getElementById("sChatWin"));
    });
  }
  window.sendStudentMsg = function () {
    var inp = document.getElementById("sChatInput");
    sendMsg(chatCol(userClass), inp.value);
    inp.value = "";
  };

  /* Teacher — subscribe when class is selected */
  var _tClass = "";
  window.onTeacherClassChange = function () {
    var sel = document.getElementById("tClassSel");
    _tClass = sel ? sel.value : "";
    var win = document.getElementById("tChatWin");
    if (!_tClass) {
      if (_chatUnsub) { _chatUnsub(); _chatUnsub = null; }
      win.innerHTML = "<p class=\"no-msg\">Select a class above to view chat</p>";
      loadTeacherEvents();
      return;
    }
    subscribeChat(chatCol(_tClass), win);
    loadTeacherEvents();
  };
  window.sendTeacherMsg = function () {
    if (!_tClass) { alert("Please select a class first."); return; }
    var inp = document.getElementById("tChatInput");
    sendMsg(chatCol(_tClass), inp.value);
    inp.value = "";
  };

  /* ══════════ EVENTS ══════════════════════════════════════
     Student events : ac_sev_{INST_CODE}  (fields: title,date,time,board,class,createdByUid,...)
     Teacher events : ac_tev_{INST_CODE}  (fields: title,date,time,board,class,subject,createdByUid,...)
     Show only events with date >= today (YYYY-MM-DD string compare).
     Student sees : own events + teacher events matching their class & board
     Teacher sees : own events + student events for the selected class
  ════════════════════════════════════════════════════════*/
  var TYPE_EMOJI = { exam:"📝", assignment:"📋", class:"👥", slot:"📌", other:"📌" };

  function evCard(ev) {
    var isTeacher = ev.role === "teacher";
    var isOwn     = ev.createdByUid && ev.createdByUid === currentUid();
    var itemCls   = "ev-item " + (isTeacher ? "ev-t" : "ev-s");
    var lblCls    = "ev-label " + (isTeacher ? "lbl-t" : (isOwn ? "lbl-my" : "lbl-s"));
    var lblTxt    = isTeacher ? "👩‍🏫 Teacher" : "👤 Student";
    var emoji     = TYPE_EMOJI[ev.type] || "📌";
    var isToday   = ev.date === todayStr();
    var delFn     = isTeacher ? "deleteTeacherEvent" : "deleteStudentEvent";
    var clsTag    = (ev.class && ev.class !== "All") ? " · Class " + esc(ev.class) : "";
    return "<div class=\"" + itemCls + "\">" +
      "<div class=\"ev-body\">" +
        "<div class=\"ev-title\">" + emoji + " " + esc(ev.title) +
          (isToday ? " <span class=\"today-badge\">Today</span>" : "") + "</div>" +
        "<div class=\"ev-meta\">" + fmtDate(ev.date) +
          (ev.time    ? " · " + esc(ev.time)    : "") +
          (ev.subject ? " · " + esc(ev.subject) : "") + "</div>" +
        "<div class=\"" + lblCls + "\">" + lblTxt + clsTag + "</div>" +
      "</div>" +
      (isOwn ? "<button class=\"del-btn\" onclick=\"" + delFn + "('" + ev._id + "')\">✕</button>" : "") +
    "</div>";
  }

  /* ── Student Events ──────────────────────────────────── */
  function loadStudentEvents() {
    var listEl = document.getElementById("sEventList");
    if (!listEl) return;
    listEl.innerHTML = "<p class=\"no-msg\">Loading events…</p>";
    waitForDB(async function () {
      var _r    = window._adb;
      var today = todayStr();
      try {
        var sSnap = await _r.getDocs(
          _r.query(_r.collection(_r.db, sEvCol()),
            _r.where("date",">=",today), _r.orderBy("date","asc"))
        );
        var uid  = currentUid();
        var sEvs = [];
        sSnap.forEach(function(d){
          var ev = d.data();
          if ((uid && ev.createdByUid===uid) || !ev.class || ev.class===userClass)
            sEvs.push(Object.assign({},ev,{_id:d.id,role:"student"}));
        });

        var tSnap = await _r.getDocs(
          _r.query(_r.collection(_r.db, tEvCol()),
            _r.where("date",">=",today), _r.orderBy("date","asc"))
        );
        var tEvs = [];
        tSnap.forEach(function(d){
          var ev      = d.data();
          var classOk = !ev.class || ev.class==="All" || ev.class===userClass;
          var boardOk = !ev.board || ev.board==="All" || ev.board===userBoard;
          if (classOk && boardOk) tEvs.push(Object.assign({},ev,{_id:d.id,role:"teacher"}));
        });

        var all = sEvs.concat(tEvs).sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; });
        listEl.innerHTML = all.length
          ? all.map(evCard).join("")
          : "<p class=\"no-msg\">No upcoming events for your class 🎉</p>";
      } catch(err) {
        console.error("loadStudentEvents", err);
        listEl.innerHTML = "<p class=\"no-msg\">⚠ Could not load events.</p>";
      }
    });
  }

  window.addStudentEvent = function () {
    var title = (document.getElementById("sEvTitle").value||"").trim();
    var date  =  document.getElementById("sEvDate").value;
    var time  =  document.getElementById("sEvTime").value;
    var board =  document.getElementById("sEvBoard").value || userBoard;
    if (!title||!date) { alert("Please fill in title and date."); return; }
    waitForDB(async function(){
      var _r = window._adb;
      await _r.addDoc(_r.collection(_r.db, sEvCol()), {
        title, date, time, board, class: userClass, type: "other",
        createdByUid: currentUid()||"", createdByName: userName, ts: _r.serverTimestamp()
      });
      document.getElementById("sEvTitle").value =
      document.getElementById("sEvDate").value  =
      document.getElementById("sEvTime").value  = "";
      loadStudentEvents();
    });
  };

  window.deleteStudentEvent = function (id) {
    waitForDB(async function(){
      var _r = window._adb;
      await _r.deleteDoc(_r.doc(_r.db, sEvCol(), id));
      loadStudentEvents();
    });
  };

  window.clearStudentEvents = function () {
    if (!confirm("Delete all your events?")) return;
    var uid = currentUid();
    if (!uid) { alert("Not signed in."); return; }
    waitForDB(async function(){
      var _r = window._adb;
      var snap = await _r.getDocs(_r.query(_r.collection(_r.db,sEvCol()),_r.where("createdByUid","==",uid)));
      await Promise.all(Array.from(snap.docs).map(function(d){ return _r.deleteDoc(_r.doc(_r.db,sEvCol(),d.id)); }));
      loadStudentEvents();
    });
  };

  if (role === "student") document.addEventListener("DOMContentLoaded", loadStudentEvents);

  /* ── Teacher Events ──────────────────────────────────── */
  function loadTeacherEvents() {
    var listEl = document.getElementById("tEventList");
    if (!listEl) return;
    listEl.innerHTML = "<p class=\"no-msg\">Loading events…</p>";
    var selClass = _tClass;
    waitForDB(async function(){
      var _r    = window._adb;
      var today = todayStr();
      try {
        var tSnap = await _r.getDocs(
          _r.query(_r.collection(_r.db, tEvCol()),
            _r.where("date",">=",today), _r.orderBy("date","asc"))
        );
        var tEvs = [];
        tSnap.forEach(function(d){
          var ev = d.data();
          var ok = !selClass || !ev.class || ev.class==="All" || ev.class===selClass;
          if (ok) tEvs.push(Object.assign({},ev,{_id:d.id,role:"teacher"}));
        });

        var sSnap = await _r.getDocs(
          _r.query(_r.collection(_r.db, sEvCol()),
            _r.where("date",">=",today), _r.orderBy("date","asc"))
        );
        var sEvs = [];
        sSnap.forEach(function(d){
          var ev = d.data();
          var ok = !selClass || !ev.class || ev.class===selClass;
          if (ok) sEvs.push(Object.assign({},ev,{_id:d.id,role:"student"}));
        });

        var all   = tEvs.concat(sEvs).sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; });
        var label = selClass ? " for Class "+selClass : "";
        listEl.innerHTML = all.length
          ? all.map(evCard).join("")
          : "<p class=\"no-msg\">No upcoming events"+label+"</p>";
      } catch(err) {
        console.error("loadTeacherEvents", err);
        listEl.innerHTML = "<p class=\"no-msg\">⚠ Could not load events.</p>";
      }
    });
  }

  window.addTeacherEvent = function () {
    var title   = (document.getElementById("tEvTitle").value  ||"").trim();
    var date    =  document.getElementById("tEvDate").value;
    var time    =  document.getElementById("tEvTime").value;
    var cls     =  document.getElementById("tEvClass").value   || "All";
    var subject =  document.getElementById("tEvSubject").value || "";
    var board   =  document.getElementById("tEvBoard").value   || "All";
    if (!title||!date) { alert("Please fill in title and date."); return; }
    waitForDB(async function(){
      var _r = window._adb;
      await _r.addDoc(_r.collection(_r.db, tEvCol()), {
        title, date, time, class: cls, subject, board, type: "slot",
        createdByUid: currentUid()||"", createdByName: userName, ts: _r.serverTimestamp()
      });
      document.getElementById("tEvTitle").value =
      document.getElementById("tEvDate").value  =
      document.getElementById("tEvTime").value  = "";
      loadTeacherEvents();
    });
  };

  window.deleteTeacherEvent = function (id) {
    waitForDB(async function(){
      var _r = window._adb;
      await _r.deleteDoc(_r.doc(_r.db, tEvCol(), id));
      loadTeacherEvents();
    });
  };

  window.clearTeacherEvents = function () {
    if (!confirm("Delete all your events?")) return;
    var uid = currentUid();
    if (!uid) { alert("Not signed in."); return; }
    waitForDB(async function(){
      var _r = window._adb;
      var snap = await _r.getDocs(_r.query(_r.collection(_r.db,tEvCol()),_r.where("createdByUid","==",uid)));
      await Promise.all(Array.from(snap.docs).map(function(d){ return _r.deleteDoc(_r.doc(_r.db,tEvCol(),d.id)); }));
      loadTeacherEvents();
    });
  };

  if (role === "teacher") document.addEventListener("DOMContentLoaded", loadTeacherEvents);

})();
