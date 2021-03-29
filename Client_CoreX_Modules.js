/** Bouton Action en haut a droite */
class CoreXActionButton{
    constructor(AppIsSecured, ClickOnHome){
        this._AppIsSecured = AppIsSecured
        this._ClickOnHomeFct = ClickOnHome
        this._HtmlId = "AdminCoreXActionButton"
        this._ActionList=[]
        this._lastTap = 0
        this._DisplayType = "Toggle"
    }
    /** Start de l'action button */
    Start(){
        let div = document.createElement("div")
        div.innerHTML = this.GetCss()

        let Button = document.createElement("button")
        Button.setAttribute("id", this._HtmlId)
        Button.setAttribute("style", "right: 0px; display: inline; z-index: 999")
        Button.setAttribute("class", "CoreXActionMenuButton")
        //Button.innerHTML = "&#9733"
        Button.innerHTML = "&#x2630"
        Button.addEventListener("click", this.OnClickCoreXActionButton.bind(this))
        Button.addEventListener("mouseover", this.OnMouseOverCoreXActionButton.bind(this))
        Button.addEventListener("mouseout", this.OnMouseOutCoreXActionButton.bind(this))
        div.appendChild(Button)
        document.body.appendChild(div)
        document.addEventListener("touchstart", this.DoubleTouchEventFct.bind(this))
    }
    /** Détection d'un double tap sur l'écran */
    DoubleTouchEventFct(){
        if (this._DisplayType == "Toggle"){
            if (document.getElementById(this._HtmlId)) {
                let currentTime = new Date().getTime()
                let tapLength = currentTime - this._lastTap
                if (tapLength < 500 && tapLength > 0) {
                    if (document.getElementById(this._HtmlId).style.opacity == "1") {
                        document.getElementById(this._HtmlId).style.opacity = "0"
                    } else {
                        document.getElementById(this._HtmlId).style.opacity = "1"
                    }
                } 
                this._lastTap = currentTime
            } else {
                console.log(this._HtmlId + " n'existe pas dans la fonction DoubleTouchEventFct")
            }
        }
    }
    /** Hide action Button */
    HideActionButton(){
        if (this._DisplayType == "Toggle"){
            if (document.getElementById(this._HtmlId)) {
                if (document.getElementById(this._HtmlId).style.opacity == "1") {
                    document.getElementById(this._HtmlId).style.opacity = "0"
                }
            }
        }
    }
    /** Click on CoreXActionButton */
    OnClickCoreXActionButton(){
        if (document.getElementById("CoreXWindow")){
            // Si la fenetre existe deja on supprime la fenetre
            CoreXWindow.DeleteWindow()
        } else {
            // On construit le div de la fenetre
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
            }
            if (this._AppIsSecured){
                Div.appendChild(this.GetTemplateActionImagesButton())
            } else {
                Div.appendChild(this.GetTemplateActionBoutton("Home", this._ClickOnHomeFct))
            }
            // on construit la fenetre
            CoreXWindow.BuildWindow(Div)
            this.HideActionButton()
        }
    }
    /** On Mouse Hover */
    OnMouseOverCoreXActionButton(){
        if (this._DisplayType == "Toggle"){
            if (document.getElementById(this._HtmlId)) {
                document.getElementById(this._HtmlId).style.opacity = "1"
            }
        }
    }
    /** On Mouse Out */
    OnMouseOutCoreXActionButton(){
        if (this._DisplayType == "Toggle"){
            if (document.getElementById(this._HtmlId)) {
                document.getElementById(this._HtmlId).style.opacity = "0"
            }
        }
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
        const GoToAppAdminSvg = "PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMTIwMC4wMDAwMDBwdCIgaGVpZ2h0PSIxMjgwLjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMTIwMC4wMDAwMDAgMTI4MC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KPG1ldGFkYXRhPgpDcmVhdGVkIGJ5IHBvdHJhY2UgMS4xNSwgd3JpdHRlbiBieSBQZXRlciBTZWxpbmdlciAyMDAxLTIwMTcKPC9tZXRhZGF0YT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsMTI4MC4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiCmZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik04NTAwIDEyNzkzIGMtMjAzIC0xOSAtMjUyIC0yNCAtMjY0IC0yOSAtMjEgLTggLTY3IC00MDEgLTg0IC03MTgKbC03IC0xMjkgLTExMCAtMjcgYy02MCAtMTUgLTE0NCAtNDEgLTE4NSAtNTggLTEwNSAtNDMgLTMzNyAtMTU0IC0zOTcgLTE5MQotMjggLTE3IC01MyAtMzEgLTU1IC0zMSAtMyAwIC0xNTEgMTIwIC0zMjkgMjY2IC0xNzggMTQ2IC0zMzAgMjY4IC0zMzYgMjcxCi0yNCAxMCAtMjI5IC0xNjQgLTM4MiAtMzIzIC0xNDcgLTE1MiAtMzE1IC0zNjIgLTMwMyAtMzc3IDQzIC01NyAyMDcgLTI1OQozNDcgLTQyNyA5NCAtMTEzIDE3NSAtMjExIDE3OSAtMjE4IDQgLTggLTkgLTM4IC0zNCAtNzggLTY3IC0xMDYgLTE0NSAtMjcxCi0xODAgLTM3OSAtMTggLTU1IC00MyAtMTMyIC01NiAtMTcyIC0xMyAtMzkgLTI0IC03OCAtMjQgLTg2IDAgLTExIC0xOSAtMTYKLTcyIC0yMSAtMzkwIC0zNiAtNzY1IC03OSAtNzc1IC05MCAtMzEgLTMwIC01MSAtNDMyIC0zNCAtNjQ5IDEyIC0xNTEgMzUKLTMxNSA0NiAtMzI1IDQgLTUgMjk5IC0zNCA3NTcgLTc3IGw3NyAtNyA2IC00MSBjNCAtMjMgMTUgLTYyIDI1IC04NyAxMCAtMjUKMzQgLTk3IDU0IC0xNjEgMzkgLTEyMSAxMjAgLTI5MyAxODcgLTM5MyAyMiAtMzMgMzggLTY1IDM1IC03MyAtMyAtNyAtODMKLTEwNiAtMTc5IC0yMjAgLTI2NCAtMzE2IC0zNDggLTQyMyAtMzQwIC00MzYgMzQgLTYwIDE5NSAtMjQ5IDMwOCAtMzYzIDE0OQotMTUwIDM4MiAtMzQ0IDM5MyAtMzI4IDQgNiA5OSA4NiAyMTIgMTc5IDExMyA5MyAyNTAgMjA3IDMwNSAyNTQgNTUgNDggMTA3CjkyIDExNyA5OSAxNCAxMSAzMyA0IDEzMCAtNTEgMTM0IC03NiAyOTkgLTE0NCA0NTkgLTE4NyA2MyAtMTcgMTIxIC0zNSAxMjcKLTM5IDggLTUgMjMgLTEwOSA0MiAtMzAyIDMwIC0yOTMgNTcgLTUyNCA2NCAtNTQ1IDggLTIxIDMxMCAtMzcgNTY5IC0zMSAyMDYKNSA0MDcgMjQgNDIzIDM5IDIgMyAyMCAxODAgMzkgMzk0IDIwIDIxNCAzOCA0MDQgNDEgNDIyIDYgMzggNCAzNyAxNzcgODggMTQ1CjQzIDMzOCAxMjggNDU1IDIwMSA0NyAzMCA5MCA1MiA5NiA0OSA2IC0yIDY3IC01MiAxMzYgLTExMSAyMzIgLTIwMCA1MjIgLTQyNgo1MzcgLTQyMSAyNyAxMSAxMzggOTYgMjAwIDE1MyAxMjkgMTIwIDQ4MyA1MjEgNDgzIDU0NyAwIDMgLTExNCAxNDEgLTI1MiAzMDcKLTEzOSAxNjUgLTI2MyAzMTMgLTI3NSAzMjggbC0yMiAyNyA1OSAxMTQgYzc5IDE1MSAxNTYgMzQ0IDE4OSA0NzEgbDI2IDEwNAoxODUgMTcgYzEwMiA5IDI5NCAyNyA0MjcgMzkgbDI0MiAyMyA2IDI2IGMxMyA2MyAyNiAyMTkgMzEgMzgwIDkgMjM3IC0xNyA1ODIKLTQ0IDU5OSAtNyA0IC0xOTcgMjQgLTQyNCA0NSAtMjI3IDIxIC00MTYgNDAgLTQyMCA0MiAtNCAyIC0xMiAzMCAtMTggNjIgLTI3CjEzNyAtMTE1IDM2NCAtMjA2IDUzMyBsLTY1IDEyMSAzOCA0NiBjMjEgMjYgMTM5IDE3MSAyNjQgMzIzIDEyNCAxNTIgMjI5IDI4MQoyMzMgMjg4IDggMTIgLTcxIDExMyAtMjAzIDI2MCAtMTQ2IDE2MiAtNDgxIDQ1MSAtNTA0IDQzNCAtODMgLTYzIC0zODIgLTMwNQotNDg3IC0zOTQgLTc1IC02MiAtMTQyIC0xMTkgLTE1MSAtMTI2IC0xMiAtMTAgLTU0IDcgLTIyOSA5NiAtMTUzIDc2IC0yNDcKMTE2IC0zMjUgMTM5IC02MCAxOCAtMTIwIDMyIC0xMzIgMzIgLTI1IDAgLTI1IC0zIC00OSAyNTUgLTE3IDE5MSAtNjQgNjA4Ci02OCA2MTIgLTggOCAtMTI2IDIzIC0yNTIgMzIgLTEzMCAxMCAtMzcyIDEyIC00NTQgNHogbTQ1NSAtMjA5NCBjMjE3IC0zNgo0MjcgLTE1MSA2MTAgLTMzMyAxNzkgLTE3OCAyODkgLTM3NCAzMzUgLTYwMSAxMDQgLTUwMSAtOTkgLTk5OCAtNTIwIC0xMjc2Ci0xOTIgLTEyNyAtMzc4IC0xODYgLTYxNiAtMTk2IC0yMjIgLTEwIC0zODggMjQgLTU3OSAxMTcgLTIzOSAxMTcgLTQxOSAyOTMKLTU0NiA1MzQgLTk2IDE4MyAtMTM0IDM0MyAtMTMzIDU3MSAxIDI4MSA3NyA1MDcgMjQ0IDcyMyAyMTIgMjc1IDUwMCA0NDYgNzk1CjQ3MSAxMTEgOSAzMjkgNCA0MTAgLTEweiIvPgo8cGF0aCBkPSJNODUwMCAxMDUyMSBjLTM2NSAtODAgLTY2MyAtMzU5IC03NzcgLTcyNyAtMjUgLTgzIC0yNyAtMTAxIC0yNwotMjc5IC0xIC0yMDcgNCAtMjM4IDY1IC0zOTYgNjUgLTE2OSAyMzUgLTM3OCAzOTggLTQ4OCA5MCAtNjEgMjE0IC0xMTcgMzE3Ci0xNDMgMTI4IC0zMiAzNzIgLTMyIDQ5MCAwIDE0MCAzOCAyNDEgODYgMzU0IDE3MCAzMjAgMjM4IDQ3MyA1ODMgNDMwIDk3MAotMjcgMjUwIC0xMjQgNDQ4IC0zMDEgNjE3IC0xMzQgMTI4IC0yNzQgMjEwIC00NDggMjYyIC0xMTkgMzUgLTM3MSA0MyAtNTAxCjE0eiBtMzgyIC0yNTYgYzIyOCAtNDggNDQwIC0yMDkgNTM3IC00MDcgMTcgLTM1IDQxIC0xMDEgNTIgLTE0NyAxOCAtNzMgMjEKLTEwNSAxNyAtMjM1IC00IC0xMzIgLTggLTE2MSAtMzQgLTIzNiAtNzYgLTIyNyAtMjk4IC00MjkgLTU0NiAtNDk2IC03NiAtMjEKLTI5MCAtMjQgLTM1OCAtNSAtMTQ3IDQwIC0yNjcgMTEwIC0zNzQgMjE3IC00NSA0NCAtOTYgMTA2IC0xMTUgMTM3IC0yMjIgMzczCi0xMDUgODYyIDI1OSAxMDc4IDc0IDQzIDE4NiA4NyAyNjAgOTkgNzUgMTMgMjMxIDEwIDMwMiAtNXoiLz4KPHBhdGggZD0iTTQ3MTYgODQ0OCBjLTc1IC0xOTEgLTE2MiAtNDI4IC0yNTEgLTY4MCBsLTk4IC0yNzggLTEyMiAwIGMtMjMxIDAKLTU4MyAtNDcgLTc4OCAtMTA2IC03MCAtMjAgLTEyOSAtMzUgLTEzMSAtMzMgLTEgMiAtMzYgNTEgLTc3IDEwOSAtMTQwIDIwMAotNTcwIDc5MCAtNTc1IDc5MCAtMTAgMCAtMTgxIC02OCAtMjE5IC04OCAtMjIgLTExIC03NCAtMzYgLTExNSAtNTYgLTQxIC0xOQotMTIwIC02MSAtMTc1IC05NCAtNTUgLTMyIC0xNDggLTg3IC0yMDcgLTEyMiAtMTA1IC02MiAtMjUwIC0xNjYgLTM0MiAtMjQ1CmwtNDYgLTQxIDEyMCAtMjU5IGM2NyAtMTQzIDE3MSAtMzY3IDIzMiAtNDk4IGwxMTEgLTIzOCAtNzYgLTc3IGMtMTk2IC0yMDAKLTQzMyAtNTExIC01MTMgLTY3NSAtMTYgLTMyIC0zMiAtNTcgLTM3IC01NyAtNCAwIC0xNDYgMjQgLTMxNSA1NCAtMzI5IDU4Ci03NzMgMTI5IC03NzcgMTI0IC04IC04IC0xMDMgLTI0OCAtMTQwIC0zNTMgLTUxIC0xNDYgLTEzNSAtNTU4IC0xNzAgLTg0MApsLTYgLTUwIDUwOCAtMTk1IDUwOCAtMTk1IDIgLTk1IGM0IC0xNzEgMjMgLTM4MSA0NCAtNDg5IDExIC01OCAyNyAtMTQxIDM1Ci0xODMgOCAtNDMgMjYgLTExNiAzOSAtMTYzIDE0IC00NyAyNSAtOTIgMjUgLTEwMCAwIC03IC05MyAtODAgLTIwNyAtMTYxCi0xMTUgLTgxIC0zMTMgLTIyNCAtNDQxIC0zMTggLTIwOCAtMTUyIC0yMzIgLTE3MyAtMjI3IC0xOTMgMjIgLTg4IDIxNiAtNDY0CjM0NiAtNjcyIDc0IC0xMTYgMjIzIC0zMzAgMjY0IC0zNzggbDMwIC0zNCAxNzUgODEgYzE3MiA4MSA3MzYgMzM5IDc5NiAzNjUKbDMwIDE0IDEzNSAtMTI1IGMxNjkgLTE1OCAyNTMgLTIyMSA0ODIgLTM2MSAxMzggLTg0IDE4MiAtMTE2IDE4MCAtMTMwIC0xCi0xMCAtMjIgLTE0MiAtNDcgLTI5MyAtNDQgLTI2NiAtMTE2IC03NDggLTExNiAtNzczIDAgLTcgMTUgLTE4IDMzIC0yNiAyMjUKLTkwIDQyNiAtMTUyIDcxNSAtMjIwIDE5MyAtNDYgNDczIC05NCA0ODMgLTgzIDE4IDIwIDI2MSA2NTkgMzU1IDkyOSBsMzggMTEzCjE1MiAwIGMyNjIgMCA0NDcgMjYgNzEyIDEwMiAxMjIgMzQgMTQ2IDM4IDE1NyAyNyA3IC04IDE1MyAtMjEyIDMyNSAtNDU0IDE3MgotMjQyIDMxNCAtNDQyIDMxNiAtNDQzIDMgLTQgOTEgMzcgMzYxIDE3MCAxMTIgNTUgMjQzIDEzMCAzNDUgMTk3IDE0NSA5NiAzMzEKMjMzIDM4MSAyODEgMTggMTYgMTUgMjUgLTgxIDI0MSAtNTUgMTIzIC0xNTkgMzUwIC0yMzAgNTA0IGwtMTMwIDI3OSAxMTcgMTI2CmMxNjAgMTcwIDMwNSAzNjggNDA1IDU1MiAyNSA0OCA1MCA4OSA1NCA5MSA0IDIgOTUgLTExIDIwMiAtMjkgNTU5IC05NCA4ODMKLTE0NSA4OTQgLTE0MSAyMiA5IDE3OCA0NTMgMjIxIDYyNyA4IDM2IDIwIDc1IDI1IDg3IDkgMjEgNzMgMzgyIDg0IDQ3NSBsNgo0NyAtNDggMjEgYy02MiAyOCAtNDgwIDE4NiAtNzY0IDI5MCBsLTIyOCA4MyAwIDE1NiBjMCAxNzkgLTEwIDI4MSAtNDEgNDQ4Ci0xOCA5OSAtNjcgMzE0IC04NSAzNzUgLTQgMTIgNDQgNTEgMTg4IDE1NCAyMTcgMTU1IDY5NSA1MTEgNzAzIDUyNSA3IDExIC02MQoxNzEgLTE0MyAzMzQgLTExNiAyMzMgLTI2NiA0NjggLTQyNCA2NjcgbC03NyA5NyAtMTMzIC01OCBjLTE4NCAtODEgLTQ4MAotMjE3IC02ODcgLTMxNyBsLTE3MyAtODQgLTEzNCAxMjcgYy0xNDIgMTM0IC0zMTQgMjY4IC00MjkgMzM2IC02MCAzNSAtMTgzCjExNiAtMjA4IDEzNyAtNCA0IDExIDEyMyAzMyAyNjYgMTEyIDcxNCAxMzEgODM2IDEyOCA4MzkgLTIgMSAtNzMgMjkgLTE1OCA2MgotMTgwIDcwIC0zOTkgMTQzIC00MzEgMTQzIC0xMiAwIC00NyA5IC03OCAxOSAtODAgMjggLTQ4OCAxMTAgLTU0NiAxMTEgLTE2IDAKLTI2IC0xNiAtNDkgLTcyeiBtLTE4MSAtMjYyMyBjMjc2IC00OSA1NjQgLTE4NCA3NzIgLTM2MyAyNDYgLTIxMiA0NjAgLTU5OQo1MTggLTkzNiAyMiAtMTI3IDIwIC0zNDcgLTQgLTQ4OCAtNDQgLTI1NSAtMTU0IC01MjUgLTI4NSAtNjk4IC0yMzEgLTMwNwotNjMxIC01NDggLTEwMjAgLTYxNSAtMTE0IC0xOSAtMzM0IC0xOSAtNDU0IDAgLTIyOCAzNyAtNDg2IDEzMCAtNjQ2IDIzMwotMzU2IDIzMCAtNjIwIDYyNSAtNzAyIDEwNTIgLTI0IDEyNyAtMjQgMzU4IDAgNDk1IDkwIDUwOSAzMjkgODYyIDc2MSAxMTI2CjExNCA3MCAyOTMgMTQyIDQzMCAxNzUgMTkzIDQ2IDQzOSA1MyA2MzAgMTl6Ii8+CjxwYXRoIGQ9Ik00MTc1IDU2MjMgYy0yMTUgLTI1IC0zMzcgLTYyIC01MTUgLTE1NCAtMzUwIC0xODEgLTU1OSAtNDQ0IC02NjUKLTgzOCAtNTAgLTE4NCAtNTggLTI0MSAtNTkgLTM5MSAwIC0xNDIgMTYgLTI1MiA1NSAtMzcxIDI0IC03NCAxMDkgLTI1OSAxMTkKLTI1OSAzIDAgMzQgLTQyIDY3IC05MiAxNDggLTIyMyAzNTUgLTM4OSA2MDkgLTQ4OCA1MDYgLTE5OCAxMDM3IC05NCAxNDM3CjI4MCAxODAgMTY4IDMyOCA0MzYgMzc4IDY4MiA2OSAzNDMgMTIgNjY0IC0xNzMgOTc0IC0xOTkgMzM1IC00NTkgNTI0IC04NTgKNjIzIC0xMzQgMzMgLTI5MiA0NyAtMzk1IDM0eiBtMzQ1IC0zNzQgYzMxMiAtNzggNTMyIC0yNjEgNjgxIC01NjUgNjggLTE0MQo4MyAtMjE0IDgzIC00MDkgMCAtMTk5IC0xNSAtMjcwIC05MCAtNDI0IC01NSAtMTE1IC0xMTIgLTE5NiAtMTk1IC0yNzkgLTI5MAotMjg1IC02MjcgLTM2OCAtMTAyNCAtMjUyIC0yNTggNzUgLTQ2MiAyNTMgLTU5NSA1MTkgLTEyNyAyNTQgLTEzOSA1NzMgLTMzCjgxNiAxMDUgMjM2IDI4OSA0MjQgNTI1IDUzNSAyMTcgMTAyIDQwOCAxMTkgNjQ4IDU5eiIvPgo8L2c+Cjwvc3ZnPgo="
        const GoToHomeSvg = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMjcuMDIgMjcuMDIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI3LjAyIDI3LjAyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cGF0aCBzdHlsZT0iZmlsbDojMDMwMTA0OyIgZD0iTTMuNjc0LDI0Ljg3NmMwLDAtMC4wMjQsMC42MDQsMC41NjYsMC42MDRjMC43MzQsMCw2LjgxMS0wLjAwOCw2LjgxMS0wLjAwOGwwLjAxLTUuNTgxDQoJCWMwLDAtMC4wOTYtMC45MiwwLjc5Ny0wLjkyaDIuODI2YzEuMDU2LDAsMC45OTEsMC45MiwwLjk5MSwwLjkybC0wLjAxMiw1LjU2M2MwLDAsNS43NjIsMCw2LjY2NywwDQoJCWMwLjc0OSwwLDAuNzE1LTAuNzUyLDAuNzE1LTAuNzUyVjE0LjQxM2wtOS4zOTYtOC4zNThsLTkuOTc1LDguMzU4QzMuNjc0LDE0LjQxMywzLjY3NCwyNC44NzYsMy42NzQsMjQuODc2eiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiMwMzAxMDQ7IiBkPSJNMCwxMy42MzVjMCwwLDAuODQ3LDEuNTYxLDIuNjk0LDBsMTEuMDM4LTkuMzM4bDEwLjM0OSw5LjI4YzIuMTM4LDEuNTQyLDIuOTM5LDAsMi45MzksMA0KCQlMMTMuNzMyLDEuNTRMMCwxMy42MzV6Ii8+DQoJPHBvbHlnb24gc3R5bGU9ImZpbGw6IzAzMDEwNDsiIHBvaW50cz0iMjMuODMsNC4yNzUgMjEuMTY4LDQuMjc1IDIxLjE3OSw3LjUwMyAyMy44Myw5Ljc1MiAJIi8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
        const GoToAppSvg ="PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik04NiwxNC4zMzMzM2MtMzkuNDk1NTIsMCAtNzEuNjY2NjcsMzIuMTcxMTUgLTcxLjY2NjY3LDcxLjY2NjY3YzAsMzkuNDk1NTIgMzIuMTcxMTUsNzEuNjY2NjcgNzEuNjY2NjcsNzEuNjY2NjdjMzkuNDk1NTIsMCA3MS42NjY2NywtMzIuMTcxMTUgNzEuNjY2NjcsLTcxLjY2NjY3YzAsLTM5LjQ5NTUyIC0zMi4xNzExNSwtNzEuNjY2NjcgLTcxLjY2NjY3LC03MS42NjY2N3pNODYsMjguNjY2NjdjMzEuNzQ5MjEsMCA1Ny4zMzMzMywyNS41ODQxMiA1Ny4zMzMzMyw1Ny4zMzMzM2MwLDMxLjc0OTIxIC0yNS41ODQxMiw1Ny4zMzMzMyAtNTcuMzMzMzMsNTcuMzMzMzNjLTMxLjc0OTIxLDAgLTU3LjMzMzMzLC0yNS41ODQxMiAtNTcuMzMzMzMsLTU3LjMzMzMzYzAsLTMxLjc0OTIxIDI1LjU4NDEyLC01Ny4zMzMzMyA1Ny4zMzMzMywtNTcuMzMzMzN6TTcxLjY2NjY3LDYxLjE2ODYydjQ5LjY2Mjc2bDQzLC0yNC44MzEzOHoiPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg=="
        
        var Div = document.createElement("div")
        Div.setAttribute("style","display: flex; flex-direction: row; align-items: center; justify-content: space-around; align-content: center;")
        var ButtonLogout = document.createElement("button")
        ButtonLogout.setAttribute("title", "Logout")
        ButtonLogout.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonLogout.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); GlobalLogout()})
        ButtonLogout.innerHTML = '<img src="data:image/svg+xml;base64,' + LogoutSvg + '" height="100%" width="100%">'
        Div.appendChild(ButtonLogout)

        var ButtonUserConfig = document.createElement("button")
        ButtonUserConfig.setAttribute("title", "User")
        ButtonUserConfig.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonUserConfig.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); CoreXWindowUserConfig.BuildWindow()})
        ButtonUserConfig.innerHTML = '<img src="data:image/svg+xml;base64,' + UserConfigSvg + '" height="100%" width="100%">'
        Div.appendChild(ButtonUserConfig)

        var ButtonHome = document.createElement("button")
        ButtonHome.setAttribute("title", "Home")
        ButtonHome.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonHome.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); this._ClickOnHomeFct()})
        ButtonHome.innerHTML = '<img src="data:image/svg+xml;base64,' + GoToHomeSvg + '" height="100%" width="100%">'
        Div.appendChild(ButtonHome)

        if(GlobalIsAdminUser()){
            var ButtonGoToApp = document.createElement("button")
            ButtonGoToApp.setAttribute("class", "CoreXActionButtonImageButton")
            let LocalStorageApp = localStorage.getItem("CoreXApp")
            if(LocalStorageApp == "App"){
                ButtonGoToApp.setAttribute("title", "Go to Admin App")
                ButtonGoToApp.addEventListener("click", ()=>{this.GoToApp.bind(this, false)()})
                ButtonGoToApp.innerHTML = '<img src="data:image/svg+xml;base64,' + GoToAppAdminSvg + '" height="100%" width="100%">'
            } else {
                ButtonGoToApp.setAttribute("title", "Go to App")
                ButtonGoToApp.addEventListener("click", ()=>{this.GoToApp.bind(this, true)()})
                ButtonGoToApp.innerHTML = '<img src="data:image/svg+xml;base64,' + GoToAppSvg + '" height="100%" width="100%">'
            }
            Div.appendChild(ButtonGoToApp)
        }
        return Div
    }
    /** Get Css du bouton action */
    GetCss(){
    return /*html*/`
        <style>
        .CoreXActionText{font-size: var(--CoreX-font-size);}
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
            width:15%;
            padding: 0px;
            cursor: pointer;
            border: 2px solid transparent;
            padding:2px;
            border-radius: 10px;
            background-color: white;
            outline: none;
        }
        .CoreXActionButtonImageButton:hover{
            border-color: black;
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
        }
        .CoreXActionMenuButton{
            position: fixed;
            top: 0px;
            font-size: 1.5vw;
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
            height: 50px;
            width: 50px;
            text-align: center;
            outline: none;
        }
        
        @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
        only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
        screen and (max-width: 700px)
        {
            .CoreXActionText{font-size: var(--CoreX-Iphone-font-size);}
            .CoreXActionButtonButton{font-size: calc(var(--CoreX-Iphone-font-size)*1.5); border-radius: 40px; height: 12VW;}
            .CoreXActionButtonImageButton{width:15%;}
            .CoreXActionMenuButton{font-size: calc(3vw * 1.5);height: 10VW; width: 10VW;}
        }
        @media screen and (min-width: 1200px)
        {
            .CoreXActionText{font-size: var(--CoreX-Max-font-size);}
            .CoreXActionButtonButton {font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            .CoreXActionButtonImageButton{width:43px;}
            .CoreXActionMenuButton {font-size: 18px;}
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
    /** Set display Action button */
    SetDisplayAction(Type){
        switch (Type) {
            case "On":
                this._DisplayType = Type
                if (document.getElementById(this._HtmlId)) {
                    document.getElementById(this._HtmlId).style.opacity = "1"
                    document.getElementById(this._HtmlId).style.display = "inline"
                }
                break
            case "Off":
                this._DisplayType = Type
                if (document.getElementById(this._HtmlId)) {
                    document.getElementById(this._HtmlId).style.opacity = "0"
                    document.getElementById(this._HtmlId).style.display = "none"
                }
                break
            
            default:
                this._DisplayType = "Toggle"
                if (document.getElementById(this._HtmlId)) {
                    document.getElementById(this._HtmlId).style.opacity = "0"
                    document.getElementById(this._HtmlId).style.display = "inline"
                }
                break
        }
    }

    /** Redirect to app */
    GoToApp(App){
        if(App){
            localStorage.setItem("CoreXApp", "App")
            //GlobalLogout()
        } else {
            localStorage.setItem("CoreXApp", "Admin")
            //location.reload()
        }
        location.reload()
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
                z-index: 1000;
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
                border: 0px solid transparent;
                background-color: white;
                top: 0px;
                right: 0px;
                position:absolute;
                margin: 1%;
                outline: none;
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #CoreXWindowScreen{width: 90%;}
                .CoreXWindowCloseButton{width:7%;}
            }
            @media screen and (min-width: 1200px)
            {
                #CoreXWindowScreen{width: 500px;}
                .CoreXWindowCloseButton{width:25px;}
            }
            </style>`

        var el = document.createElement("div")
        el.setAttribute("id", "CoreXWindow")
        el.setAttribute("style", "z-index: 1000;")
        el.innerHTML = CSS

        var Div1 = document.createElement("div")
        Div1.setAttribute("style", "display: block; position: fixed; top: 0px; left: 0px; background-color: rgb(230,230,230, 0.8); width: 100%; height: 100%; z-index: 1000;")
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
            .CoreXActionText{font-size: var(--CoreX-font-size);}
            #CoreXWindowScreen{
                width:50%;
                display: block;
                position: fixed;
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                z-index: 1000;
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
            .CoreXWindowUserConfigInputBox{
                width: 90%;
                margin-left: auto;
                margin-right: auto;
            }
            .CoreXWindowUserConfigInput {
                border: solid 1px #dcdcdc;
                font-size: var(--CoreX-font-size);
                padding: 2%;
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
                .CoreXActionText{font-size: var(--CoreX-Iphone-font-size);}
                #CoreXWindowScreen{width: 90%;}
                .CoreXWindowUserConfigButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
                .CoreXWindowUserConfigInput {font-size: var(--CoreX-Iphone-font-size); padding: 3%;}
            }
            @media screen and (min-width: 1200px)
            {
                .CoreXActionText{font-size: var(--CoreX-Max-font-size);}
                .CoreXWindowUserConfigButton {font-size: var(--CoreX-Max-font-size); border-radius: 40px; width: 200px;}
                .CoreXWindowUserConfigInput {font-size: var(--CoreX-Max-font-size);}
            }
            </style>`

        var el = document.createElement("div")
        el.setAttribute("id", "CoreXWindowUserConfig")
        el.innerHTML = CSS

        var Div1 = document.createElement("div")
        Div1.setAttribute("style", "display: block; position: fixed; top: 0px; left: 0px; background-color: rgb(230,230,230, 0.8); width: 100%; height: 100%; z-index: 998;")
        el.appendChild(Div1)

        var Div2 = document.createElement("div")
        Div2.setAttribute("id", "CoreXWindowScreen")
        Div2.setAttribute("style","top: " + divInputScreenTop + "; min-height:20vh; max-height: " + divInputScreenMaxHeight + "; display: flex; flex-direction: column; justify-content: center;")
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
        DivErrorTxt.setAttribute("class", "CoreXActionText")
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
        ButtonClose.setAttribute("id", "ButtonClose")
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
            document.getElementById("CoreXWindowUserConfigWaitingText").innerHTML='<div class="CoreXActionText" style="color:red;">' + erreur + '</div>'
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
        let CoreXWindowUserConfigData = document.getElementById("CoreXWindowUserConfigData")
        CoreXWindowUserConfigData.innerHTML = ""
        CoreXWindowUserConfigData.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Creation de la liste HTML des données du user
        Object.keys(UserDataToShow).forEach(element => {
            CoreXWindowUserConfigData.appendChild(CoreXWindowUserConfig.BuildUserDataview(element, UserDataToShow[element]))
        })
    }
    /** Construcuteur d'un element html pour une Key et une valeur */
    static BuildUserDataview(Key, Value){
        let element = document.createElement("div")
        element.setAttribute("Class", "CoreXWindowUserConfigInputBox")
        element.appendChild(CoreXBuild.DivTexte(Key.replace("-", " "),"","CoreXActionText","width: 100%;"))

        let inputStyle="box-sizing: border-box; outline: none; margin: 0; background: #fafafa; -webkit-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -moz-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #666; margin-bottom: 1vw;"
        let InputProgramName = null
        if((Key== "Password") || (Key== "Confirm-Password")){
            InputProgramName = CoreXBuild.Input(Key,Value,"CoreXWindowUserConfigInput",inputStyle + "width: 50%;","password",Key,"")
        } else {
            InputProgramName = CoreXBuild.Input(Key,Value,"CoreXWindowUserConfigInput",inputStyle+ "width: 100%;","text",Key,"")
        }
        InputProgramName.setAttribute("data-Input", "CoreXMyUserDataInput")
        element.appendChild(InputProgramName)
        return element
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
            document.getElementById("CoreXWindowUserConfigData").innerHTML='<div class="CoreXActionText" style="text-align: center;">Update du user...</div>'
            document.getElementById("ButtonUpdateMyData").style.display = "none"
            // Call delete user
            GlobalCallApiPromise("UpdateMyUser", AllData).then((reponse)=>{
                CoreXWindowUserConfig.DeleteWindow()
            },(erreur)=>{
                document.getElementById("CoreXWindowUserConfigData").innerHTML='<div class="CoreXActionText" style="color:red; text-align: center;">' + erreur + '</div>'
            })
        }
    }
}
