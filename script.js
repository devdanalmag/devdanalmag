// Mobile Touch & Responsive Logic with View State

const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");
const endMessage = document.querySelector("#end-message");
const pageFlipSound = document.querySelector("#page-flip-sound");
const projectCards = document.querySelectorAll(".project-card");
const projectDetail = document.querySelector("#project-detail");
const projectDetailTitle = document.querySelector("#project-detail-title");
const projectDetailDescription = document.querySelector("#project-detail-description");
const projectDetailStack = document.querySelector("#project-detail-stack");
const projectDetailLikes = document.querySelector("#project-detail-likes");
const projectDetailImg = document.querySelector("#project-detail-img");
const projectDetailClose = document.querySelector("#project-detail-close");

const papers = [
    document.querySelector("#p1"),
    document.querySelector("#p2"),
    document.querySelector("#p3"),
    document.querySelector("#p4")
];

const projectInfo = {
    "hashswap": {
        title: "HashSwap Front-End Platform",
        description: "A sleek, decentralized exchange interface that lets users effortlessly swap tokens, provide liquidity, and monitor pool performance in real time. Built for the ultra-fast, low-fee Hedera Network, it delivers a buttery-smooth Web3 experience on both desktop and mobile.",
        stack: "React • Tailwind • TypeScript • Web3.js",
        image: "img/projects/hashswap.png",
        likes: "132 likes",
        demoLink: "https://hedera-swap-ui.vercel.app/"
    },
    "onchainng": {
        title: "Onchain NG",
        description: "A sleek on-chain hub for everyday payments—airtime, data bundles, P2P transfers and more—wrapped in a fast, mobile-first experience.",
        stack: "PHP • Ether.js • REST/WebSocket APIs",
        image: "img/projects/onchainng.png",
        likes: "98 likes",
        demoLink: "https://onchain.com.ng"
    },
    "kaminova": {
        title: "Kaminova Labs",
        description: "Full-stack web platform for Kaminova Labs—publish projects, announce events, and showcase every initiative under the Kaminova umbrella. Features an admin dashboard, real-time updates, and a clean, responsive UI that scales from desktop to mobile.",
        stack: "PHP • MySQL • HTML • JS",
        image: "img/projects/kaminova.png",
        likes: "76 likes",
        demoLink: "https://kaminovaglobal.com"
    },
    "energymeter": {
        title: "IOT Smart Energy Meter",
        description: "A smart energy meter that monitors and controls home devices using IoT sensors and a mobile app interface.",
        stack: "IoT Devices • React Native • Node.js",
        image: "img/projects/energymeter.png",
        likes: "120 likes",
        demoLink: "#"
    },
    "memecoinsite": {
        title: "WLDG Token Website",
        description: "A sleek, responsive landing page for the WORLD DOG COMMUNITY token—showcasing tokenomics, roadmap, community perks, and real-time price stats. Built with Next.js, hosted on IPFS for permanence, and wired to Web3 wallets for seamless claiming and staking.",
        stack: "HTML • CSS • JS",
        image: "img/projects/memecoinsite.png",
        likes: "89 likes",
        demoLink: "https://wldgtoken.vercel.app/"
    },
    "pcbdesign": {
        title: "Inverter PCB Design",
        description: "A complete 24 V to 220 V AC pure-sine inverter engineered from initial circuit concept through schematic capture, component selection, thermal modeling, and four-layer PCB layout. Features galvanic isolation, over-current / over-temperature protection, and a custom DSP-controlled MPPT stage for solar input. Delivered as a fully assembled and tested board with BOM, Gerbers, and enclosure design files.",
        stack: "PCB • Circute • Design",
        image: "img/projects/pcb1.png",
        likes: "64 likes",
        demoLink: "#"
    }
};

let currentLocation = 1;
let numOfPapers = 4;
let maxLocation = numOfPapers + 1;

// Mobile View State: false = viewing Right (Front), true = viewing Left (Back)
let isMobileViewLeft = false;

// Helpers
function isMobile() {
    return window.innerWidth <= 600;
}

function updateMobileView() {
    if (isMobileViewLeft) {
        book.classList.add('view-left');
    } else {
        book.classList.remove('view-left');
    }
}

function playPageSound() {
    if (pageFlipSound) {
        pageFlipSound.currentTime = 0;
        pageFlipSound.play().catch(e => {
            // Ignore auto-play errors
        });
    }
}

