/* Карточка тендера — tender.html?id=0 */
(function () {
  const id = Math.max(0, parseInt(new URLSearchParams(location.search).get("id") || "0", 10));
  const t = (QNP.tenders || [])[id] || QNP.tenders[0];
  if (!t) return;
  const set = (id, text) => {
    const el = document.getElementById(id);
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
  const calc = document.getElementById("link-calc");
  if (calc) calc.href = `calc.html?id=${id}`;
})();
