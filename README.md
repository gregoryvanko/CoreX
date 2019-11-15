# CoreX

A Node.js package part of CoreX. 

## Usage

First, install the package using npm:

    npm install @gregvanko/corex --save

## File App.js:
Créer un fichier "App.js" qui contiendra le code de démarrage du module.

    /*------------------------------------*/
    /* Creation de l'appli via CoreXLogin */
    /*------------------------------------*/
    let corexlogin = require('@gregvanko/corex').corex
    let MyApp = new corex()
    MyApp.Start() // Lancement du module corexlogin


Option du constructeur de CoreX

    const OptionApplication = {
        AppName: "TestApp", // Nom de l'application
        Port: 3000, // Port du serveur
        Secret: "TestAppSecret", // phrase secrete pour l'encodage du token 
        MongoUrl: "mongodb://localhost:27017" // Url de la DB Mongo
    }
    let corex = require('./index').corex
    let MyApp = new corex(OptionApplication)
    MyApp.Start() // Lancement du module corexlogin


Option de l'objet CoreX

    let corexlogin = require('@gregvanko/corex').corex
    let MyApp = new corex()

    MyApp.Debug = true                              // Affichier les message de debug du serveur
    MyApp.AppIsSecured = true                       // L'application est elle securisee par un login
    MyApp.CSS = CSS                                 // Css de base de l'application
    MyApp.Usesocketio = false                       // L'application utilise SocketIo
    MyApp.IconRelPath = "/apple-icon-192x192.png"   // Chemin relatif de l'icone

    MyApp.Start()