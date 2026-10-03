/* ==========================================================================
   popup.js — the launch-list signup dialog.

   Set SIGNUP.endpoint below and the popup turns itself on. Leave it empty
   and the popup never appears, so the site is never showing a dead form.
   ========================================================================== */

const SIGNUP = {
  /* Where the address is sent. See README for how to get one.
     Kit:       "https://app.kit.com/forms/1234567/subscriptions"
     Formspree: "https://formspree.io/f/abcdwxyz"                          */
  endpoint: "https://app.kit.com/forms/9998092/subscriptions",

  /* What the service calls the email field.
     Kit uses "email_address". Formspree and most others use "email".      */
  fieldName: "email_address",

  /* Seconds on the page before it appears. It also triggers earlier if the
     visitor scrolls past a third of the page or moves to leave the tab.   */
  delaySeconds: 12,

  /* Days before a visitor who closed it without signing up sees it again.
     Someone who signed up never sees it again.                            */
  snoozeDays: 30,
};

/* ---------------------------------------------------------------------- */

const STORE_KEY = "astra.signup";

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.querySelector("[data-signup]");
  if (!dialog || !SIGNUP.endpoint) return;
  if (readState() === "joined") return;
  if (isSnoozed()) return;

  new SignupDialog(dialog).arm();
});

class SignupDialog {
  constructor(root) {
    this.root = root;
    this.form = root.querySelector(".signup__form");
    this.input = root.querySelector("input[type='email']");
    this.status = root.querySelector(".signup__status");
    this.lastFocused = null;
    this.opened = false;
  }

  /** Waits for whichever trigger comes first, then opens once. */
  arm() {
    const open = () => this.open();

    const timer = setTimeout(open, SIGNUP.delaySeconds * 1000);

    const onScroll = () => {
      const seen = window.scrollY / (document.body.scrollHeight - innerHeight);
      if (seen > 0.33) open();
    };

    const onLeave = (event) => {
      if (event.clientY <= 0) open();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);

    this.cleanupTriggers = () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };

    this.root.querySelectorAll("[data-signup-close]").forEach((el) =>
      el.addEventListener("click", () => this.close())
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.opened) this.close();
      if (e.key === "Tab" && this.opened) this.trapFocus(e);
    });
    this.form.addEventListener("submit", (e) => this.submit(e));
  }

  open() {
    if (this.opened) return;
    this.opened = true;
    this.cleanupTriggers();
    this.lastFocused = document.activeElement;
    this.root.classList.add("signup--open");
    this.root.removeAttribute("aria-hidden");
    // Let the panel settle before taking focus, so the motion is not cut off.
    setTimeout(() => this.input.focus(), 450);
  }

  close() {
    this.opened = false;
    this.root.classList.remove("signup--open");
    this.root.setAttribute("aria-hidden", "true");
    if (readState() !== "joined") snooze();
    this.lastFocused?.focus();
  }

  /** Keeps keyboard focus inside the panel while it is open. */
  trapFocus(event) {
    const focusable = this.root.querySelectorAll(
      "button, input, [href], select, textarea"
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async submit(event) {
    event.preventDefault();
    const address = this.input.value.trim();

    if (!address || !address.includes("@") || !address.includes(".")) {
      this.say("That doesn't look like an email address.", true);
      this.input.focus();
      return;
    }

    this.say("Adding you…");

    // Only the email field — services reject or ignore unexpected keys.
    const payload = new FormData();
    payload.append(SIGNUP.fieldName, address);

    try {
      const response = await fetch(SIGNUP.endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(response.statusText);

      write("joined");
      this.root.classList.add("signup--done");
      this.say("");
      setTimeout(() => this.close(), 2600);
    } catch {
      this.say("That didn't go through. Try again in a moment.", true);
    }
  }

  say(text, isError = false) {
    this.status.textContent = text;
    this.status.classList.toggle("signup__status--error", isError);
  }
}

/* --- Visitor state --------------------------------------------------------
   Stored in the browser, never sent anywhere. Wrapped because private
   browsing can make localStorage throw on access.
   -------------------------------------------------------------------------- */

function write(value) {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ value, at: Date.now() })
    );
  } catch {
    /* no storage available; the popup simply shows again next visit */
  }
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    return null;
  }
}

function readState() {
  return read()?.value ?? null;
}

function snooze() {
  write("closed");
}

function isSnoozed() {
  const saved = read();
  if (saved?.value !== "closed") return false;
  const days = (Date.now() - saved.at) / 86400000;
  return days < SIGNUP.snoozeDays;
}
