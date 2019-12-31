class CoreXAdminApp{
    constructor(){
        this._HtmlIdApp = "AdminApp"
        this._ClickOnAdminBox =true
        this._MyCoreXActionButton = new CoreXActionButton()
    }
    
    /* Render de l'application */
    RenderSart(){
        document.body.innerHTML = this.GetCss() + this._MyCoreXActionButton.Rendre() + '<div id="' + this._HtmlIdApp + '"></div>'
        this._MyCoreXActionButton.Start()
        this.LoadViewStart()
    }

    /* Vider la vue actuelle */
    ClearView(){
        document.getElementById(this._HtmlIdApp).innerHTML = ""
    }

    /* Ajouter de l'html a la vue */
    SetView(HTML){
        document.getElementById(this._HtmlIdApp).innerHTML = HTML
    }

    /*
    **   Load View
    */
    /* Load de la start page de l'app admin */
    LoadViewStart(){
        this.ClearView()
        let View = /*html*/`
        <div class="FlexColumnCenterSpaceAround">
            <div id="Titre">Admin Application</div>
            <div class="ContainerCommand" style="display: flex; flex-direction: row; flex-wrap:wrap; justify-content:space-around; align-items: center; align-content:center;">
                <div id="ButtonUser" class="ImageConteneur FlexColumnCenterSpaceAround">
                    <img class="UserImg" src=` + this.GetImageUser() + `>
                    <div class="Text">User</div>
                </div>
                <div id="ButtonAdmin" class="ImageConteneur FlexColumnCenterSpaceAround">
                    <img class="UserImg" src=` + this.GetImageAdmin() + `>
                    <div class="Text">Admin</div>
                </div>
            </div>
        </div>`
        // Ajout de la vue
        this.SetView(View)
        // Ajout des event onclick
        ButtonUser.onclick = this.OnClickUser.bind(this)
        ButtonAdmin.onclick = this.OnClickAdmin.bind(this)
    }

    /* Load de la vue qui va appeler le serveur pour recevoir la liste des users ou admin */
    LoadViewCallForUserList(){
        let TypeTexte = (this._ClickOnAdminBox) ? "Administrators" : "Users"
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">Liste of `+ TypeTexte + /*html*/`</div>
        <div id="ListOfUser" class="FlexRowCenterSpaceevenly">
            <div class="Text">Get list of `+ TypeTexte + /*html*/`...</div>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // Get All user
        let Dataofcall = (this._ClickOnAdminBox) ? "Admin" : "User"
        GlobalCallAPI("GetAllUser", Dataofcall , this.LoadUserList.bind(this), this.CallBackErrorLoadUserList.bind(this))
    }
    
    /* Load de la vue contenant la liste de tous les users */
    LoadUserList(Users){
        let reponse =JSON.stringify(Users)
        let TypeTexte = (this._ClickOnAdminBox) ? "Administrators" : "Users"
        if (Users == null) {
            document.getElementById("ListOfUser").innerHTML =/*html*/`<div class="Text">Sorry, no `+ TypeTexte + /*html*/` defined</div>`
        } else {
            reponse = ""
            // Creation des box pour chaque Admin
            Users.forEach(User => {
                reponse += `
                <div id="` + User._id + `" class="UserConteneur FlexColumnCenterSpaceAround">
                    <div class="Text">` + User.User + `</div>
                </div>`
            })
            // ajout des user dans l'interface
            document.getElementById("ListOfUser").innerHTML = reponse
            if (this._ClickOnAdminBox) {
                // add event listener
                Users.forEach(User => {
                    let element = document.getElementById(User._id)
                    element.addEventListener("click", this.OnClickOneUser.bind(this,User._id))
                })
            } else {
                // add event listener
                Users.forEach(User => {
                    let element = document.getElementById(User._id)
                    element.addEventListener("click", this.OnClickOneUser.bind(this,User._id))
            })
            }
        }
    }

    /* callback error Load list of user */
    CallBackErrorLoadUserList(error){
        document.getElementById("ListOfUser").innerHTML='<div class="Text" style="color:red;">' + error + '</div>'
    }

    /* Load de la vue qui structure la liste des donnees d'un Admin */
    LoadViewCallForUserData(UserId){
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">User information</div>
        <div id="ListOfUserData" class="FlexColumnCenterSpaceAround">
            <div class="Text">Get data of user...</div>
        </div>
        <div id="ErrorOfUserData" class="Text" style="color:red; text-align:center;"></div>
        <div id="Controle" class="FlexRowCenterSpaceevenly">
            <button id="ButtonDelete" class="Button" tabindex="3" style="display: none;">Delete</button>
            <button id="ButtonSave" class="Button" tabindex="1" style="display: none;">Save</button>
            <button id="ButtonBack" class="Button" tabindex="2" style="display: none;">Back</button>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // ajout des event
        let self = this
        document.getElementById("ButtonDelete").addEventListener("click", ()=>{self.OnClickDeleteUser(UserId)})
        document.getElementById("ButtonSave").addEventListener("click", ()=>{self.OnClickSaveUserData(UserId)})
        document.getElementById("ButtonBack").addEventListener("click", ()=>{self.LoadViewCallForUserList()})
        // Data for the api Call
        let DataCall = new Object()
        DataCall.UsesrId = UserId
        DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // Call Get user data
        GlobalCallAPI("GetUserData", DataCall, this.LoadUserData.bind(this), this.CallBackErrorLoadUserData.bind(this))
    }

    /* Load de la vue montrant les donnes d'un user */
    LoadUserData(Data){
        // Afficher les bouttons de controles
        document.getElementById("ButtonDelete").style.display = "inline"
        document.getElementById("ButtonSave").style.display = "inline"
        document.getElementById("ButtonBack").style.display = "inline"
        // Supprimer les proprietés du user a ne pas afficher
        let UserDataToShow = Data[0]
        delete UserDataToShow._id
        // Creation de la liste HTML des données du user
        let reponse =""
        Object.keys(UserDataToShow).forEach(element => {
            reponse += this.UserDataBuilder(element, UserDataToShow[element])
        })
        document.getElementById("ListOfUserData").innerHTML = reponse
    }

    UserDataBuilder(Key, Value){
        let reponse =""
        switch (Key) {
            case "Password":
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="password" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break
            case "Confirm-Password":
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="password" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break;
            default:
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="text" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break
        }
        return reponse
    }

    /* CallBack error du load des data d'un user */
    CallBackErrorLoadUserData(error){
        document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + error + '</div>'
        document.getElementById("ButtonBack").style.display = "inline"
    }

    /* Delete d'un user */
    DeleteUser(UserId){
        document.getElementById("ListOfUserData").innerHTML='<div class="Text">Delete du user...</div>'
        document.getElementById("ButtonDelete").style.display = "none"
        document.getElementById("ButtonSave").style.display = "none"
        document.getElementById("ButtonBack").style.display = "none"
        // Data for the api Call
        let DataCall = new Object()
        DataCall.UsesrId = UserId
        DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // Call delete user
        GlobalCallAPI("DeleteUser", DataCall, this.CallBackDeleteUser.bind(this), this.CallBackErrorDeleteUser.bind(this))
    }

    /* CallBAck du Delete d'un user */
    CallBackDeleteUser(){
        this.LoadViewCallForUserList()
    }

    /* CallBack error du Delete d'un user */
    CallBackErrorDeleteUser(error){
        document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + error + '</div>'
        document.getElementById("ButtonBack").style.display = "inline"
    }

    /* Update d'un user */
    UpdateUser(UserId){
        let InputDataValide = true
        // Data for the api Call
        let DataCall = new Object()
        DataCall.UsesrId = UserId
        DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // selectionner et ajouter tous les input de type CoreXInput dans DataCall
        let AllData = new Object()
        let el = document.querySelectorAll('[data-Input="CoreXInput"]')
        el.forEach(element => {
            AllData[element.name] = element.value
        })
        DataCall.Data = AllData
        // verifier si le password = confirm password
        if(document.getElementById("Password").value != document.getElementById("Confirm-Password").value){
            InputDataValide = false
            document.getElementById("ErrorOfUserData").innerHTML= "Password not confirmed!"
        }
        // Sit tout les input son valide en envoie les data
        if (InputDataValide){
            // afficher le message d'update
            document.getElementById("ListOfUserData").innerHTML='<div class="Text">Update du user...</div>'
            document.getElementById("ButtonDelete").style.display = "none"
            document.getElementById("ButtonSave").style.display = "none"
            document.getElementById("ButtonBack").style.display = "none"
            // Call delete user
            GlobalCallAPI("UpdateUser", DataCall, this.CallBackUpdateUser.bind(this), this.CallBackErrorUpdateUser.bind(this))
        }
    }

    /* CallBAck de Update d'un user */
    CallBackUpdateUser(){
        this.LoadViewCallForUserList()
    }

    /* CallBack error du Delete d'un user */
    CallBackErrorUpdateUser(error){
        document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + error + '</div>'
        document.getElementById("ButtonBack").style.display = "inline"
    }
    
    /*
    **   Onclick
    */
    /* Click sur le botton User */
    OnClickUser(){
        this._ClickOnAdminBox = false
        this.LoadViewCallForUserList()
    }

    /* Click sur le botton Admin */
    OnClickAdmin(){
        this._ClickOnAdminBox = true
        this.LoadViewCallForUserList()
    }

    /* Click sur un user */
    OnClickOneUser(Id){
        this.LoadViewCallForUserData(Id)
    }

    /* Click sur le bouton Save d'un user */
    OnClickSaveUserData(UserId){
        document.getElementById("ErrorOfUserData").innerHTML= ""
        this.UpdateUser(UserId)
    }

    /* Click sur le bouton Delete d'un user */
    OnClickDeleteUser(UserId){
        if (confirm('Are you sure you want to Dete this User?')) {
            this.DeleteUser(UserId)
        }
    }

    /*
    **   CSS
    */
    /* Get all css tag for admin */
    GetCss(){
        return /*html*/`
        <style>
            /*Titre*/
            #Titre{
                margin: 1% 1% 4% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            /* Texte */
            .Text{font-size: var(--CoreX-font-size);}
            /* Container des bloc de commande */
            .ContainerCommand{width: 60%;}
            /* Conteneur de bloc image */
            .ImageConteneur{
                border: 1px solid black;
                border-radius: 5px;
                width: 14vw;
                height: 14vw;
                cursor: pointer;
            }
            /* Conteneur de bloc use */
            .UserConteneur{
                border: 1px solid black;
                border-radius: 5px;
                width: 35vw;
                height: 10vw;
                margin: 0.5%;
                cursor: pointer;
            }
            /* Image d'un user */
            .UserImg{
                max-width: 100%;
                display: block;
                margin-left: auto;
                margin-right: auto;
                max-height: 10vw;
                border: 0px solid grey;
                border-radius: 5px;
                flex: 0 0 auto;
            }
            /* Input */
            .Input {
                width: 75%;
                font-size: var(--CoreX-font-size);
                padding: 1vh;
                border: solid 0px #dcdcdc;
                border-bottom: solid 1px transparent;
                margin: 1% 0px 1% 0px;
            }
            .Input:focus,
            .Input.focus {
                outline: none;
                border: solid 0px #707070;
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }
            .Input:hover{
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }

            /* Titre de l'input */
            .InputKey{
                color: gray; 
                width:25%; 
                margin:1%; 
                text-align:right;
            }
            /* Felx colum center  space-around*/
            .FlexColumnCenterSpaceAround{
                display: flex;
                flex-direction: column;
                justify-content:space-around;
                align-content:center;
                align-items: center;
            }
            /* Felx row center  space-evenly*/
            .FlexRowCenterSpaceevenly{
                display: flex;
                flex-direction: row;
                justify-content:space-evenly;
                align-content:center;
                align-items: center;
                flex-wrap: wrap;
            }
            /* Flex row center Center*/
            .FlexRowLeftCenter{
                display: flex;
                flex-direction: row;
                justify-content : left;
                align-items: center;
                align-content:center;
            }
            /*Boutton*/
            .Button{
                margin: 4% 0% 1% 0%;
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
                width: 20%;
            }
            .Button:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
                .Text{font-size: var(--CoreX-Iphone-font-size);}
                .ContainerCommand{width: 90%;}
                .ImageConteneur{
                    width: 25vw;
                    height: 25vw;
                }
                .UserConteneur{
                    width: 55vw;
                    height: 12vw;
                    margin: 2%;
                }
                .UserImg{max-height: 20vw;}
                .Input {
                    width: 70%;
                    font-size: var(--CoreX-Iphone-font-size);
                    border-bottom: solid 1px #dcdcdc;
                }
                .InputKey {width:25%;}
                .Button{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
            }
            @media screen and (min-width: 1200px)
            {
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
                .Text{font-size: var(--CoreX-Max-font-size);}
                .ImageConteneur{
                    width: 148px;
                    height: 148px;
                }
                .UserConteneur{
                    width: 350px;
                    height: 100px;
                }
                .UserImg{max-height: 120px;}
                .Input {font-size: var(--CoreX-Max-font-size);}
                .Button{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>`
    }

    /*
    **  Images
    */
    /* Image d'un Admin */
    GetImageAdmin(){
        return "data:image/png;base64,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"
    }

    /* Image d'un User */
    GetImageUser(){
        return "data:image/png;base64,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"
    }
}

