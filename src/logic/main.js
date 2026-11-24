const slides = [
  {
    title: "About",
    bg: "#F0F4F7",
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
    title: "Media Dashboard",
    template: "template-project-1",
    type: "scrolly",
    bg: "#F0F4F7"
  },
  {
    title: "Profile Uploads",
    bg: "#d8dce5",
    template: "template-project-2",
    type: "scrolly"
  },
  {
    title: "Gallery",
    bg: "#dcdcdc",
    template: "template-gallery",
    type: "scrolly"
  }
];

const track = document.getElementById("track");
const navItems = document.querySelectorAll(".nav-item");
const animationDuration = 800;

let currentSlide = 1;
let targetSlide = 1;
let animationTimeout = null;
let isAnimating = false;
let restoreSlideOrder = null;
let aixaActiveCleanup = null;
let aixaInitId = 0;
let pointerInsideCanvas = false;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Store all slide elements permanently.
const slideElements = [];

function createSlides() {
  track.replaceChildren();
  track.style.setProperty("--slide-count", slides.length);

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

    element.appendChild(
      template.content.cloneNode(true)
    );
    track.appendChild(element);
    slideElements.push(element);
  });
}

function initializeAllSlides() {
  slideElements.forEach((element, index) => {
    if (slides[index].title === "Welcome") {
      initializeAixaBackground();
    }

    if (slides[index].type === "scrolly") {
      initializeScrolly(element);
    }
  });
}

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

  navItems.forEach(item => {
    const index = Number(item.dataset.index);

    item.classList.toggle(
      "active",
      index === currentSlide
    );
  });
}

function resetSlideScroll() {
  slideElements.forEach(element => {
    element.scrollTop = 0;
    element.scrollLeft = 0;
  });
}

function initializeCarousel() {
  createSlides();
  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);
  updateActiveSlide();
  initializeAllSlides();
}

