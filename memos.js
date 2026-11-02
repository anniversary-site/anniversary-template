(function () {
  var layer = document.querySelector('#desktop-memos');
  var placement = document.querySelector('#memo-placement');
  var preview = placement.querySelector('.memo-preview');
  var add = document.querySelector('#memo-add');
  var toggle = document.querySelector('#memo-toggle');
  var storageKey = 'anniv-desktop-memos-v2';
  var notes = [], visible = true, initialized = false, order = 1;
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) notes = parsed.filter(function (n) {
        return n && typeof n.id === 'string' && typeof n.text === 'string' && Number.isFinite(n.x) && Number.isFinite(n.y);
      });
    } else {
      var oldText = localStorage.getItem('anniv-desktop-memo');
      if (oldText) notes.push({ id: 'imported-memo', text: oldText, x: 140, y: 30 });
    }
    visible = localStorage.getItem('anniv-desktop-memo-visible') !== '0';
  } catch (e) {}

  function save(status) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
      if (status) { status.textContent = ''; status.hidden = true; }
    } catch (e) {
      if (status) { status.textContent = '저장하지 못했어요. 내용을 복사해 주세요.'; status.hidden = false; }
    }
  }
  function size() {
    return { width: Math.min(260, innerWidth - 16), height: Math.min(240, Math.max(80, innerHeight - 54)) };
  }
  function position(x, y) {
    var s = size();
    return { x: Math.max(8, Math.min(x, innerWidth - s.width - 8)), y: Math.max(8, Math.min(y, innerHeight - 34 - s.height - 8)) };
  }
  function move(element, note) {
    var p = position(note.x, note.y);
    element.style.left = p.x + 'px';
    element.style.top = p.y + 'px';
  }
  function visibility() {
    layer.hidden = !visible;
    toggle.textContent = visible ? '메모 숨기기' : '메모 보기';
    toggle.setAttribute('aria-expanded', String(visible));
    toggle.classList.toggle('on', visible);
    try { localStorage.setItem('anniv-desktop-memo-visible', visible ? '1' : '0'); } catch (e) {}
  }
  function cancelPlacement() {
    placement.hidden = true;
    add.classList.remove('on');
    add.setAttribute('aria-pressed', 'false');
  }
  function render(focusId) {
    layer.replaceChildren();
    notes.forEach(function (note) {
      var card = document.createElement('aside');
      card.className = 'desktop-memo win';
      card.setAttribute('aria-label', '바탕화면 메모');
      var bar = document.createElement('div'); bar.className = 'titlebar';
      var label = document.createElement('label'); label.className = 'title'; label.textContent = 'Memo';
      label.htmlFor = 'memo-' + note.id;
      var remove = document.createElement('button'); remove.className = 'tbtn'; remove.textContent = '✕';
      remove.setAttribute('aria-label', '이 메모 삭제');
      var text = document.createElement('textarea'); text.id = label.htmlFor;
      text.placeholder = '여기에 메모를 남겨 보세요.'; text.value = note.text; text.spellcheck = false;
      var status = document.createElement('p'); status.className = 'memo-status'; status.setAttribute('role', 'status');
      status.hidden = true;
      text.addEventListener('input', function () { note.text = text.value; save(status); });
      remove.onclick = function () {
        notes = notes.filter(function (n) { return n !== note; });
        save(status); render(); add.focus();
      };
      bar.append(label, remove); card.append(bar, text, status); layer.appendChild(card); move(card, note);
      card.addEventListener('pointerdown', function () { card.style.zIndex = ++order; });
      var drag = null;
      bar.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button') || e.button !== 0) return;
        e.preventDefault();
        var rect = card.getBoundingClientRect();
        drag = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        bar.setPointerCapture(e.pointerId);
      });
      bar.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var p = position(e.clientX - drag.x, e.clientY - drag.y);
        note.x = p.x; note.y = p.y; move(card, note);
      });
      function finish() { if (drag) { drag = null; save(status); } }
      bar.addEventListener('pointerup', finish);
      bar.addEventListener('pointercancel', finish);
      bar.addEventListener('lostpointercapture', finish);
      if (note.id === focusId) { card.style.zIndex = ++order; text.focus(); }
    });
  }
  add.onclick = function () {
    if (!placement.hidden) { cancelPlacement(); return; }
    visible = true; visibility();
    placement.hidden = false;
    add.classList.add('on'); add.setAttribute('aria-pressed', 'true');
    var p = position(innerWidth / 2, 80);
    preview.style.left = p.x + 'px'; preview.style.top = p.y + 'px';
    document.querySelector('#memo-placement-cancel').focus();
  };
  placement.addEventListener('pointermove', function (e) {
    var p = position(e.clientX, e.clientY);
    preview.style.left = p.x + 'px'; preview.style.top = p.y + 'px';
  });
  placement.addEventListener('click', function (e) {
    if (e.target.closest('p')) return;
    var p = position(e.clientX, e.clientY);
    var note = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), text: '', x: p.x, y: p.y };
    notes.push(note); cancelPlacement(); render(note.id);
    save(layer.lastElementChild.querySelector('.memo-status'));
  });
  document.querySelector('#memo-placement-cancel').onclick = function () { cancelPlacement(); add.focus(); };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !placement.hidden) { cancelPlacement(); add.focus(); }
  });
  toggle.onclick = function () { cancelPlacement(); visible = !visible; visibility(); };
  window.addEventListener('resize', function () {
    Array.from(layer.children).forEach(function (card, i) { move(card, notes[i]); });
  });
  window.DesktopMemos = { enter: function () {
    if (!initialized) { render(); initialized = true; }
    visibility();
  } };
})();
