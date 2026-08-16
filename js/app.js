// ==================== Türkiye Turları — Supabase Entegrasyonu ====================
import {
    isSupabaseConfigured,
    fetchTours,
    fetchBlogPosts,
    submitContactMessage,
    subscribeNewsletter,
    createBooking,
} from './supabase-client.js';

const priceFormatter = new Intl.NumberFormat('tr-TR');
const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

function formatPrice(price) {
    return `${priceFormatter.format(price)} TL`;
}

function formatDate(isoDate) {
    return dateFormatter.format(new Date(isoDate + 'T00:00:00'));
}

function notConfiguredMessage(label) {
    return `<p class="db-status">${label} yükleniyor... (Supabase henüz yapılandırılmadıysa <code>js/supabase-client.js</code> içindeki URL/anon key'i doldurun.)</p>`;
}

function errorMessage(text) {
    return `<p class="db-status">${text}</p>`;
}

// ==================== Tour Cards ====================
function renderTourCard(tour, { detailed = false } = {}) {
    const highlights = detailed && tour.highlights?.length
        ? `<div class="tour-highlights">${tour.highlights.map(h => `<span>${h}</span>`).join('')}</div>`
        : '';
    const rating = detailed
        ? `<div class="tour-rating">⭐ ${tour.rating} (${tour.review_count} yorum)</div>`
        : '';
    return `
        <div class="tour-card">
            <div class="tour-image" style="background-image: url('${tour.image_url}');">
                <div class="tour-badge">${tour.badge ?? ''}</div>
                ${rating}
            </div>
            <div class="tour-content">
                <h3>${tour.title}</h3>
                <p>${tour.description}</p>
                ${highlights}
                <div class="tour-info">
                    <span class="duration">⏱ ${tour.duration}</span>
                    <span class="price">${formatPrice(tour.price)}</span>
                </div>
                <button type="button" class="btn btn-outline" data-book-tour="${tour.id}">Rezervasyon Talebi →</button>
            </div>
        </div>`;
}

function attachTourBookingHandlers(container, tours) {
    container.querySelectorAll('[data-book-tour]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tour = tours.find(t => t.id === btn.dataset.bookTour);
            if (tour) openBookingModal(tour);
        });
    });
}

async function initTours({ featuredOnly = false, detailed = false } = {}) {
    const grid = document.getElementById('toursGrid');
    if (!grid) return;

    if (!isSupabaseConfigured()) {
        grid.innerHTML = notConfiguredMessage('Turlar');
        return;
    }

    const tours = await fetchTours({ featuredOnly });
    if (tours === null) {
        grid.innerHTML = errorMessage('Turlar yüklenirken bir sorun oluştu, lütfen daha sonra tekrar deneyin.');
        return;
    }
    if (tours.length === 0) {
        grid.innerHTML = errorMessage('Henüz eklenmiş bir tur yok.');
        return;
    }

    grid.innerHTML = tours.map(t => renderTourCard(t, { detailed })).join('');
    attachTourBookingHandlers(grid, tours);
    initTourFilters(tours, detailed);
}

// ==================== Turlar Sayfası Filtreleri ====================
function initTourFilters(allTours, detailed) {
    const filterBtn = document.querySelector('.filters .btn-secondary');
    if (!filterBtn) return;

    const [locationSelect, durationSelect] = document.querySelectorAll('.filters select');
    const priceRange = document.querySelector('.filters input[type="range"]');
    const grid = document.getElementById('toursGrid');

    filterBtn.addEventListener('click', () => {
        let filtered = allTours;

        const location = locationSelect?.value;
        if (location && location !== 'Tüm Konumlar') {
            filtered = filtered.filter(t => t.location === location);
        }

        const duration = durationSelect?.value;
        if (duration && duration !== 'Tüm Süreler') {
            filtered = filtered.filter(t => {
                const nights = parseInt(t.duration, 10);
                if (duration === '1-2 Gece') return nights <= 2;
                if (duration === '3-4 Gece') return nights >= 3 && nights <= 4;
                if (duration === '5+ Gece') return nights >= 5;
                return true;
            });
        }

        if (priceRange) {
            filtered = filtered.filter(t => t.price <= Number(priceRange.value));
        }

        grid.innerHTML = filtered.length
            ? filtered.map(t => renderTourCard(t, { detailed })).join('')
            : errorMessage('Bu kriterlere uygun tur bulunamadı.');
        attachTourBookingHandlers(grid, filtered);
    });
}

