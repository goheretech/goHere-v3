import * as THREE from "three";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { BackSide } from "three";
// import { loaded } from "./../stores/var.js";



/**
 * @classdesc
 * ThinFilmFresnelMap is a lookup texture containing the reflection colour. The texture index value
 * is dot(normal, view). The texture values are stored in approximated gamma space (power 2.0), so
 * the sampled value needs to be multiplied with itself before use. The sampled value should replace
 * the fresnel factor in a PBR material.
 *
 * @property filmThickness The thickness of the thin film layer in nanometers. Defaults to 380.
 * @property refractiveIndexFilm The refractive index of the thin film. Defaults to 2.
 * @property refractiveIndexBase The refractive index of the material under the film. Defaults to 3.
 *
 * @constructor
 * @param filmThickness The thickness of the thin film layer in nanometers. Defaults to 380.
 * @param refractiveIndexFilm The refractive index of the thin film. Defaults to 2.
 * @param refractiveIndexBase The refractive index of the material under the film. Defaults to 3.
 * @param size The width of the texture. Defaults to 64.
 *
 * @extends DataTexture
 *
 * @author David Lenaerts <http://www.derschmale.com>
 */
 class ThinFilmFresnelMap extends THREE.DataTexture {

  constructor(filmThickness=380.0, refractiveIndexFilm=2, refractiveIndexBase=3, size=64) {

      const data = new Uint8Array(size * 4);
      super(data, size, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter);

      this._filmThickness = filmThickness;
      this._refractiveIndexFilm = refractiveIndexFilm;
      this._refractiveIndexBase = refractiveIndexBase;
      this._size = size;
      this._data = data;
    
      this._updateData();
    
      this.generateMipmaps = true;
      this.needsUpdate = true;
  }

  get filmThickness() {
    return this._filmThickness;
  }
  set filmThickness(value) {
    this._filmThickness = value;
    this.updateSettings(this._filmThickness, this._refractiveIndexFilm, this._refractiveIndexBase);
  }

  get refractiveIndexFilm() {
    return this._refractiveIndexFilm;
  }
  set refractiveIndexFilm(value) {
    this._refractiveIndexFilm = value;
    this.updateSettings(this._filmThickness, this._refractiveIndexFilm, this._refractiveIndexBase);
  }

  get refractiveIndexBase() {
    return this._refractiveIndexBase;
  }
  set refractiveIndexBase(value) {
    this._refractiveIndexBase = value;
    this.updateSettings(this._filmThickness, this._refractiveIndexFilm, this._refractiveIndexBase);
  }


  /**
   * Regenerates the lookup texture given new data.
   * @param filmThickness The thickness of the thin film layer in nanometers. Defaults to 380.
   * @param refractiveIndexFilm The refractive index of the thin film. Defaults to 2.
   * @param refractiveIndexBase The refractive index of the material under the film. Defaults to 3.
   */
  updateSettings(filmThickness, refractiveIndexFilm, refractiveIndexBase) {
    this._filmThickness = filmThickness || 380;
    this._refractiveIndexFilm = refractiveIndexFilm || 2;
    this._refractiveIndexBase = refractiveIndexBase || 3;
    this._updateData();
  };

  /**
   * @private
   */
  _fresnelRefl(refractiveIndex1, refractiveIndex2, cos1, cos2, R, phi) {
    // r is amplitudinal, R is power
    var sin1Sqr = 1.0 - cos1 * cos1;  // = sin^2(incident)
    var refrRatio = refractiveIndex1 / refractiveIndex2;

    if (refrRatio * refrRatio * sin1Sqr > 1.0) {
      // total internal reflection
      R.x = 1.0;
      R.y = 1.0;

      var sqrRefrRatio = refrRatio * refrRatio;
      // it looks like glsl's atan ranges are different from those in JS?
      phi.x = 2.0 * Math.atan(-sqrRefrRatio * Math.sqrt(sin1Sqr - 1.0 / sqrRefrRatio) / cos1);
      phi.y = 2.0 * Math.atan(-Math.sqrt(sin1Sqr - 1.0 / sqrRefrRatio) / cos1);
    } else {
      var r_p = (refractiveIndex2 * cos1 - refractiveIndex1 * cos2) / (refractiveIndex2 * cos1 + refractiveIndex1 * cos2);
      var r_s = (refractiveIndex1 * cos1 - refractiveIndex2 * cos2) / (refractiveIndex1 * cos1 + refractiveIndex2 * cos2);

      phi.x = r_p < 0.0 ? Math.PI : 0.0;
      phi.y = r_s < 0.0 ? Math.PI : 0.0;

      R.x = r_p * r_p;
      R.y = r_s * r_s;
    }
  };

  /**
   * @private
   */
  _updateData() {
    var filmThickness = this._filmThickness;
    var refractiveIndexFilm = this._refractiveIndexFilm;
    var refractiveIndexBase = this._refractiveIndexBase;
    var size = this._size;

    // approximate CIE XYZ weighting functions from: http://jcgt.org/published/0002/02/01/paper.pdf
    function xFit_1931(lambda) {
      var t1 = (lambda - 442.0) * ((lambda < 442.0) ? 0.0624 : 0.0374);
      var t2 = (lambda - 599.8) * ((lambda < 599.8) ? 0.0264 : 0.0323);
      var t3 = (lambda - 501.1) * ((lambda < 501.1) ? 0.0490 : 0.0382);
      return 0.362 * Math.exp(-0.5 * t1 * t1) + 1.056 * Math.exp(-0.5 * t2 * t2) - 0.065 * Math.exp(-0.5 * t3 * t3);
    }

    function yFit_1931(lambda) {
      var t1 = (lambda - 568.8) * ((lambda < 568.8) ? 0.0213 : 0.0247);
      var t2 = (lambda - 530.9) * ((lambda < 530.9) ? 0.0613 : 0.0322);
      return 0.821 * Math.exp(-0.5 * t1 * t1) + 0.286 * Math.exp(-0.5 * t2 * t2);
    }

    function zFit_1931(lambda) {
      var t1 = (lambda - 437.0) * ((lambda < 437.0) ? 0.0845 : 0.0278);
      var t2 = (lambda - 459.0) * ((lambda < 459.0) ? 0.0385 : 0.0725);
      return 1.217 * Math.exp(-0.5 * t1 * t1) + 0.681 * Math.exp(-0.5 * t2 * t2);
    }

    var data = this._data;
    var phi12 = new THREE.Vector2();
    var phi21 = new THREE.Vector2();
    var phi23 = new THREE.Vector2();
    var R12 = new THREE.Vector2();
    var T12 = new THREE.Vector2();
    var R23 = new THREE.Vector2();
    var R_bi = new THREE.Vector2();
    var T_tot = new THREE.Vector2();
    var R_star = new THREE.Vector2();
    var R_bi_sqr = new THREE.Vector2();
    var R_12_star = new THREE.Vector2();
    var R_star_t_tot = new THREE.Vector2();

    var refrRatioSqr = 1.0 / (refractiveIndexFilm * refractiveIndexFilm);
    var refrRatioSqrBase = (refractiveIndexFilm * refractiveIndexFilm) / (refractiveIndexBase * refractiveIndexBase);

    // RGB is too limiting, so we use the entire spectral domain, but using limited samples (64) to
    // create more pleasing bands
    var numBands = 64;
    var waveLenRange = 780 - 380; // the entire visible range

    for (var i = 0; i < size; ++i) {
      var cosThetaI = i / size;
      var cosThetaT = Math.sqrt(1 - refrRatioSqr * (1.0 - cosThetaI * cosThetaI));
      var cosThetaT2 = Math.sqrt(1 - refrRatioSqrBase * (1.0 - cosThetaT * cosThetaT));

      // this is essentially the extra distance traveled by a ray if it bounds through the film
      var pathDiff = 2.0 * refractiveIndexFilm * filmThickness * cosThetaT;
      var pathDiff2PI = 2.0 * Math.PI * pathDiff;

      this._fresnelRefl(1.0, refractiveIndexFilm, cosThetaI, cosThetaT, R12, phi12);
      T12.x = 1.0 - R12.x;
      T12.y = 1.0 - R12.y;
      phi21.x = Math.PI - phi12.x;
      phi21.y = Math.PI - phi12.y;

      // this concerns the base layer
      this._fresnelRefl(refractiveIndexFilm, refractiveIndexBase, cosThetaT, cosThetaT2, R23, phi23);
      R_bi.x = Math.sqrt(R23.x * R12.x);
      R_bi.y = Math.sqrt(R23.y * R12.y);
      T_tot.x = Math.sqrt(T12.x * T12.x);
      T_tot.y = Math.sqrt(T12.y * T12.y);
      R_star.x = (T12.x * T12.x * R23.x) / (1.0 - R23.x * R12.x);
      R_star.y = (T12.y * T12.y * R23.y) / (1.0 - R23.y * R12.y);
      R_bi_sqr.x = R_bi.x * R_bi.x;
      R_bi_sqr.y = R_bi.y * R_bi.y;
      R_12_star.x = R12.x + R_star.x;
      R_12_star.y = R12.y + R_star.y;
      R_star_t_tot.x = R_star.x - T_tot.x;
      R_star_t_tot.y = R_star.y - T_tot.y;
      var x = 0, y = 0, z = 0;
      var totX = 0, totY = 0, totZ = 0;

      // TODO: we could also put the thickness in the look-up table, make it a 2D table
      for (var j = 0; j < numBands; ++j) {
        var waveLen = 380 + j / (numBands - 1) * waveLenRange;
        var deltaPhase = pathDiff2PI / waveLen;

        var cosPhiX = Math.cos(deltaPhase + phi23.x + phi21.x);
        var cosPhiY = Math.cos(deltaPhase + phi23.y + phi21.y);
        var valX = R_12_star.x + 2.0 * (R_bi.x * cosPhiX - R_bi_sqr.x) / (1.0 - 2 * R_bi.x * cosPhiX + R_bi_sqr.x) * R_star_t_tot.x;
        var valY = R_12_star.y + 2.0 * (R_bi.y * cosPhiY - R_bi_sqr.y) / (1.0 - 2 * R_bi.y * cosPhiY + R_bi_sqr.y) * R_star_t_tot.y;
        var v = .5 * (valX + valY);

        var wx = xFit_1931(waveLen);
        var wy = yFit_1931(waveLen);
        var wz = zFit_1931(waveLen);

        totX += wx;
        totY += wy;
        totZ += wz;

        x += wx * v;
        y += wy * v;
        z += wz * v;
      }

      x /= totX;
      y /= totY;
      z /= totZ;

      var r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
      var g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
      var b = 0.0557 * x - 0.2040 * y + 1.0570 * z;


      // console.log(r);
      // r = THREE.Math.clamp(r, 0.0, 1.0);
      // g = THREE.Math.clamp(g, 0.0, 1.0);
      // b = THREE.Math.clamp(b, 0.0, 1.0);

      // linear to gamma
      r = Math.sqrt(r);
      g = Math.sqrt(g);
      b = Math.sqrt(b);

      // CIE XYZ to linear rgb conversion matrix:
      // 3.2406 -1.5372 -0.4986
      // -0.9689  1.8758  0.0415
      // 0.0557 -0.2040  1.0570

      var k = i << 2;
      data[k] = Math.floor(r * 0xff);
      data[k + 1] = Math.floor(g * 0xff);
      data[k + 2] = Math.floor(b * 0xff);
      data[k + 3] = 0xff;
    }

    this.needsUpdate = true;
  };
}


