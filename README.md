# 🌍 Türkiye Turları - Turizm Websitesi

Türkiye'nin en güzel yerlerini gezginler ile buluşturan profesyonel bir turizm websitesi.

## 📋 Proje Yapısı

```
diltur/
├── index.html              # Ana sayfa
├── turlar.html            # Turlar listesi
├── hakkimizda.html        # Hakkımızda sayfası
├── blog.html              # Blog yazıları
├── iletisim.html          # İletişim ve forma
├── css/
│   └── style.css          # Tüm CSS stilleri
├── admin.html              # Yönetim paneli (nav menüsünde yok, doğrudan URL ile açılır)
├── js/
│   ├── script.js          # UI davranışları (menü, animasyonlar)
│   ├── supabase-client.js # Supabase bağlantısı ve veri fonksiyonları
│   ├── app.js              # Turlar/blog render + form gönderimleri
│   └── admin.js            # Yönetim paneli mantığı (giriş + CRUD)
├── supabase/
│   ├── schema.sql          # Veritabanı tabloları ve RLS politikaları
│   ├── seed.sql            # Başlangıç verisi (8 tur, 6 blog yazısı)
│   ├── api_keys.sql        # Acente API'si için anahtar tablosu
│   ├── admin.sql            # Yönetim paneli için admin yetkilendirmesi
│   └── functions/
│       └── agency-api/     # Acenteler için API key korumalı Edge Function
├── API.md                  # Acente API'si dokümantasyonu
└── README.md              # Bu dosya
```

## 🗄️ Veritabanı Kurulumu (Supabase)

