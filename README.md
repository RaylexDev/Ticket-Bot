# 🎫 Raylex Ticket Sistemi

<p align="center">
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="discord.js">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="node">
  <img src="https://img.shields.io/badge/Lisans-MIT-yellow?style=for-the-badge" alt="license">
  <img src="https://img.shields.io/badge/Dil-Türkçe-red?style=for-the-badge" alt="language">
</p>

<p align="center">
  <b>discord sunucuları için geliştirilmiş, tek dosya Discord ticket botu.</b><br>
  Termux ve VPS üzerinde çalışır. discord.js v14 Components V2 kullanır.
</p>

---

## ✨ Özellikler

- 🎫 **Ticket Paneli** — Görsel banner ve bilgi mesajı ile tam panel
- 📋 **Modal Form** — Kullanıcıdan detaylı sebep alır (10–500 karakter)
- 👤 **Kullanıcı Yönetimi** — Tickete kullanıcı ekleme / çıkarma
- 🔒 **Ticket Kapatma** — HTML transkript üretir, arşive taşır
- 🔓 **Yeniden Açma** — Arşivdeki ticketi tekrar aktif eder
- 🗑️ **Ticket Silme** — Kanalı tamamen siler
- 📝 **Log Sistemi** — Kapatılan her ticket için log kanalına kayıt + transkript
- 🛡️ **Hata Yönetimi** — `unhandledRejection` ve `uncaughtException` yakalanır
- ✅ **ID Doğrulaması** — Kullanıcı ID formatı kontrol edilir
- ⏱️ **Süre Takibi** — Log kaydında ticket süresi görünür

---

## 📦 Kurulum

### Termux (Android)

```bash
pkg update && pkg upgrade
pkg install nodejs git
git clone https://github.com/RaylexDev/raylex-ticket
cd raylex-ticket
npm install
```

### VPS / PC (Linux/Windows)

```bash
git clone https://github.com/RaylexDev/raylex-ticket
cd raylex-ticket
npm install
```

> **Gereksinim:** Node.js 18 veya üzeri

---

## ⚙️ Yapılandırma

`index.js` dosyasını aç ve en üstteki `CONFIG` bloğunu doldur:

```js
const CONFIG = {
  token:             "BOT_TOKEN_BURAYA",
  staffRoleId:       "YETKİLİ_ROL_ID",
  logChannelId:      "LOG_KANAL_ID",
  ticketCategoryId:  "TİCKET_KATEGORİ_ID",
  archiveCategoryId: "ARŞİV_KATEGORİ_ID",
  serverName:        "Sunucu Adın",
  bannerUrl:         "https://resim-linkin.com/banner.png",
};
```

### Discord Geliştirici Portalı Ayarları

Bot tokenini almak için:

1. [discord.com/developers](https://discord.com/developers/applications) adresine git
2. **New Application** → bot oluştur
3. **Bot** sekmesi → **Reset Token** → kopyala
4. Aynı sayfada şu izinleri aç:
   - `MESSAGE CONTENT INTENT`
   - `SERVER MEMBERS INTENT`
   - `PRESENCE INTENT`

### Bot Davet Bağlantısı

Aşağıdaki izinlerle botu sunucuna ekle:

```
https://discord.com/oauth2/authorize?client_id=BOT_ID&permissions=8&scope=bot
```

> `permissions=8` = Yönetici. Daha kısıtlı izin istersen: `Manage Channels`, `Manage Messages`, `Send Messages`, `Read Message History`, `Attach Files`, `View Channel`.

---

## ▶️ Çalıştırma

```bash
node index.js
```

Sürekli çalışması için **PM2** kullanabilirsin:

```bash
npm install -g pm2
pm2 start index.js --name raylex-ticket
pm2 save
pm2 startup
```

---

## 🤖 Komutlar

| Komut | Açıklama | Yetki |
|-------|----------|-------|
| `.ticket` | Ticket panelini o kanala gönderir | Kanal Yönetimi |
| `.ticketler` | Açık ticketleri listeler | Yetkili Rolü |
| `.ping` | Bot gecikmesini gösterir | Herkese Açık |
| `.yardim` | Komut listesini gösterir | Yetkili Rolü |

---

## 🗂️ Discord Sunucu Yapısı

Botun çalışması için sunucunda şu yapı olmalı:

```
📁 Ticketler (Kategori)      ← ticketCategoryId
   └── ticket-1
   └── ticket-2

📁 Arşiv (Kategori)          ← archiveCategoryId
   └── arsiv-1

📋 #ticket-log (Kanal)       ← logChannelId
📋 #destek (Kanal)           ← Panel buraya gönderilir
```

---

## 🔄 Ticket Akışı

```
Kullanıcı "Ticket Aç" düğmesine basar
        ↓
Modal form açılır (sebep girer)
        ↓
Özel kanal oluşturulur
        ↓
Yetkili ticket'ı inceler
        ↓
"Ticketi Kapat" → HTML transkript üretilir → Log kanalına gönderilir → Arşive taşınır
        ↓
"Yeniden Aç" veya "Sil" seçeneği
```

---

## 🛠️ Gereksinimler

| Paket | Versiyon |
|-------|----------|
| discord.js | ^14.16.3 |
| discord-html-transcripts | ^3.2.0 |
| Node.js | ≥ 18.0.0 |

---

## 🐛 Sorun Giderme

**Bot başlamıyor:**
- Token doğru mu? `CONFIG.token` alanını kontrol et.
- Node.js sürümü 18+ mi? `node --version` ile kontrol et.

**Kanal oluşturulmuyor:**
- Bota `Kanalları Yönet` izni verilmiş mi?
- `ticketCategoryId` doğru ID mi?

**Transkript gönderilmiyor:**
- `logChannelId` doğru mu?
- Bot o kanalda mesaj gönderebiliyor mu?

---

## 📄 Lisans

MIT Lisansı — dilediğin gibi kullanabilirsin.

---

<p align="center">
  <b>MarvelCode ❤️ RaylexDev</b>
</p>
