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
   CAROUSEL SETUP
========================================== */

const track = document.getElementById("track");
const leftSlide = document.getElementById("leftSlide");
const currentSlideEl = document.getElementById("currentSlide");
const rightSlide = document.getElementById("rightSlide");

const navItems = document.querySelectorAll(".nav-item");

let currentSlide = 1;
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

// console.log(
//   slide.title,
//   "Scroll height:", element.scrollHeight,
//   "Client height:", element.clientHeight,
//   "Scrollable:", element.scrollHeight > element.clientHeight
// );
  
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

function trackTouchEnd(e) {
  if (pointerInsideCanvas === true) {
    return;
  }

  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;

  const dx = touchStartX - touchEndX;
  const dy = touchStartY - touchEndY;

  // Horizontal swipes only
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    goToSlide(dx > 0 ? 1 : -1);
  }
}

track.addEventListener("touchend", trackTouchEnd, { passive: true });


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

let aixaActiveCleanup = null;
let aixaInitId = 0;
let pointerInsideCanvas = false;

async function initializeAixaBackground(clean = false) {

  document.querySelectorAll('.aixa-slide .aixa-tool-name').forEach(name => {
    name.addEventListener('touchstart', () => {
      name.closest('.aixa-tool').classList.toggle('closed');
    });
  });

  // Clean up previous instance
  if (aixaActiveCleanup) {
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
   INITIALIZE
========================================== */

targetSlide = currentSlide;
updateSlides();
