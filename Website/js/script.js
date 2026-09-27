// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

// ---------- Nav dropdown ----------
const projectsDropdown = document.getElementById('projectsDropdown');
const projectsToggle = document.getElementById('projectsToggle');

if (projectsDropdown && projectsToggle) {
  const closeDropdown = () => {
    projectsDropdown.classList.remove('open');
    projectsToggle.setAttribute('aria-expanded', 'false');
  };

  projectsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = projectsDropdown.classList.toggle('open');
    projectsToggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!projectsDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });
}

// ---------- Sponsor marquee ----------
const sponsorSlider = document.querySelector('.sponsor-slider');
const sponsorTrack = document.getElementById('sponsorTrack');

if (sponsorSlider && sponsorTrack) {
  const baseSponsors = Array.from(sponsorTrack.children);

  const buildSponsorTrack = () => {
    sponsorTrack.style.animation = 'none';
    sponsorTrack.innerHTML = '';

    // repeat the base set until it's at least as wide as the visible box,
    // so the track never runs out of images while sliding across it
    while (sponsorTrack.scrollWidth < sponsorSlider.clientWidth) {
      baseSponsors.forEach((img) => sponsorTrack.appendChild(img.cloneNode(true)));
    }

    // duplicate that whole set once more so the loop from 0% to -50% is seamless
    Array.from(sponsorTrack.children).forEach((img) => sponsorTrack.appendChild(img.cloneNode(true)));

    // force reflow before re-enabling the animation
    void sponsorTrack.offsetWidth;
    sponsorTrack.style.animation = '';
  };

  buildSponsorTrack();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(buildSponsorTrack, 200);
  });
}

// ---------- FAQ accordion ----------
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach((item) => {
  const trigger = item.querySelector('.accordion-trigger');
  const panel = item.querySelector('.accordion-panel');

  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // close all other items
    accordionItems.forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.accordion-panel').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ---------- Animated stat counters ----------
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length) {
  const animateStat = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach((el) => observer.observe(el));
}

// ---------- Contact form validation ----------
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const firstnameInput = document.getElementById('firstname');
  const lastnameInput = document.getElementById('lastname');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const successMessage = document.getElementById('formSuccess');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.classList.toggle('invalid', Boolean(message));
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    successMessage.hidden = true;

    let valid = true;

    if (!firstnameInput.value.trim()) {
      setError(firstnameInput, 'firstnameError', 'Please enter your first name.');
      valid = false;
    } else {
      setError(firstnameInput, 'firstnameError', '');
    }

    if (!lastnameInput.value.trim()) {
      setError(lastnameInput, 'lastnameError', 'Please enter your last name.');
      valid = false;
    } else {
      setError(lastnameInput, 'lastnameError', '');
    }

    if (!emailPattern.test(emailInput.value.trim())) {
      setError(emailInput, 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      setError(emailInput, 'emailError', '');
    }

    if (!messageInput.value.trim()) {
      setError(messageInput, 'messageError', 'Please tell us a bit about your project.');
      valid = false;
    } else {
      setError(messageInput, 'messageError', '');
    }

    if (valid) {
      successMessage.hidden = false;
      contactForm.reset();
    }
  });
}
