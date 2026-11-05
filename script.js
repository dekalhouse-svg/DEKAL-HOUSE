document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open"); menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const storageKey = "dekalhouse_analytics_v1";
  const readData = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || { visits: [], clicks: [] }; } catch { return { visits: [], clicks: [] }; } };
  const data = readData();
  data.visits.push({ at: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(data));
  document.querySelectorAll("[data-project]").forEach(link => link.addEventListener("click", () => {
    const current = readData();
    current.clicks.push({ project: link.dataset.project, at: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(current));
  }));
  const backTop = document.querySelector(".back-to-top");
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  const showBackTop = () => backTop?.classList.toggle("visible", window.scrollY > 450);
  window.addEventListener("scroll", showBackTop, { passive: true });
  showBackTop();

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  document.querySelectorAll(".faq-item").forEach(item => {
    const button = item.querySelector("button");
    button?.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(other => other.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  const slides = document.querySelector(".slides"), slideItems = document.querySelectorAll(".slide"), dots = document.querySelector(".dots");
  if (slides && slideItems.length && dots) {
    let current = 0, timer;
    slideItems.forEach((_, index) => { const dot = document.createElement("button"); dot.className = "dot" + (index === 0 ? " active" : ""); dot.setAttribute("aria-label", `Aller à l'image ${index + 1}`); dot.addEventListener("click", () => goTo(index)); dots.appendChild(dot); });
    function goTo(index) { current = (index + slideItems.length) % slideItems.length; slides.style.transform = `translateX(-${current * 100}%)`; dots.querySelectorAll(".dot").forEach((dot, i) => dot.classList.toggle("active", i === current)); restartSlider(); }
    function restartSlider() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5000); }
    document.querySelector(".prev")?.addEventListener("click", () => goTo(current - 1)); document.querySelector(".next")?.addEventListener("click", () => goTo(current + 1)); restartSlider();
  }

  const counters = document.querySelectorAll("[data-count]"); let counted = false;
  const statsSection = document.querySelector("#stats");
  if (statsSection && counters.length) {
    const statsObserver = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting) && !counted) { counted = true; counters.forEach(counter => { const target = Number(counter.dataset.count), suffix = counter.dataset.suffix || "", start = performance.now(); function tick(now) { const progress = Math.min((now - start) / 1000, 1); counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix; if (progress < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); }); } }, { threshold: .4 });
    statsObserver.observe(statsSection);
  }
  const year = document.getElementById("year"); if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", event => {
    event.preventDefault(); const data = new FormData(form);
    const name = data.get("name")?.trim(), email = data.get("email")?.trim(), phone = data.get("phone")?.trim() || "Non renseigné", project = data.get("project") || "Projet digital", message = data.get("message")?.trim();
    const subject = encodeURIComponent(`Projet DEKAL HOUSE — ${project}`);
    const body = encodeURIComponent(`Bonjour DEKAL HOUSE,\n\nNom : ${name}\nEmail : ${email}\nTéléphone : ${phone}\nType de projet : ${project}\n\nMessage :\n${message}\n\nCordialement,\n${name}`);
    window.location.href = `mailto:dekalhouse@gmail.com?subject=${subject}&body=${body}`;
    const status = form.querySelector(".form-status"); if (status) status.textContent = "Votre application de messagerie va s’ouvrir avec votre demande préparée.";
  });


});
