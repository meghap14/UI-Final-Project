import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema'

Meteor.startup(() => {
  // code to run on server at startup

  var THREE = require('three');
  
  /*code for getting textures from public folder*/
  var fs = Npm.require('fs');
  var files = fs.readdirSync('../web.browser/app/textures');
  files.forEach(function(file) {
	  console.log(file);
  })
  
  //creates server side Accounts database (so info persists on refresh)
  Accounts = new Mongo.Collection('accounts');

  A_Schema = {};

  //sets schema for Accounts database
  A_Schema.Accounts = new SimpleSchema({
  	username : {type: String},
  	password : {type: String}
  });

  Accounts.attachSchema(A_Schema.Accounts);

  //creates server side Projects database
  Projects = new Mongo.Collection('projects');

  P_Schema = {};

  //sets schema for Projects database
  P_Schema.Projects = new SimpleSchema({
    username : {type : String},
    project_name : {type : String},
    project : {type : Array}, 
    'project.$' : {type : Object},
    'project.$.geometry' : {type : String},
    'project.$.color' : {type : String},
    'project.$.pos' : {type : Array},
    'project.$.pos.$' : {type : Number},
    'project.$.rot' : {type : Array},
    'project.$.rot.$' : {type : Number}
  });

  Projects.attachSchema(P_Schema.Projects);

});

Meteor.methods({
	delete_account : function(name) {
		Accounts.remove({ username : name });
	},
	insert_account : function(username, password) {
		Accounts.insert({username : username, password : password});
	},
  insert_project : function(username, project_name, project) {
    //checks if project already exists and if so removed it
    if (Projects.find({ username : username, project_name : project_name }).count()) {
      Projects.remove({ username : username, project_name : project_name});
    }
    //inserts project into database
    Projects.insert({ username : username, project_name : project_name, project : project });
  }
});
