
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

const fadeElements = document.querySelectorAll(".fade");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.2 });

fadeElements.forEach(el => observer.observe(el));

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth - e.pageX * 2) / 100;
  const y = (window.innerHeight - e.pageY * 2) / 100;
  document.querySelectorAll(".shape").forEach(shape => {
    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
});
