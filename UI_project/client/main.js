import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
//import THREE from 'three';
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
OrbitControls === undefined;


if (Meteor.isClient) {

	LOGGED_IN_USER = new ReactiveVar("");
	
	//boolean for whether to show the login screen.  We might change the structure of this when we add more views
	SHOW_LOGIN = new ReactiveVar(true);
	SHOW_LANDING = new ReactiveVar(true);
	PROJECT_NAME = new ReactiveVar("");

	Template.container.onCreated(function() {
		//creates client side verson of database
		Accounts = new Mongo.Collection('accounts');
		Projects = new Mongo.Collection('projects');
	});

	Template.container.helpers({
		//returns the boolean value of whether to show login screen
		show_landing : function() {
			return SHOW_LANDING.get();
		}
	});

	Template.login.onRendered(function() {
		//holds value of what users type into username textbox
		this.username = new ReactiveVar("");
		this.password = new ReactiveVar("");
		this.project_name = new ReactiveVar("");
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
				Meteor.call('insert_account', instance.username.get(), instance.password.get());
				
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
		},
		show_landing : function() {
			return SHOW_LANDING.get();
		}
	});

	Template.welcome.events({
		//clears global value for logged in user, switches back to login screen
		'click #logout'(event, instance) {
			if (confirm("Are you sure you want to log out without saving?")){
				var length = objects.length;
				for (var i = 0; i < length; i++) {
					scene.remove(objects[i]);
				}
				for (var i = 0; i < length; i++) {
					objects.pop();
				}
				LOGGED_IN_USER.set("");
				SHOW_LOGIN.set(true);
				SHOW_LANDING.set(true);
			}
			render();
		},
		'click #deleteAccount'(event, instance) {
			//sends confirmation alert
			if (confirm("Do you want to delete this account?")) {

				//calls server side function to delete account
				Meteor.call('delete_account', LOGGED_IN_USER.get());
			
				//clears global value for logged in user, switches back to login screen
				LOGGED_IN_USER.set("");
				SHOW_LOGIN.set(true);
				SHOW_LANDING.set(true);
			}
		}
	});

	Template.landing.helpers({
		show_login : function() {
			return SHOW_LOGIN.get();
		}
	});

	Template.project.onCreated( function() {
		this.project_name = new ReactiveVar("");
		this.status = new ReactiveVar("");
	});

	Template.project.events({
		'change #project_status'(event, instance) {
			instance.status.set($(event.currentTarget).val());
		},
		'click #go'(event, instance) {
			instance.project_name.set($('#project_name').val());
			if (instance.project_name.get() === "") {
				alert("Please enter a project name");
			}
			else if (instance.status.get() === "") {
				alert("Please select what to work on");
			}
			else {
				PROJECT_NAME.set(instance.project_name.get());
				if (instance.status.get() === "Saved Project") {
					if (!Projects.find({ username : LOGGED_IN_USER.get(), project_name : PROJECT_NAME.get() }).count()) {
						alert("Project does not exist");
					}
					else {
						//set objects to be saved objects from database

						var saved_project = Projects.findOne({ username : LOGGED_IN_USER.get(), project_name : PROJECT_NAME.get()});
						console.log("Saved project:");
						console.log(saved_project.project);
						var blocks = saved_project.project;
						var length = blocks.length;
						for (var i = 0; i < length; ++i) {
							var geo = blocks[i].geometry;
							var color = blocks[i].color;
							var new_block;
							var build_geo;
							var build_mesh = new THREE.MeshLambertMaterial({color : color});
							if (geo == "square") {
								build_geo = square;
							}
							else if (geo == "rectangle") {
								build_geo = rectangle;
							}
							else if (geo == "quarterBlock") {
								build_geo = quarterBlock;
							}
							else if (geo == "wall") {
								build_geo = wall;
							}
							else if (geo == "pyramid") {
								build_geo = pyramid;
							}
							else if (geo == "cylinder") {
								build_geo = cylinder;
							}
							else if (geo == "sphere") {
								build_geo = sphere;
							}
							else if (geo == "tile") {
								build_geo = tile;
							}
							new_block = new THREE.Mesh(build_geo, build_mesh);
							new_block.position.x = blocks[i].pos[0];
							new_block.position.y = blocks[i].pos[1];
							new_block.position.z = blocks[i].pos[2];
							new_block.rotation.x = blocks[i].rot[0];
							new_block.rotation.y = blocks[i].rot[1];
							new_block.rotation.z = blocks[i].rot[2];

							objects.push(new_block);
							scene.add(new_block);
							render();
						}

						/*objects = saved_project.project;
						for (var i = 0; i < saved_project.project.length; i++) {
							var saved_object = objects[i];
							console.log(saved_object);
							scene.add(saved_object.object);
						}*/

						SHOW_LANDING.set(false);
					}
				}
				else {
					if (Projects.find({ username : LOGGED_IN_USER.get(), project_name : instance.project_name.get() }).count()) {
						alert("Project already exists");
					}
					else {
						SHOW_LANDING.set(false);
					}
				}
			}
		}

	});

}


