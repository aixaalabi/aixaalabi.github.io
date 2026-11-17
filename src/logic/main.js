/* ==========================================
   SLIDE CONTENT
========================================== */

const slides = [
  {
    title: "About",
    bg: "#eaeaea",
    template: "template-about",
    type: "standard"
  },
  {
    title: "Welcome",
    bg: "#d9e2dc",
    template: "template-welcome",
    type: "standard"
  },
  {
    title: "Project 1",
    template: "template-project-1",
    type: "scrolly"
  },
  {
    title: "Project 2",
    bg: "#d8dce5",
    template: "template-project-2",
    type: "scrolly"
  },
  {
    title: "Project 3",
    bg: "#e5d9d9",
    template: "template-project-3",
    type: "scrolly"
  },
  {
    title: "Misc",
    bg: "#dcdcdc",
    template: "template-misc",
    type: "scrolly"
  }
];

/* ==========================================
   CAROUSEL SETUP
========================================== */

const track = document.getElementById("track");
const leftSlide = document.getElementById("leftSlide");
const currentSlideEl = document.getElementById("currentSlide");
const rightSlide = document.getElementById("rightSlide");

const navItems = document.querySelectorAll(".nav-item");

let currentSlide = 0;
let animationId = null;
let animationTimeout = null;
let isAnimating = false;
let animationDuration = 800;
let navigationQueue = [];

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ==========================================
   SLIDE RENDERING
========================================== */

function renderSlide(element, index) {

  const slide = slides[index];

  const template = document.getElementById(
    slide.template
  );

  element.replaceChildren(
    template.content.cloneNode(true)
  );

  element.dataset.index = index;

  element.style.background = slide.bg || "";

  element.classList.toggle(
    "scrolly-slide",
    slide.type === "scrolly"
  );

  if (slide.type === "scrolly") {

  switch (slide.title) {

    case "Project 1":
      initializeScrolly(element);
      break;

    case "Project 2":
      initializeSplitScrolly(element);
      break;

    case "Project 3":
      initializeMotionScrolly(element);
      break;

    case "Misc":
      initializeZoomScrolly(element);
      break;

  }
}

console.log(
  slide.title,
  "Scroll height:", element.scrollHeight,
  "Client height:", element.clientHeight,
  "Scrollable:", element.scrollHeight > element.clientHeight
);

  
}

function resetSlideScroll() {

  [leftSlide, currentSlideEl, rightSlide].forEach(
    (element) => {

      element.scrollTop = 0;
      element.scrollLeft = 0;

    }
  );
}

/* ==========================================
   UPDATE THREE SLIDE POSITIONS
========================================== */

function updateSlides() {

  const total = slides.length;

  // Hide the track while rebuilding and resetting
  track.style.visibility = "hidden";

  renderSlide(
    leftSlide,
    (currentSlide - 1 + total) % total
  );

  renderSlide(
    currentSlideEl,
    currentSlide
  );

  renderSlide(
    rightSlide,
    (currentSlide + 1) % total
  );

  resetSlideScroll();

  // Force layout before revealing the track
  track.offsetHeight;

  track.style.visibility = "visible";
}

let targetSlide = 0;
let animationFrame = null;

function cancelAnimation() {
  if (!isAnimating) return;

  clearTimeout(animationTimeout);

  // Immediately complete the current transition
  currentSlide = targetSlide;

  track.style.transition = "none";
  track.style.transform = "translateX(-33.333333%)";

  updateSlides();

  isAnimating = false;
  animationTimeout = null;
}

function goToSlide(direction) {

  // Finish any ongoing transition instantly
  if (isAnimating) {
    cancelAnimation();
  }

  // Calculate the new destination
  targetSlide =
    (currentSlide + direction + slides.length) % slides.length;
    
  navItems.forEach((item, i) => {
    item.classList.toggle("active", i === targetSlide);
  });

  isAnimating = true;

  track.style.transition = "none";
  track.style.transform = "translateX(-33.333333%)";
  track.offsetHeight;

  const distance =
    (targetSlide - currentSlide + slides.length) % slides.length;

  const animationDirection =
    distance <= slides.length / 2 ? 1 : -1;

  track.style.transition = reducedMotion
    ? "none"
    : `transform ${animationDuration}ms cubic-bezier(.77, 0, .18, 1)`;

  track.style.transform = animationDirection === 1
    ? "translateX(-66.666667%)"
    : "translateX(0%)";

  const finishAnimation = () => {
    currentSlide = targetSlide;

    track.style.transition = "none";
    track.style.transform = "translateX(-33.333333%)";

    updateSlides();

    isAnimating = false;
    animationTimeout = null;
  };

  if (reducedMotion) {
    finishAnimation();
  } else {
    animationTimeout = setTimeout(
      finishAnimation,
      animationDuration
    );
  }
}

