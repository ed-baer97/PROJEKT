/* Карточка тендера → кнопка «Разобрать кейс» — tender.html?id=0 */
(function () {
  const id = Math.max(0, parseInt(new URLSearchParams(location.search).get("id") || "0", 10));
  const t = (QNP.tenders || [])[id] || QNP.tenders[0];
  if (!t) return;

  const calc = QNP.calcCase || {};
  const points = QNP.tenderCasePoints || [];
  let activeId = null;
  let caseInited = false;

  const cardView = document.getElementById("tender-card-view");
  const caseView = document.getElementById("tender-case-view");

  const set = (elId, text) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = text;
  };

  set("td-title", t.title);
  set("td-meta", `${t.num} · ${t.portal} · ${t.region}`);
  set("td-region", t.region);
  set("td-sum", t.sum + " тг");
  set("td-deadline", t.deadline);
  set("td-customer", t.customer || "—");
  set("td-summary-meta", `${t.sum} тг · срок ${t.deadline} · ${t.region}`);

  ["td-score", "td-score-case"].forEach((sid) => {
    const el = document.getElementById(sid);
    if (el) el.textContent = `${t.score} / 100`;
  });

  ["link-calc", "link-calc-case"].forEach((sid) => {
    const el = document.getElementById(sid);
    if (el) el.href = `calc.html?id=${id}`;
  });

  function fill(str) {
    return String(str || "")
      .replaceAll("{num}", t.num)
      .replaceAll("{score}", String(t.score))
      .replaceAll("{sum}", t.sum)
      .replaceAll("{deadline}", t.deadline)
      .replaceAll("{region}", t.region)
      .replaceAll("{customer}", t.customer || "—")
      .replaceAll("{portal}", t.portal || "—")
      .replaceAll("{discount}", String(calc.discount))
      .replaceAll("{tax}", String(calc.tax))
      .replaceAll("{overhead}", String(calc.overhead))
      .replaceAll("{riskReserve}", String(calc.riskReserve))
      .replaceAll("{targetMargin}", String(calc.targetMargin))
      .replaceAll("{bidPrice}", calc.bidPrice)
      .replaceAll("{profit}", calc.profit)
      .replaceAll("{riskSum}", calc.riskSum)
      .replaceAll("{revenueNet}", calc.revenueNet)
      .replaceAll("{costLimit}", calc.costLimit)
      .replaceAll("{overheadSum}", calc.overheadSum);
  }

  const log = document.getElementById("chat-log");
  const pointsEl = document.getElementById("case-points");
  const detailEl = document.getElementById("case-detail");
  const hintsEl = document.getElementById("chat-hints");

  function addMsg(cls, html) {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function answerFor(query) {
    const low = query.toLowerCase();
    return (QNP.tenderChatAnswers || []).find((a) => a.keys.some((k) => low.includes(k)));
  }

  function botReply(query, asUser) {
    if (!query.trim()) return;
    if (asUser) addMsg("user", query);
    setTimeout(() => {
      const hit = answerFor(query);
      if (hit) addMsg("bot", fill(hit.text) + `<div class="src">📄 Источник: <b>${hit.src}</b></div>`);
      else {
        addMsg(
          "bot",
          "По этому пункту в базе и предрасчёте ответа нет. Откройте другой критерий слева или спросите про маржу, риски, налоги, сроки."
        );
      }
    }, asUser ? 650 : 200);
  }

  function sendChat(q) {
    if (!q.trim()) return;
    document.getElementById("chat-text").value = "";
    botReply(q, true);
  }

  function pointBadge(p) {
    if (p.badge === "score") return `${t.score}/100`;
    if (p.id === "margin") return `${calc.targetMargin}%`;
    if (p.id === "risk") return `${calc.riskReserve}%`;
    if (p.id === "tax") return `${calc.tax}%`;
    if (p.id === "deadline") return t.deadline;
    return "→";
  }

  function renderPoints() {
    pointsEl.innerHTML = points
      .map(
        (p) =>
          `<button type="button" class="case-point${p.id === activeId ? " active" : ""}" data-point="${p.id}">` +
          `<span class="case-point-top"><b>${p.title}</b><i>${pointBadge(p)}</i></span>` +
          `<span class="case-point-hint">${p.hint}</span>` +
          `</button>`
      )
      .join("");
    pointsEl.querySelectorAll("[data-point]").forEach((btn) => {
      btn.onclick = () => openPoint(btn.dataset.point, true);
    });
  }

  function renderDetail(p) {
    if (!p) {
      detailEl.innerHTML = `<div class="case-detail-empty">Нажмите пункт, чтобы открыть разбор</div>`;
      return;
    }
    const checks = (p.checks || []).map((c) => `<li>${fill(c)}</li>`).join("");
    detailEl.innerHTML =
      `<div class="cap">ПУНКТ КЕЙСА</div>` +
      `<h4>${p.title}</h4>` +
      `<p class="case-detail-body">${fill(p.body)}</p>` +
      (checks ? `<div class="cap" style="margin-top:12px">ЧТО РАЗОБРАТЬ</div><ul class="case-checks">${checks}</ul>` : "") +
      `<div class="case-detail-actions">` +
      `<button type="button" class="btn btn-primary btn-sm" id="ask-point">Разобрать в чате</button>` +
      `<button type="button" class="btn btn-outline btn-sm" id="close-point">Свернуть</button>` +
      `</div>`;

    document.getElementById("ask-point").onclick = () => botReply(p.title + ": " + (p.checks?.[0] || p.hint), true);
    document.getElementById("close-point").onclick = () => {
      activeId = null;
      renderPoints();
      renderDetail(null);
      renderHints(null);
    };
  }

  function renderHints(p) {
    const defaults = [
      { q: "Хватает ли маржи по этому лоту?", label: "Хватает ли маржи?" },
      { q: "Почему резерв риска 8%?", label: "Почему резерв риска?" },
      { q: "Как налог влияет на подачу?", label: "Как налог влияет?" },
      { q: "Успеем ли по срокам?", label: "Успеем по срокам?" }
    ];
    const list = p
      ? [
          { q: p.title, label: `Разбор: ${p.title}` },
          ...(p.checks || []).slice(0, 2).map((c) => ({ q: c, label: c }))
        ]
      : defaults;
    hintsEl.innerHTML = list
      .map((h) => `<button class="chip" type="button" data-q="${h.q.replaceAll('"', "&quot;")}">${h.label}</button>`)
      .join("");
    hintsEl.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => sendChat(b.dataset.q)));
  }

  function openPoint(pointId, talk) {
    const p = points.find((x) => x.id === pointId);
    if (!p) return;
    const same = activeId === pointId;
    activeId = same ? null : pointId;
    renderPoints();
    renderDetail(activeId ? p : null);
    renderHints(activeId ? p : null);
    if (talk && activeId) botReply(p.title + ". " + p.body, true);
  }

  function initCaseOnce() {
    if (caseInited) return;
    caseInited = true;
    document.getElementById("chat-send").onclick = () => sendChat(document.getElementById("chat-text").value);
    document.getElementById("chat-text").addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChat(e.target.value);
    });
    addMsg(
      "bot",
      `Лот <b>${t.num}</b> · score <b>${t.score}/100</b> · бюджет <b>${t.sum} тг</b>.` +
        `<br>Откройте пункт слева — разберём маржу, риски, налоги, сроки и остальное по предрасчёту и базе.` +
        `<div class="src">📄 Источник: <b>Предварительный расчёт · база знаний</b></div>`
    );
    renderPoints();
    renderDetail(null);
    renderHints(null);
  }

  function showCase() {
    initCaseOnce();
    cardView.hidden = true;
    caseView.hidden = false;
  }

  function showCard() {
    caseView.hidden = true;
    cardView.hidden = false;
  }

  document.getElementById("btn-case").onclick = showCase;
  document.getElementById("btn-case-back").onclick = showCard;
})();
