document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const button = item.querySelector("button");
    button.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      faqItems.forEach(other => other.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  const slides = document.querySelector(".slides");
  const slideItems = document.querySelectorAll(".slide");
  const dots = document.querySelector(".dots");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  let current = 0;
  let timer;

  slideItems.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (index === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Aller à l'image ${index + 1}`);
    dot.addEventListener("click", () => goTo(index));
    dots.appendChild(dot);
  });

  const dotItems = () => document.querySelectorAll(".dot");

  function goTo(index) {
    current = (index + slideItems.length) % slideItems.length;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dotItems().forEach((dot, i) => dot.classList.toggle("active", i === current));
    restartSlider();
  }

  function restartSlider() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prev?.addEventListener("click", () => goTo(current - 1));
  next?.addEventListener("click", () => goTo(current + 1));
  restartSlider();

  const counters = document.querySelectorAll("[data-count]");
  let counted = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !counted) {
      counted = true;
      counters.forEach(counter => {
        const target = Number(counter.dataset.count);
        const suffix = counter.dataset.suffix || "";
        const duration = 1000;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  }, { threshold: .4 });

  const statsSection = document.querySelector("#stats");
  if (statsSection) statsObserver.observe(statsSection);

  document.getElementById("year").textContent = new Date().getFullYear();

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name")?.trim();
    const email = data.get("email")?.trim();
    const phone = data.get("phone")?.trim() || "Non renseigné";
    const project = data.get("project") || "Projet digital";
    const message = data.get("message")?.trim();

    const subject = encodeURIComponent(`Projet DEKAL HOUSE — ${project}`);
    const body = encodeURIComponent(
      `Bonjour DEKAL HOUSE,\n\nNom : ${name}\nEmail : ${email}\nTéléphone : ${phone}\nType de projet : ${project}\n\nMessage :\n${message}\n\nCordialement,\n${name}`
    );

    window.location.href = `mailto:contact@dekal.house?subject=${subject}&body=${body}`;
    const status = form.querySelector(".form-status");
    status.textContent = "Votre application de messagerie va s'ouvrir avec votre demande préparée.";
  });
});
