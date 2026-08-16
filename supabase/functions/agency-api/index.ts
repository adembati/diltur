// Türkiye Turları — Acente API'si
// Seyahat acentelerinin tur ve blog verilerini kendi sistemlerine çekmesi için
// API key korumalı, salt-okunur bir uç nokta. `api_keys` tablosuna hiçbir RLS
// politikası tanımlanmadığı için bu fonksiyon, servis rolü (service_role) ile
// çalışarak anahtarları doğrular; anon key ile bu tabloya asla erişilemez.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const TOUR_COLUMNS = 'slug, title, location, description, image_url, duration, price, rating, review_count, highlights, is_featured';

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
        return json({ error: 'X-API-Key başlığı eksik.' }, 401);
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: keyRow, error: keyError } = await supabase
        .from('api_keys')
        .select('id, is_active')
        .eq('key', apiKey)
        .maybeSingle();

    if (keyError || !keyRow || !keyRow.is_active) {
        return json({ error: 'Geçersiz veya devre dışı API anahtarı.' }, 401);
    }

    // Fire-and-forget: son kullanım zamanını güncelle, cevabı bekletme.
    supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRow.id).then();

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const segments = parts.slice(parts.indexOf('agency-api') + 1);

    if (segments[0] === 'tours' && !segments[1]) {
        let query = supabase.from('tours').select(TOUR_COLUMNS).order('display_order');
        if (url.searchParams.get('featured') === 'true') query = query.eq('is_featured', true);
        const location = url.searchParams.get('location');
        if (location) query = query.eq('location', location);

        const { data, error } = await query;
        if (error) return json({ error: error.message }, 500);
        return json({ data });
    }

    if (segments[0] === 'tours' && segments[1]) {
        const { data, error } = await supabase.from('tours').select(TOUR_COLUMNS).eq('slug', segments[1]).maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: 'Tur bulunamadı.' }, 404);
        return json({ data });
    }

    if (segments[0] === 'blog' && !segments[1]) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('slug, title, category, excerpt, image_url, author, published_at')
            .order('published_at', { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data });
    }

    return json({ error: 'Bulunamadı. Kullanılabilir uç noktalar: /tours, /tours/:slug, /blog' }, 404);
});