/* ==========================================
   BUTTONS AND NAVIGATION
========================================== */

document.getElementById("next").addEventListener(
  "click",
  () => goToSlide(1)
);

document.getElementById("prev").addEventListener(
  "click",
  () => goToSlide(-1)
);

/* NAVIGATION DOTS */

navItems.forEach((item, index) => {
  item.addEventListener("click", () => {

    if (isAnimating) cancelAnimation();

    if (index === currentSlide) return;

    targetSlide = index;

    // Update navigation immediately
    navItems.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    const forward =
    (index - currentSlide + slides.length) % slides.length;

    // Determine which side to use
    const direction = forward <= slides.length / 2 ? 1 : -1;

    // Replace the appropriate neighboring slide
    if (direction === 1) {
        renderSlide(rightSlide, index);
    } else {
        renderSlide(leftSlide, index);
    }
    // Start animation
    isAnimating = true;

    track.style.transition = "none";
    track.style.transform = "translateX(-33.333333%)";
    track.offsetHeight;

    track.style.transition =
      `transform ${animationDuration}ms cubic-bezier(.77, 0, .18, 1)`;

    track.style.transform = direction === 1
      ? "translateX(-66.666667%)"
      : "translateX(0%)";

    animationTimeout = setTimeout(() => {

      // Commit destination
      currentSlide = index;

      // Silently rebuild all three positions
      track.style.transition = "none";
      track.style.transform = "translateX(-33.333333%)";

      updateSlides();

      isAnimating = false;
      animationTimeout = null;

    }, animationDuration);
  });
});

/* ==========================================
   KEYBOARD NAVIGATION
========================================== */

document.addEventListener("keydown", (e) => {

  if (e.key === "ArrowRight") {
    goToSlide(1);
  }

  if (e.key === "ArrowLeft") {
    goToSlide(-1);
  }

});

/* ==========================================
   TOUCH SWIPE NAVIGATION
========================================== */

let touchStartX = 0;
let touchStartY = 0;

track.addEventListener("touchstart", (e) => {

  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;

}, { passive: true });

track.addEventListener("touchend", (e) => {

  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;

  const dx = touchStartX - touchEndX;
  const dy = touchStartY - touchEndY;

  // Horizontal swipes only
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    goToSlide(dx > 0 ? 1 : -1);
  }
}, { passive: true });


/* ==========================================
   SCROLLYTELLING
========================================== */

function initializeScrolly(slideElement) {

  const visual = slideElement.querySelector(
    ".scrolly-visual"
  );

  const steps = slideElement.querySelectorAll(
    ".scrolly-step"
  );

  if (!visual || !steps.length) return;

  const circle1 = visual.querySelector(".circle-1");
  const circle2 = visual.querySelector(".circle-2");
  const circle3 = visual.querySelector(".circle-3");

  const updateScrolly = () => {

    const scrollTop = slideElement.scrollTop;
    const viewportHeight = slideElement.clientHeight;

    // First transition: circle 1 → circle 2
    const progress1 = Math.max(0, Math.min(1,
      (scrollTop - viewportHeight * 0.5) /
      (viewportHeight * 0.5)
    ));

    // Second transition: circle 2 → circle 3
    const progress2 = Math.max(0, Math.min(1,
      (scrollTop - viewportHeight * 1.5) /
      (viewportHeight * 0.5)
    ));

    // Circle opacity
    circle1.style.opacity = 1 - progress1;
    circle2.style.opacity = progress1 * (1 - progress2);
    circle3.style.opacity = progress2;

    // Background colors
    const color1 = [220, 210, 240];
    const color2 = [241, 227, 170];
    const color3 = [185, 223, 203];

    function mixColor(a, b, progress) {
      return `rgb(${a.map((value, i) =>
        Math.round(value + (b[i] - value) * progress)
      ).join(",")})`;
    }

    const background = progress1 < 1
      ? mixColor(color1, color2, progress1)
      : mixColor(color2, color3, progress2);

    visual.style.backgroundColor = background;

    // First divider
    visual.style.setProperty(
      "--divider-1",
      `${(1 - progress1) * 100}%`
    );

    // Second divider
    visual.style.setProperty(
      "--divider-2",
      `${(1 - progress2) * 100}%`
    );

    visual.style.setProperty(
      "--progress-1",
      progress1
    );

    visual.style.setProperty(
      "--progress-2",
      progress2
    );
  };

  slideElement.addEventListener(
    "scroll",
    updateScrolly,
    { passive: true }
  );

  updateScrolly();
}

