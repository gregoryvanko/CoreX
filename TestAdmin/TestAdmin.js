class TestCoreXAdminApp{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        document.getElementById(this._HtmlId).innerHTML = ""
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        // Add CSS
        this._DivApp.innerHTML = this.GetCss()
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("New Titre", "Titre", "", "margin-top:4%"))
        this._DivApp.appendChild(CoreXBuild.DivTexte("New Texte", "", "Text", ""))

        GlobalAddActionInList("Test 1", this.ClickTestButton.bind(this))
    }
    ClickTestButton(){
        GlobalCallApiPromise("Test", "TestData").then((reponse)=>{
            alert(reponse)
        },(erreur)=>{
            alert(erreur)
        })
    }
    GetTitre(){
        return "AdminApp"
    }
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTI1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTI1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6YmxhY2s7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02MC4xLDE0Ljl2MTEuOGMxMi44LDQsMjIsMTYsMjIsMzAuMWMwLDE3LjQtMTQuMSwzMS41LTMxLjUsMzEuNWMtMTcuNCwwLTMxLjUtMTQuMS0zMS41LTMxLjUKCQljMC0xNC4xLDkuMy0yNiwyMi0zMC4xVjE0LjlDMjIsMTkuMyw3LjcsMzYuNCw3LjcsNTYuOGMwLDIzLjcsMTkuMyw0Mi45LDQyLjksNDIuOWMyMy43LDAsNDIuOS0xOS4zLDQyLjktNDIuOQoJCUM5My42LDM2LjQsNzkuMywxOS4zLDYwLjEsMTQuOXoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01MC42LDYyLjVjMy4xLDAsNS43LTIuNiw1LjctNS43VjUuN2MwLTMuMS0yLjYtNS43LTUuNy01LjdjLTMuMSwwLTUuNywyLjYtNS43LDUuN3Y1MS4xCgkJQzQ0LjksNjAsNDcuNSw2Mi41LDUwLjYsNjIuNXoiLz4KPC9nPgo8L3N2Zz4K"
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

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
                .Text{font-size: var(--CoreX-Iphone-font-size);}
            }
            @media screen and (min-width: 1200px)
            {
                .DivContent{width: 1100px;}
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
                .Text{font-size: var(--CoreX-Max-font-size);}
            }
        </style>`
    }
}

// Creation de l'application 1
let AdminApp1 = new TestCoreXAdminApp(GlobalCoreXGetAppContentId())

// Ajout de l'application 1
GlobalCoreXAddApp(AdminApp1.GetTitre(), AdminApp1.GetImgSrc(),AdminApp1.Start.bind(AdminApp1))
