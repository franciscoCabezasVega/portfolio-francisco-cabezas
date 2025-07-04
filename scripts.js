// Mobile menu toggle
document.querySelector(".mobile-menu").addEventListener("click", function () {
  document.querySelector("nav ul").classList.toggle("show");
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });

    // Close mobile menu after click
    document.querySelector("nav ul").classList.remove("show");
  });
});

// Inicializar EmailJS con el nuevo método
(function () {
  emailjs.init({
    publicKey: "uUuu06tIRxoNojbvc", // Reemplaza con tu Public Key real
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  // Configuración de los campos
  const config = {
    name: { min: 10, max: 100, regex: /^[a-z0-9.\-_@ ]+$/i },
    email: { min: 10, max: 100, regex: /^[a-z0-9.\-_@]+$/i },
    subject: { min: 10, max: 100, regex: /^[a-z0-9.\-_@ ]+$/i },
    message: { min: 10, max: 250, regex: /^[a-z0-9.\-_@ \n\r]+$/i },
  };

  // Elementos
  const form = document.getElementById("contact-form");
  const fields = ["name", "email", "subject", "message"];
  const sendBtn = document.getElementById("send-btn");

  // Crear contadores y errores
  fields.forEach((field) => {
    const input = document.getElementById(field);

    // Contenedor para error y contador
    let infoRow = document.createElement("div");
    infoRow.className = "info-row";
    infoRow.style.display = "flex";
    infoRow.style.justifyContent = "space-between";
    infoRow.style.alignItems = "center";
    infoRow.style.marginTop = "2px";

    // Error
    let error = document.createElement("label");
    error.className = "error-label";
    error.style.color = "#e74c3c";
    error.style.fontSize = "0.95em";
    error.style.display = "none";
    error.setAttribute("for", field); // Asocia el label al input correspondiente

    // Contador
    let counter = document.createElement("div");
    counter.className = "char-counter";
    counter.style.fontSize = "0.9em";
    counter.style.color = "#888";
    counter.style.textAlign = "right";

    // Añadir al DOM
    infoRow.appendChild(error);
    infoRow.appendChild(counter);
    input.parentNode.appendChild(infoRow);

    // Actualizar contador y limitar caracteres
    input.addEventListener("input", function (e) {
      // Limitar longitud
      if (input.value.length > config[field].max) {
        input.value = input.value.slice(0, config[field].max);
      }
      // Solo caracteres permitidos (omite {}´´[])
      input.value = input.value.replace(/[{}\[\]´`]/g, "");
      // Actualizar contador
      counter.textContent = `${input.value.length} / ${config[field].max}`;
      // Cambia color del contador según la cantidad de caracteres
      const trimmedLength = input.value.trim().length;
      if (trimmedLength > 0 && trimmedLength < config[field].min) {
        counter.style.color = "#e74c3c"; // rojo
      } else if (trimmedLength >= config[field].min) {
        counter.style.color = "#27ae60"; // verde
      } else {
        counter.style.color = "#888"; // gris
      }
      // Validar estado para bordes
      let hasError = false;
      if (field === "email") {
        if (
          trimmedLength > 0 &&
          !/^[a-z0-9.\-_]+@[a-z0-9.\-_]+\.[a-z]{2,}$/i.test(input.value.trim())
        ) {
          hasError = true;
        } else if (trimmedLength > 0 && trimmedLength < config[field].min) {
          hasError = true;
        }
      } else {
        if (trimmedLength > 0 && trimmedLength < config[field].min) {
          hasError = true;
        }
      }
      if (hasError) {
        input.classList.add("input-error");
        input.classList.remove("input-success");
      } else if (trimmedLength >= config[field].min) {
        input.classList.remove("input-error");
        input.classList.add("input-success");
      } else {
        input.classList.remove("input-error");
        input.classList.remove("input-success");
      }
      // Ocultar error al escribir
      error.style.display = "none";
    });

    // Inicializar contador
    counter.textContent = `0 / ${config[field].max}`;

    // Evento para mostrar error de mínimo al salir del campo
    input.addEventListener("blur", function () {
      const value = input.value.trim();
      let hasError = false;
      if (field === "email") {
        if (
          value.length > 0 &&
          !/^[a-z0-9.\-_]+@[a-z0-9.\-_]+\.[a-z]{2,}$/i.test(value)
        ) {
          hasError = true;
        } else if (value.length > 0 && value.length < config[field].min) {
          hasError = true;
        }
      } else {
        if (value.length > 0 && value.length < config[field].min) {
          hasError = true;
        }
      }
      if (hasError) {
        input.classList.add("input-error");
        input.classList.remove("input-success");
      } else if (value.length >= config[field].min) {
        input.classList.remove("input-error");
        input.classList.add("input-success");
      } else {
        input.classList.remove("input-error");
        input.classList.remove("input-success");
      }
      // Mostrar error específico
      if (hasError) {
        if (field === "email") {
          if (!/^[a-z0-9.\-_]+@[a-z0-9.\-_]+\.[a-z]{2,}$/i.test(value)) {
            error.textContent = "Invalid email format.";
          } else {
            error.textContent = `Minimum ${config[field].min} characters required.`;
          }
        } else {
          error.textContent = `Minimum ${config[field].min} characters required.`;
        }
        error.style.display = "block";
        counter.style.color = "#e74c3c";
      } else {
        error.style.display = "none";
        // Mantener verde si cumple el mínimo, gris si está vacío
        if (value.length >= config[field].min) {
          counter.style.color = "#27ae60";
        } else {
          counter.style.color = "#888";
        }
      }
    });
  });

  // Función para validar todos los campos en tiempo real
  function validateFormRealtime() {
    let allValid = true;
    fields.forEach((field) => {
      const input = document.getElementById(field);
      const value = input.value.trim();
      if (
        !value ||
        value.length < config[field].min ||
        value.length > config[field].max ||
        !config[field].regex.test(value) ||
        (field === "email" &&
          !/^[a-z0-9.\-_]+@[a-z0-9.\-_]+\.[a-z]{2,}$/i.test(value))
      ) {
        allValid = false;
      }
    });
    sendBtn.disabled = !allValid;
  }

  // Llama a la validación en cada input
  fields.forEach((field) => {
    const input = document.getElementById(field);
    input.addEventListener("input", validateFormRealtime);
  });

  // Llama una vez al cargar para inicializar el estado del botón
  validateFormRealtime();

  // Validación al enviar
  form.addEventListener("submit", function (e) {
    let valid = true;
    fields.forEach((field) => {
      const input = document.getElementById(field);
      const value = input.value.trim();
      const parent = input.parentNode;
      const error = parent.querySelector(".error-label");
      // Validations
      if (!value) {
        error.textContent = "This field is required.";
        error.style.display = "block";
        valid = false;
      } else if (
        field === "email" &&
        !/^[a-z0-9.\-_]+@[a-z0-9.\-_]+\.[a-z]{2,}$/i.test(value)
      ) {
        error.textContent = "Invalid email format.";
        error.style.display = "block";
        valid = false;
      } else if (value.length < config[field].min) {
        error.textContent = `Minimum ${config[field].min} characters required.`;
        error.style.display = "block";
        valid = false;
      } else if (value.length > config[field].max) {
        error.textContent = `Maximum ${config[field].max} characters allowed.`;
        error.style.display = "block";
        valid = false;
      } else if (!config[field].regex.test(value)) {
        error.textContent = "Invalid characters detected.";
        error.style.display = "block";
        valid = false;
      } else {
        error.style.display = "none";
      }
    });

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      e.preventDefault();
      alert("Please complete the reCAPTCHA.");
      return false;
    }

    if (!valid) {
      e.preventDefault();
      sendBtn.disabled = true;
      return false;
    }

    // Si es válido, envía el formulario con EmailJS
    e.preventDefault();
    emailjs.sendForm("service_0pxmsh7", "template_y5l3mx4", this).then(
      function () {
        alert("Message sent successfully!");
      },
      function (error) {
        alert("An error occurred. Please try again.");
      }
    );

    // Limpiar campos y feedback visual
    this.reset();
    fields.forEach((field) => {
      const input = document.getElementById(field);
      const parent = input.parentNode;
      const error = parent.querySelector(".error-label");
      const counter = parent.querySelector(".char-counter");
      if (error) {
        error.style.display = "none";
        error.textContent = "";
      }
      if (counter) {
        counter.textContent = `0 / ${config[field].max}`;
        counter.style.color = "#888";
      }
      input.classList.remove("input-error");
      input.classList.remove("input-success");
    });
    sendBtn.disabled = true;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  function moveLangSwitcher() {
    const navUl = document.querySelector("nav ul");
    const langSwitcher = document.getElementById("lang-switcher");
    if (window.innerWidth <= 600) {
      if (navUl && langSwitcher && !navUl.contains(langSwitcher)) {
        const li = document.createElement("li");
        li.id = "lang-switcher-li";
        li.appendChild(langSwitcher);
        navUl.appendChild(li);
      }
    } else {
      // Devuelve el selector a su lugar original si es necesario
      const headerContainer = document.querySelector(".header-container");
      const langLi = document.getElementById("lang-switcher-li");
      if (headerContainer && langLi && langLi.contains(langSwitcher)) {
        headerContainer.appendChild(langSwitcher);
        langLi.remove();
      }
    }
  }
  moveLangSwitcher();
  window.addEventListener("resize", moveLangSwitcher);
});
// Traducción automática
const langSwitcher = document.getElementById('lang-switcher');
const defaultLang = 'en';

function setLang(lang) {
  if (lang === 'en') {
    // Restaurar textos por defecto (inglés)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Puedes guardar el texto original en un atributo al cargar la página
      if (el.hasAttribute('data-i18n-default')) {
        el.textContent = el.getAttribute('data-i18n-default');
      }
    });
  } else {
    fetch(`i18n/${lang}.json`)
      .then(res => res.json())
      .then(dict => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (dict[key]) el.textContent = dict[key];
        });
      });
  }
  localStorage.setItem('lang', lang);
}

// Guardar los textos por defecto al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!el.hasAttribute('data-i18n-default')) {
      el.setAttribute('data-i18n-default', el.textContent);
    }
  });
});

if (langSwitcher) {
  langSwitcher.value = localStorage.getItem('lang') || defaultLang;
  langSwitcher.addEventListener('change', e => setLang(e.target.value));
  setLang(langSwitcher.value);
} else {
  setLang(defaultLang);
}
