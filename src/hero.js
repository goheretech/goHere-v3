import * as THREE from "three";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas;

let loader = new THREE.TextureLoader();

let data = {planet: {
    name: "",
    mesh: undefined,
    albedo: undefined,
    roughness: undefined,
    transmission: 0,
    ior: 1.2,
  },
  atmosphere: {
    name: "",
    mesh: undefined,
    albedo: undefined,
    roughness: undefined,
    transmission: 1,
    ior: 1.2,
  }
},
  sun,
  light;

let clock = new THREE.Clock(),
  delta;

let start = {
  camera: {
    position: new THREE.Vector3(70, 10, 870),
    rotation: new THREE.Vector3(0.17, 0.53, 0),
  },
  sun: { 
    position: new THREE.Vector3(-57, 1000, 1320), 
    intensity: 0.841 
},
  ambient: { intensity: 1.4 },
  main: { position: new THREE.Vector3(-79.62, 32.62, 439.69) },
};
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", function () {
  console.log("Started");
  Start();
});

function Start() {
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //Camera
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );

  SetupVideo();
  SetupCamera();
  renderer.setClearColor(0xeb4034, 0);
  GenerateSpace();
  SetupGUI();
}

function SetupCamera() {
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
}

function SetupGUI() {
  const gui = new dat.GUI();
  ///Camera
  let guiCamera = gui.addFolder("Camera");
  let guiCameraRot = guiCamera.addFolder("Camera Rotation");
  guiCameraRot
    .add(camera.rotation, "x", -Math.PI, Math.PI, 0.01)
    .name("X")
    .onChange((value) => {
      camera.rotation.x = value;
    });
  guiCameraRot
    .add(camera.rotation, "y", -Math.PI, Math.PI, 0.01)
    .name("y")
    .onChange((value) => {
      camera.rotation.y = value;
    });
  guiCameraRot
    .add(camera.rotation, "z", -Math.PI, Math.PI, 0.01)
    .name("z")
    .onChange((value) => {
      camera.rotation.z = value;
    });
  let guiCameraPos = guiCamera.addFolder("Camera Position");
  guiCameraPos
    .add(camera.position, "x", -1000, 1000, 0.01)
    .name("X")
    .onChange((value) => {
      camera.position.x = value;
    });
  guiCameraPos
    .add(camera.position, "y", -1000, 1000, 0.01)
    .name("y")
    .onChange((value) => {
      camera.position.y = value;
    });
  guiCameraPos
    .add(camera.position, "z", -1000, 1000, 0.01)
    .name("z")
    .onChange((value) => {
      camera.position.z = value;
    });
    ///Planet
  let guiPlanet = gui.addFolder("Planet");
 
  let guiPlanetPos = guiPlanet.addFolder("Planet Position");
  guiPlanetPos
    .add(data.planet.mesh.position, "x", -1000, 1000, 0.01)
    .name("X")
    .onChange((value) => {
      data.planet.mesh.position.x = value;
    });
  guiPlanetPos
    .add(data.planet.mesh.position, "y", -1000, 1000, 0.01)
    .name("y")
    .onChange((value) => {
      data.planet.mesh.position.y = value;
    });
  guiPlanetPos
    .add(data.planet.mesh.position, "z", -1000, 1000, 0.01)
    .name("z")
    .onChange((value) => {
      data.planet.mesh.position.z = value;
    });
    ///Sun
  let guiSun = gui.addFolder("Sun");
  guiSun
    .add(sun.obj, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      sun.obj.intensity = value;
    });
  let guiSunPos = guiSun.addFolder("Sun Position");
  guiSunPos
    .add(sun.obj.position, "x", -1000, 1000, 0.01)
    .name("X")
    .onChange((value) => {
      sun.obj.position.x = value;
    });
  guiSunPos
    .add(sun.obj.position, "y", -1000, 1000, 0.01)
    .name("y")
    .onChange((value) => {
      sun.obj.position.y = value;
    });
  guiSunPos
    .add(sun.obj.position, "z", -1000, 1000, 0.01)
    .name("z")
    .onChange((value) => {
      sun.obj.position.z = value;
    });
    ///Ambient Light
  console.log(light);
  let guiAL = gui.addFolder("Ambient Light");
  guiAL
    .add(light, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      light.obj.intensity = value;
    });
}

function SetupVideo() {
  data.planet.albedo = new THREE.VideoTexture(GetVideo("albedo"));
  data.planet.roughness = new THREE.VideoTexture(GetVideo("roughness"));
}

function GetVideo(name) {
  let video = document.getElementById(name);
  video.play();
  video.addEventListener("play", function () {
    this.currentTime = 3;
  });
  return video;
}

function Render() {
  let delta = clock.getDelta();
  var time = clock.elapsedTime;
  data.planet.mesh.rotation.y +=
    //   ((delta / 10) * 20 * Math.PI) / 180;
    (delta * 10 * Math.PI) / 180;
  renderer.render(scene, camera);
  requestAnimationFrame(Render);
}

function GenerateSpace() {
  CreateAmbientLight();
  CreateSun();
  CreatePlanet("planet", 70, start.main.position, scene, 25);
//   CreatePlanet("atmosphere", 75, start.main.position, scene, 25);
  renderer.render(scene, camera);
  requestAnimationFrame(Render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
}

function CreateAmbientLight() {
  light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);
}

function CreateSun() {
  let sunMat = new THREE.MeshStandardMaterial({
    emissiveIntensity: 1,
    emissive: 0xffffff, // darkgrey
  });
  let sunGeo = new THREE.IcosahedronGeometry(0.2, 6);
  // let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
  let _sun = new THREE.DirectionalLight(0xeee4f5, 1.1, 15000000, 0.01);
  _sun.add(new THREE.Mesh(sunGeo, sunMat));
  scene.add(_sun);
  _sun.position.set(
    start.sun.position.x,
    start.sun.position.y,
    start.sun.position.z
  );
  _sun.intensity = start.sun.intensity;
  sun = {
    name: "sun",
    obj: _sun,
  };
}

function CreatePlanet(name, size, position, parent, detail) {
  let planetMat = new THREE.MeshPhysicalMaterial({
    map: data[name].albedo,
    // roughnessMap: data[name].roughness,
    //   normalMap: textureCache[name].normal,
    // metalnessMap: data[name].roughness,
    //   aoMap: textureCache[name].ao,
    color: 0xeee4f5,
    // alphaMap:texturesArray[3],
    //   transparent: true,
    metalness: 0.0,
    roughness: 0.5,
    transmission:data[name].transmission,
    ior:data[name].ior,
  });
  console.log(planetMat);

  let planetGeo = new THREE.SphereGeometry(size, detail, detail);
  let _planet = new THREE.Mesh(planetGeo, planetMat);
  parent.add(_planet);
  _planet.position.set(position.x, position.y, position.z);
  data[name].mesh = _planet;
  
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
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100; //0 to 100
  console.log(`camera change: ${y}`);
}
function lerp(min, max, value) {
  return (max - min) * value + min;
}
