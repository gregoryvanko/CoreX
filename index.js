class corex {
    constructor({AppName = "MyApp", Port=3000, Secret="EncryptSecret", MongoUrl="mongodb://localhost:27017"} = {}){
        // Variable externe indispensable de la class
        this._AppName = AppName
        this._Port = Port
        this._Secret = Secret
        this._MongoUrl = MongoUrl
        this._MongoDbName = this._AppName

        // Variable externe secondaire
        this._Debug = true
        this._AppIsSecured = true
        this._CSS = {FontSize:{TexteNomrale:"2vw", TexteIphone:"3vw", TexteMax:"20px",TitreNormale:"4vw", TitreIphone:"7vw", TitreMax:"50px"},Color:{Normale:"rgb(20, 163, 255)"}}
        this._Icon = __dirname + "/apple-icon-192x192.png"
        this._ClientAppFolderRoot = __dirname
        this._ClientAppFolder = "/Client_CoreX_DefaultApp"
        this._Usesocketio = false
        this._ApiFctList = []

        // Varaible interne MongoDB
        let MongoR = require('./Mongo.js').Mongo
        this._Mongo = new MongoR(this._MongoUrl,this._MongoDbName)
        this._MongoLoginClientCollection = "LoginClient"
        this._MongoLoginAdminCollection = "LoginAdmin"
        this._MongoLoginUserItem = "User"
        this._MongoLoginPassItem = "Password"
        this._MongoLoginConfirmPassItem = "Confirm-Password"
        this._MongoLoginFirstNameItem = "First-name"
        this._MongoLoginLastNameItem = "Last-name"
        this._MongoLogAppliCollection = "LogAppli"
        this._MongoLogAppliNow = "Now"
        this._MongoLogAppliType = "Type"
        this._MongoLogAppliValeur = "Valeur"

        // Variable Interne SocketIO
        this._RoomName = "Secured";
        this._io=null;
        this._NumClientConnected = 0

        // Variable Interne Express
        this._Express = require('express')()
        this._http = require('http').Server(this._Express)
    }
    
    set Debug(val){this._Debug = val}
    set AppIsSecured(val){this._AppIsSecured = val}
    set CSS(val){this._CSS = val}
    set Usesocketio(val){this._Usesocketio = val}
    set IconRelPath(val){
        //var appRoot = process.cwd()
        //this._Icon = appRoot + val
        this._Icon = this._ClientAppFolderRoot + val
    }
    set ClientAppFolder(val){
        //this._ClientAppFolderRoot = process.cwd()   
        this._ClientAppFolder = val
    }
    set ClientAppRoot(val){
        this._ClientAppFolderRoot = val  
    }

    /* Start du Serveur de l'application */
    Start(){
        // Initialisation de variable et require
        var fs = require('fs')
        var me = this
        // Message de demarrage
        console.log("Application started")
        this.LogDebug("Application started")
        // Initiation de la DB
        this.InitMongoDb()
        // utilistaion de body-parser
		var bodyParser = require("body-parser")
		this._Express.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
        this._Express.use(bodyParser.json({limit: '200mb'}))
        // Creation d'une route de base pour l'application
		this._Express.get('/', function(req, res, next){
            if (me._AppIsSecured) {
                me.LogAppliInfo("Send Initial Secured HTML for application app")
                res.send(me.GetInitialSecuredHTML("app"))
            } else {
                // Envoyer l'App
                me.LogAppliInfo("Send Initial HTML for application app")
                res.send(me.GetInitialHTML())
            }
        })
        // Creation d'une route vers l'application admin
		this._Express.get('/admin', function(req, res, next){
            me.LogAppliInfo("Send Initial Secured HTML for application Admin")
            res.send(me.GetInitialSecuredHTML("admin"))
        })
        // Creation d'un route pour le login via Post
		this._Express.post('/login', function (req, res){
            me.LogAppliInfo("Receive Post Login: " + JSON.stringify(req.body))
            // analyse du login en fonction du site
            switch (req.body.Site) {
                case "app":
                    me.VerifyLogin(res, me._MongoLoginClientCollection, req.body.Login,req.body.Pass)
                    break
                case "admin":
                    me.VerifyLogin(res, me._MongoLoginAdminCollection, req.body.Login,req.body.Pass)
                    break
                default:
                    me.LogAppliError(" => No login for site: " + req.body.Site)
                    res.json({Error: true, ErrorMsg:"No login for site: " + req.body.Site, Token: ""})
                    break
            }
        })
        // Creation d'une route pour loader l'application
		this._Express.post('/loadApp', function(req, res, next){
            me.LogDebug("Receive Post loadApp")
            // validation du Token
            let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
            if (DecryptTokenReponse.TokenValide) {
                // vérification que le UserId du Token existe en DB et envoie de l'app
                me.CheckTokenUserIdAndSendApp(req.body.Site, DecryptTokenReponse.TokenData.data.UserData._id, DecryptTokenReponse.TokenData.data.LoginCollection, res)
            } else {
                me.LogAppliError(" => Token non valide")
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        })
        // Creation d'une route pour API l'application
		this._Express.post('/api', function(req, res, next){
            //me.LogDebug("API Call, FctName: " + req.body.FctName)
            let Continue = false
            let DecryptTokenReponse = null
            // Si l'application est securisee 
            if (me._AppIsSecured){
                // validation du Token
                DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide){
                    if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoLoginClientCollection){
                        Continue = true
                    } else {
                        Continue = false
                        me.LogAppliError(" => Token non valide, LoginCollection incorrect")
                        res.json({Error: true, ErrorMsg:"Token non valide, LoginCollection incorrect"})
                    }
                } else {
                    Continue = false
                    me.LogAppliError(" => Token non valide")
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                Continue = true
            }
            // si on a valider la securité
            if (Continue) {
                // Analyse de la logincollection en fonction du site
                switch (req.body.FctName) {
                    case "GetMyData":
                        if (DecryptTokenReponse != null) {
                            me.ApiGetMyData("App",DecryptTokenReponse.TokenData.data.UserData._id, res)
                        } else {
                            me.LogAppliError(" => No personal data for application not secured")
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    case "UpdateMyUser":
                        if (DecryptTokenReponse != null) {
                            let DataCall = new Object()
                            DataCall.UsesrId = DecryptTokenReponse.TokenData.data.UserData._id
                            DataCall.UserType = ""
                            DataCall.Data = req.body.FctData
                            me.ApiAUpdateUser(DataCall, res)
                        } else {
                            me.LogAppliError(" => No personal data for application not secured")
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    default:
                        let UserId = null
                        if (DecryptTokenReponse != null){
                            UserId = DecryptTokenReponse.TokenData.data.UserData._id
                        }
                        let FctNotFound = true
                        me._ApiFctList.forEach(element => {
                            if (element.FctName == req.body.FctName){
                                element.Fct(req.body.FctData, res, UserId)
                                FctNotFound = false
                            }
                        })
                        if (FctNotFound){
                            me.LogAppliError(" => No API for FctName: " + req.body.FctName)
                            res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                        }
                        break
                }
            }
        })
        // Creation d'une route pour API Admin l'application
		this._Express.post('/apiadmin', function(req, res, next){
            //me.LogDebug("API Admin Call, FctName: " + req.body.FctName)
            // validation du Token
            let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
            if (DecryptTokenReponse.TokenValide) {
                if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoLoginAdminCollection){
                    // Analyse de la logincollection en fonction du site
                    switch (req.body.FctName) {
                        case "GetAllUser":
                            me.ApiAdminGetAllUsers(req.body.FctData, res)
                            break
                        case "GetUserData":
                            me.ApiAdminGetUserData(req.body.FctData, res)
                            break
                        case "UpdateUser":
                            me.ApiAUpdateUser(req.body.FctData, res)
                            break
                        case "DeleteUser":
                            me.ApiAdminDeleteUser(req.body.FctData, res)
                            break
                        case "GetUserDataStructure":
                            me.ApiAdminGetUserDataStructure(req.body.FctData, res)
                            break
                        case "NewUser":
                            me.ApiAdminNewUser(req.body.FctData, res)
                            break
                        case "GetLog":
                            me.ApiAdminGetLog(req.body.FctData, res)
                            break
                        case "GetMyData":
                            me.ApiGetMyData("Admin",DecryptTokenReponse.TokenData.data.UserData._id, res)
                            break
                        case "UpdateMyUser":
                            let DataCall = new Object()
                            DataCall.UsesrId = DecryptTokenReponse.TokenData.data.UserData._id
                            DataCall.UserType = "Admin"
                            DataCall.Data = req.body.FctData
                            me.ApiAUpdateUser(DataCall, res)
                            break
                        default:
                            me.LogAppliError(" => No API Admin for FctName: " + req.body.FctName)
                            res.json({Error: true, ErrorMsg:"No API Admin for FctName: " + req.body.FctName})
                            break
                    }
                } else {
                    me.LogAppliError(" => Token non valide, LoginCollection incorrect")
                    res.json({Error: true, ErrorMsg:"Token non valide, LoginCollection incorrect"})
                }
            } else {
                me.LogAppliError(" => Token non valide")
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        })
        // Creation d'un route pour l'icone
        this._Express.get('/apple-icon.png', function (req, res) {
            me.LogDebug("Get apple-icon.png: " + me._Icon)
            res.send(fs.readFileSync(me._Icon))
        })
        // Creation d'un route pour l'icone
        this._Express.get('/apple-touch-icon.png', function (req, res) {
            me.LogDebug("Get apple-touch-icon.png: " + me._Icon)
            res.send(fs.readFileSync(me._Icon))
        })
        // Creation d'un route pour favicon.ico
        this._Express.get('/favicon.ico', function (req, res) {
            me.LogDebug("Get favicon.ico: " + me._Icon)
            res.send(fs.readFileSync(me._Icon))
        })
        // Creation de la route 404
        this._Express.use(function(req, res, next) {
            me.LogAppliError('Mauvaise route: ' + req.originalUrl)
            res.status(404).send("Sorry, the route " + req.originalUrl +" doesn't exist");
        })
        // Si on utilise Socket IO, alors on effectue une initialisation de socket io
        if(this._Usesocketio){
            // Creation de socket io
            this._io= require('socket.io')(this._http);
            
            // Middleware sur socket io qui analyse la validité du Token genere via le login
            this._io.use(function(socket, next){
                // if (me._AppIsSecured) {
                // 	if (socket.handshake.query && socket.handshake.query.token){
                //         if (socket.handshake.query.token != "null"){
                //             let Token = me.DecryptDataToken(socket.handshake.query.token)
                //             if(Token != null){ // le token est valide
                //                 me.LogDebug("Token valide")
                //                 next()
                //             } else { // Le token n'est pas valide
                //                 me.LogDebug("Token non valide")
                //                 let err  = new Error('Token error')
                //                 err.data = { type : 'Token ne correspons pas' }
                //                 next(err)
                //             }
                //         } else {
                //             me.LogDebug("Token est null")
                //             let err  = new Error('Token error')
                //             err.data = { type : 'Token est null' }
                //             next(err)
                //         }
                // 	} else {
                // 		me.LogDebug("Token non disponible")
                // 		let err  = new Error('Token error')
                // 		err.data = { type : 'Token non disponible' }
                // 		next(err)
                // 	} 
                // } else {
                    next()
                //}
            })
            
            this._io.on('connection', function(socket){	
            //    // Get Token
            //    let Token = {data:"Not Secured app"}
            //    if (me._AppIsSecured){
            //        // Get Token
            //        Token = me.DecryptDataToken(socket.handshake.query.token)
            //    }
            //    // Count user connected
            //    me._NumClientConnected ++	
            //    // Le socket rejoint la room securisee
            //    socket.join(me._RoomName);
            //    // Envoie au client le code de l'application
            //    socket.emit('LoadingApp', me.GetCode(Token.data))
            //    // LogDebug du nombre de user
            //    me.LogDebug('user connected, nb user :' + me.UserCount());

            //    // Reception du message client de déconnection
            //    socket.on('disconnect', () => {
            //        // Count User Connected
            //        me._NumClientConnected --
                    // LogDebug du nombre de user
            //        me.LogDebug('user disconnected, nb user: ' + me.UserCount());
            //    })

            //    // Reception du message de changement de config
            //    socket.on('UserConfig', (Message) => {
            //        me.ChangeUserConfig(socket, Token.data._id, Message)
            //    })

            //    // Reception des autres messages du client via un callbalck
            //    if(me._ServerMessage != null){
            //        me._ServerMessage(socket)
            //    }
            })
        }
        // Lancer le serveur
		this._http.listen(this._Port, function(){
			console.log('listening on *:' + me._Port)
		})
    }
    /* LogDebug dans la console */
    LogDebug(data){
        if(this._Debug){console.log(data)}
    }
    /** Log applicatif de type info dans la DB */
    LogAppliInfo(Valeur){
        var now = new Date()
        const DataToDb = { [this._MongoLogAppliNow]: now, [this._MongoLogAppliType]: "Info", [this._MongoLogAppliValeur]: Valeur}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoLogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " " + "Info" + " " + Valeur)
        },(erreur)=>{
            this.LogDebug("LogAppliInfo DB error : " + erreur)
        })
    }
    /** Log applicatif de type error dans la DB */
    LogAppliError(Valeur){
        var now = new Date()
        const DataToDb = { [this._MongoLogAppliNow]: now, [this._MongoLogAppliType]: "Error", [this._MongoLogAppliValeur]: Valeur}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoLogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " " + "Error" + " " + Valeur)
        },(erreur)=>{
            this.LogDebug("LogAppliError DB error : " + erreur)
        })
    }
    /** Get Date Formated */
    GetDateString(Now){
        var dd = Now.getDate()
        var mm = Now.getMonth()+1
        var yyyy = Now.getFullYear()
        var heure = Now.getHours()
        var minute = Now.getMinutes()
        var seconde = Now.getSeconds()
        if(dd<10) {dd='0'+dd} 
        if(mm<10) {mm='0'+mm}
        if(heure<10) {heure='0'+heure}
        if(minute<10) {minute='0'+minute}
        if(seconde<10) {seconde='0'+seconde}
        return yyyy + "-" + mm + "-" + dd + " " + heure + ":" + minute + ":" + seconde
    }
    /* Initialisation des DB */
    InitMongoDb(){
        // Vérifier si la collection LoginAdmin existe. Si elle n'existe pas alors creation de la collection et du user
        let ErrorCallback = (err)=>{
            throw new Error('Erreur lors du check de la collection Login de la db: ' + err)
        }
        let DoneCallback = (Data) => {
            if(Data){
                this.LogDebug("La collection suivante existe : " + this._MongoLoginAdminCollection)
            } else {
                const DataToDb = { [this._MongoLoginUserItem]: "Admin", [this._MongoLoginFirstNameItem]: "Admin First Name", [this._MongoLoginLastNameItem]: "Admin Last Name", [this._MongoLoginPassItem]: "Admin", [this._MongoLoginConfirmPassItem]: "Admin"}
                this._Mongo.InsertOnePromise(DataToDb, this._MongoLoginAdminCollection).then((reponse)=>{
                    this.LogDebug("Creation de la collection : " + this._MongoLoginAdminCollection)
                },(erreur)=>{
                    this.LogDebug("Error Insert temp user admin in collection Login Admin")
                    throw new Error('Erreur lors de la creation du User Admin de la collection Admin de la db: ' + erreur)
                })
            }
        }
        this._Mongo.CollectionExist(this._MongoLoginAdminCollection, DoneCallback, ErrorCallback)
    }
    /** Ajout d'un fonction a gerer via l'API user */
    AddApiFct(FctName, Fct){
        let apiobject = new Object()
        apiobject.FctName = FctName
        apiobject.Fct = Fct
        this._ApiFctList.push(apiobject)
    }
    /* Generation du fichier HTML de base de l'application cliente securisée */
    GetInitialHTML(){
        let MyApp = this.GetAppCode()
        let HTMLStart =`
<!doctype html>
<html>
    <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="` + this._AppName + `">
        <link rel="apple-touch-icon" href="apple-icon.png">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>` + this._AppName + `</title>
        <style>
            :root {
                --CoreX-color: `+ this._CSS.Color.Normale +`;
                --CoreX-font-size : `+ this._CSS.FontSize.TexteNomrale +`;
                --CoreX-Iphone-font-size : `+ this._CSS.FontSize.TexteIphone +`;
                --CoreX-Max-font-size : `+ this._CSS.FontSize.TexteMax +`;
                --CoreX-Titrefont-size : `+ this._CSS.FontSize.TitreNormale +`;
                --CoreX-TitreIphone-font-size : `+ this._CSS.FontSize.TitreIphone +`;
                --CoreX-TitreMax-font-size : `+ this._CSS.FontSize.TitreMax +`;
            }
            body{
                margin: 0;
                padding: 0;
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none; 
                -webkit-user-select: none;   
                -khtml-user-select: none;    
                -moz-user-select: none;      
                -ms-user-select: none;      
                user-select: none;  
                cursor: default;
                font-family: 'Myriad Set Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-synthesis: none;
                letter-spacing: normal;
                text-rendering: optimizelegibility;
                width: 100%;
                height: 100VH;
            }
        </style>`
        let GlobalCallApiPromise = `
        function GlobalCallApiPromise(FctName, FctData, UploadProgress, DownloadProgress){
            return new Promise((resolve, reject)=>{
                var xhttp = new XMLHttpRequest()
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let reponse = JSON.parse(this.responseText)
                        if (reponse.Error) {
                            console.log('GlobalCallApiPromise Error : ' + reponse.ErrorMsg)
                            reject(reponse.ErrorMsg)
                        } else {
                            resolve(reponse.Data) 
                        }
                    } else if (this.readyState == 4 && this.status != 200){
                        reject(this.response)
                    }
                }
                xhttp.onprogress = function (event) {
                    if(DownloadProgress){DownloadProgress(event)}
                    //console.log("Download => Loaded: " + event.loaded + " Total: " +event.total)
                }
                xhttp.upload.onprogress= function (event){
                    if(UploadProgress){UploadProgress(event)}
                    //console.log("Upload => Loaded: " + event.loaded + " Total: " + event.total)
                }
                xhttp.open("POST", "`+ apiurl +`", true)
                xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                xhttp.send(JSON.stringify({Token:MyCoreXLoader.GetTokenLogin(), FctName:FctName, FctData:FctData}))
            })
        }`
        let CSS = `
        <style id="CodeCSS">
        ` + MyApp.CSS + `
        </style>`
        let JS = `
        <script id="CodeJS" type="text/javascript"> 
        ` + GlobalCallApiPromise +`
            // Creation de l'application
            let MyApp = new CoreXApp()
            // Fonction globale GlobalClearActionList
            function GlobalClearActionList() {
                MyApp.ClearActionList()
            }
            // Fonction gloable AddActionInList
            function GlobalAddActionInList(Titre, Action) {
                MyApp.AddActionInList(Titre, Action)
            }
            // Fonction globale GetContentAppId
            function GlobalCoreXGetAppContentId() {
                return MyApp.ContentAppId
            }
            // Fonction globale Add App in CoreXApp
            function GlobalCoreXAddApp(AppTitre, AppSrc, AppStart) {
                MyApp.AddApp(AppTitre, AppSrc, AppStart)
            }
            // Fonction globale Start App CoreXApp
            function GlobalCoreXStart(){
                MyApp.Start()
            }
        ` + MyApp.JS + `
        </script>`
        let HTMLEnd = ` 
    </head>
    <body> 
    </body>
    `+ JS +`
</html>`
        return HTMLStart + CSS + HTMLEnd
    }
    /* Generation du fichier HTML de base de l'application cliente securisée */
	GetInitialSecuredHTML(Site){
        let fs = require('fs')
        let os = require('os');

        let HTMLStart =`
<!doctype html>
<html>
    <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="` + this._AppName + `">
        <link rel="apple-touch-icon" href="apple-icon.png">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>` + this._AppName + `</title>
        <style>
            :root {
                --CoreX-color: `+ this._CSS.Color.Normale +`;
                --CoreX-font-size : `+ this._CSS.FontSize.TexteNomrale +`;
                --CoreX-Iphone-font-size : `+ this._CSS.FontSize.TexteIphone +`;
                --CoreX-Max-font-size : `+ this._CSS.FontSize.TexteMax +`;
                --CoreX-Titrefont-size : `+ this._CSS.FontSize.TitreNormale +`;
                --CoreX-TitreIphone-font-size : `+ this._CSS.FontSize.TitreIphone +`;
                --CoreX-TitreMax-font-size : `+ this._CSS.FontSize.TitreMax +`;
            }
            body{
                margin: 0;
                padding: 0;
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none; 
                -webkit-user-select: none;   
                -khtml-user-select: none;    
                -moz-user-select: none;      
                -ms-user-select: none;      
                user-select: none;  
                cursor: default;
                font-family: 'Myriad Set Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-synthesis: none;
                letter-spacing: normal;
                text-rendering: optimizelegibility;
                width: 100%;
                height: 100VH;
            }
        </style>` 

        let SocketIO = ""
        if (this._Usesocketio) { SocketIO = `<script src="/socket.io/socket.io.js"></script>`}
        
        let HTML1 = `<script>`
        let CoreXLoaderJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Loader.js", 'utf8')
        let CoreXLoginJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Login.js", 'utf8')
        
        let apiurl = (Site == "admin") ? "apiadmin" : "api"
        let GlobalCallApiPromise = `
            function GlobalCallApiPromise(FctName, FctData, UploadProgress, DownloadProgress){
                return new Promise((resolve, reject)=>{
                    var xhttp = new XMLHttpRequest()
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            let reponse = JSON.parse(this.responseText)
                            if (reponse.Error) {
                                console.log('GlobalCallApiPromise Error : ' + reponse.ErrorMsg)
                                reject(reponse.ErrorMsg)
                            } else {
                                resolve(reponse.Data) 
                            }
                        } else if (this.readyState == 4 && this.status != 200){
                            reject(this.response)
                        }
                    }
                    xhttp.onprogress = function (event) {
                        if(DownloadProgress){DownloadProgress(event)}
                        //console.log("Download => Loaded: " + event.loaded + " Total: " +event.total)
                    }
                    xhttp.upload.onprogress= function (event){
                        if(UploadProgress){UploadProgress(event)}
                        //console.log("Upload => Loaded: " + event.loaded + " Total: " + event.total)
                    }
                    xhttp.open("POST", "`+ apiurl +`", true)
                    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                    xhttp.send(JSON.stringify({Token:MyCoreXLoader.GetTokenLogin(), FctName:FctName, FctData:FctData}))
                })
            }`

        let HTML2 = `</script>`

        let LoadScript = ` 
        <script>
            let OptionCoreXLoader = {Usesocketio: ` + this._Usesocketio + `, Color: "` + this._CSS.Color.Normale + `"}
            var MyCoreXLoader = new CoreXLoader(OptionCoreXLoader)
            function GlobalLogout(){MyCoreXLoader.LogOut()}
            onload = function() {
                MyCoreXLoader.Site = "` + Site + `"
                MyCoreXLoader.Start()
            }
        </script>`

        let HTMLEnd = ` 
    </head>
    <body>
    </body>
</html>`
        return HTMLStart + SocketIO + HTML1 + CoreXLoaderJsScript + os.EOL + CoreXLoginJsScript + os.EOL + GlobalCallApiPromise + os.EOL + HTML2 + LoadScript + HTMLEnd
    }
    /* Verification du login */
    VerifyLogin(res, LoginCollection, Login, Pass){
        const Query = { [this._MongoLoginUserItem]: Login}
        const Projection = { projection:{ _id: 1, [this._MongoLoginPassItem]: 1}}
        this._Mongo.FindPromise(Query,Projection, LoginCollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Login non valide, pas de row en db pour ce user")
                res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
            } else if (reponse.length == 1){
                if (reponse[0][this._MongoLoginPassItem] == Pass){
                    this.LogAppliInfo("Login valide")
                    delete reponse[0][this._MongoLoginPassItem]
                    let MyToken = new Object()
                    MyToken.UserData = reponse[0]
                    MyToken.LoginCollection = LoginCollection
                    res.json({Error: false, ErrorMsg:"", Token: this.EncryptDataToken(MyToken)})
                } else {
                    this.LogAppliError("Login non valide, le Pass est different du password en db")
                    res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
                }
            } else {
                this.LogAppliError("Login non valide, trop de row en db pour ce user")
                res.json({Error: true, ErrorMsg:"DB Error", Token: ""})
            }
        },(erreur)=>{
            this.LogAppliError("Login non valide, erreur dans le call à la db : " + erreur)
            res.json({Error: true, ErrorMsg:"DB Error", Token: ""})
        })
    }
    /* genère et encrypt un Json Web Token */
    EncryptDataToken(DBData){
        // creation d'un JWT
        let jwt = require('jsonwebtoken');
        var token = jwt.sign({ data: DBData }, this._Secret);
        // encrytion du JWT
        let Encrypttoken = this.Encrypt(token)
        return Encrypttoken
    }
    /* Decript et valide un JWT */
    DecryptDataToken(token){
        let reponse = new Object()
        reponse.TokenValide = false
        reponse.TokenData = ""
        let DecryptReponse = this.Decrypt(token)
        if(DecryptReponse.decryptedValide){
            let jwt = require('jsonwebtoken')
            try {
                reponse.TokenData = jwt.verify(DecryptReponse.decryptedData, this._Secret)
                reponse.TokenValide = true
            } catch(err) {
                this.LogAppliError("jsonwebtoken non valide")
            }
        }
        return reponse
    }
    /* Encrypte un JSON? */
    Encrypt(text){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(this._Secret);
        const encryptedString = cryptr.encrypt(text);
        return encryptedString
    }
    /* Decrypte un string en Json */
    Decrypt(text){
        let reponse = new Object()
        reponse.decryptedValide = false
        reponse.decryptedData = ""
        let Cryptr = require('cryptr')
        let cryptr = new Cryptr(this._Secret)
        try {
            reponse.decryptedData = cryptr.decrypt(text)
            reponse.decryptedValide = true
        } catch (error) {
            this.LogAppliError("cryptr non valide")
        }
        return reponse
    }
    /* Check la validation du UserId contenu dans un Token et envoie de l'app */
    CheckTokenUserIdAndSendApp(Site, Id, Collection, res){
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        const Query = {'_id': new MongoObjectId(Id)}
        this._Mongo.CountPromise(Query, Collection).then((reponse)=>{
            if (reponse==1) {
                // Get Name of user in DB
                let Projection = { projection:{[this._MongoLoginUserItem]: 1}}
                this._Mongo.FindPromise(Query, Projection, Collection).then((reponse)=>{
                    this.LogAppliInfo("TokenUserId validé. User = " + reponse[0].User)
                    switch (Site) {
                        case "app":
                            this.LogAppliInfo("Start loading App")
                            let MyApp = this.GetAppCode()
                            res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS:MyApp.CSS})
                            break
                        case "admin":
                            this.LogAppliInfo("Start loading App Admin")
                            res.json({Error: false, ErrorMsg:"", CodeAppJS: this.GetAdminAppCode(),CodeAppCSS:"", CodeAppIMG:""})
                            break
                        default:
                            this.LogAppliError("No app for site: " + Site)
                            res.json({Error: true, ErrorMsg:"No app for site: " + Site})
                            break
                    }
                },(erreur)=>{
                    this.LogAppliError("CheckTokenUserIdAndSendApp DB error : " + erreur)
                })
            } else {
                this.LogAppliError("TokenUserId non validé. Nombre d'Id trouvéen DB: " + reponse)
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        },(erreur)=>{
            this.LogAppliError("TokenUserId validation => DB error : " + erreur)
            res.json({Error: true, ErrorMsg:"Token non valide"})
        })
    }
    /* Recuperer le code de l'App */
    GetAppCode(){
        let MyApp = new Object()
        MyApp.JS = ""
        MyApp.CSS = ""

        let fs = require('fs')
        let path = require('path')
        let os = require('os');

        // Ajout des modules de CoreX
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Modules.js", 'utf8') + os.EOL
        MyApp.JS += `
            // Creation de l'application
            let MyApp = new CoreXApp()
            // Fonction globale GlobalClearActionList
            function GlobalClearActionList() {
                MyApp.ClearActionList()
            }
            // Fonction gloable AddActionInList
            function GlobalAddActionInList(Titre, Action) {
                MyApp.AddActionInList(Titre, Action)
            }
            // Fonction globale GetContentAppId
            function GlobalCoreXGetAppContentId() {
                return MyApp.ContentAppId
            }
            // Fonction globale Add App in CoreXApp
            function GlobalCoreXAddApp(AppTitre, AppSrc, AppStart) {
                MyApp.AddApp(AppTitre, AppSrc, AppStart)
            }
            // Fonction globale Start App CoreXApp
            function GlobalCoreXStart(){
                MyApp.Start()
            }
            `

        let folder = this._ClientAppFolderRoot + this._ClientAppFolder
        if(fs.existsSync(folder)){
            var files = fs.readdirSync(folder)
            for (var i in files){
                if(fs.existsSync(folder + "/" + files[i])){
                    switch (path.extname(files[i])) {
                        case ".js":
                            MyApp.JS += fs.readFileSync(folder + "/" + files[i], 'utf8') + os.EOL 
                            break;
                        case ".css":
                            MyApp.CSS += fs.readFileSync(folder + "/" + files[i], 'utf8') + os.EOL 
                            break;
                        default:
                            this.LogAppliError("file extension not know: " + path.extname(files[i]))
                            console.log("file extension not know: " + path.extname(files[i]))
                            break;
                    }
                } else {
                    this.LogAppliError("file not found: " + this._ClientAppFolderRoot + files[i])
                    console.log("file not found: " + this._ClientAppFolderRoot + files[i])
                }
            }
        } else {
            this.LogAppliError("Client folder not found: " + this._ClientAppFolderRoot)
            console.log("Client folder not found: " + this._ClientAppFolderRoot)
        }
        return MyApp
    }
    /* Recuperer le code de l'Admin App */
    GetAdminAppCode(){
        let fs = require('fs')
        let os = require('os')
        let reponse = fs.readFileSync(__dirname + "/Client_CoreX_Modules.js", 'utf8')
        reponse += os.EOL
        reponse += `
            // Creation de l'application
            let MyApp = new CoreXApp()
            // Fonction globale GlobalClearActionList
            function GlobalClearActionList() {
                MyApp.ClearActionList()
            }
            // Fonction gloable AddActionInList
            function GlobalAddActionInList(Titre, Action) {
                MyApp.AddActionInList(Titre, Action)
            }
            // Fonction globale GetContentAppId
            function GlobalCoreXGetAppContentId() {
                return MyApp.ContentAppId
            }
            // Fonction globale Add App in CoreXApp
            function GlobalCoreXAddApp(AppTitre, AppSrc, AppStart) {
                MyApp.AddApp(AppTitre, AppSrc, AppStart)
            }
            // Fonction globale Start App CoreXApp
            function GlobalCoreXStart(){
                MyApp.Start()
            }
            `
        // Ajout de la classe de l'application admin
        reponse += fs.readFileSync(__dirname + "/Client_CoreX_Admin_Log.js", 'utf8')
        reponse += os.EOL
        reponse += fs.readFileSync(__dirname + "/Client_CoreX_Admin_Start.js", 'utf8')
        reponse += os.EOL
        //reponse += fs.readFileSync(__dirname + "/Client_CoreX_AdminApp.js", 'utf8')
        //reponse += os.EOL
        return reponse
    }

    /* Get list of all user via l'ApiAdmin */
    ApiAdminGetAllUsers(type, res){
        this.LogAppliInfo("Call API Admin, FctName: GetAllUsers, Data: " + type)
        let mongocollection =""
        if (type == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        const Query = {}
        const Projection = { projection:{ _id: 1, [this._MongoLoginUserItem]: 1}}
        const Sort = {[this._MongoLoginUserItem]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, mongocollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogDebug("No user in BD")
                res.json({Error: false, ErrorMsg: "No user in BD", Data: null})
            } else {
                res.json({Error: false, ErrorMsg: "User in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetAllUsers DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: ""})
        })
    }
    /* Get list of user data via l'ApiAdmin */
    ApiAdminGetUserData(Data, res){
        this.LogAppliInfo("Call API Admin, FctName: GetUserData, Data: " + JSON.stringify(Data))
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        // Définition de la collection de Mongo en fonction du type de user
        let mongocollection =""
        if (Data.UserType == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        // Definition de la Query de Mongo
        const Query = {'_id': new MongoObjectId(Data.UsesrId)}
        // Definition de la projection de Mongo en fonction du type de user
        let Projection = {projection:{}}
        // Find de type Promise de Mongo
        this._Mongo.FindPromise(Query,Projection, mongocollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Wrong User Id")
                res.json({Error: true, ErrorMsg: "Wrong User Id", Data: null})
            } else {
                // les password sont effacés de la réponse
                reponse[0][this._MongoLoginPassItem]=""
                reponse[0][this._MongoLoginConfirmPassItem]=""
                // la reponse est envoyée
                res.json({Error: false, ErrorMsg: "User data in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetUserData DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }
    /* Delete d'un user via l'ApiAdmin */
    ApiAdminDeleteUser(Data, res){
        this.LogAppliInfo("Call API Admin, FctName: DeleteUser, Data: " + JSON.stringify(Data))
        // Définition de la collection de Mongo en fonction du type de user
        let mongocollection =""
        if (Data.UserType == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        // Delete de type Promise de Mongo
        this._Mongo.DeleteByIdPromise(Data.UsesrId, mongocollection).then((reponse)=>{
            if (reponse.deletedCount==1) {
                res.json({Error: false, ErrorMsg: "User deleted in DB", Data: null})
            } else {
                this.LogAppliError("User not found in DB")
                res.json({Error: true, ErrorMsg: "User not found in DB", Data: null})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminDeleteUser DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }
    /** Get de la structure d'un user */
    ApiAdminGetUserDataStructure(Data, res){
        this.LogAppliInfo("Call API Admin, FctName: GetUserDataStructure, Data: " + Data)
        let reponse=[]
        // Data strucutre d'un user
        reponse.push(this._MongoLoginUserItem)
        reponse.push(this._MongoLoginFirstNameItem)
        reponse.push(this._MongoLoginLastNameItem)
        reponse.push(this._MongoLoginPassItem)
        reponse.push(this._MongoLoginConfirmPassItem)
        if (Data == "Admin") {
            // Add data strucutre only for admin
        } else {
            // Add data strucutre only for user
        }
        res.json({Error: false, ErrorMsg: "User data structure", Data: reponse})
    }
    /** Creation d'un nouvel user */
    ApiAdminNewUser(Data, res){
        this.LogAppliInfo("Call API Admin, FctName: NewUser, Data: " + JSON.stringify(Data))
        // Définition de la collection de Mongo en fonction du type de user
        let mongocollection =""
        if (Data.UserType == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        let DataToDb = { [this._MongoLoginUserItem]: Data.Data[this._MongoLoginUserItem], [this._MongoLoginFirstNameItem]: Data.Data[this._MongoLoginFirstNameItem], [this._MongoLoginLastNameItem]: Data.Data[this._MongoLoginLastNameItem], [this._MongoLoginPassItem]: Data.Data[this._MongoLoginPassItem], [this._MongoLoginConfirmPassItem]: Data.Data[this._MongoLoginConfirmPassItem]}
        // Insert de type Promise de Mongo
        this._Mongo.InsertOnePromise(DataToDb, mongocollection).then((reponse)=>{
            res.json({Error: false, ErrorMsg: "User added in DB", Data: null})
        },(erreur)=>{
            this.LogAppliError("ApiAdminNewUser DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }
    /** Get des log de l'application */
    ApiAdminGetLog(Data, res){
        this.LogAppliInfo("Call API Admin, FctName: GetLog, Skip data value: " + Data)
        let mongocollection = this._MongoLogAppliCollection
        const Query = {}
        const Projection = {}
        const Sort = {[this._MongoLogAppliNow]: -1}
        this._Mongo.FindSortLimitSkipPromise(Query,Projection, Sort, 10, parseInt(Data), mongocollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogDebug("No Log in BD")
                res.json({Error: false, ErrorMsg: "No Log in BD", Data: null})
            } else {
                res.json({Error: false, ErrorMsg: "Log in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetAllUsers DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: ""})
        })
    }

    /** Get My Data of a connected user (meme fonction pour Api et ApiAdmin) */
    ApiGetMyData(App, Id, res){
        this.LogAppliInfo("Call API Admin, FctName: ApiGetMyData, Data: App=" + App + " Id="+Id)
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        // Définition de la collection de Mongo en fonction du type de user
        let mongocollection =""
        if (App == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        // Definition de la Query de Mongo
        const Query = {'_id': new MongoObjectId(Id)}
        // Definition de la projection de Mongo en fonction du type de user
        let Projection = { projection:{ _id: 0}}
        // Find de type Promise de Mongo
        this._Mongo.FindPromise(Query,Projection, mongocollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Wrong User Id")
                res.json({Error: true, ErrorMsg: "Wrong User Id", Data: null})
            } else {
                // les password sont effacés de la réponse
                reponse[0][this._MongoLoginPassItem]=""
                reponse[0][this._MongoLoginConfirmPassItem]=""
                // la reponse est envoyée
                res.json({Error: false, ErrorMsg: "User data in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetUserData DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }
    /* Update d'un user (meme fonction pour Api et ApiAdmin) */
    ApiAUpdateUser(Data, res){
        this.LogAppliInfo("Call API "+ Data.UserType + ", FctName: UpdateUser, Data: " + JSON.stringify(Data))
        // Définition de la collection de Mongo en fonction du type de user
        let mongocollection =""
        if (Data.UserType == "Admin") {mongocollection = this._MongoLoginAdminCollection}
        else {mongocollection = this._MongoLoginClientCollection}
        // changement du password que si il est different de vide
        if (Data.Data[this._MongoLoginPassItem] == ""){
            delete Data.Data[this._MongoLoginPassItem]
            delete Data.Data[this._MongoLoginConfirmPassItem]
        }
        // Update de type Promise de Mongo
        this._Mongo.UpdateByIdPromise(Data.UsesrId, Data.Data, mongocollection).then((reponse)=>{
            if (reponse.matchedCount==1) {
                res.json({Error: false, ErrorMsg: "User Updated in DB", Data: null})
            } else {
                this.LogAppliError("User not found in DB")
                res.json({Error: true, ErrorMsg: "User not found in DB", Data: null})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAUpdateUser DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }
}

module.exports.corex = corex
module.exports.Mongo = require('./Mongo.js').Mongo
module.exports.MongoObjectId = require('./Mongo.js').MongoObjectId