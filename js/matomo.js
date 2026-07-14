    var _paq = window._paq = window._paq || [];
    /* Analitica senza cookie + IP anonimizzato (lato server): nessun consenso
       richiesto, nessun banner. Vedi privacy.html § 3.4. */
    _paq.push(['disableCookies']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
    var u="//matomodocker.azurewebsites.net/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '7']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
