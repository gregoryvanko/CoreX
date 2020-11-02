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
        this._CSS = {
            FontSize:{TexteNomrale:"1.5vw", TexteIphone:"3vw", TexteMax:"18px",TitreNormale:"4vw", TitreIphone:"7vw", TitreMax:"50px"},
            Color:{Normale:"rgb(20, 163, 255)"},
            AppContent:{WidthNormale:"96%",WidthIphone:"96%",WidthMax:"1100px"}
        }
        this._Icon = __dirname + "/apple-icon-192x192.png"
        this._ClientAppFolder = null
        this._AdminAppFolder = null
        this._CommonAppFolder = null
        this._Usesocketio = false
        this._ApiFctList = []
        this._SocketIoFctList = []

        // Varaible interne MongoDB
        let MongoR = require('./Mongo.js').Mongo
        this._Mongo = new MongoR(this._MongoUrl,this._MongoDbName)

        this._MongoVar = new Object()
        this._MongoVar.DbName = this._MongoDbName

        this._MongoVar.UserCollection = "User"
        this._MongoVar.LoginUserItem = "User"
        this._MongoVar.LoginPassItem = "Password"
        this._MongoVar.LoginConfirmPassItem = "Confirm-Password"
        this._MongoVar.LoginFirstNameItem = "First-name"
        this._MongoVar.LoginLastNameItem = "Last-name"
        this._MongoVar.LoginAdminItem = "Admin"

        this._MongoVar.LogAppliCollection = "LogAppli"
        this._MongoVar.LogAppliNow = "Now"
        this._MongoVar.LogAppliType = "Type"
        this._MongoVar.LogAppliValeur = "Valeur"
        this._MongoVar.LogAppliUser = "User"
        this._MongoVar.LogAppliUserId = "UserId"

        this._MongoVar.ConfigCollection = "Config"
        this._MongoVar.ConfigKey = "Key"
        this._MongoVar.ConfigValue = "Value"

        // Fonction API Admin
        let ApiAdminR = require('./Api_Admin.js').ApiAdmin
        this._ApiAdmin = new ApiAdminR(this.LogAppliInfo.bind(this), this.LogAppliError.bind(this), this._Mongo, this._MongoVar)

        // Variable Interne SocketIO
        this._RoomName = "CoreX"
        this._io=null
        this._SocketIoClients = 0

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
    set CommonAppFolder(val){this._CommonAppFolder = val}
    get AppName(){return this._AppName}
    get MongoUrl(){return this._MongoUrl}
    get Io(){return this._io}

    /* Start du Serveur de l'application */
    Start(){
        // Initialisation de variable et require
        var fs = require('fs')
        var me = this
        // Message de demarrage
        console.log(this.GetDateString(new Date()) + " Application started")
        this.LogAppliInfo("Application started", "Server", "Server")
        // Initiation de la DB
        this.InitMongoDb()
        // utilistaion de body-parser
		var bodyParser = require("body-parser")
		this._Express.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
        this._Express.use(bodyParser.json({limit: '200mb'}))
        // Creation d'une route de base pour l'application
		this._Express.get('/', function(req, res, next){
            me.LogAppliInfo("Receive Get Start Page", "Server", "Server")
            res.send(me.GetInitialHTML(me._AppIsSecured))
        })
        // Creation d'un route pour le login via Post
		this._Express.post('/login', function (req, res){
            me.LogAppliInfo("Receive Post Login: " + JSON.stringify(req.body), "Server", "Server")
            // analyse du login en fonction du site
            me.VerifyLogin(res, req.body.Site, req.body.Login, req.body.Pass)
        })
        // Creation d'une route pour loader l'application
		this._Express.post('/loadApp', function(req, res, next){
            me.LogAppliInfo("Receive Post loadApp", "Server", "Server")
            if (me._AppIsSecured){
                // validation du Token
                let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide) {
                    // vérification que le UserId du Token existe en DB et envoie de l'app
                    me.CheckTokenUserIdAndSendApp(req.body.Site, DecryptTokenReponse.TokenData.data.UserData._id, res)
                } else {
                    me.LogAppliError("Token non valide", "Server", "Server")
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                let MyApp = me.GetAppCode(req.body.Site, "anonymous","anonymous")
                res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS: MyApp.CSS})
            }
            
        })
        // Creation d'une route pour API l'application
		this._Express.post('/api', function(req, res, next){
            let Continue = false
            let DecryptTokenReponse = null
            // Definition du user
            let User = "Anonyme"
            let UserId = "Anonyme"
            // Si l'application est securisee 
            if (me._AppIsSecured){
                // validation du Token
                DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide){
                    User = DecryptTokenReponse.TokenData.data.UserData.User
                    UserId = DecryptTokenReponse.TokenData.data.UserData._id
                    Continue = true
                } else {
                    Continue = false
                    me.LogAppliError("Token non valide", "Server", "Server")
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                Continue = true
            }
            // si on a valider la securité
            if (Continue) {
                switch (req.body.FctName) {
                    case "GetAllUser":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.GetAllUsers.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "GetUserData":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.GetUserData.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "UpdateUser":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.UpdateUser.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "DeleteUser":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.DeleteUser.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "GetUserDataStructure":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.GetUserDataStructure.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "NewUser":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.NewUser.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "GetLog":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.GetLog.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "CleanLog":
                        //Api Admin
                        me.ApiAdminCheckUser(me._ApiAdmin.CleanLog.bind(me), DecryptTokenReponse, req, res, User, UserId)
                        break
                    case "Backup":
                        //Api Admin
                        if (DecryptTokenReponse != null) {
                            me._ApiAdmin.Backup(req.body.FctData, res, me.GetJobSchedule.bind(me), me.SetJobSchedule.bind(me), User, UserId)
                        } else {
                            me.LogAppliError("No personal data for application not secured", User, UserId)
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    case "GetMyData":
                        if (DecryptTokenReponse != null) {
                            me._ApiAdmin.GetMyData("App", res, User, UserId)
                        } else {
                            me.LogAppliError("No personal data for application not secured", User, UserId)
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    case "UpdateMyUser":
                        if (DecryptTokenReponse != null) {
                            let DataCall = new Object()
                            DataCall.UsesrId = DecryptTokenReponse.TokenData.data.UserData._id
                            if (DecryptTokenReponse.TokenData.data.UserData.Admin){
                                DataCall.UserType = "Admin"
                            } else {
                                DataCall.UserType = ""
                            }
                            DataCall.Data = req.body.FctData
                            me._ApiAdmin.UpdateUser(DataCall, res, User, UserId)
                        } else {
                            me.LogAppliError("No personal data for application not secured", User, UserId)
                            res.json({Error: true, ErrorMsg:"No personal data for application not secured"})
                        }
                        break
                    default:
                        let FctNotFound = true
                        me._ApiFctList.forEach(element => {
                            if (element.FctName == req.body.FctName){
                                if(element.Admin){
                                    me.ApiAdminCheckUser(element.Fct.bind(me), DecryptTokenReponse, req, res, User, UserId)
                                } else {
                                    element.Fct(req.body.FctData, res, User, UserId)
                                }
                                FctNotFound = false
                            }
                        })
                        if (FctNotFound){
                            me.LogAppliError("No API for FctName: " + req.body.FctName, User, UserId)
                            res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                        }
                        break
                }
            }
        })
        // Creation d'un route pour l'icone
        this._Express.get('/apple-icon.png', function (req, res) {
            me.LogDebug("Get apple-icon.png: " + me._Icon)
            let IconFile = me.GetIconFile(me._Icon)
            if (IconFile!=null){
                res.send(IconFile)
            } else {
                me.LogAppliError('Icon not found', "Server", "Server")
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
                me.LogAppliError('Icon not found', "Server", "Server")
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
                me.LogAppliError('Icon not found', "Server", "Server")
                res.status(404).send("Sorry, the route Icon not found");
            }
        })
        // Creation de la route 404
        this._Express.use(function(req, res, next) {
            me.LogAppliError('Mauvaise route: ' + req.originalUrl, "Server", "Server")
            res.status(404).send("Sorry, the route " + req.originalUrl +" doesn't exist");
        })
        // Si on utilise Socket IO, alors on effectue une initialisation de socket io
        if(this._Usesocketio){
            this.LogAppliInfo("SocketIo is used", "Server", "Server")
            // Creation de socket io
            this._io= require('socket.io')(this._http, {pingTimeout: 60000})

            // Identification du user
            let User = "Anonyme"
            let UserId = "Anonyme"
            
            // Middleware sur socket io qui analyse la validité du Token genere via le login
            this._io.use(function(socket, next){
                if (me._AppIsSecured) {
                	if (socket.handshake.query && socket.handshake.query.token){
                        if (socket.handshake.query.token != "null"){
                            let DecryptTokenReponse = me.DecryptDataToken(socket.handshake.query.token)
                            if(DecryptTokenReponse.TokenValide){ // le token est valide
                                let MongoObjectId = require('./Mongo.js').MongoObjectId
                                const Query = {'_id': new MongoObjectId(DecryptTokenReponse.TokenData.data.UserData._id)}
                                me._Mongo.CountPromise(Query, me._MongoVar.UserCollection).then((reponse)=>{
                                    if (reponse==1) {
                                        User = DecryptTokenReponse.TokenData.data.UserData.User
                                        UserId = DecryptTokenReponse.TokenData.data.UserData._id
                                        me.LogAppliInfo("Token valide in soketIo connection", User, UserId)
                                        next()
                                    } else {
                                        me.LogAppliError("SocketIO Token non valide. Nombre d'Id trouvéen DB: " + reponse, "Server", "Server")
                                        let err  = new Error('Token error')
                                        err.data = { type : 'Token error, nombre Id trouvéen DB different de 1' }
                                        next(err)
                                    }
                                },(erreur)=>{
                                    me.LogAppliError("SocketIO Token non valide => DB error : " + erreur, "Server", "Server")
                                    let err  = new Error('Token error')
                                    err.data = { type : 'Token error, DB error' }
                                    next(err)
                                })
                            } else { // Le token n'est pas valide
                                me.LogAppliError("SocketIO Token non valide", "Server", "Server")
                                let err  = new Error('Token error')
                                err.data = { type : 'Token ne correspons pas' }
                                next(err)
                            }
                        } else {
                            me.LogAppliError("Token est null", "Server", "Server")
                            let err  = new Error('Token error')
                            err.data = { type : 'Token est null' }
                            next(err)
                        }
                	} else {
                		me.LogAppliError("Token non disponible", "Server", "Server")
                		let err  = new Error('Token error')
                		err.data = { type : 'Token non disponible' }
                		next(err)
                	} 
                } else {
                    next()
                }
            })
            
            this._io.on('connection', function(socket){	
               // Count user connected
               me._SocketIoClients ++
               me.LogDebug(`user connected, nb user : ${me._SocketIoClients}`)
               // Le socket rejoint la room securisee
               socket.join(me._RoomName)

               // Reception du message client de déconnection
               socket.on('disconnect', () => {
                   // Count User Connected
                   me._SocketIoClients --
                   me.LogDebug(`user disconnected, nb user: ${me._SocketIoClients}`)
               })
               // Reception du message client
               socket.on('api', (Data) => {
                let FctNotFound = true
                me._SocketIoFctList.forEach(element => {
                    if (element.ModuleName == Data.ModuleName){
                        element.Fct(Data.Data, socket, User, UserId)
                        FctNotFound = false
                    }
                })
                if (FctNotFound){
                    me.LogAppliError("No SocketIo Action defined for action: " + Data.ModuleName, User, UserId)
                }
            })
            })
        }
        // Gestion des erreur
        this._http.on('error', function(error){
            if (error.syscall !== 'listen') {
                throw error;
            }
            if (error.code == "EADDRINUSE"){
                console.error(this.GetDateString(new Date()) + ' Port is already in use')
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
    LogAppliInfo(Valeur= "undefined", User= "undefined", UserId= "undefined"){
        var now = new Date()
        const DataToDb = { [this._MongoVar.LogAppliNow]: now, [this._MongoVar.LogAppliType]: "Info", [this._MongoVar.LogAppliValeur]: Valeur, [this._MongoVar.LogAppliUser]: User, [this._MongoVar.LogAppliUserId]: UserId}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.LogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " Info " + User + " " + Valeur)
        },(erreur)=>{
            this.LogDebug("LogAppliInfo DB error : " + erreur)
        })
    }
    /** Log applicatif de type error dans la DB */
    LogAppliError(Valeur= "undefined", User= "undefined", UserId= "undefined"){
        var now = new Date()
        const DataToDb = { [this._MongoVar.LogAppliNow]: now, [this._MongoVar.LogAppliType]: "Error", [this._MongoVar.LogAppliValeur]: Valeur, [this._MongoVar.LogAppliUser]: User, [this._MongoVar.LogAppliUserId]: UserId}
        this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.LogAppliCollection).then((reponse)=>{
            this.LogDebug(this.GetDateString(now) + " Error " + User + " " + Valeur)
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
        // Vérifier si la collection User existe. Si elle n'existe pas alors creation de la collection et du user
        let ErrorCallback = (err)=>{
            throw new Error('Erreur lors du check de la collection Login de la db: ' + err)
        }
        let DoneCallbackUserCollection = (Data) => {
            if(Data){
                this.LogAppliInfo("La collection suivante existe : " + this._MongoVar.UserCollection, "Server", "Server")
            } else {
                const DataToDb = { [this._MongoVar.LoginUserItem]: "Admin", [this._MongoVar.LoginFirstNameItem]: "Admin First Name", [this._MongoVar.LoginLastNameItem]: "Admin Last Name", [this._MongoVar.LoginPassItem]: "Admin", [this._MongoVar.LoginConfirmPassItem]: "Admin", [this._MongoVar.LoginAdminItem]: true}
                this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.UserCollection).then((reponse)=>{
                    this.LogAppliInfo("Creation de la collection : " + this._MongoVar.UserCollection, "Server", "Server")
                },(erreur)=>{
                    this.LogAppliError("Insert temp user admin in collection Login Admin", "Server", "Server")
                    throw new Error('Erreur lors de la creation du User Admin de la collection Admin de la db: ' + erreur)
                })
            }
        }
        let DoneCallbackConfigCollection = (Data) => {
            if(Data){
                this.LogAppliInfo("La collection suivante existe : " + this._MongoVar.ConfigCollection, "Server", "Server")
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
                    this.LogAppliInfo("Creation de la collection : " + this._MongoVar.ConfigCollection, "Server", "Server")
                },(erreur)=>{
                    this.LogAppliError("Error Insert JobSchedule config in collection Config", "Server", "Server")
                    throw new Error('Erreur lors de la creation de la config JobSchedule dans la collection Config de la db: ' + erreur)
                })
            }
        }
        this._Mongo.CollectionExist(this._MongoVar.UserCollection, DoneCallbackUserCollection, ErrorCallback)

        // Vérifier si la collection Config existe. Si elle n'existe pas alors creation de la collection
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
                            this.LogAppliInfo("Start JobScheduleBackup", "Server", "Server")
                            var schedule = require('node-schedule')
                            let options = {minute: BackupScheduler.JobScheduleMinute, hour: BackupScheduler.JobScheduleHour}
                            var me = this
                            this._JobSchedule = schedule.scheduleJob(options, function(){
                                let DbBackup = require('./DbBackup').DbBackup
                                let MyDbBackup = new DbBackup(me._MongoVar.DbName,credentials,folder, me.LogAppliInfo.bind(me))
                                MyDbBackup.Backup().then((reponse)=>{
                                    me.LogAppliInfo(reponse, "Server", "Server")
                                },(erreur)=>{
                                    me.LogAppliError("StartJobScheduleBackup error : " + erreur, "Server", "Server")
                                    console.log("Error during StartJobScheduleBackup: "+ erreur + " " + now)
                                })
                            })
                        } else {
                            this.LogAppliError("StartJobScheduleBackup Google key or Google folder is empty", "Server", "Server")
                        }
                    },(erreur)=>{
                        this.LogAppliError("StartJobScheduleBackup, get Google key error : " + erreur, "Server", "Server")
                    })
                } else {
                    this.LogAppliError("JobScheduler already exist", "Server", "Server")
                }
            } else {
                this.LogAppliInfo("JobScheduleBackup not started", "Server", "Server")
            }
        },(erreur)=>{
            this.LogAppliError("StartJobScheduleBackup: " + erreur, "Server", "Server")
        })
    }
    /**
     * Execute une fonction si le user est Admin
     * @param {Function} Fct Fonction a appeler si le user est admin
     * @param {Object} DecryptTokenReponse Token décripté
     * @param {req} req req
     * @param {res} res res
     * @param {string} User User
     * @param {string} UserId UserID
     */
    ApiAdminCheckUser(Fct, DecryptTokenReponse, req, res, User, UserId){
        if(this._AppIsSecured){
            if (DecryptTokenReponse.TokenData.data.UserData.Admin){
                Fct(req.body.FctData, res, User, UserId)
            } else {
                this.LogAppliError("User not Admin and call API Admin: " + req.body.FctName, User, UserId)
                res.json({Error: true, ErrorMsg:"User not admin"})
            }
        } else {
            if (req.body.Token != "Anonyme"){
                let DecryptToken = this.DecryptDataToken(req.body.Token)
                if (DecryptToken.TokenValide){
                    if (DecryptTokenReponse.TokenData.data.UserData.Admin){
                        let MyUser = DecryptToken.TokenData.data.UserData.User
                        let MyUserId = DecryptToken.TokenData.data.UserData._id
                        Fct(req.body.FctData, res, MyUser, MyUserId)
                    } else {
                        this.LogAppliError("User not Admin and call API Admin: " + req.body.FctName, User, UserId)
                        res.json({Error: true, ErrorMsg:"User not admin"})
                    }
                } else {
                    this.LogAppliError("Token non valide and call API Admin: " + req.body.FctName, User, UserId)
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                this.LogAppliError("User Anonyme call API Admin: " + req.body.FctName, User, UserId)
                res.json({Error: true, ErrorMsg:"User not admin"})  
            }
        }
    }
    /** Ajout d'un fonction a gerer via l'API user */
    AddApiFct(FctName, Fct, Admin=false){
        let apiobject = new Object()
        apiobject.FctName = FctName
        apiobject.Fct = Fct
        apiobject.Admin = Admin
        this._ApiFctList.push(apiobject)
    }
    /** Ajout d'un fonction a gerer via SocketIo */
    AddSocketIoFct(ModuleName, Fct){
        let apiobject = new Object()
        apiobject.ModuleName = ModuleName
        apiobject.Fct = Fct
        this._SocketIoFctList.push(apiobject)
    }
    /* Generation du fichier HTML de base */
	GetInitialHTML(AppIsSecured){
        let fs = require('fs')
        let os = require('os')

        //{TexteNomrale:"1.5vw", TexteIphone:"3vw", TexteMax:"18px",TitreNormale:"4vw", TitreIphone:"7vw", TitreMax:"50px"}
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
                
                --CoreX-font-size : 1.5vw;
                --TexteNomrale : `+ this._CSS.FontSize.TexteNomrale +`;

                --CoreX-Iphone-font-size :3vw;
                --TexteIphone : `+ this._CSS.FontSize.TexteIphone +`;

                --CoreX-Max-font-size : 18px;
                --TexteMax : `+ this._CSS.FontSize.TexteMax +`;

                --CoreX-Titrefont-size : 4vw;
                --TitreNormale : `+ this._CSS.FontSize.TitreNormale +`;

                --CoreX-TitreIphone-font-size : 7vw;
                --TitreIphone : `+ this._CSS.FontSize.TitreIphone +`;
                
                --CoreX-TitreMax-font-size : 50px;
                --TitreMax : `+ this._CSS.FontSize.TitreMax +`;
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
            .CoreXAppContent{
                padding: 1px;
                margin: 20px auto 10px auto;
                width: `+ this._CSS.AppContent.WidthNormale +`;
                margin-left: auto;
                margin-right: auto;
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                .CoreXAppContent{width: `+ this._CSS.AppContent.WidthIphone +`;}
            }
            @media screen and (min-width: 1200px)
            {
                .CoreXAppContent{width: `+ this._CSS.AppContent.WidthMax +`;}
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
            let apiurl = "api"
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
            let OptionCoreXLoader = {Color: "`+ this._CSS.Color.Normale +`", AppIsSecured: "`+ AppIsSecured +`"}
            var MyCoreXLoader = new CoreXLoader(OptionCoreXLoader)
            function GlobalLogout(){MyCoreXLoader.LogOut()}
            function GlobalGetToken(){return MyCoreXLoader.GetTokenLogin()}
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
    VerifyLogin(res, Site, Login, Pass){
        if ((Site == "App") || (Site == "Admin")) {
            const Query = { [this._MongoVar.LoginUserItem]: Login}
            const Projection = { projection:{ _id: 1, [this._MongoVar.LoginPassItem]: 1, [this._MongoVar.LoginUserItem]: 1, [this._MongoVar.LoginAdminItem]: 1}}
            this._Mongo.FindPromise(Query,Projection, this._MongoVar.UserCollection).then((reponse)=>{
                if(reponse.length == 0){
                    this.LogAppliError("Login non valide, pas de row en db pour ce user", "Server", "Server")
                    res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
                } else if (reponse.length == 1){
                    if (reponse[0][this._MongoVar.LoginPassItem] == Pass){
                        if (Site == "Admin"){
                            if (reponse[0][this._MongoVar.LoginAdminItem] == true){
                                this.LogAppliInfo("Login valide for site:" + Site, "Server", "Server")
                                delete reponse[0][this._MongoVar.LoginPassItem]
                                let MyToken = new Object()
                                MyToken.UserData = reponse[0]
                                res.json({Error: false, ErrorMsg:"", Token: this.EncryptDataToken(MyToken)})
                            } else {
                                this.LogAppliError("Login non valide, User not Admin for site Admin", "Server", "Server")
                                res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
                            }
                        } else {
                            this.LogAppliInfo("Login valide for site:" + Site, "Server", "Server")
                            delete reponse[0][this._MongoVar.LoginPassItem]
                            let MyToken = new Object()
                            MyToken.UserData = reponse[0]
                            res.json({Error: false, ErrorMsg:"", Token: this.EncryptDataToken(MyToken)})
                        }
                    } else {
                        this.LogAppliError("Login non valide, le Pass est different du password en db", "Server", "Server")
                        res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
                    }
                } else {
                    this.LogAppliError("Login non valide, trop de row en db pour ce user", "Server", "Server")
                    res.json({Error: true, ErrorMsg:"DB Error", Token: ""})
                }
            },(erreur)=>{
                this.LogAppliError("Login non valide, erreur dans le call à la db : " + erreur, "Server", "Server")
                res.json({Error: true, ErrorMsg:"DB Error", Token: ""})
            })
        } else {
            this.LogAppliError("Site not know: " + Site, "Server", "Server")
            res.json({Error: true, ErrorMsg:"Site not know: " + Site, Token: ""})
        }
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
                this.LogAppliError("jsonwebtoken non valide", "Server", "Server")
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
            this.LogAppliError("cryptr non valide", "Server", "Server")
        }
        return reponse
    }
    /* Check la validation du UserId contenu dans un Token et envoie de l'app */
    CheckTokenUserIdAndSendApp(Site, Id, res){
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        const Query = {'_id': new MongoObjectId(Id)}
        this._Mongo.CountPromise(Query, this._MongoVar.UserCollection).then((reponse)=>{
            if (reponse==1) {
                // Get Name of user in DB
                let Projection = { projection:{[this._MongoVar.LoginUserItem]: 1, [this._MongoVar.LoginAdminItem]: 1}}
                this._Mongo.FindPromise(Query, Projection, this._MongoVar.UserCollection).then((reponse)=>{
                    if(Site== "Admin"){
                        if (reponse[0].Admin){
                            this.LogAppliInfo("TokenUserId validé user:" + reponse[0].User, "Server", "Server")
                            let MyApp = this.GetAppCode(Site, reponse[0].User, Id)
                            res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS: MyApp.CSS})
                        } else {
                            this.LogAppliError("TokenUserId non validé. User not Admin for site Admin", "Server", "Server")
                            res.json({Error: true, ErrorMsg:"Token non valide"})
                        }
                    } else {
                        this.LogAppliInfo("TokenUserId validé user:" + reponse[0].User, "Server", "Server")
                        let MyApp = this.GetAppCode(Site, reponse[0].User, Id)
                        res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS: MyApp.CSS})
                    }
                },(erreur)=>{
                    this.LogAppliError("CheckTokenUserIdAndSendApp DB error : " + erreur, "Server", "Server")
                    res.json({Error: true, ErrorMsg:"Token non valide : DB error"})
                })
            } else {
                this.LogAppliError("TokenUserId non validé. Nombre d'Id trouvéen DB: " + reponse, "Server", "Server")
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        },(erreur)=>{
            this.LogAppliError("TokenUserId validation => DB error : " + erreur, "Server", "Server")
            res.json({Error: true, ErrorMsg:"Token non valide"})
        })
    }
    /* Recuperer le code de l'App */
    GetAppCode(Site, User="null", UserId="null"){
        let MyApp = new Object()
        MyApp.JS = ""
        MyApp.CSS = ""

        let fs = require('fs')
        let os = require('os')

        // Ajout des modules de CoreX
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Modules.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Module_CoreXBuild.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Module_CoreXApp.js", 'utf8') + os.EOL
        MyApp.JS += fs.readFileSync(__dirname + "/Client_CoreX_Module_SocketIo.js", 'utf8') + os.EOL
        MyApp.JS += `
            // Creation de l'application
            let MyApp = new CoreXApp(`+this._AppIsSecured+`,`+ this._Usesocketio +`)
            // Fonction globale GlobalClearActionList
            function GlobalClearActionList() {
                MyApp.ClearActionList()
            }
            // Fonction gloable AddActionInList
            function GlobalAddActionInList(Titre, Action) {
                MyApp.AddActionInList(Titre, Action)
            }
            // Fonction globale GetSocketIo
            function GlobalGetSocketIo(){
                return MyApp.SocketIo
            }
            // Fonction globale Send SocketIO
            function GlobalSendSocketIo(ModuleName, Action, Value){
                let SocketIo = GlobalGetSocketIo()
                SocketIo.emit('api', {ModuleName: ModuleName, Data: {Action: Action, Value: Value}})
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
            // Fonction globale GlobalDisplayAction
            function GlobalDisplayAction(Type){
                MyApp.SetDisplayAction(Type)
            }
            `
        switch (Site) {
            case "Admin":
                this.LogAppliInfo("Start loading App Admin", User, UserId)
                MyApp = this.LoadAppFilesFromAdminFolder(MyApp)
                break
            default:
                this.LogAppliInfo("Start loading App", User, UserId)
                MyApp = this.LoadAppFilesFromClientFolder(MyApp)
                break
        }
        MyApp.JS += " MyApp.Start()"

        return MyApp
    }

    /**
     * Analyse du contenu d'un folder et ajout des fichier CSS et JS existant dans l'objet MyApp
     * @param {String} FolderName Chemin du folder contenant du code CSS ou JS
     * @param {Object} MyApp Object contenant le contenu des fichier CSS et JS
     */
    LoadAppFilesFromFolder(FolderName, MyApp){
        let fs = require('fs')
        let path = require('path')
        let os = require('os')
        if(FolderName != null){
            let folder = FolderName
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
                                this.LogAppliError("file extension not know: " + path.extname(files[i]), "Server", "Server")
                                break;
                        }
                    } else {
                        MyApp.JS += 'alert("file not found: ' + folder + "/" + files[i] + '")' + os.EOL 
                        this.LogAppliError("file not found: " + folder + "/" + files[i], "Server", "Server")
                    }
                }
            } else {
                MyApp.JS += 'alert("Client folder not found: ' + folder + '")' + os.EOL 
                this.LogAppliError("Client folder not found: " + folder), "Server", "Server"
            }
        } else {
            MyApp.JS += 'alert("Folder not defined :" + ' + FolderName + ')' + os.EOL 
            this.LogAppliError("Client folder not defined :" + FolderName, "Server", "Server")
        }
        return MyApp
    }

    /**
     * On va chercher le contenu des fichier du repertoire client
     * @param {object} MyApp Objet contenant le code js et css
     */
    LoadAppFilesFromClientFolder(MyApp){
        // Load du folder client
        MyApp = this.LoadAppFilesFromFolder(this._ClientAppFolder, MyApp)
        // Load du folder common
        if (this._CommonAppFolder != null){
            MyApp = this.LoadAppFilesFromFolder(this._CommonAppFolder, MyApp)
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
        // Load du folder Admin
        if(this._AdminAppFolder != null){
            MyApp = this.LoadAppFilesFromFolder(this._AdminAppFolder, MyApp)
        } else {
            this.LogAppliError("Admin folder not defined (=null)", "Server", "Server")
        }
        // Load du folder common
        if (this._CommonAppFolder != null){
            MyApp = this.LoadAppFilesFromFolder(this._CommonAppFolder, MyApp)
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
                this.LogAppliError("GetDbConfig error : " + erreur, "Server", "Server")
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