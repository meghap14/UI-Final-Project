import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
//import THREE from 'three';
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
OrbitControls === undefined;



// var THREE = require('three')
// var OrbitControls = require('three-orbit-controls')(THREE)
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
OrbitControls === undefined;

if (Meteor.isClient) {

	LOGGED_IN_USER = new ReactiveVar("");
	
	//boolean for whether to show the login screen.  We might change the structure of this when we add more views
	SHOW_LOGIN = new ReactiveVar(true);

	Template.container.onCreated(function() {
		//creates client side verson of database
		Accounts = new Mongo.Collection('accounts');
	});

	Template.container.helpers({
		//returns the boolean value of whether to show login screen
		show_login : function() {
			return SHOW_LOGIN.get();
		}
	});

	Template.login.onRendered(function() {
		//holds value of what users type into username textbox
		this.username = new ReactiveVar("");
		this.password = new ReactiveVar("");
	});

	Template.login.events({
		'click #create'(event, instance) {
			instance.username.set($('#username').val());
			instance.password.set($('#password').val());
			
			//check if username textbox is empty
			if (instance.username.get() === "") {
				//currently firing alerts, we can change this to on the page warnings if we want
				alert("Please enter a username");
			}

			else if (instance.password.get() === "") {
				alert("Please enter a password");
			}
			
			//checks if username is already in database
			else if (Accounts.find({ username : instance.username.get() }).count()) {
				alert("Username already exists");
			}
			else {
				//adds username and password to the database
				Accounts.insert({username : instance.username.get(), password : instance.password.get() });
				
				//sets global value for logged in user
				LOGGED_IN_USER.set(instance.username.get());
				
				//switches to show welcome screen
				SHOW_LOGIN.set(false);
			}
		},
		'click #login'(event, instance) {
			instance.username.set($('#username').val());
			instance.password.set($('#password').val());
			
			//checks if username textbox is empty
			if (instance.username.get() === "") {
				alert("Please enter a username");
			}

			if (instance.password.get() === "") {
				alert("Please enter a password");
			}
			
			//checks if username and password are in the database
			else if (!Accounts.find({ username : instance.username.get(), password : instance.password.get() }).count()) {
				alert("Account does not exist");
			}
			else {
				//sets global value for logged in user
				LOGGED_IN_USER.set(instance.username.get());
				
				//switches to welcome screen
				SHOW_LOGIN.set(false);
			}
		}
	});

	Template.welcome.helpers({
		//returns logged in user's username
		name : function() {
			return LOGGED_IN_USER.get();
		}
	});

	Template.welcome.events({
		//clears global value for logged in user, switches back to login screen
		'click #logout'(event, instance) {
			LOGGED_IN_USER.set("");
			SHOW_LOGIN.set(true);
		},
		'click #delete'(event, instance) {
			//sends confirmation alert
			if (confirm("Do you want to delete this account?")) {

				//calls server side function to delete account
				Meteor.call('delete_account', LOGGED_IN_USER.get());
			
				//clears global value for logged in user, switches back to login screen
				LOGGED_IN_USER.set("");
				SHOW_LOGIN.set(true);
			}
		}
	})

}





// Template.hello.onCreated(function helloOnCreated() {
//   // counter starts at 0
//   this.counter = new ReactiveVar(0);
// });

// Template.hello.helpers({
//   counter() {
//     return Template.instance().counter.get();
//   },
// });

// Template.hello.events({
//   'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
//   },
// });



$(document).ready(function () {

	function func() {

		//
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.enabled = true;

		renderer.setClearColor(0xddeeff);
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		//document.body.appendChild(renderer.domElement);
		var element = document.getElementById("buildtable");
		console.log(element)
		element.append(renderer.domElement);

		var objects = []; //array of all objects on map
		var raycaster = new THREE.Raycaster(); //used to detect where mouse is pointing
		var mouse = new THREE.Vector2(); //holds location of mouse on screen
		var deletion = false; //delete button selected

		//cube impl
		var globe_geometry = new THREE.BoxGeometry(10, 10, 10);
		var globe_material = new THREE.MeshLambertMaterial({ color: 0x40ff8f });
		var cube = new THREE.Mesh(globe_geometry, globe_material);
		cube.castShadow = true;

		camera.position.set(50, 50, 100);
		camera.lookAt(new THREE.Vector3(0, 0, 0));


		//line impl
		/*var lineGeo = new THREE.Geometry();
		var lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
		lineGeo.vertices.push(new THREE.Vector3(-10, 0, 0));
		lineGeo.vertices.push(new THREE.Vector3(0, 10, 0));
		lineGeo.vertices.push(new THREE.Vector3(10, 0, 0));
		lineGeo.vertices.push(new THREE.Vector3(0, -10, 0));
		lineGeo.vertices.push(new THREE.Vector3(-10, 0, 0));
		var line = new THREE.Line(lineGeo, lineMaterial);*/

		var gridSize = 100;
		var gridDivs = 10;
		var grid = new THREE.GridHelper(gridSize, gridDivs);

		//temporary transparent block from three.js
		var rollOverGeo = new THREE.BoxGeometry(10, 10, 10);
		rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
		rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		scene.add(rollOverMesh);

		//scene.add(cube);
		//scene.add(line);
		scene.add(grid);

		var geometry = new THREE.PlaneBufferGeometry(100, 100);
		geometry.rotateX(- Math.PI / 2);
		plane = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ visible: true }));
		plane.receiveShadow = true;
		scene.add(plane);
		objects.push(plane);

		var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		scene.add(ambientLight);

		var light = new THREE.SpotLight(0xffffff, 1.6);
		light.position.copy(camera.position);
		light.shadowCameraVisible = true;
		scene.add(light);

		var controls = new OrbitControls(camera);
		controls.addEventListener('change', function () { renderer.render(scene, camera); });

		/*var dragControls = new THREE.DragControls(cube, camera, renderer.domElement);
		dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
		dragControls.addEventListener('dragend', function (event) { controls.enabled = true; });*/
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		renderer.render(scene, camera);

	}
	setTimeout(func, 1000);
});




//THIS STUF BELOW NEEDS WORK?
//object.onmousemove = function () { myScript };

// function onDocumentMouseMove(event) {  //taken from threejs.org
// //$("#buildtable").onmousemove(function () {
// 	event.preventDefault();
// 	mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
// 	raycaster.setFromCamera(mouse, camera); //generates ray from camera passing through mouse location
// 	var intersects = raycaster.intersectObjects(objects);
// 	if (intersects.length > 0) {
// 		var intersect = intersects[0];
// 		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
// 		rollOverMesh.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5);
// 	}
// 	render();
// }

// function onDocumentMouseDown(event) {
// 	event.preventDefault();
// 	mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
// 	raycaster.setFromCamera(mouse, camera);
// 	var intersects = raycaster.intersectObjects(objects);
// 	if (intersects.length > 0) {
// 		var intersect = intersects[0];
// 		if (deletion) {
// 			//TODO
// 		}
// 		else {
// 			var block = new THREE.Mesh(globe_geometry, globe_material);
// 			block.castShadow = true;
// 			block.receiveShadow = true;
// 			block.position.copy(intersect.point).add(intersect.face.normal);
// 			block.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5);
// 			scene.add(block);
// 			objects.push(block);
// 		}
// 	}
// }

// function animate() {
// 	requestAnimationFrame(animate);
// 	cube.rotation.x += 0.05;
// 	cube.rotation.y += 0.05;
// 	controls.update();
// 	renderer.render(scene, camera);
// }
// //animate();

function render() {
	renderer.render(scene, camera);
}
