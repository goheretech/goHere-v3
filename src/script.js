import * as THREE from "three";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { BackSide } from "three";
// import { loaded } from "./../stores/var.js";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,topPixel,bottomPixel,scrollPosition, percent,ambientLight;

let loader = new THREE.TextureLoader();
let MAIN, MAINCLOUDS, MOON, MOONCLOUDS, EARTH, EARTHCLOUDS;

GetContainerInfo('#rail-planets','.l','#cart-planets');
//
//
//

let
  CAMERA= {
    position: {
      0: new THREE.Vector3(299, 30, 771),
      1: new THREE.Vector3(299, -4.72, 771),
      2: new THREE.Vector3(210, 232.55, -508.24),
      3: new THREE.Vector3(210, 193, -508.24),
    },
    rotation: {
      0: new THREE.Vector3(0.1,0,0),
      1: new THREE.Vector3(0,0,0),
      2: new THREE.Vector3(0,0,0),
      2: new THREE.Vector3(0,0,0),
    },
  },
  SUN= {
    mesh: undefined,
    pivot: undefined,
    orbitDistance: 150000,
    period: [3.61,1.4, -1.38, -1.38],
    tilt: 0.2,
  };

  let RINGS = {
    mesh: undefined,
    texture: {
      albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343257376d014654f1d4835_albedo.jpg",
    alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9e4da79c9192eadb5ce_alpha.jpg"
    },
    cache: {
      albedo: undefined,
      roughness: undefined,
      normal: undefined,
      ao: undefined,
      alphaMap: undefined,
    },
    parent: "moon",
      size: 50,
      detail: 60,
      tilt: 0,
  }

  // SUN.tilt
  let PLANETS = {
    main: {
      name: "main",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255b86548a459069a6cf_albedo.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255b025b9f0485593c65_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255b317ef9e218d8196d_normal.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255bc2d4ac1ef8534279_ao.jpg",
      },
      rotationSpeed: 1,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "sun",
      size: 140,
      detail: 25,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    moon: {
      name: "moon",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      type:'baked',
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/634325e476d014a9f61d4e47_albedo-baked.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9bde3265c1934319f6b_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9be3b96bc14b560acad_normal.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9bee3265ca86c319f6c_ao.jpg",
      },
      rotationSpeed: 1.2,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "main",
      size: 22,
      detail: 60,
      orbitDistance: 710,
      period: [2.37, 2.37, 2.78, 2.78],
      tilt: 0.35,
    },
    earth: {
      name: "earth",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a698f0f6314c43da43_albedo.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a62c7f35550916747a_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a7e3265c79f6319f47_normal.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a73b96bc12ed60aba0_ao.jpg",
      },
      rotationSpeed: 1.6,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "moon",
      size: 0.5,
      detail: 20,
      orbitDistance:60,
      period: [-2.6,-2.6,1.63,1.63],
      tilt: 0.42,
    },
    mainClouds: {
      name: "mainClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255b407836519df4b9fc_clouds.jpg",
        alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6343255b407836519df4b9fc_clouds.jpg",
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "main",
      size: 142,
      detail: 25,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    moonClouds: {
      name: "moonClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9beb9d4cec06b9c861b_clouds.jpg",
        alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9be44f1dcd78c6f1288_clouds-alpha.jpg"
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "moon",
      size: 22.1,
      detail: 40,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    earthClouds: {
      name: "earthClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a7eae8f4a52077e133_clouds.jpg",
    alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a704a965150a6abe25_clouds-alpha.jpg"
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "earth",
      size: 0.51,
      detail: 20,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
  };

  let path = "";

  // PLANETS.main.texture = {
  //   albedo: "img/Planets/planet1/albedo.jpg",
  //   roughness: "img/Planets/planet1/roughness.jpg",
  //   normal: "img/Planets/planet1/normal.jpg",
  //   metalness: "img/Planets/planet1/metalness.jpg",
  //   ao: "img/Planets/planet1/ambientocclusion.jpg",
  // };
  // PLANETS.moon.texture = {
  //   albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9be98f0f6390843daeb_albedo.jpg",
  //   roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9bde3265c1934319f6b_roughness.jpg",
  //   normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9be3b96bc14b560acad_normal.jpg",
  //   ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9bee3265ca86c319f6c_ao.jpg",
  // };
  
  // PLANETS.mainClouds.texture = {
  //   albedo: "img/Planets/clouds.jpg",
  //   alphaMap: "img/Planets/clouds.jpg"
  // };
  // PLANETS.moonClouds.texture = {
    
  //   albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9beb9d4cec06b9c861b_clouds.jpg",
  //   alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9be44f1dcd78c6f1288_clouds-alpha.jpg"
  // };
  // PLANETS.earthClouds.texture = {
  //   albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a7eae8f4a52077e133_clouds.jpg",
  //   alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a704a965150a6abe25_clouds-alpha.jpg"
  // };
  
  path = "";

let uniforms;

//Page Length Percent
var ratio = 43.8;

let clock = new THREE.Clock();


// let textureCache = new Object();




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

function SetupGUI() {
  const gui = new dat.GUI();
  // gui.domElement.id = 'gui';
  ///Camera
  let guiCamera = gui.addFolder("Camera");

  let guiCameraPos = guiCamera.addFolder("Camera Position");
  guiCameraPos
    .add(camera.position, "x", -3000, 3000, 0.01)
    .name("X")
    .onChange((value) => {
      camera.position.x = value;
    });
  guiCameraPos
    .add(camera.position, "y", -3000, 3000, 0.01)
    .name("y")
    .onChange((value) => {
      camera.position.y = value;
    });
  guiCameraPos
    .add(camera.position, "z", -3000, 3000, 0.01)
    .name("z")
    .onChange((value) => {
      camera.position.z = value;
    });
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
 
  ///Sun
  let guiSun = gui.addFolder("Sun");
  guiSun
    .add(SUN.mesh, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      SUN.mesh.intensity = value;
    });

  guiSun
    .add(SUN.mesh.position, "z", 0, 1000000, 10)
    .name("Orbit Distance")
    .onChange((value) => {
      SUN.mesh.position.z = value;
    });

  guiSun
    .add(SUN.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      SUN.pivot.rotation.y = value;
      RINGS.mesh.rotation.z  = value -(Math.PI/2);
    });
    guiSun
    .add(SUN.pivot.rotation, "x", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      SUN.pivot.rotation.x = value;
    });

  let guiMoon = gui.addFolder("Moon");
    console.log(MOON.mesh.geometry);
  
  
  guiMoon
    .add(MOON.empty.position, "z", 0, 1200, 10)
    .name("Orbit Distance")
    .onChange((value) => {
      MOON.mesh.position.z = value;
      MOON.empty.position.z = value;
    });

  guiMoon
    .add(MOON.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      MOON.pivot.rotation.y = value;
    });
  guiMoon
    .add(MOON.pivot.rotation, "z", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      MOON.pivot.rotation.x = value;
    });

  let guiEarth = gui.addFolder("Earth");
  
  guiEarth
    .add(EARTH.mesh.position, "z", 0, 60, 0.1)
    .name("Orbit Distance")
    .onChange((value) => {
      EARTH.mesh.position.z = value;
      EARTH.empty.position.z = value;
    });

  guiEarth
    .add(EARTH.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      EARTH.pivot.rotation.y = value;
    });
  guiEarth
    .add(EARTH.pivot.rotation, "z", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      EARTH.pivot.rotation.x = value;
    });
  // ///Ambient Light
  // console.log(light);
  let guiAL = gui.addFolder("Ambient Light");
  guiAL
    .add(ambientLight, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      ambientLight.intensity = value;
    });
}
init();
function init() {
  MAIN = PLANETS.main;
  MAINCLOUDS = PLANETS['mainClouds'];
  MOONCLOUDS = PLANETS['moonClouds'];
  EARTHCLOUDS = PLANETS['earthClouds'];
  MOON = PLANETS.moon;
  EARTH = PLANETS.earth;
  uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
  };
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.getElementById("canvas").style.zIndex = "-1";
  //Camera
  CreateCamera();

  loadTextures();
  renderer.setClearColor(0xeb4034, 0);

  function CreateCamera() {
    camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.set(
      CAMERA.position[0].x,
      CAMERA.position[0].y,
      CAMERA.position[0].z
    );
    scene.add(camera);
  }
}

