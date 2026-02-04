import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// --- Data ---
const projects = [
    {
        id: 1,
        title: 'Water Pump',
        description: 'High fidelity industrial 3D model.',
        model: '/projects/water_pump.glb',
        color: 'from-blue-600 to-cyan-500',
        video: '/videos/water_pump.mp4'
    },
    {
        id: 2,
        title: 'F1 Racing Tyre',
        description: 'High performance soft compound tyre.',
        model: '/projects/f1_tyre.glb',
        color: 'from-red-600 to-orange-500', // F1-like colors
        video: '/videos/f1_tyre.mp4'
    },
    {
        id: 3,
        title: 'Nox Racket',
        description: 'Professional padel racket visualization.',
        model: '/projects/nox_racket.glb',
        color: 'from-slate-900 to-red-600', // Nox style: Carbon/Red
        video: '/videos/nox_padel.mp4'
    },
    {
        id: 4,
        title: 'Old Fire Extinguisher',
        description: 'Vintage industrial safety equipment.',
        model: '/projects/fire.glb',
        color: 'from-orange-700 to-red-800', // Vintage/Rustic Red
        video: '/videos/fire-extinguisher.mp4'
    }
];

// --- Three.js Variables ---
let scene, camera, renderer, controls, animationId;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initProjects();
    initSmoothScroll();
    initModalEvents();
});

function initProjects() {
    const grid = document.getElementById('project-grid');
    const modal = document.getElementById('viewer-modal');
    const canvasContainer = document.getElementById('canvas-container');
    const modalTitle = document.getElementById('modal-title');

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = `group relative h-96 rounded-2xl overflow-hidden cursor-pointer bg-[#212121] border border-transparent hover:border-brand-accent/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.2)]`;

        let backgroundContent = `<div class="absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity"></div>`;
        if (project.video) {
            backgroundContent = `<video src="${project.video}" autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-contain group-hover:opacity-80 transition-opacity"></video>`;
        }

        card.innerHTML = `
            ${backgroundContent}
        
            <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h4 class="text-2xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 capitalize">${project.title}</h4>
                <p class="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">${project.description}</p>
            </div>
        `;

        if (project.model) {
            card.addEventListener('click', () => {
                modal.classList.remove('opacity-0', 'pointer-events-none');
                modalTitle.innerText = project.title;
                initThree(project.model, canvasContainer);
            });
        } else {
            card.classList.add('opacity-75', 'hover:opacity-100');
        }

        grid.appendChild(card);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initModalEvents() {
    const modal = document.getElementById('viewer-modal');
    const closeBtn = document.getElementById('close-viewer');

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => disposeThree(), 500);
    });
}

// --- Three.js Logic ---

function initThree(modelPath, container) {
    if (renderer) disposeThree();

    const loader = document.getElementById('loader');

    try {
        // 1. Setup Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222); // Solid dark background

        // 2. Setup Camera
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(8, 5, 8); // Corner view
        camera.lookAt(0, 0, 0);

        // 3. Setup Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Solid canvas
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0; // Standard exposure for better saturation
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        // 4. Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Limit Zoom
        controls.minDistance = 6.5;
        controls.maxDistance = 15;

        // 5. Environment & Lights (Rich Studio Setup)
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

        // 3-Point Studio Lighting (Balanced for Richness)
        // Lower ambient = Darker shadows = "Richer" look
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5); // Main
        keyLight.position.set(5, 10, 7.5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.7); // Subtle Fill
        fillLight.position.set(-5, 5, 5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 1.0); // Edge definition
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);


        // Debug Helpers - Removed for Studio Look
        // scene.add(new THREE.AxesHelper(10));
        // scene.add(new THREE.GridHelper(20, 20));

        // 6. Load Model
        loader.style.display = 'flex';
        const gltfLoader = new GLTFLoader();

        gltfLoader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            console.log("Model loaded");

            // Normalize Scale to ~5 units
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            let scaleFactor = 5.0 / maxDim;
            if (!isFinite(scaleFactor) || scaleFactor === 0) scaleFactor = 1.0;
            model.scale.setScalar(scaleFactor);

            // Re-calc box to adjust position
            // We want to sit ON the floor (Y=0)
            const newBox = new THREE.Box3().setFromObject(model);
            const center = newBox.getCenter(new THREE.Vector3());

            // Center X and Z
            model.position.x += -center.x;
            model.position.z += -center.z;
            // Sit on floor (Move bottom to 0)
            model.position.y += -newBox.min.y;

            scene.add(model);

            // 4. Update Controls Target to Center of Model
            // Now that model is on floor, get its new center
            const finalBox = new THREE.Box3().setFromObject(model);
            const finalCenter = finalBox.getCenter(new THREE.Vector3());

            controls.target.copy(finalCenter);
            controls.update();

            console.log("Controls Target set to:", finalCenter);

            loader.style.display = 'none';

        }, undefined, (error) => {
            console.error(error);
            loader.innerHTML = `<p class='text-red-500'>Error: ${error.message}</p>`;
        });

        // 7. Interaction: Double Click to Focus
        renderer.domElement.addEventListener('dblclick', (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(scene, true); // Recursive

            if (intersects.length > 0) {
                const point = intersects[0].point;
                console.log("Focusing on:", point);

                // Smoothly move target
                controls.target.copy(point);
                controls.update();
            }
        });

        // 8. Start Loop
        animate();
        window.addEventListener('resize', onWindowResize);

    } catch (e) {
        console.error(e);
        loader.innerHTML = `<p class='text-red-500'>Error: ${e.message}</p>`;
    }
}

function onWindowResize() {
    if (!camera || !renderer) return;
    const container = document.getElementById('canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function disposeThree() {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onWindowResize);
    if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
    }
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
}
