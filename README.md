# CoreX
A Node.js package building the core of a secured application with an administration app.

## Usage

First, install the package using npm:
```bash
npm install @gregvanko/corex --save
```

## File App.js
### Fichier de base
Créer un fichier "App.js" qui contiendra le code de démarrage du module.
```js
/*--------------------------------------*/
/* Creation simple de l'appli via CoreX */
/*--------------------------------------*/
let corex = require('@gregvanko/corex').corex
let MyApp = new corex()
MyApp.Start()
```

### Option du constructeur de CoreX
Voici les options possible du constructeur
```js
/*-------------------------------------------*/
/* Creation de l'appli via CoreX avec option */
/*-------------------------------------------*/
const OptionApplication = {
    // Nom de l'application
    AppName: "TestApp",
    // Port du serveur                     
    Port: 3000,
    // phrase secrete pour l'encodage du token                          
    Secret: "TestAppSecret",
    // Url de la DB Mongo
    MongoUrl: "mongodb://localhost:27017"
}
let corex = require('@gregvanko/corex').corex
let MyApp = new corex(OptionApplication)
MyApp.Start()
```

### Creation de CoreX dans une class
```js
/*-------------------------------------------------*/
/* Creation de l'appli via CoreX et dans une class */
/*-------------------------------------------------*/
class MyAppCoreX{
    constructor(){
        let corex = require('@gregvanko/corex').corex
        const OptionApplication = {
            AppName: "TestCoreXApp",
            Port: 3000,
            Secret: "TestAppSecret",
            MongoUrl: "mongodb://localhost:27017"
        }
        this._MyServeurApp = new corex(OptionApplication)
    }
    Start(){
        // Parametres de l'application CoreX
        const CSS= {
            FontSize:{
                //--TexteNomrale
                TexteNomrale:"1.5vw",
                //--TexteIphone
                TexteIphone:"3vw",
                //--TexteMax
                TexteMax:"18px",
                //--TitreNormale
                TitreNormale:"4vw",
                //--TitreIphone
                TitreIphone:"7vw",
                //--TitreMax
                TitreMax:"50px"
            },
            Color:{
                //--CoreX-color
                Normale:"rgb(20, 163, 255)"
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
        this._MyServeurApp.AllowSignUp= false
        // Css de base de l'application
        this._MyServeurApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyServeurApp.Usesocketio = false
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Client
        this._MyServeurApp.ClientAppFolder = __dirname + "/TestClient"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyServeurApp.AdminAppFolder = __dirname + "/TestAdmin"
        // Chemin vers le dossier contenant les sources Js et CSS de communes a l'app Admin et Client
        this._MyServeurApp.CommonAppFolder = __dirname + "/TestCommon"
        // Chemin relatif de l'icone
        this._MyServeurApp.IconRelPath = __dirname + "/apple-icon-192x192.png"

        // App link
        this._MyServeurApp.AppLink = "App"

        // Splash Screen
        this._MyServeurApp.SplashScreen = "<div>Splash Screen</div>"

        // Delete function to execute when a user is deleted
        this._MyServeurApp.OnDeleteUser = this.TestOnDeleteUser

        // Add serveur api for FctName = Test
        this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this), false)
        // Add serveur api Admin for FctName = TestAdmin
        this._MyServeurApp.AddApiFct("TestAdmin", this.TestApiAdminCallForFctTest.bind(this), true)

        // Add SocketIo api
        this._MyServeurApp.AddSocketIoFct("Test", this.Test.bind(this))

        // Add route home
        this._MyServeurApp.AddRouteGet("", this.TestRouteGet.bind(this))

        // Lancement du module corex
        this._MyServeurApp.Start()
    }
    TestApiCallForFctTest(Data, Res, User, UserId){
        this._MyServeurApp.LogAppliInfo("Call de l API User, fonction Test", User, UserId)
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
    TestRouteGet(req, res){
        res.send("OK, Home")
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
let MyApp = new MyAppCoreX()
MyApp.Start() 
```