//////////////////////
//THREE JS variables//
//////////////////////

var dropColor = "red";
var dropGeo = "square";
var mode = "add"; //checks insertion mode.  Values are "add" "move" "delete"
var isMoving = false;  //checks if, while in 'move' mode you are moving or selecting an object

var raycaster = new THREE.Raycaster(); //used to detect where mouse is pointing
var mouse = new THREE.Vector2(); //holds location of mouse on screen

var scene = new THREE.Scene();//main scene of game
var smallScene = new THREE.Scene(); //smaller box that shows currently selected block

var camera = new THREE.PerspectiveCamera(45, $("#canvas").width() / $("#canvas").height(), 1, 1000);
var smallCamera = new THREE.PerspectiveCamera(45, 1, 1, 100);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.shadowMap.enabled = true;

var smallRenderer = new THREE.WebGLRenderer({anti: true, alpha:true});
smallRenderer.shadowMap.enabled = true;


//THIS IS WHAT WE LOAD AND STORE
var objects = []; //array of all objects on map

//cube impl



camera.position.set(100, 100, 200);
camera.lookAt(new THREE.Vector3(0, 0, 0));
smallCamera.position.set(50, 50, 50);
smallCamera.lookAt(new THREE.Vector3(0, 0, 0));

var gridSize = 200;
var gridDivs = 20;
var grid = new THREE.GridHelper(gridSize, gridDivs);

//temporary transparent block from three.js
var rollOverGeo = new THREE.BoxGeometry(20, 20, 20);
rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
rollOverMesh.name = 'squareMesh';
rollOverMesh.position.addScalar(10);
scene.add(rollOverMesh);


scene.add(grid);
var unitBlock = new THREE.BoxGeometry(10, 10, 10);
var square = new THREE.BoxGeometry(20, 20, 20);
var rectangle = new THREE.BoxGeometry(20, 20, 40);
var quarterBlock = new THREE.BoxGeometry(10, 20, 10);
var wall = new THREE.BoxGeometry(5, 20, 20);
var pyramid = new THREE.CylinderGeometry(0, 10, 20, 4, false);
var cylinder = new THREE.CylinderGeometry(10, 10, 20, 100, false);
var sphere = new THREE.SphereGeometry(5, 10, 10);
var tile = new THREE.PlaneGeometry(5,5);
tile.rotateX(-Math.PI / 2);


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

var globe_geometry = square;
var globe_material = new THREE.MeshLambertMaterial({ color: 0x40ff8f });

var testObj = new THREE.Mesh(globe_geometry, globe_material);
testObj.position.x = 0;
	testObj.position.y = 0;
	testObj.position.z = 0;
	testObj.name = "testObj";
	smallScene.name = "smallScene";
	smallScene.add(testObj);

var geometry = new THREE.PlaneBufferGeometry(200, 200);
geometry.rotateX(- Math.PI / 2);
plane = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ visible: true }));
plane.receiveShadow = true;
plane.name = "plane";
scene.add(plane);
//objects.push(plane);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

