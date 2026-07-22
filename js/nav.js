/* Общая шапка-навигация: подсветка текущей страницы */
(function () {
  const page = document.body.dataset.page || "";
  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.dataset.nav === page) el.classList.add("active-nav");
  });
})();