## Les fonctions Backend de CoreX
### Log info et Log Error
Pour faire un Log en DB il faut utiliser les fonctions serveur  LogAppliInfo(Valeur= "undefined", User= "undefined", UserId= "undefined") ou LogAppliError(Valeur= "undefined", User= "undefined", UserId= "undefined")
```js 
this._MyServeurApp.LogAppliInfo(Valeur, User, UserId)
this._MyServeurApp.LogAppliError(Valeur, User, UserId)
```
### Les fonctions Get de la class CoreX
```js 
this._MyServeurApp.AppName // Return le nom de l'application
this._MyServeurApp.MongoUrl // Return le MongoUrl de l'application
```
### Les fonction MongoDB
```js
//** MongoDb */
let MongoR = require('@gregvanko/corex').Mongo
Mongo = new MongoR(MongoUrl,MongoDbName)
//MongoUrl: Url de la DB Mongo
//MongoDbName : nom de la DB Mongo

// Collection Exist
Mongo.CollectionExist(Collection, DoneCallback, ErrorCallback)
let ErrorCallback = (err)=>{}
let DoneCallback = (Data) => {} // Data = true if collection exist

// Find
const Query = { [this._MongoLoginUserItem]: Login}
const Projection = { projection:{ _id: 1, [this._MongoLoginPassItem]: 1}}
Mongo.FindPromise(Querry, Projection, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Find Sort
const Sort = {[this._MongoLoginUserItem]: 1}
Mongo.FindSortPromise(Querry, Projection, Sort, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Find Sort Skip
Let Limit = 10
Mongo.FindSortLimitSkipPromise(Querry, Projection, Sort, Limit, Skip, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Delete By Id (Id = string)
Mongo.DeleteByIdPromise(Id, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Delete By Query
let Query = { address: "test" }
Mongo.DeleteByQueryPromise(Query, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Update by Id (Id = string)
Mongo.UpdateByIdPromise(Id, Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Update
Mongo.UpdatePromise(Query, Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Count
let MongoObjectId = require('@gregvanko/corex').MongoObjectId
const Query = {'_id': new MongoObjectId(Id)}
Mongo.CountPromise(Querry, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Insert One
let Data = { [this._MongoLoginUserItem]: "test", [this._MongoLoginFirstNameItem]: "test2"}
Mongo.InsertOnePromise(Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})

// Insert Multiple document
let DataToDb = [
    {[this._MongoConfigKey]: "A", [this._MongoConfigValue]: "1"},
    {[this._MongoConfigKey]: "B", [this._MongoConfigValue]: "2"}
]
Mongo.InsertMultiplePromise(Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("DB error : " + erreur, User, UserId)
})
```

