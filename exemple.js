class ServeurTestCoreX{
    constructor(){
        // Creation de l'application CoreX
        let corex = require('./index').corex
        const OptionApplication = {
            AppName: "CoreXAppTest",                // Nom de l'application
            Port: 5000,                             // Port du serveur
            Secret: "TestAppSecret",                // phrase secrete pour l'encodage du token 
            MongoUrl: "mongodb://localhost:27017"   // Url de la DB Mongo
        }
        this._MyServeurApp = new corex(OptionApplication)
    }
    Start(){
        // Parametres de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",               //--CoreX-font-size
                TexteIphone:"3vw",                  //--CoreX-Iphone-font-size
                TexteMax:"18px",                    //--CoreX-Max-font-size
                TitreNormale:"4vw",                 //--CoreX-Titrefont-size
                TitreIphone:"7vw",                  //--CoreX-TitreIphone-font-size
                TitreMax:"50px"                     //--CoreX-TitreMax-font-size
            },
            Color:{
                Normale:"rgb(20, 163, 255)"         //--CoreX-color
            },
            AppContent:{
                WidthNormale:"96%",
                WidthIphone:"96%",
                WidthMax:"1100px"
            }
        }
        // Affichier les message de debug du serveur
        this._MyServeurApp.Debug = true
        // L'application est elle securisee par un login
        this._MyServeurApp.AppIsSecured = true
        // Css de base de l'application
        this._MyServeurApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyServeurApp.Usesocketio = false
        // Chemin vers le dossier contenant sources Js et CSS de l'app client
        this._MyServeurApp.ClientAppFolder = __dirname + "/TestClient"
        // Chemin vers le dossier contenant sources Js et CSS de l'app Admin
        this._MyServeurApp.AdminAppFolder = __dirname + "/TestAdmin"
        // Chemin relatif de l'icone
        this._MyServeurApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Add serveur api for FctName = test
        this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this))
        // Add serveur api Admin for FctName = test
        this._MyServeurApp.AddApiAdminFct("Test", this.TestApiAdminCallForFctTest.bind(this))
        // Lancement du module corex
        this._MyServeurApp.Start()
    }
    TestApiCallForFctTest(Data, Res, UserId){
        this._MyServeurApp.LogAppliInfo("Call de l API User, fonction Test par le user: " + UserId)
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct Test=" + Data})
    }
    TestApiAdminCallForFctTest(Data, Res, UserId){
        this._MyServeurApp.LogAppliInfo("Call de l API Admin, fonction Test par le user: " + UserId)
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct Test=" + Data})
    }
}

/** Lancement du serveur */
let MyServeurApp = new ServeurTestCoreX()
MyServeurApp.Start() 