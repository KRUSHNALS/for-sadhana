/* =========================================================
   PROJECT SADHANA.EXE — Interaction layer
   All animation work is progressively enhanced: the page still
   contains readable content if a third-party CDN is unavailable.
   ========================================================= */

"use strict";

const $ = (selector) => document.querySelector(selector);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Star canvas: lightweight, responsive background ---------- */
function createStarfield() {
  const canvas = $("#starfield");
  const context = canvas.getContext("2d");
  const stars = [];
  let width;
  let height;
  let animationFrame;

  function resize() {
    const density = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * density;
    canvas.height = height * density;
    context.setTransform(density, 0, 0, density, 0, 0);
    stars.length = 0;

    // A capped quantity protects mobile GPUs while still looking full.
    const count = Math.min(130, Math.floor((width * height) / 12500));
    for (let index = 0; index < count; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + 0.2,
        alpha: Math.random() * 0.7 + 0.15,
        speed: Math.random() * 0.11 + 0.025,
      });
    }
  }

  function render() {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      context.beginPath();
      context.fillStyle = `rgba(255, 226, 244, ${star.alpha})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
      star.y -= star.speed;
      if (star.y < -3) {
        star.y = height + 3;
        star.x = Math.random() * width;
      }
    }
    if (!prefersReducedMotion) animationFrame = requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener("resize", resize, { passive: true });
  return () => cancelAnimationFrame(animationFrame);
}

/* ---------- 2. Boot sequence ---------- */
function runBootSequence() {
  const bootScreen = $("#boot-screen");
  const progress = $("#boot-progress");
  const lines = [...document.querySelectorAll("[data-boot-line]")];
  const success = $("#boot-success");
  const experience = $("#experience");
  const bootDuration = prefersReducedMotion ? 80 : 1900;

  let startTime = null;
  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    const percentage = Math.min(100, Math.round(((timestamp - startTime) / bootDuration) * 100));
    progress.style.width = `${percentage}%`;
    lines.forEach((line, index) => {
      const lineProgress = Math.max(0, Math.min(100, Math.round((percentage - index * 17) * 1.5)));
      line.querySelector("span").textContent = `${lineProgress}%`;
    });

    if (percentage < 100) {
      requestAnimationFrame(tick);
      return;
    }
    success.style.opacity = "1";
    window.setTimeout(() => {
      experience.hidden = false;
      bootScreen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: prefersReducedMotion ? 1 : 550, fill: "forwards" });
      window.setTimeout(() => bootScreen.remove(), prefersReducedMotion ? 1 : 550);
      initialiseExperience();
    }, prefersReducedMotion ? 1 : 480);
  }
  requestAnimationFrame(tick);
}

/* ---------- 3. Intro, scroll reveals, and birthday countdown ---------- */
function initialiseExperience() {
  if (window.AOS) window.AOS.init({ duration: 750, once: true, offset: 35, easing: "ease-out-cubic", disable: prefersReducedMotion });

  if (window.Typed) {
    new window.Typed("#typed-intro", {
      strings: ["Hello Sadhana...", "I've written many programs...", "But this one... is my favourite."],
      typeSpeed: prefersReducedMotion ? 1 : 38,
      backSpeed: prefersReducedMotion ? 1 : 18,
      backDelay: prefersReducedMotion ? 1 : 950,
      smartBackspace: true,
      loop: false,
      showCursor: true,
      cursorChar: "_",
    });
  } else {
    $("#typed-intro").textContent = "Hello Sadhana... I've written many programs, but this one is my favourite.";
  }

  const enter = () => {
    $(".terminal-intro").classList.add("is-dismissed");
    document.body.classList.add("experience-entered");
    window.setTimeout(() => $(".hero").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" }), 180);
  };
  $("#enter-experience").addEventListener("click", enter);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !document.body.classList.contains("experience-entered")) enter();
  }, { once: false });

  startCountdown();
  initialiseScrollProgress();
  initialiseWishHeart();
  initialiseVaultCards();
  initialiseConstellation();
  initialiseMessageMachine();
  initialiseEasterEggs();
  initialiseLaunch();
}

function startCountdown() {
  const targets = { days: $("#days"), hours: $("#hours"), minutes: $("#minutes"), seconds: $("#seconds") };
  const number = (value) => String(value).padStart(2, "0");

  function update() {
    const now = new Date();
    // Uses local time: midnight on August 3rd, wherever Sadhana opens the site.
    let birthday = new Date(now.getFullYear(), 7, 3, 0, 0, 0);
    if (now >= birthday) birthday = new Date(now.getFullYear() + 1, 7, 3, 0, 0, 0);
    const remaining = Math.max(0, birthday - now);
    const seconds = Math.floor(remaining / 1000);
    targets.days.textContent = number(Math.floor(seconds / 86400));
    targets.hours.textContent = number(Math.floor((seconds % 86400) / 3600));
    targets.minutes.textContent = number(Math.floor((seconds % 3600) / 60));
    targets.seconds.textContent = number(seconds % 60);
  }
  update();
  window.setInterval(update, 1000);
}

/* ---------- 4. Scroll feedback and touch-first wish collector ---------- */
function initialiseScrollProgress() {
  const bar = $("#scroll-progress-bar");
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
}

function initialiseWishHeart() {
  const heart = $("#wish-heart");
  const count = $("#heart-count");
  const message = $("#heart-message");
  const wishes = [
    "A wish for your happiest year yet.",
    "A wish for every dream to find you.",
    "Wish collected. Keep this feeling forever ♥",
  ];
  let collected = 0;

  heart.addEventListener("click", () => {
    if (collected >= wishes.length) return;
    collected += 1;
    count.textContent = collected;
    message.textContent = wishes[collected - 1];
    heart.animate(
      [{ transform: "scale(1)" }, { transform: "scale(.85)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: prefersReducedMotion ? 1 : 520, easing: "cubic-bezier(.2,.9,.25,1.4)" },
    );
    createWishParticles(heart, collected === wishes.length ? 16 : 7);
    if (collected === wishes.length) {
      heart.classList.add("is-complete");
      heart.setAttribute("aria-label", "All birthday wishes collected");
    }
  });
}

function createWishParticles(source, amount) {
  const box = source.getBoundingClientRect();
  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement("span");
    particle.textContent = index % 3 === 0 ? "✦" : "♥";
    particle.setAttribute("aria-hidden", "true");
    Object.assign(particle.style, {
      position: "fixed", zIndex: "16", left: `${box.left + box.width / 2}px`, top: `${box.top + box.height / 2}px`,
      color: index % 3 === 0 ? "#ffc0de" : "#ff7ab8", fontSize: `${.55 + Math.random() * .8}rem`, pointerEvents: "none",
      transition: `transform ${.65 + Math.random() * .45}s ease-out, opacity .8s ease-out`,
    });
    document.body.append(particle);
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${(Math.random() - .5) * 170}px, ${-35 - Math.random() * 150}px) rotate(${Math.random() * 180}deg)`;
      particle.style.opacity = "0";
    });
    window.setTimeout(() => particle.remove(), 1200);
  }
}

