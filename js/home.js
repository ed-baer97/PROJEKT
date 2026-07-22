/* Главная — таблица тендеров — index.html */
(function () {
  const rows = document.getElementById("tender-rows");
  if (!rows) return;
  rows.innerHTML = (QNP.tenders || [])
    .map(
      (t, i) => `
    <tr>
      <td><a class="tender-link" href="tender.html?id=${i}">${t.title}</a></td>
      <td>${t.region}</td>
      <td>${t.sum}</td>
      <td>${t.deadline}</td>
      <td><span class="pill pill-amber">${t.status}</span></td>
      <td>${t.portal}</td>
      <td>${t.num}</td>
      <td><div class="score">${t.score}<small>Ручная</small></div></td>
    </tr>`
    )
    .join("");
})();
