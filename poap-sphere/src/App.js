import React, { Component } from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import './App.css';
import table from './elements';

class App extends React.Component {
    componentDidMount() {
        this.targets = {simple: [], table: [], sphere: [], helix: [], grid: []};
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new THREE.Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 3000;
        // create a CSS3DRenderer
        this.renderer = new CSS3DRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = 0;
        // position and point the camera to the center of the scene
        this.camera.position.x = 500;
        this.camera.position.y = 475;
        this.camera.position.z = 767;
        this.camera.lookAt(this.scene.position);
        // add the output of the renderer to the html element
        this.mount.appendChild(this.renderer.domElement)
        this.simpleObjectsLayout();
        this.generateGeometricLayouts();
        this.initTrackbarControls();
        this.transform(this.targets.table, 2000);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.start();
        this.addClickListeners();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    simpleObjectsLayout() {
        for (let i = 0; i < table.length; i += 5) {
            let object = new CSS3DObject(this.htmlElement(table, i));
            object.position.x = Math.random() * 4000 - 2000;
            object.position.y = Math.random() * 4000 - 2000;
            object.position.z = Math.random() * 4000 - 2000;
            this.scene.add(object);
            this.targets.simple.push(object);
            this.tableLayout(table, i);
        }
    }

    generateGeometricLayouts() {
        let sphereVector = new THREE.Vector3();
        let helixVector = new THREE.Vector3();
        for (let i = 0, l = this.targets.simple.length; i < l; i++) {
            this.addSphereObject(sphereVector, i, l);
            this.addHelixObject(helixVector, i);
            this.addGridObject(i);
        }
    }

    addSphereObject(sphereVector, index, length) {
        const phi = Math.acos(-1 + (2 * index) / length);
        const theta = Math.sqrt(length * Math.PI) * phi;
        let object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);
        sphereVector.copy(object.position).multiplyScalar(2);
        object.lookAt(sphereVector);
        this.targets.sphere.push(object);
    }

