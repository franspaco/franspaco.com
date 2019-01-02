// ORBIT CONTROLS!!!!

var scene = null;
var renderer = null;
var materials = {};
var controls = null;

async function startUp(){
    var canvas = document.getElementById("webglcanvas");
    var container = $("#container");

    canvas.width = container.width();
    canvas.height = container.height();
    // create the scene
    createScene(canvas);
    await createObjects();
    run();
}

function run() {
    requestAnimationFrame(function() {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    // Animate
    KF.update();

    // Update the camera controller
    // orbitControls.update();
    controls.update();
}

function createMaterials() {
    materials['line'] = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        linewith: 2,
    })
}

function deg2rad(val) {
    return (val / 180.0) * Math.PI;
}
function gcd(a, b){
    while(b > 0){
      var temp = b;
      b = a % b;
      a = temp;
    }
    return a;
}
function lcm(a, b){
    return a * (b/gcd(a,b));
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Image background
    scene.background = new THREE.Color(0.0, 0.0, 0.0);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        4000
    );
    controls = new THREE.OrbitControls(camera, canvas);
    camera.position.set(0, 0, 100);
    controls.update();
    scene.add(camera);

    // Create materials
    createMaterials();
}

async function createObjects(){
    var geometry = spiroGeometry(15, 7, 7, 1);
    var spiro = new THREE.Line(geometry, materials["line"]);
    scene.add(spiro);
}

function spiroGeometry(RA, RB, AL, adjust){
    var geometry = new THREE.Geometry();
    var dAngle = 0.01;
    var stopAngle = 2*Math.PI*lcm(Math.abs(RA),Math.abs(RB))/Math.abs(RA);
    var period = period = 2*Math.PI*RB/RA;
    for (let angle = 0; angle < stopAngle; angle+= dAngle) {
        geometry.vertices.push(nextPoint(angle, RA, RB, AL, adjust, period));
    }
    return geometry;
}

function nextPoint(angle, RA, RB, AL, adjust, period){
    var X = (RA+RB)*Math.cos(angle)-AL*Math.cos((RA/RB+1)*angle);
    var Y = (RA+RB)*Math.sin(angle)-AL*Math.sin((RA/RB+1)*angle);
    X *= adjust;
    Y *= adjust;
    var Z = RB*Math.sin(angle*2*Math.PI/period);
    return new THREE.Vector3(X, Y, Z);
}
