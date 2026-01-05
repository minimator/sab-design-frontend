document.addEventListener('DOMContentLoaded', function () {
  // nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  }

  // AOS init
  if (window.AOS) AOS.init({ duration: 800, once: true });

  // Optional: init Swiper if you want hero slider (index currently static hero background)
  if (window.Swiper) {
    // if you later use .hero-swiper class, initialize here
    // new Swiper('.hero-swiper', { loop:true, autoplay:{delay:4000}, pagination:{el:'.swiper-pagination'} });
  }

  // Smooth scroll local anchors (optional)
  document.querySelectorAll('.main-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      // if same page anchor, smooth scroll; otherwise default
      // keep default behavior for page navigation
    });
  });
});
// =============================
// CONTACT FORM SUBMISSION
// =============================
const contactForm = document.querySelector("#contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value
    };

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || "Message sent successfully!");
      contactForm.reset();
    } catch (err) {
      alert("Server error. Please try again later.");
      console.error(err);
    }
  });
}