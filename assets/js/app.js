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

  // Mobile Menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

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
            <a class="project-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
              <div class="project-top">
                <span class="project-cat">${p.category}</span>
                <span class="project-ext"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
              </div>
              <div>
                <div class="project-domain">${p.domain}</div>
                <div class="project-url">${p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
              </div>
            </a>`
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
})();
