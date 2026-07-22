/* Библиотека: список слева, содержимое справа — library.html */
(function () {
  const libDocs = QNP.libDocs || [];
  const contents = QNP.docContents || {};
  const sections = QNP.sections || [];
  let activeDoc = null;

  const params = new URLSearchParams(location.search);
  const docParam = params.get("doc");
  if (docParam && libDocs.includes(docParam)) activeDoc = docParam;

  function showDoc(name) {
    activeDoc = name;
    const data = contents[name];
    const title = document.getElementById("doc-title");
    const meta = document.getElementById("doc-meta");
    const body = document.getElementById("doc-body");
    if (!data) {
      title.textContent = name;
      meta.textContent = "текст демо не задан";
      body.innerHTML = `<p style="color:var(--muted)">Для этого файла пока нет демо-содержимого. Добавьте его в <code>js/data.js</code> → <code>QNP.docContents</code>.</p>`;
      return;
    }
    title.textContent = data.title;
    meta.textContent = name;
    body.innerHTML =
      `<div class="no">ДОКУМЕНТ</div>
       <h4 style="margin-bottom:16px">${data.title}</h4>` +
      data.body.map((p) => `<p style="font-size:14.5px;line-height:1.65;margin-bottom:12px;color:#2b3550">${p}</p>`).join("");
    history.replaceState(null, "", `library.html?doc=${encodeURIComponent(name)}`);
    renderLib();
  }

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
        const active = d === activeDoc;
        return `<button class="lib-item ${active ? "active" : ""}" type="button" data-doc="${d}">
          ${d}<small>${hasCourse ? "используется в обучении" : "в локальной базе"}</small>
        </button>`;
      })
      .join("");
    el.querySelectorAll(".lib-item").forEach((b) => {
      b.onclick = () => showDoc(b.dataset.doc);
    });
  }

  document.getElementById("lib-filter")?.addEventListener("input", renderLib);
  renderLib();
  if (activeDoc) showDoc(activeDoc);
  else if (libDocs[0]) showDoc(libDocs[3] || libDocs[0]);
})();
