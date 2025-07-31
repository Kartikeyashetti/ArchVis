import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui';
export function loadModel(scene) {
  const loader = new GLTFLoader();
  loader.load(
    '../asset/models/TableLamp.glb',
    (gltf) => {
      const model = gltf.scene;
      const gui = new GUI();
      const lightFolder = gui.addFolder('Table Lamp'); // ✅ Creates a folder named "Table Lamp"

      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      model.position.set(-10,1.56, -0.23879367113113403);
      model.scale.set(2, 2, 2);
      scene.add(model)    
  //     const modelFolder = gui.addFolder('Table Lamp Transform');
  
  // // Position controls
  // modelFolder.add(model.position, 'x', -10, 10, 0.01).name('Position X');
  // modelFolder.add(model.position, 'y', -10, 10, 0.01).name('Position Y');
  // modelFolder.add(model.position, 'z', -10, 10, 0.01).name('Position Z');

  // // Rotation controls
  // modelFolder.add(model.rotation, 'x', 0, Math.PI * 2, 0.01).name('Rotation X');
  // modelFolder.add(model.rotation, 'y', 0, Math.PI * 2, 0.01).name('Rotation Y');
  // modelFolder.add(model.rotation, 'z', 0, Math.PI * 2, 0.01).name('Rotation Z');
  //     modelFolder.open();
    

      // 🔹 Add Point Light at Same Position
      const pointLight = new THREE.PointLight(0xff0000, 25, 5); // (color, intensity, distance)
      pointLight.position.set(-4.48, 1.5, -0.28);
      scene.add(pointLight);

      

      // pointLight.position.copy(model.position.x,model.position.y, model.position.z);
      model.add(pointLight);
pointLight.position.set(0, 0.4, 0); // Now it sticks to the model!



      // ✅ Optional: Add a helper to visualize the light position
      const lightHelper = new THREE.PointLightHelper(pointLight, 0.5);
      // scene.add(lightHelper);

      // 🔹 Add dat.GUI Controls
 

      lightFolder
        .addColor({ color: '#ffffff' }, 'color')
        .name('Light Color')
        .onChange((value) => {
          pointLight.color.set(value);
        });

      lightFolder
        .add(pointLight, 'intensity', 0, 50)
        .name('Intensity')
        .onChange((value) => {
          pointLight.intensity = value;
        });

      lightFolder
        .add(pointLight, 'distance', 0, 10)
        .name('Distance')
        .onChange((value) => {
          pointLight.distance = value;
        });

      lightFolder.close(); // ✅ Keeps folder open by default
    },
    (xhr) => {
      console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (error) => {
      console.error('Error loading GLB:', error);
    }
  );
}
