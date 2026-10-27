/* ==========================================================================
   Tanvir Hasan — Portfolio
   Interactive behaviour layer
   1.  Setup & helpers
   2.  Footer year
   3.  Mobile navigation
   4.  Header state, scroll progress & back-to-top
   5.  Active nav highlighting
   6.  Scroll reveal animations
   7.  Avatar fallback chain
   8.  Resume link safety check
   9.  Projects data & modal
   10. Contact form validation
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Setup & helpers
     ------------------------------------------------------------------------ */
  const root = document.documentElement;
  root.classList.add('js'); // enables reveal animations defined in CSS

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const toastEl = $('#toast');
  const toastMessageEl = $('#toast-message');
  let toastTimer = null;

  /** Show a small status toast at the bottom of the screen. */
  function showToast(message, variant = 'success') {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.toggle('is-error', variant === 'error');
    toastEl.hidden = false;
    // Restart the entrance animation
    toastEl.style.animation = 'none';
    void toastEl.offsetWidth;
    toastEl.style.animation = '';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 4200);
  }

  /* ------------------------------------------------------------------------
     2. Footer year
     ------------------------------------------------------------------------ */
  const yearEl = $('#current-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------------------ */
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const menuIcon = $('#menu-icon');

  function setMobileMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (menuIcon) menuIcon.setAttribute('href', open ? '#icon-close' : '#icon-menu');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      setMobileMenu(mobileMenu.hidden);
    });

    // Close the drawer whenever a link inside it is chosen
    $$('.mobile-link, a[href^="#"]', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    // Reset the drawer when switching to desktop widths
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = (event) => {
      if (event.matches) setMobileMenu(false);
    };
    desktopQuery.addEventListener
      ? desktopQuery.addEventListener('change', handleResize)
      : desktopQuery.addListener(handleResize);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.hidden) setMobileMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     4. Header state, scroll progress & back-to-top
     ------------------------------------------------------------------------ */
  const header = $('#site-header');
  const progressBar = $('#scroll-progress');
  const backToTop = $('#back-to-top');
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY || root.scrollTop;

    // Frosted header intensifies after scrolling
    if (header) header.classList.toggle('is-scrolled', scrollY > 12);

    // Reading progress bar
    if (progressBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }

    // Back to top visibility
    if (backToTop) backToTop.hidden = scrollY < 550;

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     5. Active nav highlighting
     ------------------------------------------------------------------------ */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link, .mobile-link');

  function highlight(sectionId) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${sectionId}`);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) highlight(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ------------------------------------------------------------------------
     6. Scroll reveal animations
     ------------------------------------------------------------------------ */
  const revealItems = $$('.reveal');

  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealItems.forEach((item, index) => {
      // Light stagger for elements that enter together (e.g. card grids)
      item.style.transitionDelay = `${(index % 3) * 90}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------------
     7. Avatar fallback chain
     assets/images/profile.png → images/portfolio.jpg → generated initials art
     ------------------------------------------------------------------------ */
  const heroPhoto = $('#hero-photo');

  function buildInitialsAvatar(initials) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">` +
      `<defs>` +
      `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="#0b1220"/><stop offset="100%" stop-color="#160f2b"/>` +
      `</linearGradient>` +
      `<linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#a78bfa"/>` +
      `</linearGradient>` +
      `</defs>` +
      `<rect width="600" height="600" fill="url(#bg)"/>` +
      `<circle cx="300" cy="240" r="118" fill="url(#fg)" opacity="0.9"/>` +
      `<path d="M120 600c0-99.4 80.6-180 180-180s180 80.6 180 180z" fill="url(#fg)" opacity="0.75"/>` +
      `<text x="300" y="288" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="700" fill="#0b1220">${initials}</text>` +
      `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  if (heroPhoto) {
    const fallbacks = (heroPhoto.dataset.fallbacks || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    fallbacks.push(buildInitialsAvatar('TH'));
    let attempt = 0;

    function tryNextFallback() {
      if (attempt >= fallbacks.length) return false;
      heroPhoto.src = fallbacks[attempt++];
      return true;
    }

    heroPhoto.addEventListener('error', function handlePhotoError() {
      if (!tryNextFallback()) heroPhoto.removeEventListener('error', handlePhotoError);
    });

    // The 404 may already have resolved before this listener was attached.
    if (heroPhoto.complete && heroPhoto.naturalWidth === 0) {
      tryNextFallback();
    }
  }

  /* ------------------------------------------------------------------------
     8. Resume link safety check
     Downloads ./assets/resume.pdf; if it is missing on a hosted build we warn
     the user instead of letting them land on a broken 404 tab.
     ------------------------------------------------------------------------ */
  $$('[data-resume]').forEach((link) => {
    link.addEventListener('click', async (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('mailto:')) return;

      try {
        const response = await fetch(href, { method: 'HEAD' });
        if (!response.ok) throw new Error('missing');
      } catch (error) {
        // fetch is blocked on the file:// protocol — allow the default action there.
        if (window.location.protocol !== 'file:') {
          event.preventDefault();
          showToast('Resume file not found. Please add it at assets/resume.pdf.', 'error');
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     9. Projects data & modal
     ------------------------------------------------------------------------ */
  const PROJECTS = [
    {
      id: 1,
      title: 'BazarDor',
      subtitle: 'Market Price Tracking App',
      image: './project-1/Screenshot 2026-10-27 104603.png',
      alt: 'BazarDor market price tracking app screenshot',
      tech: ['Next.js', 'Better Auth', 'MongoDB Atlas', 'Tailwind CSS', 'Vercel'],
      description:
        'A comprehensive market price tracking web application featuring Bengali numeral dynamic sorting, category filters, live ticker marquee, and user authentication.',
      highlights: [
        'Dynamic sorting engine that correctly orders prices written in Bengali numerals (০–৯)',
        'Category filters with instant client-side re-rendering and an animated live ticker marquee',
        'Secure session-based authentication powered by Better Auth with MongoDB Atlas persistence',
        'Fully responsive, SEO-friendly Next.js App Router build deployed on Vercel'
      ],
      challenges:
        'Managing complex session state with Better Auth and crafting custom sorting algorithms for Bengali numerals.',
      future:
        'Implementing real-time price trend graphs and vendor comparison models.',
      live: 'https://bazardorapp.netlify.app/',
      repo: 'https://github.com/hasantanvir357/seventh-assignment',
      repoLabel: 'Client Repository'
    },
    {
      id: 2,
      title: 'Product Cart & E-Commerce Showcase',
      subtitle: 'Dynamic Shopping Cart System',
      image: './project-2/Screenshot 2026-10-27 105735.png',
      alt: 'Product Cart and E-Commerce Showcase screenshot',
      tech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Netlify'],
      description:
        'A dynamic e-commerce product showcase and shopping cart system with real-time price calculation, state persistence, and responsive UI.',
      highlights: [
        'Product catalogue rendered from typed data with category and price sorting controls',
        'Real-time cart math (quantities, subtotals and grand total) driven by reducer-based state',
        'Cart state persisted to localStorage so it survives refreshes and browser restarts',
        'Blazing-fast Vite build with strict TypeScript and a fully responsive Tailwind layout'
      ],
      challenges:
        'Persisting cart state across browser sessions and optimizing quantity calculations to avoid extra re-renders.',
      future: 'Adding live payment gateway integration and user review options.',
      live: 'https://creative-taiyaki-fba2bf.netlify.app/',
      repo: 'https://github.com/hasantanvir357/fifth-assignment',
      repoLabel: 'Client Repository'
    },
    {
      id: 3,
      title: 'Fitness & Workout Planner',
      subtitle: 'Daily Workout Plan Manager',
      image: './project-3/Screenshot 2026-10-27 104317.png',
      alt: 'Fitness and Workout Planner screenshot',
      tech: ['Next.js', 'TypeScript', 'DaisyUI', 'Tailwind CSS', 'Vercel'],
      description:
        'An interactive daily workout plan manager featuring sorting controls, exercise filters, local storage state persistence, and responsive controls.',
      highlights: [
        'Daily plan builder with add / remove / reorder controls for every exercise',
        'Multi-criteria filters (muscle group, difficulty, equipment) with sorting controls',
        'Local storage persistence keeps the routine available between visits',
        'DaisyUI themed dark interface that stays crisp from mobile to widescreen'
      ],
      challenges:
        'Designing intuitive filter mechanisms and handling dynamic workout routine state efficiently.',
      future: 'Adding a daily calorie counter and interactive exercise timer.',
      live: 'https://assignment-6-delta-eight.vercel.app/',
      repo: 'https://github.com/hasantanvir357/assignment-6',
      repoLabel: 'Client Repository'
    }
  ];

  const modal = $('#project-modal');
  const modalContent = $('#modal-content');
  let lastFocusedElement = null;

  function renderProjectModal(project) {
    const techBadges = project.tech.map((item) => `<span class="tech-badge">${item}</span>`).join('');
    const highlights = project.highlights.map((item) => `<li>${item}</li>`).join('');

    modalContent.innerHTML = `
      <div class="modal-hero">
        <img src="${project.image}" alt="${project.alt}" loading="lazy" />
      </div>
      <div class="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="modal-title" class="modal-title">${project.title}</h3>
          <p class="modal-subtitle">${project.subtitle}</p>
        </div>
        <span class="status-badge">Case Study</span>
      </div>

      <div class="mt-4 flex flex-wrap gap-1.5">${techBadges}</div>

      <div class="modal-block">
        <h4><svg class="h-4 w-4"><use href="#icon-sparkle"></use></svg> Overview</h4>
        <p>${project.description}</p>
      </div>

      <div class="modal-block">
        <h4><svg class="h-4 w-4"><use href="#icon-check"></use></svg> Key Features</h4>
        <ul class="modal-list">${highlights}</ul>
      </div>

      <div class="modal-block">
        <h4><svg class="h-4 w-4"><use href="#icon-lightbulb"></use></svg> Challenges Faced</h4>
        <p>${project.challenges}</p>
      </div>

      <div class="modal-block">
        <h4><svg class="h-4 w-4"><use href="#icon-clock"></use></svg> Future Plans &amp; Improvements</h4>
        <p>${project.future}</p>
      </div>

      <div class="modal-actions">
        <a href="${project.live}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <svg class="h-5 w-5"><use href="#icon-external"></use></svg>
          Live Demo
        </a>
        <a href="${project.repo}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
          <svg class="h-5 w-5"><use href="#icon-github"></use></svg>
          ${project.repoLabel}
        </a>
      </div>
    `;
  }

  function openModal(projectId) {
    if (!modal || !modalContent) return;
    const project = PROJECTS.find((item) => item.id === Number(projectId));
    if (!project) return;

    lastFocusedElement = document.activeElement;
    renderProjectModal(project);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeButton = $('.modal-close', modal);
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalContent) modalContent.innerHTML = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  $$('[data-project]').forEach((button) => {
    button.addEventListener('click', () => openModal(button.dataset.project));
  });

  if (modal) {
    // Close on backdrop click, close button or Escape
    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-modal-close]')) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (modal.hidden) return;

      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      // Basic focus trap: keep Tab navigation inside the dialog
      if (event.key === 'Tab') {
        const focusables = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal).filter(
          (el) => el.offsetParent !== null
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. Contact form validation
     ------------------------------------------------------------------------ */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(input, message) {
    const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(input) {
    const value = input.value.trim();

    if (!value) {
      setFieldError(input, 'This field is required.');
      return false;
    }
    if (input.type === 'email' && !EMAIL_PATTERN.test(value)) {
      setFieldError(input, 'Please enter a valid email address.');
      return false;
    }
    if (input.id === 'cf-message' && value.length < 10) {
      setFieldError(input, 'Message should be at least 10 characters long.');
      return false;
    }

    setFieldError(input, '');
    return true;
  }

  if (contactForm) {
    const fields = ['cf-name', 'cf-email', 'cf-message'].map((id) => document.getElementById(id)).filter(Boolean);

    fields.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) validateField(input);
      });
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const results = fields.map(validateField);
      const firstInvalid = fields.find((input) => input.classList.contains('is-invalid'));

      if (results.includes(false)) {
        if (formStatus) formStatus.textContent = 'Please fix the highlighted fields and try again.';
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (formStatus) formStatus.textContent = '';

      // No backend on a static site — hand the message to the visitor's mail client.
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

      contactForm.reset();
      fields.forEach((input) => setFieldError(input, ''));

      showToast(`Thanks ${name}! Opening your email app to send the message.`);
      window.setTimeout(() => {
        window.location.href = `mailto:hasantanvir357@gmail.com?subject=${subject}&body=${body}`;
      }, 400);
    });
  }
})();
