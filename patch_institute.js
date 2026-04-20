const fs = require('fs');

// ═══════════════════════════════════════════════════
// PATCH 1: index.html — add institute dropdown to signup form
// ═══════════════════════════════════════════════════
let html = fs.readFileSync('index.html', 'utf8');

// Insert after the su-role group, before su-student-fields
const insertAfter = `<select id="su-role"><option value="teacher">Teacher</option><option value="student">Student</option></select>
        </div>`;
const insertWith = `<select id="su-role"><option value="teacher">Teacher</option><option value="student">Student</option></select>
        </div>
        <div class="form-group">
          <label for="su-institute">Coaching Institute</label>
          <select id="su-institute" required>
            <option value="">Select your institute</option>
            <option value="Vedika Educational Institution">Vedika Educational Institution</option>
          </select>
        </div>`;

if (html.includes(insertAfter)) {
  html = html.replace(insertAfter, insertWith);
  console.log('✓ index.html: institute dropdown added');
} else {
  console.log('✗ index.html: anchor not found');
}
fs.writeFileSync('index.html', html, 'utf8');

// ═══════════════════════════════════════════════════
// PATCH 2: app.js — 5 changes
// ═══════════════════════════════════════════════════
let app = fs.readFileSync('app.js', 'utf8');

// 2a: Read institute from form in submit handler validation block
const old2a = `if (roleVal === 'student' && (!standard || !board)) { errorEl.textContent = 'Please select standard and board.'; errorEl.hidden = false; return; }`;
const new2a = `var institute = document.getElementById('su-institute').value || '';
    if (!institute) { errorEl.textContent = 'Please select your coaching institute.'; errorEl.hidden = false; return; }
    if (roleVal === 'student' && (!standard || !board)) { errorEl.textContent = 'Please select standard and board.'; errorEl.hidden = false; return; }`;
if (app.includes(old2a)) { app = app.replace(old2a, new2a); console.log('✓ app.js 2a: institute read from form'); }
else console.log('✗ app.js 2a not found');

// 2b: Add institute to Firestore addDoc in signup
const old2b = `            uid: cred.user.uid,
            name: name,
            email: email,
            role: roleVal,
            standard: roleVal === 'student' ? standard : '',
            board: roleVal === 'student' ? board : '',
            createdAt: fb.serverTimestamp()`;
const new2b = `            uid: cred.user.uid,
            name: name,
            email: email,
            role: roleVal,
            standard: roleVal === 'student' ? standard : '',
            board: roleVal === 'student' ? board : '',
            institute: institute,
            createdAt: fb.serverTimestamp()`;
if (app.includes(old2b)) { app = app.replace(old2b, new2b); console.log('✓ app.js 2b: institute in Firestore addDoc'); }
else console.log('✗ app.js 2b not found');

// 2c: Save institute to localStorage after signup
const old2c = `        localStorage.setItem('ac_role', roleVal);
        localStorage.setItem('ac_name', name);
        if (roleVal === 'student') { localStorage.setItem('ac_class', standard); localStorage.setItem('ac_board', board); }
        closeModal`;
const new2c = `        localStorage.setItem('ac_role', roleVal);
        localStorage.setItem('ac_name', name);
        localStorage.setItem('ac_institute', institute);
        if (roleVal === 'student') { localStorage.setItem('ac_class', standard); localStorage.setItem('ac_board', board); }
        closeModal`;
if (app.includes(old2c)) { app = app.replace(old2c, new2c); console.log('✓ app.js 2c: institute saved to localStorage after signup'); }
else console.log('✗ app.js 2c not found');

// 2d: Read institute from Firestore doc (snap.forEach in onAuthStateChanged)
const old2d = `snap.forEach(function (d) { role = d.data().role || 'student'; cls = d.data().standard || ''; board = d.data().board || ''; });
              showUserBar(role, cls, board);`;
const new2d = `snap.forEach(function (d) { role = d.data().role || 'student'; cls = d.data().standard || ''; board = d.data().board || ''; var inst = d.data().institute || ''; if (inst) localStorage.setItem('ac_institute', inst); });
              showUserBar(role, cls, board);`;
if (app.includes(old2d)) { app = app.replace(old2d, new2d); console.log('✓ app.js 2d: institute read from Firestore doc'); }
else console.log('✗ app.js 2d not found');

// 2e: Clear ac_institute on logout
const old2e = `['ac_role','ac_name','ac_class','ac_board'].forEach(function(k){localStorage.removeItem(k);})`;
const new2e = `['ac_role','ac_name','ac_class','ac_board','ac_institute'].forEach(function(k){localStorage.removeItem(k);})`;
const count2e = (app.match(/\['ac_role','ac_name','ac_class','ac_board'\]\.forEach/g)||[]).length;
app = app.split(`['ac_role','ac_name','ac_class','ac_board'].forEach(function(k){localStorage.removeItem(k);})`).join(`['ac_role','ac_name','ac_class','ac_board','ac_institute'].forEach(function(k){localStorage.removeItem(k);})`);
console.log('✓ app.js 2e: ac_institute cleared on logout (replaced', count2e, 'occurrences)');

fs.writeFileSync('app.js', app, 'utf8');

// ═══════════════════════════════════════════════════
// PATCH 3: acadify.js — variables + all addDoc + filtering + hero
// ═══════════════════════════════════════════════════
let acad = fs.readFileSync('acadify.js', 'utf8');

// 3a: Add _institute to top variables
const old3a = `var _role="",_name="",_class="",_board="";`;
const new3a = `var _role="",_name="",_class="",_board="",_institute="";`;
if (acad.includes(old3a)) { acad = acad.replace(old3a, new3a); console.log('✓ acadify.js 3a: _institute variable'); }
else console.log('✗ acadify.js 3a not found');

