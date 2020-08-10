/** Core de la gestion d'un application par page */
class CoreXApp{
    constructor(AppIsSecured, Usesocketio){
        this._AppIsSecured = AppIsSecured
        this._Usesocketio = Usesocketio
        this._ContentAppId = "CoreXAppContent"
        this._MyCoreXActionButton = new CoreXActionButton(this._AppIsSecured)
        this._MyCoreXActionButton.Start()
        this._ListApplications = new Array()
        document.body.appendChild(CoreXBuild.Div(this._ContentAppId,"CoreXAppContent"))
        // if Use Socketio
        this._CoreXSocketIo = null
        if (this._Usesocketio){
            this._CoreXSocketIo = new CoreXSocketIo()
            this._CoreXSocketIo.Init()
        }
    }

    /** Get Set */
    get ContentAppId(){return this._ContentAppId}
    set ContentAppId(NewContentAppId){this._ContentAppId = NewContentAppId}
    get SocketIo(){return this._CoreXSocketIo.SocketIo}

    /** Vider la vue actuelle */
    ClearView(){
        document.getElementById(this._ContentAppId).innerHTML = ""
        this.ClearActionList()
    }

    /** Load de la vue Start de l'application */
    Start(){
        // Si on utilise les SocketIo, on efface tous les message listener
        if(this._Usesocketio){
            let SocketIo = GlobalGetSocketIo()
            SocketIo.off()
            this._CoreXSocketIo.InitSocketIoMessage()
        }
        // Clear de la page start
        this.ClearView()
        // Ajout du CSS
        document.getElementById(this._ContentAppId).innerHTML = this.GetCss()
        // Div content de la page start
        let DivContent = CoreXBuild.DivFlexColumn()
        document.getElementById(this._ContentAppId).appendChild(DivContent)
        // Titre de la page
        DivContent.appendChild(CoreXBuild.DivTexte(document.title,"", "Titre", ""))
        // Container des pages
        let DivContainerCommand = CoreXBuild.Div("","ContainerCommand","")
        DivContent.appendChild(DivContainerCommand)
        // Flex container
        let DivFlexContainerCommand = CoreXBuild.DivFlexRowAr()
        DivContainerCommand.appendChild(DivFlexContainerCommand)
        // afficher toutes les pages
        if (this._ListApplications.length == 0){
            DivFlexContainerCommand.appendChild(CoreXBuild.DivTexte("No Application defined","", "Text", ""))
        } else {
            // si il y a une seule application, on la demarre
            if (this._ListApplications.length ==1){
                this.ClickAppCard(this._ListApplications[0].Start)
            } else {
                this._ListApplications.forEach(element => {
                    DivFlexContainerCommand.appendChild(this.BuildAppCard(element.Titre, element.ImgSrc, element.Start))
                })
            }
        }
        // Set Display Action to Toggle
        this.SetDisplayAction("Toggle")
    }
    /** Build AppCard */
    BuildAppCard(Titre, Src, Start){
        if(!Titre){Titre = "No Name"}
        if(!Src){Src = this.GetNoImgSrc()}
        let element = CoreXBuild.Div("", "ImageConteneur", "display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center;")
        let Contentimg = CoreXBuild.Image64(Src,"","ImgAppCard","")
        element.appendChild(Contentimg)
        let ContentTxt = CoreXBuild.DivTexte(Titre, "", "Text", "")
        element.appendChild(ContentTxt)
        element.addEventListener("click", this.ClickAppCard.bind(this,Start))
        return element
    }
    /** Click on a AppCard */
    ClickAppCard(Start){
        this.ClearView()
        Start()
    }

    /** Add une application*/
    AddApp(Titre, ImgSrc, Start){
        let App = new Object()
        App.Titre = Titre
        App.ImgSrc = ImgSrc
        App.Start = Start
        this._ListApplications.push(App)
    }

    /** Set Display Action Button */
    SetDisplayAction(Type){
        this._MyCoreXActionButton.SetDisplayAction(Type)
    }

    /** Css de base de l'application */
    GetCss(){
        return /*html*/`
        <style>
        .Titre{
            margin: 1% 1% 4% 1%;
            font-size: var(--CoreX-Titrefont-size);
            color: var(--CoreX-color);
        }
        .ContainerCommand{width: 100%;}
        .Text{font-size: var(--CoreX-font-size);}
        .ImageConteneur{
            border: 1px solid black;
            border-radius: 5px;
            width: 14vw;
            height: 14vw;
            cursor: pointer;
            padding: 3px;
            margin: 4px;
        }
        .ImageConteneur:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }
        .ImgAppCard{
            max-width: 100%;
            display: block;
            margin-left: auto;
            margin-right: auto;
            max-height: 10vw;
            border: 0px solid grey;
            border-radius: 5px;
            flex: 0 0 auto;
        }

        @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
        only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
        screen and (max-width: 700px)
        {
            .Titre{font-size: var(--CoreX-TitreIphone-font-size);}
            .ContainerCommand{width: 90%;}
            .Text{font-size: var(--CoreX-Iphone-font-size);}
            .ImageConteneur{
                width: 25vw;
                height: 25vw;
            }
            .ImgAppCard{max-height: 20vw;}
        }

        @media screen and (min-width: 1200px)
        {
            .Titre{font-size: var(--CoreX-TitreMax-font-size);}
            .Text{font-size: var(--CoreX-Max-font-size);}
            .ImageConteneur{
                width: 148px;
                height: 148px;
            }
            .ImgAppCard{max-height: 120px;}
        }
        </style>`
    }

    /** Clear ActionList */
    ClearActionList(){
        this._MyCoreXActionButton.ClearActionList()
        if(this._ListApplications.length >=2){
            this.AddActionInList("Home", this.Start.bind(this))
        }
    }

    /** Add Action in ActionList */
    AddActionInList(Titre, Action){
        this._MyCoreXActionButton.AddAction(Titre, Action)
    }

    /** Get NoImg Src */
    GetNoImgSrc(){
        return "data:image/png;base64,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"
    }
}