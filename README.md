#nta: Node.js TxtApp - 

##Configuring and running:


1. check out a copy of nta from github to a folder. Also make sure that the public/data folder is set so that the webhost can write to it (this is where the MP3s for alerts are stored)
2. install mysql and create the tables & target set content listed sender/txtapp.sql
3. install node.js if not present (see http://nodejs.org/download/ for a guide)
4. Using pip or another python package manager, install the packages used by the sender under sender/send-campaigns.py
5. use npm (node package manager) to install the required packages listed in package.json
6. set up your configuration with the database password, API keys for sunlight, google and so forth by editing sender/apidata.json - directions for each section are below
7. start up the application with node:  go the nta folder, and run "node app.js"
8. the server should start up and show "App listening at http://HOSTNAME:3000" -the window it prints to is the debug console, and you can check here for errors that occur
9. if developing locally, install ngrok, which is used to expose localhost URLs to twilio, etc: https://ngrok.com/
10. start up ngrok:  ./ngrok 3000

##App Configuraton

First find your copy of the configuration file at [package root]/sender/apidata.json.  You'll notice that it has a number of fields which need to be filled out to connect to the various services used by the application.

The first section, at the top of the file, holds some general data. You'll want to fill out the "hostname" section with the URL that the application will be available at in your install. This is used for things like the google sign in and constructing twilio URLs to read back MP3s for callers.


###Twilio Setup

Your Twilio account needs to be set up with 2 handlers.  When you log into the Twilio account, go to the "configure your number" page.  On that page, there should be a Voice URL field and a Messaging URL field.

In the Voice field, enter the url "http://[your hostname here]/connect -and leave "HTTP POST" set. This url is used for the outgoing call to the subscriber, after they text back.

In the Messaging field, enter the url "http://[your hostname here]/connects -and leave "HTTP POST" set -this URL is used to handle the "act" or "unsubscribe" text messages that users can text back. 

The Auth Token, SID, and phone number from Twilio should get put into your configuration file used by the website & the sender.  This is found in the sender/apidata.json file.  Locate the section that is called twilio & fill in these three values.

###Google Authentication

The tool currently uses google sign in.  You'll want to follow Google's directions to set up OAuth on the Google Developer's Console:
https://developers.google.com/accounts/docs/OAuth2

Once you have created the project in Google Developer's console, you should have a client ID and a client Secret.  These should get put into your configuration file used by the website & the sender.  This is found in the sender/apidata.json file.  Locate the section that is called oauth & fill in these three values.

On the google developer's console, you'll want to configure some URLs. Under "Redirect URIs" add the auth/callback url:  http://[your hostname]/auth/google/callback 


Back in the configuration file, under oauth, you'll see a field called "secret".  You should fill this in with a secret passphrase used to initialize the express session manager.

The final field under oauth is "restricted_domain".  If you set this to a value, it will only allow google accounts with email addresses from that domain to access the campaign and view subscriber pages.

The redirect field should be left as is, unless you've changed the URLs in the application


###Google Maps

Under Google section of the configuration file at sender/apidata.json you will see a field to enter a Google Maps Geo API Key.  Under your project on the Google Developers Console, turn on the Google Maps Geolocation API.  Then go to the Credentials page and create a new Key for server applications.  You will then enter the API Key under "geoapikey" in the "google" section of the configuration file.

###Sunlight

Under Sunlight section of the configuration file at sender/apidata.json you will see a field to enter a Sunlight API Key.  Find your API key on the Sunlight website.  Then enter it  under "apikey" in the "sunlight" section of the configuration file.





