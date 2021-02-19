class CoreXLoader {
    constructor({Color = "rgb(20, 163, 255)", AppIsSecured=true, AllowSignUp=false, SplashScreen=null, SplashScreenBackgroundColor=null} = {}){
        // Variable externe indispensable de la class
        this._LoginToken = null
        this._Color = Color
        this._AppIsSecured = AppIsSecured
        this._AllowSignUp = AllowSignUp
        this._SplashScreen = SplashScreen
        this._SplashScreenBackgroundColor = SplashScreenBackgroundColor
        this._SplashDuration = 1500
        this._TicTimeSplashScreen = null
        // Variable externe secondaire
        this._Site = null

        // Variable interne de la class
        this._DbKeyLogin = "CoreXLoginToken"
        this._DBKeyVersion = "CoreXVersion"
        this._DBKeyCodeAppCSS = "CoreXAppCss"
        this._DBKeyCodeAppJS = "CoreXAppJs"
    }
    
    set Site(val){this._Site = val}
    
    /* Fonction lancee au debut du chargement de la page */
    Start(){
        // si non securisee on enregistre un token anonyme
        if(this._AppIsSecured == "false"){localStorage.setItem(this._DbKeyLogin, "Anonyme")}
        // Get Token
        this._LoginToken = this.GetTokenLogin() 
        if(this._LoginToken != null){
            this.LoadApp()
        } else {
            const OptionCoreXLogin = {Site:this._Site, CallBackLogedIn:this.LoginDone.bind(this), Color: this._Color, AllowSignUp: this._AllowSignUp}
            let MyLogin = new CoreXLogin(OptionCoreXLogin) // afficher le UI de login
            MyLogin.Render()
        }
    }

    /* Recuperer le token login de la BD du browser */
    GetTokenLogin(){
        let Token = localStorage.getItem(this._DbKeyLogin) // Recuperer le token de la DB du browser
        return Token
    }

    /* Recuperer la version de la BD du browser */
    GetVersion(){
        return localStorage.getItem(this._DBKeyVersion) // Recuperer la version de la DB du browser
    }

    /* Enregistrement du token login */
    LoginDone(Token){
        this._LoginToken = Token // Enregistrer le token dans la class
        localStorage.setItem(this._DbKeyLogin, this._LoginToken) // Enregistrer le token en BD du browser
        this.Start()
    }

    /* Logout de l'application */
    LogOut(){
        document.body.innerHTML = ""
        this._LoginToken = null
        localStorage.removeItem(this._DbKeyLogin)
        localStorage.removeItem(this._DBKeyVersion)
        localStorage.removeItem(this._DBKeyCodeAppCSS)
        localStorage.removeItem(this._DBKeyCodeAppJS)
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
        // Afficher la vue
        document.body.innerHTML = this.GetWaintingScreen()      
        // appeler le serveur
        let me = this
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let reponse = JSON.parse(this.responseText)
                if (reponse.Error) {
                    me.SetErrorMessage(reponse.ErrorMsg)
                    me._LoginToken = null
                    localStorage.removeItem(me._DbKeyLogin)
                } else {
                    let CSS = document.createElement('style')
                    let JS = document.createElement('script')
                    if ((reponse.Version != me.GetVersion()) || (me._Site != "App")){
                        console.log("From server");
                        // Save Version number 
                        if (me._Site == "App"){
                            localStorage.setItem(me._DBKeyVersion, reponse.Version)
                        } else {
                            localStorage.removeItem(me._DBKeyVersion)
                            localStorage.removeItem(me._DBKeyCodeAppCSS)
                            localStorage.removeItem(me._DBKeyCodeAppJS)
                        }
                        // Load de l'application CSS
                        CSS.type = 'text/css'
                        CSS.id = 'CodeCSS'
                        CSS.innerHTML = reponse.CodeAppCSS
                        if (me._Site == "App"){
                            localStorage.setItem(me._DBKeyCodeAppCSS, reponse.CodeAppCSS)
                        }
                        // Load de l'application JS
                        JS.type = 'text/javascript'
                        JS.id = 'CodeJs'
                        JS.innerHTML = reponse.CodeAppJS
                        if (me._Site == "App"){
                            localStorage.setItem(me._DBKeyCodeAppJS, reponse.CodeAppJS)
                        }
                    } else {
                        console.log("From Browser");
                        // Load de l'application CSS
                        CSS.type = 'text/css'
                        CSS.id = 'CodeCSS'
                        CSS.innerHTML = localStorage.getItem(me._DBKeyCodeAppCSS)
                        // Load de l'application JS
                        JS.type = 'text/javascript'
                        JS.id = 'CodeJs'
                        JS.innerHTML = localStorage.getItem(me._DBKeyCodeAppJS)
                    }
                    document.getElementsByTagName('head')[0].appendChild(CSS)
                    //Timeout entre la fin de la progressbar ou du splash et le load de l'application
                    let Time = 100
                    if (me._SplashScreen != null){
                        let TacTimeSplashScreen = new Date().getTime()
                        let TicTacDelta = me._SplashDuration - (TacTimeSplashScreen - me._TicTimeSplashScreen)
                        Time = (TicTacDelta < 0) ? 1 : TicTacDelta
                    }
                    setTimeout(function() {
                        // Set background white
                        if (me._SplashScreenBackgroundColor != null){
                            document.body.style.backgroundColor = "white"
                        }
                        // effacer le contenu du body
                        document.body.innerHTML = ""
                        // Lancement du javascript de l'application
                        document.getElementsByTagName('head')[0].appendChild(JS)
                    }, Time)
                }
            } else if (this.readyState == 4 && this.status != 200) {
                me.SetErrorMessage(this.response)
            }
        } 
        if (this._SplashScreen == null){
            xhttp.onprogress = function (event) {
                let pourcent = Math.round((event.loaded / event.total)* 100)
                document.getElementById("ProgressBar").value = pourcent
            }
        }
        xhttp.open("POST", "loadApp", true)
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhttp.send(JSON.stringify({Site:me._Site, Token:me.GetTokenLogin(), Version:me.GetVersion()})) 
    }

    GetWaintingScreen(){
        let reponse = ""
        if(this._SplashScreen != null){
            if (this._SplashScreenBackgroundColor != null){
                document.body.style.backgroundColor = this._SplashScreenBackgroundColor
            }
            this._TicTimeSplashScreen = new Date().getTime()
            reponse = `<div style="width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; align-content: center;">${this._SplashScreen}</div>`
        } else {
            reponse = this.LoadingView()
        }
        return reponse
    }

    LoadingView(){
        return `
            <style>
                .Loadingtext{
                    font-size: var(--CoreX-font-size);
                }
                .LoadingError{
                    color: red;
                    font-size: var(--CoreX-font-size);
                }
                .AppProgressBar {
                    width: 50%;
                    margin:2%;
                }
                .LoadingButton {
                    padding: 1vh; 
                    cursor: pointer; 
                    border: 1px solid rgb(44,1,21); 
                    border-radius: 20px; 
                    text-align: center; 
                    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7); 
                    background: white; 
                    display: none;
                    margin: 1vh;
                    outline: none;
                }
                @media (hover: hover) {
                    .LoadingButton:hover:enabled{
                        box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
                    }
                }
                @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
                only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
                screen and (max-width: 700px)
                {
                    .Loadingtext{font-size: var(--CoreX-Iphone-font-size);}
                    .LoadingError{font-size: var(--CoreX-Iphone-font-size);}
                    .ProgressBar{width: 90%;}
                }
                @media screen and (min-width: 1200px)
                {
                    .Loadingtext{font-size: var(--CoreX-Max-font-size);}
                    .LoadingError{font-size: var(--CoreX-Max-font-size);}
                }
            </style>
            <div style="height: 50vh; display: flex; flex-direction: column; justify-content:center; align-content:center; align-items: center;">
                <div id="DivText" style="margin: 1%;" class="Loadingtext">Loading App...</div>
                <progress id="ProgressBar" value="0" max="100" class="AppProgressBar"></progress>
                <div id="LoadingErrorMsg" class="LoadingError"></div>
                <button id="LoadingButton" class="LoadingButton Loadingtext" onclick="location.reload();">Reload</button>
            </div>`
    }

    SetErrorMessage(Error){
        if(this._SplashScreen != null){
            document.body.innerHTML = this.LoadingView()
        }
        // Set background white
        if (this._SplashScreenBackgroundColor != null){
            document.body.style.backgroundColor = "white"
        }
        document.getElementById("LoadingErrorMsg").innerHTML = Error;
        document.getElementById("LoadingButton").style.display= "block"
        document.getElementById("DivText").style.display= "none"
        document.getElementById("ProgressBar").style.display= "none"
    }
}