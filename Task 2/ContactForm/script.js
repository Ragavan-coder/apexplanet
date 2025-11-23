const form = document.getElementById("contactForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fields = [
    { input: document.getElementById("name"), error: nameError },
    { input: document.getElementById("email"), error: emailError },
    { input: document.getElementById("message"), error: messageError },
  ];

  let isValid = true;

  fields.forEach(({ input, error }) => {
    clearError(input, error);

    if (input.value.trim() === "") {
      setError(input, error);
      isValid = false;
    }
  });

  const email = document.getElementById("email");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.value.trim())) {
    setError(email, emailError);
    isValid = false;
  }

  if (isValid) {
    alert("Message sent successfully.");
    form.reset();
  }
});

function setError(input, msg) {
  input.classList.add("error-field");
  msg.classList.add("error-visible");
}

function clearError(input, msg) {
  input.classList.remove("error-field");
  msg.classList.remove("error-visible");
}
