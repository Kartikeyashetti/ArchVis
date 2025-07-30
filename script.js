import * as THREE from 'three';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// import { PathTracingRenderer, PhysicalPathTracingMaterial } from 'three-gpu-pathtracer';
import { PathTracingRenderer, PhysicalPathTracingMaterial } from 'three-gpu-pathtracer/build/index.module.js';
import { GUI } from 'dat.gui';


// Create a scene
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xaaaaaa, 0.1); // (color, density)


// Set up a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Set up a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true,
	 powerPreference: "high-performance",
	logarithmicDepthBuffer: true, });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.physicallyCorrectLights = true; 
	console.log(renderer)

	const ptRenderer = new PathTracingRenderer(renderer);
ptRenderer.camera = camera;
ptRenderer.material = new PhysicalPathTracingMaterial();
console.log(ptRenderer.material)
scene.add(ptRenderer);


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.3;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// Add dat.GUI to switch color space
const gui = new GUI();
const settings = {
  colorSpace: 'sRGBColorSpace'  // initial value
};
console.log('Initial ColorSpace:', renderer.outputColorSpace);


gui.add(settings, 'colorSpace', ['sRGBColorSpace', 'LinearSRGBColorSpace']).name('Color Space').onChange((value) => {
  if (value === 'sRGBColorSpace') {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if (value === 'LinearSRGBColorSpace') {
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  }
  console.log(`Renderer outputColorSpace set to: ${renderer.outputColorSpace}`);
});

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.minDistance = 1; // Minimum zoom
controls.maxDistance = 15; // Maximum zoom
controls.target.set(0, 0, 0); // Look at the center

// Add lighting
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);



// Light Source (Sun)
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-15, 10, -5);
scene.add(sun);


// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(-15, 10, -5);
directionalLight.castShadow = true;

// Shadow Settings
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 5000;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

// Add light to scene
// scene.add(directionalLight);

// Add Light Helper
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 15);
scene.add(lightHelper);


// Load HDRI environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('../asset/HDRI/environment.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = texture;  // Apply HDRI as environment
  scene.background = texture;   // Set HDRI as background
});
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const hdrLoader = new RGBELoader();
hdrLoader.load("../asset/HDRI/environment.hdr", function (texture) {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap;
  scene.background = envMap; // Remove if you want a solid background
});

// Create Composer for Post Processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Create Bloom Effect
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // Strength (Increase for a stronger glow)
  1.4,  // Radius (Higher values make the glow softer)
  1.085  // Threshold (Lower values make more areas glow)
);
composer.addPass(bloomPass);

const ssaoPass = new SSAOPass(scene, camera);
ssaoPass.kernelRadius = 1;
ssaoPass.minDistance = 0.001;
ssaoPass.maxDistance = 0.1;
if(ssaoPass){
	console.log("SSAO pass added")
}
composer.addPass(ssaoPass);

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
if(gammaCorrectionPass){
	console.log("gamma pass added")
}
// composer.addPass(gammaCorrectionPass);

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
  '../asset/GLTF/kitchen.glb',
  (gltf) => {
    const model = gltf.scene;

	model.traverse((node) => {
		if (node.isMesh) {
		  node.castShadow = true;   // ✅ Model should cast shadows
		  node.receiveShadow = true; // ✅ Model can receive shadows
		}
	  });

    model.position.set(0, -0.5, 0); // Adjust position if needed
	model.scale.set(3,3,3)
    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error('Error loading GLB:', error);
  }
);

camera.position.set(0,5,1)
camera.lookAt(0,0,0)

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  composer.render();
  // ptRenderer.update();
  renderer.render(scene, camera);
}

animate();
