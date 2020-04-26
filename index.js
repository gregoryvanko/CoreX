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
        this._ClientAppFolder = null
        this._AdminAppFolder = null
        this._Usesocketio = false
        this._ApiFctList = []
        this._ApiAdminFctList = []

        // Varaible interne MongoDB
        let MongoR = require('./Mongo.js').Mongo
        this._Mongo = new MongoR(this._MongoUrl,this._MongoDbName)

        this._MongoVar = new Object()
        this._MongoVar.DbName = this._MongoDbName

        this._MongoVar.LoginClientCollection = "LoginClient"
        this._MongoVar.LoginAdminCollection = "LoginAdmin"
        this._MongoVar.LoginUserItem = "User"
        this._MongoVar.LoginPassItem = "Password"
        this._MongoVar.LoginConfirmPassItem = "Confirm-Password"
        this._MongoVar.LoginFirstNameItem = "First-name"
        this._MongoVar.LoginLastNameItem = "Last-name"

        this._MongoVar.LogAppliCollection = "LogAppli"
        this._MongoVar.LogAppliNow = "Now"
        this._MongoVar.LogAppliType = "Type"
        this._MongoVar.LogAppliValeur = "Valeur"

        this._MongoVar.ConfigCollection = "Config"
        this._MongoVar.ConfigKey = "Key"
        this._MongoVar.ConfigValue = "Value"

        // Fonction API Admin
        let ApiAdminR = require('./Api_Admin.js').ApiAdmin
        this._ApiAdmin = new ApiAdminR(this.LogAppliInfo.bind(this), this.LogAppliError.bind(this), this._Mongo, this._MongoVar)

        // Variable Interne SocketIO
        this._RoomName = "Secured";
        this._io=null;
        this._NumClientConnected = 0

        // Variable Interne Express
        this._Express = require('express')()
        this._http = require('http').Server(this._Express)

        // Job Schedule
        this._JobSchedule = null
    }
    
    set Debug(val){this._Debug = val}
    set AppIsSecured(val){this._AppIsSecured = val}
    set CSS(val){this._CSS = val}
    set Usesocketio(val){this._Usesocketio = val}
    set IconRelPath(val){this._Icon = val}
    set ClientAppFolder(val){this._ClientAppFolder = val}
    set AdminAppFolder(val){this._AdminAppFolder = val}

    /* Start du Serveur de l'application */
    Start(){
        // Initialisation de variable et require
        var fs = require('fs')
        var me = this
        // Message de demarrage
        console.log("Application started")
        this.LogAppliInfo("Application started")
        // Initiation de la DB
        this.InitMongoDb()
        // utilistaion de body-parser
		var bodyParser = require("body-parser")
		this._Express.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
        this._Express.use(bodyParser.json({limit: '200mb'}))
        // Creation d'une route de base pour l'application
		this._Express.get('/', function(req, res, next){
            res.send(me.GetInitialHTML(me._AppIsSecured))
        })
        // Creation d'un route pour le login via Post
		this._Express.post('/login', function (req, res){
            me.LogAppliInfo("Receive Post Login: " + JSON.stringify(req.body))
            // analyse du login en fonction du site
            switch (req.body.Site) {
                case "App":
                    me.VerifyLogin(res, me._MongoVar.LoginClientCollection, req.body.Login,req.body.Pass)
                    break
                case "Admin":
                    me.VerifyLogin(res, me._MongoVar.LoginAdminCollection, req.body.Login,req.body.Pass)
                    break
                default:
                    me.LogAppliError("No login for site: " + req.body.Site)
                    res.json({Error: true, ErrorMsg:"No login for site: " + req.body.Site, Token: ""})
                    break
            }
        })
        // Creation d'une route pour loader l'application
		this._Express.post('/loadApp', function(req, res, next){
            me.LogDebug("Receive Post loadApp")
            if (me._AppIsSecured){
                // validation du Token
                let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide) {
                    // vérification que le UserId du Token existe en DB et envoie de l'app
                    me.CheckTokenUserIdAndSendApp(req.body.Site, DecryptTokenReponse.TokenData.data.UserData._id, DecryptTokenReponse.TokenData.data.LoginCollection, res)
                } else {
                    me.LogAppliError("Token non valide")
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                let MyApp = me.GetAppCode(req.body.Site)
                res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS: MyApp.CSS})
            }
            
        })
        // Creation d'une route pour API l'application
		this._Express.post('/api', function(req, res, next){
            let Continue = false
            let DecryptTokenReponse = null
            // Si l'application est securisee 
            if (me._AppIsSecured){
                // validation du Token
                DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide){
                    if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoVar.LoginClientCollection){
                        Continue = true
                    } else {
                        Continue = false
                        me.LogAppliError("Token non valide, LoginCollection incorrect")
                        res.json({Error: true, ErrorMsg:"Token non valide, LoginCollection incorrect"})
                    }
                } else {
                    Continue = false
                    me.LogAppliError("Token non valide")
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
                            me._ApiAdmin.GetMyData("App",DecryptTokenReponse.TokenData.data.UserData._id, res)
                        } else {
                            me.LogAppliError("No personal data for application not secured")
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    case "UpdateMyUser":
                        if (DecryptTokenReponse != null) {
                            let DataCall = new Object()
                            DataCall.UsesrId = DecryptTokenReponse.TokenData.data.UserData._id
                            DataCall.UserType = ""
                            DataCall.Data = req.body.FctData
                            me._ApiAdmin.UpdateUser(DataCall, res)
                        } else {
                            me.LogAppliError("No personal data for application not secured")
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    default:
                        let UserId = "Anonyme"
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
                            me.LogAppliError("No API for FctName: " + req.body.FctName)
                            res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                        }
                        break
                }
            }
        })
        // Creation d'une route pour API Admin l'application
		this._Express.post('/apiadmin', function(req, res, next){
            // validation du Token
            let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
            if (DecryptTokenReponse.TokenValide) {
                if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoVar.LoginAdminCollection){
                    // Analyse de la logincollection en fonction du site
                    switch (req.body.FctName) {
                        case "GetAllUser":
                            me._ApiAdmin.GetAllUsers(req.body.FctData, res)
                            break
                        case "GetUserData":
                            me._ApiAdmin.GetUserData(req.body.FctData, res)
                            break
                        case "UpdateUser":
                            me._ApiAdmin.UpdateUser(req.body.FctData, res)
                            break
                        case "DeleteUser":
                            me._ApiAdmin.DeleteUser(req.body.FctData, res)
                            break
                        case "GetUserDataStructure":
                            me._ApiAdmin.GetUserDataStructure(req.body.FctData, res)
                            break
                        case "NewUser":
                            me._ApiAdmin.NewUser(req.body.FctData, res)
                            break
                        case "GetLog":
                            me._ApiAdmin.GetLog(req.body.FctData, res)
                            break
                        case "Backup":
                            me._ApiAdmin.Backup(req.body.FctData, res, me.GetJobSchedule.bind(me), me.SetJobSchedule.bind(me))
                            break
                        case "GetMyData":
                            me._ApiAdmin.GetMyData("Admin",DecryptTokenReponse.TokenData.data.UserData._id, res)
                            break
                        case "UpdateMyUser":
                            let DataCall = new Object()
                            DataCall.UsesrId = DecryptTokenReponse.TokenData.data.UserData._id
                            DataCall.UserType = "Admin"
                            DataCall.Data = req.body.FctData
                            me._ApiAdmin.UpdateUser(DataCall, res)
                            break
                        default:
                            let UserId = DecryptTokenReponse.TokenData.data.UserData._id
                            let FctNotFound = true
                            me._ApiAdminFctList.forEach(element => {
                                if (element.FctName == req.body.FctName){
                                    element.Fct(req.body.FctData, res, UserId)
                                    FctNotFound = false
                                }
                            })
                            if (FctNotFound){
                                me.LogAppliError("No API Admin for FctName: " + req.body.FctName)
                                res.json({Error: true, ErrorMsg:"No API Admin for FctName: " + req.body.FctName})
                            }
                            break
                    }
                } else {
                    me.LogAppliError("Token non valide, LoginCollection incorrect")
                    res.json({Error: true, ErrorMsg:"Token non valide, LoginCollection incorrect"})
                }
            } else {
                me.LogAppliError("Token non valide")
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        })
        // Creation d'un route pour l'icone
        this._Express.get('/apple-icon.png', function (req, res) {
            me.LogDebug("Get apple-icon.png: " + me._Icon)
            let IconFile = me.GetIconFile(me._Icon)
            if (IconFile!=null){
                res.send(IconFile)
            } else {
                me.LogAppliError('Icon not found')
                res.status(404).send("Sorry, the route Icon not found");
            }
        })
        // Creation d'un route pour l'icone
        this._Express.get('/apple-touch-icon.png', function (req, res) {
            me.LogDebug("Get apple-touch-icon.png: " + me._Icon)
            let IconFile = me.GetIconFile(me._Icon)
            if (IconFile!=null){
                res.send(IconFile)
            } else {
                me.LogAppliError('Icon not found')
                res.status(404).send("Sorry, the route Icon not found");
            }
        })
        // Creation d'un route pour favicon.ico
        this._Express.get('/favicon.ico', function (req, res) {
            me.LogDebug("Get favicon.ico: " + me._Icon)
            let IconFile = me.GetIconFile(me._Icon)
            if (IconFile!=null){
                res.send(IconFile)
            } else {
                me.LogAppliError('Icon not found')
                res.status(404).send("Sorry, the route Icon not found");
            }
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
        // Gestion des erreur
        this._http.on('error', function(error){
            if (error.syscall !== 'listen') {
                throw error;
            }
            if (error.code == "EADDRINUSE"){
                console.error('Port is already in use')
                process.exit(1)
            }
        })
        // Lancer le serveur
		this._http.listen(this._Port, function(){
			console.log('listening on *:' + me._Port)
        })
    }
    /** Get Icon file */
    GetIconFile(val){
        var fs = require('fs')
        let file = null
        if(fs.existsSync(val)){
            file = fs.readFileSync(val)
        }
        return file
    }
    /* LogDebug dans la console */
    LogDebug(data){
        if(this._Debug){console.log(data)}
    }
    /** Log applicatif de type info dans la DB */
    LogAppliInfo(Valeur){
        var now = new Date()
        const DataToDb = { [this._MongoVar.LogAppliNow]: now, [this._MongoVar.LogAppliType]: "Info", [this._MongoVar.LogAppliValeur]: Valeur}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.LogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " " + "Info" + " " + Valeur)
        },(erreur)=>{
            this.LogDebug("LogAppliInfo DB error : " + erreur)
        })
    }
    /** Log applicatif de type error dans la DB */
    LogAppliError(Valeur){
        var now = new Date()
        const DataToDb = { [this._MongoVar.LogAppliNow]: now, [this._MongoVar.LogAppliType]: "Error", [this._MongoVar.LogAppliValeur]: Valeur}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.LogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " " + "Error " + Valeur)
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
        let DoneCallbackAdminCollection = (Data) => {
            if(Data){
                this.LogAppliInfo("La collection suivante existe : " + this._MongoVar.LoginAdminCollection)
            } else {
                const DataToDb = { [this._MongoVar.LoginUserItem]: "Admin", [this._MongoVar.LoginFirstNameItem]: "Admin First Name", [this._MongoVar.LoginLastNameItem]: "Admin Last Name", [this._MongoVar.LoginPassItem]: "Admin", [this._MongoVar.LoginConfirmPassItem]: "Admin"}
                this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.LoginAdminCollection).then((reponse)=>{
                    this.LogAppliInfo("Creation de la collection : " + this._MongoVar.LoginAdminCollection)
                },(erreur)=>{
                    this.LogAppliError("Insert temp user admin in collection Login Admin")
                    throw new Error('Erreur lors de la creation du User Admin de la collection Admin de la db: ' + erreur)
                })
            }
        }
        let DoneCallbackConfigCollection = (Data) => {
            if(Data){
                this.LogAppliInfo("La collection suivante existe : " + this._MongoVar.ConfigCollection)
                // Start du Backup
                this.StartJobScheduleBackup()
            } else {
                let BackupScheduler = new Object()
                BackupScheduler.JobScheduleHour = 3
                BackupScheduler.JobScheduleMinute = 30
                BackupScheduler.JobScheduleStarted = false

                let BackupGoogle = new Object()
                BackupGoogle.GoogleKey = ""
                BackupGoogle.Folder = ""

                const DataToDb = [
                    {[this._MongoVar.ConfigKey]: "BackupScheduler", [this._MongoVar.ConfigValue]: BackupScheduler},
                    {[this._MongoVar.ConfigKey]: "BackupGoogle", [this._MongoVar.ConfigValue]: BackupGoogle}
                ]

                this._Mongo.InsertMultiplePromise(DataToDb, this._MongoVar.ConfigCollection).then((reponse)=>{
                    this.LogAppliInfo("Creation de la collection : " + this._MongoVar.ConfigCollection)
                },(erreur)=>{
                    this.LogAppliError("Error Insert JobSchedule config in collection Config")
                    throw new Error('Erreur lors de la creation de la config JobSchedule dans la collection Config de la db: ' + erreur)
                })
            }
        }
        this._Mongo.CollectionExist(this._MongoVar.LoginAdminCollection, DoneCallbackAdminCollection, ErrorCallback)
        this._Mongo.CollectionExist(this._MongoVar.ConfigCollection, DoneCallbackConfigCollection, ErrorCallback)
    }
    /**
     * Start du schedule du backup
     */
    StartJobScheduleBackup(){
        this.GetDbConfig("BackupScheduler").then((reponse)=>{
            let BackupScheduler = reponse
            if(BackupScheduler.JobScheduleStarted == true){
                if (this._JobSchedule == null){
                    // Get GoogleKey
                    this.GetDbConfig("BackupGoogle").then((reponse)=>{
                        if((reponse.GoogleKey != "") && (reponse.Folder != "")){
                            let credentials = JSON.parse(reponse.GoogleKey)
                            let folder = reponse.Folder
                            this.LogAppliInfo("Start JobScheduleBackup ")
                            var schedule = require('node-schedule')
                            let options = {minute: BackupScheduler.JobScheduleMinute, hour: BackupScheduler.JobScheduleHour}
                            var me = this
                            this._JobSchedule = schedule.scheduleJob(options, function(){
                                let DbBackup = require('./DbBackup').DbBackup
                                let MyDbBackup = new DbBackup(me._MongoVar.DbName,credentials,folder, me.LogAppliInfo.bind(me))
                                MyDbBackup.Backup().then((reponse)=>{
                                    me.LogAppliInfo(reponse)
                                },(erreur)=>{
                                    me.LogAppliError("StartJobScheduleBackup error : " + erreur)
                                    console.log("Error during StartJobScheduleBackup: "+ erreur + " " + now)
                                })
                            })
                        } else {
                            this.LogAppliError("StartJobScheduleBackup Google key or Google folder is empty")
                        }
                    },(erreur)=>{
                        this.LogAppliError("StartJobScheduleBackup, get Google key error : " + erreur)
                    })
                } else {
                    this.LogAppliError("JobScheduler already exist")
                }
            } else {
                this.LogAppliInfo("JobScheduleBackup not started")
            }
        },(erreur)=>{
            this.LogAppliError("StartJobScheduleBackup: " + erreur)
        })
    }
    /** Ajout d'un fonction a gerer via l'API user */
    AddApiFct(FctName, Fct){
        let apiobject = new Object()
        apiobject.FctName = FctName
        apiobject.Fct = Fct
        this._ApiFctList.push(apiobject)
    }
    /** Ajout d'un fonction a gerer via l'API Admin */
    AddApiAdminFct(FctName, Fct){
        let apiobject = new Object()
        apiobject.FctName = FctName
        apiobject.Fct = Fct
        this._ApiAdminFctList.push(apiobject)
    }
    /* Generation du fichier HTML de base */
	GetInitialHTML(AppIsSecured){
        let fs = require('fs')
        let os = require('os')

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
                height: 100%;
            }
        </style>` 

        let SocketIO = ""
        if (this._Usesocketio) { SocketIO = `<script src="/socket.io/socket.io.js"></script>`}
        
        let HTML1 = `<script>`
        let CoreXLoaderJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Loader.js", 'utf8')
        let CoreXLoginJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Login.js", 'utf8')
        
        let GlobalCallApiPromise = `
            let TokenApp = localStorage.getItem("CoreXApp")
            if(TokenApp == null){
                TokenApp ="App"
                localStorage.setItem("CoreXApp", "App")
            }
            let apiurl = (TokenApp == "Admin") ? "apiadmin" : "api"
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
                    xhttp.open("POST", apiurl , true)
                    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                    xhttp.send(JSON.stringify({Token:MyCoreXLoader.GetTokenLogin(), FctName:FctName, FctData:FctData}))
                })
            }`
            
        let HTML2 = `</script>`

        let LoadScript = ` 
        <script>
            let OptionCoreXLoader = {Usesocketio: ` + this._Usesocketio + `, Color: "`+ this._CSS.Color.Normale +`", AppIsSecured: "`+ AppIsSecured +`"}
            var MyCoreXLoader = new CoreXLoader(OptionCoreXLoader)
            function GlobalLogout(){MyCoreXLoader.LogOut()}
            onload = function() {
                MyCoreXLoader.Site = TokenApp
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
        const Query = { [this._MongoVar.LoginUserItem]: Login}
        const Projection = { projection:{ _id: 1, [this._MongoVar.LoginPassItem]: 1}}
        this._Mongo.FindPromise(Query,Projection, LoginCollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Login non valide, pas de row en db pour ce user")
                res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
            } else if (reponse.length == 1){
                if (reponse[0][this._MongoVar.LoginPassItem] == Pass){
                    this.LogAppliInfo("Login valide")
                    delete reponse[0][this._MongoVar.LoginPassItem]
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
                let Projection = { projection:{[this._MongoVar.LoginUserItem]: 1}}
                this._Mongo.FindPromise(Query, Projection, Collection).then((reponse)=>{
                    this.LogAppliInfo("TokenUserId validé. User = " + reponse[0].User)
                    let MyApp = this.GetAppCode(Site)
                    res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS: MyApp.CSS})
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
    GetAppCode(Site){
        let MyApp = new Object()
        MyApp.JS = ""
        MyApp.CSS = ""

        let fs = require('fs')
        let os = require('os')

        // Ajout des modules de CoreX
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Modules.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Module_CoreXBuild.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Module_CoreXApp.js", 'utf8') + os.EOL
        MyApp.JS += `
            // Creation de l'application
            let MyApp = new CoreXApp(`+this._AppIsSecured+`)
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
            // Fonction globale Get User Data
            function GlobalGetUserDataPromise(){
                return new Promise((resolve, reject)=>{
                    GlobalCallApiPromise("GetAllUser", "User").then((reponse)=>{
                        resolve(reponse)
                    },(erreur)=>{
                        reject(erreur)
                    })
                })
            }
            `
        switch (Site) {
            case "Admin":
                this.LogAppliInfo("Start loading App Admin")
                MyApp = this.LoadAppFilesFromAdminFolder(MyApp)
                break
            default:
                this.LogAppliInfo("Start loading App")
                MyApp = this.LoadAppFilesFromClientFolder(MyApp)
                break
        }
        MyApp.JS += " MyApp.Start()"

        return MyApp
    }
    /**
     * On va chercher le contenu des fichier du repertoire client
     * @param {object} MyApp Objet contenant le code js et css
     */
    LoadAppFilesFromClientFolder(MyApp){
        let fs = require('fs')
        let path = require('path')
        let os = require('os')
        if(this._ClientAppFolder != null){
            let folder = this._ClientAppFolder
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
                                MyApp.JS += 'console.log("file extension not know: ' + path.extname(files[i]) + '")' + os.EOL 
                                this.LogAppliError("file extension not know: " + path.extname(files[i]))
                                break;
                        }
                    } else {
                        MyApp.JS += 'alert("file not found: ' + folder + "/" + files[i] + '")' + os.EOL 
                        this.LogAppliError("file not found: " + folder + "/" + files[i])
                    }
                }
            } else {
                MyApp.JS += 'alert("Client folder not found: ' + folder + '")' + os.EOL 
                this.LogAppliError("Client folder not found: " + folder)
            }
        } else {
            MyApp.JS += 'alert("Client folder not defined (=null)")' + os.EOL 
            this.LogAppliError("Client folder not defined (=null)")
        }
        return MyApp
    }
    /**
     * On va chercher le contenu des fichier du repertoire Admin
     * @param {object} MyApp Objet contenant le code js et css
     */
    LoadAppFilesFromAdminFolder(MyApp){
        let fs = require('fs')
        let path = require('path')
        let os = require('os')
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Admin_Backup.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Admin_Log.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Admin_User.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Admin_Start.js", 'utf8') + os.EOL
        if(this._AdminAppFolder != null){
            let folder = this._AdminAppFolder
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
                                MyApp.JS += 'console.log("file extension not know: ' + path.extname(files[i]) + '")' + os.EOL 
                                this.LogAppliError("file extension not know: " + path.extname(files[i]))
                                break;
                        }
                    } else {
                        MyApp.JS += 'alert("file not found: ' + folder + "/" + files[i] + '")' + os.EOL 
                        this.LogAppliError("file not found: " + folder + "/" + files[i])
                    } 
                }
            } else {
                MyApp.JS += 'alert("Admin folder not found: ' + folder + '")' + os.EOL 
                this.LogAppliError("Admin folder not found: " + folder)
            }
        } else {
            //MyApp.JS += 'alert("Admin folder not defined (=null)")' + os.EOL
            this.LogAppliError("Admin folder not defined (=null) ")
        }
        return MyApp
    }
    /**
     * Promise qui recupère un element de config dans la DB
     * @param {string} Key clef d'un element de la Config
     */
    GetDbConfig(Key){
        return new Promise((resolve, reject)=>{
            const Query = { [this._MongoVar.ConfigKey]: Key} 
            const Projection = { projection:{[this._MongoVar.ConfigValue]: 1}}
            this._Mongo.FindPromise(Query,Projection, this._MongoVar.ConfigCollection).then((reponse)=>{
                if(reponse.length == 0){
                    reject("Error GetDbConfig: no entry for this Key and ConfigType")
                } else if (reponse.length == 1){
                    resolve(reponse[0].Value)
                } else {
                    reject("Error GetDbConfig: too much entry for this Key and ConfigType")
                }
            },(erreur)=>{
                this.LogAppliError("GetDbConfig error : " + erreur)
                reject(erreur)
            })
        })
    }

    /** Get JobSchedule */
    GetJobSchedule(){
        return this._JobSchedule
    }
    /** Set JobSchedule */
    SetJobSchedule(JobSchedule){
        this._JobSchedule = JobSchedule
    }
}

module.exports.corex = corex
module.exports.Mongo = require('./Mongo.js').Mongo
module.exports.MongoObjectId = require('./Mongo.js').MongoObjectId