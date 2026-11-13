/* ===================== KARAKTER BAĞLANTILARI =====================
   Her karakterin adını ve gideceği adresi buradan değiştir.
   url boş bırakılırsa pencere "bağlantı henüz eklenmedi" der. */
const CHARACTERS = {
  coffin:     { name: "Cesare Vitagliano",    url: "https://eightbornv.com/fandom/cesare-vitagliano-9d4521f67a" },
  orange:     { name: "Marcelo Martinez",     url: "https://eightbornv.com/fandom/marcelo-martinez-e7594325b8" },
  graypolice: { name: "Lion Williams",        url: "https://eightbornv.com/fandom/lion-williams-636d4caabb" },
  suitman:    { name: "Kıdemli Yüzbaşı Martinez",   url: "https://eightbornv.com/fandom/kidemli-yuzbasi-martinez-ef7dceaa06" },
  dog:        { name: "Bob (K9)",             url: "https://eightbornv.com/fandom/bob-5cd9a8ef4a" },
  black:      { name: "Caleb Grace",          url: "https://eightbornv.com/fandom/caleb-grace-2f68f94afd" },
  beard:      { name: "Hjalmarr",             url: "https://eightbornv.com/fandom/hjalmarr-231cd2981c" },
  tiago:      { name: "Tiago Tanrıkulu",      url: "https://eightbornv.com/fandom/tiago-tanrikulu" },
  mustache:   { name: "Wesley Harper",        url: "https://eightbornv.com/fandom/wesley-harper-e244cf63" }
};

/* ===================== SOSYAL BAĞLANTILAR =====================
   Kartların gideceği adresler. Boş bırakılan kart tıklanınca bir şey yapmaz. */
const LINKS = {
  instagram: "https://instagram.com/iamoznozkn",
  tiktok:    "https://tiktok.com/@imjanto",
  kick:      "https://kick.com/jantoo",
  discord:   "https://discord.gg/basE5hbGf3",
  jantolab:  "https://jantolab.com/"
};

/* ===================== YOUTUBE SON VİDEO =====================
   Son video kendiliğinden güncellenir: GitHub Actions (.github/workflows/update-video.yml)
   YouTube RSS'ini saatlerde bir okur ve data/videos.json dosyasına yazar. Sayfa yalnızca
   o dosyayı okur; üçüncü taraf servis ya da API anahtarı yoktur.
   1) channelUrl : "Kanala git" butonunun adresi
   2) manual     : videos.json henüz okunamazsa gösterilecek yedek video (id: videonun v= kısmı)
   Kanal kimliği (UC...) workflow dosyasındaki CHANNEL_ID alanındadır. */
const YOUTUBE = {
  channelUrl: "https://www.youtube.com/channel/UCRqJVaQLwcT3irYb-ZzcuSw",
  manual:     { id: "NC2lFWZecD8", title: "Son video" }
};
/* ================================================================ */

document.getElementById("yr").textContent = new Date().getFullYear();

