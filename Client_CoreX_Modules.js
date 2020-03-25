/** Bouton Action en haut a droite */
class CoreXActionButton{
    constructor(){
        this._HtmlId = "AdminCoreXActionButton"
        this._ActionList=[]
        this._lastTap = 0
    }
    /** Start de l'action button */
    Start(){
        let div = document.createElement("div")
        div.innerHTML = this.GetCss()

        let Button = document.createElement("button")
        Button.setAttribute("id", this._HtmlId)
        Button.setAttribute("style", "right: 0px; display: inline;")
        Button.setAttribute("class", "CoreXActionMenuButton")
        Button.innerHTML = "&#9733"
        Button.addEventListener("click", this.OnClickCoreXActionButton.bind(this))
        div.appendChild(Button)
        document.body.appendChild(div)
        document.body.addEventListener("touchstart", this.DoubleTouchEventFct.bind(this))
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
            if(window.location.pathname == "/"){
                Div.appendChild(this.GetTemplateActionBoutton("Go to Admin App",  this.GoToApp.bind(this, false)))
            } else {
                Div.appendChild(this.GetTemplateActionBoutton("Go to App",  this.GoToApp.bind(this, true)))
            }
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
        const GoToAppAdminSvg = "PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMTIwMC4wMDAwMDBwdCIgaGVpZ2h0PSIxMjgwLjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMTIwMC4wMDAwMDAgMTI4MC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KPG1ldGFkYXRhPgpDcmVhdGVkIGJ5IHBvdHJhY2UgMS4xNSwgd3JpdHRlbiBieSBQZXRlciBTZWxpbmdlciAyMDAxLTIwMTcKPC9tZXRhZGF0YT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsMTI4MC4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiCmZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik04NTAwIDEyNzkzIGMtMjAzIC0xOSAtMjUyIC0yNCAtMjY0IC0yOSAtMjEgLTggLTY3IC00MDEgLTg0IC03MTgKbC03IC0xMjkgLTExMCAtMjcgYy02MCAtMTUgLTE0NCAtNDEgLTE4NSAtNTggLTEwNSAtNDMgLTMzNyAtMTU0IC0zOTcgLTE5MQotMjggLTE3IC01MyAtMzEgLTU1IC0zMSAtMyAwIC0xNTEgMTIwIC0zMjkgMjY2IC0xNzggMTQ2IC0zMzAgMjY4IC0zMzYgMjcxCi0yNCAxMCAtMjI5IC0xNjQgLTM4MiAtMzIzIC0xNDcgLTE1MiAtMzE1IC0zNjIgLTMwMyAtMzc3IDQzIC01NyAyMDcgLTI1OQozNDcgLTQyNyA5NCAtMTEzIDE3NSAtMjExIDE3OSAtMjE4IDQgLTggLTkgLTM4IC0zNCAtNzggLTY3IC0xMDYgLTE0NSAtMjcxCi0xODAgLTM3OSAtMTggLTU1IC00MyAtMTMyIC01NiAtMTcyIC0xMyAtMzkgLTI0IC03OCAtMjQgLTg2IDAgLTExIC0xOSAtMTYKLTcyIC0yMSAtMzkwIC0zNiAtNzY1IC03OSAtNzc1IC05MCAtMzEgLTMwIC01MSAtNDMyIC0zNCAtNjQ5IDEyIC0xNTEgMzUKLTMxNSA0NiAtMzI1IDQgLTUgMjk5IC0zNCA3NTcgLTc3IGw3NyAtNyA2IC00MSBjNCAtMjMgMTUgLTYyIDI1IC04NyAxMCAtMjUKMzQgLTk3IDU0IC0xNjEgMzkgLTEyMSAxMjAgLTI5MyAxODcgLTM5MyAyMiAtMzMgMzggLTY1IDM1IC03MyAtMyAtNyAtODMKLTEwNiAtMTc5IC0yMjAgLTI2NCAtMzE2IC0zNDggLTQyMyAtMzQwIC00MzYgMzQgLTYwIDE5NSAtMjQ5IDMwOCAtMzYzIDE0OQotMTUwIDM4MiAtMzQ0IDM5MyAtMzI4IDQgNiA5OSA4NiAyMTIgMTc5IDExMyA5MyAyNTAgMjA3IDMwNSAyNTQgNTUgNDggMTA3CjkyIDExNyA5OSAxNCAxMSAzMyA0IDEzMCAtNTEgMTM0IC03NiAyOTkgLTE0NCA0NTkgLTE4NyA2MyAtMTcgMTIxIC0zNSAxMjcKLTM5IDggLTUgMjMgLTEwOSA0MiAtMzAyIDMwIC0yOTMgNTcgLTUyNCA2NCAtNTQ1IDggLTIxIDMxMCAtMzcgNTY5IC0zMSAyMDYKNSA0MDcgMjQgNDIzIDM5IDIgMyAyMCAxODAgMzkgMzk0IDIwIDIxNCAzOCA0MDQgNDEgNDIyIDYgMzggNCAzNyAxNzcgODggMTQ1CjQzIDMzOCAxMjggNDU1IDIwMSA0NyAzMCA5MCA1MiA5NiA0OSA2IC0yIDY3IC01MiAxMzYgLTExMSAyMzIgLTIwMCA1MjIgLTQyNgo1MzcgLTQyMSAyNyAxMSAxMzggOTYgMjAwIDE1MyAxMjkgMTIwIDQ4MyA1MjEgNDgzIDU0NyAwIDMgLTExNCAxNDEgLTI1MiAzMDcKLTEzOSAxNjUgLTI2MyAzMTMgLTI3NSAzMjggbC0yMiAyNyA1OSAxMTQgYzc5IDE1MSAxNTYgMzQ0IDE4OSA0NzEgbDI2IDEwNAoxODUgMTcgYzEwMiA5IDI5NCAyNyA0MjcgMzkgbDI0MiAyMyA2IDI2IGMxMyA2MyAyNiAyMTkgMzEgMzgwIDkgMjM3IC0xNyA1ODIKLTQ0IDU5OSAtNyA0IC0xOTcgMjQgLTQyNCA0NSAtMjI3IDIxIC00MTYgNDAgLTQyMCA0MiAtNCAyIC0xMiAzMCAtMTggNjIgLTI3CjEzNyAtMTE1IDM2NCAtMjA2IDUzMyBsLTY1IDEyMSAzOCA0NiBjMjEgMjYgMTM5IDE3MSAyNjQgMzIzIDEyNCAxNTIgMjI5IDI4MQoyMzMgMjg4IDggMTIgLTcxIDExMyAtMjAzIDI2MCAtMTQ2IDE2MiAtNDgxIDQ1MSAtNTA0IDQzNCAtODMgLTYzIC0zODIgLTMwNQotNDg3IC0zOTQgLTc1IC02MiAtMTQyIC0xMTkgLTE1MSAtMTI2IC0xMiAtMTAgLTU0IDcgLTIyOSA5NiAtMTUzIDc2IC0yNDcKMTE2IC0zMjUgMTM5IC02MCAxOCAtMTIwIDMyIC0xMzIgMzIgLTI1IDAgLTI1IC0zIC00OSAyNTUgLTE3IDE5MSAtNjQgNjA4Ci02OCA2MTIgLTggOCAtMTI2IDIzIC0yNTIgMzIgLTEzMCAxMCAtMzcyIDEyIC00NTQgNHogbTQ1NSAtMjA5NCBjMjE3IC0zNgo0MjcgLTE1MSA2MTAgLTMzMyAxNzkgLTE3OCAyODkgLTM3NCAzMzUgLTYwMSAxMDQgLTUwMSAtOTkgLTk5OCAtNTIwIC0xMjc2Ci0xOTIgLTEyNyAtMzc4IC0xODYgLTYxNiAtMTk2IC0yMjIgLTEwIC0zODggMjQgLTU3OSAxMTcgLTIzOSAxMTcgLTQxOSAyOTMKLTU0NiA1MzQgLTk2IDE4MyAtMTM0IDM0MyAtMTMzIDU3MSAxIDI4MSA3NyA1MDcgMjQ0IDcyMyAyMTIgMjc1IDUwMCA0NDYgNzk1CjQ3MSAxMTEgOSAzMjkgNCA0MTAgLTEweiIvPgo8cGF0aCBkPSJNODUwMCAxMDUyMSBjLTM2NSAtODAgLTY2MyAtMzU5IC03NzcgLTcyNyAtMjUgLTgzIC0yNyAtMTAxIC0yNwotMjc5IC0xIC0yMDcgNCAtMjM4IDY1IC0zOTYgNjUgLTE2OSAyMzUgLTM3OCAzOTggLTQ4OCA5MCAtNjEgMjE0IC0xMTcgMzE3Ci0xNDMgMTI4IC0zMiAzNzIgLTMyIDQ5MCAwIDE0MCAzOCAyNDEgODYgMzU0IDE3MCAzMjAgMjM4IDQ3MyA1ODMgNDMwIDk3MAotMjcgMjUwIC0xMjQgNDQ4IC0zMDEgNjE3IC0xMzQgMTI4IC0yNzQgMjEwIC00NDggMjYyIC0xMTkgMzUgLTM3MSA0MyAtNTAxCjE0eiBtMzgyIC0yNTYgYzIyOCAtNDggNDQwIC0yMDkgNTM3IC00MDcgMTcgLTM1IDQxIC0xMDEgNTIgLTE0NyAxOCAtNzMgMjEKLTEwNSAxNyAtMjM1IC00IC0xMzIgLTggLTE2MSAtMzQgLTIzNiAtNzYgLTIyNyAtMjk4IC00MjkgLTU0NiAtNDk2IC03NiAtMjEKLTI5MCAtMjQgLTM1OCAtNSAtMTQ3IDQwIC0yNjcgMTEwIC0zNzQgMjE3IC00NSA0NCAtOTYgMTA2IC0xMTUgMTM3IC0yMjIgMzczCi0xMDUgODYyIDI1OSAxMDc4IDc0IDQzIDE4NiA4NyAyNjAgOTkgNzUgMTMgMjMxIDEwIDMwMiAtNXoiLz4KPHBhdGggZD0iTTQ3MTYgODQ0OCBjLTc1IC0xOTEgLTE2MiAtNDI4IC0yNTEgLTY4MCBsLTk4IC0yNzggLTEyMiAwIGMtMjMxIDAKLTU4MyAtNDcgLTc4OCAtMTA2IC03MCAtMjAgLTEyOSAtMzUgLTEzMSAtMzMgLTEgMiAtMzYgNTEgLTc3IDEwOSAtMTQwIDIwMAotNTcwIDc5MCAtNTc1IDc5MCAtMTAgMCAtMTgxIC02OCAtMjE5IC04OCAtMjIgLTExIC03NCAtMzYgLTExNSAtNTYgLTQxIC0xOQotMTIwIC02MSAtMTc1IC05NCAtNTUgLTMyIC0xNDggLTg3IC0yMDcgLTEyMiAtMTA1IC02MiAtMjUwIC0xNjYgLTM0MiAtMjQ1CmwtNDYgLTQxIDEyMCAtMjU5IGM2NyAtMTQzIDE3MSAtMzY3IDIzMiAtNDk4IGwxMTEgLTIzOCAtNzYgLTc3IGMtMTk2IC0yMDAKLTQzMyAtNTExIC01MTMgLTY3NSAtMTYgLTMyIC0zMiAtNTcgLTM3IC01NyAtNCAwIC0xNDYgMjQgLTMxNSA1NCAtMzI5IDU4Ci03NzMgMTI5IC03NzcgMTI0IC04IC04IC0xMDMgLTI0OCAtMTQwIC0zNTMgLTUxIC0xNDYgLTEzNSAtNTU4IC0xNzAgLTg0MApsLTYgLTUwIDUwOCAtMTk1IDUwOCAtMTk1IDIgLTk1IGM0IC0xNzEgMjMgLTM4MSA0NCAtNDg5IDExIC01OCAyNyAtMTQxIDM1Ci0xODMgOCAtNDMgMjYgLTExNiAzOSAtMTYzIDE0IC00NyAyNSAtOTIgMjUgLTEwMCAwIC03IC05MyAtODAgLTIwNyAtMTYxCi0xMTUgLTgxIC0zMTMgLTIyNCAtNDQxIC0zMTggLTIwOCAtMTUyIC0yMzIgLTE3MyAtMjI3IC0xOTMgMjIgLTg4IDIxNiAtNDY0CjM0NiAtNjcyIDc0IC0xMTYgMjIzIC0zMzAgMjY0IC0zNzggbDMwIC0zNCAxNzUgODEgYzE3MiA4MSA3MzYgMzM5IDc5NiAzNjUKbDMwIDE0IDEzNSAtMTI1IGMxNjkgLTE1OCAyNTMgLTIyMSA0ODIgLTM2MSAxMzggLTg0IDE4MiAtMTE2IDE4MCAtMTMwIC0xCi0xMCAtMjIgLTE0MiAtNDcgLTI5MyAtNDQgLTI2NiAtMTE2IC03NDggLTExNiAtNzczIDAgLTcgMTUgLTE4IDMzIC0yNiAyMjUKLTkwIDQyNiAtMTUyIDcxNSAtMjIwIDE5MyAtNDYgNDczIC05NCA0ODMgLTgzIDE4IDIwIDI2MSA2NTkgMzU1IDkyOSBsMzggMTEzCjE1MiAwIGMyNjIgMCA0NDcgMjYgNzEyIDEwMiAxMjIgMzQgMTQ2IDM4IDE1NyAyNyA3IC04IDE1MyAtMjEyIDMyNSAtNDU0IDE3MgotMjQyIDMxNCAtNDQyIDMxNiAtNDQzIDMgLTQgOTEgMzcgMzYxIDE3MCAxMTIgNTUgMjQzIDEzMCAzNDUgMTk3IDE0NSA5NiAzMzEKMjMzIDM4MSAyODEgMTggMTYgMTUgMjUgLTgxIDI0MSAtNTUgMTIzIC0xNTkgMzUwIC0yMzAgNTA0IGwtMTMwIDI3OSAxMTcgMTI2CmMxNjAgMTcwIDMwNSAzNjggNDA1IDU1MiAyNSA0OCA1MCA4OSA1NCA5MSA0IDIgOTUgLTExIDIwMiAtMjkgNTU5IC05NCA4ODMKLTE0NSA4OTQgLTE0MSAyMiA5IDE3OCA0NTMgMjIxIDYyNyA4IDM2IDIwIDc1IDI1IDg3IDkgMjEgNzMgMzgyIDg0IDQ3NSBsNgo0NyAtNDggMjEgYy02MiAyOCAtNDgwIDE4NiAtNzY0IDI5MCBsLTIyOCA4MyAwIDE1NiBjMCAxNzkgLTEwIDI4MSAtNDEgNDQ4Ci0xOCA5OSAtNjcgMzE0IC04NSAzNzUgLTQgMTIgNDQgNTEgMTg4IDE1NCAyMTcgMTU1IDY5NSA1MTEgNzAzIDUyNSA3IDExIC02MQoxNzEgLTE0MyAzMzQgLTExNiAyMzMgLTI2NiA0NjggLTQyNCA2NjcgbC03NyA5NyAtMTMzIC01OCBjLTE4NCAtODEgLTQ4MAotMjE3IC02ODcgLTMxNyBsLTE3MyAtODQgLTEzNCAxMjcgYy0xNDIgMTM0IC0zMTQgMjY4IC00MjkgMzM2IC02MCAzNSAtMTgzCjExNiAtMjA4IDEzNyAtNCA0IDExIDEyMyAzMyAyNjYgMTEyIDcxNCAxMzEgODM2IDEyOCA4MzkgLTIgMSAtNzMgMjkgLTE1OCA2MgotMTgwIDcwIC0zOTkgMTQzIC00MzEgMTQzIC0xMiAwIC00NyA5IC03OCAxOSAtODAgMjggLTQ4OCAxMTAgLTU0NiAxMTEgLTE2IDAKLTI2IC0xNiAtNDkgLTcyeiBtLTE4MSAtMjYyMyBjMjc2IC00OSA1NjQgLTE4NCA3NzIgLTM2MyAyNDYgLTIxMiA0NjAgLTU5OQo1MTggLTkzNiAyMiAtMTI3IDIwIC0zNDcgLTQgLTQ4OCAtNDQgLTI1NSAtMTU0IC01MjUgLTI4NSAtNjk4IC0yMzEgLTMwNwotNjMxIC01NDggLTEwMjAgLTYxNSAtMTE0IC0xOSAtMzM0IC0xOSAtNDU0IDAgLTIyOCAzNyAtNDg2IDEzMCAtNjQ2IDIzMwotMzU2IDIzMCAtNjIwIDYyNSAtNzAyIDEwNTIgLTI0IDEyNyAtMjQgMzU4IDAgNDk1IDkwIDUwOSAzMjkgODYyIDc2MSAxMTI2CjExNCA3MCAyOTMgMTQyIDQzMCAxNzUgMTkzIDQ2IDQzOSA1MyA2MzAgMTl6Ii8+CjxwYXRoIGQ9Ik00MTc1IDU2MjMgYy0yMTUgLTI1IC0zMzcgLTYyIC01MTUgLTE1NCAtMzUwIC0xODEgLTU1OSAtNDQ0IC02NjUKLTgzOCAtNTAgLTE4NCAtNTggLTI0MSAtNTkgLTM5MSAwIC0xNDIgMTYgLTI1MiA1NSAtMzcxIDI0IC03NCAxMDkgLTI1OSAxMTkKLTI1OSAzIDAgMzQgLTQyIDY3IC05MiAxNDggLTIyMyAzNTUgLTM4OSA2MDkgLTQ4OCA1MDYgLTE5OCAxMDM3IC05NCAxNDM3CjI4MCAxODAgMTY4IDMyOCA0MzYgMzc4IDY4MiA2OSAzNDMgMTIgNjY0IC0xNzMgOTc0IC0xOTkgMzM1IC00NTkgNTI0IC04NTgKNjIzIC0xMzQgMzMgLTI5MiA0NyAtMzk1IDM0eiBtMzQ1IC0zNzQgYzMxMiAtNzggNTMyIC0yNjEgNjgxIC01NjUgNjggLTE0MQo4MyAtMjE0IDgzIC00MDkgMCAtMTk5IC0xNSAtMjcwIC05MCAtNDI0IC01NSAtMTE1IC0xMTIgLTE5NiAtMTk1IC0yNzkgLTI5MAotMjg1IC02MjcgLTM2OCAtMTAyNCAtMjUyIC0yNTggNzUgLTQ2MiAyNTMgLTU5NSA1MTkgLTEyNyAyNTQgLTEzOSA1NzMgLTMzCjgxNiAxMDUgMjM2IDI4OSA0MjQgNTI1IDUzNSAyMTcgMTAyIDQwOCAxMTkgNjQ4IDU5eiIvPgo8L2c+Cjwvc3ZnPgo="

        const GoToAppSvg = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMjcuMDIgMjcuMDIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI3LjAyIDI3LjAyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cGF0aCBzdHlsZT0iZmlsbDojMDMwMTA0OyIgZD0iTTMuNjc0LDI0Ljg3NmMwLDAtMC4wMjQsMC42MDQsMC41NjYsMC42MDRjMC43MzQsMCw2LjgxMS0wLjAwOCw2LjgxMS0wLjAwOGwwLjAxLTUuNTgxDQoJCWMwLDAtMC4wOTYtMC45MiwwLjc5Ny0wLjkyaDIuODI2YzEuMDU2LDAsMC45OTEsMC45MiwwLjk5MSwwLjkybC0wLjAxMiw1LjU2M2MwLDAsNS43NjIsMCw2LjY2NywwDQoJCWMwLjc0OSwwLDAuNzE1LTAuNzUyLDAuNzE1LTAuNzUyVjE0LjQxM2wtOS4zOTYtOC4zNThsLTkuOTc1LDguMzU4QzMuNjc0LDE0LjQxMywzLjY3NCwyNC44NzYsMy42NzQsMjQuODc2eiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiMwMzAxMDQ7IiBkPSJNMCwxMy42MzVjMCwwLDAuODQ3LDEuNTYxLDIuNjk0LDBsMTEuMDM4LTkuMzM4bDEwLjM0OSw5LjI4YzIuMTM4LDEuNTQyLDIuOTM5LDAsMi45MzksMA0KCQlMMTMuNzMyLDEuNTRMMCwxMy42MzV6Ii8+DQoJPHBvbHlnb24gc3R5bGU9ImZpbGw6IzAzMDEwNDsiIHBvaW50cz0iMjMuODMsNC4yNzUgMjEuMTY4LDQuMjc1IDIxLjE3OSw3LjUwMyAyMy44Myw5Ljc1MiAJIi8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
        var Div = document.createElement("div")
        Div.setAttribute("style","display: flex; flex-direction: row; align-items: center; justify-content: space-around; align-content: center;")
        var ButtonLogout = document.createElement("button")
        ButtonLogout.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonLogout.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); GlobalLogout()})
        ButtonLogout.innerHTML = '<img src="data:image/svg+xml;base64,' + LogoutSvg + '" height="100%" width="100%">'

        var ButtonUserConfig = document.createElement("button")
        ButtonUserConfig.setAttribute("class", "CoreXActionButtonImageButton")
        ButtonUserConfig.addEventListener("click", ()=>{CoreXWindow.DeleteWindow(); CoreXWindowUserConfig.BuildWindow()})
        ButtonUserConfig.innerHTML = '<img src="data:image/svg+xml;base64,' + UserConfigSvg + '" height="100%" width="100%">'

        var ButtonGoToApp = document.createElement("button")
        ButtonGoToApp.setAttribute("class", "CoreXActionButtonImageButton")
        if(window.location.pathname == "/"){
            ButtonGoToApp.addEventListener("click", ()=>{this.GoToApp.bind(this, false)()})
            ButtonGoToApp.innerHTML = '<img src="data:image/svg+xml;base64,' + GoToAppAdminSvg + '" height="100%" width="100%">'
        } else {
            ButtonGoToApp.addEventListener("click", ()=>{this.GoToApp.bind(this, true)()})
            ButtonGoToApp.innerHTML = '<img src="data:image/svg+xml;base64,' + GoToAppSvg + '" height="100%" width="100%">'
        }

        Div.appendChild(ButtonLogout)
        Div.appendChild(ButtonUserConfig)
        Div.appendChild(ButtonGoToApp)
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
            height: 50px;
            width: 50px;
            text-align: center;
        }
        .CoreXActionMenuButton:hover,
        .CoreXActionMenuButton:active{opacity: 1;}
        @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
        only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
        screen and (max-width: 700px)
        {
            .CoreXActionButtonButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px; height: 12VW;}
            .CoreXActionButtonImageButton{width:10%;}
            .CoreXActionMenuButton{font-size: calc(var(--CoreX-Iphone-font-size)*1.5);height: 10VW; width: 10VW;}
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
    /** Redirect to app */
    GoToApp(App){
        if(App){
            window.location = '/'
        } else {
            window.location = '/admin'
        }
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

/** Construction d'élements de base d'une application */
class CoreXBuild{
    constructor(){}

    static GetDateTimeString(DateString){
        var Now = new Date(DateString)
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

    static GetDateString(DateString){
        var Now = new Date(DateString)
        var dd = Now.getDate()
        var mm = Now.getMonth()+1
        var yyyy = Now.getFullYear()
        if(dd<10) {dd='0'+dd} 
        if(mm<10) {mm='0'+mm}
        return yyyy + "-" + mm + "-" + dd
    }

    static Div(Id,Class, Style){
        let element = document.createElement("div")
        if (Id){element.setAttribute("id", Id)}
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        return element
    }

    static DivFlexColumn(Id){
        let element = document.createElement("div")
        if (Id){element.setAttribute("id", Id)}
        element.setAttribute("style","width: 100%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center; flex-wrap: wrap;")
        return element
    }

    static DivFlexRowAr(Id){
        let element = document.createElement("div")
        if (Id){element.setAttribute("id", Id)}
        element.setAttribute("style","width: 100%; display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center; flex-wrap: wrap;")
        return element
    }

    static DivFlexRowStart(Id){
        let element = document.createElement("div")
        if (Id){element.setAttribute("id", Id)}
        element.setAttribute("style","width: 100%; display: -webkit-flex; display: flex; flex-direction: row; justify-content:start; align-content:center; align-items: center; flex-wrap: wrap;")
        return element
    }

    static DivTexte(Texte, Id, Class, Style){
        let element = document.createElement("div")
        if (Id){element.setAttribute("id", Id)}
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        element.innerHTML = Texte
        return element
    }

    static Image64(Base64, Id, Class, Style){
        let element = document.createElement("img")
        element.setAttribute("src", Base64)
        if (Id){element.setAttribute("id", Id)}
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        return element
    }

    static Line (Width, Style){
        let element = document.createElement("hr")
        element.setAttribute("Style", "width: " + Width + "; border: 1px solid var(--CoreX-color); margin:0;" + Style)
        return element
    }

    static Button (Titre, OnClick, Class, Id){
        let element = document.createElement("button")
        if (Class){element.setAttribute("Class", Class)}
        if (Id){element.setAttribute("id", Id)}
        element.innerHTML = Titre
        element.onclick = OnClick
        return element
    }

    static ProgressBar(Id,Class, Style){
        let elementdiv = document.createElement("div")
        elementdiv.setAttribute("style","width: 100%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center; flex-wrap: wrap;")

        let element = document.createElement("progress")
        if (Id){element.setAttribute("id",Id)}
        element.setAttribute("value","0")
        element.setAttribute("max","100")
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        elementdiv.appendChild(element)
        return elementdiv
    }
    
    static ToggleSwitch(Id, Checked, PxHeight){
        let HeightLable = 34
        let Border = 4
        if(PxHeight) {
            HeightLable = PxHeight
        }
        let HeigtSlider = HeightLable - (2 * Border)
        let WidthLable = (1.5 * HeightLable)  + Border
        let translate = (HeightLable / 2)  + Border
        let CheckedData = ""
        if(Checked) {CheckedData = "checked"}
        let element = CoreXBuild.Div("")
        element.innerHTML = `
        <style>
            .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: `+HeightLable+`px;
            }

            .slider:before {
            position: absolute;
            content: "";
            height: `+HeigtSlider+`px;
            width: `+HeigtSlider+`px;
            left: `+Border+`px;
            bottom: `+Border+`px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
            }

            input:checked + .slider {
            background-color: #2196F3;
            }


            input:checked + .slider:before {
            -webkit-transform: translateX(`+translate+`px);
            -ms-transform: translateX(`+translate+`px);
            transform: translateX(`+translate+`px);
            }
        </style>
        <label style="position: relative; display: inline-block; width: `+WidthLable+`px; height: `+HeightLable+`px;">
        <input id="`+Id+`" type="checkbox" `+CheckedData+` style="opacity: 0; width: 0; height: 0;">
        <span class="slider"></span>
        </label>
        `
        return element
    }
}

/** Core de la gestion d'un application par page */
class CoreXApp{
    constructor(){
        this._ContentAppId = "CoreXAppContent"
        this._MyCoreXActionButton = new CoreXActionButton()
        this._MyCoreXActionButton.Start()
        this._ListApplications = new Array()
        document.body.appendChild(CoreXBuild.Div(this._ContentAppId))
    }

    /** Get Set */
    get ContentAppId(){return this._ContentAppId}
    set ContentAppId(NewContentAppId){this._ContentAppId = NewContentAppId}

    /** Vider la vue actuelle */
    ClearView(){
        document.getElementById(this._ContentAppId).innerHTML = ""
        this.ClearActionList()
    }

    /** Load de la vue Start de l'application */
    Start(){
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

    /** Css de base de l'application */
    GetCss(){
        return /*html*/`
        <style>
        .Titre{
            margin: 1% 1% 4% 1%;
            font-size: var(--CoreX-Titrefont-size);
            color: var(--CoreX-color);
        }
        .ContainerCommand{width: 70%;}
        .Text{font-size: var(--CoreX-font-size);}
        .ImageConteneur{
            border: 1px solid black;
            border-radius: 5px;
            width: 14vw;
            height: 14vw;
            cursor: pointer;
            padding: 3px;
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