class CoreXActionButton{
    constructor(){
        this._HtmlId = "AdminCoreXActionButton"
        this._ActionList=[]
        this._lastTap = 0
    }
    /** Affichage du bouton action */
    Rendre(){
        let TemplateActionButton = '<button id="'+this._HtmlId+'" class="CoreXActionMenuButton" style="right: 0px; display: inline;">&#9733</button>'
        return this.GetCss() + TemplateActionButton
    }
    /** Start de l'action button */
    Start(){
        if (document.getElementById(this._HtmlId)) {
            let Button = document.getElementById(this._HtmlId)
            Button.addEventListener("click", this.OnClickCoreXActionButton.bind(this))
            document.addEventListener('touchend', this.DoubleTouchEventFct.bind(this))
        } else {
            console.log(this._HtmlId + " n'existe pas dans la fonction Start")
        }
    }
    /** Détection d'un double tap sur l'écran */
    DoubleTouchEventFct(){
        if (document.getElementById(this._HtmlId)) {
            let currentTime = new Date().getTime()
            let tapLength = currentTime - this._lastTap
            if (tapLength < 500 && tapLength > 0) {
                if (document.getElementById(this._HtmlId).style.opacity == "1") {
                    document.getElementById(this._HtmlId).style.opacity = "0"
                } else {
                    document.getElementById(this._HtmlId).style.opacity = "1"
                }
                event.preventDefault()
            } 
            this._lastTap = currentTime
        } else {
            console.log(this._HtmlId + " n'existe pas dans la fonction DoubleTouchEventFct")
        }
    }
    /** Hide action Button */
    HideActionButton(){
        if (document.getElementById(this._HtmlId)) {
            if (document.getElementById(this._HtmlId).style.opacity == "1") {
                document.getElementById(this._HtmlId).style.opacity = "0"
            }
        }
    }

