
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { RGBELoader } from "RGBELoader";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  envMap;

  const hdrEquirect = new RGBELoader()
				.setPath( 'https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/gohere%2Fnewv%2Fcubemap%2F' )
				.load( 'royal_esplanade_1k.hdr?alt=media', function () {

					hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;


				} );


  let logoMaterials = 
  [
    LogoMaterial(0xFF8008),
    LogoMaterial(0xEEC200),
    LogoMaterial(0x027B00),
    LogoMaterial(0x0BA4FF),
    LogoMaterial(0x002ABC),
    LogoMaterial(0x7200BC),
    LogoMaterial(0xE7180C),
  ];
  
  function LogoMaterial(clr)
  {
    return new THREE.MeshPhysicalMaterial(
    {
      color: clr,
				transmission: 0,
				opacity: 1,
				metalness: 1,
				roughness: 0.1,
				specularIntensity: 1,
				specularColor: 0xffffff,
				envMapIntensity: 1,
				lightIntensity: 1,
				exposure: 1,
        envMap: hdrEquirect
    });
  }


let logo;


let start = {
  camera: {
    position: new THREE.Vector3(0, 0, 80),
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
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format,
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
      let pod = logo.children[i];
      console.log(pod.material);
      pod.material.color = logoMaterials[i].color;
      pod.material.envMapIntensity = 1.5;
      pod.material = logoMaterials[i];
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

   logo.rotation.z = scrollPos * 0.003;
  // Update the camera's y position based on the scroll position
  camera.position.y = mapRange(y,80,100,25,-10);
}

function mapRange(num, inputMin, inputMax, outputMin, outputMax) {
  return (num - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