function initializeSplitScrolly(slideElement) {

  const visual = slideElement.querySelector(".split-visual");
  const layers = visual.querySelectorAll(".split-layer");

  const update = () => {

    const vh = slideElement.clientHeight;
    const scroll = slideElement.scrollTop;

    // Determine current transition
    const index = Math.min(
      Math.floor(scroll / vh),
      layers.length - 2
    );

    // Progress through current transition
    const progress = Math.min(
      1,
      Math.max(0, (scroll - index * vh) / vh)
    );

    // Hide all layers
    layers.forEach(layer => {
      layer.style.clipPath = "inset(0 0 100% 0)";
      layer.style.zIndex = 0;
    });

    // Current screen
    layers[index].style.clipPath = "inset(0)";
    layers[index].style.zIndex = 1;

    // Next screen: reveal from bottom upwards
    layers[index + 1].style.clipPath =
      `inset(${(1 - progress) * 100}% 0 0 0)`;

    layers[index + 1].style.zIndex = 2;
  };

  slideElement.addEventListener("scroll", update, {
    passive: true
  });

  update();
}

function initializeMotionScrolly(slideElement) {

  const svg = slideElement.querySelector(".motion-svg");

  const circles = [
    svg.querySelector(".circle-1"),
    svg.querySelector(".circle-2"),
    svg.querySelector(".circle-3")
  ];

  // MODIFY THESE VALUES TO CHANGE FINAL POSITIONS.
  // Coordinates correspond to the SVG viewBox (1000 x 600).

  const startPositions = [
    { x: 100, y: 200 },
    { x: 100, y: 300 },
    { x: 100, y: 400 }
  ];

  const endPositions = [
    { x: 800, y: 120 },
    { x: 650, y: 300 },
    { x: 800, y: 480 }
  ];

  const update = () => {

    const vh = slideElement.clientHeight;

    const progress = Math.max(0, Math.min(
      1,
      slideElement.scrollTop / vh
    ));

    circles.forEach((circle, i) => {

      const start = startPositions[i];
      const end = endPositions[i];

      const x = start.x + (end.x - start.x) * progress;
      const y = start.y + (end.y - start.y) * progress;

      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);

    });

  };

  slideElement.addEventListener("scroll", update, {
    passive: true
  });

  update();
}

function initializeZoomScrolly(slideElement) {

  const svg = slideElement.querySelector(".zoom-svg");
  const world = svg.querySelector(".zoom-world");

  const MAX_ZOOM = 12;

  // SVG viewBox dimensions
  const svgWidth = 1000;
  const svgHeight = 600;

  // MODIFY THESE TO CHANGE PAN POSITIONS
  const panStart = { x: 500, y: 300 };
  const panEnd = { x: 550, y: 280 };

  const ease = p => p * p * (3 - 2 * p);

  const update = () => {

    const vh = slideElement.clientHeight;

    const progress = Math.max(0, Math.min(
      2,
      slideElement.scrollTop / vh
    ));

    // PHASE 1: Zoom
    const zoomProgress = Math.min(1, progress);

    // PHASE 2: Pan
    const panProgress = Math.max(
      0,
      Math.min(1, progress - 1)
    );

    const zoom = 1 + (MAX_ZOOM - 1) * ease(zoomProgress);

    // Interpolate target position
    const targetX = panStart.x +
      (panEnd.x - panStart.x) * ease(panProgress);

    const targetY = panStart.y +
      (panEnd.y - panStart.y) * ease(panProgress);

    // Keep target position at the centre of the SVG
    const tx = svgWidth / 2 - targetX * zoom;
    const ty = svgHeight / 2 - targetY * zoom;

    world.setAttribute(
      "transform",
      `translate(${tx} ${ty}) scale(${zoom})`
    );

  };

  slideElement.addEventListener("scroll", update, {
    passive: true
  });

  update();
}

/* ==========================================
   INITIALIZE
========================================== */

targetSlide = currentSlide;
updateSlides();
