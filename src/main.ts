import './style.css';

type Lane = { id: string; name: string; color: 'red' | 'blue' | 'yellow' | 'green' };
type Meal = { id: string; day: number; laneId: string; title: string; prep: string; sharedWith: string[]; note: string; createdAt: string };
type Plan = { lanes: Lane[]; meals: Meal[]; weekOf: string; updatedAt: string };

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const colors: Lane['color'][] = ['red', 'blue', 'yellow', 'green'];
const app = document.querySelector<HTMLDivElement>('#app')!;
let plan: Plan = emptyPlan();
let demo = false;
let lastDeleted: Meal | null = null;
let liveMessage = '';
let updateRequested = false;
const LICENSE_KEY = 'sb_license:family-meal-lanes';
const LICENSE_CACHE_KEY = 'sb_license_check:family-meal-lanes';
const CHECKOUT_URL = 'https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout';
let licensed = false;
let licenseNotice = '';

function mondayISO(date = new Date()) {
  const d = new Date(date); const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift); d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function emptyPlan(): Plan {
  return { lanes: [{ id: 'shared', name: 'Shared', color: 'blue' }], meals: [], weekOf: mondayISO(), updatedAt: new Date().toISOString() };
}
function seedPlan(): Plan {
  return {
    weekOf: '2026-08-24', updatedAt: new Date().toISOString(),
    lanes: [
      { id: 'shared', name: 'Shared', color: 'blue' }, { id: 'mara', name: 'Mara', color: 'red' },
      { id: 'jon', name: 'Jon', color: 'green' }, { id: 'kids', name: 'Kids', color: 'yellow' }
    ],
    meals: [
      { id: 'm1', day: 0, laneId: 'shared', title: 'Lemon chicken tray bake', prep: 'Chop vegetables', sharedWith: ['mara', 'jon', 'kids'], note: 'Make extra rice.', createdAt: '2026-08-24T08:00:00.000Z' },
      { id: 'm2', day: 1, laneId: 'mara', title: 'Desk lunch: lentil salad', prep: 'Cook lentils', sharedWith: [], note: '', createdAt: '2026-08-24T08:00:00.000Z' },
      { id: 'm3', day: 2, laneId: 'shared', title: 'Pasta night', prep: 'Defrost sauce', sharedWith: ['mara', 'jon', 'kids'], note: 'Use the frozen tomato sauce.', createdAt: '2026-08-24T08:00:00.000Z' },
      { id: 'm4', day: 3, laneId: 'jon', title: 'Late shift soup', prep: 'Pack thermos', sharedWith: [], note: '', createdAt: '2026-08-24T08:00:00.000Z' },
      { id: 'm5', day: 4, laneId: 'kids', title: 'Mini pita pizzas', prep: 'Grate cheese', sharedWith: [], note: '', createdAt: '2026-08-24T08:00:00.000Z' },
      { id: 'm6', day: 5, laneId: 'shared', title: 'Build-your-own tacos', prep: 'Soak beans', sharedWith: ['mara', 'jon', 'kids'], note: '', createdAt: '2026-08-24T08:00:00.000Z' }
    ]
  };
}

