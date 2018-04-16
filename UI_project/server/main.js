import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema'

Meteor.startup(() => {
  // code to run on server at startup

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
  	project : {type : Object} //contains object array
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
    Projects.insert({ username : username, project_name : project_name, project : project })
  }
});
