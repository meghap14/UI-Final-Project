import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
//import THREE from 'three';
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
OrbitControls === undefined;

var curControl = "mouse";
var raycaster = new THREE.Raycaster(); //used to detect where mouse is pointing
var mouse = new THREE.Vector2(); //holds location of mouse on screen
var deletion = false; //delete button selected

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



//$(document).ready(function () {

	//function func() {

		    var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
            var renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.shadowMap.enabled = true;

            renderer.setClearColor(0xddeeff);
            renderer.setSize(window.innerWidth, window.innerHeight);

            var objects = []; //array of all objects on map   THIS IS WHAT WE LOAD AND STORE

            //cube impl
            var globe_geometry = new THREE.BoxGeometry(20, 20, 20);
            var globe_material = new THREE.MeshLambertMaterial({ color: 0x40ff8f });
            //var stone_texture = new THREE.TextureLoader().load('add later');

            camera.position.set(100, 100, 200);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
         
            var gridSize = 200;
            var gridDivs = 20;
            var grid = new THREE.GridHelper(gridSize, gridDivs);

            //temporary transparent block from three.js
            var rollOverGeo = new THREE.BoxGeometry(20, 20, 20);
            rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
            rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
            rollOverMesh.name = 'squareMesh';
            rollOverMesh.position.addScalar(10);
            scene.add(rollOverMesh);

            scene.add(grid);
            var unitBlock = new THREE.BoxGeometry(10, 10, 10);
            var square = new THREE.BoxGeometry(20, 20, 20);
            var rectangle = new THREE.BoxGeometry(20, 20, 40);
            var quarterBlock = new THREE.BoxGeometry(10, 20, 10);
            var pyramid = new THREE.CylinderGeometry(0, 10, 20, 4, false);
            var cylinder = new THREE.CylinderGeometry(10, 10, 20, 100, false);
            var sphere = new THREE.SphereGeometry(5, 40, 40);

            var halfPyramid = new THREE.Geometry();
            halfPyramid.vertices = [
                new THREE.Vector3(0, 0, 0),    //0 
                new THREE.Vector3(20, 0, 0),   //1
                new THREE.Vector3(20, 0, 20),   //2
                new THREE.Vector3(0, 0, 20),  //3
                new THREE.Vector3(20, 20, 0),  //4 
                new THREE.Vector3(20, 20, 20)  //5
            ];
            var face = new THREE.Face3(0, 1, 2);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(0, 2, 3);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(0, 4, 5);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(0, 3, 5);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(0, 1, 4);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(3, 2, 5);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(1, 2, 4);
            halfPyramid.faces.push(face);
            face = new THREE.Face3(2, 4, 5);
            halfPyramid.faces.push(face);

            var geometry = new THREE.PlaneBufferGeometry(200, 200);
            geometry.rotateX(- Math.PI / 2);
            plane = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ visible: true }));
            plane.receiveShadow = true;
            plane.name = "plane";
            scene.add(plane);
            objects.push(plane);

            var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            var light = new THREE.SpotLight(0xffffff, 1.6);
            light.position.copy(camera.position);
            light.shadowCameraVisible = true;
            scene.add(light);
			
			//allows camera movement
            var controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener('change', function () { renderer.render(scene, camera); });

			
			//Tim says: Not sure what best practice for event handlers is in meteor
			var dropColor = "red";
            var dropGeo = "square";
			/*


            var mouseCont = Template.interface.find('#mouseControls');
            var keyCont = Template.interface.find('#keyboardControls');
			
			var deleteEvent = Template.interface.find("#delete");
			*/
$(document).ready(function () {
			container = document.getElementById("canvas");
			camera.aspect = $(container).width() / $(container).height();
            camera.updateProjectionMatrix();
			renderer.setSize($(container).width(), $(container).height());
	        container.appendChild(renderer.domElement);
			//javascript event listeners
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('mousedown', onDocumentMouseDown, false);
            window.addEventListener('keydown', arrowKeys, true);
            window.addEventListener('keyup', enterKey, false);
            window.addEventListener('resize', onWindowResize, false);
            renderer.render(scene, camera);
            /*deleteEvent.addEventListener('mouseup', function () {
                deletion = !deletion;
                console.log("delete hit!");
                if (deletion) {
                    SwitchGeo("unitBlock");
                    console.log("switch to unit block");
                }
                else {
                    SwitchGeo(dropGeo.value);
                    rollOverMesh.translateY(5);
                }

                render();
            }, false);
			*/
	//}
	//setTimeout(func, 1000);
});

Template.interface.events({
	'mouseup #delete'(event){
		deletion = !deletion;
                console.log("delete hit!");
                if (deletion) {
                    SwitchGeo("unitBlock");
                    console.log("switch to unit block");
                }
                else {
                    SwitchGeo(dropGeo.value);
                    rollOverMesh.translateY(5);
                }

                render();
	},
	'click :radio': function(event, template) {
		curControl = $(event.currentTarget).val();
	},
	"change #color": function(event, template){
		dropColor = $(event.currentTarget).val();
	},
	"change #geo": function(event, template){
		dropGeo = $(event.currentTarget).val();
		SwitchGeo(dropGeo);
	}
});

