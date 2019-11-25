class CoreXLoader {
    constructor({Usesocketio=false, Color = "rgb(20, 163, 255)"} = {}){
        // Variable externe indispensable de la class
        this._Usesocketio = Usesocketio
        this._LoginToken = null
        this._Color = Color

        // Variable externe secondaire
        this._Site = null

        // Variable interne de la class
        this._DbKeyLogin = ""

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
    }
    
    /* Fonction lancee au debut du chargement de la page */
    Start(){
        // Set du nom de la key DB qui contiendra le token du site
        this._DbKeyLogin = "CoreXLoginToken" + this._Site
        this._LoginToken = this.GetTokenLogin() 
        if(this._LoginToken != null){
            console.log("Token exist")
            this.LoadApp()
        } else {
            const OptionCoreXLogin = {Site:this._Site, CallBackLogedIn:this.LoginDone.bind(this), Color: this._Color}
            let MyLogin = new CoreXLogin(OptionCoreXLogin) // afficher le UI de login
            MyLogin.Render()
        }
    }

    /* Recuperer le token login de la BD du browser */
    GetTokenLogin(){
        let Token = localStorage.getItem(this._DbKeyLogin) // Recuperer le token de la DB du browser
        return Token
    }

    /* Enregistrement du token login */
    LoginDone(Token){
        this._LoginToken = Token // Enregistrer le token dans la class
        localStorage.setItem(this._DbKeyLogin, this._LoginToken) // Enregistrer le token en BD du browser
        this.Start()
    }

    /* Logout de l'application */
    LogOut(){
        this._LoginToken = null
        localStorage.removeItem(this._DbKeyLogin)
        if (this._Usesocketio){this._SocketIo.disconnect()}
        // Effacer l'anienne application
        if (document.getElementById("CodeJs")) {
            var CodeJs = document.getElementById("CodeJs")
            CodeJs.parentNode.removeChild(CodeJs)
        }
        // Effacer l'anienne application
        if (document.getElementById("CodeCSS")) {
            var CodeCSS = document.getElementById("CodeCSS")
            CodeCSS.parentNode.removeChild(CodeCSS)
        }
        location.reload()
    }

    /* Start loading application */
    LoadApp(){
        // afficher le message de loading
        let LoadingText = /*html*/`
            <style>
                .Loadingtext{
                    font-size: var(--CoreX-font-size);
                }
                .LoadingError{
                    color: red;
                    font-size: var(--CoreX-font-size);
                }
                @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
                only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
                screen and (max-width: 700px)
                {
                    .Loadingtext{font-size: var(--CoreX-Iphone-font-size);}
                    .LoadingError{font-size: var(--CoreX-Iphone-font-size);}
                }
                @media screen and (min-width: 1200px)
                {
                    .Loadingtext{font-size: var(--CoreX-Max-font-size);}
                    .LoadingError{font-size: var(--CoreX-Max-font-size);}
                }
            </style>
            <div style="display: flex; flex-direction: column; justify-content:space-between; align-content:center; align-items: center;">
                <div style="margin: 1%;" class="Loadingtext">Loading App...</div>
                <div id="LoadingErrorMsg" class="LoadingError"></div>
            </div>`
        document.body.innerHTML = LoadingText
        // appeler le serveur
        console.log("Start loading App")
        let me = this
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let reponse = JSON.parse(this.responseText)
                if (reponse.Error) {
                    console.log('Loading App Error : ' + reponse.ErrorMsg)
                    document.getElementById("LoadingErrorMsg").innerHTML=reponse.ErrorMsg
                    me._LoginToken = null
                    localStorage.removeItem(me._DbKeyLogin)
                } else {
                    console.log('App Loaded')
                    // effacer le contenu du body
                    document.body.innerHTML = ""
                    // Load de l'application CSS
                    var CSS = document.createElement('style')
                    CSS.type = 'text/css'
                    CSS.id = 'CodeCSS'
                    CSS.innerHTML = reponse.CodeAppCSS
                    document.getElementsByTagName('head')[0].appendChild(CSS)
                    // Load de l'application JS
                    var JS = document.createElement('script')
                    JS.type = 'text/javascript'
                    JS.id = 'CodeJs'
                    JS.innerHTML = reponse.CodeAppJS
                    document.getElementsByTagName('head')[0].appendChild(JS)
                }
            } else if (this.readyState == 4 && this.status != 200) {
                document.getElementById("LoadingErrorMsg").innerHTML = this.response;
            }
        } 
        xhttp.open("POST", "loadApp", true)
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhttp.send(JSON.stringify({Site:me._Site, Token:me.GetTokenLogin()})) 
         
    }
}