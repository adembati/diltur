// ==================== Türkiye Turları — Yönetim Paneli ====================
import { getSupabaseClient } from './supabase-client.js';

let supabase;

const loginSection = document.getElementById('adminLogin');
const dashboardSection = document.getElementById('adminDashboard');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const adminEmailEl = document.getElementById('adminEmail');

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
}

function showDashboard(email) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
    loginError.style.display = 'none';
    adminEmailEl.textContent = email;
}

async function handleSession(session) {
    if (!session) {
        showLogin();
        return;
    }
    const { data: adminRow } = await supabase
        .from('admin_users')
        .select('email')
        .eq('user_id', session.user.id)
        .maybeSingle();

    if (!adminRow) {
        showError('Bu hesabın yönetim paneline erişim yetkisi yok.');
        await supabase.auth.signOut();
        showLogin();
        return;
    }

    showDashboard(adminRow.email);
    loadAllTabs();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showError(`Giriş başarısız: ${error.message}`);
});

logoutBtn.addEventListener('click', () => supabase.auth.signOut());

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
});

// ==================== Ortak Yardımcılar ====================
function renderTable(bodyEl, headEl, columns, rows, emptyMessage) {
    headEl.innerHTML = `<tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>`;
    if (!rows || rows.length === 0) {
        bodyEl.innerHTML = `<tr><td colspan="${columns.length}"><div class="admin-empty">${emptyMessage}</div></td></tr>`;
        return;
    }
    bodyEl.innerHTML = rows
        .map(row => `<tr>${columns.map(c => `<td class="${c.wrap ? 'wrap' : ''}">${c.render(row)}</td>`).join('')}</tr>`)
        .join('');
}

async function deleteRecord(table, id, reload, confirmMsg) {
    if (!confirm(confirmMsg)) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
        alert('Silme başarısız: ' + error.message);
        return;
    }
    reload();
}

function tableRefs(bodyId) {
    const body = document.getElementById(bodyId);
    return { body, head: body.closest('table').querySelector('thead') };
}

// ==================== Turlar ====================
let tourModal;

