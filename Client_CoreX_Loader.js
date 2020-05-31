class CoreXLoader {
    constructor({Color = "rgb(20, 163, 255)", AppIsSecured=true} = {}){
        // Variable externe indispensable de la class
        this._LoginToken = null
        this._Color = Color
        this._AppIsSecured = AppIsSecured

        // Variable externe secondaire
        this._Site = null

        // Variable interne de la class
        this._DbKeyLogin = ""
    }
    
    set Site(val){this._Site = val}
    
    /* Fonction lancee au debut du chargement de la page */
    Start(){
        // Set du nom de la key DB qui contiendra le token du site
        this._DbKeyLogin = "CoreXLoginToken" + this._Site
        // si non securisee on enregistre un token anonyme
        if(!this._AppIsSecured){localStorage.setItem(this._DbKeyLogin, "Anonyme")}
        // Get Token
        this._LoginToken = this.GetTokenLogin() 
        if(this._LoginToken != null){
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
        document.body.innerHTML = ""
        this._LoginToken = null
        localStorage.removeItem(this._DbKeyLogin)
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
                .AppProgressBar {
                    width: 50%;
                    margin:2%;
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
                <div style="margin: 1%;" class="Loadingtext">Loading App...</div>
                <progress id="ProgressBar" value="0" max="100" class="AppProgressBar"></progress>
                <div id="LoadingErrorMsg" class="LoadingError"></div>
            </div>`
        document.body.innerHTML = LoadingText
        // appeler le serveur
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
                    //console.log('App Loaded')
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
                    // Timeout de 500 milisec entre la fin de la progressbar et le load de l'application
                    setTimeout(function() {
                        // effacer le contenu du body
                        document.body.innerHTML = ""
                        // Lancement du javascript de l'application
                        document.getElementsByTagName('head')[0].appendChild(JS)
                    }, 100)
                }
            } else if (this.readyState == 4 && this.status != 200) {
                document.getElementById("LoadingErrorMsg").innerHTML = this.response;
            }
        } 
        xhttp.onprogress = function (event) {
            let pourcent = Math.round((event.loaded / event.total)* 100)
            document.getElementById("ProgressBar").value = pourcent
        }
        xhttp.open("POST", "loadApp", true)
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhttp.send(JSON.stringify({Site:me._Site, Token:me.GetTokenLogin()})) 
    }
}