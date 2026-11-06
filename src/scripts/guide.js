import L from 'leaflet';

const data = JSON.parse(document.getElementById('data').textContent);
const byId = new Map(data.places.map((p) => [p.id, p]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const rows = $$('[data-rows] .row');
const q = $('#q');
const street = $('#street');
const split = $('[data-split]');
const count = $('[data-count]');
const empty = $('[data-empty]');
const chips = $$('.chip');
let cat = '';

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[åä]/g, 'a').replace(/ö/g, 'o');
rows.forEach((r) => (r.dataset.n = norm(r.dataset.text)));

/* Hjälptext som får plats i fältet */
function fitPlaceholders() {
  $$('input[data-ph-long]').forEach((el) => {
    const c = document.createElement('canvas').getContext('2d');
    const cs = getComputedStyle(el);
    c.font = `${cs.fontSize} ${cs.fontFamily}`;
    const room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 24;
    if (!el.dataset.phMid) el.dataset.phMid = el.getAttribute('placeholder');
    const opts = [el.dataset.phLong, el.dataset.phMid, el.dataset.phShort];
    el.placeholder = opts.find((o) => c.measureText(o).width <= room) || el.dataset.phShort;
  });
}
fitPlaceholders();
addEventListener('resize', fitPlaceholders);
document.fonts?.ready.then(fitPlaceholders);

/* Karta */
const isDark = matchMedia('(prefers-color-scheme: dark)');
const map = L.map('map', { scrollWheelZoom: false, zoomSnap: 0.5 }).setView([57.6868, 11.918], 15);
let tiles;
function setTiles() {
  tiles?.remove();
  const style = isDark.matches ? 'dark_all' : 'rastertiles/voyager';
  tiles = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`, {
    subdomains: 'abcd', maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);
}
setTiles();
isDark.addEventListener?.('change', setTiles);
map.on('focus', () => map.scrollWheelZoom.enable());
map.on('blur', () => map.scrollWheelZoom.disable());

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const markers = new Map();
for (const p of data.places) {
  if (p.lat == null) continue;
  const icon = L.divIcon({ className: '', html: `<div class="pin" style="--c: var(--cat-${p.cat})"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  const m = L.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true })
    .bindPopup(`<strong>${esc(p.name)}</strong><span>${esc(p.type)}${p.address ? ', ' + esc(p.address) : ''}</span>${p.url ? `<br><a href="${esc(p.url)}" target="_blank" rel="noopener">Webbplats</a>` : ''}`)
    .addTo(map);
  m.on('click', () => highlight(p.id, false));
  markers.set(p.id, m);
}
const stopMarkers = new Map();
for (const s of data.stops) {
  const icon = L.divIcon({ className: '', html: `<div class="stop-pin" title="Hållplats">H</div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
  const m = L.marker([s.lat, s.lng], { icon, title: `Hållplats ${s.name}`, zIndexOffset: -100 })
    .bindPopup(`<strong>${esc(s.name)}</strong><span>Hållplats, linje ${s.lines.join(', ')}</span>`).addTo(map);
  stopMarkers.set(s.id, m);
}

/* Filter */
function apply() {
  const term = norm(q.value.trim());
  const st = street.value;
  let n = 0;
  const visible = [];
  for (const r of rows) {
    const ok = (!cat || r.dataset.cat === cat) && (!st || r.dataset.street === st) && (!term || r.dataset.n.includes(term));
    r.hidden = !ok;
    const m = markers.get(r.dataset.id);
    if (m) { ok ? m.addTo(map) : m.remove(); if (ok) visible.push(m.getLatLng()); }
    if (ok) n++;
  }
  const filtered = cat || st || term;
  count.textContent = filtered ? `Visar ${n} av ${rows.length}` : `Visar alla ${rows.length}`;
  empty.hidden = n > 0;
  if (filtered && visible.length) map.fitBounds(L.latLngBounds(visible).pad(0.25), { maxZoom: 17, animate: true });
}
let t;
q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 120); });
street.addEventListener('change', apply);
chips.forEach((c) => c.addEventListener('click', () => {
  cat = c.dataset.cat;
  chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
  apply();
}));
$('[data-reset]').addEventListener('click', () => {
  q.value = ''; street.value = ''; cat = '';
  chips.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === '')));
  apply();
});

/* Hero-sök och snabbval */
function searchFor(term) {
  q.value = term;
  cat = '';
  chips.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === '')));
  apply();
  document.getElementById('hitta').scrollIntoView();
}
$('[data-hero-search]').addEventListener('submit', (e) => { e.preventDefault(); searchFor($('#q-hero').value); });
$$('[data-quick]').forEach((b) => b.addEventListener('click', () => searchFor(b.dataset.quick)));

/* Lista/karta på mobil */
const mobile = matchMedia('(max-width: 860px)');
function setView(v) {
  split.dataset.view = v;
  $$('[data-view]', $('.view-toggle')).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  if (v === 'map') setTimeout(() => map.invalidateSize(), 0);
}
$$('.view-toggle [data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

/* Markera ett ställe */
let active;
function highlight(id, pan = true) {
  active?.classList.remove('is-active');
  $$('.pin.is-active').forEach((e) => e.classList.remove('is-active'));
  active = rows.find((r) => r.dataset.id === id);
  active?.classList.add('is-active');
  const m = markers.get(id);
  if (!m) return;
  m.getElement()?.firstElementChild?.classList.add('is-active');
  if (pan) {
    if (mobile.matches) setView('map');
    else $('.map-wrap').scrollIntoView({ block: 'nearest' });
    map.setView(m.getLatLng(), 17, { animate: true });
    m.openPopup();
  }
}
$$('[data-show]').forEach((b) => b.addEventListener('click', () => highlight(b.dataset.show)));

/* Hållplatser */
$$('[data-stop]').forEach((b) => b.addEventListener('click', () => {
  const m = stopMarkers.get(b.dataset.stop);
  document.getElementById('hitta').scrollIntoView();
  if (mobile.matches) setView('map');
  map.setView(m.getLatLng(), 17);
  m.openPopup();
}));

/* Nära mig */
let me;
const nearBtn = $('[data-near]');
nearBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { nearBtn.textContent = 'Din webbläsare kan inte visa din plats'; return; }
  nearBtn.textContent = 'Letar…';
  navigator.geolocation.getCurrentPosition((pos) => {
    const ll = [pos.coords.latitude, pos.coords.longitude];
    me?.remove();
    me = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }), title: 'Du är här' }).addTo(map);
    map.setView(ll, 17);
    nearBtn.textContent = 'Visa det som ligger nära mig';
  }, () => { nearBtn.textContent = 'Platsen gick inte att hämta. Tillåt plats och försök igen'; }, { enableHighAccuracy: true, timeout: 10000 });
});

/* Stöd för länkar som ?q=kafe */
const pq = new URLSearchParams(location.search).get('q');
if (pq) { q.value = pq; apply(); }