function ensureTourModal() {
    if (tourModal) return tourModal;
    const overlay = document.createElement('div');
    overlay.className = 'booking-modal-overlay';
    overlay.innerHTML = `
        <div class="booking-modal">
            <button type="button" class="booking-modal-close" aria-label="Kapat">✕</button>
            <h3 id="tourModalTitle">Tur</h3>
            <form id="tourForm">
                <div class="form-group"><label>Başlık *</label><input type="text" name="title" required></div>
                <div class="form-group"><label>Slug *</label><input type="text" name="slug" required></div>
                <div class="form-group"><label>Konum *</label><input type="text" name="location" required></div>
                <div class="form-group full-width"><label>Açıklama *</label><textarea name="description" rows="3" required></textarea></div>
                <div class="form-group"><label>Görsel URL *</label><input type="text" name="image_url" required></div>
                <div class="form-group"><label>Rozet</label><input type="text" name="badge" placeholder="Popüler"></div>
                <div class="form-group"><label>Süre *</label><input type="text" name="duration" required placeholder="3 Gece 4 Gün"></div>
                <div class="form-group"><label>Fiyat (TL) *</label><input type="number" name="price" required></div>
                <div class="form-group"><label>Puan</label><input type="number" step="0.1" min="0" max="5" name="rating"></div>
                <div class="form-group"><label>Yorum Sayısı</label><input type="number" name="review_count"></div>
                <div class="form-group full-width"><label>Öne Çıkanlar (virgülle ayırın)</label><input type="text" name="highlights" placeholder="🎈 Sıcak Hava Balonu, 🏰 Tarihi Yerler"></div>
                <div class="form-group"><label>Sıra</label><input type="number" name="display_order"></div>
                <div class="form-group"><label><input type="checkbox" name="is_featured"> Ana sayfada öne çıksın</label></div>
                <button type="submit" class="btn btn-primary">Kaydet</button>
            </form>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    overlay.querySelector('.booking-modal-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.querySelector('#tourForm').addEventListener('submit', saveTour);
    tourModal = overlay;
    return overlay;
}

function openTourModal(tour) {
    const overlay = ensureTourModal();
    const form = overlay.querySelector('#tourForm');
    form.reset();
    form.dataset.id = tour ? tour.id : '';
    overlay.querySelector('#tourModalTitle').textContent = tour ? 'Turu Düzenle' : 'Yeni Tur';
    if (tour) {
        form.title.value = tour.title;
        form.slug.value = tour.slug;
        form.location.value = tour.location;
        form.description.value = tour.description;
        form.image_url.value = tour.image_url;
        form.badge.value = tour.badge ?? '';
        form.duration.value = tour.duration;
        form.price.value = tour.price;
        form.rating.value = tour.rating ?? '';
        form.review_count.value = tour.review_count ?? '';
        form.highlights.value = (tour.highlights ?? []).join(', ');
        form.display_order.value = tour.display_order ?? '';
        form.is_featured.checked = !!tour.is_featured;
    }
    overlay.classList.add('open');
}

async function saveTour(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
        title: form.title.value,
        slug: form.slug.value,
        location: form.location.value,
        description: form.description.value,
        image_url: form.image_url.value,
        badge: form.badge.value || null,
        duration: form.duration.value,
        price: Number(form.price.value),
        rating: form.rating.value ? Number(form.rating.value) : null,
        review_count: form.review_count.value ? Number(form.review_count.value) : 0,
        highlights: form.highlights.value.split(',').map(s => s.trim()).filter(Boolean),
        display_order: form.display_order.value ? Number(form.display_order.value) : 0,
        is_featured: form.is_featured.checked,
    };
    const id = form.dataset.id;
    const { error } = id
        ? await supabase.from('tours').update(payload).eq('id', id)
        : await supabase.from('tours').insert(payload);
    if (error) {
        alert('Kaydetme başarısız: ' + error.message);
        return;
    }
    closeModalOverlay(form);
    loadTours();
}

function closeModalOverlay(el) {
    el.closest('.booking-modal-overlay').classList.remove('open');
}

async function loadTours() {
    const { body, head } = tableRefs('toursTableBody');
    const { data, error } = await supabase.from('tours').select('*').order('display_order');
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    renderTable(body, head, [
        { label: 'Sıra', render: t => t.display_order },
        { label: 'Başlık', render: t => t.title },
        { label: 'Konum', render: t => t.location },
        { label: 'Fiyat', render: t => `${t.price} TL` },
        { label: 'Öne Çıkan', render: t => t.is_featured ? '✓' : '' },
        { label: '', render: t => `<button type="button" class="admin-action-btn" data-edit="${t.id}">Düzenle</button> <button type="button" class="admin-action-btn" data-delete="${t.id}">Sil</button>` },
    ], data, 'Henüz tur eklenmemiş.');

    body.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openTourModal(data.find(t => t.id === btn.dataset.edit))));
    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteRecord('tours', btn.dataset.delete, loadTours, 'Bu turu silmek istediğinizden emin misiniz?')));
}

document.getElementById('addTourBtn').addEventListener('click', () => openTourModal(null));

// ==================== Blog ====================
let blogModal;

function ensureBlogModal() {
    if (blogModal) return blogModal;
    const overlay = document.createElement('div');
    overlay.className = 'booking-modal-overlay';
    overlay.innerHTML = `
        <div class="booking-modal">
            <button type="button" class="booking-modal-close" aria-label="Kapat">✕</button>
            <h3 id="blogModalTitle">Blog Yazısı</h3>
            <form id="blogForm">
                <div class="form-group"><label>Başlık *</label><input type="text" name="title" required></div>
                <div class="form-group"><label>Slug *</label><input type="text" name="slug" required></div>
                <div class="form-group"><label>Kategori *</label><input type="text" name="category" required></div>
                <div class="form-group"><label>Yazar *</label><input type="text" name="author" required></div>
                <div class="form-group"><label>Görsel URL *</label><input type="text" name="image_url" required></div>
                <div class="form-group"><label>Yayın Tarihi *</label><input type="date" name="published_at" required></div>
                <div class="form-group full-width"><label>Özet *</label><textarea name="excerpt" rows="4" required></textarea></div>
                <button type="submit" class="btn btn-primary">Kaydet</button>
            </form>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    overlay.querySelector('.booking-modal-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.querySelector('#blogForm').addEventListener('submit', saveBlog);
    blogModal = overlay;
    return overlay;
}

function openBlogModal(post) {
    const overlay = ensureBlogModal();
    const form = overlay.querySelector('#blogForm');
    form.reset();
    form.dataset.id = post ? post.id : '';
    overlay.querySelector('#blogModalTitle').textContent = post ? 'Yazıyı Düzenle' : 'Yeni Yazı';
    if (post) {
        form.title.value = post.title;
        form.slug.value = post.slug;
        form.category.value = post.category;
        form.author.value = post.author;
        form.image_url.value = post.image_url;
        form.published_at.value = post.published_at;
        form.excerpt.value = post.excerpt;
    }
    overlay.classList.add('open');
}

async function saveBlog(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
        title: form.title.value,
        slug: form.slug.value,
        category: form.category.value,
        author: form.author.value,
        image_url: form.image_url.value,
        published_at: form.published_at.value,
        excerpt: form.excerpt.value,
    };
    const id = form.dataset.id;
    const { error } = id
        ? await supabase.from('blog_posts').update(payload).eq('id', id)
        : await supabase.from('blog_posts').insert(payload);
    if (error) {
        alert('Kaydetme başarısız: ' + error.message);
        return;
    }
    closeModalOverlay(form);
    loadBlog();
}

