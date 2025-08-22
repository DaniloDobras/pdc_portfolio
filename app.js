// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", () => {
      links.classList.toggle("open");
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
    });
    // Close after click
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  // Footer year (optional—remove if you prefer static)
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
