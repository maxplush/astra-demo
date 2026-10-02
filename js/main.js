/* ==========================================================================
   main.js — site behaviour.

   Everything you are likely to change lives in the SITE object directly
   below. Nothing else in this file needs editing to launch.
   ========================================================================== */

const SITE = {
  // The address shown on the page and used by the contact form.
  email: "info@drink-astra.com",

  // Newsletter archive. Opens in a new tab.
  substack: "https://thesecretingredient.substack.com/s/drink-astra",

  // Optional. Create a free form at https://formspree.io and paste its
  // endpoint here to have messages delivered to an inbox. Left empty, the
  // form opens the visitor's own mail app with the message prefilled.
  formEndpoint: "",

  // Social links. Delete a line to drop that link from the footer.
  instagram: "",
};

/* ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  fillLinks();
  watchNav();
  wireForm();
  document.querySelector("[data-year]").textContent = new Date().getFullYear();
});

/** Writes the email and newsletter values into every slot that asks for them. */
function fillLinks() {
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.href = `mailto:${SITE.email}`;
    if (el.dataset.email === "text") el.textContent = SITE.email;
  });

  document.querySelectorAll("[data-substack]").forEach((el) => {
    el.href = SITE.substack;
    el.target = "_blank";
    el.rel = "noopener";
  });

  document.querySelectorAll("[data-instagram]").forEach((el) => {
    if (!SITE.instagram) return el.closest("li")?.remove();
    el.href = SITE.instagram;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/** Inverts the navigation once the hero has scrolled out of view. */
function watchNav() {
  const nav = document.querySelector(".nav");
  const hero = document.querySelector(".hero");
  if (!nav || !hero) return;

  new IntersectionObserver(
    ([entry]) => nav.classList.toggle("nav--solid", !entry.isIntersecting),
    { threshold: 0.06 }
  ).observe(hero);
}

/** Sends the contact form, or falls back to the visitor's mail app. */
function wireForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector(".form__status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name")?.trim();
    const email = data.get("email")?.trim();
    const message = data.get("message")?.trim();

    if (!name || !email || !message) {
      status.textContent = "Add your name, email and a message to send.";
      return;
    }

    if (!SITE.formEndpoint) {
      const subject = encodeURIComponent(`${data.get("topic")} — ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
      status.textContent = "Your mail app should open with the message ready.";
      return;
    }

    status.textContent = "Sending…";
    try {
      const response = await fetch(SITE.formEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(response.statusText);
      form.reset();
      status.textContent = "Sent. We'll come back to you shortly.";
    } catch {
      status.textContent = `That didn't send. Write to ${SITE.email} instead.`;
    }
  });
}
