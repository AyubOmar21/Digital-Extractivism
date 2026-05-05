let sfxInterval;
let isTransitioning = false;
let hasInitialized = false; // Flag to prevent audio overlap on first load

function changeEra(eraName) {
    isTransitioning = true; // Block hover effects
    
    const tooltip = document.getElementById('map-tooltip');
    tooltip.style.opacity = '0'; 
    tooltip.style.color = "";    

    // 1. STOP AUDIO
    clearInterval(sfxInterval);
    document.querySelectorAll('audio').forEach(track => {
        track.pause();
        track.currentTime = 0;
    });

    // 2. PLAY AMBIENT
    const amb = document.getElementById('amb-' + eraName);
    if (amb) {
        amb.volume = 1.0; // INCREASED VOLUME TO MAX
        amb.play().catch(e => console.log("Audio waiting for user interaction."));
    }

    // 3. SFX INTERVAL
    const sfx = document.getElementById('sfx-' + eraName);
    if (sfx) {
        sfxInterval = setInterval(() => {
            triggerSFX(sfx, eraName);
        }, Math.random() * (15000 - 6000) + 6000);
    }

    const map = document.getElementById('svg2');
    const title = document.getElementById('map-title');
    const description = document.getElementById('map-description');
    const dashboard = document.querySelector('.era-button'); 
    const allButtons = document.querySelectorAll('.era-button button');

    // 4. DIM UI
    map.style.opacity = '0';
    title.style.opacity = '0';
    description.style.opacity = '0';
    dashboard.style.opacity = '0'; 

    // 5. SWAP DATA
    setTimeout(() => {
        document.body.className = 'era-' + eraName;

        if (eraName === 'scramble') {
            title.innerText = "Gold, God, Glory";
            description.innerText = "A period of 'Effective Occupation' where European powers partitioned the continent to secure resources (Gold), spread religious influence (God), and project imperial power (Glory).";
        } 
        else if (eraName === 'present') {
            title.innerText = "Mines, Minerals, Market";
            description.innerText = "A period of 'Industrial Acceleration' where global powers compete to extract earth elements (Mines), refine high-tech components (Minerals), and dominate trade corridors (Markets).";
        } 
        else if (eraName === 'dark') {
            const sidebar = document.querySelector('.dark-track');
            if (sidebar) {
                sidebar.style.filter = "invert(1) brightness(2) contrast(3)";
                sidebar.style.transform = "translateX(10px) skew(20deg)";
                setTimeout(() => {
                    sidebar.style.filter = "";
                    sidebar.style.transform = "";
                }, 150); 
            }
            title.innerText = "Extraction, Exhaustion, Erasure";
            description.innerText = "Speculative future of 'Systemic Collapse' where Relentless demand leads to total resource depletion (Extraction), infrastructure breakdown (Exhaustion), and regional redaction (Erasure).";
        }

        allButtons.forEach(btn => {
            btn.classList.remove('active');
            
            // Check if the button is the one we want for the current era
            const btnText = btn.innerText.toLowerCase();
            
            if (eraName === 'dark' && btnText.includes('???')) {
                btn.classList.add('active');
            } else if (btnText.includes(eraName)) {
                btn.classList.add('active');
            }
        });

        // 6. FADE BACK IN & UNBLOCK HOVERS
        map.style.opacity = '1';
        title.style.opacity = '1';
        description.style.opacity = '1';
        dashboard.style.opacity = '1'; 
        
        isTransitioning = false; 
    }, 600); 
}

function triggerSFX(audioElement, era) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    // BOOSTED SFX VOLUMES
    audioElement.volume = (era === 'dark') ? 0.6 : 1.0; 
    audioElement.play();

    if (era === 'dark') {
        const targets = [
            document.getElementById('svg2'), 
            document.getElementById('map-title'), 
            document.getElementById('map-description'), 
            document.querySelector('.timeline-sidebar')
        ];
        targets.forEach(el => el?.classList.add('glitch-zap'));
        setTimeout(() => targets.forEach(el => el?.classList.remove('glitch-zap')), 150); 
    }
}

/* --- HOVER & ACTIVE STATE LOGIC --- */
const tooltip = document.getElementById('map-tooltip');

