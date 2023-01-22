
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  envMap;



let logo;

let material = new THREE.MeshNormalMaterial();

let start = {
  camera: {
    position: new THREE.Vector3(0, 0, 30),
    rotation: new THREE.Vector3(0, 0, 0),
  },
 
  ambient: { intensity: 1.0 },
};


Start();

function Start() {
  SetupEnvMap();
  SetupRenderer();
  SetupCamera();
  SetupLogo();
  FinalRender();
}

function SetupEnvMap() {
  // load the cubemap textures
  var path = "https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/gohere%2Fnewv%2Fcubemap%2F";
  var format = ".jpg?alt=media";
  var urls = [
    path + "px" + format,
    path + "nx" + format,
    path + "py" + format,
    path + "ny" + format,
    path + "pz" + format,
    path + "nz" + format,
  ];

  envMap = new THREE.CubeTextureLoader().load(urls);
  envMap.format = THREE.RGBFormat;
}


function SetupRenderer() {
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xeb4034, 0);
  scene.environment = envMap;
}

function SetupCamera() {
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(
    start.camera.position.x,
    start.camera.position.y,
    start.camera.position.z
  );
  camera.rotation.set(
    start.camera.rotation.x,
    start.camera.rotation.y,
    start.camera.rotation.z
  );
  scene.add(camera);
  // const controls = new OrbitControls(camera, renderer.domElement);
}

function SetupLogo() {
  
  const loader = new GLTFLoader().setPath("https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/gohere%2Fnewv%2F");
  loader.load("betterLogo.glb?alt=media", function (gltf) {
    
    logo = gltf.scene.children[0];
    scene.add(logo);

    for (let i = 0; i < logo.children.length; i++) {
      const pod = logo.children[i];
      pod.material = material;
    }
    FinalRender();
  });


}


function FinalRender() {
  renderer.render(scene, camera);
  requestAnimationFrame(Render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
}




function Render() {
  renderer.render(scene, camera);
  requestAnimationFrame(Render);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.outerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.outerHeight);
}
function onScroll() {
  //Get percent scrolled
  var h = document.documentElement,
    b = document.body,
    st = "scrollTop",
    sh = "scrollHeight";
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
   //0 to 100

   const scrollPos = window.pageYOffset;
  // Update the camera's y position based on the scroll position
  camera.position.y = scrollPos * -0.1;
}