    addHelixObject(helixVector, index) {
        const theta = index * 0.175 + Math.PI;
        const y = -(index * 8) + 450;
        let object = new THREE.Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);
        helixVector.x = object.position.x * 2;
        helixVector.y = object.position.y;
        helixVector.z = object.position.z * 2;
        object.lookAt(helixVector);
        this.targets.helix.push(object);
    }

    addGridObject(index) {
        let object = new THREE.Object3D();
        object.position.x = ((index % 5) * 400) - 800;
        object.position.y = (-(Math.floor(index / 5) % 5) * 400) + 800;
        object.position.z = (Math.floor(index / 25)) * 1000 - 2000;
        this.targets.grid.push(object);
    }

    addClickListeners() {
        this.addClickListener(this.targets.table, 'table');
        this.addClickListener(this.targets.sphere, 'sphere');
        this.addClickListener(this.targets.helix, 'helix');
        this.addClickListener(this.targets.grid, 'grid');
    }

    addClickListener(target, elementId) {
        const button = document.getElementById(elementId);
        button.addEventListener('click', () => {
            this.transform(target, 2000);
        }, false);
    }

    htmlElement(table, i) {
        let element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';
  
        let number = document.createElement('div');
        number.className = 'number';
        number.textContent = (i / 5) + 1;
        element.appendChild(number);
  
        let symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = table[i];
        element.appendChild(symbol);
  
        let details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
        element.appendChild(details);
  
        element.addEventListener('click', () => this.elementClickHandler(i), false);
  
        return element;
    }

    transform(target, duration) {

        TWEEN.removeAll();

        for (let i = 0; i < this.targets.simple.length; i++) {
            let object = this.targets.simple[i];
            let targetObject = target[i];
            this.transformObjectPosition(object, targetObject, duration);
            this.transformObjectRotation(object, targetObject, duration);
        }
  
        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(this.render)
            .start();
  
    }

    transformObjectPosition(object, targetObject, duration) {

        new TWEEN.Tween(object.position)
            .to({
                x: targetObject.position.x,
                y: targetObject.position.y,
                z: targetObject.position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
  
    }
  
    transformObjectRotation(object, targetObject, duration) {
  
        new TWEEN.Tween(object.rotation)
            .to({
                x: targetObject.rotation.x,
                y: targetObject.rotation.y,
                z: targetObject.rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
  
    }

    tableLayout(table, index) {

        let object = new THREE.Object3D();
  
        object.position.x = (table[index + 3] * 140) - 1330;
        object.position.y = -(table[index + 4] * 180) + 990;
        this.targets.table.push(object);
  
    }

    elementClickHandler(i){

        console.log('change tween');

        this.transform(this.targets.table, 1000);
  
        new TWEEN.Tween(this.targets.simple[i / 5].position)
            .to({
                x: 0,
                y: 0,
                z: 2500
            }, Math.random() * 2000 + 2000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
  
        new TWEEN.Tween(this)
            .to({}, 2000 * 2)
            .onUpdate(this.render)
            .start();
    }

    initTrackbarControls() {
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 0.5;
        this.controls.minDistance = 500;
        this.controls.maxDistance = 6000;
        this.controls.addEventListener('change', this.render);
    }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }
    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }
    stop = () => {
        cancelAnimationFrame(this.frameId)
    }
    animate = () => {
        this.renderScene()
        TWEEN.update();
        this.controls.update();
        this.frameId = window.requestAnimationFrame(this.animate)
    }
    renderScene = () => {
        this.renderer.render(this.scene, this.camera)
    }
    render() {
        return (
            <div>
                <div
                    style={{ width: '800px', height: '800px' }}
                    ref={(mount) => { this.mount = mount }}
                />
                <div id="menu">
                    <button id="table">TABLE</button>
                    <button id="sphere">SPHERE</button>
                    <button id="helix">HELIX</button>
                    <button id="grid">GRID</button>
                </div>
            </div>
        )
    }
}

export default App;

// import React, { Component } from "react";
// import * as THREE from "three";
// import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
// import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
// import './App.css';
// import table from './elements';

// let camera, scene, renderer, controls, composer;
// var hblur, vblur;
// let targets = {simple: [], table: [], sphere: [], helix: [], grid: []};

// class App extends React.Component {

//   componentDidMount() {
//     this.init();
//     this.animate();
//     // this.mount.appendChild(this.renderer.domElement);
//     // this.start() // todo 
//   }

//   init() {
//       this.initTrackbarControls();
//       this.transform(targets.table, 2000);
//       window.addEventListener('resize', this.onWindowResize, false);
//   }



//   simpleObjectsLayout() {

//       for (let i = 0; i < table.length; i += 5) {

//           let object = new CSS3DObject(this.htmlElement(table, i));
//           object.position.x = Math.random() * 4000 - 2000;
//           object.position.y = Math.random() * 4000 - 2000;
//           object.position.z = Math.random() * 4000 - 2000;

//           scene.add(object);
//           targets.simple.push(object);
//           this.tableLayout(table, i);

//       }

//   }

//   htmlElement(table, i) {
//       let element = document.createElement('div');
//       element.className = 'element';
//       element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

//       let number = document.createElement('div');
//       number.className = 'number';
//       number.textContent = (i / 5) + 1;
//       element.appendChild(number);

//       let symbol = document.createElement('div');
//       symbol.className = 'symbol';
//       symbol.textContent = table[i];
//       element.appendChild(symbol);

//       let details = document.createElement('div');
//       details.className = 'details';
//       details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
//       element.appendChild(details);

//       element.addEventListener('click', ()=> this.elementClickHandler(i), false);

//       return element;
//   }

//   elementClickHandler(i){

//       this.transform(targets.table,1000);

//       new TWEEN.Tween(targets.simple[i / 5].position)
//           .to({
//               x: 0,
//               y: 0,
//               z: 2500
//           }, Math.random() * 2000 + 2000)
//           .easing(TWEEN.Easing.Exponential.InOut)
//           .start();

//       new TWEEN.Tween(this)
//           .to({}, 2000 * 2)
//           .onUpdate(this.render)
//           .start();
//   }

//   tableLayout(table, index) {

//       let object = new THREE.Object3D();

//       object.position.x = (table[index + 3] * 140) - 1330;
//       object.position.y = -(table[index + 4] * 180) + 990;
//       targets.table.push(object);

//   }

//   addClickListener(target, elementId) {

//       const button = document.getElementById(elementId);

//       button.addEventListener('click', function () {
//           this.transform(target, 2000);
//       }, false);

//   }

//   initTrackbarControls() {
//       controls = new TrackballControls(camera, renderer.domElement);
//       controls.rotateSpeed = 0.5;
//       controls.minDistance = 500;
//       controls.maxDistance = 6000;
//       controls.addEventListener('change', this.render);
//   }

//   generateGeometricLayouts() {

//       let sphereVector = new THREE.Vector3();
//       let helixVector = new THREE.Vector3();

//       for (let i = 0, l = targets.simple.length; i < l; i++) {
//           this.addSphereObject(sphereVector, i, l);
//           this.addHelixObject(helixVector, i);
//           this.addGridObject(i);
//       }

//   }

//   addSphereObject(sphereVector, index, length) {

//       const phi = Math.acos(-1 + (2 * index) / length);
//       const theta = Math.sqrt(length * Math.PI) * phi;
//       let object = new THREE.Object3D();

//       object.position.setFromSphericalCoords(800, phi, theta);

//       sphereVector.copy(object.position).multiplyScalar(2);

//       object.lookAt(sphereVector);

//       targets.sphere.push(object);
//   }

//   addHelixObject(helixVector, index) {

//       const theta = index * 0.175 + Math.PI;
//       const y = -(index * 8) + 450;
//       let object = new THREE.Object3D();

//       object.position.setFromCylindricalCoords(900, theta, y);

//       helixVector.x = object.position.x * 2;
//       helixVector.y = object.position.y;
//       helixVector.z = object.position.z * 2;

//       object.lookAt(helixVector);

//       targets.helix.push(object);
//   }

//   addGridObject(index) {

//       let object = new THREE.Object3D();
//       object.position.x = ((index % 5) * 400) - 800;
//       object.position.y = (-(Math.floor(index / 5) % 5) * 400) + 800;
//       object.position.z = (Math.floor(index / 25)) * 1000 - 2000;
//       targets.grid.push(object);

//   }

//   transform(target, duration) {

//       TWEEN.removeAll();

//       for (let i = 0; i < targets.simple.length; i++) {
//           let object = targets.simple[i];
//           let targetObject = target[i];
//           this.transformObjectPosition(object, targetObject, duration);
//           this.transformObjectRotation(object, targetObject, duration);
//       }

//       new TWEEN.Tween(this)
//           .to({}, duration * 2)
//           .onUpdate(this.render)
//           .start();

//   }

//   transformObjectPosition(object, targetObject, duration) {

//       new TWEEN.Tween(object.position)
//           .to({
//               x: targetObject.position.x,
//               y: targetObject.position.y,
//               z: targetObject.position.z
//           }, Math.random() * duration + duration)
//           .easing(TWEEN.Easing.Exponential.InOut)
//           .start();

//   }

//   transformObjectRotation(object, targetObject, duration) {

//       new TWEEN.Tween(object.rotation)
//           .to({
//               x: targetObject.rotation.x,
//               y: targetObject.rotation.y,
//               z: targetObject.rotation.z
//           }, Math.random() * duration + duration)
//           .easing(TWEEN.Easing.Exponential.InOut)
//           .start();

//   }

//   onWindowResize() {

//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       this.render();

//   }

//   render() {


//         renderer.render(scene, camera);


//   }

//   animate() {

//       this.requestAnimationFrame(this.animate);
//       TWEEN.update();
//       controls.update();
//       composer.render();
//   }

// //   componentWillUnmount() {
// //     this.stop()
// //     this.mount.removeChild(this.renderer.domElement)
// //   }

// //   start = () => {
// //     if (!this.frameId) {
// //       this.frameId = requestAnimationFrame(this.animate)
// //     }
// //   }
// //   stop = () => {
// //     cancelAnimationFrame(this.frameId)
// //   }

//   animate = () => {
//     this.renderScene()
//     this.frameId = window.requestAnimationFrame(this.animate)
//   }

//   renderScene = () => {
//         renderer.render(this.scene, this.camera)
//   }

//   render() {
//     return (
//       <div>
//         <div id="menu">
//           <button id="table">TABLE</button>
//           <button id="sphere">SPHERE</button>
//           <button id="helix">HELIX</button>
//           <button id="grid">GRID</button>
//         </div>
//         <div id="container"></div>
//         {/* <div
//           style={{ width: '800px', height: '800px' }}
//           ref={(mount) => { this.mount = mount }}
//         /> */}
//       </div>
//     )
//   }
// }

// export default App;

