class ServeurTestCoreX{
    constructor(){
        // Creation de l'application CoreX
        let corex = require('./index').corex
        const OptionApplication = {
            AppName: "CoreXAppDev",                // Nom de l'application
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
                TexteNomrale:"1.5vw",               //--TexteNomrale
                TexteIphone:"3vw",                  //--TexteIphone
                TexteMax:"18px",                    //--TexteMax
                TitreNormale:"4vw",                 //--TitreNormale
                TitreIphone:"7vw",                  //--TitreIphone
                TitreMax:"50px"                     //--TitreMax
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
        // L'application permet elle au user de creer son compte
        this._MyServeurApp.AllowSignUp = true
        // Css de base de l'application
        this._MyServeurApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyServeurApp.Usesocketio = true
        // Chemin vers le dossier contenant sources Js et CSS de l'app client
        this._MyServeurApp.ClientAppFolder = __dirname + "/TestClient"
        // Chemin vers le dossier contenant sources Js et CSS de l'app Admin
        this._MyServeurApp.AdminAppFolder = __dirname + "/TestAdmin"
        // Chemin vers le dossier contenant les sources Js et CSS de communes a l'app Admin et Client
        this._MyServeurApp.CommonAppFolder = __dirname + "/TestCommon"
        // Chemin relatif de l'icone
        this._MyServeurApp.IconRelPath = __dirname + "/apple-icon-192x192.png"

        // App link
        //this._MyServeurApp.AppLink = "App"

        // Splash Screen
        this._MyServeurApp.SplashScreen = `<div style="width: 100vw; height: 100vh; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; align-content: center;"><div style="font-size: 3vh;">Splash Screen</div></div>`
        // Splash Screen Background color
        this._MyServeurApp.SplashScreenBackgroundColor = "Black"

        // Delete function to execute when a user is deleted
        this._MyServeurApp.OnDeleteUser = this.TestOnDeleteUser

        // Add api for FctName = test
        this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this), false)
        // Add api Admin for FctName = TestAdmin and only for admin
        this._MyServeurApp.AddApiFct("TestAdmin", this.TestApiAdminCallForFctTest.bind(this), true)

        // Add SocketIo api
        this._MyServeurApp.AddSocketIoFct("Test", this.Test.bind(this))

        // Add route home
        //this._MyServeurApp.AddRouteGet("", this.RouteGetHome.bind(this))

        // Add route
        this._MyServeurApp.AddRouteGet("test", this.TestRouteGet.bind(this))

        // Lancement du module corex
        this._MyServeurApp.Start()
    }

    // Fonction de test
    TestApiCallForFctTest(Data, Res, User, UserId){
        this._MyServeurApp.LogAppliInfo("Call de l API User, fonction Test + Data= " + Data, User, UserId)
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct Test=" + Data})
    }
    TestApiAdminCallForFctTest(Data, Res, User, UserId){ 
        this._MyServeurApp.LogAppliInfo("Call de l API Admin, fonction Test", User, UserId)
        Res.json({Error: false, ErrorMsg: "API OK", Data: "Data for Fct Test=" + Data})
    }
    Test(Data, Socket,User, UserId){
        this._MyServeurApp.LogAppliInfo("Call SocketIo ModuleName: Test, Data.Action: " + Data.Action + " ,Data.Value: " + Data.Value, User, UserId)
        let Io = this._MyServeurApp.Io
        Io.emit("Ping", "Io: Send ping from server")
    }
    RouteGetHome(req, res){
        res.send("Home")
    }
    TestRouteGet(req, res){
        res.send("OK, coucou")
    }
    TestOnDeleteUser(DeleteUsesrId, DeleteUserLogin, User, UserId){
        return new Promise((resolve, reject) => {
            console.log(`le user: ${User}, avec un id: ${UserId}, delete le user avec un id: ${DeleteUsesrId} et un login:${DeleteUserLogin}`)
            resolve()
            //reject()     
        })
    }
}

/** Lancement du serveur */
let MyServeurApp = new ServeurTestCoreX()
MyServeurApp.Start() 