document.getElementById('svg2').addEventListener('mouseover', (e) => {
    if (isTransitioning) return; 

    const country = e.target.closest('path') || e.target.closest('g');
    if (!country) return;

    const targetNode = document.querySelector(`.node[data-region="${country.id}"]`);
    if (targetNode) {
        document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
        targetNode.classList.add('active');
    }

    let name = country.getAttribute('title') || country.getAttribute('data-tmp-title');
    if (name) {
        if (!country.getAttribute('data-tmp-title')) country.setAttribute('data-tmp-title', name);
        country.removeAttribute('title'); 
        
        if (document.body.classList.contains('era-dark')) {
            tooltip.innerText = name;
            tooltip.style.color = "#4294ff";
        } else {
            tooltip.innerText = name;
            tooltip.style.color = ""; 
        }
        tooltip.style.opacity = '1';
    }
});

document.getElementById('svg2').addEventListener('mouseout', (e) => {
    const country = e.target.closest('path') || e.target.closest('g');
    if (!country) return;

    // 1. Check which scene is currently active in the scroll
    const activeBlock = document.querySelector('.info-block.active');
    const currentScene = activeBlock ? activeBlock.getAttribute('data-scene') : 'intro';

    // 2. Extract the region from the scene (e.g., "scramble-west-coast" -> "west-coast")
    const focusedRegionId = currentScene.includes('-') ? currentScene.split('-').slice(1).join('-') : null;

    // 3. THE GUARD: If this is the focused region, STOP. Do not remove the highlight.
    if (country.id === focusedRegionId) {
        return; 
    }

    // --- Otherwise, proceed with normal cleanup for non-focused regions ---
    const targetNode = document.querySelector(`.node[data-region="${country.id}"]`);
    if (targetNode) targetNode.classList.remove('active');

    const name = country.getAttribute('data-tmp-title');
    if (name) {
        country.setAttribute('title', name);
        country.removeAttribute('data-tmp-title');
    }
    
    // Also remove the hover highlight class ONLY if it's not the focused one
    country.classList.remove('map-highlight');
    
    tooltip.style.opacity = '0';
});

document.getElementById('svg2').addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 20) + 'px';
    tooltip.style.top = (e.clientY + 20) + 'px';

    if (document.body.classList.contains('era-dark')) {
        const country = e.target.closest('path') || e.target.closest('g');
        const name = country ? (country.getAttribute('data-tmp-title') || country.getAttribute('title')) : "";

        if (Math.random() > 0.3) { 
            tooltip.innerText = "REDACTED: █ █ █";
            tooltip.style.color = "#ff0055"; 
        } else {
            tooltip.innerText = name;
            tooltip.style.color = "#4294ff"; 
        }
    }
});

document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('mouseenter', () => {
        if (isTransitioning) return;
        node.classList.add('active');
        
        const regionId = node.getAttribute('data-region');
        const region = document.getElementById(regionId);
        if (region) region.classList.add('map-highlight');

        // Only show label if NOT zoomed in (to match our previous cleanup)
        const activeBlock = document.querySelector('.info-block.active');
        const isZoomed = activeBlock && activeBlock.getAttribute('data-scene') !== 'intro';
        
        if (!isZoomed) {
            const label = document.querySelector(`.region-label[data-region="${regionId}"]`);
            if (label) label.classList.add('active');
        }
    });

    node.addEventListener('mouseleave', () => {
        const regionId = node.getAttribute('data-region');
        
        // 1. Check current scroll focus
        const activeBlock = document.querySelector('.info-block.active');
        const currentScene = activeBlock ? activeBlock.getAttribute('data-scene') : 'intro';
        const focusedRegionId = currentScene.includes('-') ? currentScene.split('-').slice(1).join('-') : null;

        // 2. THE GUARD: If this node belongs to the zoomed region, don't remove the highlight
        if (regionId === focusedRegionId) {
            // Keep node active and map highlighted
            return; 
        }

        // --- Normal cleanup for other nodes ---
        node.classList.remove('active');
        const region = document.getElementById(regionId);
        if (region) region.classList.remove('map-highlight');

        const label = document.querySelector(`.region-label[data-region="${regionId}"]`);
        if (label) label.classList.remove('active');
    });
});