function updateButtons() {
    // Determine if we are at the end
    let isEnd = false;
    if (isMobile()) {
        if (currentLocation >= maxLocation && isMobileViewLeft) isEnd = true;
    } else {
        if (currentLocation >= maxLocation) isEnd = true;
    }

    // Determine if we are at the start
    let isStart = false;
    if (currentLocation === 1) {
        if (isMobile()) {
            if (!isMobileViewLeft) isStart = true;
        } else {
            isStart = true;
        }
    }

    if (isStart) {
        prevBtn.disabled = true;
        book.classList.remove("open");
        book.classList.remove("close-end");
    } else {
        prevBtn.disabled = false;
    }

    if (isEnd) {
        nextBtn.disabled = true;
        endMessage.classList.add("show");
        book.classList.remove("open");
        book.classList.add("close-end");
    } else {
        nextBtn.disabled = false;
        endMessage.classList.remove("show");
        if (!isStart) {
            book.classList.add("open");
            book.classList.remove("close-end");
        }
    }

    // --- BORDER MANAGEMENT ---
    // Remove borders at the very beginning and very end
    if (isStart || isEnd) {
        book.style.borderLeft = "none";
        book.style.borderRight = "none";
        book.style.borderTop = "none";
    } else {
        // Show 3D borders when open
        book.style.borderLeft = "2px solid #888";
        book.style.borderRight = "5px solid #b0afaf";
        book.style.borderTop = "2px solid aliceblue";
    }
}

// Touch Handling
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) goNextPage();
    if (touchEndX > touchStartX + 50) goPrevPage();
}

function openBook() {
    book.classList.add("open");
}

function closeBook(isAtBeginning) {
    book.classList.remove("open");
    // State handled by updateButtons
}

function goNextPage() {
    // Check constraints before acting
    if (isMobile()) {
        if (currentLocation >= maxLocation && isMobileViewLeft) return;
    } else {
        if (currentLocation >= maxLocation) return;
    }

    if (isMobile()) {
        // --- MOBILE LOGIC ---
        // If viewing Front (Right), we Flip + Shift to Left
        if (!isMobileViewLeft) {
            // Flip the current page if not flipped
            if (currentLocation < maxLocation) {
                playPageSound();
                switch (currentLocation) {
                    case 1:
                        openBook();
                        papers[0].classList.add("flipped");
                        papers[0].style.zIndex = 1;
                        break;
                    case 2:
                        papers[1].classList.add("flipped");
                        papers[1].style.zIndex = 2;
                        break;
                    case 3:
                        papers[2].classList.add("flipped");
                        papers[2].style.zIndex = 3;
                        break;
                    case 4:
                        papers[3].classList.add("flipped");
                        papers[3].style.zIndex = 4;
                        closeBook(false);
                        break;
                }
                currentLocation++;
                isMobileViewLeft = true; // Now viewing back
                updateMobileView();
            }
        } else {
            // If viewing Back (Left), we shift to Right (Next Front)
            // No page flip needed, just view shift
            isMobileViewLeft = false;
            updateMobileView();
        }
    } else {
        // --- DESKTOP LOGIC ---
        if (currentLocation < maxLocation) {
            playPageSound();
            switch (currentLocation) {
                case 1:
                    openBook();
                    papers[0].classList.add("flipped");
                    papers[0].style.zIndex = 1;
                    break;
                case 2:
                    papers[1].classList.add("flipped");
                    papers[1].style.zIndex = 2;
                    break;
                case 3:
                    papers[2].classList.add("flipped");
                    papers[2].style.zIndex = 3;
                    break;
                case 4:
                    papers[3].classList.add("flipped");
                    papers[3].style.zIndex = 4;
                    closeBook(false);
                    break;
            }
            currentLocation++;
        }
    }
    updateButtons();
}

