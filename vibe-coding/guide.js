/* oettl.org/vibe-coding — remembers the reader's computer and tool,
   shows only the matching steps, and copies prompts. No dependencies.
   Without JavaScript every variant is shown with its label. */
(function () {
  var root = document.documentElement;
  var KEY = 'vibe-coding-setup';
  var OS = ['mac', 'win'];
  var TOOLS = ['antigravity', 'claude', 'codex'];

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      return (s && typeof s === 'object') ? s : {};
    } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window */ }
  }

  var state = load();
  if (OS.indexOf(state.os) < 0) {
    var ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    state.os = /win/i.test(ua) ? 'win' : (/mac/i.test(ua) && !/iphone|ipad/i.test(navigator.userAgent) ? 'mac' : null);
  }
  if (TOOLS.indexOf(state.tool) < 0) { state.tool = null; }

  /* a link can preselect a setup: /vibe-coding/?os=win&tool=codex */
  try {
    var q = new URLSearchParams(location.search);
    if (OS.indexOf(q.get('os')) >= 0) { state.os = q.get('os'); }
    if (TOOLS.indexOf(q.get('tool')) >= 0) { state.tool = q.get('tool'); }
  } catch (e) { /* old browser: ignore the link's choice */ }

  function apply() {
    if (state.os) { root.setAttribute('data-os', state.os); } else { root.removeAttribute('data-os'); }
    if (state.tool) { root.setAttribute('data-tool', state.tool); } else { root.removeAttribute('data-tool'); }
    var inputs = document.querySelectorAll('.pick input[data-pick]');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].checked = state[inputs[i].getAttribute('data-pick')] === inputs[i].value;
    }
  }

  root.classList.remove('no-js');
  apply();

  document.addEventListener('DOMContentLoaded', function () {
    apply();

    document.addEventListener('change', function (e) {
      var el = e.target;
      if (!el.matches || !el.matches('.pick input[data-pick]')) { return; }
      state[el.getAttribute('data-pick')] = el.value;
      save(state);
      apply();
    });

    var buttons = document.querySelectorAll('.prompt button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var btn = this;
        var text = btn.parentNode.querySelector('p').innerText.replace(/\s+/g, ' ').trim();
        function done() {
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
        } else {
          fallback(text, done);
        }
      });
    }
  });

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { if (document.execCommand('copy')) { done(); } } catch (e) { /* copy blocked */ }
    document.body.removeChild(ta);
  }
})();
