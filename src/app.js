const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const cleanPublicText = (value = '') => String(value || '').replace(/\bforthcoming\b/gi, 'planned');
const excerpt = (value = '', length = 190) => { const text = cleanPublicText(value).replace(/\s+/g, ' ').trim(); return text.length > length ? `${text.slice(0, length - 1).replace(/[,;:!?-]+$/, '')}…` : text; };
const slugify = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const formatDate = (value) => { if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return ''; return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00Z`)); };
const state = { members: [], committee: [], committeeName: '', committeeType: '', committeeHost: '', contributions: [], countries: [], publications: [], events: [], news: [], affiliations: [], metrics: {}, homepage: null, page: 1, query: '', type: '', expertise: '', countryQuery: '', countryRegion: '', menuOpen: false, locale: 'en', siteConfig: null };
const site = { name: 'Atlas Global South AI Policy Coalition', shortName: 'Global South AI Policy Coalition', parent: 'Atlas AI Institute', tagline: 'Together for a Responsible AI Future.', email: 'coalition.atlasai@gmail.com', officialDomain: 'https://coalition.atlasai.institute', sameAs: ['https://www.linkedin.com/showcase/atlas-global-south-ai-policy-coalition/', 'https://www.linkedin.com/company/atlas-ai-institute/', 'https://www.facebook.com/share/1DWmocBb8U/'], defaultShareImage: '/assets/atlas-global-south-share.png' };
const siteConfigFallback = { siteName: site.name, shortName: site.shortName, parentOrg: site.parent, primaryDomain: site.officialDomain, sameAs: site.sameAs, locales: ['en', 'es', 'fr', 'ar'], defaultLocale: 'en', contactEmail: site.email, verification: { googleSearchConsole: '', bingWebmaster: '' }, domainVerifiedLive: false, defaultShareImage: site.defaultShareImage };
const labels = { en: { about: 'About', membership: 'Membership', research: 'Research', members: 'Members', news: 'News & Events', contact: 'Contact', become: 'Become a Member', apply: 'Apply for Membership', criteria: 'View membership criteria', explore: 'Explore the Coalition', language: 'Language' }, es: { about: 'Acerca de', membership: 'Membresía', research: 'Investigación', members: 'Miembros', news: 'Noticias y eventos', contact: 'Contacto', become: 'Hazte miembro', apply: 'Solicitar membresía', criteria: 'Ver criterios de membresía', explore: 'Explorar la coalición', language: 'Idioma' }, fr: { about: 'À propos', membership: 'Adhésion', research: 'Recherche', members: 'Membres', news: 'Actualités et événements', contact: 'Contact', become: 'Devenir membre', apply: 'Demander l’adhésion', criteria: 'Voir les critères d’adhésion', explore: 'Explorer la coalition', language: 'Langue' }, ar: { about: 'عن الائتلاف', membership: 'العضوية', research: 'البحث', members: 'الأعضاء', news: 'الأخبار والفعاليات', contact: 'اتصل بنا', become: 'كن عضواً', apply: 'التقدم للعضوية', criteria: 'عرض معايير العضوية', explore: 'استكشف الائتلاف', language: 'اللغة' } };
const t = (key) => labels[state.locale]?.[key] || labels.en[key] || key;
const localeMeta = { en: { title: 'Atlas Global South AI Policy Coalition | AI Governance', description: 'A global platform for responsible AI governance, policy research and international cooperation.' }, es: { title: 'Coalición Global del Sur sobre Políticas de IA | Gobernanza', description: 'Una plataforma global para la gobernanza responsable de la inteligencia artificial y la cooperación internacional.' }, fr: { title: 'Coalition du Sud global pour les politiques d’IA | Gouvernance', description: 'Une plateforme mondiale pour une gouvernance responsable de l’intelligence artificielle et la coopération internationale.' }, ar: { title: 'ائتلاف سياسات الذكاء الاصطناعي للجنوب العالمي | الحوكمة', description: 'منصة عالمية للحوكمة المسؤولة للذكاء الاصطناعي والبحث في السياسات والتعاون الدولي.' } };
const localeMetaFor = (locale) => localeMeta[locale] || localeMeta.en;

async function readJson(path, fallback) { try { const response = await fetch(path); if (!response.ok) throw new Error(path); return await response.json(); } catch { return fallback; } }
async function load() {
  const [siteConfig, members, committee, contributions, countries, homepage, metrics, publications, events, news, affiliations] = await Promise.all([
    readJson('/data/site.config.json', siteConfigFallback), readJson('/data/members.json', { members: [], meta: {} }), readJson('/data/founding-committee.json', { members: [] }), readJson('/data/contributions.json', { contributions: [] }), readJson('/data/countries.json', { countries: [] }), readJson('/data/homepage-content.json', {}), readJson('/data/metrics.json', {}), readJson('/data/publications.json', { publications: [] }), readJson('/data/events.json', { events: [] }), readJson('/data/news.json', { news: [] }), readJson('/data/affiliations.json', { affiliations: [] })
  ]);
  state.siteConfig = siteConfig; Object.assign(site, { name: siteConfig.siteName || site.name, shortName: siteConfig.shortName || site.shortName, parent: siteConfig.parentOrg || site.parent, email: siteConfig.contactEmail || site.email, officialDomain: siteConfig.primaryDomain || site.officialDomain, sameAs: siteConfig.sameAs || site.sameAs, defaultShareImage: siteConfig.defaultShareImage || site.defaultShareImage });
  state.homepage = homepage; state.metrics = metrics; state.members = members.members || []; state.auditedCount = members.meta?.audited_records || state.members.length; state.committee = committee.members || []; state.committeeName = committee.committee_name || site.name; state.committeeType = committee.committee_type || committee.committee || 'Founding Committee'; state.committeeHost = committee.institutional_host_and_secretariat || site.parent; state.contributions = contributions.contributions || []; state.countries = countries.countries || []; state.publications = publications.publications || []; state.events = (events.events || []).filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date)); state.news = (news.news || []).filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date)); state.affiliations = affiliations.affiliations || [];
  const params = new URLSearchParams(location.search); const requestedLocale = params.get('lang'); const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('atlas-locale') : ''; if (labels[requestedLocale]) state.locale = requestedLocale; else if (labels[savedLocale]) state.locale = savedLocale; state.query = params.get('q') || ''; document.documentElement.lang = state.locale; document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
  render();
  bind();
}

function sectionHeading(kicker, title, text = '', id = '') { return `<div class="section-heading">${kicker ? `<span class="eyebrow">${esc(kicker)}</span>` : ''}<h2${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>`; }
function textLink(label, href, extra = '') { return `<a class="text-link" href="${esc(href)}"${extra}>${esc(label)} <span aria-hidden="true">↗</span></a>`; }
function button(label, href, secondary = false) { return secondary ? textLink(label, href) : `<a class="button" href="${esc(href)}">${esc(label)} <span aria-hidden="true">↗</span></a>`; }
function logoMark() { return '<span class="brand-seal" aria-hidden="true">A</span>'; }
function header() {
  const nav = [[t('about'), '/about/'], [t('membership'), '/membership/'], [t('research'), '/policy-research/'], [t('members'), '/members/'], [t('news'), '/news-events/'], [t('contact'), '/contact/']];
  const brandLine1 = state.homepage?.brand?.line1 || 'Atlas Global South';
  const brandLine2 = state.homepage?.brand?.line2 || 'AI Policy Coalition';
  const rawRoute = (typeof location !== 'undefined' && location.pathname ? location.pathname.replace(/\/$/, '') : '') || '/';
  const activeRoute = rawRoute === '/' ? '/' : `${rawRoute}/`;
  const allPageGroups = [
    ['Coalition & Governance', [
      ['Mission & Vision', '/about/mission-and-vision/'],
      ['Organizational Structure', '/about/organizational-structure/'],
      ['Governance Principles', '/about/governance/'],
      ['Leadership Overview', '/leadership/'],
      ['Founding Committee', '/leadership/founding-committee/'],
      ['Committee Rulebook', '/committee-rulebook/']
    ]],
    ['Directory & Reach', [
      ['Global Members', '/members/'],
      ['Member Countries', '/member-countries/']
    ]],
    ['Research & Knowledge', [
      ['Policy Research Tracks', '/policy-research/'],
      ['Global Initiatives', '/initiatives/'],
      ['Publications & Resources', '/publications/'],
      ['Monthly Publication Programme', '/monthly-publication-programme/'],
      ['Contributions Library', '/contributions/'],
      ['News', '/news/'],
      ['Events', '/events/']
    ]],
    ['Participation & Policies', [
      ['Membership Eligibility', '/membership/eligibility/'],
      ['Apply for Membership', '/membership/apply/'],
      ['Submit a Contribution', '/contribute/submit/'],
      ['Reader Charter', '/reader-charter/'],
      ['Privacy Policy', '/privacy/'],
      ['Terms of Use', '/terms/'],
      ['Accessibility Statement', '/accessibility/']
    ]]
  ];
  const allPagesMarkup = `<div class="mobile-all-pages" aria-label="All Coalition pages"><span class="mobile-all-pages-kicker">ALL COALITION PAGES</span>${allPageGroups.map(([groupTitle, links]) => `<details class="mobile-nav-group" open><summary>${esc(groupTitle)}</summary><div class="mobile-nav-list">${links.map(([label, href]) => `<a href="${href}"${activeRoute === href ? ' aria-current="page"' : ''}><span>${esc(label)}</span><span aria-hidden="true">→</span></a>`).join('')}</div></details>`).join('')}</div>`;
  return `<header class="site-header"><div class="wrap nav"><a class="brand" href="/" >${logoMark()}<span class="brand-wordmark"><strong><span>${esc(brandLine1)}</span> <span>${esc(brandLine2)}</span></strong></span></a><button class="menu-toggle${state.menuOpen ? ' is-open' : ''}" type="button" aria-label="${state.menuOpen ? 'Close navigation' : 'Open navigation'}" aria-expanded="${state.menuOpen}" aria-controls="primary-navigation"><span class="menu-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span></button><nav id="primary-navigation" class="main-nav ${state.menuOpen ? 'open' : ''}" aria-label="Primary navigation"><a class="mobile-home-link" href="/"${activeRoute === '/' ? ' aria-current="page"' : ''}>Home</a>${nav.map(([label, href]) => `<a href="${href}"${activeRoute === href ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}<label class="language-control"><span class="sr-only">${esc(t('language'))}</span><select id="language-switcher" aria-label="${esc(t('language'))}">${[['en', 'EN'], ['es', 'ES'], ['fr', 'FR'], ['ar', 'عربي']].map(([value, label]) => `<option value="${value}" ${state.locale === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><a class="nav-cta" href="/membership/apply/">${esc(t('become'))}</a>${allPagesMarkup}</nav></div></header><div class="menu-backdrop${state.menuOpen ? ' open' : ''}" aria-hidden="true"></div>`;
}
function newsletterForm() { return typeof window !== 'undefined' && window.WEB3FORMS_NEWSLETTER_ENDPOINT ? `<form class="newsletter-form" id="newsletter-form"><label for="newsletter-email">Newsletter</label><div><input id="newsletter-email" name="email" type="email" autocomplete="email" required><button class="newsletter-submit" type="submit">Join the newsletter <span aria-hidden="true">↗</span></button></div><p class="form-status" id="newsletter-status" role="status" aria-live="polite"></p></form>` : ''; }
function footer() {
  const f = state.homepage?.footer || {}; const columns = f.columns || [];
  return `<footer><div class="wrap footer-grid"><div class="footer-brand"><div class="footer-brand-lockup"><img class="footer-logo" src="/assets/atlas-global-south-logo-96.webp" alt="Atlas Global South AI Policy Coalition logo" width="44" height="44" loading="lazy" decoding="async"><strong>${esc(f.brand || site.name)}</strong></div><p>${esc(f.description || 'An international platform for AI policy, governance, research and cooperation.')}</p><p>${esc(f.parent_line || `Convened by ${site.parent}.`)}</p><span class="footer-domain">${esc(f.official_domain || site.officialDomain)}</span><a href="mailto:${site.email}">${site.email}</a></div>${columns.length ? columns.map((column) => `<div class="footer-column"><strong>${esc(column.title)}</strong>${(column.links || []).map((link) => `<a href="${esc(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(link.label)}${link.external ? ' ↗' : ''}</a>`).join('')}</div>`).join('') : `<div class="footer-column"><strong>Coalition</strong><a href="/about/">About</a><a href="/leadership/">Leadership</a><a href="/membership/">Membership</a></div><div class="footer-column"><strong>Registry</strong><a href="/global-members/">Global Members</a><a href="/member-countries/">Member Countries</a></div><div class="footer-column"><strong>Knowledge</strong><a href="/policy-research/">Research Tracks</a><a href="/initiatives/">Initiatives</a><a href="/publications/">Publications</a><a href="/news-events/">News & Events</a></div>`}<div class="footer-column footer-policies"><strong>Trust & access</strong><a href="/privacy/">Privacy policy</a><a href="/terms/">Terms of use</a><a href="/accessibility/">Accessibility statement</a>${(site.sameAs || []).map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${index === 0 ? 'Coalition on LinkedIn' : index === 1 ? 'Atlas AI Institute on LinkedIn' : 'Coalition on Facebook'} ↗</a>`).join('')}</div></div><div class="wrap footer-newsletter">${newsletterForm()}</div><div class="wrap footer-bottom"><span>${esc(f.copyright || `© 2026 ${site.name}. Convened by ${site.parent}.`)}</span></div></footer>`;
}
function statValue(value, label, source = '') { const numeric = String(value).replace(/\D/g, ''); return `<article class="stat-item"><strong data-count="${numeric}" data-suffix="${String(value).includes('+') ? '+' : ''}">${esc(value)}</strong><span>${esc(label)}</span>${source ? `<small>${esc(source)}</small>` : ''}</article>`; }
function worldMap() {
  const markers = state.countries.filter((country) => country.map && Number.isFinite(country.map.x) && Number.isFinite(country.map.y)).map((country) => `<circle class="map-marker" cx="${country.map.x}" cy="${country.map.y}" r="6" tabindex="0" role="button" aria-label="${esc(country.name)}${country.member_count ? `, ${country.member_count} members` : ''}"><title>${esc(country.name)}${country.member_count ? ` · ${country.member_count} members` : ''}</title></circle>`).join('');
  return `<div class="world-map-wrap"><svg class="world-map" viewBox="0 0 800 420" role="img" aria-labelledby="map-title map-description"><title id="map-title">Member country map</title><desc id="map-description">A simplified world map ready to display verified country assignments from the country data source.</desc><defs><linearGradient id="map-fill" x1="0" x2="1"><stop offset="0" stop-color="#123e69"/><stop offset="1" stop-color="#0b2447"/></linearGradient><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#6acbc2" stroke-opacity=".12"/></pattern></defs><rect width="800" height="420" fill="url(#map-grid)"/><g class="map-land" fill="url(#map-fill)" stroke="#6acbc2" stroke-opacity=".4"><path d="M85 104l36-25 50 2 24 25-15 32-42 16-24 44-35-14 8-41-18-18z"/><path d="M214 74l44-20 54 15 18 32-25 21-43-6-26 28-28-22z"/><path d="M309 178l28 4 18 42-21 63-20 44-26-12 4-56-20-41z"/><path d="M396 100l46-21 38 18 9 30-32 18-37-7-35 22-21-27z"/><path d="M468 150l36-24 42 15 10 29-20 16 10 35-34 47-37-20 8-45-18-28z"/><path d="M574 90l62-18 55 27 26 30-16 33-46 5-23 33-47-14-19-31 11-30z"/><path d="M648 240l49-10 45 30-18 38-53 12-34-28z"/></g>${markers}<g class="map-route" aria-hidden="true"><path d="M126 116 C236 38 315 94 398 128 S564 154 681 111"/><path d="M175 290 C298 210 405 214 510 276 S635 315 704 267"/></g></svg><div class="map-legend"><span><i class="legend-dot"></i> Verified country assignment</span><span>${state.countries.length} verified assignments in public data</span></div></div>`;
}
function heroVisual(metrics = {}, regions = []) {
  const labels = regions.length ? regions : ['Asia-Pacific', 'Europe', 'Africa', 'The Americas', 'MENA'];
  const coords = [
    [136, 114, -22],
    [380, 56, -20],
    [624, 114, -22],
    [594, 278, 28],
    [166, 278, 28]
  ];
  const nodes = coords.map(([x, y, dy], index) => {
    const label = labels[index] || `Region ${index + 1}`;
    return `<g class="network-node"><circle cx="${x}" cy="${y}" r="15" class="network-node-ring"></circle><circle cx="${x}" cy="${y}" r="6.5" class="network-node-core"></circle><text x="${x}" y="${y + dy}" text-anchor="middle">${esc(label)}</text></g>`;
  }).join('');
  const countriesCount = metrics.reported_member_countries ?? 55;
  const expertsCount = metrics.reported_researchers_and_experts ?? 170;
  const tracksCount = metrics.core_research_tracks ?? 6;
  return `<div class="hero-visual" role="img" aria-labelledby="hero-visual-title hero-visual-description"><div class="hero-visual-header"><div><span class="eyebrow">POLICY ATLAS</span><strong class="hero-visual-title">Global AI Governance Architecture</strong></div><span class="hero-visual-status">FIVE REGIONS</span></div><svg class="network-canvas" viewBox="0 0 760 340" aria-hidden="true"><title id="hero-visual-title">Atlas policy network</title><desc id="hero-visual-description">A cartographic governance network connecting five global regions around the Coalition hub.</desc><defs><radialGradient id="network-glow"><stop offset="0" stop-color="#12a39f" stop-opacity=".46"></stop><stop offset="1" stop-color="#12a39f" stop-opacity="0"></stop></radialGradient><linearGradient id="network-line" x1="0" x2="1"><stop offset="0" stop-color="#7ed1ca" stop-opacity=".25"></stop><stop offset=".5" stop-color="#9be3dd" stop-opacity=".95"></stop><stop offset="1" stop-color="#7ed1ca" stop-opacity=".25"></stop></linearGradient><pattern id="atlas-grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#7ed1ca" stroke-opacity=".06" stroke-width="1"></path></pattern></defs><rect x="12" y="8" width="736" height="324" rx="10" fill="url(#atlas-grid)" stroke="#7ed1ca" stroke-opacity=".14"></rect><g class="atlas-continents" fill="#174a7c" fill-opacity=".5" stroke="#5ec2bb" stroke-opacity=".26" stroke-width="1"><path d="M84 96l42-20 48 6 22 22-14 28-36 12-18 32-30-10-12-34z"></path><path d="M210 64l42-16 48 12 16 26-22 18-38-6-22 24-26-18z"></path><path d="M312 146l28 4 18 36-18 54-18 38-24-12 4-48-16-36z"></path><path d="M402 84l44-18 34 14 8 26-28 16-34-6-32 18-18-22z"></path><path d="M472 132l34-20 38 12 10 26-18 14 8 32-30 40-34-18 8-38-16-24z"></path><path d="M566 84l58-16 48 22 22 26-14 30-42 6-22 28-42-12-18-26 10-26z"></path><path d="M622 214l44-8 38 24-16 32-46 10-28-24z"></path></g><circle cx="380" cy="172" r="142" fill="none" stroke="#6acbc2" stroke-opacity=".16" stroke-dasharray="3 10"></circle><circle cx="380" cy="172" r="96" fill="none" stroke="#6acbc2" stroke-opacity=".22"></circle><circle cx="380" cy="172" r="76" fill="url(#network-glow)"></circle><g class="network-links"><path d="M136 114 Q256 128 380 172"></path><path d="M380 56 Q380 112 380 172"></path><path d="M624 114 Q504 128 380 172"></path><path d="M594 278 Q490 232 380 172"></path><path d="M166 278 Q270 232 380 172"></path><path d="M136 114 Q258 64 380 56 Q502 64 624 114"></path><path d="M166 278 Q380 302 594 278"></path></g><g class="atlas-globe"><circle cx="380" cy="172" r="52"></circle><ellipse cx="380" cy="172" rx="52" ry="18"></ellipse><ellipse cx="380" cy="172" rx="18" ry="52"></ellipse></g><g class="network-core"><circle cx="380" cy="172" r="28"></circle><text x="380" y="181" text-anchor="middle">A</text><rect x="292" y="229" width="176" height="22" rx="4" fill="#09203d" stroke="#7ed1ca" stroke-opacity=".28"></rect><text x="380" y="244" text-anchor="middle" class="network-core-label">SHARED GOVERNANCE</text></g>${nodes}</svg><div class="hero-data-row"><div><strong>${esc(countriesCount)}</strong><span>Member countries</span></div><div><strong>${esc(expertsCount)}${String(expertsCount).includes('+') ? '' : '+'}</strong><span>Researchers &amp; experts</span></div><div><strong>${esc(tracksCount)}</strong><span>Research tracks</span></div></div></div>`;
}

