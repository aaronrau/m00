# m00 Building Scalable & Extendable Apps Fast

This project is just an experiment in trying to build a scaffolding framework system on top of Parse and Node.js so apps can be built quickly and iteratively. 

The idea here is to create a basic app skeleton where both the UI and backend patterns can be replaced and/or extended easily. Also be flexible enough to integrate with other frameworks. 


**UI Code** 

/webui/public
- All Templates / files meant to be visible to the public / www
- These also contain CSS / Images / JS files for the UI
/webui/public/views
- These are the handlebar template, rendered by the backend_scaffold


**UI Javascript Framework Code** 

/webui/public/scripts/sections
- These are JS files used to render each "Tab / Nav" section for the app
/webui/public/scripts/modules
- These are JS files that contain controllers and/or other reusable elements related to a "section"


**Node JS Code**

/backend_scaffold
- app.js (main app) entry resides there
- /webui/view/app.hbs is the main file that render to the web

- All the node JS related functions, and oauth integration

**Parse Code**

/parse_cloud_code
- Parse cloud code here

/parse_cloud_code/main.js
- Main file, also contains user signup and role functions

/parse_cloud_code/oauth.js
- OAuth related functions


#Pluggable CRUD Architecture (Coming Soon)
**Parse**
----


**Parse + Socket.IO**
----



**Parse + Socket.IO + Redis**
----

RTM

Traditional

**Parse + Socket.IO + Redis + MongoDB**
----

RTM

Traditional