let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  topPixel,
  bottomPixel,
  scrollPosition,
  percent,
  ambientLight;

let loader = new THREE.TextureLoader();
let MAIN, MAINCLOUDS, MOON, MOONCLOUDS, EARTH, EARTHCLOUDS;

GetContainerInfo("#rail-planets", ".l", "#cart-planets");
//
//
//

let CAMERA = {
    position: {
      0: new THREE.Vector3(299, 30, 771),
      1: new THREE.Vector3(299, -4.72, 771),
      2: new THREE.Vector3(299, 232.39, -508.24),
      3: new THREE.Vector3(299, 193, -508.24),
    },
    positionMobile:{
      0: new THREE.Vector3(-170, 30, 854),
      1: new THREE.Vector3(-170, -4.72, 854),
      2: new THREE.Vector3(367, 232.39, -508.24),
      3: new THREE.Vector3(367, 193, -508.24),
    },
    rotation: {
      0: new THREE.Vector3(0.1, 0, 0),
      1: new THREE.Vector3(0, 0, 0),
      2: new THREE.Vector3(0, 0.63, 0),
      3: new THREE.Vector3(0, 0.63, 0),
    }, rotationMobile: {
      0: new THREE.Vector3(0.1, -0.35, 0),
      1: new THREE.Vector3(0, -0.35, 0),
      2: new THREE.Vector3(0.1, 0.88, 0),
      3: new THREE.Vector3(0.1, 0.88, 0),
    },
  },
  SUN = {
    mesh: undefined,
    pivot: undefined,
    orbitDistance: 150000,
    period: [3.61, 1.4, -1.38, -1.38],
    tilt: 0.2,
  };