async function loadBlog() {
    const { body, head } = tableRefs('blogTableBody');
    const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    renderTable(body, head, [
        { label: 'Başlık', render: p => p.title },
        { label: 'Kategori', render: p => p.category },
        { label: 'Yazar', render: p => p.author },
        { label: 'Tarih', render: p => p.published_at },
        { label: '', render: p => `<button type="button" class="admin-action-btn" data-edit="${p.id}">Düzenle</button> <button type="button" class="admin-action-btn" data-delete="${p.id}">Sil</button>` },
    ], data, 'Henüz yazı yok.');

    body.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openBlogModal(data.find(p => p.id === btn.dataset.edit))));
    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteRecord('blog_posts', btn.dataset.delete, loadBlog, 'Bu yazıyı silmek istediğinizden emin misiniz?')));
}

document.getElementById('addBlogBtn').addEventListener('click', () => openBlogModal(null));

// ==================== Mesajlar ====================
async function loadMessages() {
    const { body, head } = tableRefs('messagesTableBody');
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    renderTable(body, head, [
        { label: 'Tarih', render: m => new Date(m.created_at).toLocaleString('tr-TR') },
        { label: 'Ad Soyad', render: m => m.name },
        { label: 'E-Posta', render: m => m.email },
        { label: 'Telefon', render: m => m.phone ?? '' },
        { label: 'Konu', render: m => m.subject ?? '' },
        { label: 'Mesaj', wrap: true, render: m => m.message },
        { label: '', render: m => `<button type="button" class="admin-action-btn" data-delete="${m.id}">Sil</button>` },
    ], data, 'Henüz mesaj yok.');

    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteRecord('contact_messages', btn.dataset.delete, loadMessages, 'Bu mesajı silmek istediğinizden emin misiniz?')));
}

// ==================== Rezervasyonlar ====================
async function loadBookings() {
    const { body, head } = tableRefs('bookingsTableBody');
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    renderTable(body, head, [
        { label: 'Tarih', render: b => new Date(b.created_at).toLocaleString('tr-TR') },
        { label: 'Tur', render: b => b.tour_title },
        { label: 'Ad Soyad', render: b => b.name },
        { label: 'E-Posta', render: b => b.email },
        { label: 'Telefon', render: b => b.phone },
        { label: 'Tercih Tarih', render: b => b.preferred_date ?? '' },
        { label: 'Kişi', render: b => b.people_count },
        {
            label: 'Durum', render: b => `
            <select data-status="${b.id}">
                <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Beklemede</option>
                <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Onaylandı</option>
                <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>İptal</option>
            </select>`,
        },
    ], data, 'Henüz rezervasyon talebi yok.');

    body.querySelectorAll('[data-status]').forEach(sel => sel.addEventListener('change', async () => {
        const { error } = await supabase.from('bookings').update({ status: sel.value }).eq('id', sel.dataset.status);
        if (error) alert('Güncelleme başarısız: ' + error.message);
    }));
}

