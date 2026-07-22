/* Карточка тендера + разбор кейса — tender.html?id=0 */
(function () {
  const id = Math.max(0, parseInt(new URLSearchParams(location.search).get("id") || "0", 10));
  const t = (QNP.tenders || [])[id] || QNP.tenders[0];
  if (!t) return;

  const calc = QNP.calcCase || {};
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
  const score = document.getElementById("td-score");
  if (score) score.textContent = `${t.score} / 100`;
  const linkCalc = document.getElementById("link-calc");
  if (linkCalc) linkCalc.href = `calc.html?id=${id}`;

  /* Чат: разбор лота как кейса (маржа / риски / сроки / налоги + база) */
  const log = document.getElementById("chat-log");
  if (!log) return;

  function addMsg(cls, html) {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function intro() {
    addMsg(
      "bot",
      `Разбираю лот <b>${t.num}</b> как кейс по предрасчёту и базе знаний.` +
        `<br><br>Score <b>${t.score}/100</b> · бюджет <b>${t.sum} тг</b> · срок <b>${t.deadline}</b>.` +
        `<br>Параметры: скидка ${calc.discount}%, налог ${calc.tax}%, резерв риска ${calc.riskReserve}%, целевая маржа ${calc.targetMargin}%.` +
        `<br>Рекомендуемая подача <b>${calc.bidPrice} тг</b>, плановая прибыль <b>${calc.profit} тг</b>.` +
        `<div class="src">📄 Источник: <b>Предварительный расчёт · Успех и риски проекта</b></div>`
    );
  }

  function sendChat(q) {
    if (!q.trim()) return;
    addMsg("user", q);
    document.getElementById("chat-text").value = "";
    setTimeout(() => {
      const low = q.toLowerCase();
      const hit = (QNP.tenderChatAnswers || []).find((a) => a.keys.some((k) => low.includes(k)));
      if (hit) {
        let text = hit.text
          .replaceAll("{num}", t.num)
          .replaceAll("{score}", String(t.score))
          .replaceAll("{sum}", t.sum)
          .replaceAll("{deadline}", t.deadline)
          .replaceAll("{region}", t.region)
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
        addMsg("bot", text + `<div class="src">📄 Источник: <b>${hit.src}</b></div>`);
      } else {
        addMsg(
          "bot",
          "По этому кейсу в базе и предрасчёте ответа нет. Спросите про маржу, риски, налоги или сроки — либо откройте предварительный расчёт."
        );
      }
    }, 650);
  }

  document.getElementById("chat-send").onclick = () => sendChat(document.getElementById("chat-text").value);
  document.getElementById("chat-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat(e.target.value);
  });
  document.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => sendChat(b.dataset.q)));

  intro();
})();
