class ServeurTestCoreX{
    constructor(){
        // Creation de l'application CoreX
        let corex = require('./index').corex
        const OptionApplication = {
            AppName: "CoreXAppTest",                // Nom de l'application
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
        this._MyServeurApp.Debug = true                                                 // Affichier les message de debug du serveur
        this._MyServeurApp.AppIsSecured = true                                          // L'application est elle securisee par un login
        this._MyServeurApp.CSS = CSS                                                    // Css de base de l'application
        this._MyServeurApp.Usesocketio = false                                          // L'application utilise SocketIo
        this._MyServeurApp.ClientAppRoot = __dirname                                    // Chemin du repertoire root du projet
        this._MyServeurApp.ClientAppFolder = "/TestClient"                              // Chemin vers le dossier contenant sources Js et CSS du client
        this._MyServeurApp.IconRelPath = "/apple-icon-192x192.png"                      // Chemin relatif de l'icone
        this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this))     // Add serveur api for FctName = test
        this._MyServeurApp.AddApiFct("TestC", this.TestApiCallForFctTestC.bind(this))   // Add serveur api for FctName = test
        this._MyServeurApp.Start()                                                      // Lancement du module corex
    }
    TestApiCallForFctTest(Data, Res){
        this._MyServeurApp.LogAppliInfo("Call de l API User avec la fonction Test")
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct Test=" + Data})
    }
    TestApiCallForFctTestC(Data, Res){
        this._MyServeurApp.LogAppliError("Call de l API User avec la fonction TestC")
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct TestC=" + Data})
    }
}

/** Lancement du serveur */
let MyServeurApp = new ServeurTestCoreX()
MyServeurApp.Start() 