const dbName = (isDemo: boolean) => `family-meal-lanes:${isDemo ? 'demo' : 'real'}`;
function openStore(isDemo: boolean): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName(isDemo), 1);
    req.onupgradeneeded = () => req.result.createObjectStore('plan');
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
}
async function readPlan(isDemo: boolean): Promise<Plan | undefined> {
  const db = await openStore(isDemo);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('plan', 'readonly'); const req = tx.objectStore('plan').get('current');
    req.onsuccess = () => resolve(req.result as Plan | undefined); req.onerror = () => reject(req.error);
  });
}
async function writePlan() {
  plan.updatedAt = new Date().toISOString();
  const db = await openStore(demo);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('plan', 'readwrite'); tx.objectStore('plan').put(plan, 'current');
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}
async function clearPlan(isDemo: boolean) {
  const db = await openStore(isDemo);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('plan', 'readwrite'); tx.objectStore('plan').clear();
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}
function esc(value: string) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!)); }
function dateLabel(day: number) { const d = new Date(`${plan.weekOf}T12:00:00`); d.setDate(d.getDate() + day); return `${dayNames[day]} ${d.getDate()}`; }
function mealFor(lane: Lane, day: number) { return plan.meals.filter(m => m.day === day && (m.laneId === lane.id || m.sharedWith.includes(lane.id))); }
function laneName(id: string) { return plan.lanes.find(l => l.id === id)?.name || 'Removed lane'; }
function pageTitle(path: string) {
  if (path === '/demo') return 'Demo — Family Meal Lanes';
  if (path === '/privacy') return 'Privacy — Family Meal Lanes';
  if (path === '/terms') return 'Terms — Family Meal Lanes';
  return 'Family Meal Lanes — plan meals by person';
}
function canonicalUrl(path: string) {
  const route = path === '/demo' || path === '/privacy' || path === '/terms' ? path : '/';
  return `https://family-meal-lanes.sociobot.in${route}`;
}
function navigate(path: string) { history.pushState({}, '', path); void loadRoute(true); }
function header() {
  const onBoardRoute = location.pathname === '/' || location.pathname === '/demo';
  const boardHref = onBoardRoute ? '#board' : '/#board';
  return `<header class="site-header"><a class="wordmark" href="/" data-route>Family<br><strong>Meal Lanes</strong></a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="${boardHref}"${onBoardRoute ? '' : ' data-route'}>Board</a><a href="/privacy" data-route>Privacy</a></nav></header>`;
}
function footer() { return `<footer><p>One weekly meal board for a shared kitchen device.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · Built by Param Factory · v1.0.0</p><p class="generated-note">Original illustration generated for this product.</p></footer>`; }

