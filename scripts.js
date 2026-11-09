(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const root = document.documentElement;

  const START_YEAR = 2020;
  const EMAILJS = { publicKey: "uUuu06tIRxoNojbvc", service: "service_0pxmsh7", template: "template_y5l3mx4" };

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* almacenamiento no disponible: la página funciona igual */
      }
    },
  };

  /* ------------------------------------------------------------------ i18n */
  // Textos por defecto (inglés) para mensajes creados desde JavaScript.
  const EN = {
    error_required: "This field is required.",
    error_invalid_email: "Enter a valid email address.",
    error_min_chars: "At least {min} characters required.",
    error_max_chars: "Maximum {max} characters allowed.",
    error_invalid_chars: "Invalid characters detected.",
    form_sending: "Sending…",
    form_success: "Message sent. Thank you!",
    form_error: "Something went wrong. Please try again.",
    captcha_required: "Please complete the reCAPTCHA.",
  };

  let dict = {};
  const t = (key) => dict[key] ?? EN[key] ?? key;
  const defaultTitle = document.title;
  const langSwitcher = $("#lang-switcher");

  function storeDefaults() {
    $$("[data-i18n]").forEach((el) => {
      if (!("i18nDefault" in el.dataset)) el.dataset.i18nDefault = el.innerHTML;
    });
    $$("[data-i18n-aria]").forEach((el) => {
      if (!("i18nAriaDefault" in el.dataset)) el.dataset.i18nAriaDefault = el.getAttribute("aria-label") || "";
    });
  }

  function updateDynamicText() {
    const year = new Date().getFullYear();
    $$(".years-experience").forEach((el) => (el.textContent = year - START_YEAR));
    $$(".current-year").forEach((el) => (el.textContent = year));

    // Años de uso calculados desde la fecha de inicio (data-since="AAAA-MM-DD").
    const today = new Date();
    $$(".skill-years[data-since]").forEach((el) => {
      const [y, m, d] = el.dataset.since.split("-").map(Number);
      let years = today.getFullYear() - y;
      if (today < new Date(today.getFullYear(), m - 1, d)) years -= 1;
      years = Math.max(years, 0);
      const unitKey = years > 1 ? "years" : "year";
      const unit = $("[data-unit]", el);
      $("[data-num]", el).textContent = years < 1 ? "<1" : years;
      unit.dataset.i18n = unitKey;
      unit.dataset.i18nDefault = unitKey;
      unit.innerHTML = dict[unitKey] ?? unitKey;
    });
  }

  // Las traducciones llegan por <script> (i18n/es.js → window.I18N), no por fetch,
  // así funcionan igual al abrir index.html con doble clic (file://).
  function setLang(lang) {
    const available = lang === "en" || Boolean(window.I18N && window.I18N[lang]);
    if (available) {
      storage.set("lang", lang);
    } else {
      console.warn(`El idioma "${lang}" no está disponible, se usa inglés.`);
      lang = "en";
    }
    dict = lang === "en" ? {} : window.I18N[lang];
    $$("[data-i18n]").forEach((el) => {
      el.innerHTML = dict[el.dataset.i18n] ?? el.dataset.i18nDefault;
    });
    $$("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", dict[el.dataset.i18nAria] ?? el.dataset.i18nAriaDefault);
    });
    document.title = dict.page_title ?? defaultTitle;
    root.lang = lang;
    if (langSwitcher) langSwitcher.value = lang;
    updateDynamicText();
    root.classList.remove("i18n-pending");
    contactForm.refreshMessages();
  }

  /* ----------------------------------------------------------------- tema */
  // Tres opciones: Sistema (por defecto, sigue al dispositivo), Claro y Oscuro.
  function initTheme() {
    const group = $("#theme-group");
    if (!group) return;
    const buttons = $$("[data-theme-choice]", group);
    const stored = storage.get("theme");
    let choice = stored === "light" || stored === "dark" ? stored : "system";

    const apply = (value) => {
      choice = value;
      if (value === "system") {
        root.removeAttribute("data-theme"); // sin atributo, manda prefers-color-scheme
      } else {
        root.dataset.theme = value;
      }
      storage.set("theme", value);
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === value)));
    };

    buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset.themeChoice)));
    apply(choice);
  }

  /* ----------------------------------------------------------------- menú */
  function initNavigation() {
    const nav = $("#primary-nav");
    const toggle = $(".mobile-menu");
    if (!nav || !toggle) return;

    const setOpen = (open) => {
      nav.classList.toggle("show", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("show")));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (nav.classList.contains("show") && !event.target.closest(".site-header")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("show")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Marca en el menú la sección visible.
    const links = $$('a[href^="#"]', nav);
    const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.removeAttribute("aria-current"));
          byId.get(entry.target.id)?.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ------------------------------------------------------------- diálogos */
  function initDialogs() {
    $$("[data-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = document.getElementById(button.dataset.modal);
        if (dialog && typeof dialog.showModal === "function") dialog.showModal();
      });
    });
    // Un clic sobre el fondo (el propio <dialog>) lo cierra.
    $$("dialog.modal").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
  }

  /* ------------------------------------------------------------ formulario */
  const contactForm = (() => {
    const form = $("#contact-form");
    if (!form) return { refreshMessages() {} };

    const LIMITS = {
      name: { min: 2, max: 100 },
      email: { min: 6, max: 100 },
      subject: { min: 3, max: 100 },
      message: { min: 10, max: 500 },
    };
    // Letras de cualquier idioma (tildes, ñ), números, espacios y puntuación común.
    const TEXT_RE = /^[\p{L}\p{N}\s.,;:!?¡¿'"()\-_@#%&+/]+$/u;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const STRIP_RE = /[{}[\]<>´`\\]/g;

    const sendButton = $("#send-btn");
    const clearButton = $("#clear-btn");
    const statusEl = $("#form-status");
    const fields = Object.fromEntries(
      Object.keys(LIMITS).map((name) => [
        name,
        { input: $(`#${name}`), error: $(`#${name}-error`), count: $(`#${name}-count`), touched: false },
      ])
    );

    function check(name) {
      const { min, max } = LIMITS[name];
      const value = fields[name].input.value.trim();
      if (!value) return "error_required";
      if (name === "email" && !EMAIL_RE.test(value)) return "error_invalid_email";
      if (value.length < min) return "error_min_chars";
      if (value.length > max) return "error_max_chars";
      if (name !== "email" && !TEXT_RE.test(value)) return "error_invalid_chars";
      return null;
    }

    function render(name, showError) {
      const field = fields[name];
      const { min, max } = LIMITS[name];
      const problem = check(name);
      const visible = showError && problem;
      field.count.textContent = `${field.input.value.length} / ${max}`;
      field.error.dataset.key = visible ? problem : "";
      field.error.textContent = visible ? t(problem).replace("{min}", min).replace("{max}", max) : "";
      field.input.classList.toggle("input-error", Boolean(visible));
      field.input.classList.toggle("input-success", !problem && field.input.value.trim().length > 0);
      field.input.setAttribute("aria-invalid", visible ? "true" : "false");
    }

    let statusKey = null;
    function setStatus(key, state) {
      statusKey = key;
      statusEl.textContent = key ? t(key) : "";
      if (key && state) statusEl.dataset.state = state;
      else delete statusEl.dataset.state;
    }

    function resetFields() {
      Object.keys(fields).forEach((name) => {
        fields[name].touched = false;
        render(name, false);
        fields[name].input.classList.remove("input-success");
      });
    }

    function resetCaptcha() {
      try {
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      } catch {
        /* reCAPTCHA no disponible */
      }
    }

    function captchaCompleted() {
      try {
        return typeof grecaptcha !== "undefined" && grecaptcha.getResponse().length > 0;
      } catch {
        return false;
      }
    }

    Object.entries(fields).forEach(([name, field]) => {
      field.input.maxLength = LIMITS[name].max;
      field.input.addEventListener("input", () => {
        const cleaned = field.input.value.replace(STRIP_RE, "");
        if (cleaned !== field.input.value) field.input.value = cleaned;
        render(name, field.touched);
      });
      field.input.addEventListener("blur", () => {
        field.touched = true;
        render(name, true);
      });
      render(name, false);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let firstInvalid = null;
      Object.keys(fields).forEach((name) => {
        fields[name].touched = true;
        render(name, true);
        if (!firstInvalid && check(name)) firstInvalid = fields[name].input;
      });
      if (firstInvalid) {
        setStatus(null);
        firstInvalid.focus();
        return;
      }
      // Campo trampa: las personas no lo ven; si llega relleno es un bot, se simula éxito y no se envía nada.
      const trap = $("#website");
      if (trap && trap.value.trim() !== "") {
        form.reset();
        resetFields();
        setStatus("form_success", "success");
        return;
      }
      if (!captchaCompleted()) {
        setStatus("captcha_required", "error");
        return;
      }
      if (typeof emailjs === "undefined") {
        setStatus("form_error", "error");
        return;
      }
      sendButton.disabled = true;
      setStatus("form_sending", "info");
      try {
        await emailjs.sendForm(EMAILJS.service, EMAILJS.template, form);
        form.reset();
        resetFields();
        setStatus("form_success", "success");
      } catch (error) {
        console.error(error);
        setStatus("form_error", "error");
      } finally {
        sendButton.disabled = false;
        resetCaptcha();
      }
    });

    clearButton.addEventListener("click", () => {
      form.reset();
      resetFields();
      setStatus(null);
      resetCaptcha();
    });

    return {
      // Vuelve a escribir los mensajes visibles cuando cambia el idioma.
      refreshMessages() {
        Object.keys(fields).forEach((name) => render(name, fields[name].touched));
        setStatus(statusKey, statusEl.dataset.state);
      },
    };
  })();

  /* ---------------------------------------------------------------- inicio */
  // blockHeadless y limitRate frenan el uso automatizado; la protección real debe estar también en el panel de EmailJS.
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS.publicKey, blockHeadless: true, limitRate: { id: "contact-form", throttle: 15000 } });
  }
  initTheme();
  initNavigation();
  initDialogs();
  storeDefaults();
  updateDynamicText();

  const saved = storage.get("lang");
  const preferred = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const initial = saved === "en" || saved === "es" ? saved : preferred;
  if (langSwitcher) {
    langSwitcher.value = initial;
    langSwitcher.addEventListener("change", (event) => setLang(event.target.value));
  }
  setLang(initial);
})();
