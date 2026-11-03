// Independent menu for switching pages. No dynamic HTML injection is used.
export function initSiteNav(doc = document) {
  const toggle = doc.getElementById('siteNavToggle');
  const menu = doc.getElementById('siteNavMenu');
  const nav = doc.getElementById('siteNav');
  if (!toggle || !menu || !nav) return;
  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'ページメニューを閉じる' : 'ページメニューを開く');
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  doc.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  setOpen(false);
}
if (typeof document !== 'undefined') initSiteNav();
