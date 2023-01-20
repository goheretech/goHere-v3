
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { EffectComposer } from 'EffectComposer';
			import { RenderPass } from 'RenderPass';
			import { BokehPass } from 'BokehPass';
let
  triangles = [];

let upper = 
{
    scene: new THREE.Scene(),
    renderer :'',
    canvas:'',
    camera:'',
    postprocessing:{},
    triParams:{
        num: 30,
        upper:true,
        minXabs:25,
        maxXabs:60,
        minY:-900,
        maxY:50,
        minZ: -50,
        maxZ: 100,
    },

}

let lower = 
{
    scene: new THREE.Scene(),
    renderer:'',
    canvas:'',
    camera:'',
    postprocessing:{},
    triParams:{
        num: 70,
        upper:false,
        minXabs:0,
        maxXabs:200,
        minY:-900,
        maxY:50,
        minZ: -100,
        maxZ: -200,
    },

}
let logo,
  light,
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
  
  MasterSetup(lower)
  MasterSetup(upper)
  
//   SetupGUI();
  

    
}

function MasterSetup(master)
{
    SetupRenderer(master);
    SetupCamera(master);
    InitPostprocessing(master)
    SetupLight(master);
    GenerateTriangles(master);
    FinalRender(master);
    console.log(master);
}

function RandomInt(min,max)
{
    return (Math.random() * (max - min)) + min;
}
function GenerateTriangles(master) {
    for (let i = 0; i < master.triParams.num; i++) {
        let randomBinary = Math.floor(Math.random() * 2);
        if(randomBinary == 0)
        {
            randomBinary = -1;
        }
        let triangle = 
            CreateTriangle(
                new THREE.Vector3(
                    RandomInt(master.triParams.minXabs*randomBinary, master.triParams.maxXabs*randomBinary), 
                    RandomInt(master.triParams.minY, master.triParams.maxY), 
                    RandomInt(master.triParams.minZ, master.triParams.maxZ)
                ), 
                new THREE.Vector3(
                    RandomInt(-7, 7), 
                    RandomInt(-7, 7), 
                    RandomInt(-7, 7)
                ),master);
        triangles.push(triangle)
    }
}
function CreateTriangle(pos,rot,master)
{
    const geometry = new THREE.ConeGeometry( 5, 10, 3 );
    const material = new THREE.MeshNormalMaterial( {color: 0xffff00} );
    const cone = new THREE.Mesh( geometry, material );
    cone.position.set(
        pos.x,
        pos.y,
        pos.z
    );

    cone.rotation.set(
        rot.x,
        rot.y,
        rot.z
    );
    master.scene.add( cone );
    return cone;
}

function SetupCanvas()
{
    lower.canvas = document.getElementById("lower");
    lower.renderer = new THREE.WebGLRenderer({
        canvas: lower.canvas,
        antialias: true,
        alpha: true,
      });
    upper.canvas = document.getElementById("upper");
    upper.renderer = new THREE.WebGLRenderer({
        canvas: upper.canvas,
        antialias: true,
        alpha: true,
      });
    
}

function SetupRenderer(master) {
  master.renderer.setPixelRatio(window.devicePixelRatio);
  master.renderer.setSize(window.innerWidth, window.innerHeight);
  master.renderer.outputEncoding = THREE.sRGBEncoding;
  master.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  master.renderer.setPixelRatio(window.devicePixelRatio);
  master.renderer.setSize(window.innerWidth, window.innerHeight);
  master.renderer.setClearColor(0x000000, 0);
}

function SetupCamera(master) {
  let camera = new THREE.PerspectiveCamera(
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
  master.camera = camera;
  master.scene.add(master.camera);
//   const controls = new OrbitControls(camera, renderer.domElement);
}

function InitPostprocessing(master) {


    var width = window.innerWidth || 1;
var height = window.innerHeight || 1;
var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };

var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

    let renderPass = new RenderPass( master.scene, master.camera, );

    let bokehPass = new BokehPass( master.scene, master.camera, {
        transparent: true,
        focus: 1.0,
        aperture: 0.025,
        maxblur: 0.01
    } );

    let composer = new EffectComposer(master.renderer, renderTarget);

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    master.postprocessing.composer = composer;
    master.postprocessing.bokeh = bokehPass;

}

function FinalRender(master) {
  master.renderer.render(master.scene, master.camera);
//   master.postprocessing.composer.render( 0.1 );
  requestAnimationFrame(Render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
}



function SetupLight(master) {
  let ambientLight = new THREE.AmbientLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.75
  );
  master.scene.add(ambientLight);

  let directionalLightBack = new THREE.DirectionalLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.25
  );
  directionalLightBack.position.set(30, 100, 100);
  master.scene.add(directionalLightBack);

  let directionalLightFront = new THREE.DirectionalLight(
    new THREE.Color("hsl(0, 0%, 100%)"),
    0.25
  );
  directionalLightFront.position.set(-30, 100, -100);
  master.scene.add(directionalLightFront);
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
  for (let i = 0; i < triangles.length; i++) {
    let tri = triangles[i];
    tri.rotation.x += 0.001;
  }

  upper.renderer.render(upper.scene, upper.camera);
  lower.renderer.render(lower.scene, lower.camera);
// upper.postprocessing.composer.render( 0.1 );
// lower.postprocessing.composer.render( 0.1 );
requestAnimationFrame(Render);
}

function onWindowResize() {
  upper.camera.aspect = window.innerWidth / window.outerHeight;
  lower.camera.aspect = window.innerWidth / window.outerHeight;
  upper.camera.updateProjectionMatrix();
  lower.camera.updateProjectionMatrix();
  upper.renderer.setSize(window.innerWidth, window.outerHeight);
  lower.renderer.setSize(window.innerWidth, window.outerHeight);
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
  upper.camera.position.y = scrollPos * -0.1;
  lower.camera.position.y = scrollPos * -0.1;
  // Render the scene
  upper.renderer.render(upper.scene, upper.camera);
  lower.renderer.render(lower.scene, lower.camera);

}
