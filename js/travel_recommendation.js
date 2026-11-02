(() => {
  "use strict";
  const DATA_URL = "travel_recommendation_api.json";
  const aliases = {
    beach: ["beach", "beaches", "tropical beach", "coastal", "seaside"],
    temple: ["temple", "temples", "historical temple", "spiritual", "religious sites"],
    country: ["country", "countries", "nation", "nations"]
  };
  let recommendations = null;
  const normalize = value => value.toLocaleLowerCase().trim().replace(/\s+/g, " ");
  function categoryFor(query) {
    const term = normalize(query);
    return Object.entries(aliases).find(([, words]) => words.includes(term))?.[0] || null;
  }
  function setFeedback(message, kind = "") {
    const feedback = document.querySelector("#search-feedback");
    if (feedback) {
      feedback.textContent = message;
      feedback.dataset.state = kind;
    }
  }
  function safeImage(image, url, alt) {
    image.src = url;
    image.alt = alt;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.alt = `${alt} — image unavailable`;
      image.classList.add("image-unavailable");
      image.style.background = "linear-gradient(135deg,#d8ddd5,#b9c5bc)";
      image.style.minHeight = "220px";
    }, { once: true });
  }
  function renderResults(items) {
    const target = document.querySelector("#search-results");
    if (!target) return;
    target.replaceChildren();
    items.forEach(place => {
      const article = document.createElement("article");
      article.className = "result-card";
      const image = document.createElement("img");
      safeImage(image, place.imageUrl, `${place.name}, ${place.location}`);
      const body = document.createElement("div");
      body.className = "card-body";
      const meta = document.createElement("div");
      meta.className = "card-meta";
      const category = document.createElement("span");
      category.textContent = place.category;
      const country = document.createElement("span");
      country.textContent = place.country;
      meta.append(category, country);
      const heading = document.createElement("h3");
      heading.textContent = place.name;
      const description = document.createElement("p");
      description.textContent = place.description;
      const location = document.createElement("div");
      location.className = "card-location";
      location.textContent = place.location;
      body.append(meta, heading, description, location);
      if (place.highlight) {
        const highlight = document.createElement("p");
        highlight.className = "highlight";
        highlight.textContent = `Travel highlight · ${place.highlight}`;
        body.append(highlight);
      }
      article.append(image, body);
      target.append(article);
    });
  }
  async function loadData() {
    const feedback = document.querySelector("#search-feedback");
    if (feedback) {
      feedback.innerHTML = '<span class="loading"><span class="spinner" aria-hidden="true"></span>Loading destination collection…</span>';
    }
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`Data request failed (${response.status})`);
      const data = await response.json();
      const valid = data && ["beaches", "temples", "countries"].every(key =>
        Array.isArray(data[key]) && data[key].length >= 2 &&
        data[key].every(item => item.id && item.name && item.category && item.country && item.description && item.imageUrl && item.location)
      );
      if (!valid) throw new Error("The destination data is incomplete or has an unexpected structure.");
      recommendations = data;
      setFeedback("Search our curated collection by category.");
    } catch (error) {
      recommendations = null;
      setFeedback(`We couldn't load destination recommendations. ${error.message} Run this project through a local web server and check that the JSON file is in the project root.`, "error");
    }
  }
  function performSearch(rawQuery) {
    const query = normalize(rawQuery);
    const target = document.querySelector("#search-results");
    if (!query) {
      renderResults([]);
      setFeedback("Please enter a keyword such as beach, temple or country.", "error");
      document.querySelector("#search-input")?.focus();
      return;
    }
    if (!recommendations) {
      setFeedback("The destination collection is not available yet. Please refresh and try again.", "error");
      return;
    }
    const category = categoryFor(query);
    if (!category) {
      renderResults([]);
      setFeedback(`No category matched “${rawQuery.trim()}”. Try beach, beaches, tropical beach, coastal, seaside, temple, temples, spiritual, religious sites, country or countries.`, "empty");
      return;
    }
    const key = `${category}s`;
    const results = recommendations[key] || [];
    renderResults(results);
    setFeedback(`${results.length} ${category} recommendations to inspire your next journey.`, "success");
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function clearSearch() {
    const input = document.querySelector("#search-input");
    if (input) input.value = "";
    const navInput = document.querySelector("#nav-query");
    if (navInput) navInput.value = "";
    renderResults([]);
    setFeedback(recommendations ? "Search our curated collection by category." : "Destination data is still loading.");
    input?.focus();
  }
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#destination-search");
    const input = document.querySelector("#search-input");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      performSearch(input?.value || "");
    });
    document.querySelector("#clear-search")?.addEventListener("click", clearSearch);
    document.querySelector("#nav-search")?.addEventListener("submit", event => {
      event.preventDefault();
      const value = document.querySelector("#nav-query")?.value || "";
      if (document.querySelector("#search-input")) {
        document.querySelector("#search-input").value = value;
        document.querySelector("#search")?.scrollIntoView({ behavior: "smooth" });
        performSearch(value);
      } else {
        window.location.href = `index.html?search=${encodeURIComponent(value)}#search`;
      }
    });
    document.querySelector("#nav-clear")?.addEventListener("click", () => {
      const navInput = document.querySelector("#nav-query");
      if (navInput) navInput.value = "";
      if (document.querySelector("#search-input")) clearSearch();
      else window.location.href = "index.html";
    });
    document.querySelectorAll("[data-category]").forEach(link => {
      link.addEventListener("click", () => {
        const inputEl = document.querySelector("#search-input");
        if (inputEl) {
          inputEl.value = link.dataset.category;
          performSearch(link.dataset.category);
        }
      });
    });
    loadData().then(() => {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query && input) {
        input.value = query;
        performSearch(query);
      }
    });
  });
})();
