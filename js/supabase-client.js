// ==================== Supabase Client ====================
// Kurulum: supabase.com'da bir proje oluşturun, supabase/schema.sql ve
// supabase/seed.sql dosyalarını SQL Editor'de çalıştırın, ardından
// Project Settings → API'den aşağıdaki iki değeri doldurun.

const SUPABASE_URL = 'https://mdwpozyratahynqykljw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd3BvenlyYXRhaHlucXlrbGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzI1NTcsImV4cCI6MjEwMjQ0ODU1N30.4kNz37fTwMrQ1c-Ycr61O3182ANvAYrwRflhaU6yxK0';

let supabase = null;

export function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

async function getClient() {
    if (!isSupabaseConfigured()) return null;
    if (!supabase) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

export async function fetchTours({ featuredOnly = false } = {}) {
    const client = await getClient();
    if (!client) return null;
    let query = client.from('tours').select('*').order('display_order', { ascending: true });
    if (featuredOnly) query = query.eq('is_featured', true);
    const { data, error } = await query;
    if (error) {
        console.error('fetchTours error:', error);
        return null;
    }
    return data;
}

export async function fetchBlogPosts() {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
    if (error) {
        console.error('fetchBlogPosts error:', error);
        return null;
    }
    return data;
}

export async function submitContactMessage(payload) {
    const client = await getClient();
    if (!client) throw new Error('Supabase henüz yapılandırılmadı.');
    const { error } = await client.from('contact_messages').insert(payload);
    if (error) throw error;
}

export async function subscribeNewsletter(email, source) {
    const client = await getClient();
    if (!client) throw new Error('Supabase henüz yapılandırılmadı.');
    const { error } = await client
        .from('newsletter_subscribers')
        .insert({ email, source })
        .select();
    if (error && error.code !== '23505') throw error; // 23505 = zaten kayıtlı, sessizce geç
}

export async function createBooking(payload) {
    const client = await getClient();
    if (!client) throw new Error('Supabase henüz yapılandırılmadı.');
    const { error } = await client.from('bookings').insert(payload);
    if (error) throw error;
}