let RINGS = {
  mesh: undefined,
  texture: {
    albedo:
      "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345f31e6241881ebd31a0a4_albedo.jpg",
    alphaMap:
      "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345f30b08a13f053c13e0df_alpha.jpg",
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
};

// SUN.tilt
let PLANETS = {
  main: {
    name: "main",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb2f99904f2fffbbb677_albedo.jpg",
      roughness:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb0c987e9db267b5496b_roughness.jpg",
      normal:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb0c7e46be7d9c46e27b_normal.jpg",
      ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb0c5745f45f022353d5_ao.jpg",
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
    period: [0 * Math.PI, 0 * Math.PI, 0 * Math.PI, 0 * Math.PI],
    tilt: 0 * Math.PI,
  },
  moon: {
    name: "moon",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    type: "baked",
    texture: {
      albedo:
      "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb9d987e9df078b54f72_albedo.jpg",
    
    normal:
      "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fccb0cefb16c2a62f16e_normal.jpg",
    ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fccbf40d104fb86d63e6_ao.jpg",
      
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
      albedo:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a698f0f6314c43da43_albedo.jpg",
      roughness:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a62c7f35550916747a_roughness.jpg",
      normal:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a7e3265c79f6319f47_normal.jpg",
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
    orbitDistance: 60,
    period: [-2.6, -2.6, 1.63, 1.63],
    tilt: 0.42,
  },
  mainClouds: {
    name: "mainClouds",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb60e2c1a15bf70817ac_clouds.jpg",
      alphaMap:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb60e2c1a15bf70817ac_clouds.jpg",
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
    period: [0 * Math.PI, 0 * Math.PI, 0 * Math.PI0 * Math.PI],
    tilt: 0 * Math.PI,
  },
  moonClouds: {
    name: "moonClouds",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb60e2c1a15bf70817ac_clouds.jpg",
      alphaMap:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6345fb60e2c1a15bf70817ac_clouds.jpg",
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
    period: [0 * Math.PI, 0 * Math.PI, 0 * Math.PI, 0 * Math.PI],
    tilt: 0 * Math.PI,
  },
  earthClouds: {
    name: "earthClouds",
    mesh: undefined,
    pivot: undefined,
    empty: undefined,
    texture: {
      albedo:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a7eae8f4a52077e133_clouds.jpg",
      alphaMap:
        "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/6340f9a704a965150a6abe25_clouds-alpha.jpg",
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
    period: [0 * Math.PI, 0 * Math.PI, 0 * Math.PI, 0 * Math.PI],
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

//cubemap
  

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

function LoadCubeMap() {
  const urls = [
    'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e070126a8485be7e6ee_posX.jpg', 'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e071301de05a3bd85a3_negX.jpg',
    'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e07f22b13d36514cd4d_posY.jpg', 'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e07f22b132d3714cd4c_negY.jpg',
    'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e07b7be8fa99022ebc8_posZ.jpg', 'https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63490e07e46422688c87bc89_negZ.jpg'
  ];

  const reflectionCube = new THREE.CubeTextureLoader().load(urls);
  return reflectionCube;
}

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
      RINGS.mesh.rotation.z = value - Math.PI / 2;
    });
  guiSun
    .add(SUN.pivot.rotation, "x", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      SUN.pivot.rotation.x = value;
    });
  let guiMain = gui.addFolder("Main");
  guiMain
    .add(MAIN.mesh.rotation, "y", -6, 6, 0.01)
    .name("Planet Rotation")
    .onChange((value) => {
      MAIN.mesh.rotation.y = value;
    });

  let guiMoon = gui.addFolder("Moon");
  console.log(MOON.mesh.geometry);
  guiMoon
  .add(MOON.mesh.rotation, "y", -6, 6, 0.01)
  .name("Planet Rotation")
  .onChange((value) => {
    MOON.mesh.rotation.y = value;
  });
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
  MAINCLOUDS = PLANETS["mainClouds"];
  MOONCLOUDS = PLANETS["moonClouds"];
  EARTHCLOUDS = PLANETS["earthClouds"];
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
    if(camera.aspect>1)
    {
    camera.position.set(
      CAMERA.position[0].x,
      CAMERA.position[0].y,
      CAMERA.position[0].z
    )
    camera.rotation.set(
      CAMERA.rotation[0].x,
      CAMERA.rotation[0].y,
      CAMERA.rotation[0].z
    )
  }
    else{
      camera.position.set(
        CAMERA.positionMobile[0].x,
        CAMERA.positionMobile[0].y,
        CAMERA.positionMobile[0].z
      )
      camera.rotation.set(
        CAMERA.rotationMobile[0].x,
        CAMERA.rotationMobile[0].y,
        CAMERA.rotationMobile[0].z
      )
    }
    
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
    GetTextures(MOONCLOUDS);
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
      if (planet.texture.alphaMap) {
        planet.textureCache.alphaMap = textureLoader.load(
          path + planet.texture.alphaMap
        );
        console.log("Adding alpha map to " + planet.name);
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
  GeneratePlanet("moonClouds");
  // GeneratePlanet("earthClouds");
  GenerateRings(RINGS);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
  SetupGUI();
}
function GenerateAmbient() {
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
    color: 0xffffff,
    // alphaMap:texturesArray[3],
    transparent: true,
    metalness: 0.0,
    roughness: 0.9,
  });
  if (cache.alphaMap) {
    planetMat.alphaMap = cache.alphaMap;
  }

  if (
    planet == "mainClouds" ||
    planet == "moonClouds" ||
    planet == "earthClouds"
  ) {
    planetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: cache.albedo,
      alphaMap: cache.alphaMap,
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

  if (planetDetails.type == "baked") planetMat.normalMap = null;

  let planetMesh = new THREE.Mesh(planetGeo, planetMat);

  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  if (
    planet != "mainClouds" ||
    planet != "moonClouds" ||
    planet != "earthClouds"
  ) {
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
  let ringTex = new ThinFilmFresnelMap(380, 2, 3, 64);
  let ringsDetails = rings;
  let cache = ringsDetails.textureCache;

  const radianceCube = LoadCubeMap();

  let ringsMat = new THREE.MeshBasicMaterial({
    // map: cache.albedo,
    map: ringTex,
    alphaMap: cache.alphaMap,
    transparent: true,
    envMap:radianceCube,
    reflectivity: 1.0,
    // combine:THREE.AddOperation,
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

  ringsMesh.rotation.set(-Math.PI / 2, 0, 0);
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onScroll() {
  //Get percent scrolled
  ScrollThrough();
  // OldScroll();
}

function GetContainerInfo(div, offset, cart) {
  topPixel = $(div).offset().top - $(offset).height();
  bottomPixel =
    $(div).position().top + $(div).outerHeight(true) - $(cart).height();
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function ScrollThrough() {
  scrollPosition = GetScrollTop();
  percent = GetPercent(scrollPosition, topPixel, bottomPixel);
  percent = clamp(percent, 0, 100);
  console.log("Scrolled: " + percent + "%");
  let sections = 3;
  if (percent < 100 / sections) {
    let p = percent * sections;
    console.log("Section 1: " + p);
    let v = p / 100;
    LerpAll(0, v);
  } else if (percent < (100 / sections) * 2) {
    let p = (percent - 100 / sections) * sections;
    console.log("Section 2: " + p);
    let v = p / 100;
    LerpAll(1, v);
  } else if (percent <= 100) {
    let p = (percent - (100 / sections) * 2) * sections;
    console.log("Section 3: " + p);
    let v = p / 100;
    LerpAll(2, v);
  } else if (percent <= 100) {
    let p = (percent - (100 / sections) * 3) * sections;
    console.log("Section 4: " + p);
    let v = p / 100;
    LerpAll(3, v);
  }

  function LerpAll(x, v) {
    LerpCameraPosition(x, v);
    LerpCameraRotation(x, v);
    LerpPivot(MAIN, x, v);
    // LerpPivot(EARTH, x, v);
    LerpPivot(MOON, x, v);
    LerpPositionSun(x, v);
  }

  function LerpCameraPosition(i, v) {
    if(camera.aspect>1)
    {

      camera.position.x = lerp(CAMERA.position[i].x, CAMERA.position[i + 1].x, v);
      camera.position.y = lerp(CAMERA.position[i].y, CAMERA.position[i + 1].y, v);
      camera.position.z = lerp(CAMERA.position[i].z, CAMERA.position[i + 1].z, v);
    }else{
      camera.position.x = lerp(CAMERA.positionMobile[i].x, CAMERA.positionMobile[i + 1].x, v);
      camera.position.y = lerp(CAMERA.positionMobile[i].y, CAMERA.positionMobile[i + 1].y, v);
      camera.position.z = lerp(CAMERA.positionMobile[i].z, CAMERA.positionMobile[i + 1].z, v);
    }
  }

  function LerpCameraRotation(i, v) {
    if(camera.aspect>1)
    {
      camera.rotation.x = lerp(CAMERA.rotation[i].x, CAMERA.rotation[i + 1].x, v);
      camera.rotation.y = lerp(CAMERA.rotation[i].y, CAMERA.rotation[i + 1].y, v);
      camera.rotation.z = lerp(CAMERA.rotation[i].z, CAMERA.rotation[i + 1].z, v);
    }else{
      camera.rotation.x = lerp(CAMERA.rotationMobile[i].x, CAMERA.rotationMobile[i + 1].x, v);
      camera.rotation.y = lerp(CAMERA.rotationMobile[i].y, CAMERA.rotationMobile[i + 1].y, v);
      camera.rotation.z = lerp(CAMERA.rotationMobile[i].z, CAMERA.rotationMobile[i + 1].z, v);
    }
  }

  function LerpPivot(pName, i, v) {
    pName.pivot.rotation.y = lerp(pName.period[i], pName.period[i + 1], v);
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
    // RINGS.mesh.rotation.z = lerp(
    //   // SUN.period[i] + Math.PI / 2,
    //   SUN.period[i],
    //   // SUN.period[i + 1] + Math.PI / 2,
    //   SUN.period[i + 1],
    //   v
    // );
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

function easeInOut(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
function removeLoad() {}