/* E-posta adresi sayfa kaynağında düz yazı olarak durmasın diye parçalı birleştirilir. */
(function () {
  var a = document.getElementById("mail");
  if (!a) return;
  var addr = ["jantokick", "gmail.com"].join("@");
  a.href = "mailto:" + addr;
  a.textContent = addr;
  var cp = document.getElementById("copy");
  if (cp && navigator.clipboard && navigator.clipboard.writeText) {
    cp.hidden = false;
    cp.addEventListener("click", function () {
      navigator.clipboard.writeText(addr).then(function () {
        cp.textContent = "Kopyalandı"; cp.classList.add("done");
        setTimeout(function () { cp.textContent = "Kopyala"; cp.classList.remove("done"); }, 1800);
      }).catch(function () {});
    });
  }
})();
(function () {
  var world = document.getElementById("world");
  var floor = document.getElementById("floor");
  var chars = Array.prototype.slice.call(world.querySelectorAll(".char"));
  var hits = Array.prototype.slice.call(world.querySelectorAll(".hit"));
  var lane = window.matchMedia("(max-width: 899px), (max-aspect-ratio: 6/5), (max-height: 659px)");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var P = 1800;

  /* ---------- sosyal bağlantılar ---------- */
  function wire(a, url) {
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else { a.addEventListener("click", function (e) { e.preventDefault(); }); }
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-link]"), function (a) {
    wire(a, LINKS[a.getAttribute("data-link")]);
  });

  /* ---------- YouTube son video kartı ---------- */
  (function () {
    var card = document.getElementById("yt");
    var el = {
      img: document.getElementById("yt-img"), ph: document.getElementById("yt-ph"),
      title: document.getElementById("yt-title"), when: document.getElementById("yt-when"),
      isNew: document.getElementById("yt-new"), watch: document.getElementById("yt-watch"),
      chan: document.getElementById("yt-chan"), thumb: document.getElementById("yt-thumb")
    };
    var chanUrl = YOUTUBE.channelUrl || "";
    var KEY = "janto.yt.v1";

    function setHref(a, url) {
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.removeAttribute("aria-disabled"); }
      else { a.href = "#"; a.removeAttribute("target"); }
    }
    setHref(el.chan, chanUrl);
    [el.chan, el.watch, el.thumb].forEach(function (a) {
      a.addEventListener("click", function (e) { if (a.getAttribute("href") === "#") e.preventDefault(); });
    });
    setHref(el.watch, chanUrl); setHref(el.thumb, chanUrl);

    function ago(iso) {
      var t = Date.parse(iso); if (!t) return "";
      var s = Math.round((Date.now() - t) / 1000), rtf;
      try { rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" }); } catch (e) { return ""; }
      var units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
      for (var i = 0; i < units.length; i++) {
        if (s >= units[i][1]) return rtf.format(-Math.floor(s / units[i][1]), units[i][0]);
      }
      return "az önce";
    }

    function show(v) {
      var url = "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id);
      el.title.textContent = v.title || "Yeni video yayında";
      var when = v.published ? ago(v.published) : "";
      el.when.textContent = (when ? when + " · " : "") + "youtube.com";
      var fresh = v.published && (Date.now() - Date.parse(v.published)) < 7 * 86400000;
      el.isNew.hidden = !fresh;
      setHref(el.watch, url); setHref(el.thumb, url);
      el.img.onload = function () { el.img.hidden = false; el.ph.hidden = true; };
      el.img.onerror = function () { el.img.hidden = true; el.ph.hidden = false; };
      el.img.src = "https://i.ytimg.com/vi/" + encodeURIComponent(v.id) + "/hqdefault.jpg";
      card.setAttribute("data-state", "ready");
    }

    function fail(msg) {
      if (card.getAttribute("data-state") === "ready") return;
      el.title.textContent = "Yeni videolar için kanala göz at";
      el.when.textContent = msg || "son video şu an yüklenemedi";
      card.setAttribute("data-state", "error");
    }

    /* Dışarıdan gelen her veri doğrulanır: video kimliği 11 karakterlik YouTube kimliği olmalı. */
    var ID_RE = /^[A-Za-z0-9_-]{11}$/;
    function clean(v) {
      if (!v || typeof v.id !== "string" || !ID_RE.test(v.id)) return null;
      var t = typeof v.title === "string" ? v.title.trim().slice(0, 200) : "";
      var p = typeof v.published === "string" && Date.parse(v.published) ? v.published : "";
      return { id: v.id, title: t || "Son video", published: p };
    }

    function readCache() { try { return clean(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { return null; } }
    function writeCache(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

    /* Kendi sitemizdeki data/videos.json; saatlik parça ile gereksiz önbelleği atlar. */
    function latest() {
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 6000) : 0;
      var url = "data/videos.json?t=" + Math.floor(Date.now() / 600000);
      return fetch(url, { credentials: "omit", signal: ctl ? ctl.signal : undefined }).then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      }).then(function (j) {
        var v = clean(j);
        if (!v) throw new Error("bad data");
        return v;
      });
    }

    var manualVideo = clean(YOUTUBE.manual);
    var cached = readCache();
    if (cached) show(cached);
    else if (manualVideo) show(manualVideo);
    else card.setAttribute("data-state", "loading");

    latest().then(function (v) {
      writeCache(v); show(v);
    }).catch(function () {
      if (!cached && !manualVideo) fail();
    });
  })();

  /* ---------- karakter sahnesi ---------- */
  chars.forEach(function (c) {
    var d = CHARACTERS[c.dataset.id] || { name: c.dataset.id, url: "" };
    c.querySelector(".tag").textContent = d.name;
    c.querySelector(".hit").setAttribute("aria-label", d.name + " — bağlantıya git");
  });

  /* sahneyi 1920x1080 tasarım alanından ekrana ölçekle; derinlikteki karakterlerin
     boyutu ve yeri perspektif yüzünden kaymasın diye geri düzeltilir */
  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(vw / 1920, vh / 1080);
    world.style.setProperty("--s", s.toFixed(4));
    fitDog(vw, vh, s);
    var Ox = vw / 2, Oy = vh * 0.6;
    chars.forEach(function (c) {
      var cs = getComputedStyle(c);
      var tz = parseFloat(cs.getPropertyValue("--tz")) || 0;
      var cxw = parseFloat(cs.getPropertyValue("--cx")) || 960;
      var feet = parseFloat(cs.getPropertyValue("--feet")) || 1080;
      var k = P / (P - tz * s);
      var Dx = vw / 2 + (cxw - 960) * s, Dy = vh + (feet - 1080) * s;
      var Bx = Ox + (Dx - Ox) / k, By = Oy + (Dy - Oy) / k;
      c.style.setProperty("--dx", ((Bx - Dx) / s).toFixed(2));
      c.style.setProperty("--dy", ((By - Dy) / s).toFixed(2));
      c.style.setProperty("--zs", (1 / k).toFixed(4));
    });
  }
  /* köpek: sütunun altına sığıyorsa oturuyor, sığmıyorsa uyuyan haline geçip boyu hesapla küçülüyor */
  var dogEl = world.querySelector(".char-dog");
  var dogHit = dogEl.querySelector(".hit");
  var DOG = { h: 232, arSit: 0.6319, arSleep: 0.9150, hMin: 64 };
  function fitDog(vw, vh, s) {
    if (lane.matches) {
      dogEl.classList.remove("asleep");
      dogEl.style.setProperty("--h", DOG.h); dogEl.style.setProperty("--ar", DOG.arSit);
      dogHit.style.clipPath = dogHit.dataset.polySit;
      return;
    }
    var feetY = vh + (parseFloat(getComputedStyle(dogEl).getPropertyValue("--feet")) - 1080) * s;
    var links = document.querySelector(".links").getBoundingClientRect().bottom;
    var gap = 12;
    var sitTop = feetY - DOG.h * s;
    var sleep = sitTop < links + gap;
    var h = DOG.h;
    if (sleep) h = Math.max(DOG.hMin, Math.min(DOG.h * 0.92, (feetY - links - gap) / s));
    dogEl.classList.toggle("asleep", sleep);
    dogEl.style.setProperty("--h", h.toFixed(1));
    dogEl.style.setProperty("--ar", (sleep ? DOG.arSleep : DOG.arSit).toFixed(4));
    dogHit.style.clipPath = sleep ? dogHit.dataset.polySleep : dogHit.dataset.polySit;
  }
  layout();
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  /* seçili karakter */
  function setActive(c) {
    world.classList.toggle("has-active", !!c);
    chars.forEach(function (x) { x.classList.toggle("active", x === c); });
  }

  /* onay penceresi */
  var dlg = document.getElementById("go");
  var okBtn = document.getElementById("go-ok");
  var lastFocus = null;
  function openGo(id, from) {
    var d = CHARACTERS[id] || { name: id, url: "" };
    var url = (d.url || "").trim(), host = "", full = "";
    if (url) {
      try { var u = new URL(url); host = u.hostname.replace(/^www\./, ""); full = u.href; }
      catch (e) { host = url; full = ""; }
    }
    var src = document.querySelector('.char[data-id="' + id + '"] .fig').getAttribute("src");
    var img = document.getElementById("go-img");
    img.src = src;
    document.getElementById("go-photo").classList.toggle("contain", id === "coffin");
    document.getElementById("go-photo").classList.toggle("dog", id === "dog");
    document.getElementById("go-name").textContent = d.name;
    document.getElementById("go-host").textContent = host || "Bağlantı henüz eklenmedi";
    document.getElementById("go-full").textContent = full;
    document.getElementById("go-full").hidden = !full;
    if (url) { okBtn.href = url; okBtn.removeAttribute("aria-disabled"); okBtn.tabIndex = 0; }
    else { okBtn.removeAttribute("href"); okBtn.setAttribute("aria-disabled", "true"); okBtn.tabIndex = -1; }
    lastFocus = from || null;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function closeGo() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  document.getElementById("go-cancel").addEventListener("click", closeGo);
  okBtn.addEventListener("click", function () { setTimeout(closeGo, 0); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeGo(); });

  hits.forEach(function (h) {
    var c = h.closest(".char");
    h.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") setActive(c); });
    h.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && document.activeElement !== h) setActive(null); });
    h.addEventListener("focus", function () { if (h.matches(":focus-visible")) setActive(c); });
    h.addEventListener("blur", function () { setActive(null); });
    h.addEventListener("click", function () { if (c.classList.contains("barking")) { return; } openGo(h.dataset.id, h); });
    h.addEventListener("keydown", function (e) {
      var i = hits.indexOf(h), n = null;
      if (e.key === "ArrowRight") n = hits[Math.min(i + 1, hits.length - 1)];
      if (e.key === "ArrowLeft") n = hits[Math.max(i - 1, 0)];
      if (n) { e.preventDefault(); n.focus(); if (lane.matches) n.closest(".char").scrollIntoView({ block: "nearest", inline: "center" }); }
    });
  });

  /* fare ile hafif derinlik (2.5D) */
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function apply() {
    world.style.setProperty("--ry", (cx * 2.6).toFixed(3) + "deg");
    world.style.setProperty("--rx", (-cy * 1.1).toFixed(3) + "deg");
    floor.style.setProperty("--fx", (-cx * 14).toFixed(2));
    floor.style.setProperty("--fy", (-cy * 8).toFixed(2));
  }
  function tick() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; apply();
    raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(tick) : 0;
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || lane.matches || calm.matches) return;
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  document.documentElement.addEventListener("pointerleave", function () {
    tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick);
  });
})();

