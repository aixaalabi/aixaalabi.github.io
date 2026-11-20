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
    bg: "#fefefe",
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
   CAROUSEL SETUP — PERSISTENT SLIDES
========================================== */

const track = document.getElementById("track");
const navItems = document.querySelectorAll(".nav-item");

const animationDuration = 800;

let currentSlide = 1;
let targetSlide = 1;
let animationTimeout = null;
let isAnimating = false;
let aixaActiveCleanup = null;
let aixaInitId = 0;
let pointerInsideCanvas = false;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Store all slide elements permanently.
const slideElements = [];

/* ==========================================
   CREATE ALL SLIDES ONCE
========================================== */

function createSlides() {

  track.replaceChildren();

  slides.forEach((slide, index) => {

    const template = document.getElementById(
      slide.template
    );

    if (!template) {
      throw new Error(
        `Missing slide template: ${slide.template}`
      );
    }

    const element = document.createElement("section");

    element.className = "slide";
    element.dataset.index = index;
    element.style.background = slide.bg || "";

    if (slide.type === "scrolly") {
      element.classList.add("scrolly-slide");
    }

    // Clone exactly once during initial setup.
    element.appendChild(
      template.content.cloneNode(true)
    );

    track.appendChild(element);

    slideElements.push(element);

  });

}

/* ==========================================
   INITIALIZE EACH SLIDE EXACTLY ONCE
========================================== */

function initializeAllSlides() {

  slideElements.forEach((element, index) => {

    const slide = slides[index];

    switch (slide.title) {

      case "Welcome":
        initializeAixaBackground();
        break;

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

  });

}

/* ==========================================
   SLIDE POSITIONING
========================================== */

function getSlideTransform(index) {

  return `translateX(-${index * (100 / slides.length)}%)`;

}

function updateActiveSlide() {

  slideElements.forEach((element, index) => {

    const active = index === currentSlide;

    element.inert = !active;

    element.setAttribute(
      "aria-hidden",
      String(!active)
    );

  });

  navItems.forEach((item, index) => {

    item.classList.toggle(
      "active",
      index === currentSlide
    );

  });

}

/* ==========================================
   RESET SCROLL POSITIONS
========================================== */

function resetSlideScroll() {

  slideElements.forEach(element => {

    element.scrollTop = 0;
    element.scrollLeft = 0;

  });

}

/* ==========================================
   INITIAL POSITION
========================================== */

function initializeCarousel() {

  createSlides();

  // Set the initial position without animation.
  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);

  updateActiveSlide();

  // Initialize all slide functionality once.
  initializeAllSlides();

}

/* ==========================================
   CANCEL ONGOING ANIMATION
========================================== */

function cancelAnimation() {

  if (!isAnimating) return;

  clearTimeout(animationTimeout);

  currentSlide = targetSlide;

  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);

  isAnimating = false;
  animationTimeout = null;

  updateActiveSlide();

}

/* ==========================================
   NAVIGATION
========================================== */

