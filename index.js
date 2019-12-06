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

        // Varaible interne MongoDB
        this._MongoLoginClientCollection = "LoginClient"
        this._MongoLoginAdminCollection = "LoginAdmin"
        this._MongoLoginUserItem = "user"
        this._MongoLoginPassItem = "password"

        // Variable Interne SocketIO
        this._RoomName = "Secured";
        this._io=null;
        this._NumClientConnected = 0

        // Variable Interne Express
        this._Express = require('express')()
        this._http = require('http').Server(this._Express)
    }
    set Debug(val){
        this._Debug = val
    }
    set AppIsSecured(val){
        this._AppIsSecured = val
    }
    set CSS(val){
        this._CSS = val
    }
    set Usesocketio(val){
        this._Usesocketio = val
    }
    set IconRelPath(val){
        var appRoot = process.cwd()
        this._Icon = appRoot + val
    }
    set ClientAppFolder(val){
        this._ClientAppFolderRoot = process.cwd()
        this._ClientAppFolder = val
    }

    /* Start du Serveur de l'application */
    Start(){
        // Initialisation de variable et require
        var fs = require('fs')
        var me = this

        // Message de demarrage
        console.log("Application started")

        // Initiation de la DB
        this.InitMongoDb()

        // utilistaion de body-parser
		var bodyParser = require("body-parser")
		this._Express.use(bodyParser.urlencoded({ extended: true }))
        this._Express.use(bodyParser.json())

        // Creation d'une route de base pour l'application
		this._Express.get('/', function(req, res, next){
            if (me._AppIsSecured) {
                res.send(me.GetInitialSecuredHTML("app"))
            } else {
                // Envoyer l'App
                res.send(me.GetInitialHTML())
            }
        })

        // Creation d'une route vers l'application admin
		this._Express.get('/admin', function(req, res, next){
            res.send(me.GetInitialSecuredHTML("admin"))
        })

        // Creation d'un route pour le login via Post
		this._Express.post('/login', function (req, res){
            me.Log("Receive Post Login: " + JSON.stringify(req.body))

            // analyse du login en fonction du site
            switch (req.body.Site) {
                case "app":
                    me.VerifyLogin(res, me._MongoLoginClientCollection, req.body.Login,req.body.Pass)
                    break
                case "admin":
                    me.VerifyLogin(res, me._MongoLoginAdminCollection, req.body.Login,req.body.Pass)
                    break
                default:
                    res.json({Error: true, ErrorMsg:"No login for site: " + req.body.Site, Token: ""})
                    break
            }
        })

        // Creation d'une route pour loader l'application
		this._Express.post('/loadApp', function(req, res, next){
            me.Log("Start loading App")
            // validation du Token
            let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
            if (DecryptTokenReponse.TokenValide) {
                // Analyse de la logincollection en fonction du site
                switch (req.body.Site) {
                    case "app":
                        if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoLoginClientCollection) {
                            let MyApp = me.GetAppCode()
                            res.json({Error: false, ErrorMsg:"", CodeAppJS: MyApp.JS,CodeAppCSS:MyApp.CSS})
                        } else {
                            res.json({Error: true, ErrorMsg:"LoginCollection not correct for site: " + req.body.Site})
                        }
                        break
                    case "admin":
                        if (DecryptTokenReponse.TokenData.data.LoginCollection == me._MongoLoginAdminCollection) {
                            res.json({Error: false, ErrorMsg:"", CodeAppJS: me.GetAdminAppCode(),CodeAppCSS:"", CodeAppIMG:""})
                        } else {
                            res.json({Error: true, ErrorMsg:"LoginCollection not correct for site: " + req.body.Site})
                        }
                        break
                    default:
                        res.json({Error: true, ErrorMsg:"No LoginCollection for site: " + req.body.Site})
                        break
                }
            } else {
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        })

        // Creation d'une route pour API l'application
		this._Express.post('/api', function(req, res, next){
            me.Log("API Call")
            let Continue = false
            // Si l'application est securisee 
            if (me._AppIsSecured){
                // validation du Token
                let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
                if (DecryptTokenReponse.TokenValide){
                    Continue = true
                } else {
                    Continue = false
                    res.json({Error: true, ErrorMsg:"Token non valide"})
                }
            } else {
                Continue = true
            }
            // si on a valider la securité
            if (Continue) {
                // Analyse de la logincollection en fonction du site
                switch (req.body.FctName) {
                    case "test":
                        break
                    default:
                        res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                        break
                }
            }
        })

        // Creation d'une route pour API Admin l'application
		this._Express.post('/apiadmin', function(req, res, next){
            me.Log("API Admin Call, FctName: " + req.body.FctName)
            // validation du Token
            let DecryptTokenReponse = me.DecryptDataToken(req.body.Token)
            if (DecryptTokenReponse.TokenValide) {
                // Analyse de la logincollection en fonction du site
                switch (req.body.FctName) {
                    case "GetAllUser":
                        me.GetAllUsers(req.body.FctData, res)
                        break
                    default:
                        res.json({Error: true, ErrorMsg:"No API Admin for FctName: " + req.body.FctName})
                        break
                }
            } else {
                res.json({Error: true, ErrorMsg:"Token non valide"})
            }
        })

        // Creation d'un route pour l'icone
        this._Express.get('/apple-icon.png', function (req, res) {
            me.Log("me._Icon: " + me._Icon)
            res.send(me._Icon)
        })

        // Creation d'un route pour favicon.ico
        this._Express.get('/favicon.ico', function (req, res) {
            me.Log("me._Icon: " + me._Icon)
            res.send(me._Icon)
        })

        // Creation de la route 404
        this._Express.use(function(req, res, next) {
            console.log('Mauvaise route: ' + req.originalUrl)
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
                //                 me.Log("Token valide")
                //                 next()
                //             } else { // Le token n'est pas valide
                //                 me.Log("Token non valide")
                //                 let err  = new Error('Token error')
                //                 err.data = { type : 'Token ne correspons pas' }
                //                 next(err)
                //             }
                //         } else {
                //             me.Log("Token est null")
                //             let err  = new Error('Token error')
                //             err.data = { type : 'Token est null' }
                //             next(err)
                //         }
                // 	} else {
                // 		me.Log("Token non disponible")
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
            //    // Log du nombre de user
            //    me.Log('user connected, nb user :' + me.UserCount());

            //    // Reception du message client de déconnection
            //    socket.on('disconnect', () => {
            //        // Count User Connected
            //        me._NumClientConnected --
                    // Log du nombre de user
            //        me.Log('user disconnected, nb user: ' + me.UserCount());
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

    /* Log dans la console */
    Log(data){
        if(this._Debug){
            console.log(data)
        }
    }

    /* Initialisation des DB */
    InitMongoDb(){
        // Vérifier si la collection LoginAdmin existe. Si elle n'existe pas alors creation de la collection et du user
        let ErrorCallback = (err)=>{
            throw new Error('Erreur lors du check de la collection Login de la db: ' + err)
        }
        let DoneCallback = (Data) => {
            if(Data){
                this.Log("La collection suivante existe : " + this._MongoLoginAdminCollection)
            } else {
                // creation de la collection
                let ErrorCallbackCreate= (err)=>{
                    this.Log("ErrorCallbackCreate")
                    throw new Error('Erreur lors de la creation du User Admin de la collection Login de la db: ' + err)
                }
                let DoneCallbackCreate = ()=>{this.Log("Creation de la collection : " + this._MongoLoginAdminCollection)}
                const DataToDb = { [this._MongoLoginUserItem]: "Admin", [this._MongoLoginPassItem]: "Admin"}
                let Mongo = require('./Mongo.js').Mongo
                Mongo.InsertOne(DataToDb, this._MongoLoginAdminCollection, this._MongoUrl, this._MongoDbName, DoneCallbackCreate, ErrorCallbackCreate)
            }
        }
        let Mongo = require('./Mongo.js').Mongo
        Mongo.CollectionExist(this._MongoLoginAdminCollection, this._MongoUrl, this._MongoDbName, DoneCallback, ErrorCallback)
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
                height:100%;
            }
        </style>`
        let GlobalCallAPI = `
        function GlobalCallAPI(FctName, FctData, CallBack, ErrCallBack){
            var xhttp = new XMLHttpRequest()
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let reponse = JSON.parse(this.responseText)
                        if (reponse.Error) {
                            console.log('GlobalCallAPI Error : ' + reponse.ErrorMsg)
                            ErrCallBack(reponse.ErrorMsg)
                        } else {
                            CallBack(reponse.Data)
                        }
                    } else if (this.readyState == 4 && this.status != 200){
                        ErrCallBack(this.response)
                    }
                }
                xhttp.open("POST", "api", true)
                xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                xhttp.send(JSON.stringify({FctName:FctName, FctData:FctData}))
        }` 
        let CSS = `
        <style id="CodeCSS">
        ` + MyApp.CSS + `
        </style>`
        let JS = `
        <script id="CodeJS" type="text/javascript">
        ` + GlobalCallAPI +`
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
                height:100%;
            }
        </style>` 

        let SocketIO = ""
        if (this._Usesocketio) { SocketIO = `<script src="/socket.io/socket.io.js"></script>`}
        
        let HTML1 = `<script>`
        let CoreXLoaderJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Loader.js", 'utf8')
        let CoreXLoginJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Login.js", 'utf8')
        
        let apiurl = (Site = "admin") ? "apiadmin" : "api"
        let GlobalCallAPI = `
            function GlobalCallAPI(FctName, FctData, CallBack, ErrCallBack){
                var xhttp = new XMLHttpRequest()
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            let reponse = JSON.parse(this.responseText)
                            if (reponse.Error) {
                                console.log('GlobalCallAPI Error : ' + reponse.ErrorMsg)
                                ErrCallBack(reponse.ErrorMsg)
                            } else {
                                CallBack(reponse.Data)
                            }
                        } else if (this.readyState == 4 && this.status != 200){
                            ErrCallBack(this.response)
                        }
                    }
                    xhttp.open("POST", "`+ apiurl +`", true)
                    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                    xhttp.send(JSON.stringify({Token:MyCoreXLoader.GetTokenLogin(), FctName:FctName, FctData:FctData}))
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
        return HTMLStart + SocketIO + HTML1 + CoreXLoaderJsScript + os.EOL + CoreXLoginJsScript + os.EOL + GlobalCallAPI + os.EOL + HTML2 + LoadScript + HTMLEnd
    }

    /* Verification du login */
    VerifyLogin(res, LoginCollection, Login, Pass){
        let Mongo = require('./Mongo.js').Mongo
        const Query = { [this._MongoLoginUserItem]: Login}
        const Projection = { projection:{ _id: 1, [this._MongoLoginPassItem]: 1}}
        Mongo.FindPromise(Query,Projection, LoginCollection, this._MongoUrl, this._MongoDbName).then((reponse)=>{
            if(reponse.length == 0){
                this.Log("Login non valide, pas de row en db pour ce user")
                res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
            } else if (reponse.length == 1){
                if (reponse[0][this._MongoLoginPassItem] == Pass){
                    this.Log("Login valide")
                    delete reponse[0][this._MongoLoginPassItem]
                    let MyToken = new Object()
                    MyToken.UserData = reponse[0]
                    MyToken.LoginCollection = LoginCollection
                    res.json({Error: false, ErrorMsg:"", Token: this.EncryptDataToken(MyToken)})
                } else {
                    this.Log("Login non valide, le Pass est different du password en db")
                    res.json({Error: true, ErrorMsg:"Login Error", Token: ""})
                }
            } else {
                this.Log("Login non valide, trop de row en db pour ce user")
                res.json({Error: true, ErrorMsg:"DB Error", Token: ""})
            }
        },(erreur)=>{
            this.Log("Login non valide, erreur dans le call à la db : " + erreur)
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
            //let tokenJwt = this.Decrypt(token)
            let jwt = require('jsonwebtoken')
            try {
                reponse.TokenData = jwt.verify(DecryptReponse.decryptedData, this._Secret)
                reponse.TokenValide = true
            } catch(err) {
                this.Log("jsonwebtoken non valide")
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
            this.Log("cryptr non valide")
        }
        return reponse
    }

    /* Recuperer le code de l'App */
    GetAppCode(){
        let MyApp = new Object()
        MyApp.JS = ""
        MyApp.CSS = ""

        let fs = require('fs')
        let path = require('path')
        let os = require('os');

        let folder = this._ClientAppFolderRoot + this._ClientAppFolder
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
                        console.log("file extension not know: " + path.extname(files[i]))
                        break;
                }
            } else {
                console.log("file not found: " + this._ClientAppFolderRoot + files[i])
            }
        }
        return MyApp
    }

    /* Recuperer le code de l'Admin App */
    GetAdminAppCode(){
        let fs = require('fs')
        let os = require('os');
        let reponse = ""
        // Ajout de la classe ClientSecuredApp
        reponse += fs.readFileSync(__dirname + "/Client_CoreX_AdminApp.js", 'utf8')
        reponse += os.EOL
        return reponse
    }

    /* Get list of all user */
    GetAllUsers(type, res){
        let mongocollection =""
        if (type == "Admin") {
            mongocollection = this._MongoLoginAdminCollection
        } else {
            mongocollection = this._MongoLoginClientCollection
        }
        let Mongo = require('./Mongo.js').Mongo
        const Query = {}
        const Projection = { projection:{ _id: 1, [this._MongoLoginUserItem]: 1}}
        const Sort = {[this._MongoLoginUserItem]: 1}
        Mongo.FindSortPromise(Query,Projection, Sort, mongocollection, this._MongoUrl, this._MongoDbName).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No user in BD", Data: null})
            } else {
                res.json({Error: false, ErrorMsg: "User in DB", Data: reponse})
            }
        },(erreur)=>{
            this.Log("GetAllUsers DB error : " + erreur)
            res.json({Error: true, ErrorMsg: "DB Error", Data: ""})
        })
    }
}
module.exports.corex = corex
module.exports.Mongo = require('./Mongo.js').Mongo