    test(){
        alert(this._HtmlId)
    }
    /** Click on CoreXActionButton */
    OnClickCoreXActionButton(){
        var Div = document.createElement("div")
        Div.setAttribute("style","width: 70%; margin: 0px auto 0px auto; display: -webkit-flex; -webkit-flex-flow: column wrap; display: flex; flex-flow: column wrap; justify-content: center; padding: 1%;")
        // Ajout de tous les boutons
        Div.appendChild(this.GetTemplateActionBoutton("Test", this.test.bind(this)))
        Div.appendChild(this.GetTemplateActionBoutton("Logout", GlobalLogout))
        CoreXWindow.BuildWindow(Div)
        this.HideActionButton()
    }
    /**  */
    GetTemplateActionBoutton(Titre, Fct){
        var Button = document.createElement("button")
        Button.setAttribute("style", "background-color:white;")
        Button.setAttribute("class", "CoreXActionButtonButton")
        Button.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); Fct()})

        var Div1 = document.createElement("div")
        Div1.setAttribute("style", "display: flex; flex-direction: row; align-items: center; justify-content: center; align-content: center;")
        Button.appendChild(Div1)

        var Div2 = document.createElement("div")
        Div2.innerHTML = Titre
        Div1.appendChild(Div2)

        return Button
    }
    /** Get Css du bouton action */
    GetCss(){
    return /*html*/`
        <style>
        .CoreXActionButtonButton{
            margin: 2% 2% 2% 2%;
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
        }
        .CoreXActionButtonButton:hover{
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
        }
        .CoreXActionMenuButton{
            position: fixed;
            top: 0px;
            font-size: var(--CoreX-font-size);
            float: left;
            border-style: solid;
            border-width: 2px;
            border-radius: 10px;
            border-color: var(--CoreX-color);
            background-color: white;
            padding: 4px;
            margin: 4px;
            opacity: 0;
            transition: opacity 0.5s linear;
            cursor: pointer;
        }
        .CoreXActionMenuButton:hover,
        .CoreXActionMenuButton:active{opacity: 1;}
        @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
        only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
        screen and (max-width: 700px)
        {
            .CoreXActionButtonButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
            .CoreXActionMenuButton{font-size: var(--CoreX-Iphone-font-size);}
        }
        @media screen and (min-width: 1200px)
        {
            .CoreXActionButtonButton {font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            .CoreXActionMenuButton {font-size: var(--CoreX-Max-font-size);}
        }
        </style>
        `
    }
    /** Clear de liste des actions */
    ClearActionList(){
        this._ActionList=[]
    }
}

