window.Scorer = window.Scorer || {};

window.Scorer.router = (() => {
  const VIEWS = ['library', 'create', 'score', 'report', 'history'];
  const handlers = {};

  function register(name, renderFn) {
    handlers[name] = renderFn;
  }

  function parse() {
    const raw = (location.hash || '#library').slice(1);
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    const view = VIEWS.includes(path) ? path : 'library';
    return { view, params };
  }

  function navigate(view, params) {
    let hash = '#' + view;
    if (params) {
      const usp = new URLSearchParams(params);
      const s = usp.toString();
      if (s) hash += '?' + s;
    }
    location.hash = hash;
  }

  function activate({ view, params }) {
    document.querySelectorAll('.view').forEach(el => {
      if (el.dataset.view === view) el.setAttribute('data-active', '');
      else el.removeAttribute('data-active');
    });
    document.querySelectorAll('.stages__item').forEach(el => {
      if (el.dataset.route === view) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    const handler = handlers[view];
    if (handler) handler(params);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function init() {
    window.addEventListener('hashchange', () => activate(parse()));
    activate(parse());
  }

  return { init, register, navigate, parse };
})();
