/** Bouton Action en haut a droite */
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
    /** Click on CoreXActionButton */
    OnClickCoreXActionButton(){
        var Div = document.createElement("div")
        Div.setAttribute("style","width: 70%; margin: 0px auto 0px auto; display: -webkit-flex; -webkit-flex-flow: column wrap; display: flex; flex-flow: column wrap; justify-content: center; padding: 1%;")
        // Ajout de tous les boutons
        if (this._ActionList.length != 0){
            this._ActionList.forEach(element => {
                Div.appendChild(this.GetTemplateActionBoutton(element.Titre, element.Fct))
            })
            var DivLine = document.createElement("div")
            DivLine.setAttribute("style","height: 20px;")
            Div.appendChild(DivLine)
            Div.appendChild(this.GetTemplateActionImagesButton())
        } else {
            Div.appendChild(this.GetTemplateActionBoutton("Logout", GlobalLogout))
            Div.appendChild(this.GetTemplateActionBoutton("User Configuration",  CoreXWindowUserConfig.BuildWindow))
        }
        
        CoreXWindow.BuildWindow(Div)
        this.HideActionButton()
    }
    /** Template d'un bouton Action */
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
    /** Template d'un bouton image logout */
    GetTemplateActionImagesButton(){
        // Bouton Logout sous forme d'image
        const LogoutSvg = "PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8bWV0YWRhdGE+IFN2ZyBWZWN0b3IgSWNvbnMgOiBodHRwOi8vd3d3Lm9ubGluZXdlYmZvbnRzLmNvbS9pY29uIDwvbWV0YWRhdGE+CjxnPjxwYXRoIGQ9Ik03NTcuNSwxNTIuMWMzMC4xLDIyLDU2LjksNDYuOCw4MC4zLDc0LjZjMjMuNCwyNy44LDQzLjUsNTcuOCw2MC4yLDkwLjFjMTYuNywzMi4zLDI5LjQsNjYuNCwzOC4xLDEwMi40YzguNywzNiwxMy4xLDcyLjYsMTMuMSwxMDkuNmMwLDYzLjgtMTEuOSwxMjMuNy0zNS42LDE3OS42Yy0yMy43LDU1LjktNTUuOSwxMDQuNy05Ni40LDE0Ni4yYy00MC41LDQxLjUtODgsNzQuNS0xNDIuNSw5OC44QzYyMC4xLDk3Ny44LDU2MS43LDk5MCw0OTkuNSw5OTBjLTYxLjYsMC0xMTkuNi0xMi4yLTE3NC4xLTM2LjVjLTU0LjUtMjQuNC0xMDIuMi01Ny4zLTE0My05OC44Yy00MC44LTQxLjUtNzIuOS05MC4zLTk2LjQtMTQ2LjJjLTIzLjQtNTUuOS0zNS4xLTExNS44LTM1LjEtMTc5LjZjMC0zNi40LDQuMi03Mi4xLDEyLjYtMTA3LjFjOC40LTM1LDIwLjItNjguMywzNS42LTk5LjhjMTUuNC0zMS42LDM0LjUtNjEuMSw1Ny4yLTg4LjVjMjIuOC0yNy41LDQ4LjItNTIuMiw3Ni4zLTc0LjFjMTQuNy0xMSwzMC42LTE1LjEsNDcuNy0xMi40YzE3LjEsMi43LDMwLjksMTEuMyw0MS43LDI1LjdjMTAuNywxNC40LDE0LjcsMzAuNSwxMiw0OC40Yy0yLjcsMTcuOC0xMSwzMi4zLTI1LjEsNDMuMmMtNDIuMiwzMS42LTc0LjQsNzAuMy05Ni45LDExNi4zYy0yMi40LDQ2LTMzLjYsOTUuNC0zMy42LDE0OC4yYzAsNDUuMyw4LjQsODgsMjUuMSwxMjguMmMxNi43LDQwLjEsMzkuNiw3NS4xLDY4LjgsMTA1YzI5LjEsMjkuOSw2My4yLDUzLjUsMTAyLjQsNzFjMzkuMSwxNy41LDgwLjgsMjYuMywxMjUsMjYuM2M0NC4yLDAsODUuOC04LjgsMTI1LTI2LjNjMzkuMS0xNy41LDczLjMtNDEuMiwxMDIuNC03MWMyOS4xLTI5LjksNTIuMi02NC45LDY5LjMtMTA1YzE3LjEtNDAuMiwyNS42LTgyLjksMjUuNi0xMjguMmMwLTUzLjUtMTItMTA0LjEtMzYuMS0xNTEuOGMtMjQuMS00Ny43LTU3LjktODctMTAxLjQtMTE3LjljLTE0LjctMTAuMy0yMy42LTI0LjQtMjYuNi00Mi4yYy0zLTE3LjksMC41LTM0LjMsMTAuNS00OS40YzEwLTE0LjQsMjMuOC0yMy4yLDQxLjItMjYuMkM3MjYuNywxMzguMiw3NDIuNywxNDEuOCw3NTcuNSwxNTIuMUw3NTcuNSwxNTIuMXogTTQ5OS41LDUzMS45Yy0xNy40LDAtMzIuMy02LjMtNDQuNy0xOWMtMTIuNC0xMi43LTE4LjYtMjgtMTguNi00NS44Vjc1LjljMC0xNy44LDYuMi0zMy4zLDE4LjYtNDYuM2MxMi40LTEzLDI3LjMtMTkuNiw0NC43LTE5LjZjMTguMSwwLDMzLjMsNi41LDQ1LjcsMTkuNmMxMi40LDEzLDE4LjYsMjguNSwxOC42LDQ2LjN2MzkxLjJjMCwxNy44LTYuMiwzMy4xLTE4LjYsNDUuOEM1MzIuOCw1MjUuNiw1MTcuNiw1MzEuOSw0OTkuNSw1MzEuOUw0OTkuNSw1MzEuOXoiLz48L2c+Cjwvc3ZnPg=="
        const UserConfigSvg = "PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyOCAxMjg7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0RjRGNEY7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjY0IiBjeT0iNjQiIHI9IjY0Ii8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTc3LjQsNzUuM2MtMi0wLjMtMy40LTEuOS0zLjQtMy45di01LjhjMi4xLTIuMywzLjUtNS4zLDMuOC04LjdsMC4yLTMuMmMxLjEtMC42LDIuMi0yLDIuNy0zLjggIGMwLjctMi41LDAuMS00LjctMS41LTQuOWMtMC4yLDAtMC40LDAtMC43LDBsMC40LTUuOUM3OS42LDMwLjksNzMuMywyNCw2NS4zLDI0aC0yLjVjLTgsMC0xNC4zLDYuOS0xMy44LDE1LjFsMC40LDYgIEM0OS4yLDQ1LDQ5LDQ1LDQ4LjgsNDVjLTEuNiwwLjItMi4yLDIuNC0xLjUsNC45YzAuNSwxLjksMS43LDMuMywyLjgsMy45bDAuMiwzLjFjMC4yLDMuNCwxLjYsNi40LDMuNyw4Ljd2NS44YzAsMi0xLjQsMy42LTMuNCwzLjkgIEM0MS44LDc2LjgsMjcsODMuMiwyNyw5MHYxNGg3NFY5MEMxMDEsODMuMiw4Ni4yLDc2LjgsNzcuNCw3NS4zeiIvPjwvc3ZnPg=="
        var Div = document.createElement("div")
        Div.setAttribute("style","display: flex; flex-direction: row; align-items: center; justify-content: space-evenly; align-content: center;")
        var ButtonLogout = document.createElement("button")
        ButtonLogout.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonLogout.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); GlobalLogout()})
        ButtonLogout.innerHTML = '<img src="data:image/svg+xml;base64,' + LogoutSvg + '" height="100%" width="100%">'

        var ButtonUserConfig = document.createElement("button")
        ButtonUserConfig.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonUserConfig.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); CoreXWindowUserConfig.BuildWindow()})
        ButtonUserConfig.innerHTML = '<img src="data:image/svg+xml;base64,' + UserConfigSvg + '" height="100%" width="100%">'

        Div.appendChild(ButtonLogout)
        Div.appendChild(ButtonUserConfig)
        return Div
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
            height: 5%;
        }
        .CoreXActionButtonButton:hover{
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
        }
        .CoreXActionButtonImageButton{
            width:10%;
            padding: 0px;
            cursor: pointer;
            border: 0px solid black;
            background-color: white;
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
            height: 5VW;
            width: 5VW;
        }
        .CoreXActionMenuButton:hover,
        .CoreXActionMenuButton:active{opacity: 1;}
        @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
        only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
        screen and (max-width: 700px)
        {
            .CoreXActionButtonButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px; height: 12VW;}
            .CoreXActionButtonImageButton{width:10%;}
            .CoreXActionMenuButton{font-size: var(--CoreX-Iphone-font-size);height: 10VW; width: 10VW;}
        }
        @media screen and (min-width: 1200px)
        {
            .CoreXActionButtonButton {font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            .CoreXActionButtonImageButton{width:33px;}
            .CoreXActionMenuButton {font-size: var(--CoreX-Max-font-size);}
        }
        </style>
        `
    }
    /** Clear de liste des actions */
    ClearActionList(){
        this._ActionList=[]
    }
    /** Add action a la liste des actions */
    AddAction(Titre, Fct){
        let action = new Object()
        action.Titre = Titre
        action.Fct = Fct
        this._ActionList.push(action)
    }
}

/** Fenetre centree vide */
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
                .CoreXWindowCloseButton{width:10%;}
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

/** Fenetre pour la gestion de la config d'un user */
class CoreXWindowUserConfig{
    constructor(){
    }
    /** Construction d'un fenetre */
    static BuildWindow() {
        var winH = window.innerHeight
        var divInputScreenTop = (winH/12)  + "px"
        var divInputScreenMaxHeight = winH - 2*(winH/10)  + "px"
        var CSS =/*html*/`
            <style>
            .Text{font-size: var(--CoreX-font-size);}
            #CoreXWindowScreen{
                width:80%;
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
            .CoreXWindowUserConfigButton{
                margin: 2% 2% 2% 2%;
                padding: 1vh;
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
                background-color:white; 
                width: 20%;
            }
            .CoreXWindowUserConfigButton:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }
            .FlexRowLeftCenter{
                display: flex;
                flex-direction: row;
                justify-content : left;
                align-items: center;
                align-content:center;
            }
            .InputKey{
                color: gray; 
                width:25%; 
                margin:1%; 
                text-align:right;
            }
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
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                .Text{font-size: var(--CoreX-Iphone-font-size);}
                #CoreXWindowScreen{width: 90%;}
                .CoreXWindowUserConfigButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
                .InputKey {width:30%;}
                .Input {
                    width: 65%;
                    font-size: var(--CoreX-Iphone-font-size);
                    border-bottom: solid 1px #dcdcdc;
                }
            }
            @media screen and (min-width: 1200px)
            {
                .Text{font-size: var(--CoreX-Max-font-size);}
                #CoreXWindowScreen{width: 1000px;}
                .CoreXWindowUserConfigButton {font-size: var(--CoreX-Max-font-size); border-radius: 40px; width: 200px;}
                .Input {font-size: var(--CoreX-Max-font-size);}
            }
            </style>`

        var el = document.createElement("div")
        el.setAttribute("id", "CoreXWindowUserConfig")
        el.innerHTML = CSS

        var Div1 = document.createElement("div")
        Div1.setAttribute("style", "display: block; position: fixed; top: 0px; left: 0px; background-color: rgb(230,230,230, 0.8); width: 100%; height: 100%; z-index: 10;")
        el.appendChild(Div1)

        var Div2 = document.createElement("div")
        Div2.setAttribute("id", "CoreXWindowScreen")
        Div2.setAttribute("style","top: " + divInputScreenTop + "; max-height: " + divInputScreenMaxHeight + ";")
        Div1.appendChild(Div2)

        var DivData = document.createElement("div")
        DivData.setAttribute("id", "CoreXWindowUserConfigData")

        var DivWaitingText = document.createElement("div")
        DivWaitingText.setAttribute("id", "CoreXWindowUserConfigWaitingText")
        DivWaitingText.setAttribute("style","display:flex; flex-direction:column; justify-content:space-around; align-content:center; align-items: center;")
        DivWaitingText.innerHTML = "Get User Data..."
        DivData.appendChild(DivWaitingText)
        
        Div2.appendChild(DivData)

        var DivErrorTxt = document.createElement("div")
        DivErrorTxt.setAttribute("id", "ErrorOfMyUserData")
        DivErrorTxt.setAttribute("class", "Text")
        DivErrorTxt.setAttribute("style", "color:red; text-align:center;")
        Div2.appendChild(DivErrorTxt)

        var DivButton = document.createElement("div")
        DivButton.setAttribute("style","display:flex; flex-direction:row; justify-content:space-around; align-content:center; align-items: center;")
        
        var ButtonUpdate = document.createElement("button")
        ButtonUpdate.setAttribute("id", "ButtonUpdateMyData")
        ButtonUpdate.setAttribute("class", "CoreXWindowUserConfigButton")
        ButtonUpdate.setAttribute("style", "display: none;")
        ButtonUpdate.addEventListener("click", ()=>{CoreXWindowUserConfig.UpdateMyData()})
        var DivButtonUpdateStruct1 = document.createElement("div")
        DivButtonUpdateStruct1.setAttribute("style", "display: flex; flex-direction: row; align-items: center; justify-content: center; align-content: center;")
        ButtonUpdate.appendChild(DivButtonUpdateStruct1)
        var DivButtonUpdateStruct2 = document.createElement("div")
        DivButtonUpdateStruct2.innerHTML = "Update"
        DivButtonUpdateStruct1.appendChild(DivButtonUpdateStruct2)

        var ButtonClose = document.createElement("button")
        ButtonClose.setAttribute("class", "CoreXWindowUserConfigButton")
        ButtonClose.addEventListener("click", ()=>{CoreXWindowUserConfig.DeleteWindow()})
        var DivButtonCloseStruct1 = document.createElement("div")
        DivButtonCloseStruct1.setAttribute("style", "display: flex; flex-direction: row; align-items: center; justify-content: center; align-content: center;")
        ButtonClose.appendChild(DivButtonCloseStruct1)
        var DivButtonCloseStruct2 = document.createElement("div")
        DivButtonCloseStruct2.innerHTML = "Close"
        DivButtonCloseStruct1.appendChild(DivButtonCloseStruct2)

        DivButton.appendChild(ButtonUpdate)
        DivButton.appendChild(ButtonClose)
        Div2.appendChild(DivButton)

        document.body.appendChild(el)

        // Call Api GetMyData
        GlobalCallApiPromise("GetMyData", "").then((reponse)=>{
            CoreXWindowUserConfig.LoadUserData(reponse)
            document.getElementById("ButtonUpdateMyData").style.display = "inline"
        },(erreur)=>{
            document.getElementById("CoreXWindowUserConfigWaitingText").innerHTML='<div class="Text" style="color:red;">' + erreur + '</div>'
        })
    }
    /** Suppression de la fenetre */
    static DeleteWindow() {
        let divWindow = document.getElementById("CoreXWindowUserConfig")
        divWindow.parentNode.removeChild(divWindow)
    }
    /** Load de la vue montrant les donnes d'un user */
    static LoadUserData(Data){
        // Supprimer les proprietés du user a ne pas afficher
        let UserDataToShow = Data[0]
        // Creation de la liste HTML des données du user
        let reponse =""
        Object.keys(UserDataToShow).forEach(element => {
            reponse += CoreXWindowUserConfig.UserDataBuilder(element, UserDataToShow[element])
        })
        document.getElementById("CoreXWindowUserConfigData").innerHTML = reponse
    }
    /** Construcuteur d'un element html pour une Key et une valeur */
    static UserDataBuilder(Key, Value){
        let reponse =""
        switch (Key) {
            case "Password":
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXMyUserDataInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="password" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break
            case "Confirm-Password":
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXMyUserDataInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="password" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break;
            default:
                // input de type texte
                reponse = /*html*/`
                <div class="FlexRowLeftCenter" style="width:90%;">
                    <div class="Text InputKey">`+ Key.replace("-", " ") + " :" + /*html*/`</div>
                    <input data-Input="CoreXMyUserDataInput" id="`+ Key + /*html*/`" value="`+ Value + /*html*/`" class="Input" type="text" name="`+ Key + /*html*/`" placeholder=""> 
                </div>`
                break
        }
        return reponse
    }
    /** Update Data of user */
    static UpdateMyData(){
        document.getElementById("ErrorOfMyUserData").innerHTML= ""
        let InputDataValide = true
        // selectionner et ajouter tous les input de type CoreXMyUserDataInput
        let AllData = new Object()
        let el = document.querySelectorAll('[data-Input="CoreXMyUserDataInput"]')
        el.forEach(element => {
            AllData[element.name] = element.value
        })
        // verifier si le password = confirm password
        if(document.getElementById("Password").value != document.getElementById("Confirm-Password").value){
            InputDataValide = false
            document.getElementById("ErrorOfMyUserData").innerHTML= "Password not confirmed!"
        }
        // Sit tout les input son valide en envoie les data
        if (InputDataValide){
            // afficher le message d'update
            document.getElementById("CoreXWindowUserConfigData").innerHTML='<div class="Text" style="text-align: center;">Update du user...</div>'
            // Call delete user
            GlobalCallApiPromise("UpdateMyUser", AllData).then((reponse)=>{
                CoreXWindowUserConfig.DeleteWindow()
            },(erreur)=>{
                document.getElementById("CoreXWindowUserConfigData").innerHTML='<div class="Text" style="color:red; text-align: center;">' + erreur + '</div>'
            })
        }
    }
}