function memberPortrait(rawPhoto, fullName, altText = fullName, size = 256) {
  const photo = rawPhoto ? rawPhoto.replace('/assets/member-photos/', '/assets/member-photos/webp/').replace(/\.(png|jpg|jpeg)$/i, '.webp').replace(/\.webp$/, `-${size}.webp`) : '';
  return `<div class="committee-photo">${photo ? `<picture><source type="image/webp" srcset="${esc(photo)}"><img src="${esc(photo)}" alt="${esc(altText || fullName)}" width="${size}" height="${size}" loading="lazy" decoding="async"></picture>` : `<span>${esc(initials(fullName))}</span>`}</div>`;
}
function memberCard(member, compact = false) {
  const expertise = (member.professional_expertise || []).filter(Boolean).slice(0, 2);
  const fields = [member.designation, member.institution, member.country].filter(Boolean);
  return `<article class="member-card ${compact ? 'member-card-compact' : ''}">${memberPortrait(member.photo, member.full_name, member.photo_alt || member.full_name, 256)}<div class="member-card-body"><span class="record-id">${esc(member.member_id || '')}</span><h3>${esc(member.full_name)}</h3>${fields.map((field) => `<p class="member-field">${esc(field)}</p>`).join('')}${expertise.length ? `<div class="tag-row">${expertise.map((item) => `<span>${esc(item)}</span>`).join('')}</div>` : ''}<a class="text-link" href="/members/${esc(member.slug)}/">View profile <span aria-hidden="true">→</span></a></div></article>`;
}
function committeeCard(entry) {
  const member = state.members.find((item) => item.slug === entry.profile_slug) || {};
  const rawBio = String(member.biography || '').replace(/^\s*\d+\.\s+[A-Z][A-Z\s]+\n+/, '');
  const bio = excerpt(rawBio, 185);
  const role = entry.designation || entry.responsibility || '';
  return `<article class="committee-card">${memberPortrait(entry.photo || member.photo, entry.full_name, member.photo_alt || entry.full_name, 256)}<div class="committee-card-body"><h3>${esc(entry.full_name)}</h3><p class="committee-role">${esc(role)}</p><p class="committee-bio">${esc(bio)}</p>${entry.profile_slug ? `<a class="text-link" href="/members/${esc(entry.profile_slug)}/">View profile <span aria-hidden="true">→</span></a>` : ''}</div></article>`;
}
function affiliationsStrip() { if (!state.affiliations.length) return ''; return `<div class="affiliation-strip"><div><span class="eyebrow">OUR MEMBERS COME FROM</span><p>Institutions already named in public member profiles.</p></div><div class="affiliation-list">${state.affiliations.map((item) => `<span>${esc(item.name)}</span>`).join('')}</div><small>Text wordmarks shown because logo permission must be confirmed before using institutional marks.</small></div>`; }
function countryDirectory() {
  const regions = [...new Set(state.countries.map((country) => country.region).filter(Boolean))].sort();
  const filtered = state.countries.filter((country) => { const query = state.countryQuery.toLowerCase(); return (!query || `${country.name} ${country.region || ''}`.toLowerCase().includes(query)) && (!state.countryRegion || country.region === state.countryRegion); });
  return `<div class="country-directory"><div class="directory-tools"><label>Search verified countries<input id="country-search" type="search" value="${esc(state.countryQuery)}" placeholder="Search by country"></label><label>Filter by region<select id="country-region"><option value="">All regions</option>${regions.map((region) => `<option value="${esc(region)}" ${state.countryRegion === region ? 'selected' : ''}>${esc(region)}</option>`).join('')}</select></label></div>${filtered.length ? `<div class="country-list">${filtered.map((country) => `<article class="country-card"><span class="country-code">${esc(country.code || '')}</span><div><h3>${esc(country.name)}</h3>${country.region ? `<p>${esc(country.region)}</p>` : ''}${country.member_count ? `<p>${esc(country.member_count)} members</p>` : ''}</div></article>`).join('')}</div>` : `<div class="data-note"><strong>No verified country assignments are available in the public country dataset.</strong><p>The map, search and region filter are ready for the authoritative country records when they are supplied.</p></div>`}</div>`;
}
function featuredMemberCard(member) {
  const role = member.designation || (member.professional_expertise || []).filter(Boolean)[0] || member.membership_type || 'Coalition Member';
  return `<article class="member-card member-card-compact">${memberPortrait(member.photo, member.full_name, member.photo_alt || member.full_name, 256)}<div class="member-card-body"><span class="record-id">${esc(member.membership_type || 'Member')}</span><h3>${esc(member.full_name)}</h3><p class="member-field">${esc(role)}</p>${member.country ? `<p class="member-country">${esc(member.country)}</p>` : ''}<a class="text-link" href="/members/${esc(member.slug)}/">View profile <span aria-hidden="true">→</span></a></div></article>`;
}
function leadershipRosterCard(entry) {
  const member = state.members.find((item) => item.slug === entry.profile_slug);
  const photo = entry.photo ? entry.photo.replace('/assets/member-photos/', '/assets/member-photos/webp/').replace(/\.(png|jpg|jpeg)$/i, '.webp').replace(/\.webp$/, '-192.webp') : '';
  const role = entry.designation || entry.responsibility || 'Founding Committee';
  return `<article class="leadership-row-card"><div class="leadership-avatar">${photo ? `<picture><source type="image/webp" srcset="${esc(photo)}"><img src="${esc(photo)}" alt="${esc(entry.full_name)}" width="192" height="192" loading="lazy" decoding="async"></picture>` : `<span>${esc(initials(entry.full_name))}</span>`}</div><div class="leadership-meta"><span class="eyebrow">Founding Committee · ${esc(role)}</span><h3>${esc(entry.full_name)}</h3>${member?.institution ? `<p class="member-field">${esc(member.institution)}</p>` : ''}</div>${entry.profile_slug ? `<a class="text-link" href="/members/${esc(entry.profile_slug)}/">Profile <span aria-hidden="true">→</span></a>` : ''}</article>`;
}
function latestUpdatesSection() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = state.events.filter((x) => x.date >= today);
  const newsItems = state.news.slice(0, 3);
  const pubs = state.publications.slice(0, 2);
  return `<section class="section editorial-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading('LATEST UPDATES', 'Latest from the Coalition')}</div><div class="section-links">${textLink('News & Events', '/news-events/')} ${textLink('Publications', '/publications/')}</div></div><div class="updates-grid"><div class="updates-panel"><span class="eyebrow">NEWS & ANNOUNCEMENTS</span>${newsItems.length ? newsItems.map((item) => `<article class="update-item"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><h3>${esc(item.title)}</h3>${item.summary ? `<p>${esc(item.summary)}</p>` : ''}${item.href ? textLink('Read update', item.href) : ''}</article>`).join('') : `<p class="updates-empty">No approved news announcements are currently recorded.</p>`}${upcoming.length ? upcoming.slice(0, 2).map((item) => `<article class="update-item"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><h3>${esc(item.title)}</h3>${item.location ? `<p>${esc(item.location)}</p>` : ''}</article>`).join('') : ''}</div><div class="updates-panel"><span class="eyebrow">PUBLICATIONS & RESEARCH</span>${pubs.length ? pubs.map((item) => `<article class="update-item"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><h3>${esc(item.title)}</h3><a class="text-link" href="${esc(item.pdf_url)}" download>Download PDF <span aria-hidden="true">→</span></a></article>`).join('') : `<article class="update-item"><h3>Publications programme in preparation</h3><p>Verified Coalition research papers, policy briefs and governance frameworks will appear here once approved and published.</p>${textLink('View publications status', '/publications/')}</article>`}</div></div></div></section>`;
}
function missionVisionGrid() {
  const c = state.homepage || {};
  const mission = c.mission || 'To foster inclusive international dialogue, collaborative AI policy research and cross-border governance frameworks that ensure artificial intelligence develops safely, ethically and equitably for global society.';
  const vision = c.vision || 'A globally coordinated AI ecosystem built on shared accountability, transparency, scientific integrity and human-centered innovation.';
  return `<div class="about-mission" aria-label="Mission and Vision"><article class="mandate-card mandate-card--mission"><div class="mandate-header"><span class="eyebrow">01 · OUR MISSION</span><h3>Inclusive Policy &amp; Cross-Border Governance</h3></div><p>${esc(mission)}</p></article><article class="mandate-card mandate-card--vision"><div class="mandate-header"><span class="eyebrow">02 · OUR VISION</span><h3>Accountable &amp; Human-Centered AI Ecosystem</h3></div><p>${esc(vision)}</p></article></div>`;
}
function home() {
  const c = state.homepage || {};
  const metrics = state.metrics;
  const featured = [...state.members]
    .filter((member) => member.country && member.designation)
    .sort((a, b) => (a.display_order || 999) - (b.display_order || 999))
    .slice(0, 6);
  const tracks = c.research_tracks || [];
  const initiatives = c.initiatives || [];
  const committee = [...state.committee].sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
  return `<main>
    <section class="hero" data-reveal><div class="wrap hero-grid"><div class="hero-copy"><span class="eyebrow">${esc(c.hero?.eyebrow || 'ATLAS GLOBAL SOUTH AI POLICY COALITION')}</span><h1>${esc(c.hero?.headline || 'Advancing Global AI Governance Through International Cooperation')}</h1><p>${esc(c.hero?.subtext || '')}</p><div class="hero-actions">${button(t('explore'), '/about/')} ${textLink(t('become'), '/membership/apply/')}</div><div class="hero-meta">Convened by ${esc(site.parent)}</div></div><div class="hero-network" aria-label="Global coalition network visual">${heroVisual(metrics, c.global_reach?.regions || [])}</div></div></section>
    <section class="stats-band" aria-label="Global Footprint"><div class="wrap"><div class="stats-grid">${statValue(metrics.reported_member_countries ?? 55, 'Reported Member Countries', 'Reported · Coalition brief')} ${statValue(metrics.reported_researchers_and_experts ?? 170, 'Researchers and Experts', 'Reported · Coalition brief')} ${statValue(metrics.global_regions ?? 5, 'Global Regions', 'Coalition scope')} ${statValue(metrics.core_research_tracks ?? 6, 'Core Research Tracks', 'Research programme')}</div><p class="stats-footnote">Registry audit boundary: ${esc(metrics.audited_registry_records ?? state.auditedCount ?? 163)} source-audited public member profiles · ${esc(metrics.verified_country_assignments ?? 0)} verified country assignments in the public country dataset.</p></div></section>
    <section class="section about-section" id="mission-vision" data-reveal><div class="wrap"><div class="about-intro">${sectionHeading(c.about?.label || 'ABOUT THE COALITION', c.about?.title || 'A Global Platform for Responsible AI Governance', c.about?.body)}${textLink(c.about?.link || 'Learn about the Coalition', '/about/')}</div>${missionVisionGrid()}</div></section>
    <section class="section members-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading(c.membership?.label || 'FEATURED MEMBERS', c.membership?.title || 'Meet Our Members', c.membership?.body)}</div>${button(c.membership?.link || 'View All Members', '/members/')}</div><div class="member-grid featured-members">${featured.map((member) => featuredMemberCard(member)).join('')}</div></div></section>
    <section class="section leadership-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading(c.leadership?.label || 'LEADERSHIP & GOVERNANCE', c.leadership?.title || 'Coalition Leadership', c.leadership?.body)}</div>${button(c.leadership?.link || 'Meet the Founding Committee', '/leadership/founding-committee/')}</div><div class="leadership-roster">${committee.map(leadershipRosterCard).join('')}</div></div></section>
    <section class="section tracks-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading('POLICY RESEARCH', 'Six Areas of Policy Research')}</div>${textLink('All research tracks', '/policy-research/')}</div><div class="program-grid">${tracks.map((track, index) => `<a class="program-card" href="/policy-research/${slugify(track.title)}/"><span class="program-number">0${index + 1}</span><h3>${esc(track.title)}</h3><p>${esc(track.description)}</p><span class="text-link">Explore <span aria-hidden="true">→</span></span></a>`).join('')}</div></div></section>
    <section class="section initiatives-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading('CROSS-BORDER PROGRAMMES', 'Global Initiatives')}</div>${textLink('All initiatives', '/initiatives/')}</div><div class="program-grid program-grid-three">${initiatives.map((item, index) => `<a class="program-card" href="/initiatives/${slugify(item.title)}/"><span class="program-number">0${index + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><span class="text-link">Explore <span aria-hidden="true">→</span></span></a>`).join('')}</div></div></section>
    ${latestUpdatesSection()}
    <section class="join-section" data-reveal><div class="wrap join-inner"><span class="eyebrow">${esc(c.join?.label || 'PARTICIPATE')}</span><h2>${esc(c.join?.title || 'Contribute to Global AI Governance')}</h2><p>${esc(c.join?.body || 'Join an international community working to advance responsible AI policy, research and cooperation.')}</p><div class="participate-actions">${button('Apply for Membership', '/membership/apply/')} ${textLink('Submit a Contribution', '/contribute/submit/')}</div><div class="participate-meta">${textLink('Membership eligibility', '/membership/eligibility/')}</div></div></section>
  </main>`;
}
function publicationSection() { if (state.publications.length) return `<section class="section editorial-section" data-reveal><div class="wrap"><div class="section-row"><div>${sectionHeading('INSTITUTIONAL LIBRARY', 'Publications & resources')}</div>${button('Browse all publications', '/publications/')}</div><div class="publication-list">${state.publications.map((item) => `<article class="publication-card"><span class="eyebrow">${esc(item.type || 'Publication')}</span><h3>${esc(item.title)}</h3><p>${formatDate(item.date)}</p><a class="text-link" href="${esc(item.pdf_url)}" download>Download PDF · ${esc(item.file_size || '')}</a></article>`).join('')}</div></div></section>`; return `<section class="section editorial-section" data-reveal><div class="wrap publication-notice"><div>${sectionHeading('INSTITUTIONAL LIBRARY', 'Publications programme launching', 'The library will publish verified Coalition research, policy analysis and frameworks as they are approved.')}${textLink('Share your thoughts', '/contribute/submit/')}</div>${newsletterForm()}</div></section>`; }
function newsSection() { const today=new Date().toISOString().slice(0,10); const upcoming=state.events.filter(x=>x.date>=today); const archive=state.events.filter(x=>x.date<today); const news=state.news.length?`<div class="news-column"><div class="section-row"><div>${sectionHeading('NEWS','From the Coalition')}</div>${textLink('All news & events','/news-events/')}</div>${state.news.map(item=>`<article class="news-card"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><h3>${esc(item.title)}</h3>${item.summary?`<p>${esc(item.summary)}</p>`:''}${item.href?textLink('Read update',item.href):''}</article>`).join('')}</div>`:''; const events=(items,heading,kicker)=>items.length?`<div class="events-column"><div class="section-row"><div>${sectionHeading(kicker,heading)}</div></div>${items.map(item=>`<article class="event-card"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><h3>${esc(item.title)}</h3>${item.time?`<p>${esc(item.time)}${item.timezone?` · ${esc(item.timezone)}`:''}</p>`:''}${item.location?`<p>${esc(item.location)}</p>`:''}${item.register_url?button('Register',item.register_url):''}</article>`).join('')}</div>`:''; if(!news&&!upcoming.length&&!archive.length)return ''; return `<section class="section news-section" data-reveal><div class="wrap news-events-grid">${news}${events(upcoming,'Upcoming events','UPCOMING EVENTS')}${events(archive,'Past events archive','ARCHIVE')}</div></section>`; }

function directory() { const types = [...new Set(state.members.map((member) => member.membership_type).filter(Boolean))].sort(); const expertise = [...new Set(state.members.flatMap((member) => member.professional_expertise || []))].sort(); const query = state.query.toLowerCase(); const filtered = state.members.filter((member) => (!query || `${member.full_name} ${member.member_id} ${member.designation || ''} ${member.institution || ''} ${(member.professional_expertise || []).join(' ')}`.toLowerCase().includes(query)) && (!state.type || member.membership_type === state.type) && (!state.expertise || (member.professional_expertise || []).includes(state.expertise))).sort((a, b) => a.full_name.localeCompare(b.full_name)); const pageSize = 18; const shown = filtered.slice(0, state.page * pageSize); return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">MEMBER REGISTRY</span><h1>Global members</h1><p>Explore source-audited profiles from the Atlas Global South AI Policy Coalition.</p></div></section><section class="section"><div class="wrap"><div class="directory-tools"><label>Search<input id="member-search" type="search" value="${esc(state.query)}" placeholder="Name, ID or institution"></label><label>Membership type<select id="member-type"><option value="">All membership types</option>${types.map((type) => `<option value="${esc(type)}" ${state.type === type ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select></label><label>Expertise<select id="member-expertise"><option value="">All expertise</option>${expertise.map((item) => `<option value="${esc(item)}" ${state.expertise === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select></label></div><p class="data-note">${filtered.length} of ${state.members.length} source-audited profiles shown.</p><div class="member-grid directory-grid">${shown.map((member) => memberCard(member)).join('')}</div>${shown.length < filtered.length ? `<button type="button" class="button load-more" id="load-more-members">Load more members</button>` : ''}</div></section></main>`; }
function leadershipProfileSections(member) {
  const expertise = (member.professional_expertise || []).filter(Boolean);
  const links = [
    ['Official Website', member.social_links?.['Official Website']],
    ['Atlas AI Institute', member.social_links?.['Atlas AI Institute']],
    ['AI Governance Observatory', member.social_links?.['AI Governance Observatory Platform'] || member.social_links?.['AI Governance Observatory']],
    ['Research & Publications', member.social_links?.['Research & Publications']],
    ['Projects Portfolio', member.social_links?.['Projects']],
    ['Global South AI Policy Framework', member.social_links?.['Global South AI Policy Framework']],
    ['FactCheckBD', member.social_links?.['FactCheckBD']],
    ['ResearchGate', member.social_links?.['ResearchGate']],
    ['National AI Policy Framework Collection (Zenodo)', member.social_links?.['National AI Policy Framework Collection (Zenodo)']],
    ['rafi@atlasai.institute', member.social_links?.['Professional Email'] || 'mailto:rafi@atlasai.institute']
  ].filter(([, url]) => url);

  const projects = [
    {
      name: 'Atlas AI Governance Observatory',
      meta: 'AAGII-2026-v1.0 · 78 jurisdictions · 7 pillars · 250+ indicators',
      desc: 'Research and governance intelligence platform linking 10,000+ evidence signals and SHA-256 verification across Global Map, Evidence Explorer, Simulation Lab, and AI Policy Copilot modules.',
      url: member.social_links?.['AI Governance Observatory Platform'] || 'https://ai-governance-observatory.atlasai.institute'
    },
    {
      name: 'NagorikBD',
      meta: 'Published reach: 190+ upazilas · 3 divisions',
      desc: 'AI-enabled civic technology platform connecting citizens in Bangladesh with public service workflows, administrative guidance, and climate/disaster information.',
      url: member.social_links?.['Projects'] || 'https://nafiulahmadrafi.com/projects/'
    },
    {
      name: 'FactCheckBD',
      meta: 'Described dataset: ~800,000 verified records',
      desc: 'AI-assisted fact-checking and digital verification workflow matching submitted claims against structured evidence records.',
      url: member.social_links?.['FactCheckBD'] || 'https://factcheckbd.org'
    },
    {
      name: 'GhostCluster',
      meta: 'Financial Crime & AML Intelligence',
      desc: 'AML forensics and mule network intelligence suite applying technical data analysis to financial accountability challenges.',
      url: member.social_links?.['Projects'] || 'https://nafiulahmadrafi.com/projects/'
    },
    {
      name: 'Atlas Impact GIS',
      meta: 'Geospatial Intelligence',
      desc: 'GIS-oriented initiative supporting spatial analysis, public-interest mapping, and evidence-based development research.',
      url: member.social_links?.['Projects'] || 'https://nafiulahmadrafi.com/projects/'
    },
    {
      name: 'Atlas OS',
      meta: 'Linux for Android',
      desc: 'Technical software initiative bringing Linux-oriented computing capabilities to Android environments.',
      url: member.social_links?.['Projects'] || 'https://nafiulahmadrafi.com/projects/'
    }
  ];

  const publications = [
    ['Infrastructure as Sovereignty: Why Compute Autonomy is a Prerequisite for Regional AI Development', 'Presents the Atlas Global South AI Policy Framework (AG-SAIPF) v1.0.', member.social_links?.['Global South AI Policy Framework']],
    ['AI-Powered Traffic Enforcement in Bangladesh: A Governance Architecture Failure Analysis and Reform Roadmap', 'Technical and institutional accountability analysis of AI-supported enforcement workflows.', member.social_links?.['Research & Publications']],
    ['Bangladesh\u2019s Tripartite Data Silo Crisis: NID, BDRIS, and CRVS \u2014 A Citizen Infrastructure Failure and the Path to Interoperability', 'Analysis of institutional and technical interoperability barriers across national registry systems.', member.social_links?.['Research & Publications']],
    ['Global AI Policy Review 2026', 'Comparative AI governance and policy review across more than 75 countries.', member.social_links?.['Research & Publications']],
    ['Atlas Global South AI Policy Framework (AG-SAIPF), Version 1.0', 'Development-first governance reference architecture (June 2026; co-authors: Nafiul Ahmad Rafi, Almuyeed Shad, and Asif Susmith).', member.social_links?.['Global South AI Policy Framework']],
    ['Global South AI Policy Frameworks', 'Collection of 30 national AI policy blueprints for emerging and developing economies.', member.social_links?.['National AI Policy Framework Collection (Zenodo)']],
    ['Global AI Policy Maturity Index (GAPMI) 2026', 'Comparative AI policy maturity study across 40 Global South countries.', member.social_links?.['Research & Publications']]
  ];

  return `
    <section class="profile-section">
      <span class="eyebrow">01</span>
      <h3>Professional Profile</h3>
      <p>Nafiul Ahmad Rafi is an AI governance and public policy researcher, policy architect, technology developer, and institutional founder based in Dhaka, Bangladesh. He serves as Founder and Chairman of the Atlas Global South AI Policy Coalition and Founding Director of Atlas AI Institute, focusing on practical AI governance frameworks, comparative policy research, digital sovereignty, and public-interest technology for Bangladesh and the wider Global South.</p>
      <p>His work bridges comparative regulatory research and applied technical systems—examining national AI policy across more than 75 countries alongside separate multi-country governance assessments, policy maturity research, and governance intelligence infrastructure. He founded Atlas AI Institute to help developing economies build context-sensitive regulatory capacity and independent technical foundations rather than relying solely on imported policy templates.</p>
      <p>Previously, he served as a researcher in the Adviser\u2019s Team at the ICT Division, Government of Bangladesh (November 2024\u2013January 2026), contributing research on cybersecurity legislation, personal data protection, and digital governance, including work relating to the Cyber Security Act 2025 and the Personal Data Protection Ordinance 2026.</p>
    </section>

    <section class="profile-section">
      <span class="eyebrow">02</span>
      <h3>Leadership &amp; Institutional Roles</h3>
      <div class="leader-list">
        <div class="leader-item">
          <h4>Founder &amp; Chairman \u2014 Atlas Global South AI Policy Coalition</h4>
          <p>Initiated under Atlas AI Institute to address fragmented Global South representation in international AI governance. Provides founding strategic direction, institutional accountability standards, and cross-regional collaboration connecting researchers, legal scholars, policymakers, and civil society around substantive comparative research and joint policy briefs.</p>
        </div>
        <div class="leader-item">
          <h4>Founding Director \u2014 Atlas AI Institute</h4>
          <p>Leads an independent Dhaka-based research and technology institute organized across five pillars: comparative AI governance research, policy and regulatory framework development, governance intelligence infrastructure, digital public infrastructure and civic technology, and research capacity-building.</p>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <span class="eyebrow">03</span>
      <h3>Professional Experience</h3>
      <div class="leader-list">
        <div class="leader-item">
          <h4>Founding Director \u2014 Atlas AI Institute</h4>
          <span class="leader-meta">January 2024\u2013Present · Dhaka, Bangladesh</span>
          <p>Directs comparative policy studies, national AI framework design, AI governance monitoring tools, and public-interest digital systems focused on institutional readiness and digital sovereignty.</p>
        </div>
        <div class="leader-item">
          <h4>Researcher, Adviser\u2019s Team \u2014 ICT Division, Government of Bangladesh</h4>
          <span class="leader-meta">November 2024\u2013January 2026 · Dhaka, Bangladesh</span>
          <p>Contributed research and policy analysis on cybersecurity, personal data protection, and digital governance, including work relating to the Cyber Security Act, 2025 and the Personal Data Protection Ordinance, 2026 (PDPO).</p>
        </div>
      </div>
      <div class="leader-affiliations">
        <strong>International Affiliations &amp; Civic Engagement</strong>
        <ul>
          <li><span>AI Policy Lab, Ume\u00e5 University, Sweden</span> \u2014 AI Policy Endorser</li>
          <li><span>AI at Large</span> \u2014 Global AI Observer</li>
          <li><span>Internet Society \u2014 Dhaka Chapter</span> \u2014 Member</li>
          <li><span>CIVICUS</span> \u2014 Voting Member</li>
          <li><span>Responsible AI Hub</span> \u2014 Member</li>
        </ul>
      </div>
    </section>

    <section class="profile-section">
      <span class="eyebrow">04</span>
      <h3>Selected Research &amp; Policy Work</h3>
      <div class="leader-list">
        <div class="leader-item">
          <h4>75+ Country Global AI Policy Review 2026 &amp; 75-Country SWOT Analysis</h4>
          <p>Comparative research examining national AI strategies, regulatory approaches, safety standards, and institutional capacity across 75+ countries. Comparative research coverage does not imply operational presence or constitute an official government assessment.</p>
        </div>
        <div class="leader-item">
          <h4>38-Country AI Governance Monograph</h4>
          <p>Separate comparative monograph examining national regulatory models, institutional structures, and implementation challenges across 38 nations.</p>
        </div>
        <div class="leader-item">
          <h4>40-Country Global South AI Policy Maturity Research (GAPMI 2026)</h4>
          <p>Comparative policy maturity research across 40 Global South countries focused on institutional readiness and governance capacity, distinct from the 75-country review and the 78-jurisdiction Observatory dataset.</p>
        </div>
        <div class="leader-item">
          <h4>35 National AI Governance Assessments</h4>
          <p>Portfolio of national assessments evaluating regulatory maturity, institutional arrangements, data governance, and public-sector AI adoption challenges.</p>
        </div>
        <div class="leader-item">
          <h4>30 National AI Policy Frameworks &amp; Atlas Global South AI Policy Framework</h4>
          <p>Collection of 30 national AI policy blueprints for developing economies (<a class="inline-link" href="https://doi.org/10.5281/zenodo.20855849" target="_blank" rel="noopener noreferrer">Zenodo DOI ↗</a>), alongside AG-SAIPF v1.0 (June 2026; co-authored with Almuyeed Shad and Asif Susmith) and Bangladesh national AI governance studies.</p>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <span class="eyebrow">05</span>
      <h3>Flagship Projects &amp; Digital Systems</h3>
      <div class="leader-card-grid">
        ${projects.map((p) => `<article class="leader-mini-card"><h4>${esc(p.name)}</h4><span class="leader-meta">${esc(p.meta)}</span><p>${esc(p.desc)}</p>${p.url ? `<a class="text-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Resource <span aria-hidden="true">↗</span></a>` : ''}</article>`).join('')}
      </div>
    </section>

    <section class="profile-section">
      <span class="eyebrow">06</span>
      <h3>Selected Publications</h3>
      <ol class="leader-pub-list">
        ${publications.map(([title, note, url]) => `<li><strong>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>` : esc(title)}</strong><span>${esc(note)}</span></li>`).join('')}
      </ol>
      <p class="leader-note">Full portfolio of 14 full-text research publications and technical reports: <a class="inline-link" href="https://nafiulahmadrafi.com/publication/" target="_blank" rel="noopener noreferrer">nafiulahmadrafi.com/publication/ ↗</a></p>
    </section>

    <section class="profile-section">
      <span class="eyebrow">07</span>
      <h3>Expertise &amp; Research Areas</h3>
      <div class="tag-row">${expertise.map((item) => `<span>${esc(item)}</span>`).join('')}</div>
      <p class="leader-note">Technical capabilities span Python, Java, LLM/RAG workflows, Next.js, Supabase, open data APIs, GIS spatial systems, governance assurance, and climate resilience intelligence.</p>
    </section>

    <section class="profile-section">
      <span class="eyebrow">08</span>
      <h3>Education</h3>
      <div class="leader-item">
        <h4>Bachelor of Arts (B.A.) in Political Science</h4>
        <span class="leader-meta">National University, Bangladesh</span>
        <p>Academic foundation in political institutions, governance, public policy, and political systems.</p>
      </div>
    </section>

    <section class="profile-section">
      <span class="eyebrow">09</span>
      <h3>Founder\u2019s Statement</h3>
      <blockquote class="leader-quote">
        <p>\u201cThe future of AI governance cannot be shaped by technological power alone; it must reflect the institutions, development priorities, rights, and aspirations of the societies living with its consequences. Developing countries must move beyond passive policy adoption and build the research capacity and institutional foundations needed to shape global AI standards.</p>
        <p>I founded Atlas AI Institute to connect rigorous research with policy and technical implementation, and initiated the Atlas Global South AI Policy Coalition to unite expertise across regions\u2014not merely to join global debates, but to equip the Global South to help define its own AI future.\u201d</p>
        <footer>Nafiul Ahmad Rafi \u00b7 Founder &amp; Chairman, Atlas Global South AI Policy Coalition \u00b7 Founding Director, Atlas AI Institute</footer>
      </blockquote>
    </section>

    <section class="profile-section">
      <span class="eyebrow">10</span>
      <h3>Professional Links</h3>
      <div class="leader-links-grid">
        ${links.map(([label, href]) => `<a class="leader-link-chip" href="${esc(href)}"${href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"'}><span>${esc(label)}</span><span aria-hidden="true">↗</span></a>`).join('')}
      </div>
    </section>
  `;
}

function profile(slug) {
  const member = state.members.find((item) => item.slug === slug);
  if (!member) return missing();
  const orderedMembers = [...state.members].sort((a, b) => a.full_name.localeCompare(b.full_name));
  const profileIndex = orderedMembers.findIndex((item) => item.slug === slug);
  const prevMember = orderedMembers[profileIndex - 1];
  const nextMember = orderedMembers[profileIndex + 1];
  const committeeEntry = state.committee.find((item) => item.profile_slug === slug);
  const isExecutive = member.slug === 'nafiul-ahmad-rafi';
  const photo = member.photo ? member.photo.replace('/assets/member-photos/', '/assets/member-photos/webp/').replace(/\.(png|jpg|jpeg)$/i, '.webp').replace(/\.webp$/, '-256.webp') : '';
  const bio = member.biography ? cleanPublicText(member.biography).split(/\n+/).filter(Boolean).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('') : '';
  const expertise = (member.professional_expertise || []).filter(Boolean);
  const primaryActionUrl = member.social_links?.linkedin || member.social_links?.['Official Website'];
  const primaryActionLabel = member.social_links?.linkedin ? 'LinkedIn' : 'Official Website';

  const sectionsHtml = isExecutive
    ? leadershipProfileSections(member)
    : `${bio ? `<section class="profile-section"><h3>Biography</h3>${bio}</section>` : ''}${expertise.length ? `<section class="profile-section"><h3>Areas of expertise</h3><div class="tag-row">${expertise.map((item) => `<span>${esc(item)}</span>`).join('')}</div></section>` : ''}${member.qualification ? `<section class="profile-section"><h3>Qualification</h3><p>${esc(member.qualification)}</p></section>` : ''}`;

  return `<main class="profile-page"><div class="wrap breadcrumbs"><a href="/">Home</a><span>/</span><a href="/members/">Members</a><span>/</span><span>${esc(member.full_name)}</span></div><section class="wrap profile-layout"><aside class="profile-card"><div class="profile-banner"></div><div class="profile-avatar">${photo ? `<picture><source type="image/webp" srcset="${esc(photo)}"><img src="${esc(photo)}" alt="${esc(member.photo_alt || member.full_name)}" width="256" height="256" fetchpriority="high"></picture>` : `<span>${esc(initials(member.full_name))}</span>`}</div><div class="profile-card-body"><span class="eyebrow">${esc(member.membership_type || 'Coalition member')}</span><h1>${esc(member.full_name)}</h1>${member.designation ? `<p class="profile-role">${esc(member.designation)}</p>` : ''}${member.institution ? `<p class="member-field">${esc(isExecutive ? `Founding Director, ${member.institution}` : member.institution)}</p>` : ''}${member.country ? `<p class="member-field">${esc(member.country)}</p>` : ''}${primaryActionUrl ? `<a class="button profile-button" href="${esc(primaryActionUrl)}" target="_blank" rel="noopener noreferrer">${esc(primaryActionLabel)} ↗</a>` : ''}</div></aside><div class="profile-content"><span class="eyebrow">${isExecutive ? `LEADERSHIP PROFILE · ${esc(member.member_id)}` : 'PUBLIC PROFILE'}</span><h2>${isExecutive ? esc(member.designation || 'Founder & Chairman, Atlas Global South AI Policy Coalition') : committeeEntry ? esc(committeeEntry.designation || committeeEntry.responsibility || 'Founding Committee member') : 'Coalition member'}</h2>${committeeEntry ? `<p class="profile-callout">${isExecutive ? `Founding Committee · Founding Director, ${esc(member.institution)}` : `Founding Committee · ${esc(committeeEntry.designation || committeeEntry.responsibility || '')}`}</p>` : ''}${sectionsHtml}<nav class="profile-pagination" aria-label="Member profiles">${prevMember ? textLink(`← ${prevMember.full_name}`, `/members/${prevMember.slug}/`) : '<span></span>'}${textLink('Back to registry', '/members/')}${nextMember ? textLink(`${nextMember.full_name} →`, `/members/${nextMember.slug}/`) : '<span></span>'}</nav></div></section></main>`;
}
function countries() { return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">GLOBAL REACH</span><h1>Member countries</h1><p>${esc(state.metrics.reported_member_countries ?? 55)} countries are reported in the coalition brief; the public country dataset currently contains ${esc(state.metrics.verified_country_assignments ?? 0)} verified assignments.</p></div></section><section class="section"><div class="wrap"><div class="country-overview"><div>${sectionHeading('INTERACTIVE DIRECTORY', 'Explore verified country records', 'Country names, regions and member counts are shown only when they are explicitly present in the authoritative country dataset.')}${worldMap()}</div><aside class="country-aside"><span class="eyebrow">DATA STATUS</span><strong>${esc(state.metrics.verified_country_assignments ?? 0)}</strong><p>verified country assignments</p>${textLink('Browse the member registry', '/members/')}</aside></div>${countryDirectory()}</div></section></main>`; }
function leadershipOverview() { return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">LEADERSHIP & GOVERNANCE</span><h1>Founding Committee</h1><p>${esc(site.name)} is convened by ${esc(site.parent)}. The Founding Committee helps guide the Coalition’s early work and shared direction.</p></div></section>${committeeRosterSection('LEADERSHIP & GOVERNANCE', 'Members and roles', 'The public roster and responsibility areas supplied by the Coalition.')}</main>`; }
function foundingCommittee() { return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">FOUNDING COMMITTEE</span><h1>${esc(state.committeeType)}</h1><p>${esc(state.committeeName)}, convened by ${esc(state.committeeHost)}.</p></div></section>${committeeRosterSection('FOUNDING COMMITTEE', 'Members and roles', 'The public roster and responsibility areas supplied by the Coalition.')}</main>`; }
function committeeRosterSection(kicker, title, description) {
  return `<section class="section committee-page"><div class="wrap">${sectionHeading(kicker, title, description)}<div class="committee-grid">${state.committee.map(committeeCard).join('')}</div>${committeeFaq()}</div></section>`;
}
function committeeFaqItems() { return [['What is the Founding Committee?', `The ${state.committeeType} is the public leadership group that helps guide the Coalition’s early work and shared direction.`], ['How are roles described?', 'The public roster uses responsibility areas supplied by the Coalition, including research collaboration, public policy, AI governance, law and rights, Indigenous knowledge, multilingualism and cultural governance.'], ['How can researchers and institutions engage?', 'Researchers and institutions can explore membership, submit contributions for editorial review or contact the Coalition about research collaboration and policy engagement.']]; }
function committeeFaq() { return `<div class="faq"><span class="eyebrow">ABOUT THE COMMITTEE</span><h3>Questions about governance</h3>${committeeFaqItems().map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div>`; }

const contentPages = { '/about/': ['ABOUT THE COALITION', 'Advancing Inclusive, Accountable and Responsible AI Governance Worldwide', 'The Atlas Global South AI Policy Coalition is an international policy and research platform bringing together researchers, academics, policymakers, legal experts, technology practitioners, civil society representatives and institutional partners to advance inclusive, accountable and responsible artificial intelligence governance.', 'Convened by Atlas AI Institute, the Coalition provides a collaborative platform for international dialogue, evidence-informed policy research, knowledge exchange and institutional cooperation.', ['Inclusivity', 'Evidence and Research', 'Human Rights', 'Transparency', 'International Cooperation', 'Responsible Innovation']], '/about/mission-and-vision/': ['MISSION & VISION', 'Governance that serves humanity', 'The Coalition exists to strengthen international cooperation on AI governance by connecting expertise, advancing policy research, supporting institutional capacity and promoting inclusive participation in global AI policy development.', 'Its vision is a world where artificial intelligence is developed, governed and deployed in ways that respect human rights, strengthen public institutions, promote equitable opportunities and reflect diverse social realities.', ['Inclusive participation', 'Evidence-informed policy research', 'Human rights and accountability', 'Institutional capacity and cooperation']], '/about/organizational-structure/': ['ORGANIZATIONAL STRUCTURE', 'A clear foundation for cooperation', 'The Coalition is convened by Atlas AI Institute and brings together individual members, institutional representatives, working groups and a Founding Committee.', 'The public structure separates participation in the member community from formal leadership and committee appointments.', ['Atlas AI Institute — institutional host and secretariat support', 'Members — research, dialogue and knowledge exchange', 'Working groups — thematic and cross-border cooperation', 'Founding Committee — guidance across governance, policy and research']], '/about/governance/': ['GOVERNANCE', 'Principles for accountable cooperation', 'The Coalition’s governance approach is grounded in integrity, independence, transparency, human dignity and responsible collaboration.', 'Participants are expected to represent credentials accurately, disclose relevant conflicts, respect confidentiality and distinguish personal views from official Coalition positions.', ['Integrity and independence', 'Respect for human rights and cultural difference', 'Evidence-informed decision-making', 'Constructive participation and accountability']], '/membership/eligibility/': ['MEMBERSHIP ELIGIBILITY', 'Who can participate', 'The Coalition welcomes qualified individuals and institutional representatives interested in responsible AI governance and international policy cooperation.', 'Applicants should demonstrate relevant professional, academic or practical experience in AI, law, policy, technology, research or related fields; interest in inclusive AI governance; commitment to the Code of Conduct; and accurate application information.', ['Researchers and academics', 'Legal and policy professionals', 'Technology and civil society practitioners', 'Students and early-career professionals']], '/privacy/': ['PRIVACY POLICY', 'Responsible information use', 'The Coalition uses submitted information for the purpose for which it is provided: reviewing membership applications, responding to inquiries or conducting editorial review of contributions.', 'Application and contact information is not added to the public member registry automatically. Public profile information is shown only after the relevant approval process.', ['Application review', 'Inquiry response', 'Editorial contribution review', 'Public profile publication only after approval']], '/terms/': ['TERMS OF USE', 'Using this site responsibly', 'This website publishes Coalition information, public member profiles and editorial resources for information and participation purposes.', 'Use public information accurately, respect intellectual property and do not present personal views or public profile information as an official position beyond the source context.', ['Respect source attribution', 'Use public information responsibly', 'Do not misrepresent affiliation', 'Contact the Coalition with corrections']], '/accessibility/': ['ACCESSIBILITY', 'A more accessible public record', 'The Coalition is committed to a website that can be navigated with a keyboard, understood with assistive technology and read across screen sizes.', 'If you encounter an accessibility barrier, contact the Coalition so it can be reviewed alongside the affected page or component.', ['Keyboard navigation', 'Visible focus states', 'Semantic landmarks', 'Reduced-motion support']] };
function lastUpdatedBlock() { const value = state.siteConfig?.contentLastUpdated || '2026-11-16'; return `<p class="last-updated"><span class="eyebrow">CONTENT STATUS</span> Last updated <time datetime="${esc(value)}">${esc(formatDate(value))}</time></p>`; }
function citationBlock() { return `<aside class="citation-note"><span class="eyebrow">HOW TO CITE</span><p>${esc(site.name)}. “${esc(site.name)}.” ${esc(site.officialDomain)}/</p></aside>`; }
function faqBlock(items) { return `<section class="section faq-section"><div class="wrap"><div class="section-heading"><span class="eyebrow">FAQ</span><h2>Questions and answers</h2></div><div class="faq">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section>`; }
function aboutFaqItems() { return [['What is the Atlas Global South AI Policy Coalition?', state.homepage?.about?.body || 'The Coalition brings together researchers, academics, legal experts, policy professionals and institutional partners to strengthen international dialogue on AI governance.'], ['Who convenes the Coalition?', `The Coalition is convened by ${site.parent}.`], ['What does the Coalition focus on?', 'Inclusive participation, evidence-informed policy research, human rights and accountability, and institutional capacity and cooperation.'], ['Who can participate?', 'Researchers, academics, legal experts, policy professionals and institutional partners can participate through the Coalition’s public pathways.'], ['How can people engage?', 'People can explore membership, submit contributions for editorial review or contact the Coalition about research collaboration and policy engagement.'], ['Does the Coalition publish research?', 'The publication programme will publish verified Coalition research, policy analysis and frameworks as they are approved.']]; }
function membershipFaqItems() { return [['Who is membership for?', 'The Coalition welcomes researchers, legal scholars, policy professionals, technologists and institutional representatives who want to contribute to inclusive, evidence-informed AI governance.'], ['What does membership connect people to?', 'Membership connects people with peers and gives them a place to contribute research, perspective and experience to international AI governance conversations.'], ['What can members contribute?', 'Members can contribute to research and policy dialogue and submit expert work for editorial review.'], ['What is the public member registry?', 'The Global Member Registry contains source-audited public profiles from the Coalition.'], ['How are applications reviewed?', 'Applications are reviewed manually by the Coalition team. Approval does not happen automatically.'], ['How can I apply?', 'Use the Apply for Membership pathway to submit information for manual review.']]; }
function keyFactsBlock() { const m=state.metrics || {}; const regions=state.homepage?.global_reach?.regions || []; return `<section class="key-facts" aria-labelledby="key-facts-title"><span class="eyebrow">KEY FACTS</span><h2 id="key-facts-title">The Coalition at a glance</h2><dl><div><dt>Name</dt><dd>${esc(site.name)}</dd></div><div><dt>Convened by</dt><dd>${esc(site.parent)}</dd></div><div><dt>First convened</dt><dd>Not published in the public source</dd></div><div><dt>Member profiles today</dt><dd>${esc(m.audited_registry_records ?? state.auditedCount ?? 163)} source-audited profiles</dd></div><div><dt>Reported member countries</dt><dd>${esc(m.reported_member_countries ?? 55)} reported countries</dd></div><div><dt>Regions</dt><dd>${esc(regions.join(', ') || String(m.global_regions ?? 5))}</dd></div><div><dt>Research tracks</dt><dd>${esc(m.core_research_tracks ?? 6)}</dd></div><div><dt>Contact</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div></dl></section>`; }
function aboutPage() {
  const m = state.metrics || {};
  return `<main class="about-page">
    <section class="page-hero about-hero">
      <div class="wrap">
        <span class="eyebrow">ABOUT THE COALITION</span>
        <h1>Advancing Inclusive, Accountable and Responsible AI Governance Worldwide</h1>
        <p>The Atlas Global South AI Policy Coalition is an international policy and research platform bringing together researchers, academics, policymakers, legal experts, technology practitioners, civil society representatives and institutional partners to advance inclusive, accountable and responsible artificial intelligence governance.</p>
        ${lastUpdatedBlock()}
      </div>
    </section>
    ${breadcrumbs([{label:'Home',href:'/'},{label:'About the Coalition'}])}
    <section class="section">
      <div class="wrap editorial-layout">
        <article class="editorial-card about-narrative-card">
          <div class="about-block">
            <span class="eyebrow">INSTITUTIONAL PLATFORM</span>
            <h2>Advancing Responsible AI Governance Worldwide</h2>
            <p>The Atlas Global South AI Policy Coalition is an international policy and research platform bringing together researchers, academics, policymakers, legal experts, technology practitioners, civil society representatives and institutional partners to advance inclusive, accountable and responsible artificial intelligence governance.</p>
            <p>Convened by Atlas AI Institute, the Coalition provides a collaborative platform for international dialogue, evidence-informed policy research, knowledge exchange and institutional cooperation. It seeks to strengthen the participation of diverse regional perspectives in shaping the development, governance and deployment of artificial intelligence.</p>
            <p>As AI technologies increasingly influence public institutions, economies, societies and fundamental rights, the Coalition works to connect expertise across disciplines and regions, support informed policy development and encourage practical approaches to responsible AI governance.</p>
          </div>

          <div class="about-block">
            <span class="eyebrow">OUR PURPOSE</span>
            <h2>Bridging Global Dialogue with Diverse Realities</h2>
            <p>AI governance requires more than technological expertise. It requires international cooperation, institutional capacity, legal safeguards, public accountability and meaningful participation from communities affected by AI systems.</p>
            <p>The Coalition exists to help bridge the gap between global AI governance discussions and the diverse institutional, legal, social and economic realities of countries and regions around the world.</p>
            <p>Through collaborative research, policy engagement and professional networks, we aim to contribute to a more inclusive and accountable global AI governance ecosystem.</p>
          </div>

          <div class="about-mission" style="margin-top:0; padding-top:0; border-top:0; margin-bottom:34px;">
            <div class="mandate-card">
              <div class="mandate-header">
                <span class="eyebrow">OUR MISSION</span>
                <h3>Mission</h3>
              </div>
              <p>To strengthen international cooperation on AI policy and governance by connecting multidisciplinary expertise, supporting evidence-based research, advancing human rights and accountability, and promoting inclusive participation in AI-related decision-making.</p>
            </div>
            <div class="mandate-card mandate-card--vision">
              <div class="mandate-header">
                <span class="eyebrow">OUR VISION</span>
                <h3>Vision</h3>
              </div>
              <p>A world where artificial intelligence is developed, governed and deployed responsibly, where fundamental rights are protected, institutional capacities are strengthened, and all regions have meaningful opportunities to contribute to global AI governance.</p>
            </div>
          </div>

          <div class="about-block">
            <span class="eyebrow">STRATEGIC PILLARS</span>
            <h2>Our Strategic Objectives</h2>
            <div class="objectives-grid">
              <div class="objective-card">
                <span class="objective-num">01</span>
                <h4>1. Inclusive Global Policy Dialogue</h4>
                <p>Create opportunities for researchers, policymakers, academics and practitioners from diverse regions to participate in international AI governance discussions.</p>
              </div>
              <div class="objective-card">
                <span class="objective-num">02</span>
                <h4>2. Evidence-Informed Policy Research</h4>
                <p>Support collaborative research, comparative policy analysis and practical recommendations addressing emerging AI governance challenges.</p>
              </div>
              <div class="objective-card">
                <span class="objective-num">03</span>
                <h4>3. Human Rights and Accountability</h4>
                <p>Promote human rights-centred approaches to AI governance, including transparency, fairness, privacy, accountability and protection against algorithmic harm.</p>
              </div>
              <div class="objective-card">
                <span class="objective-num">04</span>
                <h4>4. Institutional Capacity Development</h4>
                <p>Encourage knowledge exchange, institutional learning and professional collaboration to strengthen national and regional AI governance capabilities.</p>
              </div>
              <div class="objective-card">
                <span class="objective-num">05</span>
                <h4>5. International Cooperation</h4>
                <p>Build connections among academic institutions, research organisations, civil society, policy professionals and relevant institutional stakeholders.</p>
              </div>
              <div class="objective-card">
                <span class="objective-num">06</span>
                <h4>6. Multidisciplinary Collaboration</h4>
                <p>Bring together expertise in technology, law, public policy, ethics, economics, human rights and social sciences to address complex AI governance challenges.</p>
              </div>
            </div>
          </div>

          <div class="about-block">
            <span class="eyebrow">CORE PRINCIPLES</span>
            <h2>Our Core Principles</h2>
            <p>The Coalition's work is guided by six interconnected principles:</p>
            <div class="principles-grid">
              <div class="principle-card">
                <strong>Inclusivity</strong>
                <p>Meaningful participation across geographical, institutional and disciplinary boundaries.</p>
              </div>
              <div class="principle-card">
                <strong>Evidence and Research</strong>
                <p>Policy discussions grounded in credible research, verifiable information and practical analysis.</p>
              </div>
              <div class="principle-card">
                <strong>Human Rights</strong>
                <p>Respect for fundamental rights, dignity, equality and individual freedoms.</p>
              </div>
              <div class="principle-card">
                <strong>Transparency</strong>
                <p>Openness, responsible institutional practices and accountable governance.</p>
              </div>
              <div class="principle-card">
                <strong>International Cooperation</strong>
                <p>Constructive engagement and knowledge exchange across countries and regions.</p>
              </div>
              <div class="principle-card">
                <strong>Responsible Innovation</strong>
                <p>Encouraging AI development and deployment that serves the public interest.</p>
              </div>
            </div>
          </div>

          <div class="about-block">
            <span class="eyebrow">RESEARCH &amp; POLICY PRIORITIES</span>
            <h2>Our Research and Policy Priorities</h2>
            <p>The Coalition supports interdisciplinary engagement across six interconnected research tracks:</p>
            <ol class="priorities-roster">
              <li><span>01</span> <strong>AI Governance, Policy and Institutional Frameworks</strong></li>
              <li><span>02</span> <strong>AI Ethics, Human Rights and Accountability</strong></li>
              <li><span>03</span> <strong>AI Regulation, Law and International Cooperation</strong></li>
              <li><span>04</span> <strong>AI, Democracy, Information Integrity and Digital Rights</strong></li>
              <li><span>05</span> <strong>AI for Public Interest, Development and Social Impact</strong></li>
              <li><span>06</span> <strong>Emerging Technologies, Algorithmic Systems and Future Governance</strong></li>
            </ol>
            <p class="about-note">These research priorities provide a foundation for collaborative research, policy dialogue, publications and future initiatives.</p>
            <div style="margin-top:16px;">
              ${textLink('Discover our research tracks & publications', '/policy-research/')}
            </div>
          </div>

          <div class="about-block">
            <span class="eyebrow">PROFESSIONAL COMMUNITY</span>
            <h2>A Multiregional Professional Network</h2>
            <p>The Coalition brings together professionals and researchers across Asia-Pacific, Africa, Europe, the Americas and the Middle East and North Africa (MENA).</p>
            <p>Its network includes academics, independent researchers, legal professionals, policy specialists, technology experts and institutional collaborators.</p>
            <p>The Coalition's member registry provides a structured overview of its international professional network, supporting visibility, knowledge exchange and opportunities for collaboration.</p>
            <div style="margin-top:18px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
              <a class="button" href="/members/">Explore Global Members</a>
              <a class="text-link" href="/member-countries/">Explore Member Countries <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>

          <div class="about-block">
            <span class="eyebrow">COALITION DATA</span>
            <h2>The Coalition at a Glance</h2>
            <div class="glance-grid">
              <div class="glance-item">
                <strong>${esc(m.audited_registry_records ?? state.auditedCount ?? 163)}</strong>
                <span>source-audited member profiles</span>
              </div>
              <div class="glance-item">
                <strong>${esc(m.reported_member_countries ?? 55)}</strong>
                <span>reported member countries</span>
              </div>
              <div class="glance-item">
                <strong>${esc(m.global_regions ?? 5)}</strong>
                <span>represented geographical regions</span>
              </div>
              <div class="glance-item">
                <strong>${esc(m.core_research_tracks ?? 6)}</strong>
                <span>research and policy tracks</span>
              </div>
              <div class="glance-item glance-item--wide">
                <small>CONVENING INSTITUTION</small>
                <strong>Atlas AI Institute</strong>
                <span>Institutional convening foundation &amp; research coordination</span>
              </div>
            </div>
            <p class="glance-disclaimer">
              Registry figures represent the current published profile and country records. They should not be interpreted as independently verified institutional membership or formal country representation.
            </p>
          </div>

          <div class="about-block">
            <span class="eyebrow">INSTITUTIONAL HOST</span>
            <h2>Convened by Atlas AI Institute</h2>
            <p>The Atlas Global South AI Policy Coalition is convened by Atlas AI Institute, an independent research and policy institution working on artificial intelligence governance, public-interest technology, digital policy and institutional innovation.</p>
            <p>Atlas AI Institute provides the Coalition's institutional convening foundation and supports its research coordination, policy engagement, knowledge development and international collaboration.</p>
            <p>The Coalition operates as a collaborative platform, bringing together independent expertise and institutional perspectives while maintaining its focus on responsible AI governance and international cooperation.</p>
          </div>

          <div class="about-block">
            <span class="eyebrow">POLICY ENGAGEMENT</span>
            <h2>Our Approach</h2>
            <p>The Coalition seeks to translate dialogue into meaningful policy engagement through:</p>
            <ul class="approach-checklist">
              <li>Collaborative international research.</li>
              <li>Comparative AI policy and regulatory analysis.</li>
              <li>Expert-led discussions and knowledge exchange.</li>
              <li>Policy briefs, publications and research outputs.</li>
              <li>Institutional and academic partnerships.</li>
              <li>International engagement and capacity-building initiatives.</li>
            </ul>
            <p class="about-note">Our approach prioritises practical contributions, intellectual diversity and constructive cooperation.</p>
          </div>

          <div class="about-block about-cta-block">
            <span class="eyebrow" style="color:var(--teal-ink);">PARTICIPATION</span>
            <h2>Become Part of the Conversation</h2>
            <p>The future of AI governance should be shaped through informed dialogue, international cooperation and meaningful participation.</p>
            <p>We welcome engagement from researchers, academics, policymakers, legal experts, civil society organisations, technology professionals and institutions interested in advancing responsible AI governance.</p>
            <p>Whether through research collaboration, policy engagement, institutional partnership or professional participation, there are opportunities to contribute to the Coalition's work.</p>
            <div style="margin-top:22px; display:flex; gap:14px; flex-wrap:wrap; align-items:center;">
              <a class="button" href="/membership/apply/">Apply for Membership</a>
              <a class="text-link" href="/contact/">Contact the Coalition <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>

          <div class="about-institutional-footer">
            <div>
              <small>INSTITUTIONAL CONVENOR</small>
              <strong>Atlas AI Institute</strong>
            </div>
            <div>
              <small>CONTACT EMAIL</small>
              <a href="mailto:coalition.atlasai@gmail.com">coalition.atlasai@gmail.com</a>
            </div>
            <div>
              <small>OFFICIAL DOMAIN</small>
              <a href="https://coalition.atlasai.institute/" target="_blank" rel="noopener noreferrer">coalition.atlasai.institute</a>
            </div>
            <p class="about-tagline">Atlas Global South AI Policy Coalition — An international platform for AI policy, governance, research and cooperation.</p>
          </div>
        </article>

        <aside class="editorial-aside">
          <div class="aside-box">
            <span class="eyebrow">EXPLORE THE COALITION</span>
            <h3>Institutional Navigation</h3>
            <nav class="about-nav-links" aria-label="Explore the Coalition">
              <a class="aside-nav-item" href="/members/"><span>Explore Global Members</span> <span aria-hidden="true">&rarr;</span></a>
              <a class="aside-nav-item" href="/policy-research/"><span>Discover Research Tracks</span> <span aria-hidden="true">&rarr;</span></a>
              <a class="aside-nav-item" href="/leadership/"><span>Meet the Leadership</span> <span aria-hidden="true">&rarr;</span></a>
              <a class="aside-nav-item" href="/committee-rulebook/"><span>Governance Frameworks</span> <span aria-hidden="true">&rarr;</span></a>
              <a class="aside-nav-item" href="/membership/"><span>Explore Membership</span> <span aria-hidden="true">&rarr;</span></a>
              <a class="aside-nav-item" href="/membership/apply/"><span>Apply for Membership</span> <span aria-hidden="true">&rarr;</span></a>
            </nav>
          </div>

          <div class="aside-box">
            <span class="eyebrow">MEMBERSHIP ELIGIBILITY</span>
            <h4>Who Participates</h4>
            <p>Academics, policy researchers, legal scholars, technology practitioners and civil society leaders across 55 member countries.</p>
            ${textLink('Review Eligibility Criteria', '/membership/eligibility/')}
          </div>

          <div class="aside-box">
            <span class="eyebrow">CONVENING INSTITUTION</span>
            <h4>Atlas AI Institute</h4>
            <p>Independent research institution advancing AI governance, public-interest technology and digital sovereignty.</p>
            <a class="text-link" href="https://www.linkedin.com/company/atlas-ai-institute/" target="_blank" rel="noopener noreferrer">Atlas AI Institute on LinkedIn <span aria-hidden="true">&nearr;</span></a>
          </div>
        </aside>
      </div>
    </section>
    ${citationBlock()}
    ${faqBlock(aboutFaqItems())}
  </main>`;
}
function genericPage(path) { const c = contentPages[path] || ['COALITION INFORMATION', 'Public information for participation', 'Explore the Coalition’s membership, research, governance and participation pathways.', 'The public site is organised around verified source data and clearly marked content boundaries.', ['Membership', 'Research and initiatives', 'Member registry', 'Institutional contact']]; return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">${esc(c[0])}</span><h1>${esc(c[1])}</h1><p>${esc(c[2])}</p>${lastUpdatedBlock()}</div></section><section class="section"><div class="wrap editorial-layout"><article class="editorial-card"><span class="eyebrow">ATLAS GLOBAL SOUTH AI POLICY COALITION</span><h2>${esc(c[1])}</h2><p>${esc(c[3])}</p>${path === '/about/mission-and-vision/' ? missionVisionGrid() : ''}<div class="pill-list">${c[4].map((item) => `<span>${esc(item)}</span>`).join('')}</div>${path === '/about/' ? keyFactsBlock() : ''}</article><aside class="editorial-aside"><span class="eyebrow">CONTINUE EXPLORING</span><h3>Find the right pathway</h3><p>Review the member registry, research programme, governance pages or membership pathway.</p>${button('Explore membership', '/membership/')}</aside></div></section>${path === '/about/' ? `${citationBlock()}${faqBlock(aboutFaqItems())}` : ''}</main>`; }
function membershipPage() { const benefits = ['Connect with peers across five global regions', 'Contribute to research and policy dialogue', 'Submit expert work for editorial review', 'Build a public profile from verified information']; return `<main><section class="hero"><div class="wrap hero-grid membership-hero"><div class="hero-copy"><span class="eyebrow">MEMBERSHIP</span><h1>Join a global community shaping responsible AI</h1><p>The Coalition welcomes researchers, legal scholars, policy professionals, technologists and institutional representatives who want to contribute to inclusive, evidence-informed AI governance.</p>${lastUpdatedBlock()}<div class="hero-actions">${button(t('apply'), '/membership/apply/')} ${textLink(t('criteria'), '/membership/eligibility/')}</div></div><div class="membership-visual"><span class="eyebrow">${esc(state.metrics.reported_member_countries ?? 55)} REPORTED MEMBER COUNTRIES</span><strong>${esc(state.metrics.audited_registry_records ?? state.auditedCount)} source-audited profiles</strong></div></div></section><section class="section"><div class="wrap"><div class="section-heading">${sectionHeading('WHY JOIN', 'A community built on expertise and cooperation', 'Membership connects you with peers and gives you a place to contribute research, perspective and experience to international AI governance conversations.')}</div><div class="benefit-grid">${benefits.map((benefit, index) => `<article><span class="program-number">0${index + 1}</span><h3>${esc(benefit)}</h3></article>`).join('')}</div><div class="section-action">${button('Apply for Membership', '/membership/apply/')}</div></div></section>${faqBlock(membershipFaqItems())}</main>`; }
function contributionForm() { return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">OPEN EDITORIAL SUBMISSIONS</span><h1>Share your research and insight</h1><p>Send an article, policy analysis or expert thought to the Coalition for editorial review.</p></div></section><section class="section"><div class="wrap form-layout"><div class="form-intro">${sectionHeading('EDITORIAL REVIEW', 'Three steps from submission to publication', 'Approved contributions are prepared for a global readership; submission does not guarantee acceptance.')}${[['01', 'Submit', 'Send your original work.'], ['02', 'Review', 'The editorial team assesses fit and clarity.'], ['03', 'Publish', 'Approved work is prepared for publication.']].map(([number, title, body]) => `<div class="process-step"><b>${number}</b><strong>${title}</strong><p>${body}</p></div>`).join('')}</div><form class="institutional-form" id="contribution-form"><div class="sr-only"><label>Leave blank<input name="botcheck" tabindex="-1" autocomplete="off"></label></div><h2>Submit a contribution</h2><label>Your name <span>*</span><input name="name" autocomplete="name" required></label><label>Email address <span>*</span><input type="email" name="email" autocomplete="email" required></label><label>Contribution category <span>*</span><select name="category" required><option value="">Select a category</option><option>Research Article</option><option>Policy Analysis</option><option>Expert Opinion</option><option>Thought Leadership</option></select></label><label>Article or thought <span>*</span><textarea name="message" rows="12" required></textarea></label><div class="form-status" id="contribution-status" role="status" aria-live="polite"></div><button class="submit-button" type="submit">Submit for editorial review <span aria-hidden="true">↗</span></button></form></div></section></main>`; }
function membershipApplyPage() {
  return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">MEMBERSHIP APPLICATION</span><h1>Apply for Membership</h1><p>Join a global community of researchers, policy specialists and practitioners shaping inclusive, evidence-informed AI governance.</p></div></section>${breadcrumbs([{label:'Home',href:'/'},{label:'Membership',href:'/membership/'},{label:'Apply for Membership'}])}<section class="section"><div class="wrap form-layout"><aside class="form-intro"><div class="section-heading"><span class="eyebrow">APPLICATION PROCESS</span><h2>A considered pathway to membership</h2><p>The Coalition maintains a unified membership pathway. All applicants apply as Member; admissions and working group roles are determined through institutional peer review.</p></div><div class="process-step"><b>01</b><strong>Application Submission</strong><p>Submit comprehensive personal, professional, research and institutional credentials.</p></div><div class="process-step"><b>02</b><strong>Institutional Peer Review</strong><p>Submissions are evaluated manually by the Coalition review team against active research priorities and regional representation.</p></div><div class="process-step"><b>03</b><strong>Registry Induction</strong><p>Approved applicants are formally inducted into the Global Member Registry and invited to working groups.</p></div><div class="form-note"><p><strong>Universal Membership Pathway</strong><br>There are no applicant-selectable tiers or fees. Every applicant applies for individual Coalition membership.</p><a href="mailto:${site.email}">${site.email}</a><p>Direct secretariat inquiries regarding institutional or regional participation.</p>${textLink('Review eligibility criteria', '/membership/eligibility/')}${textLink('Read privacy policy', '/privacy/')}</div></aside><div class="form-wrapper" id="membership-form-container"><form class="institutional-form membership-form-card" id="membership-form" action="https://api.web3forms.com/submit" method="POST" novalidate><input type="hidden" name="access_key" value="fedcf2cc-8d00-4d6e-9fe3-3dece7d18c82"><input type="hidden" name="subject" value="New Membership Application — Atlas Global South AI Policy Coalition"><input type="hidden" name="from_name" value="Atlas Global South AI Policy Coalition Website"><input type="hidden" name="form_type" value="membership_application"><input type="hidden" name="membership_category" value="Member"><div class="sr-only"><label>Leave blank <input name="botcheck" tabindex="-1" autocomplete="off"></label></div><h2>Apply for Membership</h2><p class="form-lead">Please provide complete, accurate information. All fields marked with an asterisk (<span style="color:var(--teal-ink);">*</span>) are mandatory.</p><div class="app-section-block"><div class="app-section-header"><span class="app-section-kicker">Section A</span><h3 class="app-section-title">Personal Information</h3><p class="app-section-desc">Basic identification and professional contact credentials.</p></div><div class="form-grid"><div class="form-field-item"><label for="app_full_name">Full Name <span>*</span></label><input id="app_full_name" name="full_name" type="text" autocomplete="name" required placeholder="e.g. Dr. Jane Doe"></div><div class="form-field-item"><label for="app_email">Professional Email Address <span>*</span></label><input id="app_email" name="email" type="email" autocomplete="email" required placeholder="e.g. j.doe@institution.org"></div><div class="form-field-item"><label for="app_country">Country of Residence <span>*</span></label><input id="app_country" name="country" type="text" required placeholder="e.g. Brazil"></div><div class="form-field-item"><label for="app_city">City <small style="color:var(--muted); font-weight:normal;">(optional)</small></label><input id="app_city" name="city" type="text" placeholder="e.g. São Paulo"></div><div class="form-field-item"><label for="app_designation">Current Designation / Professional Title <span>*</span></label><input id="app_designation" name="designation" type="text" required placeholder="e.g. Senior Policy Researcher"></div><div class="form-field-item"><label for="app_organization">Organization / Institution <span>*</span></label><input id="app_organization" name="organization" type="text" required placeholder="e.g. Centre for Digital Governance"></div><div class="form-field-item"><label for="app_organization_website">Organization Website <small style="color:var(--muted); font-weight:normal;">(optional)</small></label><input id="app_organization_website" name="organization_website" type="url" placeholder="https://example.org"></div><div class="form-field-item"><label for="app_linkedin_url">LinkedIn Profile URL <span>*</span></label><input id="app_linkedin_url" name="linkedin_url" type="url" required placeholder="https://www.linkedin.com/in/username"></div><div class="form-field-item" style="grid-column: 1 / -1;"><label for="app_website_url">Personal or Professional Website <small style="color:var(--muted); font-weight:normal;">(optional)</small></label><input id="app_website_url" name="website_url" type="url" placeholder="https://yourwebsite.com"></div></div></div><div class="app-section-block"><div class="app-section-header"><span class="app-section-kicker">Section B</span><h3 class="app-section-title">Professional Background</h3><p class="app-section-desc">Your background, current responsibilities, and areas of expertise.</p></div><div class="form-field-item"><label for="app_biography">Professional Biography <span>*</span></label><span class="field-help-text">Concise summary of your academic or professional background (minimum 100 words, maximum 300 words).</span><textarea id="app_biography" name="biography" rows="6" required placeholder="Provide your institutional biography here (100–300 words)..."></textarea><div class="word-counter-wrap" id="bio-word-counter"><span id="bio-count">0</span> / 100–300 words <span id="bio-status" class="word-count-hint">(100–300 words required)</span></div></div><div class="form-field-item"><label for="app_current_role">Current Professional Role and Responsibilities <span>*</span></label><span class="field-help-text">Describe your day-to-day focus, institutional mandate, and leadership or research activities.</span><textarea id="app_current_role" name="current_role_responsibilities" rows="4" required placeholder="Describe your current responsibilities and institutional portfolio..."></textarea></div><div class="form-field-item"><label>Primary Area of Expertise <span>*</span> <small style="color:var(--muted); font-weight:normal;">(Select all that apply)</small></label><div class="choice-grid"><label class="choice-card"><input type="checkbox" name="expertise_areas" value="AI Governance and Policy"><span>AI Governance and Policy</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Artificial Intelligence Research"><span>Artificial Intelligence Research</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Technology and Innovation"><span>Technology and Innovation</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Digital Rights and Ethics"><span>Digital Rights and Ethics</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Data Governance and Privacy"><span>Data Governance and Privacy</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Cybersecurity"><span>Cybersecurity</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Digital Public Infrastructure"><span>Digital Public Infrastructure</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="AI and Education"><span>AI and Education</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="AI and Development"><span>AI and Development</span></label><label class="choice-card"><input type="checkbox" name="expertise_areas" value="Public Policy and International Relations"><span>Public Policy and International Relations</span></label><label class="choice-card full-width"><input type="checkbox" name="expertise_areas" value="Other" id="expertise-other-toggle"><span>Other (specify below)</span></label></div><input id="app_expertise_other" name="expertise_other" class="other-text-input" type="text" placeholder="Please specify your other area of expertise..." style="display:none;"></div><div class="form-field-item"><label for="app_experience_years">Years of Professional or Research Experience <span>*</span></label><select id="app_experience_years" name="experience_years" required><option value="">Select experience level</option><option value="Student / Early Career">Student / Early Career</option><option value="1–3 years">1–3 years</option><option value="4–7 years">4–7 years</option><option value="8–12 years">8–12 years</option><option value="13+ years">13+ years</option></select></div></div><div class="app-section-block"><div class="app-section-header"><span class="app-section-kicker">Section C</span><h3 class="app-section-title">Research and Contributions</h3><p class="app-section-desc">Key research focus and how you intend to engage with the Coalition.</p></div><div class="form-field-item"><label for="app_key_research_interests">Key Research Interests <span>*</span></label><span class="field-help-text">List or describe your core areas of policy inquiry, methodology, or regional priorities.</span><textarea id="app_key_research_interests" name="key_research_interests" rows="3" required placeholder="e.g. Algorithmic transparency, sovereign compute policy, multilingual LLM evaluation..."></textarea></div><div class="form-field-item"><label for="app_publications">Relevant Publications, Research Papers or Projects <small style="color:var(--muted); font-weight:normal;">(optional)</small></label><span class="field-help-text">List published papers, policy briefs, monographs, or open software implementations.</span><textarea id="app_publications" name="publications_papers_projects" rows="3" placeholder="Titles, publications, venues, or project names..."></textarea></div><div class="form-field-item"><label>Areas Where You Can Contribute to the Coalition <span>*</span> <small style="color:var(--muted); font-weight:normal;">(Select all that apply)</small></label><div class="choice-grid"><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Policy Research"><span>Policy Research</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Research Collaboration"><span>Research Collaboration</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Policy Development"><span>Policy Development</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Knowledge Sharing"><span>Knowledge Sharing</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Events and Discussions"><span>Events and Discussions</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Regional Representation"><span>Regional Representation</span></label><label class="choice-card"><input type="checkbox" name="contribution_areas" value="Institutional Collaboration"><span>Institutional Collaboration</span></label><label class="choice-card full-width"><input type="checkbox" name="contribution_areas" value="Other" id="contribution-other-toggle"><span>Other (specify below)</span></label></div><input id="app_contribution_other" name="contribution_other" class="other-text-input" type="text" placeholder="Please specify how else you can contribute..." style="display:none;"></div><div class="form-field-item"><label for="app_links_to_work">Links to Selected Publications / Research / Projects <small style="color:var(--muted); font-weight:normal;">(optional)</small></label><span class="field-help-text">Direct URLs to repositories, publications, SSRN, Google Scholar, or institutional archives (one per line or comma-separated).</span><textarea id="app_links_to_work" name="links_to_work" rows="3" placeholder="https://..."></textarea></div></div><div class="app-section-block"><div class="app-section-header"><span class="app-section-kicker">Section D</span><h3 class="app-section-title">Motivation and Commitment</h3><p class="app-section-desc">Why you wish to join and the specific perspectives you bring to international AI governance.</p></div><div class="form-field-item"><label for="app_motivation">Why do you want to join the Atlas Global South AI Policy Coalition? <span>*</span></label><span class="field-help-text">Explain your motivation for joining the Coalition (minimum 100 words).</span><textarea id="app_motivation" name="motivation" rows="6" required placeholder="Describe your motivation, objectives, and why the Coalition aligns with your work (minimum 100 words)..."></textarea><div class="word-counter-wrap" id="motivation-word-counter"><span id="motivation-count">0</span> / min 100 words <span id="motivation-status" class="word-count-hint">(minimum 100 words required)</span></div></div><div class="form-field-item"><label for="app_perspectives">What perspectives, experience or expertise would you bring to the Coalition? <span>*</span></label><span class="field-help-text">Highlight unique regional, technical, legal, or civil-society perspectives you represent.</span><textarea id="app_perspectives" name="perspectives_and_expertise" rows="4" required placeholder="Describe the distinctive perspectives and insights you offer..."></textarea></div><div class="form-field-item"><label for="app_contribution_plan">How would you contribute to the Coalition's research, dialogue or activities? <span>*</span></label><span class="field-help-text">Concrete activities you plan to engage in (e.g. contributing to country reports, co-authoring briefs, speaking at convenings).</span><textarea id="app_contribution_plan" name="contribution_plan" rows="4" required placeholder="Detail your planned contributions and engagement..."></textarea></div><div class="form-field-item"><label for="app_collaborative_interest">Are you interested in participating in collaborative research and policy initiatives? <span>*</span></label><select id="app_collaborative_interest" name="collaborative_research_interest" required><option value="Yes">Yes — actively interested in collaborative initiatives</option><option value="Maybe">Maybe — subject to schedule and topical relevance</option><option value="No">No — primarily seeking observatory and network participation</option></select></div></div><div class="declarations-container"><h4>Declaration &amp; Institutional Consent</h4><label class="declaration-row"><input type="checkbox" name="declaration_accuracy" id="app_decl_accuracy" required><span>I confirm that the information provided is accurate and complete. <span style="color:var(--teal-ink);">*</span></span></label><label class="declaration-row"><input type="checkbox" name="declaration_no_guarantee" id="app_decl_no_guarantee" required><span>I understand that submitting an application does not guarantee membership approval. <span style="color:var(--teal-ink);">*</span></span></label><label class="declaration-row"><input type="checkbox" name="declaration_privacy" id="app_decl_privacy" required><span>I agree that my information may be processed for membership assessment in accordance with the Coalition's <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>. <span style="color:var(--teal-ink);">*</span></span></label></div><div class="form-status" id="membership-status" role="status" aria-live="polite"></div><button class="submit-button" type="submit" id="membership-submit-btn">Submit Membership Application <span aria-hidden="true">&rarr;</span></button></form></div></div></section></main>`;
}
function formPage(kind) { const title = 'Contact the Coalition'; const fields = `<div class="form-grid"><label>Full name <span>*</span><input name="name" autocomplete="name" required></label><label>Email address <span>*</span><input type="email" name="email" autocomplete="email" required></label><label>Organization <input name="organization"></label><label>Country <input name="country"></label></div><label>Inquiry type <span>*</span><select name="inquiry_type" required><option value="">Select an inquiry type</option><option>General inquiry</option><option>Membership inquiry</option><option>Research collaboration</option><option>Institutional partnership</option><option>Media and communications</option></select><label>Message <span>*</span><textarea name="message" rows="8" required></textarea>`; return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">GENERAL ENQUIRIES</span><h1>${title}</h1><p>For institutional inquiries, policy collaboration, research partnerships, media inquiries and general communication.</p></div></section><section class="section"><div class="wrap form-layout"><div class="form-intro">${sectionHeading('CONTACT', 'Tell us how we can help', `Contact ${site.name} through this form.`)}<div class="form-note"><a href="mailto:${site.email}">${site.email}</a><p>Public contact channel for Coalition enquiries.</p>${textLink('Coalition on LinkedIn',site.sameAs?.[0] || '#',' target="_blank" rel="noopener noreferrer"')}</div></div><form class="institutional-form" id="contact-form"><div class="sr-only"><label>Leave blank<input name="botcheck" tabindex="-1" autocomplete="off"></label></div><h2>${title}</h2>${fields}<label class="consent"><input type="checkbox" required><span>I agree that the information provided may be used to review or respond to this submission in accordance with the <a href="/privacy/">privacy policy</a>.</span></label><div class="form-status" id="contact-status" role="status" aria-live="polite"></div><button class="submit-button" type="submit">Send message <span aria-hidden="true">↗</span></button></form></div></section></main>`; }
function missing() { return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">404 · PAGE NOT FOUND</span><h1>This page isn’t here</h1><p>The requested page could not be found. Search the member registry or continue to a main section.</p></div></section><section class="section"><div class="wrap"><form class="directory-tools not-found-search" action="/members/" method="get"><label for="not-found-q">Search members<input id="not-found-q" name="q" type="search" aria-label="Search member registry"></label><button class="button" type="submit">Search</button></form><nav class="not-found-links" aria-label="Main sections">${textLink('About the Coalition','/about/')}${textLink('Membership','/membership/')}${textLink('Research','/policy-research/')}${textLink('Members','/members/')}${textLink('News & Events','/news-events/')}${textLink('Contact','/contact/')}</nav></div></section></main>`; }
function landingPage(path) { if (path === '/publications/') return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">INSTITUTIONAL LIBRARY</span><h1>Publications &amp; resources</h1><p>Browse the Coalition’s public publications and institutional resources.</p></div></section>${publicationSection()}${citationBlock()}</main>`; if (path === '/news/' || path === '/news-events/') return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">NEWS & EVENTS</span><h1>News, events and institutional updates</h1><p>Public updates are shown with complete dates. Upcoming events appear only when the public calendar includes confirmed details.</p></div></section>${newsSection() || `<section class="section"><div class="wrap data-note"><strong>No complete public event dates are currently recorded.</strong><p>News and event records will appear here when approved dates and details are supplied.</p></div></section>`}</main>`; if (path === '/events/') return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">EVENTS</span><h1>Upcoming events</h1><p>Confirmed public convenings will appear here with date, time, timezone, location and registration details.</p></div></section><section class="section"><div class="wrap">${state.events.length ? newsSection() : `<div class="data-note"><strong>No complete public event dates are currently recorded.</strong><p>The calendar will show an event only after its public details are verified.</p></div>`}</div></section></main>`; const items = path === '/initiatives/' ? (state.homepage?.initiatives || []) : (state.homepage?.research_tracks || []); const title = path === '/initiatives/' ? 'Global initiatives' : 'Research tracks'; const eyebrow = path === '/initiatives/' ? 'PROGRAMMES & INITIATIVES' : 'POLICY & RESEARCH'; return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>Explore the Coalition’s public programme areas and evidence-informed research agenda.</p></div></section><section class="section"><div class="wrap"><div class="program-grid ${items.length === 3 ? 'program-grid-three' : ''}">${items.map((item, index) => `<article class="program-card"><span class="program-number">0${index + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><a class="text-link" href="/contact/">Explore <span aria-hidden="true">→</span></a></article>`).join('')}</div></div></section></main>`; }
function institutionalDocumentPage(kind) { const isReader = kind === 'reader'; return genericPage(isReader ? '/accessibility/' : '/terms/'); }
function breadcrumbs(items) { return `<nav class="breadcrumbs wrap" aria-label="Breadcrumb">${items.map((item, i) => `${i ? '<span aria-hidden="true">/</span>' : ''}${item.href ? `<a href="${esc(item.href)}">${esc(item.label)}</a>` : `<span aria-current="page">${esc(item.label)}</span>`}`).join('')}</nav>`; }
function contentDetail(path, group) {
  const data = group === 'research' ? (state.homepage?.research_tracks || []) : (state.homepage?.initiatives || []);
  const item = data.find((entry) => slugify(entry.title) === path.split('/').filter(Boolean).at(-1));
  if (!item) return missing();
  const base = group === 'research' ? '/policy-research/' : '/initiatives/';
  const title = item.title;
  return `<main>${breadcrumbs([{label:'Home',href:'/'},{label:group==='research'?'Research':'Initiatives',href:base},{label:title}])}<section class="page-hero"><div class="wrap"><span class="eyebrow">${group==='research'?'POLICY & RESEARCH':'PROGRAMMES & INITIATIVES'}</span><h1>${esc(title)}</h1><p>${esc(item.description || '')}</p></div></section><section class="section"><div class="wrap editorial-layout"><article class="editorial-card"><span class="eyebrow">${group==='research'?'RESEARCH TRACK':'INITIATIVE'}</span><h2>${esc(title)}</h2>${item.description ? `<p>${esc(item.description)}</p>` : ''}</article><aside class="editorial-aside"><span class="eyebrow">RELATED</span><h3>${group==='research'?'Coalition initiatives':'Research tracks'}</h3>${textLink(group==='research'?'View initiatives':'Explore research tracks',group==='research'?'/initiatives/':'/policy-research/')}</aside></div></section></main>`;
}
function newsDetail(path, type) {
 const slug=path.split('/').filter(Boolean).at(-1); const all=type==='news'?state.news:state.events; const item=all.find(x=>slugify(x.title)===slug); if(!item)return missing();
 return `<main>${breadcrumbs([{label:'Home',href:'/'},{label:type==='news'?'News':'Events',href:type==='news'?'/news/':'/events/'},{label:item.title}])}<section class="page-hero"><div class="wrap"><span class="eyebrow">${type==='news'?'NEWS':'EVENT'}</span><h1>${esc(item.title)}</h1><p>${formatDate(item.date)}</p></div></section><section class="section"><div class="wrap reading-column"><article class="editorial-card"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time>${item.summary?`<p>${esc(item.summary)}</p>`:''}${item.location?`<p>${esc(item.location)}</p>`:''}${item.time?`<p>${esc(item.time)}${item.timezone?` · ${esc(item.timezone)}`:''}</p>`:''}${item.href?textLink('Read related update',item.href):''}${item.register_url?button('Register',item.register_url):''}</article>${textLink(type==='news'?'Back to news':'Back to events',type==='news'?'/news/':'/events/')}</div></section></main>`;
}
function countryDetail() { return `<main>${breadcrumbs([{label:'Home',href:'/'},{label:'Countries',href:'/member-countries/'},{label:'Country profile'}])}<section class="page-hero"><div class="wrap"><span class="eyebrow">COUNTRY DIRECTORY</span><h1>Country verification in progress</h1><p>Country assignments are shown only after verification in the authoritative country dataset.</p></div></section><section class="section"><div class="wrap"><div class="data-note"><strong>No country profile is available.</strong><p>The public dataset currently contains no verified country assignments.</p></div>${textLink('Browse member countries','/member-countries/')}</div></section></main>`; }
function contributionLibrary() {
 const items=state.contributions.filter(x=>x.status==='published'&&x.title);
 let body='';
 if(items.length) body=`<div class="program-grid">${items.map(x=>`<article class="program-card"><h2>${esc(x.title)}</h2>${x.date?`<p>${esc(formatDate(x.date))}</p>`:''}${x.url?textLink('Read contribution',x.url):''}</article>`).join('')}</div>`;
 else body=`<div class="data-note"><strong>No approved published contributions are currently available.</strong></div>${textLink('Share your thoughts','/contribute/submit/')}`;
 return `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">MEMBER CONTRIBUTIONS</span><h1>Contributions library</h1><p>Published contributions approved for public access.</p></div></section><section class="section"><div class="wrap">${body}</div></section></main>`;
}
function detailRoute(route) {
 if(route.startsWith('/policy-research/')) return contentDetail(route,'research');
 if(route.startsWith('/initiatives/')) return contentDetail(route,'initiatives');
 if(route.startsWith('/news/')) return newsDetail(route,'news');
 if(route.startsWith('/events/')) return newsDetail(route,'events');
 if(route.startsWith('/member-countries/')||route.startsWith('/countries/')) return countryDetail();
 if(route==='/contributions/') return contributionLibrary();
 if(route.startsWith('/contributions/')) return missing();
 if(route.startsWith('/leadership/')) { const slug=route.split('/').filter(Boolean).at(-1); const entry=state.committee.find(x=>x.profile_slug===slug||slugify(x.full_name)===slug); return entry?profile(entry.profile_slug):missing(); }
 if(route.startsWith('/publications/')) return missing();
 return null;
}
function updateRuntimeSeo(route) { const hasQuery = typeof location.search === 'string' && location.search.length > 0; const canonicalPath = route === '/global-members/' ? '/members/' : route; const canonical = `${site.officialDomain}${canonicalPath}`; let link = document.head.querySelector('link[rel=canonical]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = canonical; let robots = document.head.querySelector('meta[name=robots]'); if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); } robots.content = hasQuery ? 'noindex,follow' : 'index,follow,max-image-preview:large'; if (document.documentElement) { document.documentElement.lang = state.locale; document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr'; } }

function render() { const raw = location.pathname.replace(/\/$/, '') || '/'; const route = raw === '/' ? '/' : `${raw}/`; let body; if (route === '/') body = home(); else if (route === '/members/' || route === '/global-members/') body = directory(); else if (route.startsWith('/members/')) body = profile(route.split('/')[2]); else if (route === '/member-countries/' || route === '/countries/') body = countries(); else if (route.startsWith('/countries/') || route.startsWith('/member-countries/')) body = countryDetail(); else if (route === '/about/') body = aboutPage(); else if (contentPages[route]) body = genericPage(route); else if (route === '/leadership/') body = leadershipOverview(); else if (route === '/leadership/founding-committee/') body = foundingCommittee(); else if (route === '/membership/') body = membershipPage(); else if (route === '/membership/apply/') body = membershipApplyPage(); else if (route === '/contact/') body = formPage('contact'); else if (route === '/contribute/submit/') body = contributionForm(); else if (route === '/contribute/') body = genericPage('/about/'); else if (route === '/contributions/') body = contributionLibrary(); else if (route.startsWith('/contributions/')) body = missing(); else if (route === '/monthly-publication-programme/') body = `<main><section class="page-hero"><div class="wrap"><span class="eyebrow">PUBLICATIONS PROGRAMME</span><h1>Monthly publication programme</h1><p>The Coalition’s publication programme will share verified research, policy analysis and frameworks as they are approved.</p></div></section>${publicationSection()}</main>`; else if (route === '/reader-charter/') body = institutionalDocumentPage('reader'); else if (route === '/committee-rulebook/') body = institutionalDocumentPage('committee'); else if (route === '/policy-research/' || route === '/initiatives/' || route === '/publications/' || route === '/news/' || route === '/events/' || route === '/news-events/') body = landingPage(route); else body = detailRoute(route) || missing(); const titles = { '/': `${site.name} | AI Governance`, '/about/': `About the Coalition | ${site.name}`, '/members/': `Global Members | ${site.name}`, '/member-countries/': `Member Countries | ${site.name}`, '/leadership/': `Leadership | ${site.name}`, '/leadership/founding-committee/': `Founding Committee | ${site.name}`, '/membership/': `Membership | ${site.name}`, '/membership/apply/': `Apply for Membership | ${site.name}`, '/contact/': `Contact | ${site.name}` }; const meta = localeMetaFor(state.locale); document.title = state.locale === 'en' ? (titles[route] || `${site.name}`) : meta.title; let descriptionMeta = document.head?.querySelector('meta[name=description]'); if (descriptionMeta) descriptionMeta.content = meta.description; const app = document.querySelector('#app'); if (app) app.innerHTML = `${header()}${body}${footer()}`; updateRuntimeSeo(route); }
function setMenuState(nextOpen) {
  state.menuOpen = Boolean(nextOpen);
  const navEl = document.querySelector('.main-nav');
  const toggleEl = document.querySelector('.menu-toggle');
  const backdropEl = document.querySelector('.menu-backdrop');
  if (navEl) navEl.classList.toggle('open', state.menuOpen);
  if (toggleEl) {
    toggleEl.classList.toggle('is-open', state.menuOpen);
    toggleEl.setAttribute('aria-expanded', String(state.menuOpen));
    toggleEl.setAttribute('aria-label', state.menuOpen ? 'Close navigation' : 'Open navigation');
  }
  if (backdropEl) backdropEl.classList.toggle('open', state.menuOpen);
  if (document.body?.classList) document.body.classList.toggle('menu-locked', state.menuOpen);
}
function initMembershipApplication() {
  const form = document.querySelector('#membership-form');
  if (!form) return;

  const bioInput = form.querySelector('#app_biography');
  const bioCount = form.querySelector('#bio-count');
  const bioStatus = form.querySelector('#bio-status');
  const bioWrap = form.querySelector('#bio-word-counter');

  const motInput = form.querySelector('#app_motivation');
  const motCount = form.querySelector('#motivation-count');
  const motStatus = form.querySelector('#motivation-status');
  const motWrap = form.querySelector('#motivation-word-counter');

  const expOtherToggle = form.querySelector('#expertise-other-toggle');
  const expOtherInput = form.querySelector('#app_expertise_other');
  const contribOtherToggle = form.querySelector('#contribution-other-toggle');
  const contribOtherInput = form.querySelector('#app_contribution_other');

  const statusEl = form.querySelector('#membership-status');
  const submitBtn = form.querySelector('#membership-submit-btn');

  function getWordCount(str) {
    return (str || '').trim().split(/\s+/).filter(Boolean).length;
  }

  function updateBioCounter() {
    if (!bioInput || !bioCount || !bioStatus || !bioWrap) return;
    const words = getWordCount(bioInput.value);
    bioCount.textContent = String(words);
    if (words === 0) {
      bioWrap.className = 'word-counter-wrap';
      bioStatus.textContent = '(100–300 words required)';
    } else if (words < 100) {
      bioWrap.className = 'word-counter-wrap invalid';
      bioStatus.textContent = `(${100 - words} more word${100 - words === 1 ? '' : 's'} needed)`;
    } else if (words > 300) {
      bioWrap.className = 'word-counter-wrap invalid';
      bioStatus.textContent = `(${words - 300} word${words - 300 === 1 ? '' : 's'} over limit)`;
    } else {
      bioWrap.className = 'word-counter-wrap valid';
      bioStatus.textContent = `✓ Length requirement met (${words} words)`;
    }
  }

  function updateMotCounter() {
    if (!motInput || !motCount || !motStatus || !motWrap) return;
    const words = getWordCount(motInput.value);
    motCount.textContent = String(words);
    if (words === 0) {
      motWrap.className = 'word-counter-wrap';
      motStatus.textContent = '(minimum 100 words required)';
    } else if (words < 100) {
      motWrap.className = 'word-counter-wrap invalid';
      motStatus.textContent = `(${100 - words} more word${100 - words === 1 ? '' : 's'} needed)`;
    } else {
      motWrap.className = 'word-counter-wrap valid';
      motStatus.textContent = `✓ Length requirement met (${words} words)`;
    }
  }

  bioInput?.addEventListener('input', updateBioCounter);
  motInput?.addEventListener('input', updateMotCounter);

  expOtherToggle?.addEventListener('change', () => {
    if (!expOtherInput) return;
    expOtherInput.style.display = expOtherToggle.checked ? 'block' : 'none';
    if (expOtherToggle.checked) expOtherInput.focus();
    else expOtherInput.value = '';
  });

  contribOtherToggle?.addEventListener('change', () => {
    if (!contribOtherInput) return;
    contribOtherInput.style.display = contribOtherToggle.checked ? 'block' : 'none';
    if (contribOtherToggle.checked) contribOtherInput.focus();
    else contribOtherInput.value = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!statusEl || !submitBtn) return;

    const trap = form.querySelector('[name=botcheck]');
    if (trap?.value || trap?.checked) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Submission rejected.';
      return;
    }

    const fullName = (form.querySelector('#app_full_name')?.value || '').trim();
    const email = (form.querySelector('#app_email')?.value || '').trim().toLowerCase();
    const country = (form.querySelector('#app_country')?.value || '').trim();
    const city = (form.querySelector('#app_city')?.value || '').trim();
    const designation = (form.querySelector('#app_designation')?.value || '').trim();
    const organization = (form.querySelector('#app_organization')?.value || '').trim();
    const organizationWebsite = (form.querySelector('#app_organization_website')?.value || '').trim();
    const linkedinUrl = (form.querySelector('#app_linkedin_url')?.value || '').trim();
    const websiteUrl = (form.querySelector('#app_website_url')?.value || '').trim();

    const biography = (bioInput?.value || '').trim();
    const currentRole = (form.querySelector('#app_current_role')?.value || '').trim();
    const expertiseChecked = Array.from(form.querySelectorAll('input[name="expertise_areas"]:checked')).map((x) => x.value);
    const expertiseOther = (expOtherInput?.value || '').trim();
    const experienceYears = (form.querySelector('#app_experience_years')?.value || '').trim();

    const keyResearch = (form.querySelector('#app_key_research_interests')?.value || '').trim();
    const publications = (form.querySelector('#app_publications')?.value || '').trim();
    const contributionChecked = Array.from(form.querySelectorAll('input[name="contribution_areas"]:checked')).map((x) => x.value);
    const contributionOther = (contribOtherInput?.value || '').trim();
    const linksToWork = (form.querySelector('#app_links_to_work')?.value || '').trim();

    const motivation = (motInput?.value || '').trim();
    const perspectives = (form.querySelector('#app_perspectives')?.value || '').trim();
    const contributionPlan = (form.querySelector('#app_contribution_plan')?.value || '').trim();
    const collaborativeInterest = (form.querySelector('#app_collaborative_interest')?.value || 'Yes').trim();

    const declAccuracy = Boolean(form.querySelector('#app_decl_accuracy')?.checked);
    const declNoGuarantee = Boolean(form.querySelector('#app_decl_no_guarantee')?.checked);
    const declPrivacy = Boolean(form.querySelector('#app_decl_privacy')?.checked);

    if (!fullName) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please enter your Full Name.';
      form.querySelector('#app_full_name')?.focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please enter a valid professional email address.';
      form.querySelector('#app_email')?.focus();
      return;
    }
    if (!country) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please provide your Country of Residence.';
      form.querySelector('#app_country')?.focus();
      return;
    }
    if (!designation) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please provide your Current Designation / Professional Title.';
      form.querySelector('#app_designation')?.focus();
      return;
    }
    if (!organization) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please provide your Organization / Institution.';
      form.querySelector('#app_organization')?.focus();
      return;
    }
    if (!linkedinUrl || !/^https?:\/\//i.test(linkedinUrl)) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please provide a valid LinkedIn profile URL starting with http:// or https://';
      form.querySelector('#app_linkedin_url')?.focus();
      return;
    }

    const bioWords = getWordCount(biography);
    if (bioWords < 100 || bioWords > 300) {
      statusEl.className = 'form-status error';
      statusEl.textContent = `Professional Biography must be between 100 and 300 words (currently ${bioWords} words).`;
      bioInput?.focus();
      return;
    }

    if (!currentRole) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please describe your Current Professional Role and Responsibilities.';
      form.querySelector('#app_current_role')?.focus();
      return;
    }

    if (expertiseChecked.length === 0) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please select at least one Primary Area of Expertise.';
      return;
    }

    if (!experienceYears) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please select your Years of Professional or Research Experience.';
      form.querySelector('#app_experience_years')?.focus();
      return;
    }

    if (!keyResearch) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please detail your Key Research Interests.';
      form.querySelector('#app_key_research_interests')?.focus();
      return;
    }

    if (contributionChecked.length === 0) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please select at least one Area Where You Can Contribute to the Coalition.';
      return;
    }

    const motWords = getWordCount(motivation);
    if (motWords < 100) {
      statusEl.className = 'form-status error';
      statusEl.textContent = `Motivation statement must be at least 100 words (currently ${motWords} words).`;
      motInput?.focus();
      return;
    }

    if (!perspectives) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please describe what perspectives, experience or expertise you bring to the Coalition.';
      form.querySelector('#app_perspectives')?.focus();
      return;
    }

    if (!contributionPlan) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please describe how you would contribute to Coalition research, dialogue or activities.';
      form.querySelector('#app_contribution_plan')?.focus();
      return;
    }

    if (!declAccuracy || !declNoGuarantee || !declPrivacy) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please confirm all three required declaration and consent statements.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting Membership Application…';
    statusEl.className = 'form-status';
    statusEl.textContent = 'Submitting application to the Coalition intake registry…';

    const payload = {
      full_name: fullName,
      email,
      country,
      city,
      designation,
      organization,
      organization_website: organizationWebsite,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
      biography,
      current_role_responsibilities: currentRole,
      expertise_areas: expertiseChecked,
      expertise_other: expertiseOther,
      experience_years: experienceYears,
      key_research_interests: keyResearch,
      publications_papers_projects: publications,
      contribution_areas: contributionChecked,
      contribution_other: contributionOther,
      links_to_work: linksToWork,
      motivation,
      perspectives_and_expertise: perspectives,
      contribution_plan: contributionPlan,
      collaborative_research_interest: collaborativeInterest,
      declaration_accuracy: true,
      declaration_no_guarantee: true,
      declaration_privacy: true,
    };

    try {
      let refId = `AGPC-APP-${Date.now().toString(36).toUpperCase()}`;
      let submittedAt = new Date().toISOString();
      let reviewStatus = 'Pending Review';

      // Step 1: Record locally in institutional intake storage & prevent duplicates
      try {
        const apiRes = await fetch('/api/membership/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, browser_web3forms_handled: true }),
        });
        const apiResult = await apiRes.json().catch(() => ({}));

        if (apiRes.status === 409) {
          statusEl.className = 'form-status error';
          statusEl.innerHTML = `<strong>Application Already Received:</strong> An application under <em>${esc(email)}</em> is already recorded and is currently Pending Review. If you need to update submitted information, please contact <a href="mailto:coalition@atlasai.institute">coalition@atlasai.institute</a>.`;
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Membership Application <span aria-hidden="true">&rarr;</span>';
          statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (apiRes.status === 400) {
          statusEl.className = 'form-status error';
          statusEl.textContent = apiResult.error || 'Submission could not be completed. Please review your entries.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Membership Application <span aria-hidden="true">&rarr;</span>';
          statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (apiRes.ok && apiResult.success) {
          refId = apiResult.applicationId || refId;
          submittedAt = apiResult.submittedAt || submittedAt;
          reviewStatus = apiResult.status || reviewStatus;
        }
      } catch {
        // Continue directly via Web3Forms even if backend API is unavailable
      }

      // Step 2: Submit complete membership application via Web3Forms API
      const accessKey =
        form.querySelector('input[name="access_key"]')?.value ||
        window.WEB3FORMS_MEMBERSHIP_ACCESS_KEY ||
        'fedcf2cc-8d00-4d6e-9fe3-3dece7d18c82';

      const expertiseList = expertiseChecked.map((x) => (x === 'Other' && expertiseOther ? `Other: ${expertiseOther}` : x));
      const contributionList = contributionChecked.map((x) => (x === 'Other' && contributionOther ? `Other: ${contributionOther}` : x));

      const w3fPayload = {
        access_key: accessKey,
        subject: `New Membership Application: ${fullName} (${country})`,
        from_name: 'Atlas Global South AI Policy Coalition',
        replyto: email,
        name: fullName,
        email,
        application_id: refId,
        submitted_at: submittedAt,
        membership_category: 'Member',
        country,
        city: city || 'Not provided',
        designation,
        organization,
        organization_website: organizationWebsite || 'Not provided',
        linkedin_url: linkedinUrl,
        website_url: websiteUrl || 'Not provided',
        experience_years: experienceYears,
        expertise_areas: expertiseList.join(', '),
        contribution_areas: contributionList.join(', '),
        key_research_interests: keyResearch,
        publications_papers_projects: publications || 'None listed',
        links_to_work: linksToWork || 'None listed',
        biography,
        current_role_responsibilities: currentRole,
        motivation,
        perspectives_and_expertise: perspectives,
        contribution_plan: contributionPlan,
        collaborative_research_interest: collaborativeInterest,
        declarations_confirmed: 'Accuracy Confirmed, Non-Guarantee Understood, Privacy Policy Accepted',
        message: [
          `Application Reference: ${refId}`,
          `Applicant: ${fullName} <${email}>`,
          `Role & Institution: ${designation}, ${organization}`,
          `Location: ${city ? `${city}, ` : ''}${country}`,
          `LinkedIn: ${linkedinUrl}`,
          websiteUrl ? `Website: ${websiteUrl}` : '',
          organizationWebsite ? `Organization Website: ${organizationWebsite}` : '',
          `Experience: ${experienceYears}`,
          `Primary Expertise: ${expertiseList.join(', ')}`,
          `Contribution Areas: ${contributionList.join(', ')}`,
          `Collaborative Research Interest: ${collaborativeInterest}`,
          '',
          `--- PROFESSIONAL BIOGRAPHY ---`,
          biography,
          '',
          `--- CURRENT ROLE & RESPONSIBILITIES ---`,
          currentRole,
          '',
          `--- KEY RESEARCH INTERESTS ---`,
          keyResearch,
          publications ? `\n--- PUBLICATIONS / PROJECTS ---\n${publications}` : '',
          linksToWork ? `\n--- LINKS TO SELECTED WORK ---\n${linksToWork}` : '',
          '',
          `--- MOTIVATION ---`,
          motivation,
          '',
          `--- PERSPECTIVES & EXPERTISE ---`,
          perspectives,
          '',
          `--- CONTRIBUTION PLAN ---`,
          contributionPlan,
        ].filter((line) => line !== undefined && line !== null).join('\n'),
      };

      const w3fRes = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(w3fPayload),
      });
      const w3fResult = await w3fRes.json().catch(() => ({}));

      if (!w3fRes.ok || !w3fResult.success) {
        statusEl.className = 'form-status error';
        statusEl.textContent = w3fResult.message || 'Could not deliver application via Web3Forms. Please verify your entries or try again.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Membership Application <span aria-hidden="true">&rarr;</span>';
        statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const container = document.getElementById('membership-form-container');
      if (container) {
        const formattedDate = new Date(submittedAt || Date.now()).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });
        container.innerHTML = `
          <div class="submission-card-success" role="alert" tabindex="-1">
            <span class="app-section-kicker">APPLICATION RECEIVED</span>
            <h3 style="margin-top:6px; color:var(--navy);">Your application has been received and will be reviewed manually by the Coalition team.</h3>
            <p style="font-size:15px; line-height:1.6; color:var(--ink);">
              Thank you for submitting your membership application to the Atlas Global South AI Policy Coalition. Your application has been logged into our institutional intake system for manual peer assessment.
            </p>
            <div class="submission-meta-grid">
              <div><small>Application Reference</small><strong>${esc(refId)}</strong></div>
              <div><small>Submission Timestamp</small><strong>${esc(formattedDate)}</strong></div>
              <div><small>Applicant Name</small><strong>${esc(fullName)}</strong></div>
              <div><small>Review Status</small><strong style="color:var(--teal-ink);">${esc(reviewStatus)}</strong></div>
            </div>
            <div style="margin-top:22px; padding:18px 20px; border-radius:var(--radius-sm); background:var(--white); border:1px solid #cce8e5;">
              <h4 style="margin:0 0 6px; font-size:14.5px; color:var(--navy);">Next Steps in Assessment</h4>
              <p style="margin:0; font-size:13px; line-height:1.6; color:var(--ink);">
                Applications are reviewed in periodic cohort cycles against institutional research priorities, regional representation, and active working group mandates. You will receive official correspondence at <strong>${esc(email)}</strong> once review is finalized.
              </p>
            </div>
            <div style="margin-top:26px; display:flex; gap:14px; flex-wrap:wrap; align-items:center;">
              <a class="button" href="/members/">Browse Global Member Registry</a>
              <a class="text-link" href="/policy-research/">Explore Research Programme <span aria-hidden="true">&rarr;</span></a>
              <a class="text-link" href="/">Return to Home</a>
            </div>
          </div>
        `;
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'A network or transmission error occurred. Please verify your connection or reach out to coalition@atlasai.institute.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Membership Application <span aria-hidden="true">&rarr;</span>';
    }
  });
}

