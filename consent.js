/* Fenêtre de consentement : Google Tag Manager ne se charge qu'après un accord du visiteur.
   Elle bloque la page jusqu'au choix, sauf sur les pages légales, avec Refuser et Accepter à égalité.
   Le choix est gardé 6 mois, puis le bandeau revient. Tout lien [data-cookies] rouvre le bandeau. */
(function () {
  var CLE = 'choix-cookies', GTM = 'GTM-PGLLZHN5', SIX_MOIS = 182 * 24 * 3600 * 1000;

  function lire() {
    try {
      var c = JSON.parse(localStorage.getItem(CLE));
      return c && Date.now() - c.date < SIX_MOIS ? c.accord : null;
    } catch (e) { return null; }
  }
  function ecrire(accord) {
    try { localStorage.setItem(CLE, JSON.stringify({ accord: accord, date: Date.now() })); } catch (e) {}
  }
  function chargerGtm() {
    if (window.dataLayer) return;
    window.dataLayer = [{ 'gtm.start': Date.now(), event: 'gtm.js' }];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM;
    document.head.appendChild(s);
  }
  function effacerCookies() {
    document.cookie.split(';').forEach(function (c) {
      var nom = c.split('=')[0].trim();
      if (nom.indexOf('_ga') === 0 || nom.indexOf('_gid') === 0) {
        ['', '; domain=.axelbrunon.fr', '; domain=axelbrunon.fr'].forEach(function (d) {
          document.cookie = nom + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  function afficher() {
    if (document.getElementById('bandeau-cookies')) return;
    /* les pages légales restent lisibles : barre simple, sans blocage */
    var bloquant = !/\/(confidentialite|mentions-legales)/.test(location.pathname);
    var style = document.createElement('style');
    style.textContent = '#bandeau-cookies{position:fixed;left:0;right:0;bottom:0;z-index:70;padding:0;color:var(--ink,#f3f4f6);font:400 .95rem/1.55 "IBM Plex Sans",system-ui,sans-serif}'
      + '#bandeau-cookies .dedans{box-sizing:border-box;width:min(1160px,100% - 32px);margin-inline:auto;padding:14px 0;display:flex;align-items:center;justify-content:space-between;gap:12px 32px}'
      + '#bandeau-cookies:not(.bloquant){border-top:1px solid var(--line,rgba(128,128,128,.35));background:var(--surface,var(--bg,#15181f))}'
      + '#bandeau-cookies.bloquant{top:0;outline:0;display:flex;align-items:flex-end;background:rgba(10,12,16,.45)}'
      + '#bandeau-cookies.bloquant .panneau{width:100%;border-top:1px solid var(--line,rgba(128,128,128,.35));background:var(--surface,var(--bg,#15181f));box-shadow:0 -12px 40px rgba(0,0,0,.3)}'
      + '#bandeau-cookies.bloquant .dedans{padding:24px 0;gap:16px 48px}'
      + '#bandeau-cookies h2{margin:0 0 10px;font-size:1.3rem;line-height:1.2;color:var(--ink,#f3f4f6)}'
      + '#bandeau-cookies p{margin:0;color:var(--soft,#c8ccd4)}#bandeau-cookies a{color:inherit;text-underline-offset:3px}'
      + '#bandeau-cookies .choix{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:8px}'
      + '#bandeau-cookies.bloquant .choix button{min-width:140px}'
      + '#bandeau-cookies button{min-width:112px;min-height:44px;padding:0 14px;border:1px solid var(--line,rgba(128,128,128,.5));border-radius:8px;background:transparent;color:var(--ink,#f3f4f6);font:500 .95rem "IBM Plex Sans",system-ui,sans-serif;cursor:pointer;transition:border-color .15s}'
      + '#bandeau-cookies button:hover{border-color:var(--ink,#f3f4f6)}'
      + '#bandeau-cookies button:focus-visible,#bandeau-cookies a:focus-visible{outline:2px solid var(--accent,#4fd1f5);outline-offset:2px}'
      + '@media (max-width:760px){#bandeau-cookies .dedans{flex-direction:column;align-items:stretch}#bandeau-cookies .choix button{min-width:0}}';
    document.head.appendChild(style);
    var b = document.createElement('section');
    b.id = 'bandeau-cookies';
    b.setAttribute('aria-label', 'Choix des cookies');
    if (bloquant) {
      b.className = 'bloquant';
      b.setAttribute('role', 'dialog');
      b.setAttribute('aria-modal', 'true');
    }
    b.innerHTML = '<div class="panneau"><div class="dedans"><div>' + (bloquant ? '<h2>Ton accord sur les cookies</h2>' : '')
      + '<p>Ce site utilise Google Analytics pour mesurer son audience et améliorer ses contenus, sans publicité. <a href="/confidentialite.html#cookies">En savoir plus</a></p></div>'
      + '<div class="choix"><button type="button" data-choix="non">Refuser</button><button type="button" data-choix="oui">Accepter</button></div></div></div>';
    b.addEventListener('click', function (e) {
      var choix = e.target.getAttribute('data-choix');
      if (!choix) return;
      var avant = lire();
      ecrire(choix === 'oui');
      fermer();
      if (choix === 'oui') chargerGtm();
      else if (avant === true) { effacerCookies(); location.reload(); }
    });
    function garderFocus(e) {
      if (e.key !== 'Tab') return;
      var liens = b.querySelectorAll('a, button'), premier = liens[0], dernier = liens[liens.length - 1];
      if (b.contains(document.activeElement)) {
        if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
        else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
      } else { e.preventDefault(); premier.focus(); }
    }
    function fermer() {
      b.remove();
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', garderFocus);
    }
    document.body.appendChild(b);
    if (bloquant) {
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', garderFocus);
      b.tabIndex = -1;
      b.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var lien = e.target.closest && e.target.closest('[data-cookies]');
    if (lien) { e.preventDefault(); afficher(); }
  });

  var choix = lire();
  if (choix === true) chargerGtm();
  else if (choix === null) afficher();
})();
