import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Meteor.startup(() => {
  // code to run on server at startup

  //creates server side Accounts database (so info persists on refresh)
  Accounts = new Mongo.Collection('accounts');
});

Meteor.methods({
	delete_account : function(name) {
		Accounts.remove({ username : name });
	}
})