var light = new THREE.SpotLight(0xffffff, 1.6);
light.position.copy(camera.position);
scene.add(light);

var smallLight = new THREE.SpotLight(0xffffff, 1.6);
smallLight.position.copy(smallCamera.position);
smallScene.add(smallLight);

//allows camera movement
var controls = new OrbitControls(camera, renderer.domElement);

var loader = new THREE.TextureLoader();
var path = 'textures/emerald_block.png';
animate();
Template.interface.onRendered(function () {
	
	console.log(testObj);
	console.log(smallScene);
	camera.aspect = $("#canvas").width() / $("#canvas").height();
    camera.updateProjectionMatrix();
	renderer.setSize($("#canvas").width(), $("#canvas").height());
	smallRenderer.setSize($('#smallScene').width(), $('#smallScene').height());
	$("#canvas").append(renderer.domElement);
	$('#smallScene').append(smallRenderer.domElement);
	
    //javascript event listeners
    $('#canvas').mousemove(onDocumentMouseMove);
    $('#canvas').mousedown(onDocumentMouseDown);
	controls.addEventListener('change', function () { renderer.render(scene, camera); });
    window.keydown(arrowKeys, false);
    window.addEventListener('resize', onWindowResize, false);
    render();

});

Template.interface.events({
	
	'click [name="mode"]': function(event, template) {
		mode = $(event.currentTarget).val();
		isMoving = false;
		if (mode == "add"){
			SwitchGeo(dropGeo);
			while(rollOverMesh.position.y < 10) {
				rollOverMesh.translateY(5);
			}
			rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
			changeRollOverMesh(dropGeo + "Mesh");	
		}
		else {
			SwitchGeo("unitBlock");
			if (mode == "move") {
				rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
				changeRollOverMesh("unitMesh");
			}
			if (mode == "delete"){
				rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
				changeRollOverMesh("unitMesh");
			}
		}
		render();
	},
	
	'click #rotate' : function(event, template){
		rotateMesh();
	},
	
	"change #color": function(event, template){
		dropColor = $(event.currentTarget).val();
		globe_material = new THREE.MeshLambertMaterial({color : dropColor});
		console.log(globe_material);
		console.log(globe_geometry);
		position = testObj.position;
		smallScene.remove(testObj);
		testObj = new THREE.Mesh(globe_geometry, globe_material);
		smallScene.add(testObj);
		testObj.position.setX(position.getComponent(0));
		testObj.position.setY(position.getComponent(1));
		testObj.position.setZ(position.getComponent(2));
		render();
	},
	
	"change #geo": function(event, template){
		dropGeo = $(event.currentTarget).val();
		SwitchGeo(dropGeo);
		console.log(globe_material);
		console.log(globe_geometry);
		position = testObj.position;
		smallScene.remove(testObj);
		testObj = new THREE.Mesh(globe_geometry, globe_material);
		smallScene.add(testObj);
		testObj.position.setX(position.getComponent(0));
		testObj.position.setY(position.getComponent(1));
		testObj.position.setZ(position.getComponent(2));
		render();
	},
	'click #save'(event, instance) {

		console.log("objects:");
		console.log(objects);

		var project = [];
		var length = objects.length;
		for (var i = 0; i < length; ++i) {
			var geometry = "";
			if (objects[i].geometry == square) {
				geometry = "square";
			}
			else if (objects[i].geometry == rectangle) {
				geometry = "rectangle";
			}
			else if (objects[i].geometry == quarterBlock) {
				geometry = "quarterBlock";
			}
			else if (objects[i].geometry == wall) {
				geometry = "wall";
			}
			else if (objects[i].geometry == pyramid) {
				geometry = "pyramid";
			}
			else if (objects[i].geometry == cylinder) {
				geometry = "cylinder";
			}
			else if (objects[i].geometry == sphere) {
				geometry = "sphere";
			}
			else if (objects[i].geometry == tile) {
				geometry = "tile";
			}
			var color = "new THREE.MeshLambertMaterial({ color: 0x40ff8f });";
			var pos = [objects[i].position.x, objects[i].position.y, objects[i].position.z];
			var rot = [objects[i].rotation.x, objects[i].rotation.y, objects[i].rotation.z];
			var object = {
				"geometry" : geometry,
				"color" : color,
				"pos" : pos,
				"rot" : rot
			}
			project.push(object);
		}
		Meteor.call('insert_project', LOGGED_IN_USER.get(), PROJECT_NAME.get(), project); //project instead of objects


		console.log("project:");
		console.log(project);
		console.log(Projects.findOne({ username : LOGGED_IN_USER.get(), project_name : PROJECT_NAME.get() }));
		render();
		SHOW_LANDING.set(true);
	},
	'click #clear'(event, instance) {
		var length = objects.length;
		for (var i = 0; i < length; i++) {
			console.log("remove");
			scene.remove(objects[i]);
			console.log(objects);
		}
		for (var i = 0; i < length; i++) {
			console.log("pop");
			objects.pop()
			console.log(objects);
		}
		render();
	}
});

