import * as THREE from 'three';


import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

//

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
// import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';




// import { VignetteEffect, EffectComposer, EffectPass, RenderPass, DepthOfFieldEffect  } from "/js/libs/postprocessing/index.js";



var composer;


let canvasWidth = 0, canvasHeight = 0;


let camera, scene, renderer, stats;
let controls;



var geometry;
var material;

var mesh;
var meshGroup;

var arr = [];


window.onload = function() {

    init();
    animate();
}

function init() {
    const container = document.getElementById('canvas-3d');


    setCanvasSize();
    

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xe5e0d3 );
    // scene.background = new THREE.TextureLoader().load('./assets/paperbg.jpg');
    scene.fog = new THREE.Fog( 0xe5e0d3, 50, 120 );


    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    // camera.position.set( 0, 250, 300 );
    camera.position.set( 0, 0, 90 );
    
    camera.lookAt(0, 0, 0);


    renderer = new THREE.WebGLRenderer({ 
        // powerPreference: "high-performance",
        antialias: true, 
        stencil: false,
        depth: false,

        alpha: true,
        autoClear: false,
        // premultipliedAlpha: false,
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvasWidth, canvasHeight );
    // renderer.autoClear = false;
    // renderer.setClearColor( )
    


    renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setClearColor(0x000000, 0.0);
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.shadowMap.autoUpdate = true;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;
	renderer.info.autoReset = false;

    // renderer.toneMapping = THREE.ReinhardToneMapping;

    
    container.appendChild( renderer.domElement );


    
    window.addEventListener( 'resize', onWindowResize );
    onWindowResize();


    


    // const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    // dirLight.position.set( 0, 200, -50 );
    // dirLight.castShadow = true;
    // dirLight.shadow.camera.top = 180;
    // dirLight.shadow.camera.bottom = - 100;
    // dirLight.shadow.camera.left = - 120;
    // dirLight.shadow.camera.right = 120;
    // dirLight.shadow.radius = 8;
    // dirLight.shadow.blurSamples = 12;
    // scene.add( dirLight );

    // const grid = new THREE.GridHelper( 3000, 100, 0xFF0000, 0xFFCC00 );
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // scene.add( grid );



    // stats
    stats = new Stats();
    container.appendChild( stats.dom );


    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();



    composer = new EffectComposer(renderer);

    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bokeh
    bokehPass = new BokehPass(scene, camera, {
        focus: 0,
        aperture: 0.005,
        maxblur: 0.01,
        width: canvasWidth * 20,
        height: canvasHeight * 20
    });
    bokehPass.renderToScreen = true;


    renderer.autoClear = false;

    

    canvas2D = document.getElementById('canvas');
    new3DItem();

    // makeMenu();
}




var renderPass;
var bokehPass;
var canvas2D;
var depthOfFieldEffect;
var vignetteEffect;
var cocMaterial;

function new3DItem() {

    var canvas = document.createElement('canvas');

    meshGroup = new THREE.Object3D();
    scene.add(meshGroup);

    let rate = canvas2D.width / canvas2D.height;


    geometry = new THREE.PlaneGeometry(50, 50 / rate, 1, 1);
    material = new THREE.MeshBasicMaterial({
        // color: 0xFF0000,
        opacity: 1,
        map: new THREE.CanvasTexture(canvas),
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
    });

    material.depthWrite = false;
    material.transparent = true;
    material.needsUpdate = true;

    mesh = new THREE.Mesh(geometry, material);

    let r = Math.random() * 10 + 20;
    
    // meshGroup.spd = THREE.MathUtils.degToRad( 0.05 / r );
    meshGroup.spd = THREE.MathUtils.degToRad( Math.random() * 0.03 + 0.02 );
    meshGroup.position.set(0, 0, 0)
    
    defaultCameraPosition.z = r + 50;
    

    mesh.position.set(0, 0, r)
    meshGroup.add(mesh);

}


