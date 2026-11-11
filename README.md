# Janto bağlantı sayfası

Karakter seçim ekranı temalı, tek sayfalık bağlantı sitesi. Saf HTML, CSS ve JS; derleme adımı yok. Netlify ile yayınlanır (https://jntpage.netlify.app/). Repoya her push yeni sürümü otomatik yayına alır.

## Yapı

| Yol | Ne işe yarar |
|---|---|
| `index.html` | Sayfa iskeleti, meta etiketleri ve güvenlik politikası (CSP) |
| `css/style.css` | Tüm stiller ve yazı tipi tanımları |
| `js/app.js` | Bağlantılar, karakter sahnesi, son video kartı. Üstteki `CHARACTERS`, `LINKS`, `YOUTUBE` bölümlerini düzenle |
| `data/videos.json` | Son video. Elle değiştirme, otomatik güncellenir |
| `.github/workflows/update-video.yml` | Her 15 dakikada YouTube RSS'ini okuyup `videos.json` dosyasını günceller |
| `_headers` | Netlify güvenlik başlıkları (CSP, X-Frame-Options vb.) ve önbellek süreleri |
| `fonts/` | Kendi sunucumuzdan sunulan Manrope ve Playfair Display |
| `img/` | Görseller. `og.jpg` paylaşım önizlemesi, `icon-*.png` ve `favicon-64.png` simgeler |

## Son video nasıl güncellenir?

`scripts/update-video.mjs` kanalın RSS akışını okur. Workflow'u hemen çalıştırmak için repoda **Actions → Son videoyu güncelle → Run workflow**. Kanal değişirse `update-video.yml` içindeki `CHANNEL_ID` ve `js/app.js` içindeki `YOUTUBE.channelUrl` değiştirilir.

## Önbellek

`index.html` içindeki `css/style.css?v=...` ve `js/app.js?v=...` sürüm numarasını CSS veya JS değiştirince artır. Görsel değiştirirsen dosya adını da değiştir ya da adrese `?v=` ekle.

## Alan adı değişirse

`index.html` içindeki `canonical` ve `og:` adreslerini yeni alan adına göre güncelle.

## Lisans ve içerik hakları

Kaynak kod MIT lisanslıdır (`LICENSE`). Karakter görselleri, Janto logosu ve oyun sunucusuna ait içerikler bu lisansın dışındadır; hakları ilgili sahiplerine aittir ve izinsiz kullanılamaz.

## Kendi sunucunda yayınlama (Caddy)

Site saf statik dosyalardır, derleme ya da veritabanı gerekmez. Netlify'a özel iki şey vardır: `_headers` dosyası ve GitHub Actions ile video güncelleme. Sunucuda ikisi de elle kurulur.

1. **Dosyaları al:** sunucuda `git clone https://github.com/whiteexcellent/jpage /var/www/jpage`
2. **Caddy'yi kur ve ayarla:** `deploy/Caddyfile` dosyasındaki alan adını kendi alan adınla değiştir, Caddy ayar dosyasına ekle, `sudo systemctl reload caddy` çalıştır. Başlıklar, önbellek ve 404 sayfası bu dosyada hazırdır, HTTPS sertifikasını Caddy kendisi alır.
3. **Alan adının DNS kaydı** sunucunun IP adresini göstermeli (A kaydı).
4. **Adresleri güncelle:** `index.html` içindeki `canonical` ve `og:url` / `og:image` adreslerini yeni alan adıyla değiştir.
5. **Son videonun otomatik güncellenmesi** (ikisinden biri):
   - Sunucu kendisi yapsın (Node 18+ kurulu olmalı). `crontab -e` ile şunu ekle:
     ```
     */15 * * * * cd /var/www/jpage && CHANNEL_ID=UCRqJVaQLwcT3irYb-ZzcuSw node scripts/update-video.mjs
     ```
   - GitHub Actions yapmaya devam etsin, sunucu sadece çeksin:
     ```
     */15 * * * * cd /var/www/jpage && git pull -q --ff-only
     ```
6. **Güncelleme:** kodu değiştirince sunucuda `git pull` yeter. CSS ya da JS değiştirdiysen `index.html` içindeki `?v=` sürüm numarasını artır.