function render() {
  let delta = clock.getDelta();
  var time = clock.elapsedTime;

  // Object.keys(PLANETS).forEach(key => {
  //     PLANETS[key].mesh.rotation.y += ((delta * PLANETS[key].rotationSpeed * Math.PI) / 180);
  // });

  uniforms.iResolution.value.set(canvas.width, canvas.height);
  uniforms.iTime.value = time;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
function createClouds(pos, num, x, y, z) {
  loader.load(
    "https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/smoke-1.png",
    (texture) => {
      const geo = new THREE.PlaneBufferGeometry(80, 80);
      const mat = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
      });
      for (let p = 0; p < num; p++) {
        const cloud = new THREE.Mesh(geo, mat);
        cloud.position.set(
          pos.x + (Math.random() * 20 * x - 10 * x),
          pos.y + (Math.random() * 20 * y - 10 * y),
          pos.z + (Math.random() * 20 * z - 10 * z)
        );
        cloud.rotation.z = Math.random() * 2 * Math.PI;
        cloud.material.opacity = 0.2;
        clouds.push(cloud);
        scene.add(cloud);
      }
    }
  );
  // createLight(colors.orange);
  // createLight(colors.blue);
  // createLight(colors.purple);

  function createLight(color) {
    let params = {
      intensity: 10,
      distance: 200,
      falloff: 9,
    };
    const light = new THREE.PointLight(
      color,
      params.intensity,
      params.distance,
      params.falloff
    );
    light.position.set(
      pos.x + (Math.random() * 10 - 5),
      pos.y + (Math.random() * 10 - 5),
      pos.z + Math.random() * 5
    );
    lights.push(light);
    scene.add(light);
  }
}
function loadTextures() {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    var loader = document.getElementById("loadbar_internal");
    const progress = itemsLoaded / itemsTotal;
    loader.style.width = progress * 100 + "%";
    console.log(`Last loaded item: ${urlOfLastItemLoaded}`);
    console.log(`Progess: ${progress * 100}%`);
    if (progress == 1) {
      loader.parentElement.parentElement.style.display = "none";
      generateSpace();
    }
  };
  const textureLoader = new THREE.TextureLoader(manager);
  let texturePromise = new Promise(function (resolve, reject) {
    GetTextures(MAIN);
    GetTextures(MOON);
    // GetTextures(EARTH);
    GetTextures(MAINCLOUDS);
    // GetTextures(MOONCLOUDS);
    // GetTextures(EARTHCLOUDS);
    GetTextures(RINGS);

    function GetTextures(planet) {
      planet.textureCache = {
        albedo: textureLoader.load(path + planet.texture.albedo),
        roughness: textureLoader.load(path + planet.texture.roughness),
        normal: textureLoader.load(path + planet.texture.normal),
        metalness: textureLoader.load(path + planet.texture.metalness),
        ao: textureLoader.load(path + planet.texture.ao),
        
      };
      if(planet.texture.alphaMap)
      {
        planet.textureCache.alphaMap = textureLoader.load(path + planet.texture.alphaMap);
        console.log("Adding alpha map to "+planet.name);
      }
    }
    

    if (MAIN.textureCache.ao) {
      resolve();
    } else {
      reject();
    }
  });

  texturePromise.then(
    function (value) {
      console.log(`It's done: ${MAIN.textureCache.ao}`);
      // generateSpace();
    },
    function (error) {
      console.log(error);
    }
  );
}