function goPrevPage() {
    // Check constraints before acting
    if (currentLocation === 1) {
        if (isMobile()) {
            if (!isMobileViewLeft) return;
        } else {
            return;
        }
    }

    if (isMobile()) {
        // --- MOBILE PREV LOGIC ---
        if (isMobileViewLeft) {
            // If viewing Left (Back), we want to see the Front (Right) of the SAME spread.
            // But we must UNFLIP the previous page?
            // No, if we are at Loc 2 (P1 Back), and we want to go Prev.
            // Loc 2 Left view = P1 Back.
            // Prev -> Loc 1 Left view? No, Loc 1 is Cover (Front).

            // Logic:
            // Forward: Loc 1 Right -> Loc 2 Left -> Loc 2 Right -> Loc 3 Left -> ...
            // Backward: ... -> Loc 3 Left -> Loc 2 Right -> Loc 2 Left -> Loc 1 Right

            // Current: Loc 2 Left (P1 Back).
            // Prev -> Loc 1 Right (P1 Front).
            // This requires Unflipping P1. And decrementing Location.

            // Wait, my mapping was:
            // Loc 1: Right (P1-F)
            // Loc 2: Left (P1-B), Right (P2-F)

            // If I am Loc 2 Left. Prev -> Loc 1 Right.
            // Action: Unflip P1. Set Loc 1. Set View Right.

            playPageSound();
            switch (currentLocation) {
                case 2:
                    closeBook(true);
                    papers[0].classList.remove("flipped");
                    papers[0].style.zIndex = 4;
                    break;
                case 3:
                    papers[1].classList.remove("flipped");
                    papers[1].style.zIndex = 3;
                    break;
                case 4:
                    papers[2].classList.remove("flipped");
                    papers[2].style.zIndex = 2;
                    break;
                case 5:
                    openBook();
                    papers[3].classList.remove("flipped");
                    papers[3].style.zIndex = 1;
                    break;
            }
            currentLocation--;
            isMobileViewLeft = false; // Go to Right view of previous spread
            updateMobileView();

        } else {
            // If viewing Right (Front).
            // E.g. Loc 2 Right (P2 Front).
            // Prev -> Loc 2 Left (P1 Back).
            // Just view shift.
            if (currentLocation > 1) {
                isMobileViewLeft = true;
                updateMobileView();
            }
        }

    } else {
        // --- DESKTOP PREV LOGIC ---
        if (currentLocation > 1) {
            playPageSound();
            switch (currentLocation) {
                case 2:
                    closeBook(true);
                    papers[0].classList.remove("flipped");
                    papers[0].style.zIndex = 4;
                    break;
                case 3:
                    papers[1].classList.remove("flipped");
                    papers[1].style.zIndex = 3;
                    break;
                case 4:
                    papers[2].classList.remove("flipped");
                    papers[2].style.zIndex = 2;
                    break;
                case 5:
                    openBook();
                    papers[3].classList.remove("flipped");
                    papers[3].style.zIndex = 1;
                    break;
            }
            currentLocation--;
        }
    }
    updateButtons();
}

// Init Z-Index
papers[0].style.zIndex = 4;
papers[1].style.zIndex = 3;
papers[2].style.zIndex = 2;
papers[3].style.zIndex = 1;

// Init Buttons
updateButtons();

// Event Listeners
prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);
document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") goNextPage();
    if (e.key === "ArrowLeft") goPrevPage();
});

// Resize handler to reset mobile state if needed
window.addEventListener('resize', () => {
    if (!isMobile()) {
        book.classList.remove('view-left');
        isMobileViewLeft = false;
        // Also reset buttons just in case
        updateButtons();
    } else {
        updateMobileView();
        updateButtons();
    }
});

function openProjectDetail(id) {
    const info = projectInfo[id];
    if (!info) return;

    projectDetailTitle.textContent = info.title;
    projectDetailDescription.textContent = info.description;
    projectDetailStack.textContent = info.stack;
    projectDetailLikes.textContent = info.likes;
    projectDetailImg.src = info.image;
    projectDetailImg.alt = info.title;

    // Handle demo link
    const demoLink = document.querySelector("#project-demo-link");
    if (demoLink) {
        if (info.demoLink && info.demoLink !== "#") {
            demoLink.href = info.demoLink;
            demoLink.style.display = "inline-flex";
        } else {
            demoLink.style.display = "none";
        }
    }

    // Store current image for fullscreen
    projectDetail.setAttribute("data-current-image", info.image);
    projectDetail.setAttribute("data-current-title", info.title);

    projectDetail.classList.add("show");
    playPageSound();
}

function closeProjectDetail() {
    if (!projectDetail) return;
    projectDetail.classList.remove("show");
}

// Fullscreen Image Viewer
const fullscreenViewer = document.querySelector("#fullscreen-viewer");
const fullscreenImg = document.querySelector("#fullscreen-img");
const fullscreenCaption = document.querySelector("#fullscreen-caption");
const fullscreenClose = document.querySelector("#fullscreen-close");
const projectImageContainer = document.querySelector("#project-image-container");
const projectFullimageBtn = document.querySelector("#project-fullimage-btn");

