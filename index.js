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
                res.send("app not secured")
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
            res.status(404).send("Sorry, that route doesn't exist");
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

    /* Generation du fichier HTML de base de l'application cliente */
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
        
        let HTML1 = `
        <script>`
        let CoreXLoaderJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Loader.js", 'utf8')
        let CoreXLoginJsScript = fs.readFileSync(__dirname + "/Client_CoreX_Login.js", 'utf8')
        
        let HTML2 = `
        </script>`
            
        let LoadScript = ` 
        <script>
            let OptionCoreXLoader = {Usesocketio: ` + this._Usesocketio + `, Color: "` + this._CSS.Color.Normale + `"}
            let MyCoreXLoader = new CoreXLoader(OptionCoreXLoader)
            function GlobalLogout(){MyCoreXLoader.LogOut()}
            function GlobalGetCss(){return ` + JSON.stringify(this._CSS) + `}
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
        return HTMLStart + SocketIO + HTML1 + CoreXLoaderJsScript + os.EOL + CoreXLoginJsScript + os.EOL + HTML2 + LoadScript + HTMLEnd
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
                    res.json({Error: false, ErrorMsg:"", Token: this.EncryptDataToken(reponse[0])})
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
        let reponse = null
        let tokenJwt = this.Decrypt(token)
        let jwt = require('jsonwebtoken')
        try {
            reponse = jwt.verify(tokenJwt, this._Secret)
        } catch(err) {
            this.Log(err)
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
        const Cryptr = require('cryptr')
        const cryptr = new Cryptr(this._Secret)
        const decryptedString = cryptr.decrypt(text)
        return decryptedString
    }
}
module.exports.corex = corex
module.exports.Mongo = require('./Mongo.js').Mongo