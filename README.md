# CoreX

A Node.js package building the core of a secured application with an administration app.

## Usage

First, install the package using npm:
```bash
npm install @gregvanko/corex --save
```

## File App.js:
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

### Creation de l'application via une class
```js
/*-------------------------------------------------*/
/* Creation de l'appli via CoreX et dans une class */
/*-------------------------------------------------*/
class ServeurTestCoreX{
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
                //--CoreX-font-size
                TexteNomrale:"1.5vw",
                //--CoreX-Iphone-font-size
                TexteIphone:"3vw",
                //--CoreX-Max-font-size
                TexteMax:"18px",
                //--CoreX-Titrefont-size
                TitreNormale:"4vw",
                //--CoreX-TitreIphone-font-size
                TitreIphone:"7vw",
                //--CoreX-TitreMax-font-size
                TitreMax:"50px"
            },
            Color:{
                //--CoreX-color
                Normale:"rgb(20, 163, 255)"
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
        // Chemin vers le dossier contenant les sources Js et CSS de l'app client
        this._MyServeurApp.ClientAppFolder = __dirname + "/TestClient"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyServeurApp.AdminAppFolder = __dirname + "/TestAdmin"
        // Chemin relatif de l'icone
        this._MyServeurApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Add serveur api for FctName = Test
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
```

### Fonction globale du serveur
Pour faire un Log en DB il faut utiliser les fonctions serveur LogAppliInfo(Valeur) ou LogAppliError(Valeur)
- Valeur       : valeur a enregister dans la db en tant que type 'info"
```js 
this._MyServeurApp.LogAppliInfo(Valeur)
this._MyServeurApp.LogAppliError(Valeur)
```

Les fonction MongoDB
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
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Find Sort
const Sort = {[this._MongoLoginUserItem]: 1}
Mongo.FindSortPromise(Querry, Projection, Sort, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Find Sort Skip
Let Limit = 10
Mongo.FindSortLimitSkipPromise(Querry, Projection, Sort, Limit, Skip, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Delete By Id (Id = string)
Mongo.DeleteByIdPromise(Id, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Delete By Query
let Query = { address: "test" }
Mongo.DeleteByQueryPromise(Query, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Update by Id (Id = string)
Mongo.UpdateByIdPromise(Id, Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Count
let MongoObjectId = require('@gregvanko/corex').MongoObjectId
const Query = {'_id': new MongoObjectId(Id)}
Mongo.CountPromise(Querry, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})

// Insert One
let Data = { [this._MongoLoginUserItem]: "test", [this._MongoLoginFirstNameItem]: "test2"}
Mongo.InsertOnePromise(Data, Collection).then((reponse)=>{
    // ToDo
},(erreur)=>{
    this.LogAppliError("ApiGetAllBlog DB error : " + erreur)
})
```



## l'application cliente
CoreX permet de creer une application customisee
### Client side de l'application cliente
Les fichiers JS et CSS du frontend client de l'application doivent se trouver sous répertoire défini par la variable "ClientAppFolder".
```js
/** Logout de l'application securisée */
GlobalLogout()

/** Vider la liste des action de l'application */
GlobalClearActionList()

/** Ajouter une action a la liste des actions de l'application */
GlobalAddActionInList(Titre, Action) 

/** Get html id du content de l'application */
GlobalCoreXGetAppContentId()

/** Ajouter une application */
GlobalCoreXAddApp(AppTitre, AppSrc, AppStart)

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
Les modules disponible
```js
//** Les fenetres */
// Creation d'un fenetre
CoreXWindow.BuildWindow(ElementHtml) // ElementHtml est le contenu object html de la fenetre
// Suppression de la fenetre
CoreXWindow.DeleteWindow()
```
### Server side de l'application cliente
Pour ajouter une fonction dans l'API du serveur il faut utiliser la fonction serveur AddApiFct(FctName, FctBinded)
- FctName: est le nom (string) de la fonction appelee via l'API
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
```js
this._MyServeurApp.AddApiFct(FctName, FctBinded)
``` 



## l'application Admin
CoreX possède une application Admin pouvant etre customisée
### Client side de l'application Admin
Les fichiers JS et CSS du frontend client de l'application admin doivent se trouver sous répertoire défini par la variable "AdminAppFolder".
Voici un exemple d'application Admin
```js
class TestCoreXAdminApp{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        document.getElementById(this._HtmlId).innerHTML = ""
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        // Add CSS
        this._DivApp.innerHTML = this.GetCss()
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("New Titre", "Titre", "", "margin-top:4%"))
        this._DivApp.appendChild(CoreXBuild.DivTexte("New Texte", "", "Text", ""))

        GlobalAddActionInList("Test 1", this.ClickTestButton.bind(this))
    }
    ClickTestButton(){
        GlobalCallApiPromise("Test", "TestData").then((reponse)=>{
            alert(reponse)
        },(erreur)=>{
            alert(erreur)
        })
    }
    GetTitre(){
        return "AdminApp"
    }
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTI1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTI1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6YmxhY2s7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02MC4xLDE0Ljl2MTEuOGMxMi44LDQsMjIsMTYsMjIsMzAuMWMwLDE3LjQtMTQuMSwzMS41LTMxLjUsMzEuNWMtMTcuNCwwLTMxLjUtMTQuMS0zMS41LTMxLjUKCQljMC0xNC4xLDkuMy0yNiwyMi0zMC4xVjE0LjlDMjIsMTkuMyw3LjcsMzYuNCw3LjcsNTYuOGMwLDIzLjcsMTkuMyw0Mi45LDQyLjksNDIuOWMyMy43LDAsNDIuOS0xOS4zLDQyLjktNDIuOQoJCUM5My42LDM2LjQsNzkuMywxOS4zLDYwLjEsMTQuOXoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01MC42LDYyLjVjMy4xLDAsNS43LTIuNiw1LjctNS43VjUuN2MwLTMuMS0yLjYtNS43LTUuNy01LjdjLTMuMSwwLTUuNywyLjYtNS43LDUuN3Y1MS4xCgkJQzQ0LjksNjAsNDcuNSw2Mi41LDUwLjYsNjIuNXoiLz4KPC9nPgo8L3N2Zz4K"
    }

    /** Css de l'application */
    GetCss(){
        return /*html*/`
        <style>
            .DivContent{
                padding: 1px;
                margin: 20px auto 10px auto;
                width: 96%;
                margin-left: auto;
                margin-right: auto;
            }
            #Titre{
                margin: 1% 1% 4% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .Text{font-size: var(--CoreX-font-size);}

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
                .Text{font-size: var(--CoreX-Iphone-font-size);}
            }
            @media screen and (min-width: 1200px)
            {
                .DivContent{width: 1100px;}
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
                .Text{font-size: var(--CoreX-Max-font-size);}
            }
        </style>`
    }
}

// Creation de l'application 1
let AdminApp1 = new TestCoreXAdminApp(GlobalCoreXGetAppContentId())

// Ajout de l'application 1
GlobalCoreXAddApp(AdminApp1.GetTitre(), AdminApp1.GetImgSrc(),AdminApp1.Start.bind(AdminApp1))
```
### Serveur side de l'application Admin
Pour ajouter une fonction dans l'API Admin du serveur il faut utiliser la fonction serveur AddApiAdminFct(FctName, FctBinded)
- FctName: est le nom (string) de la fonction appelee via l'API
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
```js
this._MyServeurApp.AddApiAdminFct(FctName, FctBinded)
``` 