// ==================== Blog Cards ====================
function renderBlogCard(post) {
    return `
        <article class="blog-card">
            <div class="blog-image" style="background-image: url('${post.image_url}');">
                <span class="blog-date">${formatDate(post.published_at)}</span>
            </div>
            <div class="blog-content">
                <span class="blog-category">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-footer">
                    <span class="blog-author">${post.author}</span>
                    <a href="#" class="read-more">Devamını Oku →</a>
                </div>
            </div>
        </article>`;
}

async function initBlog() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    if (!isSupabaseConfigured()) {
        grid.innerHTML = notConfiguredMessage();
        return;
    }

    const posts = await fetchBlogPosts();
    if (posts === null) {
        grid.innerHTML = errorMessage('Blog yazıları yüklenirken bir sorun oluştu, lütfen daha sonra tekrar deneyin.');
        return;
    }
    grid.innerHTML = posts.length
        ? posts.map(renderBlogCard).join('')
        : errorMessage('Henüz yayınlanmış bir yazı yok.');
}

// ==================== İletişim Formu ====================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const name = form.querySelector('#contactName').value;
        const payload = {
            name,
            email: form.querySelector('#contactEmail').value,
            phone: form.querySelector('#contactPhone').value,
            subject: form.querySelector('#contactSubject').value,
            tour_interest: form.querySelector('#contactTourInterest').value,
            message: form.querySelector('#contactMessage').value,
        };

        submitBtn.disabled = true;
        try {
            await submitContactMessage(payload);
            alert(`Teşekkürler ${name}! Mesajınız başarıyla gönderildi. En kısa sürede yanıt vereceğiz.`);
            form.reset();
        } catch (err) {
            console.error(err);
            alert('Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// ==================== Newsletter Formları ====================
function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const email = input.value;
            const submitBtn = form.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            try {
                await subscribeNewsletter(email, document.body.dataset.page ?? 'site');
                alert(`${email} e-posta adresiniz başarıyla kaydedildi!`);
                form.reset();
            } catch (err) {
                console.error(err);
                alert('Abonelik sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
            } finally {
                submitBtn.disabled = false;
            }
        });
    });
}

// ==================== Rezervasyon Modalı ====================
let bookingModal;

function ensureBookingModal() {
    if (bookingModal) return bookingModal;

    const overlay = document.createElement('div');
    overlay.className = 'booking-modal-overlay';
    overlay.innerHTML = `
        <div class="booking-modal">
            <button type="button" class="booking-modal-close" aria-label="Kapat">✕</button>
            <h3>Rezervasyon Talebi</h3>
            <p class="booking-modal-tour"></p>
            <form id="bookingForm">
                <div class="form-group">
                    <label>Ad Soyad *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>E-Posta *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Telefon *</label>
                    <input type="tel" name="phone" required>
                </div>
                <div class="form-group">
                    <label>Tercih Edilen Tarih</label>
                    <input type="date" name="preferred_date">
                </div>
                <div class="form-group">
                    <label>Kişi Sayısı</label>
                    <input type="number" name="people_count" min="1" value="1">
                </div>
                <div class="form-group full-width">
                    <label>Not (Opsiyonel)</label>
                    <textarea name="notes" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Talebi Gönder</button>
            </form>
        </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeBookingModal();
    });
    overlay.querySelector('.booking-modal-close').addEventListener('click', closeBookingModal);

    bookingModal = overlay;
    return overlay;
}

function closeBookingModal() {
    bookingModal?.classList.remove('open');
}

function openBookingModal(tour) {
    const overlay = ensureBookingModal();
    overlay.querySelector('.booking-modal-tour').textContent = `${tour.title} — ${formatPrice(tour.price)}`;
    const form = overlay.querySelector('#bookingForm');
    form.dataset.tourId = tour.id;
    form.dataset.tourTitle = tour.title;

    if (!form.dataset.bound) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const data = new FormData(form);
            const payload = {
                tour_id: form.dataset.tourId,
                tour_title: form.dataset.tourTitle,
                name: data.get('name'),
                email: data.get('email'),
                phone: data.get('phone'),
                preferred_date: data.get('preferred_date') || null,
                people_count: Number(data.get('people_count')) || 1,
                notes: data.get('notes'),
            };

            submitBtn.disabled = true;
            try {
                await createBooking(payload);
                alert('Rezervasyon talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.');
                form.reset();
                closeBookingModal();
            } catch (err) {
                console.error(err);
                alert('Talebiniz gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
            } finally {
                submitBtn.disabled = false;
            }
        });
        form.dataset.bound = 'true';
    }

    overlay.classList.add('open');
}

// ==================== Sayfa Başlatma ====================
const page = document.body.dataset.page;

if (page === 'home') initTours({ featuredOnly: true, detailed: false });
if (page === 'tours') initTours({ featuredOnly: false, detailed: true });
if (page === 'blog') initBlog();

initContactForm();
initNewsletterForms();
