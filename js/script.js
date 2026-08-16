// ==================== Hamburger Menu ==================== 
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.getElementById('navbarMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    const navLinks = navbarMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// ==================== Newsletter & Contact Forms ====================
// js/app.js (Supabase entegrasyonu) bu formları yönetir.

// ==================== Smooth Scroll ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==================== Page Fade In Animation ==================== 
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ==================== Navbar Active Link Update ==================== 
function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

updateActiveLink();

// ==================== Lazy Loading Images ==================== 
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ==================== Scroll Reveal Animation ==================== 
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.tour-card, .blog-card, .feature-box, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ==================== Price Filter Range ==================== 
const priceRange = document.querySelector('input[type="range"]');
if (priceRange) {
    priceRange.addEventListener('input', (e) => {
        const value = e.target.value;
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) {
            priceDisplay.textContent = `1000 TL - ${value} TL`;
        }
    });
}

// ==================== Favorite Button Toggle ==================== 
const favoriteBtn = document.querySelector('.favorite-btn');
if (favoriteBtn) {
    let isFavorited = false;
    favoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isFavorited = !isFavorited;
        favoriteBtn.textContent = isFavorited ? '❤️' : '♡';
        favoriteBtn.style.color = isFavorited ? 'red' : 'black';
    });
}

// ==================== Contact Button Scroll ==================== 
const contactBtns = document.querySelectorAll('.contact-btn');
contactBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const contactSection = document.querySelector('.contact-info');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = 'iletisim.html';
        }
    });
});

// ==================== Statistics Counter Animation ==================== 
const stats = document.querySelectorAll('.stat-box h3');

const countUp = (element, target) => {
    let count = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(count) + '+';
        }
    }, 50);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const h3 = entry.target.querySelector('h3');
            if (h3 && !h3.classList.contains('counted')) {
                const text = h3.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                countUp(h3, number);
                h3.classList.add('counted');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-box').forEach(box => statsObserver.observe(box));

// ==================== Tooltip Functionality ==================== 
const tooltips = document.querySelectorAll('[data-tooltip]');
tooltips.forEach(el => {
    el.addEventListener('mouseenter', function() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.top - 35) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        
        this.addEventListener('mouseleave', () => tooltip.remove());
    });
});

// ==================== Dynamic Year in Footer ==================== 
const currentYear = new Date().getFullYear();
const footerBottoms = document.querySelectorAll('.footer-bottom p');
footerBottoms.forEach(p => {
    if (p.textContent.includes('2024')) {
        p.textContent = p.textContent.replace('2024', currentYear.toString());
    }
});

// ==================== Form Input Focus Animation ==================== 
const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// ==================== Add Styles for Animations ==================== 
const style = document.createElement('style');
style.textContent = `
    .tooltip {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 0.85em;
        white-space: nowrap;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .form-group {
        transition: transform 0.2s ease;
    }
    
    body {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// ==================== Page Transition ==================== 
window.addEventListener('pageshow', () => {
    document.body.style.opacity = '1';
});

// ==================== Mobile Menu Enhancement ==================== 
const navbarBrand = document.querySelector('.navbar-brand');
if (navbarBrand) {
    navbarBrand.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// ==================== Add Navigation Active Styling ==================== 
function setActiveNav() {
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.nav-link');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentLocation || 
            (currentLocation === '/' && item.getAttribute('href') === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

setActiveNav();

console.log('Türkiye Turları Website Loaded Successfully!');
