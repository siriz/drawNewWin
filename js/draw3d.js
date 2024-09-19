import * as THREE from 'three';


import { OrbitControls } from 'three/addons/controls/OrbitControls.js';




let durationTime = 30000;
let range = document.getElementById('range');

function updateSlide() {
    let value = range.value;
    document.getElementById('rangeValue').innerHTML = value + 'sec';
    durationTime = parseInt(value * 1000);
    window.localStorage.setItem('duration', value);
}

if ( window.localStorage && window.localStorage.getItem('duration') ) {
    range.value = window.localStorage.getItem('duration');
}
updateSlide();

range.addEventListener('change', updateSlide);
range.addEventListener('mousemove', updateSlide);

window.toggleUI = function() {
    $('#ui').fadeToggle(100);
}
window.addEventListener('keyup', (e)=>{
    if (e.key === 'z') {
        window.toggleUI();
    }
})

let canvasWidth = 0, canvasHeight = 0;


let camera, scene, renderer, stats;
let controls;



var geometry;
var material;

var mesh;
var meshGroup;

var arr = [];

window.preview = window.open('preview.html', 'preview', 'location=no, menubar=no,' + 'status=no,toolbar=no,titlebar=no');


window.onbeforeunload = function() {
    window.preview.close();
}

window.callChild = () => {
    init();
    animate();
}



var selfWin;

function init() {


    selfWin = window.preview;

    // const container = document.getElementById('canvas-3d');
    const container = selfWin.document.getElementById('canvas-3d');



    setCanvasSize();
    

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xe5e0d3 );
    // scene.background = new THREE.TextureLoader().load('./assets/paperbg.jpg');
    scene.fog = new THREE.Fog( 0xe5e0d3, 50, 120 );



    camera = new THREE.PerspectiveCamera( 45, selfWin.innerWidth / selfWin.innerHeight, 1, 2000 );
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
    renderer.setPixelRatio( selfWin.devicePixelRatio );
    renderer.setSize( canvasWidth, canvasHeight );
    


    renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setClearColor(0x000000, 0.0);
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// renderer.shadowMap.autoUpdate = true;
	// renderer.shadowMap.needsUpdate = true;
	// renderer.shadowMap.enabled = true;
	// renderer.info.autoReset = false;

    // renderer.toneMapping = THREE.ReinhardToneMapping;

    
    container.appendChild( renderer.domElement );


    
    selfWin.addEventListener( 'resize', onWindowResize );
    onWindowResize();




    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();


    

    canvas2D = document.getElementById('canvas');
    new3DItem();

    // const loader = new FBXLoader();
    // loader.load('assets/SM_Ariya_noPlate.FBX', function(obj){
    //     const mesh = obj.scene.children[0];
    //     scene.add(mesh);
    // })

}




var bokehPass;
var canvas2D;

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
    meshGroup.material = material;
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

    camera.position.lerp( defaultCameraPosition, 0.1 );
    camera.lookAt(0, 0, 0);

}


function exhibit3DItem() {

    meshGroup.timeStamp = new Date() * 1;
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
    canvasWidth = selfWin.innerWidth;
    canvasHeight = selfWin.innerHeight;
}


function animate() {


    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );

    if ( arr.length > 0 ) {

        let now = new Date() * 1;

        for ( let i = 0; i < arr.length; i ++ ) {
            let letter = arr[i];
            if ( letter.parent ) {
                letter.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), letter.spd);

                if ( now - letter.timeStamp > durationTime ) {
                    gsap.to(letter.material, 0.5, {opacity: 0, onComplete: function(){
                        scene.remove(letter);
                        letter = undefined;
                    }});
                }
            }
        }

    }


}