/* Gösterilmeyen ama gerekebilecek görselleri sayfa yüklendikten sonra boşta iken ısıt. */
window.addEventListener("load", function () {
  var narrow = window.matchMedia("(max-width: 899px), (max-aspect-ratio: 6/5), (max-height: 659px)").matches;
  var warm = function () { (narrow ? [] : ["img/dog_sleep.webp", "img/coffin_open.webp"]).forEach(function (u) { new Image().src = u; }); };
  if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500);
});

/* ===================== Efekt onayı ve sürpriz yükleyici ===================== */
/* Sürprizler (js/fx.js, css/fx.css, sesler, videolar) yalnızca ziyaretçi onayladıktan sonra yüklenir.
   Onay yoksa veya "efektsiz" seçildiyse hiçbiri indirilmez. */
(function () {
  var VER = "1"; /* efektler ciddi biçimde değişirse artır: herkese uyarı yeniden gösterilir */
  var meta = document.querySelector('meta[name="asset-v"]'), AV = meta ? meta.content : "";
  var q = AV ? "?v=" + AV : "";
  var listeners = [];
  var JFX = window.JFX = { off: true, on: function (fn) { listeners.push(fn); } };
  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }

  /* localStorage yoksa (gizli sekme, uygulama içi tarayıcı) sessionStorage, o da yoksa bellek */
  var mem = {};
  function get(k) { try { return localStorage.getItem(k); } catch (e) {} try { return sessionStorage.getItem(k); } catch (e) {} return mem[k] || null; }
  function set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); return; } catch (e) {} try { sessionStorage.setItem(k, v); } catch (e) {} }

  var dlg = document.getElementById("warn"), link = document.getElementById("fx-link");
  var canAsk = !!(dlg && typeof dlg.showModal === "function");
  var saved = get("fxv") === VER ? get("fx") : null;   /* "on" | "off" | null */

  var started = false;
  function loadFx() {
    if (started) { return; }
    started = true;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "css/fx.css" + q; document.head.appendChild(l);
    var s = document.createElement("script"); s.src = "js/fx.js" + q; s.async = true; document.body.appendChild(s);
  }
  function label() {
    if (!link) return;
    link.textContent = JFX.off ? "Efektler: kapalı" : "Efektler: açık";
    link.setAttribute("aria-pressed", String(!JFX.off));
  }
  function apply(off, persist) {
    JFX.off = off; if (persist) { set("fx", off ? "off" : "on"); set("fxv", VER); }
    label();
    if (!off) { loadFx(); }
    notify();
  }

  if (link) {
    if (canAsk) { link.hidden = false; link.addEventListener("click", function () { apply(!JFX.off, true); }); }
  }

  if (saved === "on") {
    /* daha önce onaylanmış: açılışı yavaşlatmadan boşta yükle */
    JFX.off = false; label();
    var idle = function () { loadFx(); };
    window.addEventListener("load", function () { if (window.requestIdleCallback) requestIdleCallback(idle, { timeout: 3000 }); else setTimeout(idle, 1500); });
  } else if (saved === "off" || !canAsk) {
    JFX.off = true; label();
  } else {
    /* ilk giriş: onay ister. Cevap gelene kadar efekt kapalı, hiçbir şey indirilmez. */
    JFX.off = true; label();
    var card = dlg.querySelector(".warn-card");
    var choose = function (off) { dlg.close(); apply(off, true); };
    document.getElementById("warn-on").addEventListener("click", function () { choose(false); });   /* bu tıklama aynı zamanda tarayıcının ses engelini kaldırır */
    document.getElementById("warn-off").addEventListener("click", function () { choose(true); });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); choose(true); });             /* Esc / geri tuşu: güvenli taraf */
    var ask = function () { dlg.showModal(); if (card) card.focus({ preventScroll: true }); };      /* odak başlıkta: Enter yanlışlıkla onay vermesin */
    window.addEventListener("load", function () { setTimeout(ask, 400); });
  }
})();