//Javascript functions
function onDocumentMouseMove(event) {  //taken from threejs.org
                
					var offset = $(this).offset();
                    mouse.set(((event.pageX - offset.left) / $(this).width()) * 2 - 1, - ((event.pageY - offset.top)/ $(this).height()) * 2 + 1);
                    raycaster.setFromCamera(mouse, camera); //generates ray from camera passing through mouse location
                    objects.push(plane);
					var intersects = raycaster.intersectObjects(objects);
					objects.splice(objects.indexOf(plane),1);
                    //console.log(intersects);
                    if (intersects.length > 0) {
                        var intersect = intersects[0];
                        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
                        rollOverMesh.position.floor().addScalar(10);
                        if (rollOverMesh.name == "unitBlockMesh") rollOverMesh.translateY(-5);
						if (dropGeo == "tile") rollOverMesh.translateY(-9);
						//if (rollOverGeo == wall) rollOverMesh.translateX(-2);
                    }
                    render();
    }

	
function onDocumentMouseDown(event) {
					event.stopPropagation();
                    var offset = $(this).offset();
                    mouse.set(((event.pageX - offset.left) / $(this).width()) * 2 - 1, - ((event.pageY - offset.top)/ $(this).height()) * 2 + 1);
                    raycaster.setFromCamera(mouse, camera);
                    objects.push(plane);
					var intersects = raycaster.intersectObjects(objects);
					objects.splice(objects.indexOf(plane),1);
                    console.log(intersects);
                    if (intersects.length > 0) {
                        var intersect = intersects[0];
                        if (mode == "delete") {
                            if (intersect.object != plane) {
                                scene.remove(intersect.object);
                                objects.splice(objects.indexOf(intersect.object), 1); 
                            }
                        }
						else if (mode == "move"){
							if(!isMoving){
								if( intersect.object != plane && intersect.object.geometry != tile){
									setRollOverFromBlock(intersect.object);
									scene.remove(intersect.object);
									objects.splice(objects.indexOf(intersect.object), 1);
									isMoving = true;
								}
							}
							else{
								addBlock();
								isMoving = false;
								rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
								SwitchGeo("unitBlock");
							}
						}
                        else {  //mode == add
                            addBlock();
                        }
                    }
                    render();
    }

function arrowKeys(event) {
                    event.preventDefault();
                    event.stopPropagation();
					var delta = clock.getDelta(); //seconds
					var moveDistance = 100 * delta; //move 100 pixels per second
					if (event.keyCode == 32){
						spaceKey();
					}
                    if (event.keyCode == 37) {  //left arrow
                        rollOverMesh.position.x -= moveDistance;
						rollOverMesh.position.floor()
						//keyCollision();
                    }
                    else if (event.keyCode == 38) { //up arrow
                       rollOverMesh.position.z -= moveDistance;
						rollOverMesh.position.floor()
						//keyCollision();
                    }
                    else if (event.keyCode == 39) { //right arrow
                        rollOverMesh.position.x += moveDistance;
						rollOverMesh.position.floor()
						//keyCollision();
                    }
                    else if (event.keyCode == 40) { //down arrow
                        rollOverMesh.position.z += moveDistance;
						rollOverMesh.position.floor()
						//keyCollision();

                    }
					else if (event.keyCode == 90){
						if (rollOverMesh.position.y > 0){
						rollOverMesh.translateY(-5);
						}
					}
					else if (event.keyCode == 88){
						rollOverMesh.translateY(5);
					}
                    render();
					return true;
    }

