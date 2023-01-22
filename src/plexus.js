import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";

let light,
  canvas,
  renderer,dmap,
  scene = new THREE.Scene(),
  camera,
  clock = new THREE.Clock();

let start = {
  camera: {
    position: new THREE.Vector3(0, 0, 100),
    rotation: new THREE.Vector3(0, 0, 0),
  },

  ambient: { intensity: 1.0 },
};

Start();

function Start() {
  SetupCanvas();
  MasterSetup();

  //   SetupGUI();
}

function MasterSetup() {
  SetupRenderer();
  SetupCamera();
  SetupLight();
  GetDisplacement();
  FinalRender();
}

function GetDisplacement() {
  const loader = new THREE.TextureLoader();
  dmap = loader.load("../static/img/heightmap.jpg");

  
  SetupPlane();
}

function SetupPlane() {
  let geo = new THREE.PlaneGeometry(100, 100, 100, 100);
  const wireframe = new THREE.WireframeGeometry(geo);
  const line = new THREE.LineSegments(wireframe);
  line.material.depthTest = false;
  line.material.opacity = 1;
  line.material.transparent = true;

  let mat = new THREE.MeshStandardMaterial({
    color: 0xfffeee,
    displacementMap: dmap,
    bumpMap: dmap,
    displacementScale: 10
  });
//   scene.add(line);
  scene.add(new THREE.Mesh(geo, mat));

  // let mat = new THREE.MeshNormalMaterial();
  // let mesh = new THREE.Mesh(geo,mat);
  // scene.add(mesh);
}

function SetupCanvas() {
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
}

function SetupRenderer() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
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
  //   const controls = new OrbitControls(camera, renderer.domElement);
}

function FinalRender() {
  renderer.render(scene, camera);
  //   .postprocessing.composer.render( 0.1 );
  requestAnimationFrame(Render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
}

function SetupLight() {
  let ambientLight = new THREE.AmbientLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.75
  );
  scene.add(ambientLight);

  let directionalLightBack = new THREE.DirectionalLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.25
  );
  directionalLightBack.position.set(30, 100, 100);
  scene.add(directionalLightBack);

  let directionalLightFront = new THREE.DirectionalLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.25
  );
  directionalLightFront.position.set(-30, 100, -100);
  scene.add(directionalLightFront);
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
    .add(camera.position, "x", -10, 10, 0.01)
    .name("X")
    .onChange((value) => {
      camera.position.x = value;
    });
  guiCameraPos
    .add(camera.position, "y", -10, 10, 0.01)
    .name("y")
    .onChange((value) => {
      camera.position.y = value;
    });
  guiCameraPos
    .add(camera.position, "z", -10, 10, 0.01)
    .name("z")
    .onChange((value) => {
      camera.position.z = value;
    });
}

function Render() {
  let delta = clock.getDelta();
  var time = clock.elapsedTime;

  renderer.render(scene, camera);
  // postprocessing.composer.render( 0.1 );
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
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100; //0 to 100

  // Get the current scroll position
  const scrollPos = window.pageYOffset;
  // Update the camera's y position based on the scroll position
  camera.position.y = scrollPos * -0.1;
  // Render the scene
  renderer.render(scene, camera);
}
