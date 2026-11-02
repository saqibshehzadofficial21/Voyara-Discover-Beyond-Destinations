(() => {
  "use strict";
  const RECIPIENT = "hello@voyara.example"; // Replace with a real, monitored email address before publishing.
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const fields = {
      name: { input: form.elements.name, error: document.querySelector("#name-error"), label: "Full name" },
      email: { input: form.elements.email, error: document.querySelector("#email-error"), label: "Email address" },
      subject: { input: form.elements.subject, error: document.querySelector("#subject-error"), label: "Subject" },
      message: { input: form.elements.message, error: document.querySelector("#message-error"), label: "Message" }
    };
    const status = document.querySelector("#form-status");
    function validate() {
      let valid = true;
      Object.entries(fields).forEach(([key, field]) => {
        const value = field.input.value.trim();
        let message = "";
        if (!value) message = `${field.label} is required.`;
        else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) message = "Enter a valid email address.";
        field.error.textContent = message;
        field.input.setAttribute("aria-invalid", String(Boolean(message)));
        if (message) valid = false;
      });
      return valid;
    }
    Object.values(fields).forEach(field => field.input.addEventListener("input", () => {
      field.error.textContent = "";
      field.input.removeAttribute("aria-invalid");
    }));
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!validate()) {
        status.textContent = "Please correct the highlighted fields before continuing.";
        status.style.color = "#a43e34";
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const values = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.input.value.trim()]));
      const body = `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`;
      const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Your email app should open with the message prepared. Review it and press Send there. This website does not store or send the message.";
      status.style.color = "#35634e";
      window.location.href = mailto;
    });
  });
})();