function renderLanding() {
  const hasMeals = plan.meals.length > 0;
  app.innerHTML = `${header()}<main id="main" tabindex="-1">
    ${demo ? demoBanner() : ''}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">A weekly board for one kitchen</p><h1 id="hero-title">Plan meals by person, not guesswork</h1><p class="lede">For households with different meals, so everyone can see what is theirs and what they share.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>See a filled week. Nothing is saved.</span></div>
        <ul class="facts"><li>Works offline after setup</li><li>Meal plan saved only on this device</li><li>Export a JSON copy</li></ul>
      </div>
      <figure class="hero-art"><img src="/hero-risograph.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="A cut-paper weekly meal planner with colored meal slips and kitchen ingredients."><figcaption>Plan one meal in more than one lane.</figcaption></figure>
    </section>
    <section class="board-section" id="board" aria-labelledby="board-title"><div class="section-heading"><div><p class="eyebrow">This week</p><h2 id="board-title">Who eats what</h2><p>${hasMeals ? 'Choose a meal slip to change it.' : 'Add people, then put the first meal in a lane.'}</p></div><div class="board-actions"><button class="button ink" data-action="add-meal">Add a meal</button><button class="icon-button" data-action="manage-lanes" aria-label="Manage people and lanes">People</button><button class="icon-button" data-action="print" aria-label="Print this weekly meal plan">Print</button><button class="icon-button" data-action="export" aria-label="Export JSON">Export JSON</button><label class="import-label">Import JSON<input type="file" accept="application/json" data-action="import" /></label></div></div>${boardHtml()}</section>
    <section class="how" aria-labelledby="how-title"><div><p class="eyebrow">How it works</p><h2 id="how-title">Keep the whole kitchen in view</h2></div><ol><li><strong>Name each lane.</strong><span>Add each person and one shared lane.</span></li><li><strong>Place the meal.</strong><span>Pick a day, a lane, and who shares it.</span></li><li><strong>Mark the prep.</strong><span>Leave the small task that saves time later.</span></li></ol></section>
    <section class="privacy-note" aria-labelledby="privacy-title"><h2 id="privacy-title">What this does not do</h2><p>It does not store recipes, order groceries, score nutrition, or send your plan anywhere. It keeps a clear weekly view on one device.</p><a href="/privacy" data-route>Read the privacy details</a></section>
    ${paidSection()}
  </main>${footer()}${lastDeleted ? `<aside class="undo-toast" role="status">Meal removed.<button class="button ink" data-action="undo-delete">Undo</button></aside>` : ''}<div class="sr-only" aria-live="polite">${esc(liveMessage)}</div>${dialogs()}`;
  bindEvents();
}
function demoBanner() { return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" data-action="reset-demo">Reset demo</button><a href="/" data-route>Start for real</a></span></aside>`; }
function paidSection() {
  if (demo) return '';
  const notice = licenseNotice ? `<p class="license-notice" role="status">${esc(licenseNotice)}</p>` : '';
  return `<section class="paid-section" aria-labelledby="paid-title"><p class="eyebrow">One-time purchase</p><h2 id="paid-title">Add as many lanes as your household needs</h2><p>Free plans include Shared plus three people. Pay $12 once for unlimited lanes on this device.</p>${licensed ? `<p class="license-good" role="status">Your unlimited-lanes license is active.</p>${notice}` : `<div class="paid-actions"><a class="button primary" href="${CHECKOUT_URL}">Buy unlimited lanes for $12</a><form class="license-form" data-form="license"><label for="license-token">Have a license?</label><input id="license-token" name="license" autocomplete="off" required placeholder="Paste your license token"><button class="button ink">Restore license</button></form></div><p class="small-note">Sociobot and Dodo handle the hosted checkout. A restored license is checked with Sociobot when you are online.</p>${notice}`}</section>`;
}
function boardHtml() {
  const cols = dayNames.map((_, index) => `<th scope="col">${dateLabel(index)}</th>`).join('');
  const rows = plan.lanes.map(lane => `<tr><th scope="row"><span class="lane-dot ${lane.color}"></span>${esc(lane.name)}</th>${dayNames.map((_, day) => `<td><div class="drop-zone" data-day="${day}" data-lane="${lane.id}">${mealFor(lane, day).map(meal => mealHtml(meal, lane)).join('')}<button class="add-cell" data-action="add-meal" data-day="${day}" data-lane="${lane.id}" aria-label="Add meal for ${esc(lane.name)} on ${dateLabel(day)}">+</button></div></td>`).join('')}</tr>`).join('');
  return `<div class="board-scroll" tabindex="0" aria-label="Weekly meal lanes"><table class="meal-board"><thead><tr><th scope="col">Lane</th>${cols}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function mealHtml(meal: Meal, shownIn: Lane) {
  const original = meal.laneId !== shownIn.id;
  const laneText = original ? `Shared from ${laneName(meal.laneId)}` : laneName(meal.laneId);
  const prepText = meal.prep ? ` Prep: ${meal.prep}` : '';
  return `<button type="button" class="meal-slip ${plan.lanes.find(l => l.id === meal.laneId)?.color || 'blue'}" data-meal="${meal.id}" aria-label="${esc(`${laneText} ${meal.title}${prepText}. Edit meal.`)}"><span class="slip-top">${original ? `Shared from ${esc(laneName(meal.laneId))}` : esc(laneName(meal.laneId))}</span><strong>${esc(meal.title)}</strong>${meal.prep ? `<span class="prep">Prep: ${esc(meal.prep)}</span>` : ''}</button>`;
}
function dialogs() { return `<dialog id="meal-dialog" aria-labelledby="meal-dialog-title"></dialog><dialog id="lanes-dialog" aria-labelledby="lanes-dialog-title"></dialog><dialog id="import-dialog" aria-labelledby="import-dialog-title"></dialog>`; }

function openMeal(id?: string, day?: number, laneId?: string) {
  const meal = plan.meals.find(m => m.id === id);
  const dialog = document.querySelector<HTMLDialogElement>('#meal-dialog')!;
  const currentLane = meal?.laneId || laneId || plan.lanes[0]?.id;
  const shares = meal?.sharedWith || [];
  dialog.innerHTML = `<form method="dialog" class="dialog-sheet" data-form="meal"><button class="dialog-close" type="button" data-action="cancel-meal" aria-label="Close meal form">×</button><p class="eyebrow">Meal slip</p><h2 id="meal-dialog-title">${meal ? 'Change this meal' : 'Add a meal'}</h2><input type="hidden" name="id" value="${meal?.id || ''}"><label>Meal name<input name="title" required maxlength="80" value="${esc(meal?.title || '')}" autocomplete="off" autofocus></label><div class="form-grid"><label>Day<select name="day">${dayNames.map((name, i) => `<option value="${i}" ${Number(meal?.day ?? day ?? 0) === i ? 'selected' : ''}>${dateLabel(i)}</option>`).join('')}</select></label><label>Lane<select name="laneId">${plan.lanes.map(l => `<option value="${l.id}" ${currentLane === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label></div><label>Prep label <span class="hint">Optional</span><input name="prep" maxlength="60" value="${esc(meal?.prep || '')}" placeholder="Chop vegetables"></label><label>Note <span class="hint">Optional</span><textarea name="note" maxlength="240" rows="3" placeholder="A small reminder for this meal">${esc(meal?.note || '')}</textarea></label><fieldset><legend>Also show this meal in</legend><div class="checks">${plan.lanes.map(l => `<label><input type="checkbox" name="sharedWith" value="${l.id}" ${shares.includes(l.id) ? 'checked' : ''}> ${esc(l.name)}</label>`).join('')}</div></fieldset><div class="dialog-actions">${meal ? '<button class="button danger" type="button" data-action="delete-meal" data-id="' + meal.id + '">Delete meal</button>' : ''}<span></span><button class="button ink" type="button" data-action="cancel-meal">Cancel</button><button class="button primary" type="submit" value="default">Save meal</button></div><p class="form-error" aria-live="polite"></p></form>`;
  dialog.showModal();
  dialog.addEventListener('close', () => { if (dialog.returnValue === 'default') void saveMeal(dialog); }, { once: true });
  dialog.querySelectorAll<HTMLElement>('[data-action="cancel-meal"]').forEach(button => button.addEventListener('click', () => dialog.close('cancel')));
  dialog.querySelector<HTMLInputElement>('[name="title"]')?.addEventListener('invalid', event => {
    (event.currentTarget as HTMLInputElement).setAttribute('aria-describedby', 'meal-form-error');
    const error = dialog.querySelector<HTMLElement>('.form-error')!;
    error.id = 'meal-form-error';
    error.textContent = 'Give this meal a name, then save it.';
  });
  dialog.querySelector('[data-action="delete-meal"]')?.addEventListener('click', () => { const found = plan.meals.find(m => m.id === meal?.id); if (found) void deleteMeal(found); dialog.close(); });
}
async function saveMeal(dialog: HTMLDialogElement) {
  const form = dialog.querySelector<HTMLFormElement>('form')!; const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim(); const error = dialog.querySelector<HTMLElement>('.form-error')!;
  if (!title) { error.textContent = 'Give this meal a name, then save it.'; dialog.showModal(); return; }
  const id = String(fd.get('id') || crypto.randomUUID());
  const sharedWith = fd.getAll('sharedWith').map(String).filter(value => value !== String(fd.get('laneId')));
  const record: Meal = { id, title, day: Number(fd.get('day')), laneId: String(fd.get('laneId')), prep: String(fd.get('prep') || '').trim(), note: String(fd.get('note') || '').trim(), sharedWith, createdAt: plan.meals.find(m => m.id === id)?.createdAt || new Date().toISOString() };
  plan.meals = plan.meals.filter(m => m.id !== id); plan.meals.push(record); await persist('Meal saved.');
}
function lanesForm(dialog: HTMLDialogElement, draft: Lane[]) {
  dialog.innerHTML = `<form method="dialog" class="dialog-sheet" data-form="lanes"><button class="dialog-close" type="button" data-action="cancel-lanes" aria-label="Close people form">×</button><p class="eyebrow">People and lanes</p><h2 id="lanes-dialog-title">Name the people who eat here</h2><p class="dialog-intro">Keep Shared for meals several people eat. Add a lane for each person.</p><div class="lane-list">${draft.map(lane => `<div class="lane-edit"><span class="lane-dot ${lane.color}"></span><label class="sr-only" for="lane-${lane.id}">Lane name</label><input id="lane-${lane.id}" name="lane-name" data-lane-id="${lane.id}" value="${esc(lane.name)}" maxlength="24"><label class="sr-only" for="color-${lane.id}">Lane color</label><select id="color-${lane.id}" name="lane-color" data-lane-id="${lane.id}">${colors.map(c => `<option value="${c}" ${c === lane.color ? 'selected' : ''}>${c}</option>`).join('')}</select>${lane.id === 'shared' ? '<span class="fixed">Shared</span>' : `<button type="button" class="remove-lane" data-action="remove-lane" data-id="${lane.id}" aria-label="Remove ${esc(lane.name)}">×</button>`}</div>`).join('')}</div><p class="lane-limit" data-lane-limit role="status" aria-live="polite" tabindex="-1"></p><button type="button" class="button ink" data-action="add-lane">Add person</button><div class="dialog-actions"><span></span><button class="button ink" type="button" data-action="cancel-lanes">Cancel</button><button class="button primary" type="submit" value="default">Save people</button></div></form>`;
  dialog.querySelectorAll<HTMLElement>('[data-action="cancel-lanes"]').forEach(button => button.addEventListener('click', () => dialog.close('cancel')));
  dialog.querySelector('[data-action="add-lane"]')?.addEventListener('click', () => {
    syncLaneDraft(dialog, draft);
    if (!licensed && draft.length >= 4) {
      const notice = dialog.querySelector<HTMLElement>('[data-lane-limit]')!;
      notice.textContent = 'The free plan includes Shared plus three people. Restore a license or buy unlimited lanes to add another person.';
      notice.focus();
      return;
    }
    draft.push({ id: crypto.randomUUID(), name: 'New person', color: colors[draft.length % colors.length] });
    lanesForm(dialog, draft);
    dialog.querySelector<HTMLInputElement>(`input[data-lane-id="${draft[draft.length - 1].id}"]`)?.focus();
  });
  dialog.querySelectorAll<HTMLElement>('[data-action="remove-lane"]').forEach(button => button.addEventListener('click', () => {
    syncLaneDraft(dialog, draft);
    const id = button.dataset.id!;
    draft.splice(draft.findIndex(lane => lane.id === id), 1);
    lanesForm(dialog, draft);
  }));
}
function syncLaneDraft(dialog: HTMLDialogElement, draft: Lane[]) {
  const names = new Map([...dialog.querySelectorAll<HTMLInputElement>('[name="lane-name"]')].map(input => [input.dataset.laneId!, input.value.trim()]));
  const laneColors = new Map([...dialog.querySelectorAll<HTMLSelectElement>('[name="lane-color"]')].map(select => [select.dataset.laneId!, select.value as Lane['color']]));
  draft.forEach((lane, index) => {
    lane.name = names.get(lane.id) || `Person ${index + 1}`;
    lane.color = laneColors.get(lane.id) || lane.color;
  });
}
function openLanes() {
  const dialog = document.querySelector<HTMLDialogElement>('#lanes-dialog')!;
  const draft = plan.lanes.map(lane => ({ ...lane }));
  lanesForm(dialog, draft);
  dialog.showModal();
  dialog.addEventListener('close', () => { if (dialog.returnValue === 'default') { syncLaneDraft(dialog, draft); void saveLanes(draft); } }, { once: true });
}
async function saveLanes(lanes: Lane[]) {
  const laneIds = new Set(lanes.map(lane => lane.id));
  plan.lanes = lanes;
  plan.meals = plan.meals.map(meal => ({ ...meal, laneId: laneIds.has(meal.laneId) ? meal.laneId : 'shared', sharedWith: meal.sharedWith.filter(id => laneIds.has(id)) }));
  await persist('People saved.');
}
async function deleteMeal(meal: Meal) { lastDeleted = meal; plan.meals = plan.meals.filter(m => m.id !== meal.id); await persist('Meal removed.'); }
async function undoDelete() { if (!lastDeleted) return; plan.meals.push(lastDeleted); lastDeleted = null; await persist('Meal restored.'); }
async function persist(message: string) { try { await writePlan(); liveMessage = message; renderLanding(); } catch { liveMessage = 'Your change could not save. Check your device storage and try again.'; renderLanding(); } }
function downloadPlan() { const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), plan }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `family-meal-lanes-${plan.weekOf}.json`; link.click(); URL.revokeObjectURL(url); liveMessage = 'Your meal plan JSON file was downloaded.'; renderLanding(); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function isLane(value: unknown): value is Lane {
  return isRecord(value) && typeof value.id === 'string' && value.id.trim().length > 0 && typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 24 && typeof value.color === 'string' && colors.includes(value.color as Lane['color']);
}
function isIsoDate(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)); }
function parsePlan(value: unknown): Plan | undefined {
  if (!isRecord(value) || !Array.isArray(value.lanes) || !Array.isArray(value.meals) || !isIsoDate(value.weekOf)) return undefined;
  if (!value.lanes.every(isLane) || value.lanes.length === 0) return undefined;
  const lanes = value.lanes.map(lane => ({ ...lane }));
  const laneIds = new Set(lanes.map(lane => lane.id));
  if (laneIds.size !== lanes.length || !laneIds.has('shared')) return undefined;
  const meals: Meal[] = [];
  for (const valueMeal of value.meals) {
    if (!isRecord(valueMeal)) return undefined;
    const { id, title, day, laneId, prep, note, sharedWith, createdAt } = valueMeal;
    if (typeof id !== 'string' || typeof title !== 'string' || typeof day !== 'number' || typeof laneId !== 'string' || typeof prep !== 'string' || typeof note !== 'string' || typeof createdAt !== 'string' || !Array.isArray(sharedWith)) return undefined;
    if (!id.trim() || !title.trim() || title.length > 80 || !Number.isInteger(day) || day < 0 || day > 6 || !laneIds.has(laneId) || prep.length > 60 || note.length > 240 || !sharedWith.every(sharedId => typeof sharedId === 'string' && laneIds.has(sharedId)) || Number.isNaN(Date.parse(createdAt))) return undefined;
    const validatedShares = sharedWith as string[];
    if (new Set(validatedShares).size !== validatedShares.length || validatedShares.includes(laneId)) return undefined;
    meals.push({ id, title, day, laneId, prep, note, sharedWith: [...validatedShares], createdAt });
  }
  if (new Set(meals.map(meal => meal.id)).size !== meals.length) return undefined;
  return { lanes, meals, weekOf: value.weekOf, updatedAt: new Date().toISOString() };
}
async function importPlan(file: File) { try { const raw: unknown = JSON.parse(await file.text()); const candidate = isRecord(raw) && 'plan' in raw ? raw.plan : raw; const imported = parsePlan(candidate); if (!imported) throw new Error('invalid-plan'); plan = imported; await persist('Meal plan imported.'); } catch { liveMessage = 'That file is not a complete Family Meal Lanes plan. Your current plan is unchanged.'; renderLanding(); } }