function cancelAnimation() {
  if (!isAnimating) return;
  clearTimeout(animationTimeout);

  // Restore the original DOM order if this was a wrap transition.
  restoreSlideOrder?.();
  restoreSlideOrder = null;

  currentSlide = targetSlide;

  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);

  isAnimating = false;
  animationTimeout = null;

  updateActiveSlide();
}

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

  // ensure current position before transitioning to target
  track.style.transition = "none";
  track.style.transform = getSlideTransform(currentSlide);
  track.offsetHeight;
  track.style.transition = reducedMotion
    ? "none"
    : `transform ${animationDuration}ms cubic-bezier(.77, 0, .18, 1)`;

  track.style.transform = getSlideTransform(targetSlide);

  const finishAnimation = () => {
    currentSlide = targetSlide;
    track.style.transition = "none";
    track.style.transform = getSlideTransform(currentSlide);

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
  const nav = document.querySelector('#navigation');
  nav.classList.remove('nav-hidden');

  if (isAnimating) cancelAnimation();

  const lastIndex = slides.length - 1;
  const nextIndex =
    (currentSlide + direction + slides.length) % slides.length;

  const wrapLeft = currentSlide === 0 && direction === -1;
  const wrapRight = currentSlide === lastIndex && direction === 1;

  // Normal navigation.
  if (!wrapLeft && !wrapRight) {
    navigateTo(nextIndex);
    return;
  }

  // Temporarily reposition the DOM to create an adjacent slide.
  let startIndex;
  let endIndex;

  if (wrapLeft) {
    const lastSlide = slideElements[lastIndex];
    track.prepend(lastSlide);
    restoreSlideOrder = () => {
      track.append(lastSlide);
    };
    startIndex = 1;
    endIndex = 0;
  } else {

    const firstSlide = slideElements[0];
    track.append(firstSlide);
    restoreSlideOrder = () => {
      track.prepend(firstSlide);
    };

    startIndex = lastIndex - 1;
    endIndex = lastIndex;
  }

  targetSlide = nextIndex;
  isAnimating = true;

  navItems.forEach((item, i) => {
    item.classList.toggle("active", i === targetSlide);
  });

  track.style.transition = "none";
  track.style.transform = getSlideTransform(startIndex);
  track.offsetHeight;
  track.style.transition = reducedMotion
    ? "none"
    : `transform ${animationDuration}ms cubic-bezier(.77, 0, .18, 1)`;

  track.style.transform = getSlideTransform(endIndex);

  const finishAnimation = () => {

    // Restore original DOM order.
    restoreSlideOrder?.();
    restoreSlideOrder = null;

    currentSlide = targetSlide;

    track.style.transition = "none";
    track.style.transform = getSlideTransform(currentSlide);

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

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const index = Number(item.dataset.index);
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
   SCROLLYTELLING
========================================== */

async function initializeScrolly(slideElement) {
  slideElement._scrollyCleanup?.();
  // ==========================================
  // DEVICE-SPECIFIC SVG SEQUENCES
  // ==========================================

  const isMobile = window.matchMedia("(max-width: 600px)").matches;

  slideElement.querySelectorAll("object[data-mobile], object[data-desktop]")
    .forEach(object => {
      const mobileOnly = object.hasAttribute("data-mobile");
      const desktopOnly = object.hasAttribute("data-desktop");

      if (
        (mobileOnly && !isMobile) ||
        (desktopOnly && isMobile)
      ) {
        object.remove();
      }
    });

  const story = slideElement.querySelector(".scrolly-story");
  const visual = slideElement.querySelector(".scrolly-visual");
  const loader = slideElement.querySelector(".scrolly-loader");
  const steps = [...slideElement.querySelectorAll(".scrolly-step")];
  const traditionalElements = [
    ...slideElement.querySelectorAll('[data-scrolly-type="trad"]')
  ].filter(element =>
    !element.parentElement.closest('[data-scrolly-type="trad"]')
  );

  const sequences = [
    ...slideElement.querySelectorAll(".scrolly-sequence")
  ].filter(sequence =>
    sequence.dataset.scrollyType !== "trad"
  );

  if (!story || !visual || !sequences.length) {
    console.error("Invalid scrolly structure:", {
      slide: slideElement.dataset.index,
      story: !!story,
      visual: !!visual,
      sequences: sequences.length
    });

    loader?.classList.add("hidden");
    slideElement.classList.remove("is-loading");
    return;
  }

  const clamp = (v, min = 0, max = 1) =>
    Math.max(min, Math.min(max, v));

  let destroyed = false;
  let ticking = false;

  slideElement.scrollTop = 0;
  slideElement.classList.add("is-loading");
  loader?.classList.remove("hidden");

  // ==========================================
  // TRADITIONAL DOCUMENT FLOW
  // ==========================================

  let traditionalWrapper = null;

  if (traditionalElements.length) {
    traditionalWrapper = document.createElement("div");
    traditionalWrapper.className = "scrolly-traditional";

    traditionalElements.forEach(element => {
      traditionalWrapper.appendChild(element);

      Object.assign(element.style, {
        position: "relative",
        inset: "auto",
        width: "100%",
        display: "block",
        clipPath: "none",
        visibility: "visible",
        zIndex: "auto"
      });

      // Traditional SVG objects occupy one viewport.
      // Ordinary HTML elements retain their natural height.
      if (element.tagName.toLowerCase() === "object") {
        element.style.height = "100vh";
      } else {
        element.style.height = "auto";
      }
    });

    Object.assign(traditionalWrapper.style, {
      position: "relative",
      width: "100%",
      display: "block"
    });

    story.insertBefore(traditionalWrapper, visual);
  }

  // Capture the visual's original position in scroll coordinates.
  // Do this before scrolling, while the visual is not yet sticky.
  const scrollyStart =
    visual.getBoundingClientRect().top
    - slideElement.getBoundingClientRect().top
    + slideElement.scrollTop;

  sequences.forEach(sequence => {
    sequence.style.visibility = "visible";
    sequence.style.clipPath = "inset(0)";
  });
  // ==========================================
  // SVG LOADING
  // ==========================================

  function loadSVG(object, index) {
    return new Promise((resolve, reject) => {
      const timeout = 60000;
      const started = Date.now();
      let finished = false;
      let poll;

      const expectedURL = new URL(
        object.getAttribute("data"),
        document.baseURI
      ).href;

      function cleanup() {
        object.removeEventListener("load", check);
        object.removeEventListener("error", onError);
        clearInterval(poll);
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
        } catch {
          return;
        }

        if (!doc?.documentElement || doc.URL === "about:blank") {
          return;
        }

        const root = doc.documentElement;

        if (
          root.localName !== "svg" ||
          root.namespaceURI !== "http://www.w3.org/2000/svg"
        ) return;

        succeed(doc);
      }

      function onError() {
        fail(new Error(
          `Failed to load SVG ${index + 1}: ${expectedURL}`
        ));
      }

      object.addEventListener("load", check);
      object.addEventListener("error", onError);

      check();

      poll = setInterval(() => {
        if (finished) return;

        check();

        if (!finished && Date.now() - started > timeout) {
          fail(new Error(
            `Timed out waiting for SVG ${index + 1}: ${expectedURL}`
          ));
        }
      }, 100);
    });
  }

  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  function collectAnimations(doc) {
    const found = new Set();

    doc.getAnimations({ subtree: true }).forEach(animation => {
      found.add(animation);
    });

    doc.querySelectorAll("*").forEach(element => {
      if (typeof element.getAnimations !== "function") return;

      element.getAnimations().forEach(animation => {
        found.add(animation);
      });
    });

    return [...found].filter(animation => animation.effect);
  }

  async function prepareSVG(doc, index) {
    if (
      doc.URL === "about:blank" ||
      doc.documentElement?.localName !== "svg"
    ) {
      throw new Error(`SVG ${index + 1} is not ready`);
    }

    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }

    await nextFrame();
    await nextFrame();

    const elements = [...doc.querySelectorAll("*")];

    const getAnimatedElements = () =>
      elements.filter(element =>
        window.getComputedStyle(element).animationName !== "none"
      );

    let animatedElements = getAnimatedElements();
    let attempts = 0;

    while (animatedElements.length > 0 && attempts < 20) {
      if (collectAnimations(doc).length > 0) break;

      await new Promise(resolve => setTimeout(resolve, 50));

      animatedElements = getAnimatedElements();
      attempts++;
    }

    const animations = collectAnimations(doc);

    animations.forEach(animation => {
      animation.effect.updateTiming({ fill: "both" });
      animation.pause();
      animation.currentTime = 0;
    });

    const root = doc.documentElement;

    const smilAnimations = [
      ...doc.querySelectorAll(
        "animate, animateTransform, animateMotion, set"
      )
    ];

    const smilDuration = Math.max(
      0,
      ...smilAnimations.map(element => {
        const match = (element.getAttribute("dur") || "")
          .match(/^([\d.]+)\s*(ms|s|min)?$/);

        if (!match) return 0;

        const value = Number(match[1]);

        return match[2] === "ms" ? value / 1000
          : match[2] === "min" ? value * 60
            : value;
      })
    );

    root.pauseAnimations();
    root.setCurrentTime(0);

    return {
      doc,
      animations,
      smilAnimations,
      smilDuration
    };
  }

  let animationGroups;

  try {
    const documents = await Promise.all(
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

    slideElement.classList.remove("is-loading");
    return;
  }

  // ==========================================
  // TIMELINE
  // ==========================================

  const timingGroups = animationGroups.map(group =>
    group.animations.map(animation => {
      const timing = animation.effect.getTiming();
      const computed = animation.effect.getComputedTiming();

      const duration = Number.isFinite(computed.duration)
        ? computed.duration : 0;

      const iterations = Number.isFinite(timing.iterations)
        ? timing.iterations : 1;

      const delay = Number.isFinite(timing.delay)
        ? timing.delay : 0;

      return {
        duration,
        iterations,
        delay,
        endTime: Math.max(0, delay + duration * iterations)
      };
    })
  );

  let timelineStart = 0;

  const intervals = sequences.map((sequence, index) => {
    const type = sequence.dataset.scrollyType || "scroll";

    const duration = type === "motion" ? 1
      : Math.max(
        0.001,
        ...timingGroups[index].map(timing => timing.endTime),
        animationGroups[index].smilDuration * 1000
      ) / 1000;

    const transition =
      sequence.dataset.transitionAfter === "split" &&
        index < sequences.length - 1 ? 1 : 0;

    const interval = {
      start: timelineStart,
      duration,
      transition,
      type
    };

    timelineStart += duration + transition;

    return interval;
  });

  const totalScrollUnits = timelineStart;

  // ==========================================
  // NARRATIVE
  // ==========================================

  
  // ==========================================
  // NARRATIVE TIMING
  // ==========================================

  const stepPositions = steps.map(step => {
    const [sequenceValue, progressValue] =
      (step.dataset.at || "").split(":");

    const sequenceIndex = Number(sequenceValue);
    const sequenceProgress = Number(progressValue);

    if (
      !Number.isInteger(sequenceIndex) ||
      !Number.isFinite(sequenceProgress) ||
      sequenceProgress < 0 ||
      !intervals[sequenceIndex]
    ) {
      throw new Error(
        `Invalid data-at value: ${step.dataset.at}`
      );
    }

    const interval = intervals[sequenceIndex];
    return interval.start +
      sequenceProgress * interval.duration;
  });

  if (stepPositions.some((position, index) =>
    !Number.isFinite(position) ||
    (index > 0 && position <= stepPositions[index - 1])
  )) {
    throw new Error(
      "Narrative data-at values must increase."
    );
  }

  // ==========================================
  // STORY HEIGHT
  // ==========================================

  function setStoryHeight() {
    const vh = slideElement.clientHeight;

    const traditionalHeight =
      traditionalWrapper?.offsetHeight || 0;

    story.style.height =
      `${traditionalHeight + (totalScrollUnits + 1) * vh}px`;
  }

  setStoryHeight();

  // ==========================================
  // ANIMATION CONFIGURATION
  // ==========================================

  const motionStart = [
    { x: 100, y: 200 },
    { x: 100, y: 300 },
    { x: 100, y: 400 }
  ];

  const motionEnd = [
    { x: 800, y: 120 },
    { x: 650, y: 300 },
    { x: 800, y: 480 }
  ];

  const ease = p => p * p * (3 - 2 * p);

  // ==========================================
  // SCROLL UPDATE
  // ==========================================

  function updateScrolly() {
    ticking = false;
    if (destroyed) return;

    const vh = slideElement.clientHeight;
    if (!vh) return;

    const progress = getScrollyProgress();

    // Reset visibility and clipping.
    sequences.forEach((sequence, index) => {
      sequence.style.clipPath = "inset(0)";
      sequence.style.zIndex = index + 1;
      sequence.style.visibility = "hidden";
    });

    // ==========================================
    // SVG ANIMATIONS
    // ==========================================

    intervals.forEach((interval, index) => {
      const group = animationGroups[index];
      const sequence = sequences[index];

      const end = interval.start + interval.duration;

      const localProgress = clamp(
        (progress - interval.start) / interval.duration
      );

      const isLast = index === intervals.length - 1;

      const active =
        progress >= interval.start &&
        (progress < end || isLast);

      const transitioning =
        interval.transition > 0 &&
        progress >= end &&
        progress < end + interval.transition;

      const hideAfter = sequence.dataset.hideAfter === "true";

      if (active || (transitioning && !hideAfter)) {
        sequence.style.visibility = "visible";
      }

      // --------------------------------------
      // NORMAL SCROLL
      // --------------------------------------

      if (interval.type === "scroll") {
        group.animations.forEach((animation, i) => {
          const timing = timingGroups[index][i];

          animation.currentTime =
            timing.delay +
            localProgress * timing.duration * timing.iterations;
        });

        if (group.smilAnimations.length) {
          group.doc.documentElement.setCurrentTime(
            localProgress * interval.duration
          );
        }
      }

      // --------------------------------------
      // MOTION
      // --------------------------------------

      if (interval.type === "motion") {
        [".circle-1", ".circle-2", ".circle-3"].forEach(
          (selector, i) => {
            const circle = group.doc.querySelector(selector);
            if (!circle) return;

            circle.setAttribute(
              "cx",
              motionStart[i].x +
              (motionEnd[i].x - motionStart[i].x) * localProgress
            );

            circle.setAttribute(
              "cy",
              motionStart[i].y +
              (motionEnd[i].y - motionStart[i].y) * localProgress
            );
          }
        );
      }

      sequence.style.setProperty(
        "--sequence-progress",
        localProgress
      );
    });

    // ==========================================
    // SPLIT TRANSITIONS
    // ==========================================
    // The outgoing SVG remains intact.
    // The incoming SVG is revealed from bottom
    // to top using the original split effect.

    intervals.forEach((interval, index) => {
      if (!interval.transition) return;

      const transitionStart =
        interval.start + interval.duration;

      const transitionProgress = clamp(
        (progress - transitionStart) / interval.transition
      );

      if (
        progress < transitionStart ||
        progress >= transitionStart + interval.transition
      ) return;

      const outgoing = sequences[index];
      const incoming = sequences[index + 1];

      outgoing.style.visibility = "visible";
      outgoing.style.zIndex = index + 1;
      outgoing.style.clipPath = "inset(0)";

      incoming.style.visibility = "visible";
      incoming.style.zIndex = index + 2;

      incoming.style.clipPath =
        `inset(${(1 - transitionProgress) * 100}% 0 0 0)`;
    });
    
    // ==========================================
    // NARRATIVE POSITIONING
    // ==========================================

    steps.forEach((step, index) => {
      const start = stepPositions[index];
      const nextStart = stepPositions[index + 1];

      // The box crosses the viewport centre at its data-at position.
      const distanceFromCenter = (start - progress) * vh;

      step.style.transform =
        `translateY(${distanceFromCenter}px)`;

      const content = step.querySelector(".step-content");

      if (content) {
        content.style.visibility =
          nextStart === undefined || progress < nextStart
            ? "visible"
            : "hidden";
      }
    });
  }

  function getScrollyProgress() {
    const scrollTop = slideElement.scrollTop;
    const vh = slideElement.clientHeight;

    return Math.max(
      0,
      (scrollTop - scrollyStart) / vh
    );
  }

  // ==========================================
  // SCROLL SCHEDULING
  // ==========================================

  function requestUpdate() {
    if (ticking || destroyed) return;

    ticking = true;
    requestAnimationFrame(updateScrolly);
  }

  // ==========================================
  // EVENTS
  // ==========================================

  slideElement.addEventListener("scroll", requestUpdate, {
    passive: true
  });

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

    slideElement.removeEventListener("scroll", requestUpdate);
    resizeObserver.disconnect();

    animationGroups.forEach(group => {
      group.animations.forEach(animation => animation.pause());
      group.doc.documentElement.pauseAnimations();
    });
  };

  loader?.classList.add("hidden");
  slideElement.classList.remove("is-loading");

  updateScrolly();
}