/* --- INITIALIZATION LOGIC --- */
function initApp() {
    if (hasInitialized) return; // Stop if already started
    hasInitialized = true;
    changeEra('scramble');
}

// 1. Try to play immediately on page load
window.addEventListener('load', initApp);

// 2. Failsafe: Play on first click (because browsers block autoplay)
document.addEventListener('click', () => {
    initApp();
}, { once: true });



/**
 * THE BERLIN BLUEPRINT: CAMERA CONTROLLER
 * This script pans/zooms the map without changing its physical size.
 */

const map = document.getElementById('svg2');
const blocks = document.querySelectorAll('.info-block');

// 1. CAPTURE ORIGINAL DIMENSIONS
// We grab the width/height of your original "perfect" viewBox to prevent shrinking.
const originalVB = map.viewBox.baseVal;
const origW = originalVB.width;
const origH = originalVB.height;

/**
 * 2. DEFINE SCENES
 * Format: [X_Offset, Y_Offset, Zoom_Level]
 * Zoom_Level: 1 is full view, 0.5 is 2x zoom, 0.25 is 4x zoom.
 * We multiply original width/height by the zoom level to keep the ratio perfect.
 */
const scenes = {
    'intro': [0, 0, 1],
    'scramble-west-coast': [10, 20, 0.5],       // Move left/down, zoom in to 60%
    /*'transition-1': [15, 20, 0.5],      // Slight pan */
    'scramble-central-basin': [90, 80, 0.4],    // Move to center, zoom in to 50%
    'scramble-southern-frontier': [90, 130, 0.4], // Move to bottom, zoom in to 50%
    'intro': [0, 0, 1],
    // Transition pulls the camera all the way out
    'era-transition': [0, 0, 1],
    // Present era zooms (slightly different coordinates/zoom for a "Satellite" feel)
    'present-west-coast': [5, 15, 0.45],
    'present-central-basin': [85, 75, 0.35],
    'present-southern-frontier': [90, 130, 0.4],

    'dark-transition': [0, 0, 1],
    'dark-west-coast': [10, 20, 0.5],
    'dark-central-basin': [90, 80, 0.4],
    'dark-southern-frontier': [90, 130, 0.4]

};


/**
 * THE GLOW CONTROLLER
 * Manages which map region and timeline node are active.
 */
const updateRegionGlow = (sceneName) => {
    // 1. Reset everything
    document.querySelectorAll('.region-group').forEach(rg => rg.classList.remove('map-highlight'));
    document.querySelectorAll('.region-label').forEach(rl => rl.classList.remove('active'));
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active', 'pulse'));

    if (!sceneName || !sceneName.includes('-')) return;

    // 2. Extract Era and Region (e.g., "scramble-west-coast")
    const parts = sceneName.split('-');
    const era = parts[0];
    const regionId = parts.slice(1).join('-'); 

    // 3. Highlight the Map Region
    const targetRegion = document.getElementById(regionId);
    if (targetRegion) {
        targetRegion.classList.add('map-highlight');
    }

    // 4. Highlight & Pulse the Timeline Node
    const nodeSelector = `.node[data-era="${era}"][data-region="${regionId}"]`;
    const targetNode = document.querySelector(nodeSelector);
    if (targetNode) {
        targetNode.classList.add('active', 'pulse');
    }
};

// 3. THE CAMERA ENGINE
let animationId = null;

/**
 * THE CAMERA ENGINE: SMOOTH GLIDE
 * Animates the viewBox from current position to the target scene.
 */
const updateCamera = (sceneName) => {
    const data = scenes[sceneName];
    if (!data || !origW) return;

    const [targetX, targetY, zoom] = data;
    const targetW = origW * zoom;
    const targetH = origH * zoom;

    // 1. Get the current viewBox values to start from
    const currentVB = map.getAttribute('viewBox').split(' ').map(Number);
    const startX = currentVB[0];
    const startY = currentVB[1];
    const startW = currentVB[2];
    const startH = currentVB[3];

    const duration = 1500; // Duration in milliseconds (1.5s)
    const startTime = performance.now();

    // Cancel any ongoing animation to prevent "fighting"
    if (animationId) cancelAnimationFrame(animationId);

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function: Cubic Out (Starts fast, slows down gently)
        const ease = 1 - Math.pow(1 - progress, 3);

        // Interpolate values
        const x = startX + (targetX - startX) * ease;
        const y = startY + (targetY - startY) * ease;
        const w = startW + (targetW - startW) * ease;
        const h = startH + (targetH - startH) * ease;

        map.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        }
    }

    animationId = requestAnimationFrame(animate);
    
    // Keep your highlight logic running alongside the move
    updateRegionGlow(sceneName);
};



