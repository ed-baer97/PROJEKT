/* Чат обучения — learn.html */
(function () {
  const log = document.getElementById("chat-log");
  if (!log) return;

  function addMsg(cls, html) {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function sendChat(q) {
    if (!q.trim()) return;
    addMsg("user", q);
    const input = document.getElementById("chat-text");
    if (input) input.value = "";
    setTimeout(() => {
      const low = q.toLowerCase();
      const hit = (QNP.chatAnswers || []).find((a) => a.keys.some((k) => low.includes(k)));
      if (hit) addMsg("bot", hit.text + `<div class="src">📄 Источник: <b>${hit.src}</b></div>`);
      else addMsg("bot", "В базе знаний ответа на этот вопрос нет. Я отвечаю только по загруженным материалам.");
    }, 650);
  }

  document.getElementById("chat-send")?.addEventListener("click", () =>
    sendChat(document.getElementById("chat-text").value)
  );
  document.getElementById("chat-text")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat(e.target.value);
  });
  document.querySelectorAll("[data-q]").forEach((b) =>
    b.addEventListener("click", () => sendChat(b.dataset.q))
  );

  const filter = document.getElementById("lib-filter-mini");
  const list = document.getElementById("lib-list-mini");
  const count = document.getElementById("lib-count-mini");

  function renderMini() {
    const q = (filter?.value || "").toLowerCase();
    const docs = (QNP.libDocs || []).filter((d) => d.toLowerCase().includes(q));
    if (count) count.textContent = `${docs.length} из ${QNP.libDocs.length} документов`;
    if (!list) return;
    list.innerHTML = docs
      .map((d) => {
        const has = (QNP.sections || []).some((s) => s.doc === d);
        return `<a class="lib-item" href="library.html?doc=${encodeURIComponent(d)}">${d}<small>${has ? "есть презентация и тест" : "в локальной базе"}</small></a>`;
      })
      .join("");
  }
  filter?.addEventListener("input", renderMini);
  renderMini();
})();