var defaultCameraPosition = new THREE.Vector3(0, 0, 90)


function draw3DTexture(canvas) {

    if ( !canvas ) {
        canvas = document.createElement('canvas');
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    material.map = texture;


    // defaultCameraPosition.x = 0
    // defaultCameraPosition.y = 0
    // defaultCameraPosition.z = 100
    camera.position.lerp( defaultCameraPosition, 0.1 );
    camera.lookAt(0, 0, 0);


    // renderer.render(scene, camera);
}


function exhibit3DItem() {

    arr.push( meshGroup );
    meshGroup = null;

}


window.new3DItem = new3DItem;
window.exhibit3DItem = exhibit3DItem;
window.draw3DTexture  = draw3DTexture ;


function onWindowResize() {

    setCanvasSize();
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( canvasWidth, canvasHeight );

}


function setCanvasSize() {
    canvasWidth = window.innerWidth / 2;
    canvasHeight = window.innerHeight;
}


function animate() {


    requestAnimationFrame( animate );

    controls.update();
    stats.update();
    // renderer.render( scene, camera );

    composer.render(0.1);


    // if ( meshGroup && meshGroup.children.length > 0 ) {
    //     for ( let i = 0, child = meshGroup.children; i < child.length; i ++ ) {
    //         child[i]
    //     }
    // }
    // if ( meshGroup.ready ) {
    //     meshGroup.rotation.y += THREE.MathUtils.degToRad(0.01);
    //     // rotate( meshGroup, meth.rotate.y + THREE.MathUtils.degToRad(0.1) )
    // }

    if ( arr.length > 0 ) {

        for ( let i = 0; i < arr.length; i ++ ) {
            // arr[i].rotation.y += arr[i].spd;
            arr[i].rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), arr[i].spd);
        }
    }

    if ( meshGroup ) {
        // var v = new THREE.Vector3();
        // camera.getWorldPosition(v);
        // // v.add( new THREE.Vector3(0, 0, -100) );

        // mesh.position.copy(v);
        // mesh.translateZ( -100 );
        // mesh.updateMatrix();
        // mesh.position.lerp( v, 0.1 );
        // meshGroup.updateMatrix();

        // meshGroup.position.copy(camera.position)
        // meshGroup.rotation.copy(camera.rotation)
        // meshGroup.translateZ( -100 );
        // meshGroup.updateMatrix();

        // meshGroup.quaternion.copy(camera.quaternion);
        // mesh.position.z = camera.position.z - 100;




    }

}



function rotate( object, deg, axis ) 
{
    // axis is a THREE.Vector3
    var q = new THREE.Quaternion();
    q.setFromAxisAngle(axis, THREE.MathUtils.degToRad( deg ) ); // we need to use radians
    q.normalize();
    object.quaternion.multiply( q );
}




function makeMenu() {
    composer.addPass(bokehPass);

    var menu = new dat.GUI({name: 'My GUI'});

    const params = {
        focus: 50,
        aperture: 100,
        maxblur: 0.1,
    };


    let folder = menu.addFolder("bokehPass");

    

    folder.add(params, "focus", 0.0, 3000.0, 1).onChange((value) => {

        bokehPass.uniforms['focus'].value = params.focus;

    });
    folder.add(params, "aperture", 0.0, 100.0, 0.1).onChange((value) => {

        bokehPass.uniforms['aperture'].value = params.aperture * 0.00001;

    });
    folder.add(params, "maxblur", 0.0, 3.0, 0.001).onChange((value) => {

        bokehPass.uniforms['maxblur'].value = params.maxblur;

    });

    folder.open();
   

    if(window.innerWidth < 720) {

        menu.close();

    }

    bokehPass.uniforms['focus'].value = params.focus;
    bokehPass.uniforms['aperture'].value = params.aperture * 0.00001;
    bokehPass.uniforms['maxblur'].value = params.maxblur;
}