# Türkiye Turları — Acente API'si

Seyahat acenteleri ve B2B iş ortakları için, güncel tur ve blog içeriklerini kendi
sistemlerine çekebilecekleri, API key ile korunan salt-okunur bir REST API.

## Base URL

```
https://mdwpozyratahynqykljw.supabase.co/functions/v1/agency-api
```

## Kimlik Doğrulama

Her istekte `X-API-Key` başlığı zorunludur. Anahtarınız yoksa
[info@turkiyeturlari.com](mailto:info@turkiyeturlari.com) adresinden talep edebilirsiniz.

```
X-API-Key: ttk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Eksik veya geçersiz anahtarla yapılan istekler `401 Unauthorized` döner.

## Uç Noktalar

### `GET /tours`

Tüm turları döner.

**Sorgu parametreleri (opsiyonel):**
| Parametre | Açıklama |
|---|---|
| `featured=true` | Sadece öne çıkan turlar |
| `location=Kapadokya` | Konuma göre filtre |

```bash
curl "https://mdwpozyratahynqykljw.supabase.co/functions/v1/agency-api/tours" \
  -H "X-API-Key: ttk_live_..."
```

```json
{
  "data": [
    {
      "slug": "kapadokya",
      "title": "Kapadokya Turu",
      "location": "Kapadokya",
      "description": "Peri bacaları, yılı altı şehirleri ve büyüleyen manzaralar sizi bekliyor...",
      "image_url": "images/card-cappadocia.jpg",
      "duration": "3 Gece 4 Gün",
      "price": 5490,
      "rating": 4.8,
      "review_count": 120,
      "highlights": ["🎈 Sıcak Hava Balonu", "🏰 Tarihi Yerler", "🌄 Doğa Gezisi"],
      "is_featured": true
    }
  ]
}
```

### `GET /tours/:slug`

Tek bir turun detayını döner (örn. `/tours/kapadokya`). Bulunamazsa `404` döner.

### `GET /blog`

Tüm blog yazılarını (en yeniden eskiye) döner.

```json
{
  "data": [
    {
      "slug": "kapadokya-balon-deneyimi",
      "title": "Kapadokya'da Sıcak Hava Balonu Deneyimi",
      "category": "Seyahat İpuçları",
      "excerpt": "Kapadokya'da sıcak hava balonuyla uçarken neler yaşanır...",
      "image_url": "images/card-cappadocia.jpg",
      "author": "Ahmet Şahin",
      "published_at": "2024-08-16"
    }
  ]
}
```

## Hatalar

| Kod | Anlamı |
|---|---|
| `401` | `X-API-Key` eksik, geçersiz veya devre dışı bırakılmış |
| `404` | İstenen kayıt veya uç nokta bulunamadı |
| `500` | Sunucu tarafında beklenmeyen bir hata |

Hata gövdesi her zaman `{ "error": "açıklama" }` formatındadır.

## Sınırlamalar

- Sadece okuma (`GET`) desteklenir; rezervasyon/iletişim gibi yazma işlemleri bu API'nin kapsamı dışındadır.
- Şu an için istek sayısı sınırlaması (rate limiting) uygulanmamaktadır — kötüye kullanım tespit edilirse anahtar devre dışı bırakılabilir.

---

## İşletme Sahibi İçin: Kurulum ve Anahtar Yönetimi

1. `supabase/api_keys.sql` dosyasını Supabase Dashboard → SQL Editor'de çalıştırın.
2. Dashboard → **Edge Functions** → **Deploy a new function** → adını `agency-api` verin,
   `supabase/functions/agency-api/index.ts` dosyasının içeriğini yapıştırıp deploy edin.
   (Supabase CLI'niz varsa alternatif olarak: `supabase functions deploy agency-api`)
3. Yeni bir acenteye anahtar vermek için SQL Editor'de:
   ```sql
   insert into api_keys (key, agency_name, contact_email)
   values ('ttk_live_' || encode(gen_random_bytes(24), 'hex'), 'Acente Adı', 'acente@example.com')
   returning key;
   ```
   Dönen `key` değerini acenteyle paylaşın.
4. Bir anahtarı iptal etmek için: `update api_keys set is_active = false where agency_name = 'Acente Adı';`

> **Not:** [Yönetim paneli](admin.html) kurulduysa (bkz. README.md) yukarıdaki adımların hepsini SQL yazmadan panelden yapabilirsiniz — anahtarlar istediğiniz zaman tekrar görüntülenebilir/kopyalanabilir.