function initialiseVaultCards() {
  document.querySelectorAll("[data-vault-card]").forEach((card) => {
    card.addEventListener("click", () => {
      const opening = !card.classList.contains("is-open");
      card.classList.toggle("is-open");
      card.setAttribute("aria-pressed", String(opening));
      if (opening && navigator.vibrate) navigator.vibrate(12);
    });
  });
}

function initialiseConstellation() {
  const canvas = $("#constellation-canvas");
  const context = canvas.getContext("2d");
  const status = $("#constellation-status");
  const clear = $("#clear-stars");
  const points = [];
  let box;

  function resize() {
    box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function draw() {
    context.clearRect(0, 0, box.width, box.height);
    if (points.length > 1) {
      context.beginPath();
      points.forEach((point, index) => {
        const x = point.x * box.width;
        const y = point.y * box.height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = "rgba(255, 192, 222, .42)";
      context.lineWidth = 1;
      context.stroke();
    }
    points.forEach((point) => {
      const x = point.x * box.width;
      const y = point.y * box.height;
      const glow = context.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, "rgba(255, 232, 245, .95)");
      glow.addColorStop(.16, "rgba(255, 122, 184, .75)");
      glow.addColorStop(1, "rgba(255, 122, 184, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, 15, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff4fb";
      context.beginPath();
      context.arc(x, y, 2.1, 0, Math.PI * 2);
      context.fill();
    });
  }

  canvas.addEventListener("pointerdown", (event) => {
    const target = event.target.getBoundingClientRect();
    points.push({ x: (event.clientX - target.left) / target.width, y: (event.clientY - target.top) / target.height });
    if (points.length > 18) points.shift();
    status.textContent = `${points.length} ${points.length === 1 ? "star" : "stars"} placed`;
    draw();
    if (navigator.vibrate) navigator.vibrate(8);
  });

  clear.addEventListener("click", () => {
    points.length = 0;
    status.textContent = "Sky cleared — make a new constellation";
    draw();
  });
  resize();
  window.addEventListener("resize", resize, { passive: true });
}

function initialiseMessageMachine() {
  const output = $("#generated-message");
  const button = $("#generate-message");
  const messages = [
    "You deserve a birthday that feels as lovely as the joy you give everyone else.",
    "Some people enter a chat. You entered my world and changed its colour.",
    "Reminder: you are allowed to take up space, chase every dream, and be adored.",
    "If today feels ordinary, remember: someone built an entire little universe for you.",
    "I hope this next year surprises you with the kind of happiness that stays.",
    "You are not a notification. You are one of my favourite parts of the day.",
  ];
  let previous = -1;
  button.addEventListener("click", () => {
    let next = Math.floor(Math.random() * messages.length);
    if (messages.length > 1) while (next === previous) next = Math.floor(Math.random() * messages.length);
    previous = next;
    output.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 170, fill: "forwards" }).onfinish = () => {
      output.textContent = messages[next];
      output.animate([{ opacity: 0, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 330, fill: "forwards", easing: "ease-out" });
    };
    if (navigator.vibrate) navigator.vibrate(8);
  });
}

/* ---------- 5. Secret keyboard commands ---------- */
function initialiseEasterEggs() {
  const consolePanel = $("#secret-console");
  const output = $("#secret-output");
  const commands = {
    "i love you": "Access Granted ♥ Forever Mode Enabled",
    "sudo love": "Permission Granted ♥",
    whoami: "Your Favorite Person ♥",
    exit: "You can leave the website... but never my heart.",
  };
  let buffer = "";
  let hideTimer;

  document.addEventListener("keydown", (event) => {
    // Never capture a key while a visitor is using a genuine form field.
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (event.key.length === 1) buffer = `${buffer}${event.key.toLowerCase()}`.slice(-30);
    for (const [command, response] of Object.entries(commands)) {
      if (buffer.endsWith(command)) {
        output.textContent = response;
        consolePanel.classList.add("is-visible");
        clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => consolePanel.classList.remove("is-visible"), 5500);
        buffer = "";
      }
    }
  });
}

/* ---------- 6. Celebration: confetti, floating hearts, Web Audio ---------- */
function initialiseLaunch() {
  const launchButton = $("#launch-birthday");
  const completion = $("#completion-screen");
  let hasLaunched = false;

  launchButton.addEventListener("click", () => {
    if (hasLaunched) return;
    hasLaunched = true;
    playBirthdayChime();
    celebrate();
    window.setTimeout(() => {
      completion.classList.add("is-visible");
      completion.setAttribute("aria-hidden", "false");
    }, prefersReducedMotion ? 1 : 900);
  });

  $("#close-completion").addEventListener("click", () => {
    completion.classList.remove("is-visible");
    completion.setAttribute("aria-hidden", "true");
  });
}

function celebrate() {
  const colors = ["#ff7ab8", "#ffc0de", "#9c7cff", "#ffffff"];
  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, colors, disableForReducedMotion: true });
    window.setTimeout(() => window.confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.72 }, colors, disableForReducedMotion: true }), 280);
    window.setTimeout(() => window.confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.72 }, colors, disableForReducedMotion: true }), 430);
  }

  // DOM hearts are short-lived, so the page never accumulates elements.
  if (!prefersReducedMotion) {
    for (let index = 0; index < 20; index += 1) {
      const heart = document.createElement("span");
      heart.textContent = index % 3 === 0 ? "✦" : "♥";
      heart.setAttribute("aria-hidden", "true");
      Object.assign(heart.style, {
        position: "fixed", zIndex: "21", left: `${Math.random() * 100}vw`, bottom: "-2rem",
        color: index % 3 === 0 ? "#ffc0de" : "#ff7ab8", fontSize: `${.8 + Math.random() * 1.4}rem`,
        pointerEvents: "none", transition: `transform ${2.4 + Math.random() * 1.8}s ease-out, opacity 3s ease-out`,
      });
      document.body.append(heart);
      requestAnimationFrame(() => { heart.style.transform = `translate(${(Math.random() - .5) * 18}vw, -${75 + Math.random() * 35}vh) rotate(${Math.random() * 220}deg)`; heart.style.opacity = "0"; });
      window.setTimeout(() => heart.remove(), 4200);
    }
  }
}

function playBirthdayChime() {
  // Web Audio is generated in-browser, so no copyrighted music file is required.
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const audio = new AudioContext();
  const notes = [261.63, 329.63, 392, 523.25]; // C major arpeggio
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + index * .15);
    gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + index * .15 + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + index * .15 + 1.4);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + index * .15);
    oscillator.stop(audio.currentTime + index * .15 + 1.5);
  });
  window.setTimeout(() => audio.close(), 2500);
}

createStarfield();
runBootSequence();
