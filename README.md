# CoreX

A Node.js package building the core of a secured application with an administration app.

## Usage

First, install the package using npm:

    npm install @gregvanko/corex --save

## File App.js:
Créer un fichier "App.js" qui contiendra le code de démarrage du module.

    /*--------------------------------------*/
    /* Creation simple de l'appli via CoreX */
    /*--------------------------------------*/
    let corex = require('@gregvanko/corex').corex
    let MyApp = new corex()
    MyApp.Start() // Lancement de l'application


Option du constructeur de CoreX

    /*-------------------------------------------*/
    /* Creation de l'appli via CoreX avec option */
    /*-------------------------------------------*/
    const OptionApplication = {
        AppName: "TestApp",                     // Nom de l'application
        Port: 3000,                             // Port du serveur
        Secret: "TestAppSecret",                // phrase secrete pour l'encodage du token 
        MongoUrl: "mongodb://localhost:27017"   // Url de la DB Mongo
    }
    let corex = require('@gregvanko/corex').corex
    let MyApp = new corex(OptionApplication)
    MyApp.Start() // Lancement du module corex


Creation de l'application via une class

    /*-------------------------------------------------*/
    /* Creation de l'appli via CoreX et dans une class */
    /*-------------------------------------------------*/
    class ServeurTestCoreX{
        constructor(){
            // Creation de l'application CoreX
            let corex = require('@gregvanko/corex').corex
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
                    TexteNomrale:"1.5vw",           //--CoreX-font-size
                    TexteIphone:"3vw",              //--CoreX-Iphone-font-size
                    TexteMax:"18px",                //--CoreX-Max-font-size
                    TitreNormale:"4vw",             //--CoreX-Titrefont-size
                    TitreIphone:"7vw",              //--CoreX-TitreIphone-font-size
                    TitreMax:"50px"                 //--CoreX-TitreMax-font-size
                },
                Color:{
                    Normale:"rgb(20, 163, 255)"     //--CoreX-color
                }
            }
            this._MyServeurApp.Debug = true                                                 // Affichier les message de debug du serveur
            this._MyServeurApp.AppIsSecured = true                                          // L'application est elle securisee par un login
            this._MyServeurApp.CSS = CSS                                                    // Css de base de l'application
            this._MyServeurApp.Usesocketio = false                                          // L'application utilise SocketIo
            this._MyServeurApp.IconRelPath = "/apple-icon-192x192.png"                      // Chemin relatif de l'icone
            this._MyServeurApp.ClientAppFolder = "/TestClient"                              // Chemin vers le dossier contenant les sources Js et CSS du client
            this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this))     // Add serveur api for FctName = Test
            this._MyServeurApp.AddApiFct("TestC", this.TestApiCallForFctTestC.bind(this))   // Add serveur api for FctName = TestC
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
    
Les fonctions backend de l'application

    Pour ajouter une fonction dans l'API du serveur il faut utiliser la fonction serveur AddApiFct(FctName, FctBinded)
    
    this._MyServeurApp.AddApiFct(FctName, FctBinded)
        // FctName      : est le nom (string) de la fonction appelee via l'API
        // FctBinded    : est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
    
    
    Pour faire un Log en DB il faut utiliser la fonction serveur LogAppliInfo(Valeur) ou LogAppliError(Valeur)
    
    this._MyServeurApp.LogAppliInfo(Valeur)
        // Valeur       : valeur a enregister dans la db en tant que type 'info"
    
    this._MyServeurApp.LogAppliError(Valeur)
        // Valeur       : valeur a enregister dans la db en tant que type 'Error"

Le frontend client de l'application

    Les fichiers JS et CSS du frontend client de l'application doivent se trouver sous répertoire défini par la variable "ClientAppFolder".

    Voici les fonctions "globale" pour le frontend client de l'application

    /** Logout de l'application securisée */
    GlobalLogout()

    /** Appel à l'Api du serveur */
    // FctName :        le nom de la fonction a executer
    // FctData :        les donnes a passer à la fonction
    // UpProg :         la fonction a executer lors du Upload Progess
    // DownProg :       la fonction a executer lors du Download Progress
    GlobalCallApiPromise(FctName, FctData, this.UpProg.bind(this), this.DownProg.bind(this)).then((reponse)=>{
        console.log(reponse)
    },(erreur)=>{
        console.log(erreur)
    })
    UpProg(event){
        console.log("Up => Loaded: " + event.loaded + " Total: " +event.total)
    }
    DownProg(event){
        console.log("Down => Loaded: " + event.loaded + " Total: " +event.total)
    }

Les modules disponible

    //** Action Button en haut a droite de l'écran */
    // Creation du boutton
    var GlobalActionButton = new CoreXActionButton()
    GlobalActionButton.Start()
    // Clear de la liste des Action
    GlobalActionButton.ClearActionList()
    // Add d'une action
    GlobalActionButton.AddAction(Titre, Fct)

    //** MongoDb */

    // Require
    let Mongo = require('@gregvanko/corex').Mongo

    // Collection Exist
    Mongo.CollectionExist(Collection, Url, DbName, DoneCallback, ErrorCallback)
    let ErrorCallback = (err)=>{}
    let DoneCallback = (Data) => {} // Data exist if collection exist

    // Find
    Mongo.FindPromise(Querry, Projection, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })
    const Query = { [this._MongoLoginUserItem]: Login}
    const Projection = { projection:{ _id: 1, [this._MongoLoginPassItem]: 1}}

    // Find Sort
    Mongo.FindSortPromise(Querry, Projection, Sort, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })
    const Sort = {[this._MongoLoginUserItem]: 1}

    // Find Sort Skip
    Mongo.FindSortLimitSkipPromise(Querry, Projection, Sort, Limit, Skip, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })
    Let Limit = 10

    // Delete By Id (Id = string)
    Mongo.DeleteByIdPromise(Id, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })

    // Update by Id (Id = string)
    Mongo.UpdateByIdPromise(Id, Data, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })

    // Count 
    Mongo.CountPromise(Querry, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId
    const Query = {'_id': new MongoObjectId(Id)}

    // Insert One
    Mongo.InsertOnePromise(Data, Collection, Url, DbName).then((reponse)=>{
        // ToDo
    },(erreur)=>{
        this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
    })
    let Data = { [this._MongoLoginUserItem]: "test", [this._MongoLoginFirstNameItem]: "test2"}