function bind() { document.querySelector('.menu-toggle')?.addEventListener('click', () => setMenuState(!state.menuOpen)); document.querySelector('.menu-backdrop')?.addEventListener('click', () => setMenuState(false)); document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => { if (state.menuOpen) setMenuState(false); })); document.querySelector('#language-switcher')?.addEventListener('change', (event) => { state.locale = event.target.value; if (typeof localStorage !== 'undefined') localStorage.setItem('atlas-locale', state.locale); document.documentElement.lang = state.locale; document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr'; render(); bind(); }); document.querySelector('#member-search')?.addEventListener('input', (event) => { state.query = event.target.value; state.page = 1; render(); bind(); }); document.querySelector('#member-type')?.addEventListener('change', (event) => { state.type = event.target.value; state.page = 1; render(); bind(); }); document.querySelector('#member-expertise')?.addEventListener('change', (event) => { state.expertise = event.target.value; state.page = 1; render(); bind(); }); document.querySelector('#load-more-members')?.addEventListener('click', () => { state.page += 1; render(); bind(); }); document.querySelector('#country-search')?.addEventListener('input', (event) => { state.countryQuery = event.target.value; render(); bind(); }); document.querySelector('#country-region')?.addEventListener('change', (event) => { state.countryRegion = event.target.value; render(); bind(); }); initMembershipApplication(); document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', async (event) => { if (!['newsletter-form','contact-form','contribution-form'].includes(form.id)) return; event.preventDefault(); const status=form.querySelector('.form-status'); if(!status)return; const trap=form.querySelector('[name=botcheck]'); if(trap?.checked || (trap && trap.value)){ status.textContent='Unable to submit this form.'; return; } let endpoint='https://api.web3forms.com/submit'; let key=''; if(form.id==='newsletter-form'){ endpoint=window.WEB3FORMS_NEWSLETTER_ENDPOINT||''; key=window.WEB3FORMS_NEWSLETTER_ACCESS_KEY||''; } else if(form.id==='contribution-form') key=window.WEB3FORMS_PUBLICATION_ACCESS_KEY||''; else key=window.WEB3FORMS_ACCESS_KEY||''; if(!key || !endpoint){ status.className='form-status'; status.textContent='Online submission is not configured yet. Please contact the published Coalition email address.'; return; } status.textContent='Sending…'; const data=new FormData(form); data.set('access_key',key); try { const response=await fetch(endpoint,{method:'POST',body:data}); const result=await response.json(); if(!response.ok || !result.success) throw new Error('Submission failed'); status.className='form-status success'; status.textContent='Thank you. Your submission has been sent for review.'; form.reset(); } catch { status.className='form-status'; status.textContent='We could not send this submission. Please try again later or use the published contact email.'; } })); document.querySelectorAll('[data-reveal]').forEach((element) => { if (typeof IntersectionObserver === 'undefined') { element.classList.add('is-visible'); return; } const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 }); observer.observe(element); }); document.querySelectorAll('[data-count]').forEach((element) => { const target = Number(element.dataset.count); if (!Number.isFinite(target)) return; const suffix = element.dataset.suffix || ''; if (typeof IntersectionObserver === 'undefined') { element.textContent = `${target}${suffix}`; return; } const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; const started = performance.now(); const tick = (now) => { const progress = Math.min((now - started) / 900, 1); element.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`; if (progress < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); observer.unobserve(element); }), { threshold: 0.8 }); observer.observe(element); }); }
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') { document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && state.menuOpen) setMenuState(false); }); }
load();
