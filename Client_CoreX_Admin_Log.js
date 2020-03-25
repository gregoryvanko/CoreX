class CoreXAdminLogApp{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
        this._LogCursor = 0
        this._LogIdListe = []
    }
    /** Start de l'application */
    Start(){
        // Initialisation des variables de type Log
        this._LogCursor = 0
        this._LogIdListe = []
        // Clear view
        document.getElementById(this._HtmlId).innerHTML = ""
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        // Add CSS
        this._DivApp.innerHTML = this.GetCss()
        // Global action
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Liste of logs", "Titre", "", "margin-top:4%"))
        // Liste of log
        let ListOflog = CoreXBuild.Div("ListOfLog", "FlexColumnCenterSpaceAround", "")
        this._DivApp.appendChild(ListOflog)
        // Waiting text
        ListOflog.appendChild(CoreXBuild.DivTexte("Get list of Log...", "", "Text",""))
        // Get All Log
        GlobalCallApiPromise("GetLog", this._LogCursor).then((reponse)=>{
            this.LoadLog(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            GlobalClearActionList()
            GlobalAddActionInList("Refresh", this.Start.bind(this))
            document.getElementById("ListOfLog").innerHTML=""
            document.getElementById("ListOfLog").appendChild(CoreXBuild.DivTexte(erreur,"","Text","color:red;"))
        })
    }
    GetTitre(){
        return "Log"
    }
    GetImgSrc(){
        return "data:image/png;base64,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"
    }

    /* CallBAck du Load Log */
    LoadLog(Data){
        document.getElementById("ListOfLog").innerHTML =""
        if (Data == null) {
            document.getElementById("ListOfLog").appendChild(CoreXBuild.DivTexte("Sorry, no Log stored", "", "Text", ""))
        } else {
            let Liste = CoreXBuild.Div("Liste", "FlexColumnCenterSpaceAround", "width:90%;")
            document.getElementById("ListOfLog").appendChild(Liste)
            // Creation des box pour chaque Log
            Data.forEach(element => {
                this._LogIdListe.push(element._id)
                let flex = null
                if(element.Type == "Error"){
                    flex = CoreXBuild.Div("", "FlexRowStartCenter", "width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;")
                } else {
                    flex = CoreXBuild.Div("", "FlexRowStartCenter", "width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%;")
                }
                Liste.appendChild(flex)

                flex.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateTimeString(element.Now),"", "Text", "width:20%; margin-right:1%;"))
                flex.appendChild(CoreXBuild.DivTexte(element.Type,"", "Text", "width:10%;"))
                flex.appendChild(CoreXBuild.DivTexte(element.Valeur,"", "Text", "width:65%;"))
            })
            let DivButton = CoreXBuild.Div("", "FlexRowCenterspacearound", "width:90%; border-top: 1px solid black; margin-top:1%;")
            document.getElementById("ListOfLog").appendChild(DivButton)
            DivButton.appendChild(CoreXBuild.Button("Next",this.GetNextLog.bind(this),"Button", "ButtonNext"))
        }
    }
    /** Get des next log */
    GetNextLog(){
        this._LogCursor += 10
        document.getElementById("ButtonNext").innerHTML = "Waiting..."
        GlobalCallApiPromise("GetLog", this._LogCursor).then((reponse)=>{
            this.LoadNextLog(reponse)
        },(erreur)=>{
            // Ajout des des action a ActionButton
            GlobalClearActionList()
            GlobalAddActionInList("Refresh", this.Start.bind(this))
            document.getElementById("ListOfLog").innerHTML=""
            document.getElementById("ListOfLog").appendChild(CoreXBuild.DivTexte(erreur,"","Text","color:red;"))
        })
    }
    /** Load des next log */
    LoadNextLog(Data){
        document.getElementById("ButtonNext").innerHTML = "Next"
        if (Data == null) {
            document.getElementById("Liste").appendChild(CoreXBuild.DivTexte("End of log", "", "FlexRowCenterspacearound", "width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;"))
            document.getElementById("ButtonNext").style.visibility = 'hidden'
        } else {
            Data.forEach(element => {
                if (!this._LogIdListe.includes(element._id)){
                    this._LogIdListe.push(element._id)
                    let flex = null
                    if(element.Type == "Error"){
                        flex = CoreXBuild.Div("", "FlexRowStartCenter", "width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%; color:red;")
                    } else {
                        flex = CoreXBuild.Div("", "FlexRowStartCenter", "width:100%; border-top: 1px solid black; padding-top: 1%; margin-top:1%;")
                    }
                    document.getElementById("Liste").appendChild(flex)

                    flex.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateTimeString(element.Now),"", "Text", "width:20%; margin-right:1%;"))
                    flex.appendChild(CoreXBuild.DivTexte(element.Type,"", "Text", "width:10%;"))
                    flex.appendChild(CoreXBuild.DivTexte(element.Valeur,"", "Text", "width:65%;"))
                }
            })
        }
    }

    /** Css de l'application */
    GetCss(){
        return /*html*/`
        <style>
            .DivContent{
                padding: 1px;
                margin: 20px auto 10px auto;
                width: 96%;
                margin-left: auto;
                margin-right: auto;
            }
            #Titre{
                margin: 1% 1% 4% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .Text{font-size: var(--CoreX-font-size);}
            .FlexColumnCenterSpaceAround{
                display: flex;
                flex-direction: column;
                justify-content:space-around;
                align-content:center;
                align-items: center;
            }
            .FlexRowCenterspacearound{
                display: flex;
                flex-direction: row;
                justify-content:space-around;
                align-content:center;
                align-items: center;
                flex-wrap: wrap;
            }
            .FlexRowStartCenter{
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-content: center;
                align-items: center;
            }
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
                .Button{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
            }
            @media screen and (min-width: 1200px)
            {
                .DivContent{width: 1100px;}
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
                .Text{font-size: var(--CoreX-Max-font-size);}
                .Button{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>`
    }
}