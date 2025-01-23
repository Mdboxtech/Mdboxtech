import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Add floating shapes
function addShape() {
  const geometry = new THREE.TetrahedronGeometry(Math.random() * 3);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x44aa88,
    wireframe: true 
  });
  const shape = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  shape.position.set(x, y, z);
  
  const rotation = Math.random() * 0.01;
  shape.userData.rotation = rotation;
  
  scene.add(shape);
  return shape;
}

const shapes = Array(20).fill().map(addShape);

// Add particles
function addParticles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 5000;
  const positions = new Float32Array(count * 3);
  
  for(let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x44aa88
  });
  
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  return particles;
}

const particles = addParticles();

// Project models
const projectModels = [];

function createDemoModel(type, position) {
  let geometry;
  switch(type) {
    case 'laptop':
      geometry = new THREE.BoxGeometry(3, 0.2, 2);
      break;
    case 'phone':
      geometry = new THREE.BoxGeometry(1, 2, 0.1);
      break;
    case 'tablet':
      geometry = new THREE.BoxGeometry(2, 1.5, 0.1);
      break;
  }
  
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x44aa88,
    metalness: 0.7,
    roughness: 0.2
  });
  
  const model = new THREE.Mesh(geometry, material);
  model.position.set(...position);
  scene.add(model);
  projectModels.push(model);
  return model;
}

const projectTypes = [
  { type: 'laptop', position: [0, 0, -10] },
  { type: 'phone', position: [10, 0, -10] },
  { type: 'tablet', position: [-10, 0, -10] }
];

projectTypes.forEach(project => {
  createDemoModel(project.type, project.position);
});

// Add loading manager
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');

loadingManager.onLoad = function() {
    loadingScreen.classList.add('fade-out');
};

// Add 3D text
const fontLoader = new FontLoader(loadingManager);
fontLoader.load(
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
  (font) => {
    const textGeometry = new TextGeometry('Portfolio', {
      font: font,
      size: 4.5,  // Increased from 3.5
      height: 0.7, // Increased from 0.5
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelOffset: 0,
      bevelSegments: 5
    });
    textGeometry.center();
    const textMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x44aa88,
      metalness: 0.8,
      roughness: 0.2
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = -12;
    textMesh.position.y = 2;
    
    // Add glow effect
    const textGlow = new THREE.PointLight(0x44aa88, 1.5, 6);
    textGlow.position.copy(textMesh.position);
    scene.add(textGlow);
    scene.add(textMesh);

    // Animate text
    function animateText() {
      textMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
      textGlow.position.copy(textMesh.position);
    }
    
    // Add text animation to main animation loop
    const originalAnimate = animate;
    animate = function() {
      originalAnimate();
      animateText();
    };
  }
);

// Scroll Animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}
document.body.onscroll = moveCamera;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  
  shapes.forEach(shape => {
    shape.rotation.x += shape.userData.rotation;
    shape.rotation.y += shape.userData.rotation;
  });

  particles.rotation.y += 0.0002;
  
  projectModels.forEach((model, index) => {
    model.rotation.y += 0.005;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
