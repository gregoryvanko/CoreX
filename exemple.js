// Option de l'application
const OptionApplication = {
    AppName: "TestApp", // Nom de l'application
    Port: 3000, // Port du serveur
    Secret: "TestAppSecret", // phrase secrete pour l'encodage du token 
    MongoUrl: "mongodb://localhost:27017" // Url de la DB Mongo
}
const CSS= {
    FontSize:{TexteNomrale:"2vw", TexteIphone:"3vw", TexteMax:"20px",TitreNormale:"4vw", TitreIphone:"7vw", TitreMax:"50px"},
    Color:{Normale:"rgb(20, 163, 255)"}
}

/*------------------------------------*/
/* Creation de l'appli via CoreXLogin */
/*------------------------------------*/
let corex = require('./index').corex
let MyApp = new corex(OptionApplication)
MyApp.Debug = true // Affichier les message de debug du serveur
MyApp.AppIsSecured = true // L'application est elle securisee par un login
MyApp.CSS = CSS // Css de base de l'application
MyApp.Usesocketio = false // L'application utilise SocketIo
MyApp.IconRelPath = "/apple-icon-192x192.png" // Chemin relatif de l'icone
MyApp.Start() // Lancement du module corexlogin
