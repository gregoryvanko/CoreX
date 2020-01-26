class CoreXAdminApp{
    constructor(){
        this._HtmlIdApp = "AdminApp"
        this._ClickOnAdminBox =true
        this._MyCoreXActionButton = new CoreXActionButton()
        this._LogCursor = 0
        this._LogIdListe = []
    }
    
    /* Render du corps de la page de l'application */
    RenderSart(){
        document.body.innerHTML = this.GetCss() + '<div id="' + this._HtmlIdApp + '"></div>'
        this._MyCoreXActionButton.Start()
        this.LoadViewStart()
    }
    /* Vider la vue actuelle */
    ClearView(){
        document.getElementById(this._HtmlIdApp).innerHTML = ""
        this._MyCoreXActionButton.ClearActionList()
    }
    /* Ajouter de l'html a la vue */
    SetView(HTML){
        document.getElementById(this._HtmlIdApp).innerHTML = HTML
    }

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
                <div id="ButtonLog" class="ImageConteneur FlexColumnCenterSpaceAround">
                    <img class="UserImg" src=` + this.GetImageLog() + `>
                    <div class="Text">Log</div>
                </div>
            </div>
        </div>`
        // Ajout de la vue
        this.SetView(View)
        // Ajout des event onclick
        ButtonUser.onclick = this.OnClickUserBox.bind(this)
        ButtonAdmin.onclick = this.OnClickAdminBox.bind(this)
        ButtonLog.onclick = this.LoadViewCallForLog.bind(this)
    }
    /** Click sur la Box User du menu principale */
    OnClickUserBox(){
        this._ClickOnAdminBox = false
        this.LoadViewCallForUserList()
    }
    /** Click sur la Box Admin du menu principale */
    OnClickAdminBox(){
        this._ClickOnAdminBox = true
        this.LoadViewCallForUserList()
    }

    /* Load de la vue qui va appeler le serveur pour recevoir la liste des users ou admin */
    LoadViewCallForUserList(){
        //this._ClickOnAdminBox = ClickOnAdminBox
        this.ClearView()
        let TypeTexte = (this._ClickOnAdminBox) ? "Administrators" : "Users"
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">Liste of `+ TypeTexte + /*html*/`</div>
        <div id="ListOfUser" class="FlexRowCenterSpaceevenly">
            <div class="Text">Get list of `+ TypeTexte + /*html*/`...</div>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // Ajout des des action a ActionButton
        this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
        this._MyCoreXActionButton.AddAction("Add User", this.LoadViewCallForNewUser.bind(this))
        // Get All user
        let Dataofcall = (this._ClickOnAdminBox) ? "Admin" : "User"
        GlobalCallApiPromise("GetAllUser", Dataofcall).then((reponse)=>{
            this.LoadUserList(reponse)
        },(erreur)=>{
            document.getElementById("ListOfUser").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
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
                    element.addEventListener("click", this.LoadViewCallForUserData.bind(this,User._id))
                })
            } else {
                // add event listener
                Users.forEach(User => {
                    let element = document.getElementById(User._id)
                    element.addEventListener("click", this.LoadViewCallForUserData.bind(this,User._id))
            })
            }
        }
    }
    /** Load de la vue qui structure l'ajout d'un nouveau user */
    LoadViewCallForNewUser(){
        this.ClearView()
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">New user</div>
        <div id="ListOfUserDataStructure" class="FlexColumnCenterSpaceAround DivListOfUserData">
            <div class="Text">Get data structure for user...</div>
        </div>
        <div id="ErrorOfUserDataStructure" class="Text" style="color:red; text-align:center;"></div>
        <div class="DivListOfUserData" style="display:flex; flex-direction:row; justify-content:space-around; align-content:center; align-items: center;">
            <button id="ButtonSave" class="Button" style="display: none;">Save</button>
            <button id="ButtonCancel" class="Button" style="display: none;">Cancel</button>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // Ajout des des action a ActionButton
        this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
        this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
        this._MyCoreXActionButton.AddAction("Save User", this.SaveNewUser.bind(this))
        // ajout event onclick
        ButtonSave.onclick = this.SaveNewUser.bind(this)
        ButtonCancel.onclick = this.LoadViewCallForUserList.bind(this)
        // Data for the api Call
        let UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // Call Get user data
        GlobalCallApiPromise("GetUserDataStructure", UserType).then((reponse)=>{
            this.LoadUserDataStrucutre(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            this._MyCoreXActionButton.ClearActionList()
            this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
            this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
            document.getElementById("ListOfUserDataStructure").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
    }
    /* Load de la vue montrant la strucutre des donnes d'un user */
    LoadUserDataStrucutre(Data){
        // Creation de la liste HTML des données du user
        let reponse =""
        Data.forEach(element => {
            reponse += this.UserDataBuilder(element, "")
        })
        document.getElementById("ListOfUserDataStructure").innerHTML = reponse
        document.getElementById("ButtonSave").style.display = "inline"
        document.getElementById("ButtonCancel").style.display = "inline"
    }
    /* Load de la vue qui structure la liste des donnees d'un user */
    LoadViewCallForUserData(UserId){
        this.ClearView()
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">User information</div>
        <div id="ListOfUserData" class="FlexColumnCenterSpaceAround DivListOfUserData">
            <div class="Text">Get data of user...</div>
        </div>
        <div id="ErrorOfUserData" class="Text" style="color:red; text-align:center;"></div>
        <div class="DivListOfUserData" style="display:flex; flex-direction:row; justify-content:space-around; align-content:center; align-items: center;">
            <button id="ButtonSave" class="Button" style="display: none;">Save</button>
            <button id="ButtonCancel" class="Button" style="display: none;">Cancel</button>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // Ajout des des action a ActionButton
        this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
        this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
        this._MyCoreXActionButton.AddAction("Save User", this.UpdateUser.bind(this,UserId))
        this._MyCoreXActionButton.AddAction("Delete User", this.DeleteUser.bind(this,UserId))
        // ajout event onclick
        ButtonSave.onclick = this.UpdateUser.bind(this,UserId)
        ButtonCancel.onclick = this.LoadViewCallForUserList.bind(this)
        // Data for the api Call
        let DataCall = new Object()
        DataCall.UsesrId = UserId
        DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // Call Get user data
        GlobalCallApiPromise("GetUserData", DataCall).then((reponse)=>{
            this.LoadUserData(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            this._MyCoreXActionButton.ClearActionList()
            this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
            this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
            document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
    }
    /* Load de la vue montrant les donnes d'un user */
    LoadUserData(Data){
        // Supprimer les proprietés du user a ne pas afficher
        let UserDataToShow = Data[0]
        delete UserDataToShow._id
        // Creation de la liste HTML des données du user
        let reponse =""
        Object.keys(UserDataToShow).forEach(element => {
            reponse += this.UserDataBuilder(element, UserDataToShow[element])
        })
        document.getElementById("ListOfUserData").innerHTML = reponse
        document.getElementById("ButtonSave").style.display = "inline"
        document.getElementById("ButtonCancel").style.display = "inline"
    }
    /** Construcuteur d'un element html pour une Key et une valeur */
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
    /** Save d'un nouveau user */
    SaveNewUser(){
        document.getElementById("ErrorOfUserDataStructure").innerHTML= ""
        let InputDataValide = true
        // Data for the api Call
        let DataCall = new Object()
        DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
        // selectionner et ajouter tous les input de type CoreXInput dans DataCall
        let AllData = new Object()
        let el = document.querySelectorAll('[data-Input="CoreXInput"]')
        el.forEach(element => {
            AllData[element.name] = element.value
        })
        DataCall.Data = AllData
        // verifier si le user est non vide
        if(document.getElementById("User").value == ""){
            InputDataValide = false
            document.getElementById("ErrorOfUserDataStructure").innerHTML= "User not empty!"
        }
        // verifier si le password est non vide
        if(document.getElementById("Password").value == ""){
            InputDataValide = false
            document.getElementById("ErrorOfUserDataStructure").innerHTML= "Password not empty!"
        }
        // verifier si le password = confirm password
        if(document.getElementById("Password").value != document.getElementById("Confirm-Password").value){
            InputDataValide = false
            document.getElementById("ErrorOfUserDataStructure").innerHTML= "Password not confirmed!"
        }
        // Sit tout les input son valide en envoie les data
        if (InputDataValide){ 
            // afficher le message d'update
            document.getElementById("ListOfUserDataStructure").innerHTML='<div class="Text">Saving user...</div>'
            document.getElementById("ButtonSave").style.display = "none"
            document.getElementById("ButtonCancel").style.display = "none"
            // Call delete user
            GlobalCallApiPromise("NewUser", DataCall).then((reponse)=>{
                this.LoadViewCallForUserList()
            },(erreur)=>{
                // Ajout des des action a ActionButton
                this._MyCoreXActionButton.ClearActionList()
                this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
                this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
                document.getElementById("ListOfUserDataStructure").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
            })
        }
    }
    /* Delete d'un user */
    DeleteUser(UserId){
        if (confirm('Are you sure you want to Dete this User?')){
            document.getElementById("ListOfUserData").innerHTML='<div class="Text">Delete du user...</div>'
            document.getElementById("ButtonSave").style.display = "none"
            document.getElementById("ButtonCancel").style.display = "none"
            // Data for the api Call
            let DataCall = new Object()
            DataCall.UsesrId = UserId
            DataCall.UserType = (this._ClickOnAdminBox) ? "Admin" : "User"
            // Call delete user
            GlobalCallApiPromise("DeleteUser", DataCall).then((reponse)=>{
                this.LoadViewCallForUserList()
            },(erreur)=>{
                // Ajout des des action a ActionButton
                this._MyCoreXActionButton.ClearActionList()
                this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
                this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
                document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
            })
        }
    }
    /* Update d'un user */
    UpdateUser(UserId){
        document.getElementById("ErrorOfUserData").innerHTML= ""
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
            document.getElementById("ButtonSave").style.display = "none"
            document.getElementById("ButtonCancel").style.display = "none"
            // Call delete user
            GlobalCallApiPromise("UpdateUser", DataCall).then((reponse)=>{
                this.LoadViewCallForUserList()
            },(erreur)=>{
                // Ajout des des action a ActionButton
                this._MyCoreXActionButton.ClearActionList()
                this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
                this._MyCoreXActionButton.AddAction("Back", this.LoadViewCallForUserList.bind(this))
                document.getElementById("ListOfUserData").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
            })
        }
    }

    /* Load de la vue qui va appeler le serveur pour recevoir la liste des log */
    LoadViewCallForLog(){
        // Initialisation des variables de type Log
        this._LogCursor = 0
        this._LogIdListe = []
        //this._ClickOnAdminBox = ClickOnAdminBox
        this.ClearView()
        let View = /*html*/`
        <div id="Titre" style="margin-top:4%">Liste of Log</div>
        <div id="ListOfLog" class="FlexColumnCenterSpaceAround">
            <div class="Text">Get list of Log...</div>
        </div>`

        // Ajout de la vue
        this.SetView(View)
        // Ajout des des action a ActionButton
        this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
        // Get All Log
        GlobalCallApiPromise("GetLog", this._LogCursor).then((reponse)=>{
            this.LoadLog(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            this._MyCoreXActionButton.ClearActionList()
            this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
            document.getElementById("ListOfLog").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
    }
    /* CallBAck du Load Log */
    LoadLog(Data){
        let reponse = ""
        if (Data == null) {
            document.getElementById("ListOfLog").innerHTML =/*html*/`<div class="Text">Sorry, no Log stored</div>`
        } else {
            reponse += `<div id="Liste" class="FlexColumnCenterSpaceAround" style="width:90%;">`
            // Creation des box pour chaque Log
            Data.forEach(element => {
                this._LogIdListe.push(element._id)
                if(element.Type == "Error"){
                    reponse += `<div class="FlexRowStartCenter" style="width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;">`
                } else {
                    reponse += `<div class="FlexRowStartCenter" style="width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%;">`
                }
                reponse += `
                    <div class="Text" style="width:20%; margin-right:1%;">` + this.GetDateString(element.Now) + `</div>
                    <div class="Text" style="width:10%;">` + element.Type + `</div>
                    <div class="Text" style="width:65%;">` + element.Valeur + `</div>
                </div>`
            })
            reponse += `</div>`
            reponse += `
                <div class="FlexRowCenterSpaceevenly" style="width:90%; border-top: 1px solid black; margin-top:1%;">
                    <button id="ButtonNext" class="Button">Next</button>
                </div>`
            // ajout des user dans l'interface
            document.getElementById("ListOfLog").innerHTML = reponse
            // ajout event onclick
            ButtonNext.onclick = this.GetNextLog.bind(this)
        }
    }
    /** Get Date Formated */
    GetDateString(StringNow){
        var Now = new Date(StringNow)
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
    /** Get des next log */
    GetNextLog(){
        this._LogCursor += 10
        document.getElementById("ButtonNext").innerHTML = "Waiting..."
        GlobalCallApiPromise("GetLog", this._LogCursor).then((reponse)=>{
            this.LoadNextLog(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            this._MyCoreXActionButton.ClearActionList()
            this._MyCoreXActionButton.AddAction("Home", this.LoadViewStart.bind(this))
            document.getElementById("ListOfLog").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
    }
    /** Load des next log */
    LoadNextLog(Data){
        document.getElementById("ButtonNext").innerHTML = "Next"
        let reponse = ""
        if (Data == null) {
            document.getElementById("Liste").insertAdjacentHTML('beforeend', /*html*/`<div class="FlexRowCenterSpaceevenly" style="width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;">Sorry, end of log</div>`)
            document.getElementById("ButtonNext").style.visibility = 'hidden'
        } else {
            Data.forEach(element => {
                if (!this._LogIdListe.includes(element._id)){
                    this._LogIdListe.push(element._id)
                    if(element.Type == "Error"){
                        reponse += `<div class="FlexRowStartCenter" style="width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;">`
                    } else {
                        reponse += `<div class="FlexRowStartCenter" style="width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%;">`
                    }
                    reponse += `
                        <div class="Text" style="width:20%; margin-right:1%;">` + this.GetDateString(element.Now) + `</div>
                        <div class="Text" style="width:10%;">` + element.Type + `</div>
                        <div class="Text" style="width:65%;">` + element.Valeur + `</div>
                    </div>`
                }
            })
            document.getElementById("Liste").insertAdjacentHTML('beforeend',reponse)
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
                padding: 3px;
            }
            /* Conteneur de bloc use */
            .UserConteneur{
                border: 1px solid black;
                border-radius: 5px;
                width: 35vw;
                height: 5vw;
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
            .DivListOfUserData {
                width: 70%;
                margin: auto;
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
            .FlexRowStartCenter{
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-content: center;
                align-items: center;
            }
            /*Boutton*/
            .Button{
                margin: 4vh 0vh 1vh 0vh;
                padding: 1vh 2vh 1vh 2vh;
                cursor: pointer;
                border: 1px solid var(--CoreX-color);
                border-radius: 20px;
                text-align: center;
                display: inline-block;
                font-size: var(--CoreX-font-size);
                box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
                color: rgb(44,1,21);
                background: white;
                outline: none;
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
                    height: 15vw;
                    margin: 2%;
                }
                .UserImg{max-height: 20vw;}
                .DivListOfUserData{width: 100%;}
                .Input {
                    width: 65%;
                    font-size: var(--CoreX-Iphone-font-size);
                    border-bottom: solid 1px #dcdcdc;
                }
                .InputKey {width:30%;}
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
                    height: 50px;
                }
                .UserImg{max-height: 120px;}
                .DivListOfUserData{width: 800px;}
                .Input {font-size: var(--CoreX-Max-font-size);}
                .Button{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>`
    }

    /*
    **  Images
    */
    /* Image du Box Admin */
    GetImageAdmin(){
        return "data:image/png;base64,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"
    }
    /* Image fu Box User */
    GetImageUser(){
        return "data:image/png;base64,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"
    }
    /** Image du Box log */
    GetImageLog(){
        return "data:image/png;base64,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"
    }
}

// Lancement de l'application Admin
let MyAdminApp = new CoreXAdminApp()
MyAdminApp.RenderSart()
