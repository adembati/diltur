-- Türkiye Turları — Acente API'si için anahtar tablosu
-- schema.sql'den sonra, Supabase Dashboard → SQL Editor içinde çalıştırın.
-- Bu tabloya anon rolü için HİÇBİR RLS politikası tanımlanmıyor; site frontend'i veya
-- başka biri anon key ile bu tabloyu asla okuyamaz/yazamaz. Erişimi olan sadece
-- service_role (agency-api Edge Function'ın kullandığı rol) ve — admin.sql çalıştırıldıysa —
-- admin_users listesindeki yönetim paneli kullanıcılarıdır.

create table if not exists api_keys (
    id uuid primary key default gen_random_uuid(),
    key text unique not null,
    agency_name text not null,
    contact_email text,
    is_active boolean default true,
    created_at timestamptz default now(),
    last_used_at timestamptz
);

alter table api_keys enable row level security;

-- ==================== Yeni bir acente anahtarı oluşturmak için ====================
-- Aşağıdaki satırı kendi bilgilerinizle doldurup SQL Editor'de çalıştırın;
-- dönen `key` değerini acenteyle paylaşın. (Yönetim paneli kurulduysa bu adımı
-- SQL yazmadan admin.html → "API Anahtarları" sekmesinden de yapabilirsiniz.)
--
-- insert into api_keys (key, agency_name, contact_email)
-- values ('ttk_live_' || encode(gen_random_bytes(24), 'hex'), 'Acente Adı', 'acente@example.com')
-- returning key;
--
-- Bir anahtarı devre dışı bırakmak için:
-- update api_keys set is_active = false where agency_name = 'Acente Adı';