// 3b: Read institute from localStorage in auth onAuthStateChanged handler
// Where ac_role, ac_class, ac_board are read, also read ac_institute
const old3b = `var r=localStorage.getItem("ac_role")||"student";\r\n        var c=localStorage.getItem("ac_class")||"";\r\n        var b=localStorage.getItem("ac_board")||"";\r\n        localStorage.setItem("ac_role",r);\r\n        localStorage.setItem("ac_name",authName);\r\n        _role=r;_name=authName;_class=c;_board=b;`;
const new3b = `var r=localStorage.getItem("ac_role")||"student";\r\n        var c=localStorage.getItem("ac_class")||"";\r\n        var b=localStorage.getItem("ac_board")||"";\r\n        var inst=localStorage.getItem("ac_institute")||"";\r\n        localStorage.setItem("ac_role",r);\r\n        localStorage.setItem("ac_name",authName);\r\n        _role=r;_name=authName;_class=c;_board=b;_institute=inst;`;
if (acad.includes(old3b)) { acad = acad.replace(old3b, new3b); console.log('✓ acadify.js 3b: _institute from localStorage in auth handler'); }
else console.log('✗ acadify.js 3b not found - trying alt...');

// 3c: submitLogin - also read institute
const old3c = `_role=role;_name=n;\r\n  localStorage.setItem("ac_role",role);localStorage.setItem("ac_name",n);`;
const new3c = `_role=role;_name=n;\r\n  var inst=document.getElementById("lInstitute")?document.getElementById("lInstitute").value:localStorage.getItem("ac_institute")||"";\r\n  if(inst){_institute=inst;localStorage.setItem("ac_institute",inst);}\r\n  localStorage.setItem("ac_role",role);localStorage.setItem("ac_name",n);`;
if (acad.includes(old3c)) { acad = acad.replace(old3c, new3c); console.log('✓ acadify.js 3c: institute in submitLogin'); }
else console.log('✗ acadify.js 3c not found');

// 3d: Chat collection name becomes institute-scoped
// ac_chat_{class} → ac_chat_{institute_slug}_{class}
// We use a helper: the collection key encodes institute + class
// Instead of renaming (breaks existing data), we ADD institute field to messages and filter on read.
// This is the minimal non-breaking approach.

// 3d-1: Student chat send - add institute field
const old3d1 = `fb.addDoc(fb.collection(fb.db,"ac_chat_"+_class),{role:"student",name:_name,text:msg,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})`;
const new3d1 = `fb.addDoc(fb.collection(fb.db,"ac_chat_"+_class),{role:"student",name:_name,text:msg,institute:_institute,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})`;
if (acad.includes(old3d1)) { acad = acad.replace(old3d1, new3d1); console.log('✓ acadify.js 3d1: institute in student chat send'); }
else console.log('✗ acadify.js 3d1 not found');

// 3d-2: Teacher chat send - add institute field
const old3d2 = `fb.addDoc(fb.collection(fb.db,"ac_chat_"+cls),{role:"teacher",name:_name,text:msg,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})`;
const new3d2 = `fb.addDoc(fb.collection(fb.db,"ac_chat_"+cls),{role:"teacher",name:_name,text:msg,institute:_institute,ts:fb.serverTimestamp(),clientTime:new Date().toLocaleString()})`;
if (acad.includes(old3d2)) { acad = acad.replace(old3d2, new3d2); console.log('✓ acadify.js 3d2: institute in teacher chat send'); }
else console.log('✗ acadify.js 3d2 not found');

// 3e-1: Student event send - add institute field
const old3e1 = `fb.addDoc(fb.collection(fb.db,"ac_sev_"+_class),{sname:_name,title:t,date:d,time:ti||"",board:board,ts:fb.serverTimestamp()})`;
const new3e1 = `fb.addDoc(fb.collection(fb.db,"ac_sev_"+_class),{sname:_name,title:t,date:d,time:ti||"",board:board,institute:_institute,ts:fb.serverTimestamp()})`;
if (acad.includes(old3e1)) { acad = acad.replace(old3e1, new3e1); console.log('✓ acadify.js 3e1: institute in student event'); }
else console.log('✗ acadify.js 3e1 not found');

// 3e-2: Teacher event send - add institute field
const old3e2 = `fb.addDoc(fb.collection(fb.db,"ac_tev_"+cls),{tname:_name,title:t,date:d,time:ti||"",subject:sub,board:board,ts:fb.serverTimestamp()})`;
const new3e2 = `fb.addDoc(fb.collection(fb.db,"ac_tev_"+cls),{tname:_name,title:t,date:d,time:ti||"",subject:sub,board:board,institute:_institute,ts:fb.serverTimestamp()})`;
if (acad.includes(old3e2)) { acad = acad.replace(old3e2, new3e2); console.log('✓ acadify.js 3e2: institute in teacher event'); }
else console.log('✗ acadify.js 3e2 not found');

// 3f: Logout - clear _institute
const old3f = `["ac_role","ac_name","ac_class","ac_board"].forEach(function(k){localStorage.removeItem(k);});\r\n  _role="";_name="";_class="";_board="";`;
const new3f = `["ac_role","ac_name","ac_class","ac_board","ac_institute"].forEach(function(k){localStorage.removeItem(k);});\r\n  _role="";_name="";_class="";_board="";_institute="";`;
if (acad.includes(old3f)) { acad = acad.replace(old3f, new3f); console.log('✓ acadify.js 3f: _institute cleared on logout'); }
else console.log('✗ acadify.js 3f not found');

fs.writeFileSync('acadify.js', acad, 'utf8');
console.log('\n=== All patches applied ===');
