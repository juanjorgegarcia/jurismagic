# jurismagic 

To use this aplication you first need to install NPM or Yarn. In terminal **cd** to the back folder and do **npm install**, do the same for jurismagic folder. In the back folder you need to create a file named credentials.js with your sql credentials with the following format:
module.exports = {
    user : "your-user",
    pass : "your-password"
}

The next step is, inside a terminal, **cd** to the back folder and do a **node index.js**. In another terminal cd to jurismagic and do **npm start**.



# Testing on aws instance database

SSH into your amazon instance and **cd** to the back folder, then do **node index.js**.

You need to run the frontend "jurismagic" in your pc. First, you need to put the aws instance IP in App.jsx on the constant remoteIP. Then do a **npm start** inside jurismagic folder.


# Preparing database for TF-IDF ranking

cd into **ranking** and **run updateDB.py** and see the new changes on your mysqlDB 

