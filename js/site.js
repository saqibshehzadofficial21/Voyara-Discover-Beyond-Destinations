(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-year]").forEach(node => node.textContent = new Date().getFullYear());
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");
    toggle?.addEventListener("click", () => {
      const open = links?.classList.toggle("is-open") || false;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      toggle.textContent = open ? "×" : "☰";
    });
    const current = location.pathname.split("/").pop() || "index.html";
    const page = current === "about.html" ? "about" : current === "contact.html" ? "contact" : "home";
    document.querySelector(`[data-page="${page}"]`)?.setAttribute("aria-current", "page");

    // Search from secondary pages redirects to the home page's Fetch-powered search.
    document.querySelector("#nav-search")?.addEventListener("submit", event => {
      event.preventDefault();
      const query = document.querySelector("#nav-query")?.value.trim() || "";
      if (!query) {
        document.querySelector("#nav-query")?.focus();
        return;
      }
      window.location.href = `index.html?search=${encodeURIComponent(query)}#search`;
    });
    document.querySelector("#nav-clear")?.addEventListener("click", () => {
      const input = document.querySelector("#nav-query");
      if (input) input.value = "";
      input?.focus();
    });
  });
})();
