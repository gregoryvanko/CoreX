class CoreXAdminApp{
    constructor(){
        this._HtmlIdApp = "AdminApp"
    }
    
    /* Render de l'application */
    RenderSart(){
        document.body.innerHTML = this.GetCss() + '<div id="' + this._HtmlIdApp + '"></div>'
        this.LoadViewStart()
    }

    /* Load de la start page de l'app admin */
    LoadViewStart(){
        let View = /*html*/`
        <div style="display: flex; flex-direction: column; justify-content:space-between; align-content:center; align-items: center;">
            <div id="Titre">Admin Application</div>
        </div>`
        document.getElementById(this._HtmlIdApp).innerHTML = View
    }

    /* Get all css tag for admin */
    GetCss(){
        return /*html*/`
        <style>
            /*Titre*/
            #Titre{
                margin: 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
            }
            @media screen and (min-width: 1200px)
            {
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
            }
        </style>`
    }
}

let MyAdminApp = new CoreXAdminApp()
MyAdminApp.RenderSart()
