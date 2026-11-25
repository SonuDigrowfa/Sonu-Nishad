(function () {
  // Theme Toggle
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('sn-theme') || 'dark';
  if (savedTheme === 'light') root.setAttribute('data-theme', 'light');

  function updateThemeIcon() {
    if (!themeBtn) return;
    const isLight = root.getAttribute('data-theme') === 'light';
    themeBtn.innerHTML = isLight
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }

  updateThemeIcon();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (next === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      localStorage.setItem('sn-theme', next);
      updateThemeIcon();
    });
  }

  // Mobile Menu & Scroll Effects
  const navbar = document.querySelector('.navbar');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  function setMenuOpen(open) {
    if (!navLinks || !menuBtn) return;
    navLinks.classList.toggle('open', open);
    menuBtn.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuOpen(!navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenuOpen(false);
      }
    });
  }

  // Scroll-spy & Navbar Shadow
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 12);
    if (!sections.length || !navAnchors.length) return;
    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 130) {
        current = sec.id;
      }
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Floating Chat Popover
  const chatFab = document.getElementById('chat-fab');
  const chatPopover = document.getElementById('chat-popover');
  if (chatFab && chatPopover) {
    chatFab.addEventListener('click', () => {
      chatPopover.classList.toggle('open');
    });
  }

  // Projects Renderer (shared between / and /project)
  const grid = document.getElementById('projects-grid');
  const filterWrap = document.getElementById('filter-tabs');
  const searchInput = document.getElementById('project-search');
  const toggleAllBtn = document.getElementById('toggle-all-projects');

  if (grid && Array.isArray(window.PORTFOLIO_PROJECTS)) {
    const projects = window.PORTFOLIO_PROJECTS;
    const showAllByDefault = grid.dataset.showAll === 'true';
    let activeCat = 'All';
    let searchTerm = '';
    let expanded = showAllByDefault;

    const categories = ['All', ...new Set(projects.map((p) => p.category))];

    if (filterWrap) {
      filterWrap.innerHTML = categories
        .map((cat) => {
          const count = cat === 'All'
            ? projects.length
            : projects.filter((p) => p.category === cat).length;
          return `<button class="filter-btn${cat === 'All' ? ' active' : ''}" data-cat="${cat}">${cat} (${count})</button>`;
        })
        .join('');

      filterWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        activeCat = btn.dataset.cat;
        filterWrap.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjects();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderProjects();
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        expanded = !expanded;
        renderProjects();
      });
    }

    function renderProjects() {
      const filtered = projects.filter((p) => {
        const matchCat = activeCat === 'All' || p.category === activeCat;
        const matchSearch =
          !searchTerm ||
          p.domain.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm);
        return matchCat && matchSearch;
      });

      const isFiltered = activeCat !== 'All' || searchTerm.length > 0;
      const visible = expanded || isFiltered ? filtered : filtered.slice(0, 12);

      if (visible.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No matching projects found for "${searchTerm}".</div>`;
      } else {
        grid.innerHTML = visible
          .map(
            (p) => `
            <button type="button" class="project-card" data-domain="${p.domain}" data-url="${p.url}" data-cat="${p.category}" style="text-align: left; color: inherit; font: inherit; cursor: pointer;">
              <div class="project-top" style="width: 100%;">
                <span class="project-cat">${p.category}</span>
                <span class="project-ext"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
              </div>
              <div style="width: 100%;">
                <div class="project-domain">${p.domain}</div>
                <div class="project-url">Click to preview &amp; visit</div>
              </div>
            </button>`
          )
          .join('');
      }

      if (toggleAllBtn) {
        if (isFiltered || filtered.length <= 12) {
          toggleAllBtn.style.display = 'none';
        } else {
          toggleAllBtn.style.display = 'inline-flex';
          toggleAllBtn.innerHTML = expanded
            ? '<i class="fa-solid fa-chevron-up"></i> Show Fewer Projects'
            : `<i class="fa-solid fa-layer-group"></i> View All ${filtered.length} Projects`;
        }
      }
    }

    renderProjects();
  }

  // Project Quick-Preview Modal
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCat = document.getElementById('modal-cat');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalLink = document.getElementById('modal-visit-link');

  if (grid && modal) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      modalCat.textContent = card.dataset.cat;
      modalTitle.textContent = card.dataset.domain;
      modalDesc.textContent = `Live production ${card.dataset.cat} website engineered and delivered for ${card.dataset.domain}.`;
      modalLink.href = card.dataset.url;
      modal.classList.add('open');
    });

    const closeModal = () => modal.classList.remove('open');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Click-to-Expand Experience Cards
  document.querySelectorAll('.exp-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });

  // Interactive Tabs (About & Credentials)
  document.querySelectorAll('[data-tab-group]').forEach((group) => {
    const groupName = group.dataset.tabGroup;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.ui-tab-btn');
      if (!btn) return;
      const targetId = btn.dataset.tabTarget;
      group.querySelectorAll('.ui-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[data-tab-panel="${groupName}"]`).forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetId);
      });
    });
  });

  // Contact Form -> WhatsApp / Mailto
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('[name="name"]').value.trim();
      const email = contactForm.querySelector('[name="email"]').value.trim();
      const subject = contactForm.querySelector('[name="subject"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();

      const text = `Hi Sonu, I'm ${name} (${email}).\nSubject: ${subject}\n\n${message}`;
      const waUrl = `https://wa.me/919716500069?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
  // Scroll-Reveal Animation
  const revealTargets = document.querySelectorAll('section .section-header, section .card, section .exp-card');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
