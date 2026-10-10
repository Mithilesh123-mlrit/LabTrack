// LabTrack - Homepage JavaScript
// Runs after the page HTML has loaded (script tag is at the bottom of index.html)

// ---------- 1. Mobile menu toggle ----------
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", function () {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Close the mobile menu after clicking any link inside it
navMenu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- 2. Navbar shadow + active link while scrolling ----------
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");

function handleScroll() {
  // Add a shadow once the page is scrolled
  navbar.classList.toggle("scrolled", window.scrollY > 10);

  // Highlight the link of the section currently in view
  let currentId = "home";
  sections.forEach(function (section) {
    if (window.scrollY >= section.offsetTop - 120) {
      currentId = section.id;
    }
  });

  navLinks.forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
  });
}

window.addEventListener("scroll", handleScroll);
handleScroll(); // run once on page load

// ---------- 3. Animated number counters ----------
function animateCounter(element) {
  const target = Number(element.dataset.target);
  const duration = 1200; // milliseconds
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    element.textContent = Math.floor(progress * target);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// ---------- 4. Scroll reveal + start counters when visible ----------
const revealItems = document.querySelectorAll("[data-reveal]");
revealItems.forEach(function (item) {
  item.classList.add("reveal"); // hidden until it scrolls into view
});

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");

      // If this card contains a counter, start it
      const counter = entry.target.querySelector(".counter");
      if (counter) {
        animateCounter(counter);
      }

      observer.unobserve(entry.target); // animate only once
    }
  });
}, { threshold: 0.2 });

revealItems.forEach(function (item) {
  observer.observe(item);
});

// ---------- 5. Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();