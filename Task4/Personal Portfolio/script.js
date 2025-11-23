
document.addEventListener('DOMContentLoaded', () => {
 
  const projects = [
    {
      id: 'p1',
      title: 'Interactive Quiz App',
      description: 'Responsive JS quiz with scoring, progress, and localStorage support.',
      image: 'https://images.unsplash.com/photo-1526378721656-6f6a8f1b2d3d?q=80&w=1200&auto=format&fit=crop',
      tags: ['JavaScript','UI','Accessibility'],
      link: '#'
    },
    {
      id: 'p2',
      title: 'Weather Dashboard',
      description: 'Advanced weather app using Open-Meteo API and Chart.js for hourly charts.',
      image: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?q=80&w=1200&auto=format&fit=crop',
      tags: ['API','Charts','Responsive'],
      link: '#'
    },
    {
      id: 'p3',
      title: 'Dynamic Image Gallery',
      description: 'DOM-driven gallery with lightbox and local persistence.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      tags: ['DOM','UX','Animations'],
      link: '#'
    }
  ];

  
  const projectsGrid = document.getElementById('projectsGrid');
  const projectModal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalLinks = document.getElementById('modalLinks');
  const modalImageWrap = document.getElementById('modalImageWrap');
  const modalClose = document.getElementById('modalClose');

  const navToggle = document.getElementById('navToggle');
  const navList = document.querySelector('#primaryNav ul');
  const navAnchors = document.querySelectorAll('[data-nav]');

  const contactForm = document.getElementById('contactForm');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const formSuccess = document.getElementById('formSuccess');

  function renderProjects() {
    projectsGrid.innerHTML = '';
    projects.forEach(p => {
      const el = document.createElement('article');
      el.className = 'project-card reveal';
      el.innerHTML = `
        <div class="project-thumb" aria-hidden="true">
          <img src="${p.image}" alt="${p.title}">
        </div>
        <div class="project-body">
          <div>
            <div class="project-title">${p.title}</div>
            <div class="project-tags">${p.tags.join(' • ')}</div>
          </div>
          <div class="project-actions">
            <button class="btn view-btn" data-id="${p.id}">View</button>
            <a class="btn ghost" href="${p.link}" target="_blank" rel="noopener">Live</a>
          </div>
        </div>
      `;
      projectsGrid.appendChild(el);
    });
    observeReveals();
  }


  function openProject(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.description;
    modalLinks.innerHTML = `<a class="btn" href="${p.link}" target="_blank" rel="noopener">View live</a>`;
    modalImageWrap.innerHTML = `<img src="${p.image}" alt="${p.title}" style="width:100%;border-radius:8px;margin-top:12px;" />`;
    projectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';l
  }

  function closeModal() {
    projectModal.classList.add('hidden');
    modalTitle.textContent = '';
    modalDesc.textContent = '';
    modalLinks.innerHTML = '';
    modalImageWrap.innerHTML = '';
    document.body.style.overflow = ''; 
  }

  projectsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    openProject(btn.dataset.id);
  });
  modalClose.addEventListener('click', closeModal);
  projectModal.addEventListener('click', (e) => { if (e.target === projectModal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !projectModal.classList.contains('hidden')) closeModal(); });

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
  });

  navAnchors.forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  const sections = document.querySelectorAll('main section, main .hero');
  const observerOpts = { root: null, threshold: 0.45 };
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (!ent.target.id) return;
      const link = document.querySelector(`a[href="#${ent.target.id}"]`);
      if (ent.isIntersecting) {
        document.querySelectorAll('.nav a').forEach(x => x.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, observerOpts);
  sections.forEach(s => activeObserver.observe(s));

  let revealObserver = null;
  function observeReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('show'), entry.target.datasetDelay || 50);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((r, i) => {
      r.datasetDelay = 60 * (i % 6);
      revealObserver.observe(r);
    });
  }

 
  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function clearErrors() {
    nameError.textContent = ''; emailError.textContent = ''; messageError.textContent = ''; formSuccess.textContent = '';
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); clearErrors();
    let ok = true;
    if (nameEl.value.trim() === '') { nameError.textContent = 'Name is required.'; ok = false; }
    if (!validateEmail(emailEl.value.trim())) { emailError.textContent = 'Please enter a valid email.'; ok = false; }
    if (messageEl.value.trim().length < 8) { messageError.textContent = 'Message must be at least 8 characters.'; ok = false; }
    if (!ok) return;
    formSuccess.textContent = 'Sending…';
  
    setTimeout(() => {
      formSuccess.textContent = 'Message sent. Thank you!';
      contactForm.reset();
    }, 900);
  });
  
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderProjects();
  observeReveals();
  window.addEventListener('resize', () => {
    observeReveals();
  });
});
