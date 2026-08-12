/* ============================================================
   #PERFUMES PERALTA — lógica de la tienda (vanilla JS)
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.PERALTA_CONFIG || {};
  const PRODUCTS = window.PRODUCTS || [];
  const CAT_IMAGES = window.CAT_IMAGES || {};

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ---------- utilidades ---------- */
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const money = v => v == null ? null : '$' + Number(v).toLocaleString('es-CO');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const GENDER_LABEL = { mujer: 'Mujer', hombre: 'Hombre', unisex: 'Unisex' };
  const CATEGORY_LABEL = { arabe: 'Árabe', disenador: 'Diseñador' };
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const famLabel = p => p.families && p.families.length
    ? p.families.map(cap).join(' · ')
    : (p.familyText ? cap(p.familyText.toLowerCase()) : null);

  /* ---------- WhatsApp ---------- */
  const WA_MESSAGES = {
    general: 'Hola 👋 Vengo de la página de #Perfumes Peralta y quiero conocer más sobre sus perfumes.',
    asesoria: 'Hola 👋 Quiero asesoría para encontrar mi perfume ideal. Busco un aroma para: ',
    detal: 'Hola 👋 Quiero comprar un perfume al detal. Me interesa: ',
    mayor: 'Hola 👋 Estoy interesado/a en comprar perfumes al por mayor. Quisiera conocer las referencias disponibles y condiciones actuales.',
    distribuidor: 'Hola 👋 Me interesa ser distribuidor/a. ¿Me pueden compartir las condiciones y referencias disponibles?',
    condiciones: 'Hola 👋 ¿Me pueden compartir las condiciones actuales de compra mayorista?',
    buscar: 'Hola 👋 Busco un perfume que no encontré en la página: ',
  };
  const waUrl = text => {
    const num = (CFG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    const base = num ? `https://wa.me/${num}` : 'https://wa.me/';
    return `${base}?text=${encodeURIComponent(text)}`;
  };
  const productMsg = p =>
    `Hola 👋 Estoy interesado/a en el perfume *${p.name}*${p.size ? ' de ' + p.size + ' ML' : ''}. ¿Me pueden confirmar disponibilidad y precio?`;

  document.addEventListener('click', e => {
    const a = e.target.closest('.js-wa');
    if (!a) return;
    e.preventDefault();
    const key = a.dataset.msg || 'general';
    const msg = a.dataset.product
      ? productMsg(PRODUCTS.find(p => p.id === a.dataset.product) || { name: a.dataset.product })
      : (WA_MESSAGES[key] || WA_MESSAGES.general);
    window.open(waUrl(msg), '_blank', 'noopener');
  });

  /* ---------- navbar ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  const closeMenu = () => {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  };
  burger.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- sticky CTA móvil ---------- */
  const stickyCta = $('#stickyCta');
  document.body.classList.add('has-sticky-cta');
  const hero = $('#inicio');
  new IntersectionObserver(([en]) => {
    stickyCta.classList.toggle('is-visible', !en.isIntersecting);
  }, { threshold: 0.05 }).observe(hero);

  /* ---------- reveal animaciones ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      if (en.target.classList.contains('reveal-stagger')) {
        [...en.target.children].forEach((c, i) => c.style.transitionDelay = Math.min(i * 60, 420) + 'ms');
      }
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const observeReveals = root => $$('.reveal, .reveal-stagger', root).forEach(el => io.observe(el));
  if ('IntersectionObserver' in window) observeReveals(document);
  else $$('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));

  /* ---------- tarjeta de producto ---------- */
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .7-.4 1.3Z"/></svg>';
  const BOTTLE_PLACEHOLDER = '<svg viewBox="0 0 80 100" fill="none" stroke="#C9A24B" stroke-width="1.6" aria-hidden="true" style="width:44%;max-height:70%;opacity:.5"><rect x="30" y="4" width="20" height="10" rx="2"/><path d="M34 14h12v10H34z"/><path d="M24 30c0-4 4-6 10-6h12c6 0 10 2 10 6v56a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V30Z"/><path d="M32 46h16" stroke-linecap="round"/></svg>';

  function metaLine(p) {
    const parts = [];
    if (p.gender) parts.push(GENDER_LABEL[p.gender]);
    if (p.size) parts.push(p.size + ' ML');
    parts.push(CATEGORY_LABEL[p.category]);
    return parts.join('<span class="dot">·</span>');
  }

  function cardHTML(p) {
    const fam = famLabel(p);
    const badge = p.feat ? '<span class="p-card__badge p-card__badge--gold">Destacado</span>'
      : p.nuevo ? '<span class="p-card__badge">Colección 2025</span>' : '';
    const img = p.image
      ? `<img src="${p.image}" alt="${esc(p.name)}${p.brand ? ' de ' + esc(p.brand) : ''}" loading="lazy" decoding="async" width="800" height="800">`
      : BOTTLE_PLACEHOLDER;
    const price = p.priceDetal
      ? `<p class="p-card__price">${money(p.priceDetal)}<small>Precio al detal</small></p>`
      : '<p class="p-card__price p-card__price--ask">Precio por consultar</p>';
    return `
    <article class="p-card" data-id="${p.id}">
      ${badge}
      <button class="p-card__media js-detail" data-id="${p.id}" aria-label="Ver detalles de ${esc(p.name)}">${img}</button>
      <div class="p-card__body">
        ${p.brand ? `<span class="p-card__brand">${esc(p.brand)}</span>` : '<span class="p-card__brand">&nbsp;</span>'}
        <h3 class="p-card__name">${esc(p.name)}</h3>
        <p class="p-card__meta">${metaLine(p)}</p>
        ${fam ? `<p class="p-card__family">${esc(fam)}</p>` : ''}
        ${price}
        <div class="p-card__actions">
          <button class="btn btn--outline js-detail" data-id="${p.id}">Ver perfume</button>
          <a class="btn btn--wa js-wa" href="#" data-product="${p.id}">${WA_ICON}Consultar</a>
        </div>
      </div>
    </article>`;
  }

  const renderInto = (el, items) => { el.innerHTML = items.map(cardHTML).join(''); };

  /* ---------- hero ---------- */
  const heroBottles = $('#heroBottles');
  const heroPicks = PRODUCTS.filter(p => p.hero).sort((a, b) => a.hero - b.hero);
  heroBottles.innerHTML = heroPicks.map(p =>
    `<img src="${p.image}" alt="${esc(p.name)}" width="320" height="320" fetchpriority="high">`).join('');

  /* ---------- categorías ---------- */
  const CATS = [
    { key: 'mujer', title: 'Perfumes para Mujer', desc: 'Delicados, dulces y florales.', filter: { gender: 'mujer' } },
    { key: 'hombre', title: 'Perfumes para Hombre', desc: 'Sobrios, amaderados, con carácter.', filter: { gender: 'hombre' } },
    { key: 'arabe', title: 'Perfumes Árabes', desc: 'Intensos, duraderos y memorables.', filter: { category: 'arabe' } },
    { key: 'disenador', title: 'Perfumes de Diseñador', desc: 'Las casas clásicas de siempre.', filter: { category: 'disenador' } },
    { key: 'vendidos', title: 'Más Vendidos', desc: 'Los favoritos de la casa.', filter: { special: 'feat' } },
    { key: 'novedades', title: 'Novedades', desc: 'Colección Capadocia · Oct 2025.', filter: { special: 'nuevo' } },
  ];
  $('#catsGrid').innerHTML = CATS.map(c => {
    const im = CAT_IMAGES[c.key];
    return `
    <a class="cat-card js-goto-catalog" href="#catalogo"
       ${c.filter.gender ? `data-gender="${c.filter.gender}"` : ''}
       ${c.filter.category ? `data-category="${c.filter.category}"` : ''}
       ${c.filter.special ? `data-special="${c.filter.special}"` : ''}>
      <span class="cat-card__media">${im ? `<img src="${im.image}" alt="${esc(im.alt)}" loading="lazy" width="300" height="300">` : BOTTLE_PLACEHOLDER}</span>
      <span class="cat-card__body">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <span class="cat-card__link">Explorar
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </span>
    </a>`;
  }).join('');

  /* ---------- destacados ---------- */
  renderInto($('#featGrid'), PRODUCTS.filter(p => p.feat).sort((a, b) => a.feat - b.feat).slice(0, 8));

  /* ---------- secciones mujer / hombre (chips de familia) ---------- */
  function gsection(gender, chipsEl, gridEl) {
    const base = PRODUCTS.filter(p => p.gender === gender);
    const fams = [...new Set(base.flatMap(p => p.families))].sort((a, b) => a.localeCompare(b));
    const chips = ['todos', ...fams];
    chipsEl.innerHTML = chips.map((f, i) =>
      `<button class="chip${i === 0 ? ' is-active' : ''}" data-fam="${f}" aria-pressed="${i === 0}">${cap(f)}</button>`).join('');
    const paint = fam => {
      const items = fam === 'todos' ? base : base.filter(p => p.families.includes(fam));
      renderInto(gridEl, items.slice(0, 8));
    };
    chipsEl.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', chipsEl).forEach(c => { c.classList.toggle('is-active', c === b); c.setAttribute('aria-pressed', String(c === b)); });
      paint(b.dataset.fam);
    });
    paint('todos');
  }
  gsection('mujer', $('#womenChips'), $('#womenGrid'));
  gsection('hombre', $('#menChips'), $('#menGrid'));

  /* ---------- árabes / diseñador ---------- */
  renderInto($('#arabGrid'), PRODUCTS.filter(p => p.category === 'arabe' && p.image && p.priceDetal).slice(0, 8));
  renderInto($('#designerGrid'), PRODUCTS.filter(p => p.category === 'disenador' && p.image).slice(0, 8));

  /* ---------- personalidad (agrupaciones de familias del catálogo) ---------- */
  const MOODS = [
    { label: 'Dulce', fams: ['dulce', 'vainilla', 'gourmand'], icon: '<path d="M12 3c-4 0-7 3-7 7 0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7Z"/><path d="M9 10h6"/>' },
    { label: 'Floral', fams: ['floral'], icon: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>' },
    { label: 'Intenso', fams: ['especiado', 'cuero', 'ámbar'], icon: '<path d="M12 3s5 5.2 5 10a5 5 0 0 1-10 0c0-4.8 5-10 5-10Z"/><path d="M12 21v-4"/>' },
    { label: 'Fresco', fams: ['fresco', 'acuático', 'verde', 'ozónico'], icon: '<path d="M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' },
    { label: 'Amaderado', fams: ['amaderado'], icon: '<path d="M12 21V9"/><path d="M12 9c-3 0-5-2.5-5-5 3 0 5 2 5 5Zm0 0c3 0 5-2.5 5-5-3 0-5 2-5 5Z"/><path d="M12 15c-2.5 0-4.5-2-4.5-4.5 2.5 0 4.5 2 4.5 4.5Zm0 0c2.5 0 4.5-2 4.5-4.5-2.5 0-4.5 2-4.5 4.5Z"/>' },
    { label: 'Cítrico', fams: ['cítrico'], icon: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11"/>' },
    { label: 'Oriental', fams: ['oriental', 'almizcle', 'anís'], icon: '<path d="M20 12A8 8 0 1 1 12 4a6.5 6.5 0 1 0 8 8Z"/><path d="m17 5 .6 1.6L19 7l-1.4.5L17 9l-.5-1.5L15 7l1.5-.4L17 5Z"/>' },
    { label: 'Elegante', fams: ['aromático', 'fougère'], icon: '<path d="M6 3h12l2 5-8 13L4 8l2-5Z"/><path d="M4 8h16M9.5 8 12 21 14.5 8M9.5 8 12 3l2.5 5"/>' },
  ];
  const moodGrid = $('#moodGrid');
  moodGrid.innerHTML = MOODS.map((m, i) =>
    `<button class="mood" data-i="${i}" aria-pressed="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${m.icon}</svg>
      ${m.label}
    </button>`).join('');
  const moodResults = $('#moodResults');
  moodGrid.addEventListener('click', e => {
    const b = e.target.closest('.mood'); if (!b) return;
    const active = b.classList.contains('is-active');
    $$('.mood', moodGrid).forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
    if (active) { moodResults.innerHTML = ''; return; }
    b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
    const m = MOODS[+b.dataset.i];
    const items = PRODUCTS.filter(p => p.families.some(f => m.fams.includes(f)));
    renderInto(moodResults, items.slice(0, 8));
    moodResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ---------- catálogo completo ---------- */
  const state = { q: '', gender: '', category: '', special: '', brand: '', family: '', size: '', sort: 'featured', shown: 12 };
  const PAGE = 12;

  const brandSelect = $('#brandSelect');
  [...new Set(PRODUCTS.map(p => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b))
    .forEach(b => brandSelect.insertAdjacentHTML('beforeend', `<option value="${esc(b)}">${esc(b)}</option>`));
  const familySelect = $('#familySelect');
  [...new Set(PRODUCTS.flatMap(p => p.families))].sort((a, b) => a.localeCompare(b))
    .forEach(f => familySelect.insertAdjacentHTML('beforeend', `<option value="${f}">${cap(f)}</option>`));
  const sizeSelect = $('#sizeSelect');
  [...new Set(PRODUCTS.map(p => p.size).filter(Boolean))].sort((a, b) => a - b)
    .forEach(s => sizeSelect.insertAdjacentHTML('beforeend', `<option value="${s}">${s} ML</option>`));

  const genderChips = $('#genderChips');
  genderChips.innerHTML = [['', 'Todos'], ['mujer', 'Mujer'], ['hombre', 'Hombre'], ['unisex', 'Unisex']]
    .map(([v, l], i) => `<button type="button" class="chip${i === 0 ? ' is-active' : ''}" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join('');
  const categoryChips = $('#categoryChips');
  categoryChips.innerHTML = [['', '', 'Todas'], ['arabe', '', 'Árabes'], ['disenador', '', 'Diseñador'], ['', 'feat', 'Más vendidos'], ['', 'nuevo', 'Novedades']]
    .map(([c, s, l], i) => `<button type="button" class="chip${i === 0 ? ' is-active' : ''}" data-c="${c}" data-s="${s}" aria-pressed="${i === 0}">${l}</button>`).join('');

  function applyFilters() {
    let items = PRODUCTS.slice();
    const q = norm(state.q);
    if (q) items = items.filter(p => norm(p.name + ' ' + (p.brand || '') + ' ' + (p.familyText || '') + ' ' + p.id).includes(q));
    if (state.gender) items = items.filter(p => p.gender === state.gender || (state.gender === 'unisex' && !p.gender));
    if (state.category) items = items.filter(p => p.category === state.category);
    if (state.special === 'feat') items = items.filter(p => p.feat);
    if (state.special === 'nuevo') items = items.filter(p => p.nuevo);
    if (state.brand) items = items.filter(p => p.brand === state.brand);
    if (state.family) items = items.filter(p => p.families.includes(state.family));
    if (state.size) items = items.filter(p => p.size === +state.size);
    if (state.sort === 'price-asc') items.sort((a, b) => (a.priceDetal || Infinity) - (b.priceDetal || Infinity));
    else if (state.sort === 'price-desc') items.sort((a, b) => (b.priceDetal || 0) - (a.priceDetal || 0));
    else if (state.sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
    else items.sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0) || (b.priceDetal ? 1 : 0) - (a.priceDetal ? 1 : 0) || a.name.localeCompare(b.name));
    return items;
  }

  const catalogGrid = $('#catalogGrid');
  const resultCount = $('#resultCount');
  const loadMore = $('#loadMore');
  const emptyBox = $('#catalogEmpty');

  function renderCatalog() {
    const items = applyFilters();
    renderInto(catalogGrid, items.slice(0, state.shown));
    resultCount.textContent = items.length
      ? `${items.length} perfume${items.length === 1 ? '' : 's'} encontrado${items.length === 1 ? '' : 's'}`
      : '';
    emptyBox.hidden = items.length > 0;
    loadMore.hidden = items.length <= state.shown;
  }

  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); state.q = $('#searchInput').value; state.shown = PAGE; renderCatalog(); });
  let deb;
  $('#searchInput').addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => { state.q = e.target.value; state.shown = PAGE; renderCatalog(); }, 220);
  });

  genderChips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.gender = b.dataset.v; state.shown = PAGE;
    $$('.chip', genderChips).forEach(c => { c.classList.toggle('is-active', c === b); c.setAttribute('aria-pressed', String(c === b)); });
    renderCatalog();
  });
  categoryChips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.category = b.dataset.c; state.special = b.dataset.s; state.shown = PAGE;
    $$('.chip', categoryChips).forEach(c => { c.classList.toggle('is-active', c === b); c.setAttribute('aria-pressed', String(c === b)); });
    renderCatalog();
  });
  brandSelect.addEventListener('change', () => { state.brand = brandSelect.value; state.shown = PAGE; renderCatalog(); });
  familySelect.addEventListener('change', () => { state.family = familySelect.value; state.shown = PAGE; renderCatalog(); });
  sizeSelect.addEventListener('change', () => { state.size = sizeSelect.value; state.shown = PAGE; renderCatalog(); });
  $('#sortSelect').addEventListener('change', e => { state.sort = e.target.value; renderCatalog(); });
  loadMore.addEventListener('click', () => { state.shown += PAGE; renderCatalog(); });

  $('#clearFilters').addEventListener('click', () => {
    Object.assign(state, { q: '', gender: '', category: '', special: '', brand: '', family: '', size: '', sort: 'featured', shown: PAGE });
    $('#searchInput').value = ''; brandSelect.value = ''; familySelect.value = ''; sizeSelect.value = ''; $('#sortSelect').value = 'featured';
    $$('.chip', genderChips).forEach((c, i) => { c.classList.toggle('is-active', i === 0); c.setAttribute('aria-pressed', String(i === 0)); });
    $$('.chip', categoryChips).forEach((c, i) => { c.classList.toggle('is-active', i === 0); c.setAttribute('aria-pressed', String(i === 0)); });
    renderCatalog();
  });

  const filtersToggle = $('#filtersToggle');
  const filtersPanel = $('#filtersPanel');
  filtersToggle.addEventListener('click', () => {
    const open = !filtersPanel.classList.contains('is-open');
    filtersPanel.classList.toggle('is-open', open);
    filtersToggle.setAttribute('aria-expanded', String(open));
  });

  // botones "ver todos" / tarjetas de categoría -> catálogo filtrado
  document.addEventListener('click', e => {
    const b = e.target.closest('.js-goto-catalog'); if (!b) return;
    e.preventDefault();
    Object.assign(state, { q: '', gender: b.dataset.gender || '', category: b.dataset.category || '', special: b.dataset.special || '', brand: '', family: '', size: '', shown: PAGE });
    $('#searchInput').value = '';
    $$('.chip', genderChips).forEach(c => { const on = c.dataset.v === state.gender; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    $$('.chip', categoryChips).forEach(c => { const on = c.dataset.c === state.category && c.dataset.s === state.special; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    renderCatalog();
    $('#catalogo').scrollIntoView({ behavior: 'smooth' });
  });

  renderCatalog();

  /* ---------- modal detalle ---------- */
  const modal = $('#productModal');
  const modalContent = $('#modalContent');
  let lastFocus = null;

  function openModal(p) {
    lastFocus = document.activeElement;
    const fam = famLabel(p);
    const prices = [];
    if (p.priceDetal) prices.push(['Al detal', p.priceDetal, 'desde 1 unidad', true]);
    if (p.priceMayor) prices.push(['Al por mayor', p.priceMayor, 'desde 4 unidades surtidas', false]);
    if (p.priceDistrib) prices.push(['Distribuidor', p.priceDistrib, 'desde 9 unidades surtidas', false]);
    modalContent.innerHTML = `
      <div class="modal__media">${p.image
        ? `<img src="${p.image}" alt="${esc(p.name)}${p.brand ? ' de ' + esc(p.brand) : ''}" width="800" height="800">`
        : BOTTLE_PLACEHOLDER}</div>
      <div>
        ${p.brand ? `<span class="modal__brand">${esc(p.brand)}</span>` : ''}
        <h3 class="modal__name" id="modalName">${esc(p.name)}</h3>
        <div class="modal__tags">
          ${p.gender ? `<span class="modal__tag">${GENDER_LABEL[p.gender]}</span>` : ''}
          ${p.size ? `<span class="modal__tag">${p.size} ML</span>` : ''}
          <span class="modal__tag">${CATEGORY_LABEL[p.category]}</span>
          ${fam ? `<span class="modal__tag modal__tag--fam">${esc(fam)}</span>` : ''}
        </div>
        <p class="modal__desc">${esc(p.name)}${p.brand ? ', de ' + esc(p.brand) + ',' : ''} hace parte de nuestra colección de perfumes ${p.category === 'arabe' ? 'árabes (catálogo Capadocia, octubre 2025)' : 'de diseñador'}.${fam ? ' Familia olfativa: ' + esc(fam) + '.' : ''} Confírmanos disponibilidad y te lo reservamos.</p>
        ${prices.length ? `<div class="modal__prices">${prices.map(([l, v, n, main]) => `
          <div class="modal__price-row${main ? ' is-main' : ''}"><span>${l}<br><small>${n}</small></span><b>${money(v)}</b></div>`).join('')}</div>`
        : '<div class="modal__prices"><div class="modal__price-row is-main"><span>Precio</span><b style="font-size:16px;">Por consultar</b></div></div>'}
        <p class="modal__avail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          Disponibilidad: consultar por WhatsApp
        </p>
        <p class="modal__ask">¿Quieres este perfume?</p>
        <div class="modal__actions">
          <a class="btn btn--wa js-wa" href="#" data-product="${p.id}">${WA_ICON}Consultar por WhatsApp</a>
          <button class="btn btn--outline" data-close>Seguir explorando</button>
        </div>
      </div>`;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('.modal__close', modal).focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 320);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', e => {
    const d = e.target.closest('.js-detail');
    if (d) { const p = PRODUCTS.find(x => x.id === d.dataset.id); if (p) openModal(p); return; }
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if (e.key === 'Tab' && !modal.hidden) { // focus trap
      const focusables = $$('button, a[href], select, input', modal).filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  /* ---------- contacto ---------- */
  const IC = {
    wa: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" fill="currentColor" stroke="none"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
    fb: '<path d="M14 8h2.5V4.5H14A4.5 4.5 0 0 0 9.5 9v2.5H7V15h2.5v6.5H13V15h2.5l.5-3.5h-3V9a1 1 0 0 1 1-1Z"/>',
    pin: '<path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  };
  const contactGrid = $('#contactGrid');
  const cards = [];
  cards.push({ icon: IC.wa, title: 'WhatsApp', sub: CFG.WHATSAPP_NUMBER ? '+' + CFG.WHATSAPP_NUMBER : 'Escríbenos directamente', wa: true });
  if (CFG.INSTAGRAM_URL) cards.push({ icon: IC.ig, title: 'Instagram', sub: 'Síguenos y escríbenos', href: CFG.INSTAGRAM_URL });
  if (CFG.FACEBOOK_URL) cards.push({ icon: IC.fb, title: 'Facebook', sub: 'Nuestra comunidad', href: CFG.FACEBOOK_URL });
  if (CFG.CITY || CFG.ADDRESS) cards.push({ icon: IC.pin, title: CFG.CITY || 'Ubicación', sub: CFG.ADDRESS || '' });
  if (cards.length === 1) cards.push({ icon: IC.ig, title: 'Redes sociales', sub: 'Muy pronto' });
  contactGrid.innerHTML = cards.map(c => `
    <a class="contact-card${c.wa ? ' js-wa' : ''}" href="${c.wa ? '#' : (c.href || '#contacto')}" ${c.href ? 'target="_blank" rel="noopener"' : ''} ${c.wa ? 'data-msg="general"' : ''}>
      <span class="contact-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${c.icon}</svg></span>
      <span><b>${esc(c.title)}</b><span>${esc(c.sub)}</span></span>
    </a>`).join('');

  const social = $('#footerSocial');
  const socialLinks = [];
  if (CFG.INSTAGRAM_URL) socialLinks.push([IC.ig, CFG.INSTAGRAM_URL, 'Instagram']);
  if (CFG.FACEBOOK_URL) socialLinks.push([IC.fb, CFG.FACEBOOK_URL, 'Facebook']);
  socialLinks.push([IC.wa, waUrl(WA_MESSAGES.general), 'WhatsApp']);
  social.innerHTML = socialLinks.map(([ic, href, label]) =>
    `<a href="${href}" target="_blank" rel="noopener" aria-label="${label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${ic}</svg></a>`).join('');

  $('#year').textContent = new Date().getFullYear();

  /* ---------- scrollspy ligero ---------- */
  const sections = ['inicio', 'mujer', 'hombre', 'arabes', 'disenador', 'catalogo', 'contacto'];
  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- JSON-LD de destacados ---------- */
  const featured = PRODUCTS.filter(p => p.feat).sort((a, b) => a.feat - b.feat).slice(0, 8);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Perfumes destacados — #Perfumes Peralta',
    itemListElement: featured.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        ...(p.image ? { image: p.image } : {}),
        ...(p.priceDetal ? { offers: { '@type': 'Offer', price: p.priceDetal, priceCurrency: 'COP', availability: 'https://schema.org/PreOrder' } } : {}),
      },
    })),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
})();
