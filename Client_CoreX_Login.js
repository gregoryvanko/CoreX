class CoreXLogin {
    constructor({Site = null, CallBackLogedIn = null, Color = "rgb(20, 163, 255)"} = {}){
        this._CallBackLogedIn = CallBackLogedIn
        this._Color = Color
        this._Site= Site
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
                } else {
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
        UI += this.TemplateHTML(document.title)
        document.body.innerHTML = UI
        this.AddEventListener()
    }

    /* Le template du screen login */
    TemplateHTML(Titre){
        return /*html*/`
        <div style="display: flex; flex-direction: column; justify-content:space-between; align-content:center; align-items: center;">
            <div id="LoginTitre">` + Titre + /*html*/`</div>
            <div id="LoginBox">
                <div style="height: 5vh;"></div>
                <input id="LoginLoginValue" class="LoginInput" type="text" name="LoginLoginValue" placeholder="Login" autofocus tabindex="1"> <br>
                <input id="LoginPswValue" class="LoginInput" type="password" name="LoginPswValue" placeholder="Password" tabindex="2"> <br>
			    <div id="LoginErrorMsg" class="LoginError"></div>
                <button id="LoginButtonLogin" class="LoginButton" tabindex="3">Send</button>
            </div>
        </div>
        `
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

            /*Box du login*/
            #LoginBox{
                width: 40%;
                text-align: center;
                margin: 0px auto 0px auto;
                background-color: white;
            }

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
                margin: 2% 0px 2% 0px;
            }
            .LoginInput:focus,
            .LoginInput.focus {
                outline: none;
                border: solid 0px #707070;
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #LoginTitre{font-size: var(--CoreX-TitreIphone-font-size);}
                #LoginBox{width: 90%;}
                .LoginInput {font-size: var(--CoreX-Iphone-font-size);}
                .LoginError{font-size: var(--CoreX-Iphone-font-size);}
                .LoginButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
            }

            @media screen and (min-width: 1200px)
            {
                #LoginTitre{font-size: var(--CoreX-TitreMax-font-size);}
                #LoginBox{max-width: 500px;}
                .LoginInput {font-size: var(--CoreX-Max-font-size);}
                .LoginError{font-size: var(--CoreX-Max-font-size);}
                .LoginButton{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>
        `
    }
}