async function initializeAixaBackground() {

  document.querySelectorAll('.aixa-slide .aixa-tool-name').forEach(name => {
    name.addEventListener('click', () => {
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

/* ==========================================
   MAGNIFYING SVGs
========================================== */

function initializeSVGMagnifier() {
  let activeObject = null;

  function findObject(x, y) {
    return [...document.querySelectorAll("object")].find(object => {
      const rect = object.getBoundingClientRect();

      return (
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom &&
        object.contentDocument?.documentElement?.localName === "svg"
      );
    }) || null;
  }

  function reset() {
    if (!activeObject) return;

    activeObject.style.transform = "";
    activeObject.style.transformOrigin = "";
    activeObject.style.zIndex = "";

    activeObject = null;
  }

  function update(event) {
    if (!event.ctrlKey && !event.metaKey) {
      reset();
      return;
    }

    const object = findObject(event.clientX, event.clientY);

    if (!object) {
      reset();
      return;
    }

    if (activeObject !== object) {
      reset();
      activeObject = object;
    }

    const rect = object.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    object.style.transformOrigin = `${x}% ${y}%`;
    object.style.transform = "scale(2)";
    object.style.zIndex = "9999";
  }

  function onKeyUp(event) {
    if (!event.ctrlKey && !event.metaKey) reset();
  }

  document.addEventListener("pointermove", update);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", reset);

  return () => {
    reset();
    document.removeEventListener("pointermove", update);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", reset);
  };
}

function checkScrollForNav() {
  const nav = document.querySelector('#navigation');

  if (!nav) return;
  nav.classList.toggle('nav-hidden', false);

  function handleScroll(event) {
    const target = event.target;

    const scrollTop = target === document
      ? (document.scrollingElement?.scrollTop || window.scrollY)
      : (target?.scrollTop || 0);

    nav.classList.toggle('nav-hidden', scrollTop > 3);
  }

  // ==========================================
  // SCROLLY END ACTIONS
  // ==========================================
  const story = document.querySelector(".scrolly-story");
  const endActions = document.getElementById("scrolly-end-actions");
  const backToTop = document.getElementById("back-to-top");

  function updateEndActions() {
    if (!story || !endActions) return;
    const storyBottom = story.getBoundingClientRect().bottom;
    const finished = storyBottom <= window.innerHeight + 2;
    endActions.classList.toggle("visible", finished);
  }

  backToTop?.addEventListener("click", () => {
    document.scrollTo({ top: 0 });
  });

  // Capture scroll events from nested slide containers as well.
  document.addEventListener('scroll', (e) => {
    handleScroll(e);
    updateEndActions();
  }, true);

  // Initial state.
  nav.classList.toggle(
    'nav-hidden',
    (document.scrollingElement?.scrollTop || window.scrollY) > 3
  );
}

async function loadProjectTemplate(name) {
  const response = await fetch(`./templates/${name}.html`);

  if (!response.ok) {
    throw new Error(`Failed to load ${name}`);
  }

  const html = await response.text();

  const container = document.createElement("div");
  container.innerHTML = html;

  const template = container.querySelector("template");

  if (!template) {
    throw new Error(`No template found in ${name}`);
  }

  document.querySelector("#slide-templates").appendChild(template);

  return template;
}

/* ==========================================
   INITIALIZE
========================================== */

await Promise.all([
  loadProjectTemplate("welcome"),
  loadProjectTemplate("about"),
  loadProjectTemplate("p1"),
  loadProjectTemplate("p2"),
  loadProjectTemplate("gallery")
]);

initializeCarousel();
checkScrollForNav();
const cleanupMagnifier = initializeSVGMagnifier();
targetSlide = currentSlide;

document.querySelectorAll(
  '.testimonial, .about-strength'
).forEach(card => {

  /* TOGGLES IN ABOUT */
  card.addEventListener('click', () => {
    const expanded = card.classList.toggle('is-expanded');

    if (card.matches('.about-strength')) {
      card.setAttribute('aria-expanded', expanded);
    }

    const toggle = card.querySelector('.testimonial-toggle');

    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded);
      toggle.textContent = expanded
        ? 'Show summary ↑'
        : 'Read full testimonial ↓';
    }
  });
});
