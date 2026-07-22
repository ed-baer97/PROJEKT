/* Библиотека — презентации и тесты — library.html */
(function () {
  const sections = QNP.sections || [];
  const libDocs = QNP.libDocs || [];
  let curSec = 2;
  let curSlide = 0;

  const params = new URLSearchParams(location.search);
  const docParam = params.get("doc");
  if (docParam) {
    const idx = sections.findIndex((s) => s.doc === docParam);
    if (idx >= 0) curSec = idx;
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
        const idx = sections.findIndex((s) => s.doc === d);
        const active = idx === curSec;
        return `<button class="lib-item ${active ? "active" : ""}" data-idx="${idx}" type="button">
          ${d}<small>${idx >= 0 ? "есть презентация и тест" : "в локальной базе"}</small>
        </button>`;
      })
      .join("");
    el.querySelectorAll(".lib-item").forEach((b) => {
      b.onclick = () => {
        const idx = +b.dataset.idx;
        if (idx >= 0) {
          curSec = idx;
          curSlide = 0;
          history.replaceState(null, "", `library.html?doc=${encodeURIComponent(sections[curSec].doc)}`);
          renderLib();
          renderSlide();
          renderTest();
          setTab("pres");
        }
      };
    });
  }

  function renderSlide() {
    const s = sections[curSec];
    const sl = s.slides[curSlide];
    document.getElementById("slide-body").innerHTML =
      `<div class="no">${s.title} · слайд ${curSlide + 1} / ${s.slides.length}</div>
       <h4>${sl.h}</h4>
       <ul>${sl.pts.map((p) => `<li>${p}</li>`).join("")}</ul>
       <div class="src">Источник: ${s.doc} · сгенерировано ИИ, проверено экспертом</div>`;
    document.getElementById("slide-dots").innerHTML = s.slides
      .map((_, i) => `<i class="${i === curSlide ? "on" : ""}" data-i="${i}"></i>`)
      .join("");
    document.querySelectorAll("#slide-dots i").forEach((d) => {
      d.onclick = () => {
        curSlide = +d.dataset.i;
        renderSlide();
      };
    });
    document.getElementById("prev-slide").disabled = curSlide === 0;
    document.getElementById("next-slide").disabled = curSlide === s.slides.length - 1;
  }

  document.getElementById("prev-slide").onclick = () => {
    if (curSlide > 0) {
      curSlide--;
      renderSlide();
    }
  };
  document.getElementById("next-slide").onclick = () => {
    if (curSlide < sections[curSec].slides.length - 1) {
      curSlide++;
      renderSlide();
    }
  };

  function renderTest() {
    const qs = sections[curSec].questions;
    document.getElementById("test-questions").innerHTML = qs
      .map(
        (item, qi) =>
          `<div class="q"><h5><span style="color:var(--teal)">Вопрос ${qi + 1}.</span> ${item.q}</h5>` +
          item.opts
            .map(
              (o, oi) =>
                `<label class="opt" data-q="${qi}" data-o="${oi}"><input type="radio" name="q${qi}" value="${oi}">${o}</label>`
            )
            .join("") +
          `</div>`
      )
      .join("");
    const r = document.getElementById("learn-result");
    r.className = "";
    r.style.display = "none";
  }

  document.getElementById("check-test").onclick = () => {
    const qs = sections[curSec].questions;
    let score = 0;
    let answered = 0;
    qs.forEach((item, qi) => {
      const sel = document.querySelector(`input[name=q${qi}]:checked`);
      document.querySelectorAll(`.opt[data-q="${qi}"]`).forEach((l) => l.classList.remove("ok", "bad"));
      if (!sel) return;
      answered++;
      const chosen = +sel.value;
      if (chosen === item.correct) score++;
      document.querySelector(`.opt[data-q="${qi}"][data-o="${item.correct}"]`).classList.add("ok");
      if (chosen !== item.correct)
        document.querySelector(`.opt[data-q="${qi}"][data-o="${chosen}"]`).classList.add("bad");
    });
    const r = document.getElementById("learn-result");
    if (answered < qs.length) {
      r.className = "fail";
      r.textContent = `Ответьте на все вопросы (${answered}/${qs.length})`;
      return;
    }
    r.className = score === qs.length ? "pass" : "fail";
    r.textContent =
      score === qs.length
        ? `Отлично! ${score} из ${qs.length}. Раздел зачтён.`
        : `Результат: ${score} из ${qs.length}. Перечитайте презентацию и попробуйте ещё раз.`;
  };
  document.getElementById("reset-test").onclick = renderTest;

  function setTab(name) {
    document.querySelectorAll("[data-ltab]").forEach((t) => t.classList.toggle("active", t.dataset.ltab === name));
    document.getElementById("ltab-pres").style.display = name === "pres" ? "flex" : "none";
    document.getElementById("ltab-test").style.display = name === "test" ? "flex" : "none";
    document.getElementById("learn-panel-title").textContent =
      name === "pres" ? "Обучающая презентация" : "Тест по разделу";
  }
  document.querySelectorAll("[data-ltab]").forEach((t) => (t.onclick = () => setTab(t.dataset.ltab)));
  document.getElementById("jump-test")?.addEventListener("click", () => setTab("test"));
  document.getElementById("lib-filter")?.addEventListener("input", renderLib);

  renderLib();
  renderSlide();
  renderTest();
  if (params.get("tab") === "test") setTab("test");
})();
