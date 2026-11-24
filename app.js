(function () {
  var S = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };

  // theme
  var r = document.documentElement.style;
  r.setProperty("--main", S.theme.main); r.setProperty("--dark", S.theme.dark);
  r.setProperty("--light", S.theme.light); r.setProperty("--bg", S.theme.bg);
  document.title = S.title;

  // ---------- login ----------
  $("#login-title").textContent = S.loginTitle;
  $("#login-msg").textContent = S.loginMessage;
  $("#login-user").value = S.userName;
  $("#sm-title").textContent = S.startMenu;

  // 순수 JS SHA-256 (file:// 등 비보안 컨텍스트에서도 동작)
  function sha256(str) {
    var m = unescape(encodeURIComponent(str)), l = m.length, w = [], i, j;
    var K = [], H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var p = 2, n = 0;
    while (n < 64) {
      var prime = true;
      for (i = 2; i * i <= p; i++) if (p % i === 0) { prime = false; break; }
      if (prime) { K[n++] = (Math.pow(p, 1 / 3) * 4294967296) | 0; }
      p++;
    }
    for (i = 0; i < l; i++) w[i >> 2] |= m.charCodeAt(i) << (24 - (i % 4) * 8);
    w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    w[(((l + 8) >> 6) << 4) + 15] = l * 8;
    var rr = function (x, c) { return (x >>> c) | (x << (32 - c)); };
    for (j = 0; j < w.length; j += 16) {
      var a = H.slice(), x = [];
      for (i = 0; i < 64; i++) {
        if (i < 16) x[i] = w[j + i] | 0;
        else x[i] = (x[i - 16] + (rr(x[i - 15], 7) ^ rr(x[i - 15], 18) ^ (x[i - 15] >>> 3)) + x[i - 7] + (rr(x[i - 2], 17) ^ rr(x[i - 2], 19) ^ (x[i - 2] >>> 10))) | 0;
        var t1 = (a[7] + (rr(a[4], 6) ^ rr(a[4], 11) ^ rr(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[i] + x[i]) | 0;
        var t2 = ((rr(a[0], 2) ^ rr(a[0], 13) ^ rr(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (h) { return ("00000000" + (h >>> 0).toString(16)).slice(-8); }).join("");
  }

  var site = window.UrluvSite || { key: null };

  function wrongPassword(message) {
    $("#login-err").textContent = message || "Wrong Password!";
    $("#login-err").hidden = false;
    var l = $("#login"); l.classList.remove("shake"); void l.offsetWidth; l.classList.add("shake");
    $("#login-pw").select();
  }

  var checking = false;
  function tryLogin() {
    // 고객 사이트: 비밀번호 확인과 내용은 서버가 줍니다.
    if (site.key) {
      if (checking) return;
      checking = true; $("#login-ok").disabled = true;
      site.open($("#login-pw").value).then(function (ok) {
        if (ok) enter(); else wrongPassword();
      }, function (error) {
        wrongPassword(error && error.message);
      }).then(function () { checking = false; $("#login-ok").disabled = false; });
      return;
    }
    if (sha256(S.passwordSalt + $("#login-pw").value) === S.passwordHash) {
      try { sessionStorage.setItem("anniv-auth", "1"); } catch (e) {}
      enter();
    } else {
      wrongPassword();
    }
  }
  $("#login-ok").onclick = tryLogin;
  $("#login-pw").addEventListener("keydown", function (e) { if (e.key === "Enter") tryLogin(); });
  $("#login-cancel").onclick = function () { $("#login-pw").value = ""; $("#login-err").hidden = true; };

  function enter() {
    $("#login").hidden = true;
    $("#desktop").hidden = false;
    $("#taskbar").hidden = false;
    buildDesktop();
    window.DesktopMemos.enter();
    tick();
    openNotice();
  }
  if (site.key && site.previewing) {
    // 운영자 미리보기: 비밀번호 화면을 건너뛰고 바로 엽니다.
    var banner = document.createElement("p");
    banner.className = "admin-preview-banner";
    banner.setAttribute("role", "status");
    banner.textContent = "관리자 미리보기 · 고객에게는 비밀번호 화면부터 보여요";
    document.body.appendChild(banner);
    site.preview().then(function () { enter(); }, function (error) {
      banner.textContent += " · " + (error && error.message || "사이트를 불러오지 못했어요.");
    });
  } else if (site.key) {
    // 받는 분 이름과 힌트를 잠금 화면에 보여 주고, 이 탭에서 이미 열었으면 바로 들어갑니다.
    site.lock().then(function (lock) {
      $("#login-user").value = lock.recipientName || "";
      $("#login-msg").textContent = lock.passwordHint ? S.loginMessage + "\n(힌트: " + lock.passwordHint + ")" : S.loginMessage;
    }, function (error) {
      $("#login-msg").textContent = error && error.message || "사이트를 불러오지 못했어요.";
      $("#login-pw").disabled = true; $("#login-ok").disabled = true;
    });
    site.resume().then(function (ok) { if (ok) enter(); });
  } else {
    // 데모 화면: 비밀번호를 몰라도 둘러볼 수 있게 우회 버튼을 보여 줍니다(고객 사이트에는 없음).
    $("#login-demo-row").hidden = false;
    $("#login-demo").onclick = function () {
      try { sessionStorage.setItem("anniv-auth", "1"); } catch (e) {}
      enter();
    };
    try { if (sessionStorage.getItem("anniv-auth") === "1") { setTimeout(enter, 0); } } catch (e) {}
  }

  // ---------- clock / d-day ----------
  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    $("#clock").textContent = (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "AM" : "PM");
    var start = new Date(S.startDate + "T00:00:00");
    var days = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 864e5) + 1;
    $("#dday").textContent = "♥ D+" + days;
    window.RenewalNotice.update(d);
  }
  setInterval(tick, 20000);
  $("#clover").onclick = function () { alert("This moment will come again.\n우리의 오늘도 기념일이에요."); };

  // ---------- desktop ----------
  function buildDesktop() {
    var dt = $("#desktop");
    if (dt.children.length) return;
    var iconGrid = el("div", "desktop-icons");
    dt.appendChild(iconGrid);
    S.icons.forEach(function (ic) {
      var d = el("div", "dicon");
      var iconBox = el("div", "ic");
      var iconImage = el("img");
      iconImage.src = ic.icon;
      iconImage.alt = "";
      iconImage.draggable = false;
      iconBox.appendChild(iconImage);
      var label = el("span", "lb"); label.textContent = ic.label;
      d.append(iconBox, label);
      var open = function () { launch(ic); };
      d.addEventListener("click", function () {
        document.querySelectorAll(".dicon.sel").forEach(function (x) { x.classList.remove("sel"); });
        d.classList.add("sel");
        if (matchMedia("(pointer:coarse)").matches) open();
      });
      d.addEventListener("dblclick", open);
      iconGrid.appendChild(d);
    });
    dt.addEventListener("click", function (e) {
      if (e.target === dt || e.target === iconGrid) document.querySelectorAll(".dicon.sel").forEach(function (x) { x.classList.remove("sel"); });
    });
  }

  function launch(ic) {
    if (ic.type === "information") openInformation();
    else if (ic.type === "folder") openFolder(ic.ref);
    else if (ic.type === "note") openNote(ic.ref);
    else if (ic.type === "photobooth") openBooth();
    else if (ic.type === "paint") openPaint();
    else if (ic.type === "link") window.open(ic.url, "_blank", "noopener");
    else if (ic.type === "trash") alert("휴지통은 비어 있어요. 우리 추억은 하나도 버리지 않았거든요.");
  }

  // ---------- window manager ----------
  var openWins = {}, z = 10, cascade = 0;
  var windowsEl = $("#windows"), tasksEl = $("#tasks");

  function focusWin(w) {
    document.querySelectorAll("#windows .win").forEach(function (x) { x.classList.remove("focused"); });
    w.el.classList.add("focused"); w.el.style.zIndex = ++z;
    w.el.hidden = false; w.min = false;
    document.querySelectorAll("#tasks .btn").forEach(function (b) { b.classList.remove("on"); });
    w.task.classList.add("on");
  }

  function createWin(key, title, opts, build) {
    if (key && openWins[key]) { focusWin(openWins[key]); return openWins[key]; }
    opts = opts || {};
    var win = el("div", "win");
    var tb = el("div", "titlebar");
    var t = el("span", "title"); t.textContent = title;
    var bMin = el("button", "tbtn", "_"), bMax = el("button", "tbtn", "□"), bClose = el("button", "tbtn", "✕");
    tb.append(t, bMin, bMax, bClose);
    var body = el("div", "win-body"); body.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column";
    win.append(tb, body);
    var W = Math.min(opts.w || 520, innerWidth - 20), H = Math.min(opts.h || 400, innerHeight - 70);
    win.style.width = W + "px"; win.style.height = H + "px";
    var off = (cascade++ % 6) * 26;
    win.style.left = Math.max(4, Math.min(innerWidth - W - 4, 110 + off)) + "px";
    win.style.top = Math.max(4, 30 + off) + "px";
    windowsEl.appendChild(win);

    var task = el("button", "btn"); task.textContent = title;
    tasksEl.appendChild(task);
    var w = { el: win, task: task, title: t, body: body, key: key };
    if (key) openWins[key] = w;

    win.addEventListener("pointerdown", function () { focusWin(w); });
    task.onclick = function () {
      if (w.min || !win.classList.contains("focused")) focusWin(w);
      else { win.hidden = true; w.min = true; task.classList.remove("on"); }
    };
    bMin.onclick = function (e) { e.stopPropagation(); win.hidden = true; w.min = true; task.classList.remove("on"); };
    bMax.onclick = function (e) { e.stopPropagation(); win.classList.toggle("max"); };
    tb.addEventListener("dblclick", function () { win.classList.toggle("max"); });
    bClose.onclick = function (e) {
      e.stopPropagation();
      if (w.onclose) w.onclose();
      win.remove(); task.remove(); if (key) delete openWins[key];
    };
    // drag
    tb.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".tbtn") || win.classList.contains("max") || matchMedia("(max-width:640px)").matches) return;
      var sx = e.clientX, sy = e.clientY, ox = win.offsetLeft, oy = win.offsetTop;
      tb.setPointerCapture(e.pointerId);
      var mv = function (ev) {
        win.style.left = Math.max(-W + 80, Math.min(innerWidth - 80, ox + ev.clientX - sx)) + "px";
        win.style.top = Math.max(0, Math.min(innerHeight - 70, oy + ev.clientY - sy)) + "px";
      };
      var up = function () { tb.removeEventListener("pointermove", mv); tb.removeEventListener("pointerup", up); };
      tb.addEventListener("pointermove", mv); tb.addEventListener("pointerup", up);
    });
    build(w, body);
    focusWin(w);
    return w;
  }

  // ---------- apps ----------
  function openNotice() {
    createWin("notice", "공지사항", { w: 540, h: 430 }, function (w, body) {
      var content = el("div", "content site-notice");
      var sections = [
        ["이 사이트에서 할 수 있는 일", [
          "Our Story와 Letter를 읽고 사진·영상 폴더, Music, Internet 아이콘을 열어 보세요.",
          "포토부스에서 사진을 찍고, Paint에서 그림을 그리거나 게임을 즐길 수 있어요.",
          "바탕화면에 메모를 남겨 마음을 전할 수 있어요."
        ]],
        ["이용 전 확인해 주세요", [
          "메모·그림·포토부스 결과물은 이 사이트를 함께 보는 사람에게도 보여요. 개인 정보는 남기지 마세요.",
          "음악은 연결된 YouTube 영상의 설정에 따라 재생되지 않을 수 있어요."
        ]]
      ];
      sections.forEach(function (section) {
        var heading = el("h2"); heading.textContent = section[0];
        var list = el("ul");
        section[1].forEach(function (line) { var item = el("li"); item.textContent = line; list.appendChild(item); });
        content.append(heading, list);
      });
      body.appendChild(content);
    });
  }

  function openInformation() {
    createWin("information", "Our Story", { w: 520, h: 360 }, function (w, body) {
      var info = S.information || {};
      var content = el("div", "content information-content");
      var list = el("dl", "information-list");
      [["특별한 날", info.specialDate], ["특별한 장소", info.specialPlace], ["우리의 이야기", info.story]].forEach(function (field) {
        var term = el("dt"); term.textContent = field[0];
        var detail = el("dd"); detail.textContent = field[1] || "";
        list.append(term, detail);
      });
      content.appendChild(list); body.appendChild(content);
    });
  }

  function openNote(ref) {
    var n = S.notes[ref];
    createWin("note:" + ref, ref === "letter" ? "Letter" : n.title + " - Notepad", { w: 560, h: 420 }, function (w, b) {
      b.appendChild(el("div", "menubar", "<span>File</span><span>Edit</span><span>Search</span><span>Help</span>"));
      var c = el("div", "content"); var p = el("pre", "note"); p.textContent = n.text; c.appendChild(p); b.appendChild(c);
    });
  }

  function textWin(name, text) {
    createWin("text:" + name, name + " - Notepad", { w: 480, h: 340 }, function (w, b) {
      var c = el("div", "content"); var p = el("pre", "note"); p.textContent = text; c.appendChild(p); b.appendChild(c);
    });
  }

  function placeholderSVG(label, hue) {
    var h = hue || 340;
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',80%,88%)"/><stop offset="1" stop-color="hsl(' + (h + 30) + ',70%,72%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="200" y="150" font-size="60" text-anchor="middle">♥</text><text x="200" y="200" font-size="18" text-anchor="middle" fill="#7a3550" font-family="monospace">' + esc(label) + "</text></svg>");
  }

  function viewFile(f) {
    if (f.type === "game" && f.ref === "minesweeper") return openMinesweeper();
    if (f.type === "text") return textWin(f.name, f.text);
    if (f.type === "folder") return openFolder(f.ref);
    createWin("view:" + f.name, f.name, { w: 520, h: 420 }, function (w, b) {
      var c = el("div", "content"); var v = el("div", "viewer");
      if (f.type === "image") {
        var ph = placeholderSVG(f.caption || f.name, 330 + (f.name.length * 7) % 40);
        var img = el("img"); img.onerror = function () { img.onerror = null; img.src = ph; };
        img.src = f.src || ph;
        img.alt = f.caption || f.name; v.appendChild(img);
      } else if (f.type === "video") {
        var vph = function () { var im = el("img"); im.src = placeholderSVG("▶ " + (f.caption || f.name), 320); return im; };
        if (f.src) {
          var vd = el("video"); vd.src = f.src; vd.controls = true; vd.playsInline = true;
          vd.onerror = function () { vd.replaceWith(vph()); };
          v.appendChild(vd);
        } else v.appendChild(vph());
      } else if (f.type === "audio") {
        v.appendChild(el("div", "", '<div style="font-size:48px;text-align:center">🎵</div>'));
        if (f.src) { var a = el("audio"); a.src = f.src; a.controls = true; v.appendChild(a); }
        else v.appendChild(el("div", "cap", "(오디오 파일을 data.js에 연결해 주세요)"));
      }
      if (f.caption) v.appendChild(el("div", "cap", esc(f.caption)));
      c.appendChild(v); b.appendChild(c);
      w.onclose = function () { var m = c.querySelector("video,audio"); if (m) m.pause(); };
    });
  }

  var ICON = { game: "💗", text: "📄", image: "🖼️", video: "🎞️", audio: "🎵", folder: "📁" };
  var FILE_ICON = { game: "assets/icons/heart.svg", text: "assets/icons/letter.svg", image: "assets/icons/file.svg", video: "assets/icons/video.svg", audio: "assets/icons/music.svg" };
  function openFolder(ref) {
    if (ref === "record") return openMusic();
    var f = S.folders[ref];
    createWin("folder:" + ref, f.title, { w: 520, h: 400 }, function (w, b) {
      b.appendChild(el("div", "addr", "/" + esc(f.title) + "/"));
      var c = el("div", "content"); var list = el("div", "files");
      var fileSignature = null;
      function drawFiles(files) {
        var signature = files.map(function (file) { return [file.mediaId || "", file.src || "", file.name].join("|"); }).join(";");
        if (signature === fileSignature) return;
        fileSignature = signature;
        list.replaceChildren();
        files.forEach(function (file) {
        var d = el("div", "file" + (file.type === "game" ? " game-file" : ""));
        var iconBox = el("div", "ic");
        if (file.mediaId && file.src) {
          var iconImage = el("img");
          iconImage.src = file.src;
          iconImage.className = "media-thumb";
          iconImage.alt = "";
          iconImage.draggable = false;
          iconBox.appendChild(iconImage);
        } else {
          var iconSrc = file.type === "folder" && ref.indexOf("photo") === 0 ? "assets/icons/file.svg" : FILE_ICON[file.type];
          if (iconSrc) {
            var iconImageDefault = el("img");
            iconImageDefault.src = iconSrc;
            iconImageDefault.alt = "";
            iconImageDefault.draggable = false;
            iconBox.appendChild(iconImageDefault);
          } else iconBox.textContent = ICON[file.type] || "";
        }
        d.append(iconBox, document.createTextNode(file.name));
        d.addEventListener("click", function () {
          list.querySelectorAll(".sel").forEach(function (x) { x.classList.remove("sel"); });
          d.classList.add("sel");
          if (matchMedia("(pointer:coarse)").matches) viewFile(file);
        });
        d.addEventListener("dblclick", function () { viewFile(file); });
        if (file.mediaId && !(window.UrluvSite && window.UrluvSite.previewing)) {
          var remove = el("button", "btn file-delete", "삭제");
          remove.onclick = function (event) {
            event.stopPropagation();
            if (!window.confirm("이 사진을 삭제할까요?")) return;
            remove.disabled = true;
            window.UrluvSite.media.remove(file.mediaId).then(function () {
              loadFiles();
              window.dispatchEvent(new Event("urluv-site-media-updated"));
            }).catch(function () {
              remove.disabled = false;
              alert("파일을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
            });
          };
          d.appendChild(remove);
        }
        list.appendChild(d);
      });
      }
      var baseFiles = f.files.slice();
      function loadFiles() {
        if (ref !== "photo" || !window.UrluvSite || !window.UrluvSite.media) {
          drawFiles(baseFiles);
          return Promise.resolve();
        }
        return window.UrluvSite.media.list().then(function (files) {
          var captured = files.filter(function (m) { return m.type === "PHOTOBOOTH"; }).map(function (m, i) {
            return { name: "포토부스 " + String(i + 1).padStart(2, "0") + ".png", type: "image", src: m.url, caption: "포토부스에서 찍은 사진", mediaId: m.id };
          });
          drawFiles(baseFiles.concat(captured));
        }).catch(function () { drawFiles(baseFiles); });
      }
      c.appendChild(list); b.appendChild(c);
      loadFiles();
      var hasMediaApi = ref === "photo" && window.UrluvSite && window.UrluvSite.media;
      var refresh = hasMediaApi ? window.setInterval(loadFiles, 5000) : null;
      if (hasMediaApi) window.addEventListener("urluv-site-media-updated", loadFiles);
      w.onclose = function () {
        if (refresh) window.clearInterval(refresh);
        if (hasMediaApi) window.removeEventListener("urluv-site-media-updated", loadFiles);
      };
    });
  }

  function openPaint() {
    var api = window.UrluvSite && window.UrluvSite.media;
    createWin("paint-gallery", "내 그림", { w: 520, h: 400 }, function (w, b) {
      b.appendChild(el("div", "addr", "/내 그림/"));
      var actions = el("div", "generated-media-actions");
      var create = el("button", "btn", "새로 그리기");
      var status = el("span", "generated-media-status", "그림은 최대 50개까지 저장할 수 있어요.");
      if (window.UrluvSite && window.UrluvSite.previewing) create.disabled = true;
      create.onclick = openPaintCanvas;
      actions.append(create, status); b.appendChild(actions);
      var c = el("div", "content"); var list = el("div", "files"); c.appendChild(list); b.appendChild(c);
      var drawingSignature = null;
      function load() {
        if (!api) { list.replaceChildren(); status.textContent = "주문 사이트에서 그림을 저장하면 여기에 보여요."; return Promise.resolve(); }
        return api.list().then(function (files) {
          var drawings = files.filter(function (m) { return m.type === "DRAWING"; });
          status.textContent = "저장한 그림 " + drawings.length + " / 50";
          create.disabled = !!(window.UrluvSite && window.UrluvSite.previewing) || drawings.length >= 50;
          var signature = drawings.map(function (item) { return item.id; }).join(",");
          if (signature === drawingSignature) return;
          drawingSignature = signature;
          list.replaceChildren();
          drawings.forEach(function (item, i) {
            var file = { name: "그림 " + String(i + 1).padStart(2, "0") + ".png", type: "image", src: item.url, caption: "내가 그린 그림" };
            var tile = el("div", "file created-media-file");
            var thumb = el("img", "created-media-thumb"); thumb.src = item.url; thumb.alt = ""; thumb.draggable = false;
            var name = el("span", "created-media-name", file.name);
            tile.append(thumb, name);
            tile.ondblclick = function () { viewFile(file); };
            if (!(window.UrluvSite && window.UrluvSite.previewing)) {
              var remove = el("button", "btn file-delete", "삭제");
              remove.onclick = function () {
                if (!window.confirm("이 그림을 삭제할까요?")) return;
                remove.disabled = true;
                api.remove(item.id).then(function () {
                  load();
                  window.dispatchEvent(new Event("urluv-site-media-updated"));
                }).catch(function () { remove.disabled = false; alert("파일을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."); });
              };
              tile.appendChild(remove);
            }
            list.appendChild(tile);
          });
        }).catch(function () { status.textContent = "그림 목록을 불러오지 못했어요. 새로고침해 주세요."; });
      }
      load();
      var refresh = api ? window.setInterval(load, 5000) : null;
      if (api) window.addEventListener("urluv-site-media-updated", load);
      w.onclose = function () {
        if (refresh) window.clearInterval(refresh);
        if (api) window.removeEventListener("urluv-site-media-updated", load);
      };
    });
  }

  // photobooth
  function openBooth() {
    createWin("booth", "Photo Booth", { w: 460, h: 560 }, function (w, b) {
      var frame = S.frames[0], stream = null;
      var root = el("div", "booth");
      var stage = el("div", "booth-stage"), box = el("div", "booth-frame");
      var ph = el("div", "ph", "카메라를 허용하면\n여기에 내 모습이 나와요");
      ph.style.whiteSpace = "pre-line";
      var video = el("video"); video.autoplay = true; video.muted = true; video.playsInline = true; video.hidden = true;
      var deco = el("div", "deco");
      box.append(ph, video, deco); stage.appendChild(box);
      var panel = el("div", "booth-panel");
      var frameRow = el("div", "row", "① Select the Frame");
      S.frames.forEach(function (fr, i) {
        var bt = el("button", "btn" + (i === 0 ? " on" : ""), esc(fr.label));
        bt.onclick = function () { frame = fr; panel.querySelectorAll(".row .btn").forEach(function (x) { x.classList.remove("on"); }); bt.classList.add("on"); paint(); };
        frameRow.appendChild(bt);
      });
      var shot = el("div", "row", "② Take a Photo ");
      var sh = el("button", "shutter"); sh.setAttribute("aria-label", "촬영");
      shot.appendChild(sh);
      var result = el("div", "row");
      var status = el("div", "booth-save-status", "사진관에 저장할 수 있는 사진은 최대 10장이에요.");
      var savedCount = 0;
      var countLabel = el("span", "booth-photo-count", "저장된 사진 0 / 10");
      shot.appendChild(countLabel);
      panel.append(frameRow, shot, result, status);
      root.append(stage, panel); b.appendChild(root);

      var mediaApi = window.UrluvSite && window.UrluvSite.media;
      function updateCount() {
        countLabel.textContent = "저장된 사진 " + savedCount + " / 10";
        sh.disabled = savedCount >= 10 || !!(window.UrluvSite && window.UrluvSite.previewing);
        if (window.UrluvSite && window.UrluvSite.previewing) status.textContent = "관리자 미리보기에서는 사진을 저장할 수 없어요.";
        else if (savedCount >= 10) status.textContent = "사진이 10장 저장되어 있어요. 사진관에서 사진을 삭제하면 다시 촬영할 수 있어요.";
        else status.textContent = "사진관에 저장할 수 있는 사진은 최대 10장이에요.";
      }
      function loadPhotoCount() {
        if (!mediaApi) return Promise.resolve();
        return mediaApi.list().then(function (files) {
          savedCount = files.filter(function (m) { return m.type === "PHOTOBOOTH"; }).length;
          updateCount();
        }).catch(function () { status.textContent = "저장된 사진 수를 불러오지 못했어요."; });
      }
      if (window.UrluvSite && window.UrluvSite.previewing) sh.disabled = true;
      loadPhotoCount();
      window.addEventListener("urluv-site-media-updated", loadPhotoCount);

      function paint() {
        box.style.setProperty("--fc", frame.color);
        deco.innerHTML = "";
        [[6, 6], [82, 8], [10, 86], [84, 84]].forEach(function (p) {
          var i = el("i", "", frame.deco); i.style.left = p[0] + "%"; i.style.top = p[1] + "%"; deco.appendChild(i);
        });
      }
      paint();

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(function (s) {
          stream = s; video.srcObject = s; video.hidden = false; ph.hidden = true;
        }).catch(function () { ph.textContent = "카메라를 사용할 수 없어요.\n(그래도 촬영하면 프레임 샘플이 저장돼요)"; });
      }
      w.onclose = function () {
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
        window.removeEventListener("urluv-site-media-updated", loadPhotoCount);
      };

      sh.onclick = async function () {
        if (savedCount >= 10) { updateCount(); return; }
        sh.disabled = true;
        status.textContent = "사진을 저장하고 있어요…";
        await document.fonts.load('28px "Departure Mono"');
        var cv = document.createElement("canvas"); cv.width = 600; cv.height = 800;
        var g = cv.getContext("2d");
        g.fillStyle = "#fdf6f9"; g.fillRect(0, 0, 600, 800);
        if (!video.hidden && video.videoWidth) {
          var vw = video.videoWidth, vh = video.videoHeight, tr = 600 / 800, sr = vw / vh, sx = 0, sy = 0, sw = vw, sh2 = vh;
          if (sr > tr) { sw = vh * tr; sx = (vw - sw) / 2; } else { sh2 = vw / tr; sy = (vh - sh2) / 2; }
          g.save(); g.translate(600, 0); g.scale(-1, 1); g.drawImage(video, sx, sy, sw, sh2, 0, 0, 600, 800); g.restore();
        } else {
          var gr = g.createLinearGradient(0, 0, 600, 800); gr.addColorStop(0, "#fde3ec"); gr.addColorStop(1, "#f6a6c1");
          g.fillStyle = gr; g.fillRect(0, 0, 600, 800);
          g.font = '120px "Departure Mono", serif'; g.textAlign = "center"; g.fillStyle = "#fff"; g.fillText("♥", 300, 430);
        }
        g.strokeStyle = frame.color; g.lineWidth = 50; g.strokeRect(0, 0, 600, 800);
        g.fillStyle = frame.color; g.font = '56px "Departure Mono", serif'; g.textAlign = "center";
        [[60, 80], [540, 80], [60, 760], [540, 760]].forEach(function (p) { g.fillText(frame.deco, p[0], p[1]); });
        g.fillStyle = "#fff"; g.font = '28px "Departure Mono", monospace'; g.fillText(S.names.join(" ♥ ") + "  " + new Date().toISOString().slice(0, 10), 300, 785);
        result.replaceChildren();
        var imageUrl = cv.toDataURL("image/png");
        var th = el("img"); th.src = imageUrl; th.style.cssText = "height:60px;border:2px solid #fff";
        result.appendChild(th);
        var a = el("a", "btn", "기기에 저장"); a.href = imageUrl; a.download = "photobooth-" + Date.now() + ".png"; a.style.cssText = "text-decoration:none;color:#3a1f2a;display:inline-block";
        result.appendChild(a);
        if (!mediaApi) {
          status.textContent = "데모에서는 기기에만 저장돼요.";
          sh.disabled = false;
          return;
        }
        cv.toBlob(function (blob) {
          if (!blob) { status.textContent = "사진을 만들지 못했어요. 다시 촬영해 주세요."; sh.disabled = false; return; }
          mediaApi.upload("PHOTOBOOTH", blob).then(function () {
            savedCount += 1; updateCount();
            status.textContent = "사진 폴더에 저장했어요.";
            window.dispatchEvent(new Event("urluv-site-media-updated"));
          }).catch(function (error) {
            mediaApi.list().then(function (files) {
              savedCount = files.filter(function (m) { return m.type === "PHOTOBOOTH"; }).length;
              updateCount();
              if (savedCount >= 10 || error && error.code === "TOO_MANY_SITE_PHOTOS") return;
              status.textContent = "저장하지 못했어요. 다시 시도해 주세요.";
            }).catch(function () { sh.disabled = false; status.textContent = "저장하지 못했어요. 다시 시도해 주세요."; });
          });
        }, "image/png");
      };
    });
  }

  // paint
  function openPaintCanvas() {
    createWin("paint", "그림 그리기", { w: 560, h: 440 }, function (w, b) {
      var root = el("div", "paint"), tools = el("div", "paint-tools");
      var cv = el("canvas"); root.append(tools, cv); b.appendChild(root);
      var colors = ["#000000", "#e8789a", "#b8456b", "#ff9eb5", "#f4c542", "#7ec8a9", "#3d5f0d", "#5aa9e6", "#8d6ad8", "#ffffff"];
      var color = colors[0], size = 4, eraser = false;
      colors.forEach(function (c, i) {
        var s = el("div", "sw" + (i === 0 ? " on" : "")); s.style.background = c;
        s.onclick = function () { color = c; eraser = false; tools.querySelectorAll(".sw").forEach(function (x) { x.classList.remove("on"); }); s.classList.add("on"); };
        tools.appendChild(s);
      });
      var sz = el("input"); sz.type = "range"; sz.min = 1; sz.max = 24; sz.value = size; sz.oninput = function () { size = +sz.value; };
      var clr = el("button", "btn", "지우기"), sv = el("button", "btn", "그림 저장");
      var status = el("span", "generated-media-status", "그림을 저장해요.");
      tools.append(sz, clr, sv, status);
      var g;
      function fit() {
        var r = cv.getBoundingClientRect(), old = g && cv.width ? cv.toDataURL() : null;
        cv.width = Math.max(1, r.width); cv.height = Math.max(1, r.height);
        g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
        if (old) { var im = new Image(); im.onload = function () { g.drawImage(im, 0, 0); }; im.src = old; }
      }
      requestAnimationFrame(fit);
      new ResizeObserver(function () { if (cv.getBoundingClientRect().width) fit(); }).observe(cv);
      var drawing = false, lx, ly;
      var pos = function (e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener("pointerdown", function (e) { drawing = true; cv.setPointerCapture(e.pointerId); var p = pos(e); lx = p[0]; ly = p[1]; });
      cv.addEventListener("pointermove", function (e) {
        if (!drawing) return; var p = pos(e);
        g.strokeStyle = color; g.lineWidth = size; g.lineCap = "round"; g.beginPath(); g.moveTo(lx, ly); g.lineTo(p[0], p[1]); g.stroke(); lx = p[0]; ly = p[1];
      });
      cv.addEventListener("pointerup", function () { drawing = false; });
      clr.onclick = function () { g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); };
      sv.onclick = function () {
        var api = window.UrluvSite && window.UrluvSite.media;
        if (!api) {
          var a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = "drawing.png"; a.click();
          status.textContent = "데모에서는 기기에만 저장돼요.";
          return;
        }
        sv.disabled = true; status.textContent = "저장하고 있어요…";
        cv.toBlob(function (blob) {
          if (!blob) { status.textContent = "그림을 저장하지 못했어요."; sv.disabled = false; return; }
          api.upload("DRAWING", blob).then(function () {
            status.textContent = "그림을 저장했어요.";
            window.dispatchEvent(new Event("urluv-site-media-updated"));
          }).catch(function (error) {
            status.textContent = error && error.code === "TOO_MANY_SITE_DRAWINGS" ? error.message : "저장하지 못했어요. 다시 시도해 주세요.";
          }).finally(function () { sv.disabled = false; });
        }, "image/png");
      };
    });
  }

  function openMusic() {
    createWin("music", "Music", { w: 520, h: 640 }, function (w, body) {
      w.el.classList.add("music-window");
      w.onclose = window.MusicPlayer.mount(body);
    });
  }

  function openMinesweeper() {
    createWin("game:minesweeper", "Game - minesweeper", { w: 390, h: 530 }, function (w, body) {
      w.onclose = window.mountMinesweeper(body);
    });
  }

  // ---------- start menu ----------
  var sm = $("#startmenu");
  $("#start").onclick = function (e) { e.stopPropagation(); sm.hidden = !sm.hidden; $("#start").setAttribute("aria-expanded", String(!sm.hidden)); };
  document.addEventListener("pointerdown", function (e) { if (!sm.hidden && !e.target.closest("#startmenu,#start")) sm.hidden = true; });
  sm.addEventListener("click", function (e) {
    var a = e.target.closest("button"); if (!a) return; sm.hidden = true;
    var act = a.dataset.act;
    if (act === "notice") openNotice();
    else if (act === "information") openInformation();
    else if (act === "booth") openBooth();
    else if (act === "paint") openPaint();
    else if (act === "logout") { try { sessionStorage.removeItem("anniv-auth"); } catch (er) {} if (site.forget) site.forget(); location.reload(); }
  });
})();
