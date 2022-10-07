import * as THREE from "three";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
// import { loaded } from "./../stores/var.js";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  loader = new THREE.TextureLoader(),
  uniforms,
  clock = new THREE.Clock(),
  path = "img/Planets/";

const fragmentShader = `
            #include <common>
            #define TWO_PI 6.28318530718
            uniform vec2 iResolution;
            uniform float iTime;

            //  https://www.shadertoy.com/view/MsS3Wc
            vec3 hsb2rgb( in vec3 c ){
                vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                        6.0)-3.0)-1.0,
                                0.0,
                                1.0 );
                rgb = rgb*rgb*(3.0-2.0*rgb);
                return c.z * mix( vec3(1.0), rgb, c.y);
            }

            void main(){
                vec2 st = gl_FragCoord.xy/iResolution;
                vec3 color = vec3(0.0);

                // Use polar coordinates instead of cartesian
                vec2 toCenter = vec2(0.5)-st;
                float angle = atan(toCenter.y,toCenter.x);
                float radius = length(toCenter)*2.0;

                // Map the angle (-PI to PI) to the Hue (from 0 to 1)
                // and the Saturation to the radius
                color = hsb2rgb(vec3((angle/TWO_PI)+0.5+iTime/10.,radius,1.0));

                gl_FragColor = vec4(color,abs(sin(iTime))+0.1);
            }`;
let PARAMS = {
  camera: {
    mesh: undefined,
    position: {
      0: new THREE.Vector3(70, 10, 870),
      1: new THREE.Vector3(265, 35, -470),
      2: new THREE.Vector3(276.4, 21.2, -520),
    },
  },
  main: {
    name: "main",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo: "planet1/albedo.jpg",
      roughness: "planet1/roughness.jpg",
      normal: "planet1/normal.jpg",
      metalness: "planet1/metalness.jpg",
      ao: "planet1/ambientocclusion.jpg",
    },
    rotationSpeed: 1,
    cache: {
      albedo: undefined,
      roughness: undefined,
      normal: undefined,
      ao: undefined,
    },
    position: {
      0: new THREE.Vector3(-5, 0, 600),
    },
    pivotRotation: {
      0: 0,
      1: 0,
    },
  },
  moon: {
    name: "moon",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo: "planet1-full.jpg",
      roughness: "planet1/roughness.jpg",
      normal: "planet1/normal.jpg",
      ao: "planet1/ambientocclusion.jpg",
    },
    rotationSpeed: 1.2,
    cache: {
      albedo: undefined,
      roughness: undefined,
      normal: undefined,
      ao: undefined,
    },
    position: {
      0: new THREE.Vector3(100, 0, -600),
    },
    pivotRotation: {
      0: -0.1 * Math.PI,
      1: -0.12 * Math.PI,
    },
  },
  earth: {
    name: "earth",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo: "planet3-full.jpg",
      roughness: "planet1/roughness.jpg",
      normal: "planet1/normal.jpg",
      ao: "planet1/ambientocclusion.jpg",
    },
    rotationSpeed: 1.4,
    cache: {
      albedo: undefined,
      roughness: undefined,
      normal: undefined,
      ao: undefined,
    },
    position: {
      0: new THREE.Vector3(100, 0, -600),
    },
    pivotRotation: {
      0: 1.7 * Math.PI,
      1: 3.1 * Math.PI,
    },
  },
  planetClouds: {
    name: "planetClouds",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo: "clouds.jpg",
      alphaMap: "clouds.jpg",
    },
    rotationSpeed: 1.1,
    cache: {
      albedo: undefined,
      roughness: undefined,
      normal: undefined,
      ao: undefined,
    },
    position: {
      0: new THREE.Vector3(0, 0, 0),
    },
    pivotRotation: {
      0: 0,
      1: 0,
    },
  },
};
Start();
function Start() {
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  SetupCamera();
  LoadTextures();
//   SetupGUI();

  function SetupCamera() {
    camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.set(
      PARAMS.camera.position[0].x,
      PARAMS.camera.position[0].y,
      PARAMS.camera.position[0].z
    );
    scene.add(camera);
  }

  function LoadTextures() {
    const manager = new THREE.LoadingManager();
    manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      var loader = document.getElementById("loadBar_internal");
      loader.style.width = progress * 100 + "%";
      console.log(`Last loaded item: ${urlOfLastItemLoaded}`);
      console.log(`Progess: ${progress * 100}%`);
      if (progress == 1) {
        loader.parentElement.parentElement.style.display = "none";
        // GenerateSpace();
      }
    };

    const textureLoader = new THREE.TextureLoader(manager);
    let texturePromise = new Promise(function (resolve, reject) {

        LoadTextures('main');
        LoadTextures('moon');
        LoadTextures('earth');
        // LoadTextures('planetClouds');

        function LoadTextures(planet){
            PARAMS[planet].cache = 
            {
                albedo: textureLoader.load(path + PARAMS[planet].texture.albedo),
                roughness: textureLoader.load(path + PARAMS[planet].texture.roughness),
                normal: textureLoader.load(path + PARAMS[planet].texture.normal),
                ao: textureLoader.load(path + PARAMS[planet].texture.ao),
            }
        }

        if (PARAMS['planetClouds'].texture.ao) {
            resolve();
          } else {
            reject();
          }
    });
    
    texturePromise.then(
        function (value) {
          console.log(`It's done: ${textureCache.planet.ao}`);
          // generateSpace();
        },
        function (error) {
          console.log(error);
        }
      );
  }
}


// CreatePlanet("planet", 70, start.main, scene, 25, 5);
  // CreatePlanet("moon", 22, start.sec, pivots[0].obj, 20, 5);
  // CreatePlanet("earth", 0.5, start.third, empties[1].obj, 15, 0);
  // CreatePlanet("earthClouds", 71, start.main, scene, 25, 5);

  let start = {
    //   camera: new THREE.Vector3(120, 0, 1100),
    //   // camera: new THREE.Vector3(265, 35, -470),
    //   sun: new THREE.Vector3(2340, 0, 1320),
    //   main: new THREE.Vector3(-5, 0, 600),
    //   sec: new THREE.Vector3(100, 0, -600),
    //   third: new THREE.Vector3(38, -9, 0),
    //   secPivot: -1.17,
    // };