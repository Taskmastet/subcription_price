/* ═══════════════════════════════════════════════
   ЦѢНА ЖИЗНИ — логика жертвоприношения
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var subsEl   = document.getElementById('subs');
  var addBtn   = document.getElementById('addSub');
  var calcBtn  = document.getElementById('calc');
  var wageEl   = document.getElementById('wage');
  var wageUnit = document.getElementById('wageUnit');
  var errorEl  = document.getElementById('error');
  var verdict  = document.getElementById('verdict');

  var curEls   = document.querySelectorAll('#currency .chip');
  var currency = '₽';

  /* ── ряд подписки ── */
  function addSubRow(name, price) {
    var row = document.createElement('div');
    row.className = 'sub-row';
    row.innerHTML =
      '<input type="text"   class="inp inp--name"  placeholder="Netflix, Spotify…" />' +
      '<input type="number" class="inp inp--price" min="0" step="any" inputmode="decimal" placeholder="0" />' +
      '<button type="button" class="kill" title="Убрать">✕</button>';
    if (name)  row.querySelector('.inp--name').value  = name;
    if (price != null) row.querySelector('.inp--price').value = price;

    row.querySelector('.kill').addEventListener('click', function () {
      if (subsEl.children.length > 1) row.remove();
      else { row.querySelector('.inp--name').value = ''; row.querySelector('.inp--price').value = ''; }
    });
    row.querySelector('.inp--price').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });
    subsEl.appendChild(row);
  }

  /* ── валюта ── */
  curEls.forEach(function (chip) {
    chip.addEventListener('click', function () {
      curEls.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      currency = chip.getAttribute('data-cur');
      wageUnit.textContent = currency + ' / час';
    });
  });

  /* ── форматирование ── */
  function fmt(n) {
    var rounded = Math.round(n * 10) / 10;
    return rounded.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  }
  function fmtMoney(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ' + currency;
  }

  /* ── приговор по числу часов в год ── */
  function judge(hoursYear) {
    if (hoursYear <= 0)   return 'Ты ничего не платишь смерти. Пока.';
    if (hoursYear < 12)   return 'Лёгкая жертва. Тьма едва коснулась тебя.';
    if (hoursYear < 60)   return 'Каждый год ты отдаёшь горсть часов в обмен на удобство.';
    if (hoursYear < 160)  return 'Дни твоей жизни тихо утекают в подписки.';
    if (hoursYear < 400)  return 'Ты отдаёшь целые сутки напролёт — снова и снова, год за годом.';
    return 'Ты — слуга. Подписки выпивают недели твоего существования.';
  }

  /* ── плавный счётчик ── */
  function countUp(el, to, suffixFmt) {
    var start = null, dur = 1100, from = 0;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = suffixFmt(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = suffixFmt(to);
    }
    requestAnimationFrame(step);
  }

  /* ── расчёт ── */
  function calculate() {
    errorEl.textContent = '';

    var total = 0, anyPrice = false;
    subsEl.querySelectorAll('.inp--price').forEach(function (p) {
      var v = parseFloat(p.value);
      if (!isNaN(v) && v > 0) { total += v; anyPrice = true; }
    });

    var wage = parseFloat(wageEl.value);

    if (!anyPrice) { errorEl.textContent = 'Впиши хотя бы одну подписку с ценой.'; return; }
    if (isNaN(wage) || wage <= 0) { errorEl.textContent = 'Назови свою цену за час — иначе жертва не принята.'; return; }

    var hoursMonth = total / wage;        // часов жизни в месяц
    var hoursYear  = hoursMonth * 12;     // часов в год
    var workDays   = hoursYear / 8;       // рабочих дней (8ч) в год
    var fullDays10 = (hoursYear * 10) / 24; // полных суток за 10 лет

    // вывод
    verdict.hidden = false;
    document.getElementById('verdictText').textContent = judge(hoursYear);
    document.getElementById('spent').textContent = fmtMoney(total);

    countUp(document.getElementById('bigHours'), hoursYear,  fmt);
    countUp(document.getElementById('hpm'),      hoursMonth, fmt);
    countUp(document.getElementById('wdays'),    workDays,   fmt);
    countUp(document.getElementById('ddays'),    fullDays10, fmt);

    verdict.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── события ── */
  addBtn.addEventListener('click', function () { addSubRow(); });
  calcBtn.addEventListener('click', calculate);
  wageEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });

  /* ── первичная разметка ── */
  addSubRow();
})();
