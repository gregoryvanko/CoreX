class CoreXLogin {
    constructor({Site = null, CallBackLogedIn = null, Color = "rgb(20, 163, 255)", AllowSignUp = false} = {}){
        this._CallBackLogedIn = CallBackLogedIn
        this._Color = Color
        this._Site= Site
        this._AllowSignUp = AllowSignUp
    }

    /* Analyse du KeyUp effectué, si c'est la touche enter alors executer la fonction login */
    InputKeyUp(event){
        if(event.keyCode === 13){
            this.Login()
        }
    }

    /* Ajout des event listener du screen login */ 
    AddEventListener(){
        let self = this
        document.getElementById("LoginLoginValue").addEventListener("keyup", ()=>{self.InputKeyUp(event)})
        document.getElementById("LoginPswValue").addEventListener("keyup", ()=>{self.InputKeyUp(event)})
        document.getElementById("LoginButtonLogin").addEventListener("click", ()=>{self.Login()})
        if(localStorage.getItem("CoreXApp") == "Admin"){
            document.getElementById("SwitchApp").addEventListener("click", ()=>{self.SwitchApp()})
        }
        if (this._AllowSignUp){
            if(localStorage.getItem("CoreXApp") == "App"){
                document.getElementById("SignUp").addEventListener("click", ()=>{self.RenderSignUpForm()})
            }
        }
    }

    /* Execution du login */
    Login(){
        if (this.InputStringValide()){
            let me = this
            document.getElementById('LoginButtonLogin').innerHTML = "Waiting..."
            var xhttp = new XMLHttpRequest()
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let reponse = JSON.parse(this.responseText)
                    if (reponse.Error) {
                        console.log('LoginError : ' + reponse.ErrorMsg)
                        document.getElementById("LoginErrorMsg").innerHTML=reponse.ErrorMsg
                        document.getElementById('LoginButtonLogin').innerHTML = "Send"
                    } else {
                        console.log('Login OK, Set Token')
                        if(me._CallBackLogedIn != null){
                            me._CallBackLogedIn(reponse.Token)
                        } else {
                            document.body.innerHTML = "Error : no CallBack fonction define after loged In"
                        }
                    }
                } else if (this.readyState == 4 && this.status != 200){
                    document.getElementById('LoginButtonLogin').innerHTML = "Send"
                    document.getElementById("LoginErrorMsg").innerHTML = this.response;
                }
            }
            xhttp.open("POST", "login", true)
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
            xhttp.send(JSON.stringify({Site:me._Site, Login:document.getElementById('LoginLoginValue').value, Pass:document.getElementById('LoginPswValue').value}))
        }
    }

    /* Vérifie si les info Input sont valides */
    InputStringValide(){
        document.getElementById("LoginErrorMsg").innerHTML =""
        let IsValide = true
        let ErrorMessage = ""
        if (document.getElementById('LoginLoginValue').value.length < 1){
            ErrorMessage += "Enter Login ";
            IsValide = false;
        } 
        if (document.getElementById('LoginPswValue').value.length < 1){
            ErrorMessage += "Enter Password ";
            IsValide = false;
        } 
        if(!IsValide){
            document.getElementById("LoginErrorMsg").innerHTML = ErrorMessage;
        }
        return IsValide;
    }

    /* Le render du screen login */
    Render(){
        let UI = this.TemplateCSS()
        let titre = document.title
        let LocalStorageApp = localStorage.getItem("CoreXApp")
        if(LocalStorageApp == "Admin") {titre += " Admin"}
        UI += this.TemplateHTML(titre)
        document.body.innerHTML = UI
        this.AddEventListener()
    }

    /* Switch App */
    SwitchApp(){
        let LocalStorageApp = localStorage.getItem("CoreXApp")
        if(LocalStorageApp == "App"){
            localStorage.setItem("CoreXApp", "Admin")
            location.reload()
        } else {
            localStorage.setItem("CoreXApp", "App")
            GlobalLogout()
        }
    }

    /* Load Sign Up form */
    RenderSignUpForm(){
        document.body.innerHTML=""
        // Css
        let MyCSS = this.TemplateCSS()
        document.body.innerHTML = MyCSS
        // ConteneurForm
        let ConteneurForm = document.createElement("div")
        document.body.appendChild(ConteneurForm)
        ConteneurForm.setAttribute("id", "Conteneur")
        ConteneurForm.setAttribute("Class", "ConteneurForm")
        // Titre
        let Titre = document.createElement("div")
        ConteneurForm.appendChild(Titre)
        Titre.setAttribute("id", "LoginTitre")
        Titre.innerText = document.title
        // space
        let Space = document.createElement("div")
        ConteneurForm.appendChild(Space)
        Space.setAttribute("style", "height: 3vh;")
        // SignUpBox
        let SignUpBox = document.createElement("div")
        ConteneurForm.appendChild(SignUpBox)
        SignUpBox.setAttribute("class", "LoginBox")
        // Sous titre Sign Up
        let SousTitre = document.createElement("div")
        SignUpBox.appendChild(SousTitre)
        SousTitre.setAttribute("class", "LoginTextBig")
        SousTitre.innerText = "Sign Up"
        // space
        let Space1 = document.createElement("div")
        SignUpBox.appendChild(Space1)
        Space1.setAttribute("style", "height: 3vh;")
        // Email
        SignUpBox.appendChild(this.BuildUserDataview("Email", "text", "100%"))
        // Frist Name
        SignUpBox.appendChild(this.BuildUserDataview("First-Name", "text", "100%"))
        // Last Name
        SignUpBox.appendChild(this.BuildUserDataview("Last-Name", "text", "100%"))
        // PAssword
        SignUpBox.appendChild(this.BuildUserDataview("Password", "password", "100%"))
        // Error
        let Error = document.createElement("div")
        SignUpBox.appendChild(Error)
        Error.setAttribute("id", "AccountErrorMsg")
        Error.setAttribute("class", "LoginError")
        Error.style.textAlign = "center"
        Error.innerText = " "
        // space
        let Space2 = document.createElement("div")
        SignUpBox.appendChild(Space2)
        Space2.setAttribute("style", "height: 3vh;")
        // Button
        let divButton = document.createElement("div")
        SignUpBox.appendChild(divButton)
        divButton.setAttribute("style", "width:100%; text-align: center;")
        let ButtonCreate = document.createElement("button")
        divButton.appendChild(ButtonCreate)
        ButtonCreate.setAttribute("Class", "LoginButton")
        ButtonCreate.setAttribute("id", "AccountButton")
        ButtonCreate.style.marginLeft = "auto"
        ButtonCreate.style.marginRight = "auto"
        ButtonCreate.innerText = "Create an Account"
        ButtonCreate.onclick = this.CreateAccount.bind(this)
    }

    /** Construcuteur d'un element html pour une Key et une valeur */
    BuildUserDataview(Key, Type, width){
        let element = document.createElement("div")
        element.setAttribute("style", "width: 100%; margin-top: 1vh;")
        // Texte
        let Text = document.createElement("div")
        element.appendChild(Text)
        Text.setAttribute("Class", "LoginText")
        Text.setAttribute("Style", "width: " + width +";")
        Text.innerText = Key.replace("-", " ")

        let inputStyle="box-sizing: border-box; outline: none; margin: 0; background: white; -webkit-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -moz-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #666; margin-bottom: 1vw; border: solid 1px rgba(0,0,0,.1); padding: 2%;"
        let InputData = document.createElement("input")
        element.appendChild(InputData)
        InputData.setAttribute("id", Key)
        InputData.setAttribute("Class", "LoginText CoreXWindowUserConfigInput")
        InputData.setAttribute("Style", inputStyle + "width: " + width +";")
        //InputData.setAttribute("value", Value)
        InputData.setAttribute("type", Type)
        InputData.setAttribute("name", Key)
        //InputData.setAttribute("placeholder", Key.replace("-", " "))
        return element
    }

    /** Creation deun account */
    CreateAccount(){
        if (this.InputUserAccountDataValide()){
            let me = this
            document.getElementById('AccountButton').innerHTML = "Waiting..."
            var xhttp = new XMLHttpRequest()
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let reponse = JSON.parse(this.responseText)
                    if (reponse.Error) {
                        console.log('AccountError : ' + reponse.ErrorMsg)
                        document.getElementById("AccountErrorMsg").innerText=reponse.ErrorMsg
                        document.getElementById('AccountButton').innerText = "Create an Account"
                    } else {
                        console.log('Create Account OK, Set Token')
                        if(me._CallBackLogedIn != null){
                            me._CallBackLogedIn(reponse.Token)
                        } else {
                            document.body.innerHTML = "Error : no CallBack fonction define after loged In"
                        }
                    }
                } else if (this.readyState == 4 && this.status != 200){
                    document.getElementById('AccountButton').innerText = "Create an Account"
                    document.getElementById("AccountErrorMsg").innerText = this.response;
                }
            }
            xhttp.open("POST", "CreateAccount", true)
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
            xhttp.send(JSON.stringify({Email:document.getElementById('Email').value, FirstName:document.getElementById('First-Name').value, LastName:document.getElementById('Last-Name').value, Password:document.getElementById('Password').value}))
        }
    }

    /** Validation des data pour creer un user */
    InputUserAccountDataValide(){
        document.getElementById("AccountErrorMsg").innerHTML =" "
        let ErrorMessage = ""
        let IsValide = true
        if (document.getElementById('Email').value.length > 1){
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(! re.test(String(document.getElementById('Email').value).toLowerCase())){
                ErrorMessage += "Enter a valid Email<br>";
                IsValide = false;
            }
        } else {
            ErrorMessage += "Enter Email<br>";
            IsValide = false;
        }
        if (document.getElementById('First-Name').value.length < 3){
            ErrorMessage += "Enter a longer First Name<br>";
            IsValide = false;
        }
        if (document.getElementById('Last-Name').value.length < 3){
            ErrorMessage += "Enter a longer Last Name<br>";
            IsValide = false;
        }
        if (document.getElementById('Password').value.length < 7){
            ErrorMessage += "Enter a longer Password<br>";
            IsValide = false;
        }
        if(!IsValide){
            document.getElementById("AccountErrorMsg").innerHTML = ErrorMessage;
        }
        return IsValide
    }

    /* Le template du screen login */
    TemplateHTML(Titre){
        let reponse = `
        <div style="display: flex; flex-direction: column; justify-content:space-between; align-content:center; align-items: center;">
            <div id="LoginTitre">` + Titre + /*html*/`</div>
            <div style="height: 5vh;"></div>
            <div class="LoginBox" style="text-align: center;">
                <input id="LoginLoginValue" class="LoginInput" type="text" name="LoginLoginValue" placeholder="Email" autofocus tabindex="1"> <br>
                <input id="LoginPswValue" class="LoginInput" type="password" name="LoginPswValue" placeholder="Password" tabindex="2"> <br>
                <div style="height: 4vh;"></div>
                <div id="LoginErrorMsg" class="LoginError"></div>
                <button id="LoginButtonLogin" class="LoginButton" tabindex="3">Send</button>
            </div>
            `
        // Ajout du lien Sign Up
        if (this._AllowSignUp){
            if(localStorage.getItem("CoreXApp") == "App"){
                reponse += `
                <div style="height:4vh;"></div>
                <button id="SignUp" style="background:none;border:none; color:blue; cursor: pointer; outline: none;" class="LoginText"><U>Sign Up</U></button>
                `
            }
        }
        // Ajout d'un lien go to app si on est dans l'app Admin
        if(localStorage.getItem("CoreXApp") == "Admin"){
            reponse += `
            <div style="height:4vh;"></div>
            <button id="SwitchApp" style="background:none;border:none; color:blue; cursor: pointer; outline: none;" class="LoginText"><U>Go to the App</U></button>
            `
        }

        return reponse
    }

    /* Le css du screen login */
    TemplateCSS(){
        return /*html*/`
        <style>
            /*Titre du login*/
            #LoginTitre{
                margin: 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .LoginText{font-size: var(--CoreX-font-size);}
            .LoginTextBig{font-size: calc(var(--CoreX-font-size)*1.5);}

            /*Message d'erreur de l'application*/
            .LoginError{
                color: red;
                font-size: var(--CoreX-font-size);
            }

            /*Boutton Login*/
            .LoginButton{
                margin: 2% 0% 2% 0%;
                padding: 1vh;
                cursor: pointer;
                border: 1px solid rgb(44,1,21);
                border-radius: 20px;
                text-align: center;
                display: inline-block;
                font-size: var(--CoreX-font-size);
                box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
                color: rgb(44,1,21);
                background: white;
                outline: none;
                width: 70%;
            }

            .LoginButton:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }

            /*Type Input du login*/
            .LoginInput {
                width: 70%;
                font-size: var(--CoreX-font-size);
                padding: 2vh;
                border: solid 0px #dcdcdc;
                border-bottom: solid 1px #dcdcdc;
            }
            .LoginInput:focus,
            .LoginInput.focus {
                outline: none;
                border: solid 0px #707070;
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }

            .NoVisited:{
                color: blue;
            }
            .NoVisited:visited{
                color: blue;
            }
            .NoVisited:hover{
                color: blue;
            }

            .ConteneurForm{
                display: flex;
                flex-direction: column;
                justify-content:space-between;
                align-content:center;
                align-items: center;
            }
            .LoginBox{
                margin: 0px auto 0px auto;
                background-color: white; 
                width:30%; 
                text-align: left; 
                box-shadow: 0 10px 20px rgba(0, 0, 0, .2); 
                padding: 5vh;
            }

            .CoreXWindowUserConfigInput:focus,
            .CoreXWindowUserConfigInput.focus {
                border-color: var(--CoreX-color);
            }
            @media (hover: hover) {
                .CoreXWindowUserConfigInput:hover{
                    border-color: var(--CoreX-color);
                }
            }

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #LoginTitre{font-size: var(--CoreX-TitreIphone-font-size);}
                .LoginText{font-size: var(--CoreX-Iphone-font-size);}
                .LoginTextBig{font-size: calc(var(--CoreX-Iphone-font-size)*1.5);}
                .LoginInput {font-size: var(--CoreX-Iphone-font-size);}
                .LoginError{font-size: var(--CoreX-Iphone-font-size);}
                .LoginButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
                .LoginBox{width:80%; padding: 2vh;}
                .CoreXWindowUserConfigInput {padding: 3%;}
            }

            @media screen and (min-width: 1200px)
            {
                #LoginTitre{font-size: var(--CoreX-TitreMax-font-size);}
                .LoginText{font-size: var(--CoreX-Max-font-size);}
                .LoginTextBig{font-size: calc(var(--CoreX-Max-font-size)*1.5);}
                .LoginInput {font-size: var(--CoreX-Max-font-size);}
                .LoginError{font-size: var(--CoreX-Max-font-size);}
                .LoginButton{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>
        `
    }
}