## Une application basée sur CoreX: la partie Application
CoreX permet de creer un Frontend et un Backend customise pour l'application
### Frontend de l'application
Les fichiers JS et CSS du frontend client de l'application doivent se trouver sous répertoire défini par la variable "ClientAppFolder".
### Les fonction globale du Frontend
```js
/** Logout de l'application securisée */
GlobalLogout()

/** Get Login Token **/
GlobalGetToken()

/** Vider la liste des action de l'application */
GlobalClearActionList()
/** Vider la liste des action de l'application  et ajoute une fonction a executer (ExecuteBeforeQuit) avant de faire un Go to Home (Go ti Home uniquement disponible lorsqu'il y a plus d'un module)*/
GlobalClearActionList(ExecuteBeforeQuit = null)

/** Ajouter une action a la liste des actions de l'application */
GlobalAddActionInList(Titre, Action) 

/** Get de l'object SocketIo */
GlobalGetSocketIo()

/** Ajouter une application */
GlobalCoreXAddApp(AppTitre, AppSrc, AppStart)

/** Get html id du content de l'application */
GlobalCoreXGetAppContentId()

/** Return true if user is Admin */
GlobalIsAdminUser()

/** Start App */
GlobalStart()

/** Envoie d'un message avec SocketIo */
// ModuleName: est le nom (string) du module qui apelle le serveur via SocketIo
// Action: est l'action a effectuer
// Value: est la valeur associée à une action
GlobalSendSocketIo(ModuleName, Action, Value)

/** Affichage du bouton action de droite */
// Type: le type (string: 'On', 'Off', 'Toggle') d'affichage du bouton action
GlobalDisplayAction(Type)

/** Appel à l'Api du serveur */
// FctName: le nom de la fonction a executer
// FctData: les donnes a passer à la fonction
// UpProg: la fonction a executer lors du Upload Progess
// DownProg: la fonction a executer lors du Download Progress
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

/** Ajouter une application */
// Creation de l'application 1
let App1 = new TestCoreXApp(GlobalCoreXGetAppContentId())
// Ajout de l'application 1
GlobalCoreXAddApp(App1.GetTitre(), App1.GetImgSrc(),App1.Start.bind(App1))
```
### Les modules disponible dans le Frontend
```js
//** Les fenetres */
// Creation d'un fenetre
CoreXWindow.BuildWindow(ElementHtml) // ElementHtml est le contenu object html de la fenetre
// Suppression de la fenetre
CoreXWindow.DeleteWindow()
```
### Backend de l'application
Pour ajouter une fonction dans l'API du serveur il faut utiliser la fonction serveur AddApiFct(FctName, FctBinded, BooleanAdmin)
- FctName: est le nom (string) de la fonction appelee via l'API
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
- La fonction FctBinded possède les paramètres (Data, Res, User, UserId)
- BooleanAdmin: Boolean determinant si cet api ne peut etre utilisé que par un user Admin
```js
this._MyServeurApp.AddApiFct("Test", this.Test.bind(this), false)
Test(Data, Res, User, UserId){
}
```
Pour ajouter une route GET dans le backend de l'application il faut utiliser la fonction serveur AddRouteGet(RouteName, FctBinded). Cette route n'est pas sécurisée.
Elle est ouverte a tous les utiliateurs.
- RouteName: le nom de la route (exemple "test")
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
- La fonction FctBinded possède les paramètres (req, res)
```js
this._MyServeurApp.AddRouteGet("test", this.TestRouteGet.bind(this))
TestRouteGet(req, res){
    res.send("Page OK")
}
```
### Exemple d'application Client
Voici un exemple d'application 
```js
class PlayProgram{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())
    }
    /** Start de l'application */
    Start(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Programs", "", "Titre", "margin-top:4%"))
        // Conteneur de la page
        this._DivApp.appendChild(CoreXBuild.DivFlexColumn("Conteneur"))
        // Texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("Get Configuration...","TxtInfo","Text","text-align: center;"))
        // Texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","TxtError","Text","color:red; text-align: center;"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:5vh;"))
    }
    /** Clear view */
    ClearView(){
        // Global action
        GlobalClearActionList(this.ExecuteBeforeQuit.bind(this))
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
    }

    ExecuteBeforeQuit(){
        console.log("Quit")
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "Progams"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PHBhdGggZD0iTTk4My45LDQyMC40YzYuMS0xMi4yLDYuMS0zMC42LDAtNDIuOUw5NDEsMzM0LjZjLTYuMS02LjEtMTIuMi02LjEtMjQuNS02LjFjLTYuMSwwLTE4LjQsMC0yNC41LDYuMUw1NjEuMyw2NTkuMnYyNC41Vjc0NWg5OEw5ODMuOSw0MjAuNHogTTE5My44LDE5My43aDYxMi41VjI1NUgxOTMuOFYxOTMuN0wxOTMuOCwxOTMuN3ogTTE5My44LDM3Ny41aDU2OS42bDQyLjktNDIuOXYtMTguNEgxOTMuOFYzNzcuNXogTTE5My44LDY4My43SDUwMFY3NDVIMTkzLjhWNjgzLjdMMTkzLjgsNjgzLjd6IE0xOTMuOCw1MDBoNDQ3LjFsNjEuMi02MS4zSDE5My44VjUwMHogTTkyOC43LDU2MS4ydjI0NWMwLDY3LjQtNTUuMSwxMjIuNS0xMjIuNSwxMjIuNUgxOTMuOGMtNjcuNCwwLTEyMi41LTU1LjEtMTIyLjUtMTIyLjVWMTkzLjdjMC02Ny40LDU1LjEtMTIyLjUsMTIyLjUtMTIyLjVoNjEyLjVjNjcuNCwwLDEyMi41LDU1LjEsMTIyLjUsMTIyLjV2NzMuNWMxOC40LDAsMzYuOCwxMi4yLDU1LjEsMjQuNWw2LjEsNi4xVjE5My44Qzk5MCw4OS42LDkxMC40LDEwLDgwNi4zLDEwSDE5My44Qzg5LjYsMTAsMTAsODkuNiwxMCwxOTMuOHY2MTIuNUMxMCw5MTAuNCw4OS42LDk5MCwxOTMuOCw5OTBoNjEyLjVDOTEwLjQsOTkwLDk5MCw5MTAuNCw5OTAsODA2LjNWNTAwTDkyOC43LDU2MS4yeiBNMTkzLjgsNjIyLjVoMzI0LjZsNi4xLTYuMWw1NS4xLTU1LjFIMTkzLjhWNjIyLjV6Ii8+PC9nPg0KPC9zdmc+"
    }
}

// Creation de l'application 1
let PlayProgramApp = new PlayProgram()

// Ajout de l'application 1
GlobalCoreXAddApp(PlayProgramApp.GetTitre(), PlayProgramApp.GetImgSrc(),PlayProgramApp.Start.bind(PlayProgramApp))
```