Site, tur/blog içeriğini ve form gönderimlerini (iletişim, newsletter, rezervasyon) [Supabase](https://supabase.com) üzerinde tutar. Kurulum için:

1. [supabase.com](https://supabase.com)'da ücretsiz bir proje oluşturun.
2. Proje panelinde **SQL Editor**'ü açın, sırasıyla `supabase/schema.sql` ve `supabase/seed.sql` dosyalarının içeriğini yapıştırıp çalıştırın.
3. **Project Settings → API** sayfasından `Project URL` ve `anon public` key'i kopyalayın.
4. `js/supabase-client.js` dosyasının en üstündeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerlerini bu bilgilerle doldurun.

Bu iki değer doldurulana kadar turlar/blog bölümleri "yükleniyor" mesajı gösterir; formlar ise hata verir. Site `file://` ile değil, bir HTTP sunucusu üzerinden açılmalıdır (aşağıdaki "Başlangıç" bölümüne bakın) — modül script'leri tarayıcılar tarafından dosya protokolünden çalıştırılmaz.

## 🔌 Acente API'si

Seyahat acenteleri turları ve blog içeriğini kendi sistemlerine çekmek için API key korumalı, salt-okunur bir REST API kullanabilir. Kurulum ve kullanım detayları için [API.md](API.md) dosyasına bakın.

## 🔐 Yönetim Paneli

`admin.html`, turları, blog yazılarını, gelen iletişim mesajlarını, rezervasyon taleplerini, newsletter abonelerini ve acente API anahtarlarını SQL yazmadan yönetebileceğiniz bir panel. Nav menüsünde görünmez — doğrudan `admin.html` adresinden açılır, girişte Supabase Auth kullanılır.

**Kurulum (veritabanı kurulumundan sonra, tek seferlik):**

1. Supabase Dashboard → **Authentication → Users → Add user** ile kendi giriş hesabınızı oluşturun (e-posta + şifre).
2. SQL Editor'de `supabase/admin.sql` dosyasını çalıştırın.
3. Aynı sayfada, oluşturduğunuz kullanıcının UUID'sini (Authentication → Users listesinden) kopyalayıp dosyanın en altındaki örnek `insert into admin_users (...)` satırını doldurup ayrıca çalıştırın.
4. *(Önerilir)* Authentication → Providers → Email'de "Allow new users to sign up" seçeneğini kapatın — panel zaten `admin_users` listesine bakıyor ama bu ekstra bir güvenlik katmanı.
5. `admin.html`'i açıp adım 1'deki bilgilerle giriş yapın.

Birden fazla kişiye erişim vermek isterseniz, her biri için 1-3. adımları tekrarlayın (her kullanıcı ayrı bir `admin_users` satırı olarak eklenir).

## 🎨 Sayfalar

### 1. **Ana Sayfa (index.html)**
- Hero bölümü sıcak hava balonları animasyonuyla
- Popüler turlar kartları
- Dil eğitimi bölümü
- Neden bizi seçmelisiniz bölümü
- Haber bülteni abone formu

### 2. **Turlar Sayfası (turlar.html)**
- Filtre seçenekleri (konum, süre, fiyat)
- 8 farklı tur paketi
- Kapadokya, Trabzon, İstanbul, Bursa, Antalya, Bodrum, Pamukkale, Efes
- Tur kartlarında fiyat, süre, vurgulamalar ve yorum puanları

### 3. **Hakkımızda (hakkimizda.html)**
- Şirket hakkında bilgiler
- İstatistikler (10+ yıl deneyim, 50+ rota, 100+ rehber, 15000+ müşteri)
- Ekip üyeleri
- Değerler ve vizyon
- Neden bizi seçmelisiniz

### 4. **Blog (blog.html)**
- 6 blog yazısı
- Seyahat ipuçları, gezi rehberleri, kültür ve doğa yazıları
- Haber bülteni abone formu

### 5. **İletişim (iletisim.html)**
- İletişim bilgileri (telefon, e-posta, adres)
- İletişim formu
- Sık sorulan sorular (FAQ)
- Canlı sohbet seçeneği

## 🎯 Özellikler

✅ **Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu
✅ **Modern UI/UX** - Güzel gradyan, animasyonlar ve geçişler
✅ **Türkçe İçerik** - Tamamen Türkçe yazılmış
✅ **İnteraktif Elementler** - Form, filtreleme, animasyonlar
✅ **SEO Uyumlu** - Meta etiketleri ve semantic HTML
✅ **Hızlı Yükleme** - Optimize edilmiş CSS ve JS
✅ **Erişilebilir** - Tüm sayfalar kolayca gezilabilir

## 🚀 Başlangıç

1. Dosyaları `/Users/bati/Desktop/diltur/` klasörüne açın
2. `index.html` dosyasını tarayıcıda açın
3. Veya bir HTTP sunucusu üzerinde çalıştırın:

```bash
cd /Users/bati/Desktop/diltur
python -m http.server 8000
# Veya Node.js ile:
npx http-server
```

Tarayıcında `http://localhost:8000` adresine giderek website'yi görebilirsiniz.

## 🎨 Renk Şeması

- **Ana Renk**: #C41E3A (Kırmızı - Türk Bayrağı)
- **İkincil Renk**: #2C3E50 (Koyu Gri)
- **Vurgu Renk**: #E8A000 (Altın)
- **Açık Arka Plan**: #F8F9FA (Açık Gri)

## 📱 Responsive Breakpoints

- **Masaüstü**: 1200px ve üzeri
- **Tablet**: 768px - 1199px
- **Mobil**: 480px - 767px
- **Küçük Mobil**: 480px altı

## 📦 İçindekiler

### Ana Bölümler:
1. **Navigasyon Çubuğu** - Logo, menü, iletişim butonu
2. **Hero Bölümü** - Etkileyici görsel ve başlık
3. **Turlar Listesi** - Tur kartları ve bilgileri
4. **Dil Eğitimi** - Özel program tanıtımı
5. **Neden Biz** - Temel avantajlar
6. **Haber Bülteni** - Abone formu
7. **Footer** - İletişim ve linkler

## ⚙️ Özelleştirme

### Renkleri Değiştirmek:
`css/style.css` dosyasında `:root` bölümünü düzenleyin:
```css
:root {
    --primary-color: #C41E3A;
    --secondary-color: #2C3E50;
    --accent-color: #E8A000;
}
```

### Logo Değiştirmek:
HTML dosyalarında SVG logoyu değiştirebilirsiniz veya bir resim linki ekleyebilirsiniz.

### İçeriği Güncelleme:
- Metinleri doğrudan HTML dosyalarından düzenleyin
- Fiyatları `turlar.html` dosyasında güncelleyin
- Blog yazılarını `blog.html` dosyasına ekleyin

## 📧 İletişim Bilgileri (Varsayılan)

- **Telefon**: +90 212 123 45 67
- **E-Posta**: info@turkiyeturlari.com
- **Adres**: Taksim, İstanbul, Türkiye

## 📝 Lisans

Bu proje açık kaynak olarak tasarlanmıştır. Kişisel ve ticari kullanım için serbesttir.

## 🔄 Güncellemeler

Website dinamik olacak şekilde tasarlanmıştır. Aşağıdaki bölümleri kolayca güncelleyebilirsiniz:

- Turlar ve fiyatlar
- Blog yazıları
- Takım üyeleri
- İletişim bilgileri
- Renkler ve tasarım

## 💡 Gelecek Güncellemeler

- [ ] Online ödeme sistemi entegrasyonu
- [x] Veritabanı entegrasyonu (Supabase — bkz. "Veritabanı Kurulumu")
- [ ] Kullanıcı hesapları
- [x] Dinamik tur rezervasyonu (rezervasyon talebi formu → `bookings` tablosu)
- [ ] Multi-dil desteği
- [ ] Admin paneli

## 👨‍💻 Geliştirici Notları

- Tüm HTML dosyaları `<!DOCTYPE html>` ile başlar
- CSS flexbox ve grid kullanarak responsive tasarlandı
- JavaScript ES6+ özellikleri kullanmaktadır
- Tüm linkler iç bağlantılar olup çalışır durumda

## ✨ Teşekkürler

Bu website, Türkiye'nin turizm potansiyelini en iyi şekilde yansıtmak için tasarlanmıştır.

---

**Oluşturulma Tarihi**: Ağustos 2024
**Durum**: ✅ Tamamlanmış ve Kullanıma Hazır

Websiteyi beğendiyseniz, tüm sayfalarını dolaşıp özelliklerini keşfetmeyi unutmayın! 🎉
