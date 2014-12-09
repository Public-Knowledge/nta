nta: Node.js TxtApp

Configuring and running:


1. install mysql and create the tables & target set content listed sender/txtapp.sql
2. install node.js if not present (see http://nodejs.org/download/ for a guide)
3. check out a copy of nta from github to a folder
4. use npm (node package manager) to install the required packages listed in package.json
5. set up your configuration with the database password, API keys for sunlight, google and so forth by editing sender/apidata.json
6. start up the application with node:  go the nta folder, and run "node app.js"
7. if developing locally, install ngrok, which is used to expose localhost URLs to twilio, etc: https://ngrok.com/
8. start up ngrok:  ./ngrok 3000



