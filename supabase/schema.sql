-- Türkiye Turları — Supabase şeması
-- Supabase Dashboard → SQL Editor içinde çalıştırın.

create extension if not exists "pgcrypto";

-- ==================== Tours ====================
create table if not exists tours (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    location text not null,
    description text not null,
    image_url text not null,
    badge text,
    rating numeric(2,1),
    review_count int default 0,
    duration text not null,
    price numeric not null,
    highlights text[] default '{}',
    is_featured boolean default false,
    display_order int default 0,
    created_at timestamptz default now()
);

alter table tours enable row level security;

create policy "Tours are publicly readable"
    on tours for select
    to anon
    using (true);

-- ==================== Blog Posts ====================
create table if not exists blog_posts (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    category text not null,
    excerpt text not null,
    image_url text not null,
    author text not null,
    published_at date not null,
    created_at timestamptz default now()
);

alter table blog_posts enable row level security;

create policy "Blog posts are publicly readable"
    on blog_posts for select
    to anon
    using (true);

-- ==================== Contact Messages ====================
create table if not exists contact_messages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    phone text,
    subject text,
    tour_interest text,
    message text not null,
    created_at timestamptz default now()
);

alter table contact_messages enable row level security;

create policy "Anyone can submit a contact message"
    on contact_messages for insert
    to anon
    with check (true);

-- ==================== Newsletter Subscribers ====================
create table if not exists newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    source text,
    created_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to the newsletter"
    on newsletter_subscribers for insert
    to anon
    with check (true);

-- ==================== Bookings ====================
create table if not exists bookings (
    id uuid primary key default gen_random_uuid(),
    tour_id uuid references tours(id),
    tour_title text not null,
    name text not null,
    email text not null,
    phone text not null,
    preferred_date date,
    people_count int default 1,
    notes text,
    status text default 'pending',
    created_at timestamptz default now()
);

alter table bookings enable row level security;

create policy "Anyone can request a booking"
    on bookings for insert
    to anon
    with check (true);