// ==================== Newsletter ====================
let newsletterData = [];

async function loadNewsletter() {
    const { body, head } = tableRefs('newsletterTableBody');
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    newsletterData = data ?? [];
    renderTable(body, head, [
        { label: 'E-Posta', render: s => s.email },
        { label: 'Kaynak', render: s => s.source ?? '' },
        { label: 'Tarih', render: s => new Date(s.created_at).toLocaleString('tr-TR') },
        { label: '', render: s => `<button type="button" class="admin-action-btn" data-delete="${s.id}">Sil</button>` },
    ], newsletterData, 'Henüz abone yok.');

    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteRecord('newsletter_subscribers', btn.dataset.delete, loadNewsletter, 'Bu aboneyi silmek istediğinizden emin misiniz?')));
}

document.getElementById('exportNewsletterBtn').addEventListener('click', () => {
    const rows = [['email', 'source', 'created_at'], ...newsletterData.map(s => [s.email, s.source ?? '', s.created_at])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-aboneleri.csv';
    a.click();
    URL.revokeObjectURL(url);
});

// ==================== API Anahtarları ====================
function generateApiKey() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `ttk_live_${hex}`;
}

async function loadApiKeys() {
    const { body, head } = tableRefs('apikeysTableBody');
    const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    if (error) { body.innerHTML = `<tr><td class="admin-empty">${error.message}</td></tr>`; return; }
    renderTable(body, head, [
        { label: 'Acente', render: k => k.agency_name },
        { label: 'E-Posta', render: k => k.contact_email ?? '' },
        { label: 'Anahtar', render: k => `<span class="admin-key-value">${k.key}</span>` },
        { label: 'Durum', render: k => `<span class="admin-status ${k.is_active ? 'admin-status-active' : 'admin-status-inactive'}">${k.is_active ? 'Aktif' : 'Pasif'}</span>` },
        { label: 'Son Kullanım', render: k => k.last_used_at ? new Date(k.last_used_at).toLocaleString('tr-TR') : '—' },
        { label: '', render: k => `<button type="button" class="admin-action-btn" data-toggle="${k.id}" data-active="${k.is_active}">${k.is_active ? 'Devre Dışı Bırak' : 'Etkinleştir'}</button>` },
    ], data, 'Henüz API anahtarı yok.');

    body.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', async () => {
        const nextActive = btn.dataset.active !== 'true';
        const { error } = await supabase.from('api_keys').update({ is_active: nextActive }).eq('id', btn.dataset.toggle);
        if (error) { alert('Güncelleme başarısız: ' + error.message); return; }
        loadApiKeys();
    }));
}

document.getElementById('addApiKeyBtn').addEventListener('click', async () => {
    const agencyName = prompt('Acente adı:');
    if (!agencyName) return;
    const contactEmail = prompt('İletişim e-postası (opsiyonel):') || null;
    const key = generateApiKey();
    const { error } = await supabase.from('api_keys').insert({ agency_name: agencyName, contact_email: contactEmail, key });
    if (error) { alert('Oluşturma başarısız: ' + error.message); return; }
    alert(`Yeni anahtar oluşturuldu:\n\n${key}\n\nBu anahtarı acenteyle paylaşın — panelden istediğiniz zaman tekrar görüntüleyebilirsiniz.`);
    loadApiKeys();
});

// ==================== Başlatma ====================
function loadAllTabs() {
    loadTours();
    loadBlog();
    loadMessages();
    loadBookings();
    loadNewsletter();
    loadApiKeys();
}

async function init() {
    supabase = await getSupabaseClient();
    if (!supabase) {
        showError('Supabase yapılandırılmadı. js/supabase-client.js dosyasını kontrol edin.');
        return;
    }
    supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);
}

init();