function spaceKey() {
                        if (mode == "delete") {
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
						else if (mode == "move"){
							if(!isMoving){
								for (var vertexIndex = 0; vertexIndex < rollOverMesh.geometry.vertices.length; vertexIndex++) {
                                var localVertex = rollOverMesh.geometry.vertices[vertexIndex].clone();
                                var globalVertex = localVertex.applyMatrix4(rollOverMesh.matrix);
                                var directionVector = globalVertex.sub(rollOverMesh.position);
								var collisRaycaster = new THREE.Raycaster();
                                collisRaycaster.set(rollOverMesh.position, directionVector.clone().normalize());
                                var collisionResults = collisRaycaster.intersectObjects(objects);
                                console.log("collision size:" + collisionResults.length);
                                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() 
									&& collisionResults[0].object != plane && collisionResults[0].object.geometry != tile) {

                                    setRollOverFromBlock(collisionResults[0].object);
									scene.remove(collisionResults[0].object);
                                    console.log(collisionResults[0].object);
                                    objects.splice(objects.indexOf(collisionResults[0].object), 1);
									isMoving = true;
									}
								}	
							
							}
							else{
								addBlock(rollOverMesh.position);
								isMoving = false;
								rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
								SwitchGeo("unitBlock");
							}
						}
                        else {  //mode == add
                            addBlock();
                        }
                    render();
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
					intersect = collisionRaycaster.intersectObjects(objects);
                    if (intersect.length > 0) {
                        console.log("intersect: " + intersect);
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
                for (var vertexIndex = 0; vertexIndex < rollOverMesh.geometry.vertices.length; vertexIndex++) {
                    var localVertex = rollOverMesh.geometry.vertices[vertexIndex].clone();
                    var globalVertex = localVertex.applyMatrix4(rollOverMesh.matrix);
                    var directionVector = globalVertex.sub(rollOverMesh.position);
					var colRaycaster = new THREE.Raycaster();
                    colRaycaster.set(rollOverMesh.position, directionVector.clone().normalize());
                    intersects = colRaycaster.intersectObjects(objects);
                    for (i = 0; i < intersects.length; ++i) {
                        if (intersects[i].object.name == "plane") {
                            intersects.splice(i, 1);
                        }
                    }
                    if (intersects.length > 0) return true;
                }
                return false;
}
			
function keyCollision(){  //handles collision detection on keystrokes
				//if reticle does not collide with something, fall until it hits something
                while (!isCollision() && rollOverMesh.position.y > 10) {
                    rollOverMesh.translateY(-5);
                }

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

function SwitchGeo(val) {
	if (mode == "add"){
              if (val == "square") {
                  globe_geometry = square;
			      rollOverGeo = square;
                  changeRollOverMesh(val);

              }
              else if (val == "rectangle") {
                  globe_geometry = rectangle;
				  rollOverGeo = rectangle;
                  changeRollOverMesh(val);

              }
                else if (val == "quarterBlock") {
                    globe_geometry = quarterBlock;
					rollOverGeo = quarterBlock;
                    changeRollOverMesh(val);
                }
				else if (val == "wall") {
					globe_geometry = wall;
					rollOverGeo = wall;
					changeRollOverMesh(val);
				}
                else if (val == "pyramid") {
                    globe_geometry = pyramid;
					rollOverGeo = pyramid;
					changeRollOverMesh(val);
                }
                else if (val == "half pyramid") {
                    globe_geometry = halfPyramid;
					rollOverGeo = halfPyramid;
                    changeRollOverMesh(val);
                }
                else if (val == "cylinder") {
                    globe_geometry = cylinder;
					rollOverGeo = cylinder;
                    changeRollOverMesh(val);
                }
                else if (val == "sphere") {
                    globe_geometry = sphere;
					rollOverGeo = sphere;
					changeRollOverMesh(val);
                }
				else if (val == "tile") {
					globe_geometry = tile;
					rollOverGeo = tile;
					changeRollOverMesh(val);
				}
	}
	
    else if (!isMoving) {
		rollOverGeo = unitBlock;
		changeRollOverMesh(val)
    }
}

function changeRollOverMesh(string) {
	
	//save current position of rollOverMesh for replacement
    position = rollOverMesh.position;
    scene.remove(rollOverMesh);
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.name = string + "Mesh";
    scene.add(rollOverMesh);
	
    //put rollOverMesh at old spot
    rollOverMesh.position.setX(position.getComponent(0));
    rollOverMesh.position.setY(position.getComponent(1));
    rollOverMesh.position.setZ(position.getComponent(2));
}

function setRollOverFromBlock(block){
	globe_geometry = block.geometry;
	globe_material = block.material;
	
	//save current position of block for replacement
    position = block.position;
    scene.remove(rollOverMesh);
    rollOverMesh = new THREE.Mesh(block.geometry, block.material);
    rollOverMesh.name = block.name + "Mesh";
    scene.add(rollOverMesh);
	
    //put rollOverMesh at old spot
    rollOverMesh.position.setX(position.getComponent(0));
    rollOverMesh.position.setY(position.getComponent(1));
    rollOverMesh.position.setZ(position.getComponent(2));
}

function addBlock(){
	cur_geo = globe_geometry;
	var cur_color;
	if (isMoving){
    cur_color = globe_material;
	  block = new THREE.Mesh(cur_geo, cur_color);
    block.name = path;
    block.castShadow = true;
    block.receiveShadow = true;
	
	//set position of block from position vector
	block.position.setX(rollOverMesh.position.x);
	block.position.setY(rollOverMesh.position.y);
	block.position.setZ(rollOverMesh.position.z);
	block.translateX(-10);
	block.translateY(-10);
	block.translateZ(-10);
	
	//Make block motion discrete, not continuous
    block.position.floor().addScalar(10);
    scene.add(block);
	block.rotation.x = rollOverMesh.rotation.x;
	block.rotation.y = rollOverMesh.rotation.y;
	if (dropGeo != "tile") block.rotation.z = rollOverMesh.rotation.z;
    objects.push(block);
	}
	else {
	loader.load(path, function(texture){
	cur_color = new THREE.MeshLambertMaterial({ map: texture });
    block = new THREE.Mesh(cur_geo, cur_color);
    block.name = path;
    block.castShadow = true;
    block.receiveShadow = true;
	
	//set position of block from position vector
	block.position.setX(rollOverMesh.position.x);
	block.position.setY(rollOverMesh.position.y);
	block.position.setZ(rollOverMesh.position.z);
	block.translateX(-10);
	block.translateY(-10);
	block.translateZ(-10);
	
	//Make block motion discrete, not continuous
    block.position.floor().addScalar(10);
    scene.add(block);
	block.rotation.x = rollOverMesh.rotation.x;
	block.rotation.y = rollOverMesh.rotation.y;
	if (dropGeo != "tile") block.rotation.z = rollOverMesh.rotation.z;
    objects.push(block);
	});
	}
}	

function rotateMesh(){
	if (dropGeo != "tile") rollOverMesh.rotateY(Math.PI / 2);
	render();
}

function onWindowResize() {
                camera.aspect = $('#canvas').width() / $("#canvas").height();
                camera.updateProjectionMatrix();
				renderer.setSize($("#canvas").width(), $("#canvas").height());                
				render();
}
	
function render() {
	smallRenderer.render(smallScene, smallCamera);
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame( animate );
	testObj.rotation.y += 0.01;
	smallRenderer.render( smallScene, smallCamera );
	}