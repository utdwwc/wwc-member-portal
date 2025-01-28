Setting Up Member Portal

### How to Clone the Repo
1. Git Clone https://github.com/utdwwc/wwc-member-portal
2. run npm install to install dependencies
   -> incase npm install doesn't work, try running: rm -rf node_modules package-lock.json

### How to start the program 
1. cd server
2. run npx nodemon start (gets the database up and running)
3. cd ..
4. npm run start

### How to access the database 
1. Sign into MongoDB with the utdwwc credentials 
2. Access the project: WWCAccessPortalSecond
3. Link to it is here: https://cloud.mongodb.com/v2/66e4fd3a4640b13a5393f1cf#

### What is stored in the server folder 
1. Connection to MongoDB
2. Schemas for every collection
3. API routes for the database
4. File storage handled using Multer

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


