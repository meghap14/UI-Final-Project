# UI-Final-Project

Front End:


Back End:
	
	UI_project/server/main.js: 
		MongoDB databases and Javascript
		Contains declaration, schema and methods for databases Accounts and Projects
		Accounts stores username and password
		Accounts methods insert a user into the database, and remove a user from the database
		Projects stores username, project name and an array of three.js mesh objects
		Projects methods insert a project for a given user into the database, updating the array of objects if one already exists

	UI_project/client/main.js:
		Javascript
		Calls these server-side methods to modify the databases
		Queries the databases



New Technical Component: