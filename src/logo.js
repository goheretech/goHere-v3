console.log('updated');

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.148.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.148.0/examples/jsm/loaders/GLTFLoader.js";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  uniforms,
  irridescentMaterial,
  envMap;

  let isIrridescent = true;

let data = {};

let logo,
  light,
  clock = new THREE.Clock();

let start = {
  camera: {
    position: new THREE.Vector3(0, 0, 100),
    rotation: new THREE.Vector3(0, 0, 0),
  },
  logo: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Vector3(0, 0, 0),
  },
  light: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    intensity: 1.0,
  },
  ambient: { intensity: 1.0 },
};

let standardMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

let logoMaterials = 
[
    LogoMaterial(0xEB1620),
    LogoMaterial(0xF0671D),
    LogoMaterial(0xF0CB2E),
    LogoMaterial(0x2EEC70),
    LogoMaterial(0x18EEE1),
    LogoMaterial(0x4528FB),
    LogoMaterial(0xFF18A3),
];

function LogoMaterial(clr)
{
  return new THREE.MeshStandardMaterial(
  {
    color: clr,
    metalness: 1.0,
    roughness:0.1,
    envMap: envMap
  });
}


Start();

function Start() {
  console.log("it's start!")
  SetupEnvMap();
  SetupIridescentMaterial();
  SetupRenderer();
  SetupCamera();
  SetupLogo();
  // SetupIridescent();
  // SetupLight();
  SetupGUI();
  FinalRender();
}

function SetupEnvMap() {
  // load the cubemap textures
  var path = "../static/img/Tantolunden2/";
  var format = ".jpg";
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

function SetupIridescentMaterial() {
  uniforms = {
    time: { type: "f", value: 0.0 },
    baseColor: { type: "c", value: new THREE.Color(0xffffff) },
    
    iridescenceAmount: { type: "f", value: 0.20 },
    iridescenceColor: { type: "c", value: new THREE.Color(0xffffff) },
    iridescenceVector: { type: "v3", value: new THREE.Vector3(0, 1, 0) },
    refractionIndex: { type: "f", value: 0.9 },
    localCameraPosition: { type: "v3", value: new THREE.Vector3() },
    samplerCube: envMap,
  };

  irridescentMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 worldPosition;
      varying vec3 worldNormal;
      varying vec2 vUv;
      void main() {
          vNormal = normal;
          vUv = uv;
          worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          worldNormal = (modelMatrix * vec4(normal, -10.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 baseColor;
      uniform float iridescenceAmount;
      uniform vec3 iridescenceColor;
      uniform vec3 iridescenceVector;
      uniform float refractionIndex;
      uniform vec3 localCameraPosition;
      uniform samplerCube envMap;
  
      
  
  
      vec3 rainbow(float t) {
        t = fract(t);
        float r = abs(t * 6.0 - 3.0) - 1.0;
        float g = 2.0 - abs(t * 6.0 - 2.0);
        float b = 2.0 - abs(t * 6.0 - 4.0);
        return vec3(clamp(r, 0.0, 1.0), clamp(g, 0.0, 1.0), clamp(b, 0.0, 1.0));
      }
        varying vec3 worldPosition;
        varying vec3 worldNormal;
        vec3 refractedColor;
        varying vec2 vUv;
        
        void main() {
           
          
    
            vec3 I = normalize(cameraPosition - worldPosition);
            vec3 N = normalize(worldNormal);
            float eta = 1.0 / refractionIndex;
            vec3 refractionVector = refract(I, N, eta);
            float k = 1.0 - eta * eta * (1.0 - dot(I, N) * dot(I, N));
  
            vec3 envColor = textureCube(envMap, refractionVector).rgb;
  
            float iridescence = pow(dot(worldNormal, I), abs(sin(iridescenceAmount*time))+0.5);
            vec3 color = mix(baseColor, rainbow(iridescence), iridescence);
  
            refractedColor = mix(color, vec3(0.0, 0.0, 0.0), step(k, 0.0));
            gl_FragColor = vec4(mix(color, envColor, iridescence), 1.0-iridescence+0.2);
  
        }
      `,
  });

  irridescentMaterial.transparent = true;
  irridescentMaterial.blending = THREE.CustomBlending;
  irridescentMaterial.blendSrc = THREE.SrcAlphaFactor;
  irridescentMaterial.blendDst = THREE.OneMinusSrcAlphaFactor;
  irridescentMaterial.blendEquation = THREE.AddEquation;
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
  // scene.background = envMap;
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
  const controls = new OrbitControls(camera, renderer.domElement);
}
function SetupTestMesh()
{
  let geometry = new THREE.TorusKnotGeometry(10, 4, 100, 32);

  logo = new THREE.Mesh(geometry, irridescentMaterial);
  logo.material.side = THREE.DoubleSide;

  scene.add(logo);
}
function SetupLogo() {
  
  const loader = new GLTFLoader().setPath("../static/models/");
  loader.load("betterLogo.glb", function (gltf) {
    
    logo = gltf.scene.children[0];
    let logo2 = gltf.scene.children[1];
    // scene.add(gltf.scene);
    console.log(logo);
    for (let i = 0; i < logo.children.length; i++) {
      if(isIrridescent)
      {
        logo2.children[i].material = irridescentMaterial;
      }else{
        // logo.children[i].material = logoMaterials[i];
      }
    }
  });

  loader.load("hololens.glb", function (gltf) {
    
    scene.add(gltf.scene);
    FinalRender();

  });


}

// function SetupIridescent() {
//   const loader = new GLTFLoader().setPath("../static/models/");
//   loader.load("testCube.glb", function (gltf) {
//     scene.add(gltf.scene);

//     FinalRender();
//   });
// }

function FinalRender() {
  renderer.render(scene, camera);
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

function ToggleMaterial()
{

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

  // logo.parent.rotation.x += 0.001;
  // logo.parent.rotation.y += 0.001;
  irridescentMaterial.uniforms.localCameraPosition.value = camera.position;

  // iridescentShaderMaterial.uniforms.time.value = performance.now() / 1000;
  irridescentMaterial.uniforms.time.value += 0.01;
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
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100; //0 to 100
}