//Javascript functions
//THIS STUFF BELOW NEEDS WORK?  <-- Tim says: definitely
function onDocumentMouseMove(event) {  //taken from threejs.org
                if (curControl == "mouse") {
                    event.preventDefault();
                    mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
                    raycaster.setFromCamera(mouse, camera); //generates ray from camera passing through mouse location
                    var intersects = raycaster.intersectObjects(objects);
                    //console.log(intersects);
                    if (intersects.length > 0) {
                        var intersect = intersects[0];
                        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
                        rollOverMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(10);
                        if (rollOverMesh.name == "unitBlockMesh") rollOverMesh.translateY(-5);
                    }
                    render();
                }
            }

            function onDocumentMouseDown(event) {
                //event.preventDefault();
                if (curControl == "mouse") {
                    mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
                    raycaster.setFromCamera(mouse, camera);
                    var intersects = raycaster.intersectObjects(objects);
                    console.log(intersects);
                    if (intersects.length > 0) {
                        var intersect = intersects[0];
                        //testObj = intersect.object;
                        //console.log("before delete: " + testObj.parameters);
                        if (deletion) {
                            if (intersect.object != plane) {
                                scene.remove(intersect.object);
                                objects.splice(objects.indexOf(intersect.object), 1);
                                //delete intersect.object;
                                //console.log("after delete: " + testObj.parameters);
                                //console.log(objects);
                            }
                        }
                        else {
                            cur_geo = globe_geometry;
                            /*if (dropColor.value == "stone") {
                                cur_color = new THREE.MeshLambertMaterial({ map: stone_texture })
                            } <-- restore comment*/
                            var cur_color = new THREE.MeshLambertMaterial({ color: dropColor });
                            block = new THREE.Mesh(cur_geo, cur_color);
                            var name = rollOverMesh.name.slice(0, 5);
                            block.name = name;
                            console.log(block.name);
                            block.castShadow = true;
                            block.receiveShadow = true;
                            block.position.copy(intersect.point).add(intersect.face.normal);
                            block.position.divideScalar(5).floor().multiplyScalar(5).addScalar(10);
                            scene.add(block);
                            objects.push(block);
                            console.log("dropped block!");
                        }
                    }
                    render();
                }
            }

            function arrowKeys(event) {
                render();
                if (curControl = "keyboard") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.keyCode == 37) {  //left arrow
                        rollOverMesh.translateX(-5);
                    }
                    else if (event.keyCode == 38) { //up arrow
                        rollOverMesh.translateZ(-5);
                    }
                    else if (event.keyCode == 39) { //right arrow
                        rollOverMesh.translateX(5);
                    }
                    else if (event.keyCode == 40) { //down arrow
                        rollOverMesh.translateZ(5);

                    }
                    //if reticle does not collide with something, fall until it hits something
                    if (event.keyCode < 41 && event.keyCode > 36) {
                        while (!isCollision() && rollOverMesh.position.y > 10) {
                            rollOverMesh.translateY(-5);
                        }

                        //patch to account for unit block translation

                        var collisionResults = collisionDetection();
                        var notAtTop = true;
                        while (notAtTop) {
                            notAtTop = false;
                            for (i = 0; i < collisionResults.length; ++i) {
                                if (collisionResults[i].object.position.y >= rollOverMesh.position.y) {
                                    notAtTop = true;
                                    rollOverMesh.translateY(20 + collisionResults[i].object.position.y - rollOverMesh.position.y);
                                    //if (rollOverMesh.name == "unitBlockMesh") rollOverMesh.translateY(5);
                                    console.log("looping?");
                                    break;
                                }
                            }
                            collisionResults = collisionDetection();
                        }
                    }
                    render();
                }
            }

            function enterKey(event) {
                if (curControl == "keyboard") {
                    event.preventDefault();
                    if (event.keyCode == 13) {
                        if (deletion) {
                            for (var vertexIndex = 0; vertexIndex < rollOverMesh.geometry.vertices.length; vertexIndex++) {
                                var localVertex = rollOverMesh.geometry.vertices[vertexIndex].clone();
                                var globalVertex = localVertex.applyMatrix4(rollOverMesh.matrix);
                                var directionVector = globalVertex.sub(rollOverMesh.position);
								var collisRaycaster = new THREE.Raycaster();
                                collisRaycaster.set(rollOverMesh.position, directionVector.clone().normalize());
                                var collisionResults = collisRaycaster.intersectObjects(objects);
                                console.log("collision size:" + collisionResults.length);
                                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() && collisionResults[0].object != plane) {
                                    scene.remove(collisionResults[0].object);
                                    console.log(collisionResults[0].object);
                                    objects.splice(objects.indexOf(collisionResults[0].object), 1);
                                }
                            }
                        }
                        else {
                            var keyGeo = globe_geometry;
                            /*if (dropColor.value == "stone") {
                                cur_color = new THREE.MeshLambertMaterial({ map: stone_texture })
                            } <--restore comment*/
                            var keyColor = new THREE.MeshLambertMaterial({ color: dropColor });
                            block = new THREE.Mesh(keyGeo, keyColor);
                            var name = rollOverMesh.name.slice(0, 5);
                            console.log(name);
                            block.name = name;
                            block.castShadow = true;
                            block.receiveShadow = true;
                            block.position.setFromMatrixPosition(rollOverMesh.matrixWorld)
                            //block.position.divideScalar(5).floor().multiplyScalar(5).addScalar(10);
                            scene.add(block);
                            objects.push(block);
                        }
                    }
                    render();
                }
            }
			
            //returns list of all objects (including plane) reticle collides with
            function collisionDetection() {
                var collisionResults = [];
                for (var vertexIndex = 0; vertexIndex < rollOverMesh.geometry.vertices.length; vertexIndex++) {
                    var localVertex = rollOverMesh.geometry.vertices[vertexIndex].clone();
                    var globalVertex = localVertex.applyMatrix4(rollOverMesh.matrix);
                    var directionVector = globalVertex.sub(rollOverMesh.position);
					var collisionRaycaster = new THREE.Raycaster();
                    collisionRaycaster.set(rollOverMesh.position, directionVector.clone().normalize());
                    if (raycaster.intersectObjects(objects).length > 0) {
                        intersect = collisionRaycaster.intersectObjects(objects);
                        console.log(intersect);
                        for (i = 0; i < intersect.length; ++i) {
                            if (intersect[i].object.name != "plane")
                                collisionResults.push(intersect[i]);
                        }
                    }
                }
                console.log(collisionResults);
                return collisionResults;
            }

            //faster version of collision detection that stops after first collision
            function isCollision() {
                console.log("isCollision called");
                for (var vertexIndex = 0; vertexIndex < rollOverMesh.geometry.vertices.length; vertexIndex++) {
                    var localVertex = rollOverMesh.geometry.vertices[vertexIndex].clone();
                    var globalVertex = localVertex.applyMatrix4(rollOverMesh.matrix);
                    var directionVector = globalVertex.sub(rollOverMesh.position);
					var colRaycaster = new THREE.Raycaster();
                    colRaycaster.set(rollOverMesh.position, directionVector.clone().normalize());
                    intersects = colRaycaster.intersectObjects(objects);
                    console.log("before intersect splicing for loop");
                    for (i = 0; i < intersects.length; ++i) {
                        if (intersects[i].object.name == "plane") {
                            intersects.splice(i, 1);
                        }
                    }
                    if (intersects.length >= 1) return true;
                }
                return false;
            }

            function onWindowResize() {
				container = document.getElementById("canvas");
                camera.aspect = $(container).width() / $(container).height();
                camera.updateProjectionMatrix();
				renderer.setSize($(container).width(), $(container).height());                
				render();
            }

            function SwitchGeo(val) {
                if (val == "square" && !deletion) {
                    globe_geometry = square;
                    position = rollOverMesh.position;
                    console.log(position);
                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = square;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "squareMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();

                }
                else if (val == "rectangle" && !deletion) {
                    globe_geometry = rectangle;
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = rectangle;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "rectMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();

                }
                else if (val == "quarterBlock" && !deletion) {
                    globe_geometry = quarterBlock;
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = quarterBlock;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "quarterMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();

                }

                else if (val == "pyramid" && !deletion) {
                    globe_geometry = pyramid;
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = pyramid;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "pyramidMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();
                }
                else if (val == "half pyramid"  && !deletion) {
                    globe_geometry = halfPyramid;
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = halfPyramid;
                    console.log(halfPyramid);
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "hPyramidMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();
                }
                else if (val == "cylinder" && !deletion) {
                    globe_geometry = cylinder;
                    //save current position of rollOverMesh for replacement
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = cylinder;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "cylMesh";
                    scene.add(rollOverMesh);
                    //put rollOverMesh at old spot
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();
                }
                else if (val == "sphere" && !deletion) {
                    globe_geometry = sphere;
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = sphere;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "sphereMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();
                }
                else if (val == "unitBlock") {
                    position = rollOverMesh.position;
                    console.log(position);

                    scene.remove(rollOverMesh);
                    delete rollOverMesh;
                    rollOverGeo = unitBlock;
                    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
                    rollOverMesh.name = "unitBlockMesh";
                    scene.add(rollOverMesh);
                    rollOverMesh.position.setX(position.getComponent(0));
                    rollOverMesh.position.setY(position.getComponent(1));
                    rollOverMesh.position.setZ(position.getComponent(2));
                    render();
                }
            }

            function render() {
                renderer.render(scene, camera);
            }

