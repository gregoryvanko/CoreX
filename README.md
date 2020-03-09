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
        // Chemin relatif de l'icone
        this._MyServeurApp.IconRelPath = "/apple-icon-192x192.png"
        // Chemin du repertoire root du projet
        this._MyServeurApp.ClientAppRoot = __dirname
        // Chemin vers le dossier contenant les sources Js et CSS du client
        this._MyServeurApp.ClientAppFolder = "/TestClient"
        // Add serveur api for FctName = Test
        this._MyServeurApp.AddApiFct("Test", this.TestApiCallForFctTest.bind(this))
        // Add serveur api for FctName = TestC
        this._MyServeurApp.AddApiFct("TestC", this.TestApiCallForFctTestC.bind(this))
        // Lancement du module corex
        this._MyServeurApp.Start()
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
```
### Les fonctions backend de l'application

Pour ajouter une fonction dans l'API du serveur il faut utiliser la fonction serveur AddApiFct(FctName, FctBinded)
- FctName: est le nom (string) de la fonction appelee via l'API
- FctBinded: est la référence à la fonction a executer sur le serveur lorsque l'on recoit une commande API pour FctName
```js
this._MyServeurApp.AddApiFct(FctName, FctBinded)
``` 
    
Pour faire un Log en DB il faut utiliser les fonctions serveur LogAppliInfo(Valeur) ou LogAppliError(Valeur)
- Valeur       : valeur a enregister dans la db en tant que type 'info"

```js 
this._MyServeurApp.LogAppliInfo(Valeur)
this._MyServeurApp.LogAppliError(Valeur)
```

### Le frontend client de l'application

Les fichiers JS et CSS du frontend client de l'application doivent se trouver sous répertoire défini par la variable "ClientAppFolder".

```js
/** Logout de l'application securisée */
GlobalLogout()
```
```js
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
```

Les modules disponible

```js
//** Action Button en haut a droite de l'écran */
// Creation du boutton
var GlobalActionButton = new CoreXActionButton()
GlobalActionButton.Start()
// Clear de la liste des Action
GlobalActionButton.ClearActionList()
// Add d'une action
GlobalActionButton.AddAction(Titre, Fct)
```

```js
//** Les fenetres */
// Creation d'un fenetre
CoreXWindow.BuildWindow(ElementHtml) // ElementHtml est le contenu object html de la fenetre
// Suppression de la fenetre
CoreXWindow.DeleteWindow()
```
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