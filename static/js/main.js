document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle"),
        navLinks = document.getElementById("navLinks"),
        backToTop = document.getElementById("backToTop"),
        year = document.getElementById("year"),
        contactForm = document.getElementById("contactForm");

  if (year) year.textContent = new Date().getFullYear();

  menuToggle?.addEventListener("click", () => {
    navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
  });


  document.querySelectorAll('a[href^="#"]').forEach(a =>
    a.addEventListener("click", e => {
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) e.preventDefault(), t.scrollIntoView({ behavior: "smooth", block: "start" }), window.innerWidth <= 900 && (navLinks.style.display = "none");
    })
  );

  window.addEventListener("scroll", () => backToTop && (backToTop.style.display = window.scrollY > 400 ? "block" : "none"));
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  contactForm?.addEventListener("submit", e => {
    e.preventDefault();
    const n = document.getElementById("name").value.trim(),
          eL = document.getElementById("email").value.trim(),
          m = document.getElementById("message").value.trim();
    if (!n || !eL || !m) return alert("Please fill all fields.");
    alert("Message sent (demo). Thank you!");
    contactForm.reset();
  });

  // the list of services
  const btn = document.getElementById("dropdownBtn");
const menu = document.getElementById("dropdownMenu");

// عند الضغط على الزر
btn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// إخفاء القائمة عند الضغط خارجها
window.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = "none";
    }
});

  document.querySelectorAll(".card, .testimonial, .split-media img").forEach((el, i) => {
    el.style.opacity = "0"; el.style.transform = "translateY(8px)";
    setTimeout(() => el.style.cssText = "transition: all 600ms ease; opacity:1; transform:translateY(0)", 120*i);
  });
});


// ----------- Slides of Hero Section ---------------

const slidesData = [
  {
    bg: '/static/assets/bg1.png',
    title: 'Your Digital Library — Smarter, Faster, Yours',
    text: 'Discover tools, summaries and AI-powered recommendations tailored to you.'
  },
  {
    bg: '/static/assets/bg2.png',
    title: 'TTS – Text-to-Speech',
    text: 'This model allows users to convert any written text into clear, natural-sounding speech. Future possibilities include integration with smart voice assistants.'
  },
  {
    bg: '/static/assets/bg4.png',
    title: 'STT – Speech-to-Text',
    text: 'The model converts spoken words into highly accurate written text, facilitating transcription of lectures or meetings.'
  },
  {
    bg: '/static/assets/bg3.png',
    title: 'GEC – Grammar Error Correction',
    text: 'The model analyzes your text for grammar, punctuation, and style errors.'
  }
];

const slidesContainer = document.querySelector('.hero-slides');
const dotsContainer = document.querySelector('.hero-dots');

let currentIndex = 0;

// creat slides
slidesData.forEach((slide, i) => {
  const slideEl = document.createElement('div');
  slideEl.className = 'hero-slide';
  slideEl.style.backgroundImage = `url(${slide.bg})`;

  // هنا عملنا div مخصوص للعنوان والنص
  const contentDiv = document.createElement('div');
  contentDiv.className = 'slide-content';
  contentDiv.innerHTML = `<h2>${slide.title}</h2><p>${slide.text}</p>`;

  slideEl.appendChild(contentDiv);
  slidesContainer.appendChild(slideEl);

  // dots
  const dot = document.createElement('span');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('span');

function updateSlide() {
  slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slidesData.length;
  updateSlide();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + slidesData.length) % slidesData.length;
  updateSlide();
}

function goToSlide(index) {
  currentIndex = index;
  updateSlide();
}

// arrows
document.getElementById('next').addEventListener('click', nextSlide);
document.getElementById('prev').addEventListener('click', prevSlide);