function navigateTo(index) {

  if (isAnimating) {
    cancelAnimation();
  }

  if (index === currentSlide) return;

  targetSlide = index;

  isAnimating = true;

  navItems.forEach((item, i) => {

    item.classList.toggle(
      "active",
      i === targetSlide
    );

  });

  // Establish the current position without animation.
  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);

  // Force layout.
  track.offsetHeight;

  // Animate directly to the destination.
  track.style.transition = reducedMotion
    ? "none"
    : `transform ${animationDuration}ms cubic-bezier(.77, 0, .18, 1)`;

  track.style.transform = getSlideTransform(targetSlide);

  const finishAnimation = () => {

    currentSlide = targetSlide;

    track.style.transition = "none";
    track.style.transform = getSlideTransform(currentSlide);

    // Preserve the original behaviour of resetting scroll.
    resetSlideScroll();

    updateActiveSlide();

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

function goToSlide(direction) {

  const nextIndex =
    (currentSlide + direction + slides.length) %
    slides.length;

  navigateTo(nextIndex);

}

/* ==========================================
   BUTTONS
========================================== */

document.getElementById("next").addEventListener(
  "click",
  () => goToSlide(1)
);

document.getElementById("prev").addEventListener(
  "click",
  () => goToSlide(-1)
);

/* ==========================================
   NAVIGATION DOTS
========================================== */

navItems.forEach((item, index) => {

  item.addEventListener("click", () => {

    navigateTo(index);

  });

});

/* ==========================================
   KEYBOARD NAVIGATION
========================================== */

document.addEventListener("keydown", event => {

  if (event.key === "ArrowRight") {
    goToSlide(1);
  }

  if (event.key === "ArrowLeft") {
    goToSlide(-1);
  }

});

/* ==========================================
   TOUCH SWIPE NAVIGATION
========================================== */

let touchStartX = 0;
let touchStartY = 0;

track.addEventListener("touchstart", event => {

  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;

}, { passive: true });

track.addEventListener("touchend", event => {

  if (pointerInsideCanvas === true) {
    return;
  }

  const touchEndX = event.changedTouches[0].screenX;
  const touchEndY = event.changedTouches[0].screenY;

  const dx = touchStartX - touchEndX;
  const dy = touchStartY - touchEndY;

  if (
    Math.abs(dx) > 50 &&
    Math.abs(dx) > Math.abs(dy)
  ) {

    goToSlide(dx > 0 ? 1 : -1);

  }

}, { passive: true });

/* ==========================================
   START
========================================== */

initializeCarousel();


/* ==========================================
   SCROLLYTELLING
========================================== */

async function initializeScrolly(slideElement) {

  // ==========================================
  // CLEAN UP PREVIOUS INITIALIZATION
  // ==========================================

  slideElement._scrollyCleanup?.();

  const story = slideElement.querySelector(".scrolly-story");
  const visual = slideElement.querySelector(".scrolly-visual");
  const loader = slideElement.querySelector(".scrolly-loader");

  const steps = [
    ...slideElement.querySelectorAll(".scrolly-step")
  ];

  const sequences = [
    ...slideElement.querySelectorAll(".scrolly-sequence")
  ];

  if (!story || !visual || !sequences.length) return;

  const clamp = (v, min = 0, max = 1) =>
    Math.max(min, Math.min(max, v));

  const STATIC_SCROLL = 0.5;
  const ANIMATED_SCROLL = 1;

  let destroyed = false;
  let ticking = false;

  // ==========================================
  // LOADING STATE
  // ==========================================

  slideElement.scrollTop = 0;
  slideElement.classList.add("is-loading");

  if (loader) {
    loader.classList.remove("hidden");
  }

  sequences.forEach(sequence => {
    sequence.style.visibility = "hidden";
  });

  // ==========================================
  // WAIT FOR SVG OBJECT TO LOAD
  // ==========================================

  
  function loadSVG(object, index) {

    return new Promise((resolve, reject) => {

      const timeout = 60000;
      const started = Date.now();

      let finished = false;

      const expectedURL = new URL(
        object.getAttribute("data"),
        document.baseURI
      ).href;

      function cleanup() {
        object.removeEventListener("load", check);
        object.removeEventListener("error", onError);
      }

      function succeed(doc) {

        if (finished) return;

        finished = true;
        cleanup();

        resolve(doc);
      }

      function fail(error) {

        if (finished) return;

        finished = true;
        cleanup();

        reject(error);
      }

      function check() {

        if (finished) return;

        let doc;

        try {
          doc = object.contentDocument;
        } catch (error) {
          return;
        }

        if (!doc || !doc.documentElement) return;

        // Reject the initial empty document.
        if (doc.URL === "about:blank") return;

        // Make sure we have an actual SVG document.
        const root = doc.documentElement;

        if (
          root.localName !== "svg" ||
          root.namespaceURI !== "http://www.w3.org/2000/svg"
        ) {
          return;
        }

        succeed(doc);
      }

      function onError() {

        fail(
          new Error(`Failed to load SVG ${index + 1}: ${expectedURL}`)
        );

      }

      object.addEventListener("load", check);
      object.addEventListener("error", onError);

      // Check immediately in case the SVG is already loaded.
      check();

      // Continue checking because the initial object load
      // can expose about:blank before the SVG navigation finishes.
      const poll = setInterval(() => {

        if (finished) {
          clearInterval(poll);
          return;
        }

        check();

        if (Date.now() - started > timeout) {

          clearInterval(poll);

          fail(
            new Error(
              `Timed out waiting for SVG ${index + 1}. ` +
              `Expected: ${expectedURL}. ` +
              `Current document: ${object.contentDocument?.URL}`
            )
          );

        }

      }, 100);

    });

  }

  // ==========================================
  // WAIT FOR STYLES AND ANIMATIONS
  // ==========================================

  function nextFrame() {

    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });

  }

  async function prepareSVG(doc, index) {

    if (
      doc.URL === "about:blank" ||
      doc.documentElement?.localName !== "svg"
    ) {
      throw new Error("Attempted to prepare an unloaded SVG");
    }
    // Wait for SVG fonts, if present.
    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }

    // Allow browser to calculate SVG styles.
    await nextFrame();
    await nextFrame();

    // Force computed styles to be evaluated.
    const elements = [
      ...doc.querySelectorAll("*")
    ];

    const getAnimatedElements = () => {

      return elements.filter(element => {

        const style = window.getComputedStyle(element);

        return style.animationName !== "none";

      });

    };

    // Some browsers may need another rendering cycle
    // before CSS animations become available.
    let animatedElements = getAnimatedElements();
    let attempts = 0;

    while (
      animatedElements.length > 0 &&
      attempts < 20
    ) {

      const animations = collectAnimations(doc);

      if (animations.length > 0) break;

      await new Promise(resolve => setTimeout(resolve, 50));

      animatedElements = getAnimatedElements();
      attempts++;

    }

    const animations = collectAnimations(doc);

    // Pause and prepare every discovered animation.
    animations.forEach(animation => {

      if (!animation.effect) return;

      // Explicitly override the animation timing.
      animation.effect.updateTiming({
        fill: "both"
      });

      // Pause before setting the initial position.
      animation.pause();

      // Reset to the beginning.
      animation.currentTime = 0;

    });

    // ==========================================
    // PREPARE SMIL ANIMATIONS
    // ==========================================

    const root = doc.documentElement;

    // Discover native SVG animations.
    const smilAnimations = [
      ...doc.querySelectorAll(
        "animate, animateTransform, animateMotion, set"
      )
    ];

    // Find the longest SMIL duration (in seconds).
    const smilDuration = Math.max(
      0,
      ...smilAnimations.map(element => {

        const dur = element.getAttribute("dur") || "";

        const match = dur.match(
          /^([\d.]+)\s*(ms|s|min)?$/
        );

        if (!match) return 0;

        const value = parseFloat(match[1]);

        switch (match[2]) {
          case "ms": return value / 1000;
          case "min": return value * 60;
          default: return value;
        }

      })
    );

    // Pause the native SVG timeline.
    root.pauseAnimations();
    root.setCurrentTime(0);

    return {
      doc,
      animations,
      smilDuration,
      smilAnimations
    };
  }

  // ==========================================
  // COLLECT ANIMATIONS
  // ==========================================

  function collectAnimations(doc) {

    const found = new Set();

    // Document-level discovery.
    doc.getAnimations({ subtree: true }).forEach(animation => {
      found.add(animation);
    });

    // Element-level fallback.
    doc.querySelectorAll("*").forEach(element => {

      if (typeof element.getAnimations !== "function") return;

      element.getAnimations().forEach(animation => {
        found.add(animation);
      });

    });

    return [...found].filter(animation => animation.effect);

  }

  // ==========================================
  // LOAD ALL SVG DOCUMENTS
  // ==========================================

  let documents;
  let animationGroups;

  try {

    documents = await Promise.all(
      sequences.map((sequence, index) => loadSVG(sequence, index))
    );

    if (destroyed || !slideElement.isConnected) return;

    animationGroups = await Promise.all(
      documents.map((doc, index) => prepareSVG(doc, index))
    );

    if (destroyed || !slideElement.isConnected) return;
    
  } catch (error) {

    console.error("Scrolly initialization failed:", error);

    if (loader) {
      loader.innerHTML = "<p>Unable to load visual sequence.</p>";
    }

    return;

  }

  // ==========================================
  // CONFIGURE SEQUENTIAL SVG TIMELINE
  // ==========================================

  // Cache finite animation timings for each SVG.
  const timingGroups = animationGroups.map(group =>
    group.animations.map(animation => {
      const timing = animation.effect.getTiming();
      const computed = animation.effect.getComputedTiming();

      const duration = Number.isFinite(computed.duration)
        ? computed.duration
        : 0;

      const iterations = Number.isFinite(timing.iterations)
        ? timing.iterations
        : 1;

      const delay = Number.isFinite(timing.delay)
        ? timing.delay
        : 0;

      return {
        duration,
        iterations,
        delay,
        endTime: Math.max(0, delay + duration * iterations)
      };
    })
  );

  // Calculate each SVG's duration independently.
  const svgDurations = animationGroups.map((group, index) =>
    Math.max(
      0.001,
      ...timingGroups[index].map(timing => timing.endTime),
      group.smilDuration * 1000
    ) / 1000
  );

  // Build sequential intervals.
  let timelineStart = 0;

  const intervals = svgDurations.map(duration => {
    const interval = {
      start: timelineStart,
      duration
    };

    timelineStart += duration;

    return interval;
  });

  const totalScrollUnits = timelineStart;

  // ==========================================
  // STORY HEIGHT + NARRATIVE TIMING
  // ==========================================

  const stepStarts = steps.map(step =>
    Number(step.dataset.start)
  );

  // Make sure the HTML timings are valid.
  if (
    stepStarts.some((value, index) =>
      !Number.isFinite(value) ||
      value < 0 ||
      (index > 0 && value <= stepStarts[index - 1])
    )
  ) {
    throw new Error(
      "Narrative data-start values must be increasing numbers."
    );
  }

  function setStoryHeight() {

    const vh = slideElement.clientHeight;

    const lastStepStart = stepStarts.at(-1) || 0;

    // Allow at least one viewport of reading time
    // after the final text block appears.
    const narrativeEnd = lastStepStart + 1;

    // The longer timeline determines the story height.
    const storyEnd = Math.max(
      totalScrollUnits,
      narrativeEnd
    );

    story.style.height = `${(storyEnd + 1) * vh}px`;

    // Each narrative block occupies the time
    // between its own start and the next block.
    steps.forEach((step, index) => {

      const nextStart = stepStarts[index + 1] ?? storyEnd;

      step.style.height =
        `${(nextStart - stepStarts[index]) * vh}px`;

    });

  }

  setStoryHeight();

  // ==========================================
  // SCROLL CONTROLLER
  // ==========================================

  const updateScrolly = () => {

    if (destroyed) {
      ticking = false;
      return;
    }

    const vh = slideElement.clientHeight;

    if (!vh) {
      ticking = false;
      return;
    }

    const scrollProgress = slideElement.scrollTop / vh;

    const globalProgress = clamp(
      scrollProgress,
      0,
      totalScrollUnits
    );

    // ------------------------------------------
    // UPDATE EACH SVG
    // ------------------------------------------

    sequences.forEach((sequence, index) => {

      const interval = intervals[index];

      const localProgress = clamp(
        (globalProgress - interval.start) /
        interval.duration
      );

      // Control visibility based on scroll position.
      const hideAfter =
        sequence.dataset.hideAfter === "true";

      const intervalEnd =
        interval.start + interval.duration;

      const isVisible =
        globalProgress >= interval.start &&
        (globalProgress <= intervalEnd || !hideAfter);

      sequence.style.visibility =
        isVisible ? "visible" : "hidden";

      // Seek animations using SVG-local progress.
      animationGroups[index].animations.forEach((animation, i) => {

        const timing = timingGroups[index][i];

        if (!Number.isFinite(timing.duration)) return;

        const targetTime =
          timing.delay +
          localProgress * timing.duration * timing.iterations;

        if (Number.isFinite(targetTime)) {
          animation.currentTime = targetTime;
        }

      });

      // sync SMIL animations

      const group = animationGroups[index];
      const localTime = localProgress * interval.duration;
      if (group.smilAnimations.length) {

        group.doc.documentElement.setCurrentTime(
          localTime
        );

      }

      // Useful for additional CSS effects.
      sequence.style.setProperty(
        "--sequence-progress",
        localProgress
      );

    });

    // ------------------------------------------
    // UPDATE NARRATIVE STEPS
    // ------------------------------------------

    // ------------------------------------------
    // SCROLL-DRIVEN NARRATIVE OPACITY
    // ------------------------------------------

    steps.forEach((step, index) => {

      const start = stepStarts[index];
      const nextStart = stepStarts[index + 1];

      const fadeInDuration =
        Number(step.dataset.fadeIn ?? 0.2);

      const fadeOutDuration =
        Number(step.dataset.fadeOut ?? 0.2);

      const fadeIn = clamp(
        (scrollProgress - start) / fadeInDuration,
        0,
        1
      );

      const fadeOut = nextStart === undefined
        ? 1
        : clamp(
            (nextStart - scrollProgress) / fadeOutDuration,
            0,
            1
          );

      const opacity = Math.min(fadeIn, fadeOut);

      const content = step.querySelector(".step-content");

      if (content) {
        content.style.opacity = opacity;
        content.style.visibility =
          opacity > 0 ? "visible" : "hidden";
      }

    });
    ticking = false;

  };

  const requestUpdate = () => {

    if (ticking || destroyed) return;

    ticking = true;

    requestAnimationFrame(updateScrolly);

  };

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  slideElement.addEventListener(
    "scroll",
    requestUpdate,
    { passive: true }
  );

  const resizeObserver = new ResizeObserver(() => {

    setStoryHeight();
    requestUpdate();

  });

  resizeObserver.observe(slideElement);

  // ==========================================
  // CLEANUP
  // ==========================================

  slideElement._scrollyCleanup = () => {

    destroyed = true;

    slideElement.removeEventListener(
      "scroll",
      requestUpdate
    );

    resizeObserver.disconnect();

    // Leave animations paused.
    animationGroups.forEach(group => {

      group.animations.forEach(animation => {
        animation.pause();
      });

      group.doc.documentElement.pauseAnimations();

    });

  };

  // ==========================================
  // SHOW THE FINISHED VISUAL
  // ==========================================

  sequences.forEach((sequence, index) => {

    sequence.style.zIndex = index + 1;

  });

  if (loader) {
    loader.classList.add("hidden");
  }

  slideElement.classList.remove("is-loading");

  // Establish initial animation positions.
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

