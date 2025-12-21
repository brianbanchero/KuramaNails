const elementos = document.querySelectorAll(".fade-in, .fade-up");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("aparecer");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

elementos.forEach(el => observer.observe(el));
