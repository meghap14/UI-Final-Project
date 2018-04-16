import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema'

Meteor.startup(() => {
  // code to run on server at startup

  var THREE = require('three');

  //creates server side Accounts database (so info persists on refresh)
  Accounts = new Mongo.Collection('accounts');

  A_Schema = {};

  A_Schema.Accounts = new SimpleSchema({
  	username : {type: String},
  	password : {type: String}
  });

  Accounts.attachSchema(A_Schema.Accounts);

  Projects = new Mongo.Collection('projects');

  P_Schema = {};

  P_Schema.Projects = new SimpleSchema({
  	username : {type : String},
  	project_name : {type : String},
  	project : {type : Array}, 
    'project.$' : {type : THREE.Mesh}
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
    if (Projects.find({ username : username, project_name : project_name }).count()) {
      //remove entry and reinsert
      console.log("remove and reinsert");
      Projects.remove({ username : username, project_name : project_name});
    }
    Projects.insert({ username : username, project_name : project_name, project : project })
  }
});
