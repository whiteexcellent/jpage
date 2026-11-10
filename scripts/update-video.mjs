// YouTube kanalının RSS akışından en yeni videoyu okuyup data/videos.json dosyasına yazar.
// Bağımlılık yok (Node 18+). Başarısız olursa mevcut dosyaya dokunmadan çıkar.
//   CHANNEL_ID : UC ile başlayan kanal kimliği
//   FEED_FILE  : (test için) ağ yerine yerel bir XML dosyası oku
import { readFile, writeFile, mkdir } from "node:fs/promises";

const CHANNEL_ID = process.env.CHANNEL_ID || "";
const OUT = "data/videos.json";
const ID_RE = /^[A-Za-z0-9_-]{11}$/;

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

async function loadFeed() {
  if (process.env.FEED_FILE) return readFile(process.env.FEED_FILE, "utf8");
  if (!/^UC[A-Za-z0-9_-]{22}$/.test(CHANNEL_ID)) throw new Error("CHANNEL_ID geçersiz");
  const url = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID;
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": "jpage-video-bot" }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.text();
    } catch (e) {
      last = e;
      await new Promise((ok) => setTimeout(ok, 2000 * (i + 1)));
    }
  }
  throw last;
}

function parse(xml) {
  const entry = /<entry>([\s\S]*?)<\/entry>/.exec(xml);
  if (!entry) throw new Error("akışta video yok");
  const pick = (re) => { const m = re.exec(entry[1]); return m ? decode(m[1].trim()) : ""; };
  const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
  const title = pick(/<title>([\s\S]*?)<\/title>/);
  const published = pick(/<published>([^<]+)<\/published>/);
  if (!ID_RE.test(id)) throw new Error("geçersiz video kimliği: " + id);
  if (published && Number.isNaN(Date.parse(published))) throw new Error("geçersiz tarih");
  return { id, title: title.slice(0, 200) || "Son video", published };
}

try {
  const video = parse(await loadFeed());
  const next = JSON.stringify(video) + "\n";
  let prev = "";
  try { prev = await readFile(OUT, "utf8"); } catch {}
  if (prev === next) { console.log("Değişiklik yok:", video.id); }
  else { await mkdir("data", { recursive: true }); await writeFile(OUT, next); console.log("Güncellendi:", video.id, "-", video.title); }
} catch (e) {
  console.warn("Video güncellenemedi, mevcut dosya korunuyor:", e.message);
}
