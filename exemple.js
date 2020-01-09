class ServeurTestCoreX{
    constructor(){
        // Creation de l'application CoreX
        let corex = require('./index').corex
        const OptionApplication = {
            AppName: "TestCoreXApp",                // Nom de l'application
            Port: 3000,                             // Port du serveur
            Secret: "TestAppSecret",                // phrase secrete pour l'encodage du token 
            MongoUrl: "mongodb://localhost:27017"   // Url de la DB Mongo
        }
        this._MyServeurApp = new corex(OptionApplication)
    }
    Start(){
        // Parametres de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",                 //--CoreX-font-size
                TexteIphone:"3vw",                  //--CoreX-Iphone-font-size
                TexteMax:"18px",                    //--CoreX-Max-font-size
                TitreNormale:"4vw",                 //--CoreX-Titrefont-size
                TitreIphone:"7vw",                  //--CoreX-TitreIphone-font-size
                TitreMax:"50px"                     //--CoreX-TitreMax-font-size
            },
            Color:{
                Normale:"rgb(20, 163, 255)"         //--CoreX-color
            }
        }
        this._MyServeurApp.Debug = true                              // Affichier les message de debug du serveur
        this._MyServeurApp.AppIsSecured = true                       // L'application est elle securisee par un login
        this._MyServeurApp.CSS = CSS                                 // Css de base de l'application
        this._MyServeurApp.Usesocketio = false                       // L'application utilise SocketIo
        this._MyServeurApp.IconRelPath = "/apple-icon-192x192.png"   // Chemin relatif de l'icone
        this._MyServeurApp.ClientAppFolder = "/TestClient"           // Chemin vers le dossier contenant les sources Js et CSS du client
        this._MyServeurApp.ApiFctToCall = this.ApiCall               // Definition de la fonction a appeler lors d'un appel serveur sur l'api
        this._MyServeurApp.Start()                                   // Lancement du module corex
    }
    ApiCall(Fct, Data, Res){
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Fct=" + Fct + " Data=" + Data})
    }
}


/** Lancement du serveur */
let MyServeurApp = new ServeurTestCoreX()
MyServeurApp.Start() 