(function(){
  var STORAGE_KEY = 'ab_shishyavrutti_arj_students';
  /* विशाल सरांचा WhatsApp (फक्त अंक, 91 ने सुरू). रिकामे ठेवल्यास फक्त संदेश कॉपी होईल. */
  var WHATSAPP_NUMBER = '';
  var fieldIds = ['schoolAddr','arjDate','studFullName','classGrade','s2MotherName','s2FatherName',
    'permAddr','currAddr','dobDate','gender','prevSchoolType','prevSchoolOther','prevScholarship',
    'caste','grNumber','aadhaar',
    's3MotherName','s3FatherName','fatherOccupation','totalIncome','jobIncome',
    'otherIncome','bankName','branch','accountNumber','teacherName','teacherMobile'];
  var SCHOOL_DEFAULT = 'नवीन प्राथमिक शाळा, भुईकोट किल्ला, मालेगाव, जि. नाशिक';

  function toDevDigits(n){
    var map = {'0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'};
    return String(n).split('').map(function(c){ return map[c] !== undefined ? map[c] : c; }).join('');
  }
  function formatDevDate(iso){
    if(!iso) return '';
    var p = iso.split('-');
    if(p.length !== 3) return iso;
    return toDevDigits(p[2]) + '-' + toDevDigits(p[1]) + '-' + toDevDigits(p[0]);
  }
  function todayISO(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function calcAge(dobStr){
    if(!dobStr) return '';
    var dob = new Date(dobStr + 'T00:00:00');
    var today = new Date();
    var years = today.getFullYear() - dob.getFullYear();
    var months = today.getMonth() - dob.getMonth();
    if(today.getDate() < dob.getDate()){ months--; }
    if(months < 0){ years--; months += 12; }
    if(years < 0) return '';
    return toDevDigits(years) + ' वर्षे ' + toDevDigits(months) + ' महिने';
  }
  function updateAge(){
    document.getElementById('ageDisplay').value = calcAge(document.getElementById('dobDate').value);
    document.getElementById('dobDatePrint').textContent = formatDevDate(document.getElementById('dobDate').value);
  }
  function updatePrintDates(){
    document.getElementById('arjDatePrint').textContent = formatDevDate(document.getElementById('arjDate').value);
    document.getElementById('dobDatePrint').textContent = formatDevDate(document.getElementById('dobDate').value);
  }
  function togglePrevSchoolOther(){
    var val = document.getElementById('prevSchoolType').value;
    var row = document.getElementById('prevSchoolOtherRow');
    if(val === 'new2to4'){ row.style.display = 'flex'; }
    else { row.style.display = 'none'; document.getElementById('prevSchoolOther').value = ''; }
  }
  function safeFileName(name){
    var n = (name || 'arj').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
    return n || 'shishyavrutti-arj';
  }

  var currentId = null;
  var currentPhoto = null;
  var editing = true;

  var statusMsg = document.getElementById('statusMsg');
  var savedSelect = document.getElementById('savedSelect');
  var editSaveBtn = document.getElementById('editSaveBtn');
  var photoBox = document.getElementById('photoBox');
  var photoInput = document.getElementById('photoInput');

  function showStatus(text){
    statusMsg.innerHTML = text;
    setTimeout(function(){ if(statusMsg.innerHTML === text) statusMsg.innerHTML = ''; }, 4500);
  }

  function getAll(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function setAll(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function refreshSelect(selectId){
    var list = getAll();
    savedSelect.innerHTML = '<option value="">— जतन केलेले अर्ज —</option>';
    list.forEach(function(entry){
      var opt = document.createElement('option');
      opt.value = entry.id;
      var label = (entry.data.studFullName || 'नाव नाही') + ' — ' + (entry.data.classGrade || '');
      opt.innerHTML = label;
      savedSelect.appendChild(opt);
    });
    if(selectId){ savedSelect.value = selectId; }
  }

  function setEditing(state){
    editing = state;
    fieldIds.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      if(el.tagName === 'SELECT'){ el.disabled = !state; }
      else { el.readOnly = !state; }
    });
    document.getElementById('ageDisplay').readOnly = true;
    photoInput.disabled = !state;
    editSaveBtn.innerHTML = state ? 'जतन करा' : 'संपादन करा';
  }

  function clearForm(){
    fieldIds.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = '';
    });
    document.getElementById('schoolAddr').value = SCHOOL_DEFAULT;
    document.getElementById('arjDate').value = todayISO();
    document.getElementById('prevSchoolType').value = 'same';
    togglePrevSchoolOther();
    updateAge();
    updatePrintDates();
    currentPhoto = null;
    photoBox.innerHTML = 'फोटो';
    currentId = null;
    savedSelect.value = '';
  }

  function fillForm(entry){
    fieldIds.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = (entry.data && entry.data[id]) || '';
    });
    if(!document.getElementById('prevSchoolType').value){ document.getElementById('prevSchoolType').value = 'same'; }
    togglePrevSchoolOther();
    updateAge();
    updatePrintDates();
    currentPhoto = entry.photo || null;
    if(currentPhoto){
      photoBox.innerHTML = '';
      var img = document.createElement('img');
      img.src = currentPhoto;
      photoBox.appendChild(img);
    } else {
      photoBox.innerHTML = 'फोटो';
    }
    currentId = entry.id;
  }

  function collectData(){
    var data = {};
    fieldIds.forEach(function(id){
      var el = document.getElementById(id);
      data[id] = el ? el.value : '';
    });
    return data;
  }

  function bindPair(a, b){
    document.getElementById(a).addEventListener('input', function(e){
      document.getElementById(b).value = e.target.value;
    });
    document.getElementById(b).addEventListener('input', function(e){
      document.getElementById(a).value = e.target.value;
    });
  }
  bindPair('s2MotherName','s3MotherName');
  bindPair('s2FatherName','s3FatherName');

  document.getElementById('dobDate').addEventListener('change', updateAge);
  document.getElementById('arjDate').addEventListener('change', updatePrintDates);
  document.getElementById('prevSchoolType').addEventListener('change', togglePrevSchoolOther);
  document.getElementById('aadhaar').addEventListener('input', function(e){
    var digits = e.target.value.replace(/[^0-9]/g,'').slice(0,12);
    e.target.value = digits.replace(/(.{4})(?=.)/g, '$1 ');
  });

  photoInput.addEventListener('change', function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(evt){
      currentPhoto = evt.target.result;
      photoBox.innerHTML = '';
      var img = document.createElement('img');
      img.src = currentPhoto;
      photoBox.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  function saveCurrent(){
    var data = collectData();
    if(!data.studFullName){
      showStatus('कृपया विद्यार्थ्यांचे पूर्ण नाव भरा, नंतर जतन करा.');
      return false;
    }
    var list = getAll();
    if(currentId){
      var idx = list.findIndex(function(e){ return e.id === currentId; });
      if(idx > -1){ list[idx] = {id: currentId, data: data, photo: currentPhoto}; }
      else { list.push({id: currentId, data: data, photo: currentPhoto}); }
    } else {
      currentId = 'stu_' + Date.now();
      list.push({id: currentId, data: data, photo: currentPhoto});
    }
    setAll(list);
    refreshSelect(currentId);
    return true;
  }

  editSaveBtn.addEventListener('click', function(){
    if(editing){
      if(!saveCurrent()) return;
      setEditing(false);
      showStatus('अर्ज यशस्वीरित्या जतन झाला.');
    } else {
      setEditing(true);
    }
  });

  document.getElementById('newBtn').addEventListener('click', function(){
    clearForm();
    setEditing(true);
    showStatus('नवीन कोरा अर्ज तयार आहे.');
  });

  document.getElementById('loadBtn').addEventListener('click', function(){
    var id = savedSelect.value;
    if(!id){ showStatus('कृपया यादीतून विद्यार्थी निवडा.'); return; }
    var list = getAll();
    var entry = list.find(function(e){ return e.id === id; });
    if(entry){
      fillForm(entry);
      setEditing(false);
      showStatus('अर्ज उघडला — बदल करण्यासाठी "संपादन करा" दाबा.');
    }
  });

  document.getElementById('deleteBtn').addEventListener('click', function(){
    var id = savedSelect.value;
    if(!id){ showStatus('कृपया काढून टाकण्यासाठी यादीतून विद्यार्थी निवडा.'); return; }
    var list = getAll().filter(function(e){ return e.id !== id; });
    setAll(list);
    refreshSelect();
    if(currentId === id){ clearForm(); setEditing(true); }
    showStatus('अर्ज काढून टाकला.');
  });

  document.getElementById('printBtn').addEventListener('click', function(){
    updatePrintDates();
    window.print();
  });

  document.getElementById('pdfBtn').addEventListener('click', function(){
    var name = document.getElementById('studFullName').value;
    if(!name){
      showStatus('PDF करण्याआधी विद्यार्थ्यांचे पूर्ण नाव भरा.');
      return;
    }
    if(typeof html2pdf === 'undefined'){
      showStatus('PDF लायब्ररी लोड झाली नाही. "प्रिंट करा" वापरा व Save as PDF निवडा.');
      return;
    }
    updatePrintDates();
    var btn = document.getElementById('pdfBtn');
    btn.disabled = true;
    showStatus('PDF तयार होत आहे, कृपया थांबा...');
    var sheet = document.getElementById('arjForm');
    var filename = safeFileName(name) + '_शिष्यवृत्ती-अर्ज.pdf';
    var opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(sheet).save().then(function(){
      btn.disabled = false;
      showStatus('PDF डाउनलोड झाली. आता ती विशाल सरांकडे WhatsApp ने पाठवा.');
    }).catch(function(){
      btn.disabled = false;
      showStatus('PDF तयार करताना अडचण. "प्रिंट करा" दाबा व Save as PDF निवडा.');
    });
  });

  document.getElementById('waBtn').addEventListener('click', function(){
    var data = collectData();
    var text =
      'सुवर्ण महोत्सवी आदिवासी पूर्व माध्यमिक शिष्यवृत्ती अर्ज' + '\n' +
      'विद्यार्थी : ' + (data.studFullName || '-') + '\n' +
      'इयत्ता : ' + (data.classGrade || '-') + '\n' +
      'शाळा : ' + (data.schoolAddr || '-') + '\n' +
      'शिक्षक : ' + (data.teacherName || '-') +
      (data.teacherMobile ? (' (' + data.teacherMobile + ')') : '') + '\n\n' +
      'भरलेल्या अर्जाची PDF या संदेशासोबत जोडून पाठवत आहे.';
    if(WHATSAPP_NUMBER){
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    } else {
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          showStatus('संदेश कॉपी झाला. WhatsApp उघडा, पेस्ट करा व PDF जोडा.');
        }).catch(function(){
          showStatus('WhatsApp मध्ये हा संदेश लिहा व PDF जोडा.');
        });
      } else {
        showStatus('WhatsApp मध्ये विद्यार्थ्याचे नाव लिहा व PDF जोडा.');
      }
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
  });

  refreshSelect();
  document.getElementById('schoolAddr').value = SCHOOL_DEFAULT;
  document.getElementById('arjDate').value = todayISO();
  togglePrevSchoolOther();
  updatePrintDates();
  setEditing(true);
})();