## Une application basée sur CoreX: la partie Admin
CoreX permet de créer un Frontend et un Backend customise pour la partie Admin de l'application
### Frontend de l'application Admin
Les fichiers JS et CSS du frontend client de l'application admin doivent se trouver sous répertoire défini par la variable "AdminAppFolder".
voici les fonction blobale du client admin
```js
// Get User and _id de tous les user
GlobalGetUserDataPromise().then((reponse)=>{
    console.log(JSON.stringify(reponse))
},(erreur)=>{
    alert(erreur)
})
```

## SocketIo
CoreX permet d'utiliser SocketIo
### Client Side de l'application
Pour envoyer un message au serveur, il faut utiliser la fonction globale : GlobalSendSocketIo(ModuleName, Action, Value)
- ModuleName: est le nom (string) du module qui apelle le serveur via SocketIo
- Action: est l'action a effectuer
- Value: est la valeur associée à une action
```js
GlobalSendSocketIo("Test", "Action1", "Value1")
```

### Server Side de l'application
Pour ajouter un message a écouter coté serveur, il faut utiliser la fonction serveur AddSocketIoFct(ModuleName; FctBinded)
- ModuleName: est le nom (string) du module qui apelle le serveur via SocketIo
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
- La fonction FctBinded possède les paramètres (Data, Socket). Data est un objet : Data.Action et Data.Value
```js
this._MyServeurApp.AddSocketIoFct("Test", this.Test.bind(this))
Test(Data, Socket, User, UserId){
    this._MyServeurApp.LogAppliInfo("Call SocketIo ModuleName: Test, Data.Action:" + Data.Action + " Data.Value: " + Data.Value, User, UserId)
}
``` 
Pour que le serveur envoie un message à tous les client, il faut récuperer l'objet Io et ensuite utiliser la fonction emit("Event", "Value")
```js
// Sur le serveur
let Io = this._MyServeurApp.Io
Io.emit("Ping", "Test de ping")

// Sur les client
this.SocketIo = GlobalGetSocketIo()
this.SocketIo.on('Ping', function(message) {
    console.log('Le serveur a un message Ping pour vous : ' + message)
})
```

## Lecture de video MP4
La lecture d'un video MP4 se fait via un alias dans la configuration Nginx. Les fichiers video doivent se trouver sous /var/www pour que nginx puisse y avoir accès.
```bash
location /video/ {
    alias /var/www/Video/Memorx/;
}
```
Pour securiser la lecture video avec le token du user, il faut addapter la configuration de Nginx comme suite:
```bash
location /video/ {
    auth_request /auth;
    alias /var/www/Video/Memorx/;
}

location = /auth {
    internal;
    proxy_pass              http://localhost:5000$request_uri;
    proxy_pass_request_body off;
    proxy_set_header        Content-Length "";
}
```

Lorsque les video sont sécurisée, pour lire une video "testsmall.mov" il faut ajouter dans l'application FrontEnd de CoreX le lien suivant:
```js
"/video/testsmall.mov?token=" + GlobalGetToken()
```