async function initializeAixaBackground(clean = false) {

  document.querySelectorAll('.aixa-slide .aixa-tool-name').forEach(name => {
    name.addEventListener('touchstart', () => {
      name.closest('.aixa-tool').classList.toggle('closed');
    });
  });

  // Clean up previous instance
  if (aixaActiveCleanup !== null) {
    aixaActiveCleanup();
    aixaActiveCleanup = null;
  }

  const initId = ++aixaInitId;

  const slide = document.querySelector('.aixa-slide');
  const portrait = slide?.querySelector('.aixa-portrait');

  if (!portrait) return;

  const THREE = await import(
    'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'
  );

  if (initId !== aixaInitId || !portrait.isConnected) return;

  const canvas = document.createElement('canvas');
  portrait.prepend(canvas);

  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    pointerEvents: 'auto'
  });

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power'
  });

  renderer.setPixelRatio(1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);

  const simSize = 256;

  const targetOptions = {
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false
  };

  let read = new THREE.WebGLRenderTarget(
    simSize, simSize, targetOptions
  );

  let write = new THREE.WebGLRenderTarget(
    simSize, simSize, targetOptions
  );

  const clearTarget = (target) => {
    renderer.setRenderTarget(target);
    renderer.clear();
  };

  clearTarget(read);
  clearTarget(write);
  renderer.setRenderTarget(null);

  // -------------------------------
  // VELOCITY SIMULATION
  // -------------------------------

  const simUniforms = {
    uVelocity: { value: read.texture },
    uMouse: { value: new THREE.Vector2(-10, -10) },
    uForce: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(simSize, simSize) },
    uDelta: { value: 0.016 }
  };

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: simUniforms,

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform sampler2D uVelocity;
      uniform vec2 uMouse;
      uniform vec2 uForce;
      uniform vec2 uResolution;
      uniform float uDelta;

      varying vec2 vUv;

      void main() {

        vec2 uv = vUv;

        // Read the previous velocity field
        vec2 oldVelocity = texture2D(
          uVelocity,
          uv
        ).xy;

        // Advect velocity using the previous velocity
        vec2 backtrace = uv - oldVelocity * uDelta * 0.8;

        vec2 velocity = texture2D(
          uVelocity,
          clamp(backtrace, vec2(0.001), vec2(0.999))
        ).xy;

        // Dissipation
        velocity *= 0.992;

        // Aspect-correct mouse coordinates
        vec2 aspect = vec2(
          uResolution.x / uResolution.y,
          1.0
        );

        vec2 pos = uv * aspect;
        vec2 mouse = uMouse * aspect;

        vec2 relative = pos - mouse;

        float dist = length(relative);

        // Localized cursor force
        float influence = exp(-dist * dist * 180.0);

        velocity += uForce * influence * 0.08;

        // Vortex-like displacement around cursor
        vec2 tangent = vec2(-relative.y, relative.x);

        velocity += tangent *
          influence *
          length(uForce) *
          0.018;

        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `
  });

  const simScene = new THREE.Scene();

  simScene.add(
    new THREE.Mesh(geometry, simMaterial)
  );

  // -------------------------------
  // COLOR DISPLAY
  // -------------------------------

  const displayUniforms = {
    uVelocity: { value: read.texture },
    uTime: { value: 0 }
  };

  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: displayUniforms,

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,

    fragmentShader: `            
      uniform sampler2D uVelocity;
      uniform float uTime;

      varying vec2 vUv;

      void main() {

          vec2 velocity = texture2D(uVelocity, vUv).xy;

          // Fluid displacement
          vec2 uv = vUv - velocity * 1.5;

          float t = uTime * 0.22;

          // Continuous diagonal movement
          uv += vec2(t * 0.12, t * 0.12);

          // Triangular grid
          float scale = 7.0;

          vec2 grid = uv * scale;
          vec2 cell = fract(grid);
          vec2 id = floor(grid);

          // Triangle orientation
          float triangle = step(cell.y, cell.x);

          // Animated color variation
          float wave = sin(
              id.x * 1.7 +
              id.y * 2.3 +
              t
          );

          float wave2 = cos(
              id.x * 1.3 -
              id.y * 1.8 -
              t
          );

          vec3 lavender = vec3(0.72, 0.59, 0.87);
          vec3 blue = vec3(0.57, 0.77, 0.88);
          vec3 pink = vec3(0.94, 0.65, 0.76);
          vec3 purple = vec3(0.55, 0.43, 0.72);

          vec3 color = mix(
              lavender,
              blue,
              smoothstep(-0.4, 0.5, wave)
          );

          color = mix(
              color,
              pink,
              smoothstep(-0.2, 0.7, wave2) * 0.7
          );

          color = mix(
              color,
              purple,
              triangle * 0.25
          );

          gl_FragColor = vec4(color, 1.0);
      }

    `
  });

  const displayScene = new THREE.Scene();

  displayScene.add(
    new THREE.Mesh(geometry, displayMaterial)
  );

  // -------------------------------
  // POINTER
  // -------------------------------

  const currentMouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);
  const previousMouse = new THREE.Vector2(0.5, 0.5);

  let pointerInside = false;

  function onPointerMove(event) {
    event.preventDefault();
    const rect = portrait.getBoundingClientRect();

    targetMouse.set(
      (event.clientX - rect.left) / rect.width,
      1 - (event.clientY - rect.top) / rect.height
    );

    pointerInside = true;
    pointerInsideCanvas = true;
  }

  function onPointerLeave() {
    pointerInside = false;
     setTimeout(() => {
      pointerInsideCanvas = false;
    }, 100)
  }

  portrait.addEventListener('pointermove', onPointerMove);
  portrait.addEventListener('pointerleave', onPointerLeave);

  // -------------------------------
  // RESIZE
  // -------------------------------

  function resize() {
    const width = portrait.clientWidth;
    const height = portrait.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(portrait);

  resize();

  // -------------------------------
  // ANIMATION
  // -------------------------------

  let animationFrame;
  let lastTime = 0;
  let running = true;

  function animate(time) {

    if (!running) return;

    animationFrame = requestAnimationFrame(animate);

    const dt = lastTime
      ? Math.min((time - lastTime) / 1000, 0.033)
      : 0.016;

    lastTime = time;

    currentMouse.lerp(targetMouse, 0.25);

    const movement = new THREE.Vector2()
      .subVectors(currentMouse, previousMouse);

    previousMouse.copy(currentMouse);

    simUniforms.uMouse.value.copy(currentMouse);

    simUniforms.uForce.value.set(
      pointerInside ? movement.x * 35 : 0,
      pointerInside ? movement.y * 35 : 0
    );

    simUniforms.uDelta.value = dt;

    // Simulation pass
    simUniforms.uVelocity.value = read.texture;

    renderer.setRenderTarget(write);
    renderer.render(simScene, camera);

    // Swap buffers
    const temp = read;
    read = write;
    write = temp;

    // Display pass
    displayUniforms.uVelocity.value = read.texture;
    displayUniforms.uTime.value = time * 0.001;

    renderer.setRenderTarget(null);
    renderer.render(displayScene, camera);
  }

  animate(0);

  // -------------------------------
  // CLEANUP
  // -------------------------------

  aixaActiveCleanup = () => {

    running = false;

    cancelAnimationFrame(animationFrame);

    portrait.removeEventListener('pointermove', onPointerMove);
    portrait.removeEventListener('pointerleave', onPointerLeave);

    resizeObserver.disconnect();

    read.dispose();
    write.dispose();

    geometry.dispose();
    simMaterial.dispose();
    displayMaterial.dispose();

    renderer.dispose();

    canvas.remove();
  };
}

function initializeSVGMagnifier() {

  const lens = document.createElement("div");
  lens.id = "svg-magnifier";

  const content = document.createElement("div");
  content.id = "svg-magnifier-content";

  lens.appendChild(content);
  document.body.appendChild(lens);

  let activeObject = null;
  let activeSVG = null;

  const modifierPressed = event =>
    event.ctrlKey || event.metaKey;

  function hideLens() {
    lens.style.display = "none";
    activeObject = null;
    activeSVG = null;
  }

  function findObject(x, y) {

    const objects = document.querySelectorAll(
      'object[type="image/svg+xml"], object'
    );

    return [...objects].find(object => {

      const rect = object.getBoundingClientRect();

      const inside =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

      const isSVG =
        object.contentDocument?.documentElement?.localName === "svg";

      return inside && isSVG;

    }) || null;
  }

  function activate(object) {

    const doc = object.contentDocument;
    const svg = doc?.documentElement;

    if (!svg) return false;

    const viewBox = svg.viewBox.baseVal;

    const nativeWidth =
      svg.width.baseVal.value || viewBox.width;

    const nativeHeight =
      svg.height.baseVal.value || viewBox.height;

    if (!nativeWidth || !nativeHeight) return false;

    const rect = object.getBoundingClientRect();

    if (
      rect.width >= nativeWidth &&
      rect.height >= nativeHeight
    ) {
      hideLens();
      return false;
    }

    activeObject = object;
    activeSVG = svg;

    content.innerHTML = "";

    const clone = svg.cloneNode(true);

    clone.setAttribute("width", nativeWidth);
    clone.setAttribute("height", nativeHeight);

    clone.querySelectorAll(
      "animate, animateTransform, animateMotion, set"
    ).forEach(element => element.remove());

    clone.querySelectorAll("*").forEach(element => {
      element.style.animation = "none";
    });

    content.appendChild(clone);
    const zoom = 2;

    content.style.width = `${nativeWidth * zoom}px`;
    content.style.height = `${nativeHeight * zoom}px`;

    clone.setAttribute("width", nativeWidth * zoom);
    clone.setAttribute("height", nativeHeight * zoom);

    lens.dataset.nativeWidth = nativeWidth;
    lens.dataset.nativeHeight = nativeHeight;

    return true;
  }

  function update(event) {

    if (!modifierPressed(event)) {
      hideLens();
      return;
    }

    

    // Keyboard events don't reliably contain pointer coordinates.
    if (
      !Number.isFinite(event.clientX) ||
      !Number.isFinite(event.clientY)
    ) {
      return;
    }
    
    const object = findObject(
      event.clientX,
      event.clientY
    );
    
    if (!object) {
      hideLens();
      return;
    }

    console.log("should work")

    if (activeObject !== object) {
      if (!activate(object)) return;
    }

    

    const rect = object.getBoundingClientRect();

    const nativeWidth = Number(lens.dataset.nativeWidth);
    const nativeHeight = Number(lens.dataset.nativeHeight);

    const diameter = Math.min(
      window.innerWidth,
      window.innerHeight
    ) * 0.5;

    // Map pointer position into native SVG coordinates.
    const x = (event.clientX - rect.left) *
      nativeWidth / rect.width;

    const y = (event.clientY - rect.top) *
      nativeHeight / rect.height;

    lens.style.width = `${diameter}px`;
    lens.style.height = `${diameter}px`;

    lens.style.left =
      `${event.clientX - diameter / 2}px`;

    lens.style.top =
      `${event.clientY - diameter / 2}px`;

    const zoom = 2;

    content.style.left = `${diameter / 2 - x * zoom}px`;
    content.style.top = `${diameter / 2 - y * zoom}px`;

    lens.style.display = "block";
  }

  // Global mouse tracking.
  document.addEventListener("pointermove", update);

  document.addEventListener("keyup", event => {
    if (!event.ctrlKey && !event.metaKey) {
      hideLens();
    }
  });

  window.addEventListener("blur", hideLens);
  window.addEventListener("resize", hideLens);

  return () => {
    hideLens();
    document.removeEventListener("pointermove", update);
    lens.remove();
  };
}


/* ==========================================
   INITIALIZE
========================================== */

targetSlide = currentSlide;
const cleanupMagnifier = initializeSVGMagnifier();