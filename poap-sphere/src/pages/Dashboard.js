import React from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import './../App.css';
import './../Dashboard.css';
import poaps from './../mock-poaps';

var left = 0;
var top = 0;
var dragTimeout = null;

class Dashboard extends React.Component {
    componentDidMount() {
        this.targets = {
            simple: [],
            sphere: [],
            helix: [],
            grid: []
        };

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
        this.renderer = new CSS3DRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = 0; // position and point the camera to the center of the scene

        this.camera.position.x = 500;
        this.camera.position.y = 475;
        this.camera.position.z = 2500;
        this.camera.lookAt(this.scene.position); // add the output of the renderer to the html element

        this.mount.appendChild(this.renderer.domElement);
        this.simpleObjectsLayout();
        this.generateGeometricLayouts();
        this.initTrackbarControls();
        this.transform(this.targets.sphere, 2000);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.start();
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    };

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    animate = () => {
        this.renderScene();
        TWEEN.update();
        this.controls.update();
        this.frameId = window.requestAnimationFrame(this.animate);
    };

    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    };

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    simpleObjectsLayout() {
        for (let i = 0; i < poaps.length; i++) {
            let object = new CSS3DObject(this.htmlElement(poaps, i));
            object.position.x = 0;
            object.position.y = 0;
            object.position.z = 5000;
            this.scene.add(object);
            this.targets.simple.push(object);
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
        const phi = Math.acos(-1 + 2 * index / length);
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
        object.position.x = index % 5 * 400 - 800;
        object.position.y = -(Math.floor(index / 5) % 5) * 400 + 800;
        object.position.z = Math.floor(index / 25) * 1000 - 2000;
        this.targets.grid.push(object);
    }

    addClickListener(target, elementId) {
        const button = document.getElementById(elementId);
        button.addEventListener('click', () => {
            this.transform(target, 2000);
        }, false);
    }

    htmlElement(poaps, i) {
        let element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundImage = `url('/mock-images/${poaps[i].image}')`;
        element.style.backgroundSize = 'cover';
        element.style.height = '250px';
        element.style.width = '250px';
        element.style.borderRadius = '250px';
        element.style.cursor = 'pointer';
        
        element.onmousedown = event => {
            if (Math.abs( left - event.pageX ) < 30) {
                this.elementClickHandler(i);
            }
        };
        element.onmouseup = event => {
            console.log(left, event.pageX);
        };

        element.onmousemove = event => {
            dragTimeout = setTimeout(() => {
                left = event.pageX;
                top = event.pageY;
                clearTimeout(dragTimeout);
            }, 150);
        };

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

    initTrackbarControls() {
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 0.5;
        this.controls.minDistance = 500;
        this.controls.maxDistance = 6000;
        this.controls.addEventListener('change', this.render);
    }

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }

    elementClickHandler(i) {
        document.getElementsByClassName('info-container')[0].classList.remove("close");
        document.getElementsByClassName('info-container-img')[0].src = `/mock-images/${poaps[i].image}`;
        document.getElementsByClassName('info-container-title')[0].innerHTML = `${poaps[i].title}`;
        document.getElementsByClassName('info-container-copy')[0].innerHTML = `${poaps[i].description}`;
    }

    closeInfo() {
        document.getElementsByClassName('info-container')[0].classList.add("close");
    }

    render() {
        return (
            <div>
                <div
                    style={{ width: '800px', height: '800px' }}
                    ref={(mount) => { this.mount = mount }}
                />
                <div className="info-container close">
                    <div className="info-container-inner">
                        <img className="info-container-img"></img>
                        <div className="info-container-title"></div>
                        <div className="info-container-copy"></div>
                        <div className="info-container-copy"></div>
                        <button className="info-container-negotiate">Negotiate Token</button>
                        <button className="info-container-close" onClick={ () => { this.closeInfo() }}>X</button>
                    </div>
                </div>
            </div>
        )
    }


}

export default Dashboard;