// 4. THE OBSERVER (The Brain of the Scroll)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // We only care when a block is entering the "active" zone
        if (entry.isIntersecting) {
            const sceneName = entry.target.getAttribute('data-scene');
            const bodyClass = document.body.className;
            // Get the specific country ID from the HTML (e.g., "SN" or "CD")
            const anchorId = entry.target.getAttribute('data-anchor'); 

            // --- 0. LABEL & PATH HIGHLIGHTING ---
            // Hide all labels and remove previous landmass highlights first
            document.querySelectorAll('.map-label-text').forEach(el => el.classList.remove('visible'));
            document.querySelectorAll('path').forEach(p => p.classList.remove('active-node'));

            // If this section has an anchor, show the corresponding label and highlight the map
            if (anchorId) {
                const targetLabel = document.getElementById(`label-${anchorId}`);
                const targetPath = document.getElementById(anchorId);
                
                if (targetLabel) targetLabel.classList.add('visible');
                if (targetPath) targetPath.classList.add('active-node');
            }

            // --- 1. ERA TRIGGERS (With a Safety Guard) ---
            if (!isTransitioning) {
                if (sceneName.startsWith('scramble') || sceneName === 'intro') {
                    if (!bodyClass.includes('era-scramble')) changeEra('scramble');
                } 
                else if (sceneName.startsWith('present') || sceneName === 'era-transition') {
                    if (!bodyClass.includes('era-present')) changeEra('present');
                } 
                else if (sceneName.startsWith('dark') || sceneName === 'dark-transition') {
                    if (!bodyClass.includes('era-dark')) changeEra('dark');
                }
            }

            // --- 2. CAMERA & UI (Always Update These) ---
            blocks.forEach(b => b.classList.remove('active'));
            entry.target.classList.add('active');
            updateCamera(sceneName);

            // --- 3. TIMELINE NODES ---
            document.querySelectorAll('.node').forEach(n => n.classList.remove('active', 'pulse'));
            
            if (sceneName && sceneName.includes('-')) {
                const [era, ...regionParts] = sceneName.split('-');
                const regionId = regionParts.join('-');
                
                const targetNode = document.querySelector(`.node[data-era="${era}"][data-region="${regionId}"]`);
                if (targetNode) targetNode.classList.add('active', 'pulse');
            }
        }
    });
}, { 
    threshold: 0.3 
});

blocks.forEach(block => observer.observe(block));

blocks.forEach(block => observer.observe(block));


const nodes = document.querySelectorAll('.node');

nodes.forEach(node => {
    node.addEventListener('click', () => {
        // 1. Get the Era from the parent 'track-segment' class
        const parentSegment = node.closest('.track-segment');
        let era = "";
        
        if (parentSegment.classList.contains('era-scramble')) era = "scramble";
        else if (parentSegment.classList.contains('era-present')) era = "present";
        else if (parentSegment.classList.contains('era-dark')) era = "dark";

        // 2. Get the Region
        const region = node.getAttribute('data-region');

        // 3. Construct the unique ID (Matches the info-block data-scene)
        const uniqueTarget = `${era}-${region}`;
        
        // 4. Find and Scroll
        const targetSection = document.querySelector(`.info-block[data-scene="${uniqueTarget}"]`);

        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        } else {
            console.error(`Target scene "${uniqueTarget}" not found! Check your data-scene attributes.`);
        }
    });
});


// Image Expansion Logic
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("expanded-image");
const captionText = document.getElementById("modal-caption");

// Updated Image Expansion Logic
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('era-image')) {
        modal.style.display = "flex";
        modalImg.src = e.target.src;
        
        // Grab the text from the sibling figcaption instead of the alt text
        const captionNode = e.target.parentElement.querySelector('.image-caption');
        captionText.innerHTML = captionNode ? captionNode.innerText : "Archive File";
    }
    
    if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
        modal.style.display = "none";
    }
});