function generateSpace() {
  GenerateSun();
  GenerateAmbient();
  GeneratePlanet("main");
  GeneratePlanet("moon");
  // GeneratePlanet("earth");
  GeneratePlanet("mainClouds");
  // GeneratePlanet("moonClouds");
  // GeneratePlanet("earthClouds");
  GenerateRings(RINGS);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
  // SetupGUI();
}
function GenerateAmbient()
{
  ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);
}
function GenerateSun() {
  let pivot = new THREE.Mesh();
  let sunMat = new THREE.MeshStandardMaterial({
    emissiveIntensity: 0.85,
    // emissive: 0xf5e6f0, // darkgrey
    emissive: 0xffffff, // darkgrey
  });
  let sunGeo = new THREE.IcosahedronGeometry(10, 6);
  // let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
  let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
  sun.add(new THREE.Mesh(sunGeo, sunMat));
  // sun.castShadow = true;

  sun.shadow.mapSize.width = 262144; // default
  sun.shadow.mapSize.height = 262144; // default
  sun.shadow.camera.near = 0.5; // default
  sun.shadow.camera.far = 50000000;
  // sun.shadow.

  // sun.position.set(SUN.position[0].x, SUN.position[0].y, SUN.position[0].z);
  console.log(`Sun Orbit Distance ${SUN.orbitDistance}`);
  sun.position.set(0, 0, SUN.orbitDistance);
  pivot.rotation.set(SUN.tilt, SUN.period[0], 0);

  scene.add(pivot);
  pivot.add(sun);
  SUN.mesh = sun;
  SUN.pivot = pivot;
}
function GeneratePlanet(planet) {
  let pivot = new THREE.Mesh();
  let empty = new THREE.Mesh();
  let planetDetails = PLANETS[planet];
  let cache = planetDetails.textureCache;
  let planetMat = new THREE.MeshStandardMaterial({
    map: cache.albedo,
    roughnessMap: cache.roughness,
    normalMap: cache.normal,
    metalnessMap: cache.metalness,
    aoMap: cache.ao,
    color:0xffffff,
    // alphaMap:texturesArray[3],
    transparent: true,
    metalness: 0.0,
    roughness: 0.5,
  });
  if (cache.alphaMap) {
    planetMat.alphaMap = cache.alphaMap;
  };

  if (planet == 'mainClouds' || planet == 'moonClouds' || planet == 'earthClouds')
  {
    planetMat = new THREE.MeshStandardMaterial({
      color:0xffffff,
      map:cache.albedo,
      alphaMap:cache.alphaMap,
      transparent: true,
      metalness: 0.0,
      roughness: 0.5,
    });

  }
  let planetGeo = new THREE.SphereGeometry(
    planetDetails.size,
    planetDetails.detail,
    planetDetails.detail
  );

  if(planetDetails.type == 'baked')
  planetMat.normalMap = null;

  let planetMesh = new THREE.Mesh(planetGeo, planetMat);
  
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  if (planet != 'mainClouds' || planet != 'moonClouds' || planet != 'earthClouds')
  {
    planetMesh.castShadow = true;
  }
  // pivot.rotation.z = (Math.PI / 180) * planetDetails.angle;
  if (planetDetails.parent != "sun") {
    parent = PLANETS[planetDetails.parent].empty;
  } else {
    parent = scene;
  }

  

  parent.add(pivot);
  pivot.add(planetMesh);
  pivot.add(empty);
  planetMesh.position.set(0, 0, planetDetails.orbitDistance);
  pivot.rotation.set(planetDetails.tilt, planetDetails.period[0], 0);
  console.log(planet);
  empty.position.set(0, 0, planetDetails.orbitDistance);
  // if (pName == "moon") {
  //   var rings = [
  //     createRing(28, 0.1, 1),
  //     createRing(33, 1.1, 3),
  //     createRing(36, 0.3, -2),
  //     createRing(43, 3.1, -3),
  //     createRing(48, 0.4, 1),
  //     createRing(43, 0.4, 1),
  //   ];
  // }
  planetDetails.empty = empty;
  planetDetails.pivot = pivot;
  planetDetails.mesh = planetMesh;
}
function GenerateRings(rings) {
  let ringsDetails = rings;
  let cache = ringsDetails.textureCache;
  let ringsMat = new THREE.MeshBasicMaterial({
    map: cache.albedo,
    alphaMap: cache.alphaMap,
    transparent: true,
    metalness: 0.0,
    roughness: 0.2,
  });
  

  
  let ringsGeo = new THREE.CircleGeometry(
    ringsDetails.size,
    ringsDetails.detail
  );
  let ringsMesh = new THREE.Mesh(ringsGeo, ringsMat);
  ringsMesh.castShadow = false;
  ringsMesh.receiveShadow = true;
  // pivot.rotation.z = (Math.PI / 180) * ringsDetails.angle;
    parent = PLANETS[ringsDetails.parent].empty;

  
    ringsMesh.rotation.set( -Math.PI/2, 0, -Math.PI/2);
    ringsMesh.castShadow = true;
    ringsMesh.receiveShadow = true;
  parent.add(ringsMesh);
 
  ringsDetails.mesh = ringsMesh;
}

