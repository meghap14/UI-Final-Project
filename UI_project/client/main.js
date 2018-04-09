import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

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





Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
