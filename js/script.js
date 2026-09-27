// ---------- Dark mode toggle ----------
const themeToggle = document.getElementById('themeToggle');
const rootEl = document.documentElement;
const sunIcon = themeToggle ? themeToggle.querySelector('.icon-sun') : null;
const moonIcon = themeToggle ? themeToggle.querySelector('.icon-moon') : null;

// both sun and moon rise from the right and set to the left, like a classic
// 2D sunrise/sunset illustration
const RIGHT = { left: '90%', top: '85%' };
const LEFT = { left: '10%', top: '85%' };

function animateSunAndMoon(nextTheme) {
  if (!sunIcon || !moonIcon) return;

  const leaving = nextTheme === 'dark' ? sunIcon : moonIcon;
  const arriving = nextTheme === 'dark' ? moonIcon : sunIcon;

  // send the outgoing icon setting to the left
  leaving.style.left = LEFT.left;
  leaving.style.top = LEFT.top;

  // snap the incoming icon to its rising point on the right with no transition,
  // then let it animate in on the next frame so it visibly arcs up from that side
  arriving.style.transition = 'none';
  arriving.style.left = RIGHT.left;
  arriving.style.top = RIGHT.top;
  void arriving.offsetWidth;
  arriving.style.transition = '';

  requestAnimationFrame(() => {
    arriving.style.left = '50%';
    arriving.style.top = '50%';
  });

  // hand control back to the stylesheet once the arc has settled
  window.setTimeout(() => {
    [leaving, arriving].forEach((el) => {
      el.style.left = '';
      el.style.top = '';
      el.style.transition = '';
    });
  }, 700);
}

function applyTheme(theme) {
  rootEl.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', theme === 'dark');
  }
}

applyTheme(rootEl.getAttribute('data-theme') || 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', next);
    } catch (err) {
      // localStorage unavailable (private mode, etc.) — theme just won't persist
    }
    animateSunAndMoon(next);
    applyTheme(next);
  });
}

// ---------- Nav dropdown ----------
function setupNavDropdown(dropdown, toggle) {
  if (!dropdown || !toggle) return;

  const closeDropdown = () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openDropdown = () => {
    dropdown.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });

  // hover opens it, and moving the mouse away fades it back out
  dropdown.addEventListener('mouseenter', openDropdown);
  dropdown.addEventListener('mouseleave', closeDropdown);

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });
}

setupNavDropdown(
  document.getElementById('headercontactDropdown'),
  document.getElementById('headercontactToggle')
);

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
setupNavDropdown(
  document.getElementById('projectsDropdown'),
  document.getElementById('projectsToggle')
);
// ---------- Sponsor marquee ----------
const sponsorSlider = document.querySelector('.sponsor-slider');
const sponsorTrack = document.getElementById('sponsorTrack');

if (sponsorSlider && sponsorTrack) {
  const baseSponsors = Array.from(sponsorTrack.children);

  const buildSponsorTrack = () => {
    sponsorTrack.style.animation = 'none';
    sponsorTrack.innerHTML = '';

    // repeat the base set until it's at least as wide as the visible box,
    // so the track never runs out of images while sliding across it.
    // Capped so a stuck/broken image (0 width) can't spin this forever.
    let guard = 0;
    while (sponsorTrack.scrollWidth < sponsorSlider.clientWidth && guard < 50) {
      baseSponsors.forEach((el) => sponsorTrack.appendChild(el.cloneNode(true)));
      guard++;
    }

    // duplicate that whole set once more so the loop from 0% to -50% is seamless
    Array.from(sponsorTrack.children).forEach((el) => sponsorTrack.appendChild(el.cloneNode(true)));

    // force reflow before re-enabling the animation
    void sponsorTrack.offsetWidth;
    sponsorTrack.style.animation = '';
  };

  let resizeTimeout;
  const scheduleRebuild = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(buildSponsorTrack, 200);
  };

  // Sizes depend on the sponsor images' natural dimensions, so wait until
  // they've actually loaded (or failed) before measuring - otherwise every
  // image reads as 0 width and the track never gets built.
  const images = baseSponsors.flatMap((el) => Array.from(el.querySelectorAll('img')));
  let pending = images.filter((img) => !img.complete).length;

  if (pending === 0) {
    buildSponsorTrack();
  } else {
    images.forEach((img) => {
      if (img.complete) return;
      const onSettle = () => {
        pending--;
        if (pending === 0) buildSponsorTrack();
      };
      img.addEventListener('load', onSettle, { once: true });
      img.addEventListener('error', onSettle, { once: true });
    });
  }

  window.addEventListener('resize', scheduleRebuild);
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