function createRing(innerW, width, z) {
  let mat = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
  });
  let geo = new THREE.RingGeometry(innerW, innerW + width, 360);
  var ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = (-90 * Math.PI) / 180;
  MOON.mesh.add(ring);
  return ring;
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.outerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.outerHeight);
}
function onScroll() {
  //Get percent scrolled
  ScrollThrough();
  // OldScroll();
}



function GetContainerInfo(div,offset,cart) {
  topPixel = $(div).offset().top - $(offset).height();
  bottomPixel = $(div).position().top +
    $(div).outerHeight(true) -
    $(cart).height();
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function ScrollThrough()
{
      scrollPosition = GetScrollTop();
      percent = GetPercent(scrollPosition, topPixel, bottomPixel);
      percent = clamp(percent, 0, 100);
      console.log("Scrolled: " + percent+"%");
      let sections = 3;
      if(percent<(100/sections))
      {
        let p = percent*sections;
        console.log('Section 1: '+p);
        let v=p/100;
        LerpAll(0,v);

      }else if(percent<(100/sections)*2)
      {
        let p = (percent-(100/sections))*sections;
        console.log('Section 2: '+p);
        let v=p/100;
        LerpAll(1,v);

      }else if(percent<=100)
      {
        let p = (percent-(100/sections)*2)*sections;
        console.log('Section 3: '+p);
        let v=p/100;
        LerpAll(2,v);

      }else if(percent<=100)
      {
        let p = (percent-(100/sections)*3)*sections;
        console.log('Section 4: '+p);
        let v=p/100;
        LerpAll(3,v);
      }

  function LerpAll(x,v) {
    LerpCameraPosition(x, v);
    LerpCameraRotation(x, v);
    LerpPivot(MAIN, x, v);
    // LerpPivot(EARTH, x, v);
    LerpPivot(MOON, x, v);
    LerpPositionSun(x, v);
  }

      function LerpCameraPosition(i, v) {
        camera.position.x = lerp(
          CAMERA.position[i].x,
          CAMERA.position[i + 1].x,
          v
        );
        camera.position.y = lerp(
          CAMERA.position[i].y,
          CAMERA.position[i + 1].y,
          v
        );
        camera.position.z = lerp(
          CAMERA.position[i].z,
          CAMERA.position[i + 1].z,
          v
        );
      }

      function LerpCameraRotation(i, v) {
        camera.rotation.x = lerp(
          CAMERA.rotation[i].x,
          CAMERA.rotation[i + 1].x,
          v
        );
        camera.rotation.y = lerp(
          CAMERA.rotation[i].y,
          CAMERA.rotation[i + 1].y,
          v
        );
        camera.rotation.z = lerp(
          CAMERA.rotation[i].z,
          CAMERA.rotation[i + 1].z,
          v
        );
      }
    
      function LerpPivot(pName, i, v) {
        pName.pivot.rotation.y = lerp(
          pName.period[i],
          pName.period[i + 1],
          v
        );
      }
      function LerpPositionSun(i, v) {
        // SUN.mesh.position.set(
        //   0,
        //   0,
        //   lerp(SUN.orbitDistance[i], SUN.orbitDistance[i + 1], v)
        // );
        SUN.pivot.rotation.set(
          lerp(SUN.tilt, SUN.tilt, v),
          lerp(SUN.period[i], SUN.period[i + 1], v),
          0
        );
        RINGS.mesh.rotation.z  = lerp(SUN.period[i]-(Math.PI/2), SUN.period[i + 1]-(Math.PI/2), v)
        
      }
}
function GetScrollTop() {
  return (
    window.pageYOffset ||
    (document.documentElement || document.body.parentNode || document.body)
      .scrollTop
  );
}
function GetPercent(sp, t, b) {
  return (100 * (sp - t)) / (b - t);
}
 

function lerp(min, max, value) {
  return (max - min) * easeInOut(value) + min;
}

function easeInOut(x)
{
  
  return -(Math.cos(Math.PI * x) - 1) / 2;
    
}
function removeLoad() {}
