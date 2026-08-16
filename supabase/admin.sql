-- Türkiye Turları — Yönetim Paneli yetkilendirmesi
-- schema.sql ve api_keys.sql'den sonra, Supabase Dashboard → SQL Editor içinde çalıştırın.
-- Bu dosya baştan sona tekrar çalıştırılsa bile güvenlidir (idempotent).
--
-- Önce kendi giriş hesabınızı oluşturun:
-- Dashboard → Authentication → Users → "Add user" (e-posta + şifre, "Auto Confirm User" işaretli).
-- Ardından bu dosyanın en altındaki insert satırını kendi kullanıcı UUID'nizle doldurup çalıştırın.

-- ==================== Admin Allowlist ====================
create table if not exists admin_users (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null unique,
    email text not null,
    created_at timestamptz default now()
);

alter table admin_users enable row level security;

-- Bir kullanıcı sadece kendi admin durumunu sorgulayabilir, başka admini göremez.
drop policy if exists "Users can check their own admin status" on admin_users;
create policy "Users can check their own admin status"
    on admin_users for select
    to authenticated
    using (user_id = auth.uid());

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from admin_users where user_id = auth.uid()
    );
$$;

-- ==================== Tours: admin okuma/yazma yetkisi ====================
-- Not: schema.sql'deki "Tours are publicly readable" politikası sadece `anon` rolüne
-- uygulanır; giriş yapmış (authenticated) admin için ayrıca bir select politikası gerekir.
drop policy if exists "Admins can read tours" on tours;
create policy "Admins can read tours"
    on tours for select to authenticated using (is_admin());
drop policy if exists "Admins can insert tours" on tours;
create policy "Admins can insert tours"
    on tours for insert to authenticated with check (is_admin());
drop policy if exists "Admins can update tours" on tours;
create policy "Admins can update tours"
    on tours for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "Admins can delete tours" on tours;
create policy "Admins can delete tours"
    on tours for delete to authenticated using (is_admin());

-- ==================== Blog Posts: admin okuma/yazma yetkisi ====================
drop policy if exists "Admins can read blog posts" on blog_posts;
create policy "Admins can read blog posts"
    on blog_posts for select to authenticated using (is_admin());
drop policy if exists "Admins can insert blog posts" on blog_posts;
create policy "Admins can insert blog posts"
    on blog_posts for insert to authenticated with check (is_admin());
drop policy if exists "Admins can update blog posts" on blog_posts;
create policy "Admins can update blog posts"
    on blog_posts for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "Admins can delete blog posts" on blog_posts;
create policy "Admins can delete blog posts"
    on blog_posts for delete to authenticated using (is_admin());

-- ==================== Contact Messages: admin okuma/silme ====================
drop policy if exists "Admins can read contact messages" on contact_messages;
create policy "Admins can read contact messages"
    on contact_messages for select to authenticated using (is_admin());
drop policy if exists "Admins can delete contact messages" on contact_messages;
create policy "Admins can delete contact messages"
    on contact_messages for delete to authenticated using (is_admin());

-- ==================== Newsletter Subscribers: admin okuma/silme ====================
drop policy if exists "Admins can read newsletter subscribers" on newsletter_subscribers;
create policy "Admins can read newsletter subscribers"
    on newsletter_subscribers for select to authenticated using (is_admin());
drop policy if exists "Admins can delete newsletter subscribers" on newsletter_subscribers;
create policy "Admins can delete newsletter subscribers"
    on newsletter_subscribers for delete to authenticated using (is_admin());

-- ==================== Bookings: admin okuma/durum güncelleme ====================
drop policy if exists "Admins can read bookings" on bookings;
create policy "Admins can read bookings"
    on bookings for select to authenticated using (is_admin());
drop policy if exists "Admins can update bookings" on bookings;
create policy "Admins can update bookings"
    on bookings for update to authenticated using (is_admin()) with check (is_admin());

-- ==================== API Keys: admin tam erişim ====================
drop policy if exists "Admins can read api keys" on api_keys;
create policy "Admins can read api keys"
    on api_keys for select to authenticated using (is_admin());
drop policy if exists "Admins can insert api keys" on api_keys;
create policy "Admins can insert api keys"
    on api_keys for insert to authenticated with check (is_admin());
drop policy if exists "Admins can update api keys" on api_keys;
create policy "Admins can update api keys"
    on api_keys for update to authenticated using (is_admin()) with check (is_admin());

-- ==================== Kendinizi admin yapmak için ====================
-- Önce kendi UUID'nizi ve e-postanızı görün:
--
-- select id, email, email_confirmed_at from auth.users;
--
-- Sonra (tekrar çalıştırsanız da hata vermez, üzerine yazar):
--
-- insert into admin_users (user_id, email)
-- values ('KULLANICI-UUID-BURAYA', 'sizin@eposta.com')
-- on conflict (user_id) do update set email = excluded.email
-- returning *;
--
-- Son satırda kendi kaydınızın döndüğünü görmelisiniz — bu, admin.html'de giriş
-- yapabileceğinizin kanıtıdır.
