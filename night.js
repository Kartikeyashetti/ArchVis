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
import { PathTracingRenderer, PhysicalPathTracingMaterial } from 'three-gpu-pathtracer/build/index.module.js';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass';
import { addPointLight } from './lights/lamp';

import { GUI } from 'dat.gui';
import { createLights } from './lights/spotlight';
import { createAreaLight } from './lights/arealight'; 
import { loadModel  } from './lights/tablelamp';



// Create a scene
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xaaaaaa, 0.1); // (color, density)

const gui = new GUI();
const {  spotLight, helper } = createLights(scene, gui);
const { areaLight, areaHelper } = createAreaLight(scene, gui);
loadModel(scene);
// Add point light with helper
// addPointLight(scene, { x: 2, y: 3, z: 1 }, 0xffaa00, 1.5, 5);
// addPointLight(scene);

// x=-0.0224609375, y=-770.5468139648438, z=0.0054926504381000996

// Set up a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

// Set up a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true,
	 powerPreference: "high-performance",
	logarithmicDepthBuffer: true, });
	renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// Add dat.GUI to switch color space
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

const ptRenderer = new PathTracingRenderer(renderer);
ptRenderer.camera = camera;
ptRenderer.material = new PhysicalPathTracingMaterial();
console.log(ptRenderer.material)
// scene.add(ptRenderer);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Smooth camera movement
// controls.dampingFactor = 0.05;
controls.minDistance = 1; // Minimum zoom
controls.maxDistance = 11; // Maximum zoom
controls.target.set(-3.479233741760254, 2.43236926198005676, -0.23879367113113403); // Look at the center

// Add lighting
// const light = new THREE.AmbientLight(0xffffff, 1);
// scene.add(light);



// Directional Light
const directionalLight = new THREE.DirectionalLight(0x1f263b , 55);
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
scene.add(directionalLight);

// Add Light Helper
// const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(lightHelper);


