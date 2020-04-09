class CoreXAdminBackupApp{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        document.getElementById(this._HtmlId).innerHTML = ""
        // Add CSS
        document.getElementById(this._HtmlId).innerHTML = this.GetCss()
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Backup of DB", "Titre", "", "margin-top:4%"))
        // on ajoute un espace vide
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Backup now
        let DivBackupNowSection = CoreXBuild.DivFlexRowStart()
        DivBackupNowSection.style.margin = "2vh 0px 2vh 0px"
        let txtBackupNow = CoreXBuild.DivTexte("Backup now the DB :", "", "Text", "margin:1%;")
        txtBackupNow.classList.add("WidthInfoText")
        DivBackupNowSection.appendChild(txtBackupNow)
        DivBackupNowSection.appendChild(CoreXBuild.Button("Backup",this.BackupNow.bind(this),"Button"))
        this._DivApp.appendChild(DivBackupNowSection)
        // Restore now
        let DivRstoreNowSection = CoreXBuild.DivFlexRowStart()
        DivRstoreNowSection.style.margin = "2vh 0px 2vh 0px"
        let txtRestoreNow = CoreXBuild.DivTexte("Restore now the DB :", "", "Text", "margin:1%;")
        txtRestoreNow.classList.add("WidthInfoText")
        DivRstoreNowSection.appendChild(txtRestoreNow)
        DivRstoreNowSection.appendChild(CoreXBuild.Button("Restore",this.RestoreNow.bind(this),"Button"))
        this._DivApp.appendChild(DivRstoreNowSection)
        // on ajoute un espace vide
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // on construit le texte du message d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("","InfoStart","Text","text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorStart","Text","color:red; text-align: center;"))
    }
    GetTitre(){
        return "Backup"
    }
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTM4NzkuOSwzNTE3LjljLTg2MC44LTg3LjUtMTYxMS44LTYxNi42LTE5NzYuMS0xMzk0LjFjLTgzLjQtMTc3LjEtMTczLTQ2Mi0xOTMuMy02MTYuNmMtMTIuMi05Ny43LTEyLjItOTcuNy0xMzIuMy0xNDYuNWMtMTY2LjktNjUuMS00MjMuMy0yMjEuOC01OTIuMi0zNTguMkMzOTkuOSw1MjIuMiw2Ni4xLTIzMC44LDEwMi43LTk4OS45YzQ2LjgtMTAwOS40LDcyMi41LTE4OTYuNywxNjc2LjktMjIwNi4xYzM2Ni4zLTExOCwyMjcuOS0xMTQsMzIxOS42LTExNGMyOTkxLjYsMCwyODUzLjMtNC4xLDMyMTkuNiwxMTRjMTA3NC41LDM0OCwxNzg0LjgsMTQzMi43LDE2NjguOCwyNTQ2Qzk3OTguMSwxOTQuNiw5MzI4LDg5Ni43LDg1OTUuMywxMjc5LjNjLTE2MC44LDg1LjUtNDcyLjEsMTk1LjQtNjQ3LjIsMjMyYy00MC43LDguMS03NS4zLDUwLjktMTQ0LjUsMTY4LjljLTIxNS43LDM3MC40LTU2MS43LDYzOS05NzYuOSw3NjEuMWMtMTE0LDM0LjYtMjE1LjcsNDYuOC00MzMuNSw1MC45bC0yODIuOSw2LjFsLTExNCwxMzguNEM1NDc5LjUsMzI2MS41LDQ2NjcuNSwzNTk5LjMsMzg3OS45LDM1MTcuOXogTTQ1MzcuMywzMTY5LjljMzE5LjUtNjUuMSw2MTIuNi0xOTcuNCw4NjctMzkyLjhjMTU2LjctMTIyLjEsMzgyLjYtMzY0LjMsNDgwLjMtNTE2LjljNjUuMS0xMDEuOCw4OS41LTEyNi4yLDEyMi4xLTExNmMxMzQuMywzNC42LDM0My45LDUyLjksNDc2LjIsNDIuOGM0NzQuMi00NC44LDg3OS4yLTMyMS42LDEwOTIuOC03NTVsOTUuNy0xOTEuM2wxNDQuNS0yNC40YzcyMi41LTEyMC4xLDEzNDcuMi02MjQuOCwxNjIwLTEzMTAuNmMxNDIuNS0zNTQuMSwxODcuMi04MzQuNCwxMTEuOS0xMjAwLjdjLTg5LjYtNDMxLjUtMjY2LjYtNzU1LTU5MC4yLTEwNzguNmMtMjUyLjQtMjUyLjMtNDQ1LjctMzgwLjYtNzQ2LjktNDkyLjVjLTM4Ni43LTE0Ni41LTIxNS43LTEzOC40LTMyMDEuMi0xMzguNGMtMjg4MS43LDAtMjgwMi40LTItMzEzNC4xLDEwNS44Yy0zMTMuNCwxMDEuNy01NjkuOCwyNTguNS04MjAuMSw1MDIuN0M1ODkuMS0xOTQ0LjMsMzY3LjMtMTMzNy45LDQyMi4yLTY3OC41YzQwLjcsNDg2LjQsMjUwLjMsOTI2LDYwOC41LDEyODguMmMyNDYuMywyNDguMyw1MDQuNyw0MTEuMSw4MTQsNTE2LjlsMTMwLjMsNDQuOGwzNC42LDIwMy41YzQ0LjgsMjc2LjgsMTA1LjgsNDcwLjEsMjEzLjcsNjc5LjdjMTIwLjEsMjMyLDE5OS40LDM0MS45LDM4OC43LDUzMy4yQzMxMTIuNywzMDk0LjYsMzgzNy4yLDMzMTIuNCw0NTM3LjMsMzE2OS45eiIvPjxwYXRoIGQ9Ik00Nzg1LjYsMTU2Mi4yYy01MjMtNzEuMi0xMDEzLjUtMzQ2LTEzMzcuMS03NDguOWMtMTU4LjctMTk3LjQtMjk1LjEtNDYyLTM3Ni41LTcyNC41Yy01MC45LTE2OC45LTU0LjktMjA5LjYtNTQuOS01MzkuM2MwLTM4Ni43LDEyLjItNDY0LDEzNC4zLTc3OS41YzE4NS4yLTQ4Mi4zLDY1MS4yLTkzOC4yLDExNTEuOS0xMTI1LjRjMjg5LTEwNy45LDQ3NC4yLTEzNi40LDgwNS45LTEyNC4yYzMzMS43LDEyLjIsNTE0LjksNTIuOSw3NzMuMywxNzNjMjM0LjEsMTA5LjksNDAzLDIyNy45LDU4NC4xLDQwOS4xYzI2Mi41LDI2Mi41LDQ0NS43LDU4NC4xLDUzMS4yLDkyOGMyNi40LDEwMS44LDQ4LjgsMTg3LjIsNTAuOSwxOTEuM2M0LjEsNi4xLDgxLjQtNjUuMSwxNzUtMTU2LjdjMTc3LjEtMTcxLDIzMi0xOTkuNCwzNTQuMS0xODEuMWMxNDQuNSwyNC40LDIzOC4xLDE4My4yLDE5MS4zLDMyMy42Yy0xNi4zLDQ2LjgtMTUyLjYsMTk5LjQtNDQ1LjcsNDg4LjRjLTM1NC4xLDM1Mi4xLTQzMy41LDQyMy4zLTQ5Ni42LDQzMy41Yy00MC43LDguMS05NS43LDguMS0xMjIuMSwwYy0yNC40LTguMS0yMzYuMS0yMDMuNS00NzAuMS00MzUuNWMtNDc2LjItNDcyLjItNDk0LjYtNTAyLjctNDI1LjQtNjU5LjRjNTktMTMwLjMsMjE3LjgtMTkzLjMsMzM1LjgtMTM0LjNjMjQuNCwxMi4yLDExNiw5MS42LDIwMy41LDE3N2M4OS42LDg5LjYsMTU2LjcsMTQyLjUsMTU2LjcsMTI0LjJjMC0xOC4zLTE2LjMtODEuNC0zOC43LTE0Mi41Yy0xMzIuMy0zODYuNy00MDctNzAwLjEtNzY1LjItODczLjFjLTI0OC4zLTEyMC4xLTM4Ni43LTE1MC42LTY4MS44LTE1MC42Yy0yMzQsMC0yNzAuNyw2LjEtNDQ1LjcsNjcuMWMtMjQ4LjMsODMuNC00MDMsMTc5LjEtNTg4LjIsMzU2LjJjLTM0NiwzMzMuNy01MTYuOSw4MTAtNDUzLjgsMTI2My44QzM2NjYuMiw2ODcuMSw0NTkyLjIsMTI2OS4xLDU1MTYuMiw5NzRjMTc5LjEtNTcsMjExLjctNjMuMSwyNzguOC00Mi43YzExNiwzNC42LDE4MS4xLDEyNC4xLDE4MS4xLDI1MC4zYzAsODcuNS04LjEsMTA5LjktNjUuMSwxNjYuOWMtNjkuMiw2Ny4yLTI3Ni44LDE0OC42LTQ5NC41LDE5My4zQzUyNTUuNywxNTcyLjQsNDk0Mi4zLDE1ODQuNiw0Nzg1LjYsMTU2Mi4yeiIvPjwvZz48L2c+DQo8L3N2Zz4="
    }

    /** Backup Now */
    BackupNow(){
        // Wainting text
        document.getElementById("InfoStart").innerHTML="Backup in progress"
        document.getElementById("ErrorStart").innerHTML=""
        // Get All Log
        GlobalCallApiPromise("Backup", "BackupNow").then((reponse)=>{
            document.getElementById("InfoStart").innerHTML=reponse
        },(erreur)=>{
            document.getElementById("InfoStart").innerHTML=""
            document.getElementById("ErrorStart").innerHTML=erreur
        })
    }
    /** Restore Now */
    RestoreNow(){
        // Wainting text
        document.getElementById("InfoStart").innerHTML="Restore in progress"
        document.getElementById("ErrorStart").innerHTML=""
        // Get All Log
        GlobalCallApiPromise("Backup", "RestoreNow").then((reponse)=>{
            document.getElementById("InfoStart").innerHTML=reponse + " Page reload in 3sec"
            setTimeout(function(){ location.reload() }, 3000)
        },(erreur)=>{
            document.getElementById("InfoStart").innerHTML=""
            document.getElementById("ErrorStart").innerHTML=erreur
        })
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
            .Button{
                margin: 0%;
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
            .WidthInfoText{width:25%;}

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
                .Text{font-size: var(--CoreX-Iphone-font-size);}
                .Button{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
                .WidthInfoText{width:50%;}
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