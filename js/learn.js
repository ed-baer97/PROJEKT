/* Обучение: презентация + тест + чат — learn.html */
(function () {
  const sections = QNP.sections || [];
  if (!sections.length) return;

  let curSec = 2;
  let curSlide = 0;

  function renderChips() {
    const el = document.getElementById("section-chips");
    if (!el) return;
    el.innerHTML = sections
      .map(
        (s, i) =>
          `<button class="chip ${i === curSec ? "active" : ""}" type="button" data-sec="${i}">${s.title}</button>`
      )
      .join("");
    el.querySelectorAll("[data-sec]").forEach((b) => {
      b.onclick = () => {
        curSec = +b.dataset.sec;
        curSlide = 0;
        renderChips();
        renderSlide();
        renderTest();
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

  /* Чат */
  const log = document.getElementById("chat-log");
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
    document.getElementById("chat-text").value = "";
    setTimeout(() => {
      const low = q.toLowerCase();
      const hit = (QNP.chatAnswers || []).find((a) => a.keys.some((k) => low.includes(k)));
      if (hit) addMsg("bot", hit.text + `<div class="src">📄 Источник: <b>${hit.src}</b></div>`);
      else addMsg("bot", "В базе знаний ответа на этот вопрос нет. Я отвечаю только по загруженным материалам.");
    }, 650);
  }
  document.getElementById("chat-send").onclick = () => sendChat(document.getElementById("chat-text").value);
  document.getElementById("chat-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat(e.target.value);
  });
  document.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => sendChat(b.dataset.q)));

  renderChips();
  renderSlide();
  renderTest();
})();