// Load HDRI environment
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load('../asset/HDRI/environment.hdr', (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   const envMap = pmremGenerator.fromEquirectangular(texture).texture;
//   scene.environment = texture;  // Apply HDRI as environment
//   scene.background = texture;   // Set HDRI as background  
// });
// const pmremGenerator = new THREE.PMREMGenerator(renderer);
// const hdrLoader = new RGBELoader();
// hdrLoader.load("../asset/HDRI/environment.hdr", function (texture) {
//   const envMap = pmremGenerator.fromEquirectangular(texture).texture;
//   scene.environment = envMap;
//   scene.background = envMap; // Remove if you want a solid background
// });

// Create Composer for Post Processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ✅ Setup SSR Pass (do not add yet)
const ssrPass = new SSRPass({
  renderer,
  scene,
  camera,
  width: window.innerWidth,
  height: window.innerHeight,
  groundReflector: null,
  selects: null,
});

ssrPass.opacity = 0.1;
ssrPass.maxDistance = 180;
ssrPass.thickness = 0.018;
ssrPass.blur = true;
ssrPass.strength = 1;
ssrPass.infiniteThick = false;

// ✅ dat.GUI setup for SSR
const SSRsettings = {
  ssrEnabled: false,
  opacity: ssrPass.opacity,
  maxDistance: ssrPass.maxDistance,
  thickness: ssrPass.thickness,
};

// Helper to show/hide controllers
function showController(controller, visible) {
  controller.domElement.parentElement.style.display = visible ? '' : 'none';
}

const ssrFolder = gui.addFolder('Screen Space Reflection');

// Enable SSR toggle
ssrFolder.add(SSRsettings, 'ssrEnabled').name('Enable SSR').onChange((enabled) => {
  if (enabled) {
    composer.addPass(ssrPass);
    showController(opacityController, true);
    showController(maxDistanceController, true);
    showController(thicknessController, true);
    console.log('SSR Pass added');
  } else {
    const index = composer.passes.indexOf(ssrPass);
    if (index !== -1) {
      composer.passes.splice(index, 1);
      console.log('SSR Pass removed');
    }
    showController(opacityController, false);
    showController(maxDistanceController, false);
    showController(thicknessController, false);
  }
});

// Add controllers (initially hidden)
const opacityController = ssrFolder.add(SSRsettings, 'opacity', 0, 1, 0.01).name('Opacity').onChange((value) => {
  ssrPass.opacity = value;
});
const maxDistanceController = ssrFolder.add(SSRsettings, 'maxDistance', 0, 500, 1).name('Max Distance').onChange((value) => {
  ssrPass.maxDistance = value;
});
const thicknessController = ssrFolder.add(SSRsettings, 'thickness', 0, 0.1, 0.001).name('Thickness').onChange((value) => {
  ssrPass.thickness = value;
});

// Initially hide controls
showController(opacityController, false);
showController(maxDistanceController, false);
showController(thicknessController, false);

ssrFolder.open();


const renderScene = new RenderPass(scene, camera);


// ✅ Create Bloom Effect (but don't add to composer yet)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
// bloomPass.addPass(renderScene);
// bloomPass.addPass(bloomPass);

// ✅ Bloom settings for dat.GUI
const bloomSettings = {
  bloomEnabled: false,
  strength: bloomPass.strength,
  radius: bloomPass.radius,
  threshold: bloomPass.threshold,
};

// ✅ Helper to show/hide controllers
function showBloomController(controller, visible) {
  controller.domElement.parentElement.style.display = visible ? '' : 'none';
}

const bloomFolder = gui.addFolder('Bloom Effect');

// Toggle button for Bloom
bloomFolder.add(bloomSettings, 'bloomEnabled').name('Enable Bloom').onChange((enabled) => {
  if (enabled) {
    composer.addPass(bloomPass);
    showBloomController(strengthController, true);
    showBloomController(radiusController, true);
    showBloomController(thresholdController, true);
    console.log('Bloom Pass added');
  } else {
    const index = composer.passes.indexOf(bloomPass);
    if (index !== -1) {
      composer.passes.splice(index, 1);
      console.log('Bloom Pass removed');
    }
    showBloomController(strengthController, false);
    showBloomController(radiusController, false);
    showBloomController(thresholdController, false);
  }
});

// Add controllers (initially hidden)
const strengthController = bloomFolder.add(bloomSettings, 'strength', 0, 5, 0.01).name('Strength').onChange((v) => {
  bloomPass.strength = v;
});
const radiusController = bloomFolder.add(bloomSettings, 'radius', 0, 1, 0.01).name('Radius').onChange((v) => {
  bloomPass.radius = v;
});
const thresholdController = bloomFolder.add(bloomSettings, 'threshold', 0, 1, 0.01).name('Threshold').onChange((v) => {
  bloomPass.threshold = v;
});

// Hide submenu initially
showController(strengthController, false);
showController(radiusController, false);
showController(thresholdController, false);

bloomFolder.open();


const ssaoPass = new SSAOPass(scene, camera);
ssaoPass.kernelRadius = 8;
ssaoPass.minDistance = 0.001;
ssaoPass.maxDistance = 0.1;

composer.addPass(ssaoPass);
// Check if SSAOPass is added
if (composer.passes.includes(ssaoPass)) {
  console.log('✅ SSAO Pass added to composer');
}



const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

const options = { gammaCorrection: false };

gui.add(options, 'gammaCorrection').name('Gamma Correction').onChange((value) => {
  if (value) {
    composer.addPass(gammaCorrectionPass);
    console.log("gamma pass added");
  } else {
    // remove gammaCorrectionPass if present
    const index = composer.passes.indexOf(gammaCorrectionPass);
    if (index !== -1) {
      composer.passes.splice(index, 1);
      console.log("gamma pass removed");
    }
  }
});

// const BLOOM_LAYER = 1;
// const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
// const materials = {};

// function darkenNonBloomed(obj) {
//   if (obj.isMesh && !obj.layers.test(new THREE.Layers().set(BLOOM_LAYER))) {
//     materials[obj.uuid] = obj.material;
//     obj.material = darkMaterial;
//   }
// }
// function restoreMaterial(obj) {
//   if (materials[obj.uuid]) {
//     obj.material = materials[obj.uuid];
//     delete materials[obj.uuid];
//   }
// }

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
  '../asset/GLTF/kitchen.glb',
  (gltf) => {
    const model = gltf.scene;

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true; // ✅ Model should cast shadows
        node.receiveShadow = true; // ✅ Model can receive shadows
      }
    });

    model.position.set(0, -0.5, 0); // Adjust position if needed
    model.scale.set(3, 3, 3);
    scene.add(model);

    // 🔎 Find CanLight and assign to bloom layer
    const canLight = model.getObjectByName('CanLight');
    if (canLight) {
      console.log(
        `CanLight position: x=${canLight.position.x}, y=${canLight.position.y}, z=${canLight.position.z}`
      );
      canLight.layers.set(BLOOM_LAYER); // This makes it glow in bloom pass
    } else {
      console.log('CanLight object not found');
    }
  },
  (xhr) => {
    const progress = (xhr.loaded / xhr.total) * 100;
    if (progress === 100) {
    console.log('Model loaded Successfully!!');
    }
  },
  (error) => {
    console.error('Error loading GLB:', error);
  }
);


camera.position.set(0,5,1)
camera.lookAt(0,0,0)

// Animation loop
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   // composer.render();
//   // ptRenderer.update();

//   renderer.render(scene, camera);
// }
let useComposer = false;  // Default rendering
document.querySelectorAll('input[name="renderMode"]').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    if (event.target.value === 'composer') {
      useComposer = true;
    } else {
      useComposer = false;
    }
  });
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (useComposer) {
    ptRenderer.update();
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

animate();



