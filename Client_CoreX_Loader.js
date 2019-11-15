class CoreXLoader {
    constructor({Usesocketio=false, Color = "rgb(20, 163, 255)"} = {}){
        // Variable externe indispensable de la class
        this._Usesocketio = Usesocketio
        this._LoginToken = null
        this._Color = Color

        // Variable externe secondaire
        this._Site = null

        // Variable interne de la class
        this._DBTokenName = "CoreXLoginToken"

        // Variable SocketIO
        if (this._Usesocketio){
            this._SocketIo = io({autoConnect: false, reconnection: true, reconnectionAttempts: 10, reconnectionDelay: 100, reconnectionDelayMax: 1000})
            this.InitSocketIoMessage()
            // pour ouvir le socket il faut executer les deux commandes ci-dessous
            //this._SocketIo.io.opts.query = {token: this._LoginToken}
            //this._SocketIo.open()
        }
    }
    set Site(val){
        this._Site = val
    }

    /* Init des messages socket io */
    InitSocketIoMessage(){
        // Init des messages error socket io
        this._SocketIo.on('error', function(err) {
            var today = new Date()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            console.log(time + ' SocketIo.on error, err: ' + err.type)
            document.body.innerHTML = /*html*/`
                <div style='font-size: 2vw; color: red; text-align: center; margin-top: 10%;'>` + err.type + /*html*/`</div>
                `
        })
        
        // Init des messages connect socket io
        this._SocketIo.on('connect', () => {
            var today = new Date()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            console.log(time + ' SocketIo.on connect')
        })
        
        // Init des messages disconnect socket io
        this._SocketIo.on('disconnect', (reason) => {
            var today = new Date()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            console.log(time + ' SocketIo.on disconnect, reason : ' + reason)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect', (attemptNumber) => {
            console.log('SocketIo.on reconnect, attemptNumber: ' + attemptNumber)
        })
        
        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_attempt', (attemptNumber) => {
            //console.log('SocketIo.on reconnect_attempt, attemptNumber: ' + attemptNumber)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnecting', (attemptNumber) => {
            //console.log('SocketIo.on reconnecting, attemptNumber: ' + attemptNumber)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_error', (error) => {
            var today = new Date()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            console.log(time + ' SocketIo.on reconnect_error, error: ' + error)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_failed', () => {
            var today = new Date()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
            console.log(time + ' SocketIo.on reconnect_failed')
            document.body.innerHTML = `
                <div style='font-size: 3vw; color: red; text-align: center; margin-top: 10%;'>User disconnected</div>
                <div style='margin-top: 5%; display: flex; justify-content: center;'><button style='width: 30%; font-size: 3vw; cursor: pointer; border: 1px solid rgb(44,1,21); border-radius: 20px; text-align: center; box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7); background: white; outline: none;' onclick="location.reload();">Reload</button></div>
                `
        })

        // Init des messages LoadingApp socket io
        this._SocketIo.on('LoadingApp', (data) =>{
           // if (document.scripts.namedItem("CodeJs") == null){
           //     console.log('SocketIo.on LoadingApp : load the app')
           //     // effacer le contenu du body
           //     document.body.innerHTML = ""
           //     // Load de l'application
           //     var JS = document.createElement('script')
           //     JS.type = 'text/javascript'
           //     JS.id = 'CodeJs'
           //     JS.innerHTML = data
           //     document.getElementsByTagName('head')[0].appendChild(JS)
           // } else {
           //     console.log('SocketIo.on LoadingApp : app already loaded')
           // }
        })
    }
    
    /* Fonction lancee au debut du chargement de la page */
    Start(){
        this._LoginToken = this.GetTokenLogin() 
        if(this._LoginToken != null){
            console.log("Token exist. Start loading App process with token")
            console.log("TokenLogin= " + this._LoginToken)
        } else {
            const OptionCoreXLogin = {Site:this._Site, CallBackLogedIn:this.LoginDone.bind(this), Color: this._Color}
            let MyLogin = new CoreXLogin(OptionCoreXLogin) // afficher le UI de login
            MyLogin.Render()
        }
    }

    /* Recuperer le token login de la BD du browser */
    GetTokenLogin(){
        let Token = localStorage.getItem(this._DBTokenName) // Recuperer le token de la DB du browser
        return Token
    }

    /* Enregistrement du token login */
    LoginDone(Token){
        this._LoginToken = Token // Enregistrer le token dans la class
        localStorage.setItem(this._DBTokenName, this._LoginToken) // Enregistrer le token en BD du browser
        this.Start()
    }

    /* Logout de l'application */
    LogOut(){
        this._LoginToken = null
        localStorage.removeItem(this._DBTokenName)
        if (this._Usesocketio){this._SocketIo.disconnect()}
        // Effacer l'anienne application
        if (document.getElementById("CodeJs")) {
            var CodeJs = document.getElementById("CodeJs")
            CodeJs.parentNode.removeChild(CodeJs)
        }
        location.reload()
    }
}