function openFullscreenViewer(imageSrc, caption) {
    if (!fullscreenViewer || !fullscreenImg) return;
    fullscreenImg.src = imageSrc;
    fullscreenImg.alt = caption;
    if (fullscreenCaption) {
        fullscreenCaption.textContent = caption;
    }
    fullscreenViewer.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeFullscreenViewer() {
    if (!fullscreenViewer) return;
    fullscreenViewer.classList.remove("show");
    document.body.style.overflow = "";
}

// Event Listeners for Project Cards
projectCards.forEach(card => {
    const id = card.getAttribute("data-project-id");
    card.addEventListener("click", () => openProjectDetail(id));
});

// Close project detail
if (projectDetailClose) {
    projectDetailClose.addEventListener("click", () => closeProjectDetail());
}

if (projectDetail) {
    projectDetail.addEventListener("click", (e) => {
        if (e.target === projectDetail) {
            closeProjectDetail();
        }
    });
}

// Click on image container to open fullscreen
if (projectImageContainer) {
    projectImageContainer.addEventListener("click", () => {
        const imageSrc = projectDetail.getAttribute("data-current-image");
        const caption = projectDetail.getAttribute("data-current-title");
        if (imageSrc) {
            openFullscreenViewer(imageSrc, caption);
        }
    });
}

// Full Image button
if (projectFullimageBtn) {
    projectFullimageBtn.addEventListener("click", () => {
        const imageSrc = projectDetail.getAttribute("data-current-image");
        const caption = projectDetail.getAttribute("data-current-title");
        if (imageSrc) {
            openFullscreenViewer(imageSrc, caption);
        }
    });
}

// Close fullscreen viewer
if (fullscreenClose) {
    fullscreenClose.addEventListener("click", closeFullscreenViewer);
}

if (fullscreenViewer) {
    fullscreenViewer.addEventListener("click", (e) => {
        if (e.target === fullscreenViewer) {
            closeFullscreenViewer();
        }
    });
}

// Keyboard support
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (fullscreenViewer && fullscreenViewer.classList.contains("show")) {
            closeFullscreenViewer();
        } else {
            closeProjectDetail();
        }
    }
});

// ==================== 3D MOUSE-TRACKING PARALLAX TILT ====================
(function() {
    const bookEl = document.querySelector('#book');
    if (!bookEl) return;

    let tiltX = 0, tiltY = 0;
    let targetTiltX = 0, targetTiltY = 0;
    const MAX_TILT = 8; // degrees

    function animateTilt() {
        // Smooth interpolation
        tiltX += (targetTiltX - tiltX) * 0.08;
        tiltY += (targetTiltY - tiltY) * 0.08;

        // Set CSS custom properties — these compose WITH class-based transforms
        bookEl.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        bookEl.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');

        requestAnimationFrame(animateTilt);
    }

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 600) return; // Skip on mobile

        const rect = bookEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalized -1 to 1
        const normX = (e.clientX - centerX) / (window.innerWidth / 2);
        const normY = (e.clientY - centerY) / (window.innerHeight / 2);

        targetTiltY = normX * MAX_TILT;
        targetTiltX = -normY * MAX_TILT;
    });

    document.addEventListener('mouseleave', () => {
        targetTiltX = 0;
        targetTiltY = 0;
    });

    // Start the animation loop
    requestAnimationFrame(animateTilt);
})();

// ==================== FLOATING GOLD PARTICLE SYSTEM ====================
(function() {
    const canvas = document.querySelector('#particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.3 - 0.15; // slight upward drift
            this.opacity = Math.random() * 0.6 + 0.1;
            this.targetOpacity = this.opacity;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.glowSize = this.size * (3 + Math.random() * 3);
            // Gold color variations
            const hue = 38 + Math.random() * 15; // 38-53 range (gold)
            const sat = 60 + Math.random() * 30;
            const light = 50 + Math.random() * 20;
            this.color = `hsla(${hue}, ${sat}%, ${light}%,`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Fade in/out organically
            if (Math.random() < 0.01) {
                this.targetOpacity = Math.random() * 0.6 + 0.1;
            }
            this.opacity += (this.targetOpacity - this.opacity) * this.fadeSpeed;

            // Wrap around edges
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }
        draw() {
            // Outer glow
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.glowSize
            );
            gradient.addColorStop(0, this.color + (this.opacity * 0.8) + ')');
            gradient.addColorStop(0.4, this.color + (this.opacity * 0.2) + ')');
            gradient.addColorStop(1, this.color + '0)');
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Core bright dot
            ctx.beginPath();
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.update();
            p.draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
})();
