
document.getElementById("alertButton").addEventListener("click", () => {
  alert("Hello! You clicked the alert button!");
});

document.getElementById("colorButton").addEventListener("click", () => {
  const colors = ["#f4f4f9", "#ffe6e6", "#e6ffe6", "#e6f0ff", "#fff7e6"];
  document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
});

document.getElementById("toggleButton").addEventListener("click", () => {
  const msg = document.getElementById("secretMessage");
  msg.style.display = msg.style.display === "none" ? "block" : "none";
});
