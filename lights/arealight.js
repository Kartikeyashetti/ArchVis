import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import GUI from 'dat.gui';

export function createAreaLight(scene, gui) {
  // Create a RectAreaLight
  const areaLight = new THREE.RectAreaLight(0xffffff, 100, 4, 4);
  areaLight.position.set(-4, 6.5, 0);
  areaLight.rotation.set(-Math.PI / 2, 0, 0); // Face downward
  scene.add(areaLight);

  // Add RectAreaLightHelper
  let helper = new RectAreaLightHelper(areaLight);
  scene.add(helper);

  // 🔹 Directional Light for Shadows (Simulating Area Light Shadows)
  const shadowLight = new THREE.DirectionalLight(0xffffff);
  shadowLight.intensity+= (areaLight.intensity*0.5)
  shadowLight.position.copy(areaLight.position);
//   shadowLight.scale(2,2,2);

  shadowLight.castShadow = true;

  // Configure Shadows
  shadowLight.shadow.mapSize.width = 1024;
  shadowLight.shadow.mapSize.height = 1024;
  shadowLight.shadow.camera.near = 0.5;
  shadowLight.shadow.camera.far = 50;
  shadowLight.shadow.camera.left = -25;
  shadowLight.shadow.camera.right = 25;
  shadowLight.shadow.camera.top = 25;
  shadowLight.shadow.camera.bottom = -25;

  // scene.add(shadowLight);

  // Enable Shadows for Scene Objects
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Function to update helper
  function updateHelper() {
    scene.remove(helper);
    helper = new RectAreaLightHelper(areaLight);
    // scene.add(helper);
  }

  // GUI Controls
  const lightSettings = {
    color: areaLight.color.getHex(),
    intensity: areaLight.intensity,
    width: areaLight.width,
    height: areaLight.height,

    // Position
    posX: areaLight.position.x,
    posY: areaLight.position.y,
    posZ: areaLight.position.z,

    // Rotation
    rotX: areaLight.rotation.x,
    rotY: areaLight.rotation.y,
    rotZ: areaLight.rotation.z,
  };

  // 📌 **Main Group: Area Light**
  const areaLightFolder = gui.addFolder('Area Light');
  areaLightFolder.close();

  // **Subgroup: Configuration**
  const configFolder = areaLightFolder.addFolder('Configuration');
  configFolder.addColor(lightSettings, 'color').onChange((value) => {
    areaLight.color.set(value);
  });
  configFolder.add(lightSettings, 'intensity', 0, 1000).onChange((value) => {
    areaLight.intensity = value;
  });
  configFolder.add(lightSettings, 'width', 1, 10).onChange((value) => {
    areaLight.width = value;
  });
  configFolder.add(lightSettings, 'height', 1, 10).onChange((value) => {
    areaLight.height = value;
  });
  configFolder.close();

  // **Subgroup: Position**
  // const positionFolder = areaLightFolder.addFolder('Position');
  // positionFolder.add(lightSettings, 'posX', -10, 10).onChange((value) => {
  //   areaLight.position.x = value;
  //   shadowLight.position.x = value;
  //   updateHelper();
  // });
  // positionFolder.add(lightSettings, 'posY', -10, 10).onChange((value) => {
  //   areaLight.position.y = value;
  //   shadowLight.position.y = value;
  //   updateHelper();
  // });
  // positionFolder.add(lightSettings, 'posZ', -10, 10).onChange((value) => {
  //   areaLight.position.z = value;
  //   shadowLight.position.z = value;
  //   updateHelper();
  // });
  // positionFolder.close();

  // // **Subgroup: Rotation**
  // const rotationFolder = areaLightFolder.addFolder('Rotation');
  // rotationFolder.add(lightSettings, 'rotX', -Math.PI, Math.PI).onChange((value) => {
  //   areaLight.rotation.x = value;
  //   updateHelper();
  // });
  // rotationFolder.add(lightSettings, 'rotY', -Math.PI, Math.PI).onChange((value) => {
  //   areaLight.rotation.y = value;
  //   updateHelper();
  // });
  // rotationFolder.add(lightSettings, 'rotZ', -Math.PI, Math.PI).onChange((value) => {
  //   areaLight.rotation.z = value;
  //   updateHelper();
  // });
  // rotationFolder.close();

//   areaLightFolder.open(); // Open the main folder by default

  return { areaLight, helper, shadowLight };
}