class CoreXWindow{
    constructor(){
    }
    /** Construction d'un fenetre */
    static BuildWindow(ElementHtml) {
        var winH = window.innerHeight
        var divInputScreenTop = (winH/12)  + "px"
        var divInputScreenMaxHeight = winH - 2*(winH/10)  + "px"
        const SVGDataButtonColse = "PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSI2MTJweCIgaGVpZ2h0PSI2MTJweCIgdmlld0JveD0iMCAwIDYxMiA2MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA2MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iRGVsZXRlIj4KCQk8Zz4KCQkJPHBhdGggZD0iTTM4Ny4xMjgsMTcwLjc0OEwzMDYsMjUxLjkxNWwtODEuMTI4LTgxLjE2N2wtNTQuMTI0LDU0LjEyNEwyNTEuOTE1LDMwNmwtODEuMTI4LDgxLjEyOGw1NC4wODUsNTQuMDg2TDMwNiwzNjAuMDg2CgkJCQlsODEuMTI4LDgxLjEyOGw1NC4wODYtNTQuMDg2TDM2MC4wODYsMzA2bDgxLjEyOC04MS4xMjhMMzg3LjEyOCwxNzAuNzQ4eiBNNTIyLjM4LDg5LjYyCgkJCQljLTExOS40OTMtMTE5LjQ5My0zMTMuMjY3LTExOS40OTMtNDMyLjc2LDBjLTExOS40OTMsMTE5LjQ5My0xMTkuNDkzLDMxMy4yNjcsMCw0MzIuNzYKCQkJCWMxMTkuNDkzLDExOS40OTMsMzEzLjI2NywxMTkuNDkzLDQzMi43NiwwQzY0MS44NzMsNDAyLjg4OCw2NDEuODczLDIwOS4xMTMsNTIyLjM4LDg5LjYyeiBNNDY4LjI5NSw0NjguMjk1CgkJCQljLTg5LjYyLDg5LjYxOS0yMzQuOTMyLDg5LjYxOS0zMjQuNTUxLDBjLTg5LjYyLTg5LjYyLTg5LjYyLTIzNC45MzIsMC0zMjQuNTUxYzg5LjYyLTg5LjYyLDIzNC45MzEtODkuNjIsMzI0LjU1MSwwCgkJCQlDNTU3LjkxNCwyMzMuMzYzLDU1Ny45MTQsMzc4LjYzNyw0NjguMjk1LDQ2OC4yOTV6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
        var CSS =/*html*/`
            <style>
            #CoreXWindowScreen{
                width:40%;
                display: block;
                position: fixed;
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                z-index: 10;
                background-color: white;
                padding: 10px;
                border-radius: 10px;
                border: 2px solid var(--CoreX-color);
                overflow-y: auto;
            }
            .CoreXWindowCloseButton{
                width:5%;
                padding: 0px;
                cursor: pointer;
                border: 0px solid black;
                background-color: white;
                top: 0px;
                right: 0px;
                position:absolute;
                margin: 1%;
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #CoreXWindowScreen{width: 90%;}
                .CoreXWindowCloseButton{width:5%;}
            }
            @media screen and (min-width: 1200px)
            {
                #CoreXWindowScreen{width: 500px;}
                .CoreXWindowCloseButton{width:25px;}
            }
            </style>`

        var el = document.createElement("div")
        el.setAttribute("id", "CoreXWindow")
        el.innerHTML = CSS

        var Div1 = document.createElement("div")
        Div1.setAttribute("style", "display: block; position: fixed; top: 0px; left: 0px; background-color: rgb(230,230,230, 0.8); width: 100%; height: 100%; z-index: 10;")
        el.appendChild(Div1)

        var Div2 = document.createElement("div")
        Div2.setAttribute("id", "CoreXWindowScreen")
        Div2.setAttribute("style","top: " + divInputScreenTop + "; max-height: " + divInputScreenMaxHeight + ";")
        Div1.appendChild(Div2)

        var Button = document.createElement("button")
        Button.setAttribute("class", "CoreXWindowCloseButton")
        Button.innerHTML = '<img src="data:image/svg+xml;base64,' + SVGDataButtonColse + '" height="100%" width="100%">'
        Button.addEventListener("click", CoreXWindow.DeleteWindow)
        Div2.appendChild(Button)

        if(ElementHtml !=""){
            Div2.appendChild(ElementHtml)
        }

        document.body.appendChild(el)
    }
    /** Suppression de la fenetre */
    static DeleteWindow() {
        let divWindow = document.getElementById("CoreXWindow")
        divWindow.parentNode.removeChild(divWindow)
    }
}

// Lancement de l'application Admin
let MyAdminApp = new CoreXAdminApp()
MyAdminApp.RenderSart()
