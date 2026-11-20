/*
 * The page. Wires the textareas to detect() and redact(). Nothing here
 * touches the network or browser storage; the Session lives in this closure.
 */
(function () {
  'use strict';

  const { detect } = globalThis.PG.detect;
  const { Session, redact, restore } = globalThis.PG.redact;

  const $ = (id) => document.getElementById(id);
  const src = $('src'), out = $('out'), counts = $('counts'), ans = $('ans'), rest = $('rest');

  const TYPE_NAMES = {
    PERSON: 'Person', PHONE: 'Phone', EMAIL: 'Email', IBAN: 'IBAN', DOB: 'Date of birth',
    ID: 'ID number', CASE: 'Case number', OTHER: 'Other',
  };
  const WHY = {
    cue: 'found after a title or cue word',
    gazetteer: 'found in the built-in name list',
    pattern: 'matches a number or address pattern',
    user: 'in your extra names list',
    manual: 'you selected it',
    repeat: 'same name as one found elsewhere in the note',
    strict: 'strict mode: capitalised word',
  };

  let session = new Session();
  let ignore = new Set();      // "TYPE|key" the user chose to keep
  let manual = [];             // [{ text, type }]
  let lastOutput = '';
  let lastRestored = '';

  // ---------- samples ----------

  const SAMPLES = {
    en: 'Case note, 18 March. Mrs Hanan Saab (NBR-LB-2025-004817) called about the delayed cash assistance. Her husband, Elias, lost his job in January and the family now lives with her mother in Tripoli. She can be reached on +961 71 123 456 or hanan.saab@example.org. Date of birth: 02/08/1982. Passport RL4567812. IBAN for the transfer: LB62 0999 0000 0001 0019 0122 9114.\n\nPlease pass this on to Gaelle in the protection team, and rewrite it as a short, polite summary for the area manager.',
    fr: "Note de dossier, 18 mars. Madame Hanane Khoury (NBR-LB-2025-005541), née le 04/09/1980, a appelé au sujet du report de loyer. Son mari, Georges, est sans emploi depuis janvier. Elle est joignable au 03 765 432 ou à hanane.khoury@example.org. Carte d'identité n° 034567891234.\n\nMerci de rédiger un résumé poli pour la responsable de zone.",
    ar: 'ملاحظة ملف، ١٨ آذار. اتصلت السيدة حنان صعب (NBR-LB-2025-004817) بخصوص تأخر المساعدة النقدية. زوجها إلياس فقد عمله في كانون الثاني وتعيش العائلة مع والدتها في طرابلس. يمكن الوصول إليها على الرقم ٠٣ ١٢٣ ٤٥٦ أو البريد hanan.saab@example.org. تاريخ الميلاد: ٠٢/٠٨/١٩٨٢. رقم جواز السفر RL4567812.\n\nيرجى كتابة ملخص مهذب لمدير المنطقة.',
  };

  // ---------- rendering ----------

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // Put segments into lines; each line gets dir="auto" so Arabic reads right to left.
  function paint(container, segments, makeTok) {
    container.textContent = '';
    let line = el('div', 'ln');
    line.dir = 'auto';
    const flush = () => { if (!line.childNodes.length) line.appendChild(document.createElement('br')); container.appendChild(line); };
    for (const seg of segments) {
      const parts = seg.text.split('\n');
      parts.forEach((part, i) => {
        if (i > 0) { flush(); line = el('div', 'ln'); line.dir = 'auto'; }
        if (!part) return;
        line.appendChild(seg.redacted || seg.kept || seg.restored ? makeTok(seg, part) : document.createTextNode(part));
      });
    }
    flush();
  }

  function outTok(seg, text) {
    const b = el('span', 'tok t-' + seg.type + (seg.kept ? ' kept' : ''), text);
    b.tabIndex = 0;
    b.setAttribute('role', 'button');
    b.dataset.id = seg.id;
    const why = WHY[seg.source] || '';
    b.title = seg.kept
      ? TYPE_NAMES[seg.type] + ', kept as written. Click to redact it again.'
      : TYPE_NAMES[seg.type] + (why ? ' (' + why + ')' : '') + '. Click to keep the original.';
    return b;
  }

  function render() {
    const text = src.value;
    const extraNames = $('extra').value.split('\n').map((s) => s.trim()).filter(Boolean);
    const spans = detect(text, { extraNames, manual, strict: $('strict').checked });
    const res = redact(text, spans, session, { ignore });
    lastOutput = res.output;
    paint(out, res.segments, outTok);
    if (!text) { out.textContent = ''; const p = el('p', 'empty', 'The redacted text appears here as you type.'); out.appendChild(p); }

    counts.textContent = '';
    const total = Object.values(res.counts).reduce((a, b) => a + b, 0);
    const keptN = res.segments.filter((s) => s.kept).length;
    const head = el('span', 'total', total ? total + (total === 1 ? ' value redacted' : ' values redacted') : 'Nothing redacted yet');
    counts.appendChild(head);
    for (const t of Object.keys(TYPE_NAMES)) {
      if (!res.counts[t]) continue;
      const chip = el('span', 'chip t-' + t, TYPE_NAMES[t] + ' ' + res.counts[t]);
      counts.appendChild(chip);
    }
    if (keptN) counts.appendChild(el('span', 'chip kept-chip', keptN + ' kept'));

    $('session-info').textContent = session.size
      ? session.size + ' value' + (session.size === 1 ? '' : 's') + ' mapped in this tab’s memory.'
      : 'Nothing mapped yet.';
    $('copy-red').disabled = !lastOutput;
    renderManual();
    renderRestore();
  }

  function renderManual() {
    const ul = $('manual');
    ul.textContent = '';
    manual.forEach((m, i) => {
      const li = el('li', 'mchip t-' + m.type);
      li.appendChild(el('span', 'mtxt', m.text));
      const x = el('button', 'mx', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Stop redacting ' + m.text);
      x.addEventListener('click', () => { manual.splice(i, 1); render(); });
      li.appendChild(x);
      ul.appendChild(li);
    });
  }

  function renderRestore() {
    const res = restore(ans.value, session);
    lastRestored = res.output;
    paint(rest, res.segments, (seg, text) => {
      const type = seg.placeholder.replace(/^\[|_\d+\]$/g, '').replace('REDACTED', 'OTHER');
      const s = el('span', 'tok t-' + type + ' restored', text);
      s.title = seg.placeholder + ' restored';
      // A number made of Arabic-Indic digits would otherwise display backwards inside a left-to-right
      // line (bidi rule N1 treats the spaces between digit groups as right-to-left). Names stay 'auto'.
      if (/[٠-٩]/.test(text) && !/[ء-ي]/.test(text)) s.classList.add('digits');
      else s.dir = 'auto';
      return s;
    });
    if (!ans.value) { rest.textContent = ''; rest.appendChild(el('p', 'empty', 'The restored answer appears here.')); }
    const info = $('rest-info');
    if (!ans.value) info.textContent = '';
    else {
      let msg = res.restored + ' placeholder' + (res.restored === 1 ? '' : 's') + ' restored.';
      if (res.unknown.length) msg += ' Not in this session, left as they are: ' + res.unknown.join(', ') + '.';
      if (!res.restored && !res.unknown.length) msg = 'No placeholders found in this answer.';
      info.textContent = msg;
    }
    $('copy-rest').disabled = !ans.value;
  }

  // ---------- actions ----------

  out.addEventListener('click', (e) => {
    const t = e.target.closest('.tok');
    if (!t || !t.dataset.id) return;
    toggle(t.dataset.id);
  });
  out.addEventListener('keydown', (e) => {
    const t = e.target.closest && e.target.closest('.tok');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(t.dataset.id); }
  });
  function toggle(id) {
    if (ignore.has(id)) ignore.delete(id); else ignore.add(id);
    render();
  }

  function selectedText() {
    if (document.activeElement === src || (src.selectionStart !== src.selectionEnd)) {
      const s = src.value.slice(src.selectionStart, src.selectionEnd).trim();
      if (s) return s;
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && out.contains(sel.anchorNode)) return sel.toString().trim();
    return '';
  }

  function updateSelButton() {
    const s = selectedText();
    $('redact-sel').disabled = !s;
    $('redact-sel').textContent = s ? 'Redact “' + (s.length > 22 ? s.slice(0, 21) + '…' : s) + '”' : 'Redact selected text';
  }
  ['select', 'keyup', 'mouseup', 'touchend', 'input', 'blur'].forEach((ev) => src.addEventListener(ev, () => setTimeout(updateSelButton, 0)));
  document.addEventListener('selectionchange', updateSelButton);

  $('redact-sel').addEventListener('click', () => {
    const s = selectedText();
    if (!s) return;
    if (!manual.some((m) => m.text.toLowerCase() === s.toLowerCase())) manual.push({ text: s, type: $('seltype').value });
    render();
    updateSelButton();
  });

  function setSample(lang) {
    src.value = SAMPLES[lang];
    src.dir = 'auto';
    render();
    $('sel-hint').textContent = lang === 'en'
      ? 'This sample has a name the tool does not catch on purpose: "Gaelle". Find it in the redacted text, select it in the note, and press the button.'
      : 'Select any text in the note or in the redacted view, then press the button. Every copy of it is redacted.';
  }
  $('s-en').addEventListener('click', () => setSample('en'));
  $('s-fr').addEventListener('click', () => setSample('fr'));
  $('s-ar').addEventListener('click', () => setSample('ar'));

  $('clear').addEventListener('click', () => { src.value = ''; render(); src.focus(); });
  $('reset').addEventListener('click', () => { session = new Session(); ignore = new Set(); manual = []; render(); });
  $('strict').addEventListener('change', render);
  $('extra').addEventListener('input', render);
  src.addEventListener('input', render);
  ans.addEventListener('input', renderRestore);

  $('example-answer').addEventListener('click', () => {
    const find = (label) => [...session.byPlaceholder.keys()].find((k) => k.startsWith('[' + label + '_'));
    const p = find('PERSON'), t = find('PHONE'), c = find('CASE');
    ans.value = 'Summary for the area manager:\n' +
      (p ? p + ' ' : 'The beneficiary ') + (c ? '(file ' + c + ') ' : '') + 'asked about delayed cash assistance after the household lost its income in January.' +
      (t ? ' Please call ' + p + ' back on ' + t + '.' : '') + '\nSuggested next step: check the payment status and confirm a date.';
    renderRestore();
  });

  async function copy(text, btn) {
    const label = btn.textContent;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      btn.textContent = 'Copied';
    } catch (e) { btn.textContent = 'Copy failed: select and copy by hand'; }
    setTimeout(() => { btn.textContent = label; }, 1600);
  }
  $('copy-red').addEventListener('click', () => copy(lastOutput, $('copy-red')));
  $('copy-rest').addEventListener('click', () => copy(lastRestored, $('copy-rest')));

  render();
})();
