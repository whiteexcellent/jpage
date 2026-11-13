// Kullanım: node scripts/bump-version.mjs
// img/, sound/, video/ veya css/js değişince çalıştır: önbellekteki eski dosyaların görünmesini engeller.
import { readFileSync, writeFileSync } from "node:fs";
const v = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
let h = readFileSync("index.html", "utf8");
h = h.replace(/(<meta name="asset-v" content=")[^"]*"/, `$1${v}"`)
     .replace(/((?:css|js)\/[\w.-]+\.(?:css|js))\?v=[\w]+/g, `$1?v=${v}`);
writeFileSync("index.html", h);
console.log("sürüm:", v);
