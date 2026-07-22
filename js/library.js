/* Библиотека знаний — только список документов — library.html */
(function () {
  const libDocs = QNP.libDocs || [];
  const sections = QNP.sections || [];

  function renderLib() {
    const q = (document.getElementById("lib-filter")?.value || "").toLowerCase();
    const filtered = libDocs.filter((d) => d.toLowerCase().includes(q));
    const count = document.getElementById("lib-count");
    if (count) count.textContent = `${filtered.length} из ${libDocs.length} в базе`;
    const el = document.getElementById("lib-list");
    if (!el) return;
    el.innerHTML = filtered
      .map((d) => {
        const hasCourse = sections.some((s) => s.doc === d);
        return `<div class="lib-item" style="cursor:default">
          ${d}<small>${hasCourse ? "используется в обучении" : "в локальной базе"}</small>
        </div>`;
      })
      .join("");
  }

  document.getElementById("lib-filter")?.addEventListener("input", renderLib);
  renderLib();
})();