function bindEvents() {
  app.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); navigate(link.getAttribute('href')!); }));
  app.querySelectorAll<HTMLElement>('[data-action="add-meal"]').forEach(button => button.addEventListener('click', () => openMeal(undefined, Number(button.dataset.day || 0), button.dataset.lane)));
  app.querySelectorAll<HTMLElement>('[data-meal]').forEach(element => { const open = () => openMeal(element.dataset.meal); element.addEventListener('click', open); });
  app.querySelector<HTMLElement>('[data-action="manage-lanes"]')?.addEventListener('click', openLanes);
  app.querySelector<HTMLElement>('[data-action="print"]')?.addEventListener('click', () => window.print());
  app.querySelector<HTMLElement>('[data-action="export"]')?.addEventListener('click', downloadPlan);
  app.querySelector<HTMLInputElement>('[data-action="import"]')?.addEventListener('change', event => { const input = event.currentTarget as HTMLInputElement; const file = (input.files || [])[0]; if (file) void importPlan(file); });
  app.querySelector<HTMLElement>('[data-action="reset-demo"]')?.addEventListener('click', async () => { plan = seedPlan(); await writePlan(); liveMessage = 'Demo reset to its sample week.'; renderLanding(); });
  app.querySelector<HTMLElement>('[data-action="undo-delete"]')?.addEventListener('click', () => void undoDelete());
  app.querySelector<HTMLFormElement>('[data-form="license"]')?.addEventListener('submit', event => {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget as HTMLFormElement).get('license') || '').trim();
    if (!token) { liveMessage = 'Paste your license token, then restore it.'; renderLanding(); return; }
    localStorage.setItem(LICENSE_KEY, token);
    licensed = true;
    licenseNotice = 'Checking this license with Sociobot.';
    liveMessage = 'License restored. We will check it when you are online.';
    renderLanding();
    void verifyLicense(token);
  });
}
type LicenseCache = { valid: boolean; checkedAt: number };
function readLicenseCache(): LicenseCache | undefined {
  try {
    const cached: unknown = JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) || 'null');
    return isRecord(cached) && typeof cached.valid === 'boolean' && typeof cached.checkedAt === 'number' ? cached as LicenseCache : undefined;
  } catch { return undefined; }
}
async function verifyLicense(token: string) {
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?license=${encodeURIComponent(token)}`);
    const result: unknown = await response.json();
    const valid = isRecord(result) && result.valid === true;
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid, checkedAt: Date.now() }));
    if (!valid) licensed = false;
    licenseNotice = valid ? 'Your license was checked and is active.' : 'This license is not active. You can buy unlimited lanes or restore another license.';
    renderLanding();
  } catch { /* Offline use keeps the optimistic or last known local license state. */ }
}
function renderLegal(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  app.innerHTML = `${header()}<main id="main" class="legal" tabindex="-1"><p class="eyebrow">Family Meal Lanes</p><h1>${privacy ? 'Your meal plan stays on this device' : 'Terms for using this meal board'}</h1>${privacy ? `<p>Family Meal Lanes saves your lanes and meal slips in this browser on this device. It does not send your meal plan to us.</p><h2>What is stored</h2><p>Names, meal titles, prep labels, and notes stay in the browser’s local database. You can export a JSON copy.</p><h2>Optional license check</h2><p>If you buy or restore the unlimited-lanes license, its token is stored in this browser and checked with Sociobot. Meal plan data is never included in that check.</p><h2>Demo mode</h2><p>The sample week uses a separate local database. Starting for real does not copy the sample into your plan.</p><h2>Contact</h2><p>Questions about this policy can go to the Param Factory team.</p>` : `<p>This utility is provided for household planning. You are responsible for checking meal choices and food safety for your household.</p><h2>One-time license</h2><p>A $12 license enables unlimited lanes on one device. Sociobot and Dodo handle the hosted checkout. If a license is no longer active, the board returns to the free lane limit after its next check.</p><h2>Local data</h2><p>Your browser stores your plan. Export a copy before clearing browser data or moving to another device.</p><h2>No medical advice</h2><p>Prep labels and lanes are planning notes. They do not assess allergens, nutrition, or food safety.</p><h2>Changes</h2><p>We may update this product and these terms as the product changes.</p>`}</main>${footer()}<div class="sr-only" aria-live="polite">${esc(liveMessage)}</div>`;
  bindEvents();
}
function renderNotFound() { app.innerHTML = `${header()}<main id="main" class="legal" tabindex="-1"><p class="eyebrow">Family Meal Lanes</p><h1>This paper slip is missing</h1><p>The page you asked for is not here. Go back to the weekly meal board.</p><a class="button primary" href="/" data-route>Go to the meal board</a></main>${footer()}`; bindEvents(); }
async function loadRoute(moveFocus = false) {
  const wasDemo = demo;
  const path = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1' ? '/demo' : location.pathname;
  document.title = pageTitle(path);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl(path));
  demo = path === '/demo';
  if (wasDemo && !demo) {
    try { await clearPlan(true); } catch { /* The real plan still remains isolated if demo storage is unavailable. */ }
  }
  if (!demo) {
    const query = new URLSearchParams(location.search);
    const incoming = query.get('license');
    if (incoming) { localStorage.setItem(LICENSE_KEY, incoming); history.replaceState({}, '', location.pathname); }
    const token = incoming || localStorage.getItem(LICENSE_KEY);
    const cached = readLicenseCache();
    licensed = Boolean(token) && cached?.valid !== false;
    licenseNotice = cached?.valid === false ? 'This license is not active. You can buy unlimited lanes or restore another license.' : '';
    if (token && (!cached || Date.now() - cached.checkedAt > 86_400_000)) void verifyLicense(token);
  } else licensed = false;
  if (path === '/' || path === '/demo') {
    try { const stored = await readPlan(demo); const restored = stored && parsePlan(stored); plan = restored || (demo ? seedPlan() : emptyPlan()); if (!restored) { await writePlan(); if (stored) liveMessage = 'An incomplete saved plan was reset safely.'; } } catch { plan = demo ? seedPlan() : emptyPlan(); liveMessage = 'Storage is unavailable. Changes will not survive this tab.'; }
    renderLanding();
  } else if (path === '/privacy' || path === '/terms') renderLegal(path.slice(1) as 'privacy' | 'terms'); else renderNotFound();
  if (location.hash === '#board') requestAnimationFrame(() => document.querySelector('#board')?.scrollIntoView());
  if (!moveFocus) return;
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      const announcer = document.querySelector<HTMLElement>('#route-announcer');
      if (announcer) announcer.textContent = heading.textContent || '';
    }
  });
}
window.addEventListener('popstate', () => void loadRoute(true));
window.addEventListener('online', () => { liveMessage = 'You are online.'; });
window.addEventListener('offline', () => { liveMessage = 'You are offline. Your saved plan is still here.'; });
function showUpdateToast(worker: ServiceWorker) {
  if (document.querySelector('.update-toast')) return;
  const toast = document.createElement('aside'); toast.className = 'update-toast'; toast.setAttribute('role', 'status');
  const text = document.createElement('span'); text.textContent = 'An updated meal board is ready.';
  const button = document.createElement('button'); button.textContent = 'Update now'; button.className = 'button ink';
  button.addEventListener('click', () => { updateRequested = true; worker.postMessage('SKIP_WAITING'); });
  toast.append(text, button); document.body.append(toast);
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(registration => {
  if (registration.waiting) showUpdateToast(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(worker); });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) window.location.reload(); });
}).catch(() => undefined);
void loadRoute();
