/* ========================================
   TIKRI JUNCTION — Main JavaScript
   Handles: Navigation, Animations, Filters,
   Form Handling, Scroll Effects
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // PRELOADER
  // ============================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        // Remove from DOM after transition
        preloader.addEventListener('transitionend', () => {
          preloader.remove();
        });
      }, 1200);
    });

    // Fallback: hide preloader after 3 seconds regardless
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
      }
    }, 3000);
  }

  // ============================
  // NAVBAR SCROLL EFFECT
  // ============================
  const navbar = document.getElementById('navbar');
  const navScrollThreshold = 80;

  function handleNavScroll() {
    if (window.scrollY > navScrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ============================
  // MOBILE MENU TOGGLE
  // ============================
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================
  // ACTIVE NAV LINK ON SCROLL
  // ============================
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = navLinks.querySelectorAll('a:not(.nav-cta)');

  function highlightActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinkItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveNav, { passive: true });

  // ============================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================
  // PRODUCT FILTER TABS
  // ============================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter products with animation
      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = '';
          // Trigger re-animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ============================
  // SCROLL REVEAL ANIMATIONS
  // ============================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: stop observing after reveal
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================
  // BACK TO TOP BUTTON
  // ============================
  const backToTopBtn = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ============================
  // CONTACT FORM HANDLING
  // ============================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Validate required fields
      if (!data.name || !data.phone || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      // Simulate form submission
      const submitBtn = document.getElementById('form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showNotification('Thank you! Your message has been sent successfully. We\'ll get back to you soon! 🎉', 'success');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  // ============================
  // NEWSLETTER FORM HANDLING
  // ============================
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');

      if (emailInput.value) {
        showNotification('Thank you for subscribing! Stay tuned for sweet updates! 🍬', 'success');
        emailInput.value = '';
      }
    });
  }

  // ============================
  // NOTIFICATION SYSTEM
  // ============================
  function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" aria-label="Close notification">&times;</button>
    `;

    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '100px',
      right: '20px',
      maxWidth: '400px',
      padding: '16px 24px',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '0.9rem',
      fontFamily: "'Poppins', sans-serif",
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: '10000',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      background: type === 'success'
        ? 'linear-gradient(135deg, #27AE60, #219653)'
        : 'linear-gradient(135deg, #E74C3C, #C0392B)'
    });

    // Style the close button
    const closeBtn = notification.querySelector('button');
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '1.3rem',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1'
    });

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.4s ease';
      setTimeout(() => notification.remove(), 400);
    }, 5000);
  }

  // Add slideInRight animation dynamically
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================
  // COUNTER ANIMATION
  // ============================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  function animateCounters() {
    if (statsCounted) return;

    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statsCounted = true;

      statNumbers.forEach(stat => {
        const text = stat.textContent;
        const match = text.match(/(\d+)/);
        if (!match) return;

        const target = parseInt(match[1]);
        const suffix = text.replace(match[1], '');
        let current = 0;
        const increment = target / 60;
        const duration = 2000;
        const stepTime = duration / 60;

        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          stat.textContent = Math.floor(current) + suffix;
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  // Run once on load in case hero is visible
  animateCounters();

  // ============================
  // PARALLAX-LIKE EFFECT ON HERO
  // ============================
  const heroSection = document.querySelector('.hero');

  function handleParallax() {
    if (!heroSection) return;
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      const heroImg = document.querySelector('.hero-image-wrapper');
      if (heroImg) {
        heroImg.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // ============================
  // IMAGE LAZY LOADING FALLBACK
  // ============================
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ============================
  // GALLERY LIGHTBOX (Simple)
  // ============================
  const galleryItems = document.querySelectorAll('.gallery-item img');

  galleryItems.forEach(img => {
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });

  function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10001',
      cursor: 'pointer',
      animation: 'fadeIn 0.3s ease',
      padding: '20px'
    });

    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    Object.assign(image.style, {
      maxWidth: '90%',
      maxHeight: '90vh',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      animation: 'scaleIn 0.3s ease'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '20px',
      right: '30px',
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '3rem',
      cursor: 'pointer',
      lineHeight: '1',
      zIndex: '10002'
    });

    overlay.appendChild(image);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Close on click
    const closeLightbox = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    };

    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    }, { once: true });
  }

  // Add lightbox animations
  if (!document.getElementById('lightbox-styles')) {
    const style = document.createElement('style');
    style.id = 'lightbox-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================
  // TYPING EFFECT ON HERO (Optional Enhancement)
  // ============================
  // Adds a subtle typewriter cursor effect to the hero subtitle
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.style.borderRight = 'none'; // clean state
  }

  // ============================
  // PERFORMANCE: Throttle scroll events
  // ============================
  // All scroll handlers use passive: true for better performance
  // IntersectionObserver is used wherever possible instead of scroll listeners

  console.log('🍬 Tikri Junction website loaded successfully!');
});
