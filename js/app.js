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
    h.addEventListener("click", function () { if (c.classList.contains("barking")) return; openGo(h.dataset.id, h); });
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

/* ===================== Gizli sürprizler ===================== */
(function () {
  var world = document.getElementById("world"), fx = document.getElementById("fx"), snd = document.getElementById("snd");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var soundOn = true;
  try { soundOn = localStorage.getItem("snd") !== "off"; } catch (e) {}
  function paint() { snd.setAttribute("aria-pressed", String(soundOn)); snd.setAttribute("aria-label", soundOn ? "Efekt seslerini kapat" : "Efekt seslerini aç"); snd.classList.toggle("off", !soundOn); }
  paint();
  snd.addEventListener("click", function () {
    soundOn = !soundOn; paint();
    try { localStorage.setItem("snd", soundOn ? "on" : "off"); } catch (e) {}
  });

  function shake() { if (calm.matches) return; world.classList.remove("shake"); void world.offsetWidth; world.classList.add("shake"); }

  /* --- Bob (K9): okşayınca havlar --- */
  var dog = world.querySelector(".char-dog"), hit = dog && dog.querySelector(".hit"), sprite = dog && dog.querySelector(".sprite");
  if (!hit) return;
  var warmed = false, busy = false, last = 0, ready = false, ctx = null, bufs = {}, waiters = [];
  /* ses (19 KB) sayfa açılır açılmaz indirilip çözülür; ilk havlamada anında çalsın */
  var AC = window.AudioContext || window.webkitAudioContext;
  function loaded() { ready = true; var w = waiters; waiters = []; w.forEach(function (f) { f(); }); }
  if (AC) {
    try {
      ctx = new AC();
      var left = 2, one = function () { if (--left === 0) loaded(); };
      ["bark", "caleb"].forEach(function (n) {
        fetch("sound/" + n + ".mp3").then(function (r) { return r.arrayBuffer(); })
          .then(function (ab) { return new Promise(function (ok, no) { ctx.decodeAudioData(ab, ok, no); }); })
          .then(function (b) { bufs[n] = b; one(); }).catch(one);
      });
    } catch (e) { ctx = null; loaded(); }
  } else { loaded(); }
  /* tarayıcı ilk kullanıcı dokunuşuna kadar sesi askıda tutabilir; ilk dokunuşta aç */
  function unlock() { if (ctx && ctx.state === "suspended") { try { ctx.resume().then(hideHint); } catch (e) {} } }
  ["pointerdown", "touchstart", "mousedown", "click", "keydown"].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true }); });
  var hintT = 0;
  function hint() {
    var h = document.getElementById("snd-hint");
    if (!h) { h = document.createElement("div"); h.id = "snd-hint"; h.className = "snd-hint"; h.setAttribute("role", "status"); h.textContent = "Sesi duymak için sayfada herhangi bir yere tıkla"; document.body.appendChild(h); }
    h.classList.add("on"); snd.classList.add("attn");
    clearTimeout(hintT); hintT = setTimeout(function () { h.classList.remove("on"); snd.classList.remove("attn"); }, 5500);
  }
  function hideHint() { var h = document.getElementById("snd-hint"); if (h) h.classList.remove("on"); snd.classList.remove("attn"); }
  /* tarayıcı, kullanıcı sayfaya hiç tıklamadan/dokunmadan sesi engeller; o durumda sessiz kalıp nedenini söyleriz */
  function playBark() { playSfx("bark"); }
  function playSfx(name) {
    if (!soundOn || !ctx || !bufs[name]) return;
    var go = function () {
      try { var s = ctx.createBufferSource(); s.buffer = bufs[name]; s.connect(ctx.destination); s.start(0); } catch (e) {}
    };
    if (ctx.state === "running") { go(); return; }
    var p; try { p = ctx.resume(); } catch (e) { hint(); return; }
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; hint(); } }, 120);
    if (p && p.then) p.then(function () { if (!done) { done = true; clearTimeout(t); if (ctx.state === "running") go(); else hint(); } }, function () { if (!done) { done = true; clearTimeout(t); hint(); } });
  }
  function warm() {
    if (warmed) return; warmed = true;
    new Image().src = "img/bark.webp";
  }
  /* HAV! yazıları ekrana dağılır; köpeğin üstüne binmez */
  var SLOTS = [[12, 18, -12], [88, 16, 10], [8, 40, -8], [92, 42, 12], [14, 64, 9], [87, 66, -10], [24, 32, 6], [76, 30, -6], [20, 84, -9], [80, 84, 8]];
  var laneMq = window.matchMedia("(max-width: 899px), (max-aspect-ratio: 6/5), (max-height: 659px)");
  function pick(n) {
    var W = window.innerWidth, H = window.innerHeight, r = sprite.getBoundingClientRect();
    if (laneMq.matches) {
      /* telefon: köpeğin hemen yanında, ekran dışına taşmadan */
      var cl = function (x) { return Math.min(Math.max(x, 58), W - 58); };
      return [
        [cl(r.left - r.width * .35), r.top + r.height * .42, -12], [cl(r.right + r.width * .35), r.top + r.height * .30, 11],
        [cl(r.left + r.width * .5), r.top - r.height * .16, -4], [cl(r.left - r.width * .45), r.top + r.height * .08, 9]
      ];
    }
    /* PC: orta sütuna ve köpeğe asla binmez, yazılar iki yan boşluğa dağılır */
    var m = document.querySelector("main").getBoundingClientRect(), out = [], pad = Math.max(W * .09, 110);
    var pool = SLOTS.slice().sort(function () { return Math.random() - .5; });
    pool.forEach(function (s) {
      if (out.length >= n) return;
      var x = W * s[0] / 100 + (Math.random() - .5) * W * .04, y = H * s[1] / 100 + (Math.random() - .5) * H * .05;
      if (x > m.left - pad && x < m.right + pad) return;
      if (x > r.left - pad && x < r.right + pad && y > r.top - 80) return;
      out.push([x, y, s[2]]);
    });
    return out;
  }
  function say(txt, at, slot) {
    setTimeout(function () {
      var s = document.createElement("span");
      s.className = "hav"; s.textContent = txt;
      s.style.left = slot[0] + "px"; s.style.top = slot[1] + "px"; s.style.setProperty("--rot", slot[2] + "deg");
      s.style.setProperty("--k", Math.random() < .35 ? "1.3" : "1");
      fx.appendChild(s);
      setTimeout(function () { s.remove(); }, 1100);
    }, at);
  }
  function bark() {
    if (busy || Date.now() - last < 4000) return;
    busy = true; warm();
    /* ses henüz çözülmediyse en fazla 1 sn bekle ki görüntü ve ses birlikte başlasın */
    if (soundOn && !ready) {
      var fired = false, go = function () { if (fired) return; fired = true; run(); };
      waiters.push(go); setTimeout(go, 1000);
      return;
    }
    run();
  }
  function run() {
    var sitting = !dog.classList.contains("asleep");
    var im = null;
    if (sitting && !calm.matches) {
      im = new Image(); im.className = "fig bark-fig"; im.alt = ""; im.draggable = false;
      im.src = "img/bark.webp?" + Date.now(); sprite.appendChild(im);
    }
    dog.classList.add("barking");
    playBark();
    var sp = pick(5);
    say("HAV!", 250, sp[0] || [100, 100, -10]); say("HAV!", 480, sp[1] || [200, 160, 10]); shake(); setTimeout(shake, 250);
    say("HAV!", 1900, sp[2] || [100, 300, 8]); say("HAV!", 2100, sp[3] || [250, 250, -8]); setTimeout(shake, 1900);
    setTimeout(function () {
      dog.classList.remove("barking"); if (im) im.remove();
      busy = false; last = Date.now();
    }, 2600);
  }

  /* okşama: aynı eksende art arda yön değiştiren kısa hareketler */
  var px = 0, py = 0, dx = 0, dy = 0, rev = 0, t0 = 0, ax = 0, ay = 0;
  function reset() { rev = 0; dx = 0; dy = 0; t0 = 0; }
  hit.addEventListener("pointerenter", warm);
  hit.addEventListener("pointerdown", function (e) { warm(); px = e.clientX; py = e.clientY; reset(); });
  hit.addEventListener("pointermove", function (e) {
    if (e.pointerType === "mouse" ? false : e.buttons === 0) return;
    var mx = e.clientX - px, my = e.clientY - py;
    if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
    px = e.clientX; py = e.clientY;
    var now = performance.now();
    if (!t0 || now - t0 > 1800) { reset(); t0 = now; }
    var useX = Math.abs(mx) >= Math.abs(my), d = useX ? mx : my, prev = useX ? dx : dy;
    if (prev && Math.sign(d) !== Math.sign(prev)) rev++;
    if (useX) dx = d; else dy = d;
    if (rev >= 5) { reset(); bark(); }
  });

  /* --- ortak yardımcılar --- */
  function pop(txt, cls, x, y, ms, k) {
    var s = document.createElement("span");
    s.className = cls; s.textContent = txt; s.style.left = x + "px"; s.style.top = y + "px";
    if (k) s.style.setProperty("--k", k);
    fx.appendChild(s); setTimeout(function () { s.remove(); }, ms);
    return s;
  }
  function charHit(id) { var h = world.querySelector('.hit[data-id="' + id + '"]'); return h ? { hit: h, sprite: h.closest(".char").querySelector(".sprite") } : null; }

  /* --- Marcelo Martinez: ikinci dokunuşta uyarı çıkar --- */
  var mar = charHit("orange");
  if (mar) {
    var mTaps = 0, mLast = 0;
    mar.hit.addEventListener("click", function (e) {
      var now = Date.now();
      if (now - mLast > 20000) mTaps = 0;
      mLast = now; mTaps++;
      if (mTaps === 2) {
        e.stopImmediatePropagation(); e.preventDefault();
        var lane2 = window.matchMedia("(max-width: 899px), (max-aspect-ratio: 6/5), (max-height: 659px)").matches;
        var wb = world.getBoundingClientRect();
        pop("DON'T TOUCH AGAIN!", "hav warn", window.innerWidth / 2, lane2 ? Math.max(wb.top + 50, 60) : window.innerHeight * .34, 1500, lane2 ? .8 : .62);
        shake(); setTimeout(shake, 300); mTaps = 0;
      }
    }, true);
  }

  /* --- Caleb Grace: üstünde bekleyince / basılı tutunca uyarır --- */
  var cal = charHit("black");
  if (cal) {
    var cTimer = 0, cLast = 0, cSwallow = false, cx0 = 0, cy0 = 0;
    function say2() {
      if (Date.now() - cLast < 8000) return;
      cLast = Date.now();
      var r = cal.sprite.getBoundingClientRect(), W = window.innerWidth;
      var el = document.createElement("div");
      el.className = "bubble";
      el.innerHTML = '<span class="b-name"></span><span class="b-txt"></span><i class="eq" aria-hidden="true"><b></b><b></b><b></b><b></b></i>';
      el.querySelector(".b-name").textContent = "Caleb Grace";
      el.querySelector(".b-txt").textContent = "Hey homie, watch out!";
      el.style.left = Math.min(Math.max(r.left + r.width / 2, 165), W - 165) + "px";
      el.style.top = (r.top - 6) + "px";
      /* kuyruk karakterin tam üstünü göstersin */
      el.style.setProperty("--tail", (r.left + r.width / 2 - parseFloat(el.style.left)) + "px");
      fx.appendChild(el); playSfx("caleb");
      setTimeout(function () { el.remove(); }, 3000);
    }
    cal.hit.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(cTimer); cTimer = setTimeout(say2, 800); } });
    cal.hit.addEventListener("pointerleave", function () { clearTimeout(cTimer); });
    cal.hit.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      cx0 = e.clientX; cy0 = e.clientY; cSwallow = false; clearTimeout(cTimer);
      cTimer = setTimeout(function () { if (Date.now() - cLast >= 8000) { cSwallow = true; } say2(); }, 550);
    });
    cal.hit.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse" && (Math.abs(e.clientX - cx0) > 12 || Math.abs(e.clientY - cy0) > 12)) clearTimeout(cTimer); });
    ["pointerup", "pointercancel"].forEach(function (ev) { cal.hit.addEventListener(ev, function () { clearTimeout(cTimer); }); });
    cal.hit.addEventListener("click", function (e) { if (cSwallow) { cSwallow = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  }
})();
