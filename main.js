import './style.css';
import * as THREE from 'three';
import { GUI } from 'dat.gui'; // Import dat.gui
//import gftloader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import draco loader
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
const loader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
const canvas = document.querySelector('.canvas-container');
canvas.appendChild(renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);


//add public/cubemap
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  '/cubemap/px.png',
  '/cubemap/nx.png',
  '/cubemap/py.png',
  '/cubemap/ny.png',
  '/cubemap/pz.png',
  '/cubemap/nz.png',
]);
scene.background = environmentMapTexture;

//add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff,1.9);
scene.add(ambientLight);

//add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
directionalLight.position.set(0, 10, 1);
directionalLight.target.position.set(0, -0.5, 0);
scene.add(directionalLight, directionalLight.target);

directionalLight.castShadow = true;
scene.add(directionalLight);


let shoe;

const shoeMeshes = [];

//add public/Shoe_compressed.glb 
loader.load('/Shoe_compressed.glb', function(gltf){
  shoe = gltf.scene;
  shoe.position.set(0.05, 0.10, -0.04)
  shoe.rotation.set(0, -65 * (Math.PI / 180), 0)
  shoe.scale.set(3, 3, 3);
  shoe.receiveShadow = true; 
  
  const leatherTexture = new THREE.TextureLoader().load('/fabrics/leather.jpg');
  const leatherNormal = new THREE.TextureLoader().load('/fabrics/leatherNorm.jpg');
  const leatherReflect = new THREE.TextureLoader().load('/fabrics/leatherReflect.jpg');
  const leatherGloss = new THREE.TextureLoader().load('/fabrics/leatherGloss.jpg');
  leatherTexture.wrapS = THREE.RepeatWrapping;
  leatherTexture.wrapT = THREE.RepeatWrapping;
  leatherTexture.repeat.set(3, 3);
  
  const shoeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Set your desired color here
    normalMap: leatherNormal,
    displacementMap: leatherTexture,
    displacementScale: 0.1,
    envMap: leatherReflect,
    roughnessMap: leatherGloss,

  });
  
  scene.add(shoe);

  // Find laces and sole meshes by name
  const lacesMesh = shoe.getObjectByName("laces");
  const soleBottomMesh = shoe.getObjectByName("sole_bottom");
  const soleTopMesh = shoe.getObjectByName("sole_top");
  const insideMesh = shoe.getObjectByName("inside");
  const outside1Mesh = shoe.getObjectByName("outside_1");
  const outside2Mesh = shoe.getObjectByName("outside_2");
  const outside3Mesh = shoe.getObjectByName("outside_3");

  lacesMesh.name = "Laces";
  soleBottomMesh.name = "Sole bottom";
  soleTopMesh.name = "sole top";
  insideMesh.name = "Lining";
  outside1Mesh.name = "Front part";
  outside2Mesh.name = "Upper part";
  outside3Mesh.name = "Body";

  
  shoeMeshes.push(lacesMesh, soleBottomMesh, soleTopMesh, insideMesh, outside1Mesh, outside2Mesh, outside3Mesh);
  //console.log(lacesMesh);

  
  

  shoe.traverse(function (node) {
    if (node.isMesh) {
      node.material = shoeMaterial.clone();
      node.castShadow = true;

      // Check if the mesh is part of the shoe
   
    }
  });
});
  //add cylinder
const cylinderGeometry = new THREE.CylinderGeometry( 1.3, 1.3, 0.2, 80 );
const cylinderMaterial = new THREE.MeshStandardMaterial( 
  { color: "#d357fe",
    emissive: "#ffa57d",
    emissiveIntensity: 0.2,
    metalness: 0.4,
    roughness: 0.1,
    envMap: environmentMapTexture,
  } );
const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
scene.add( cylinder );
//receive shadow cylinder
cylinder.receiveShadow = true;
cylinder.castShadow = true;
cylinder.position.set(0, -0.3, -0.7);



camera.position.y = 0.65;
camera.position.z = 1; 
camera.lookAt(0, 0, 0);

const gui = new GUI();
const settings = {
    ambientLightIntensity: 1.9,
    directionalLightIntensity: 1.3,
    shoeRotationSpeed: 0.01,
};
let shoeRotationSpeed = 0.01; // Initialize the default rotation speed

// Add settings to GUI
gui.add(settings, 'ambientLightIntensity', 0, 3, 0.1).onChange((value) => {
    ambientLight.intensity = value;
});
gui.add(settings, 'directionalLightIntensity', 0, 3, 0.1).onChange((value) => {
    directionalLight.intensity = value;
});
gui.add(settings, 'shoeRotationSpeed', 0, 0.1, 0.01).onChange((value) => {
    shoeRotationSpeed = value;
});

function animate() {
  if (shoe) {
    shoe.rotation.y += shoeRotationSpeed; // Rotate shoe based on GUI setting
}
renderer.render(scene, camera);

}
animate();