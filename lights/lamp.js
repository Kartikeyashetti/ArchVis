// addPointLight.js
import * as THREE from 'three';
import { GUI } from 'dat.gui';


export function addPointLight(scene, position = { x: -0.77, y: 4.73, z: -1.3 }, color = 0xF6B92C, intensity = 40, distance = 0) {
  const pointLight = new THREE.PointLight(color, intensity, distance);
  pointLight.position.set(position.x, position.y, position.z);
  scene.add(pointLight);

  const lightHelper = new THREE.PointLightHelper(pointLight, 0.3);
  scene.add(lightHelper);

   // Add dat.GUI controls
   const gui = new GUI();
   const lightFolder = gui.addFolder('Point Light Position');
   lightFolder.add(pointLight.position, 'x', -10, 10, 0.01);
   lightFolder.add(pointLight.position, 'y', -10, 10, 0.01);
   lightFolder.add(pointLight.position, 'z', -10, 10, 0.01);
   lightFolder.add(pointLight, 'intensity', 0, 100, 0.1).name('Intensity');

   lightFolder.open();

  return pointLight;
}
