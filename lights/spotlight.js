import * as THREE from 'three';
import GUI from 'dat.gui';

// Function to create and configure lights
export function createLights(scene, gui) {
  // SpotLight
  const spotLight = new THREE.SpotLight(0xff9000, 400);
  spotLight.angle =Math.PI/6
  spotLight.penumbra = 0.2;
  spotLight.position.set(6, 6.5, -2.4);
  spotLight.target.position.set(6,0.34,-2.4);
  scene.add(spotLight);
  spotLight.castShadow = true;
  scene.add(spotLight.target);

  // GUI Light Controls
  const lightSettings = {
    color: spotLight.color.getHex(),
    intensity: spotLight.intensity,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    distance: spotLight.distance,
    posX: spotLight.position.x,
    posY: spotLight.position.y,
    posZ: spotLight.position.z,
    rotX: spotLight.rotation.x,
    rotY: spotLight.rotation.y,
    rotZ: spotLight.rotation.z,
  };

  // Main Group
  const spotLightFolder = gui.addFolder('Spot Light');

  // Configuration Subgroup
  const configFolder = spotLightFolder.addFolder('Configuration');
  configFolder.addColor(lightSettings, 'color').onChange((value) => {
    spotLight.color.set(value);
  });
  configFolder.add(lightSettings, 'intensity', 0, 2000).onChange((value) => {
    spotLight.intensity = value;
  });
  configFolder.add(lightSettings, 'angle', 0, Math.PI / 4).onChange((value) => {
    spotLight.angle = value;
  });
  configFolder.add(lightSettings, 'penumbra', 0, 1).onChange((value) => {
    spotLight.penumbra = value;
  });
  configFolder.add(lightSettings, 'decay', 0, 5).onChange((value) => {
    spotLight.decay = value;
  });
  configFolder.add(lightSettings, 'distance', 0, 10).onChange((value) => {
    spotLight.distance = value;
  });
  configFolder.open();

  // // Position Subgroup
  // const positionFolder = spotLightFolder.addFolder('Position');
  // positionFolder.add(lightSettings, 'posX', -10, 10).onChange((value) => {
  //   spotLight.position.x = value;
  //   spotLight.target.updateMatrixWorld();
  //   helper.update();
  // });
  // positionFolder.add(lightSettings, 'posY', -10, 10).onChange((value) => {
  //   spotLight.position.y = value;
  //   helper.update();
  // });
  // positionFolder.add(lightSettings, 'posZ', -10, 10).onChange((value) => {
  //   spotLight.position.z = value;
  //   helper.update();
  // });
  // positionFolder.open();

  // // Rotation Subgroup
  // const rotationFolder = spotLightFolder.addFolder('Rotation');
  // rotationFolder.add(lightSettings, 'rotX', -Math.PI, Math.PI).onChange((value) => {
  //   spotLight.rotation.x = value;
  //   helper.update();
  // });
  // rotationFolder.add(lightSettings, 'rotY', -Math.PI, Math.PI).onChange((value) => {
  //   spotLight.rotation.y = value;
  //   helper.update();
  // });
  // rotationFolder.add(lightSettings, 'rotZ', -Math.PI, Math.PI).onChange((value) => {
  //   spotLight.rotation.z = value;
  //   helper.update();
  // });
  // rotationFolder.open();

  // Spotlight Helper
  const helper = new THREE.SpotLightHelper(spotLight);
  //scene.add(helper);

  return { spotLight, helper };
}
