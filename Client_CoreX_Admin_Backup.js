class CoreXAdminBackupApp{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
        this._JobScheduleHour = null
        this._JobScheduleMinute = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        this._DivApp.innerHTML=""
        // Add CSS
        this._DivApp.innerHTML = this.GetCss()
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Backup of DB", "CoreXAdminBackupTitre", "", "margin-top:4%"))
        // on ajoute un espace vide
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Content des controles du backup
        let ContentControle = CoreXBuild.Div("ContentControle","","")
        this._DivApp.appendChild(ContentControle)
        // on ajoute un espace vide
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // on construit le texte du message d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("Waiting for scheduler data...","InfoStart","CoreXAdminBackupText","text-align: center; color: grey;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorStart","CoreXAdminBackupText","color:red; text-align: center;"))
        // on ajoute un espace vide en fin de page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Get scheduler data
        let ApiData = new Object()
        ApiData.Fct = "GetSchedulerData"
        ApiData.Data = null
        GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
            if (reponse.GoogleKeyExist){
                this.SetBackupView(ContentControle, reponse.SchedulerData)
            } else {
                this.SetGoogleKeyView(ContentControle)
            }
        },(erreur)=>{
            document.getElementById("InfoStart").innerHTML=""
            document.getElementById("ErrorStart").innerHTML=erreur
        })
    }

    GetTitre(){
        return "Backup"
    }
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTM4NzkuOSwzNTE3LjljLTg2MC44LTg3LjUtMTYxMS44LTYxNi42LTE5NzYuMS0xMzk0LjFjLTgzLjQtMTc3LjEtMTczLTQ2Mi0xOTMuMy02MTYuNmMtMTIuMi05Ny43LTEyLjItOTcuNy0xMzIuMy0xNDYuNWMtMTY2LjktNjUuMS00MjMuMy0yMjEuOC01OTIuMi0zNTguMkMzOTkuOSw1MjIuMiw2Ni4xLTIzMC44LDEwMi43LTk4OS45YzQ2LjgtMTAwOS40LDcyMi41LTE4OTYuNywxNjc2LjktMjIwNi4xYzM2Ni4zLTExOCwyMjcuOS0xMTQsMzIxOS42LTExNGMyOTkxLjYsMCwyODUzLjMtNC4xLDMyMTkuNiwxMTRjMTA3NC41LDM0OCwxNzg0LjgsMTQzMi43LDE2NjguOCwyNTQ2Qzk3OTguMSwxOTQuNiw5MzI4LDg5Ni43LDg1OTUuMywxMjc5LjNjLTE2MC44LDg1LjUtNDcyLjEsMTk1LjQtNjQ3LjIsMjMyYy00MC43LDguMS03NS4zLDUwLjktMTQ0LjUsMTY4LjljLTIxNS43LDM3MC40LTU2MS43LDYzOS05NzYuOSw3NjEuMWMtMTE0LDM0LjYtMjE1LjcsNDYuOC00MzMuNSw1MC45bC0yODIuOSw2LjFsLTExNCwxMzguNEM1NDc5LjUsMzI2MS41LDQ2NjcuNSwzNTk5LjMsMzg3OS45LDM1MTcuOXogTTQ1MzcuMywzMTY5LjljMzE5LjUtNjUuMSw2MTIuNi0xOTcuNCw4NjctMzkyLjhjMTU2LjctMTIyLjEsMzgyLjYtMzY0LjMsNDgwLjMtNTE2LjljNjUuMS0xMDEuOCw4OS41LTEyNi4yLDEyMi4xLTExNmMxMzQuMywzNC42LDM0My45LDUyLjksNDc2LjIsNDIuOGM0NzQuMi00NC44LDg3OS4yLTMyMS42LDEwOTIuOC03NTVsOTUuNy0xOTEuM2wxNDQuNS0yNC40YzcyMi41LTEyMC4xLDEzNDcuMi02MjQuOCwxNjIwLTEzMTAuNmMxNDIuNS0zNTQuMSwxODcuMi04MzQuNCwxMTEuOS0xMjAwLjdjLTg5LjYtNDMxLjUtMjY2LjYtNzU1LTU5MC4yLTEwNzguNmMtMjUyLjQtMjUyLjMtNDQ1LjctMzgwLjYtNzQ2LjktNDkyLjVjLTM4Ni43LTE0Ni41LTIxNS43LTEzOC40LTMyMDEuMi0xMzguNGMtMjg4MS43LDAtMjgwMi40LTItMzEzNC4xLDEwNS44Yy0zMTMuNCwxMDEuNy01NjkuOCwyNTguNS04MjAuMSw1MDIuN0M1ODkuMS0xOTQ0LjMsMzY3LjMtMTMzNy45LDQyMi4yLTY3OC41YzQwLjcsNDg2LjQsMjUwLjMsOTI2LDYwOC41LDEyODguMmMyNDYuMywyNDguMyw1MDQuNyw0MTEuMSw4MTQsNTE2LjlsMTMwLjMsNDQuOGwzNC42LDIwMy41YzQ0LjgsMjc2LjgsMTA1LjgsNDcwLjEsMjEzLjcsNjc5LjdjMTIwLjEsMjMyLDE5OS40LDM0MS45LDM4OC43LDUzMy4yQzMxMTIuNywzMDk0LjYsMzgzNy4yLDMzMTIuNCw0NTM3LjMsMzE2OS45eiIvPjxwYXRoIGQ9Ik00Nzg1LjYsMTU2Mi4yYy01MjMtNzEuMi0xMDEzLjUtMzQ2LTEzMzcuMS03NDguOWMtMTU4LjctMTk3LjQtMjk1LjEtNDYyLTM3Ni41LTcyNC41Yy01MC45LTE2OC45LTU0LjktMjA5LjYtNTQuOS01MzkuM2MwLTM4Ni43LDEyLjItNDY0LDEzNC4zLTc3OS41YzE4NS4yLTQ4Mi4zLDY1MS4yLTkzOC4yLDExNTEuOS0xMTI1LjRjMjg5LTEwNy45LDQ3NC4yLTEzNi40LDgwNS45LTEyNC4yYzMzMS43LDEyLjIsNTE0LjksNTIuOSw3NzMuMywxNzNjMjM0LjEsMTA5LjksNDAzLDIyNy45LDU4NC4xLDQwOS4xYzI2Mi41LDI2Mi41LDQ0NS43LDU4NC4xLDUzMS4yLDkyOGMyNi40LDEwMS44LDQ4LjgsMTg3LjIsNTAuOSwxOTEuM2M0LjEsNi4xLDgxLjQtNjUuMSwxNzUtMTU2LjdjMTc3LjEtMTcxLDIzMi0xOTkuNCwzNTQuMS0xODEuMWMxNDQuNSwyNC40LDIzOC4xLDE4My4yLDE5MS4zLDMyMy42Yy0xNi4zLDQ2LjgtMTUyLjYsMTk5LjQtNDQ1LjcsNDg4LjRjLTM1NC4xLDM1Mi4xLTQzMy41LDQyMy4zLTQ5Ni42LDQzMy41Yy00MC43LDguMS05NS43LDguMS0xMjIuMSwwYy0yNC40LTguMS0yMzYuMS0yMDMuNS00NzAuMS00MzUuNWMtNDc2LjItNDcyLjItNDk0LjYtNTAyLjctNDI1LjQtNjU5LjRjNTktMTMwLjMsMjE3LjgtMTkzLjMsMzM1LjgtMTM0LjNjMjQuNCwxMi4yLDExNiw5MS42LDIwMy41LDE3N2M4OS42LDg5LjYsMTU2LjcsMTQyLjUsMTU2LjcsMTI0LjJjMC0xOC4zLTE2LjMtODEuNC0zOC43LTE0Mi41Yy0xMzIuMy0zODYuNy00MDctNzAwLjEtNzY1LjItODczLjFjLTI0OC4zLTEyMC4xLTM4Ni43LTE1MC42LTY4MS44LTE1MC42Yy0yMzQsMC0yNzAuNyw2LjEtNDQ1LjcsNjcuMWMtMjQ4LjMsODMuNC00MDMsMTc5LjEtNTg4LjIsMzU2LjJjLTM0NiwzMzMuNy01MTYuOSw4MTAtNDUzLjgsMTI2My44QzM2NjYuMiw2ODcuMSw0NTkyLjIsMTI2OS4xLDU1MTYuMiw5NzRjMTc5LjEtNTcsMjExLjctNjMuMSwyNzguOC00Mi43YzExNiwzNC42LDE4MS4xLDEyNC4xLDE4MS4xLDI1MC4zYzAsODcuNS04LjEsMTA5LjktNjUuMSwxNjYuOWMtNjkuMiw2Ny4yLTI3Ni44LDE0OC42LTQ5NC41LDE5My4zQzUyNTUuNywxNTcyLjQsNDk0Mi4zLDE1ODQuNiw0Nzg1LjYsMTU2Mi4yeiIvPjwvZz48L2c+DQo8L3N2Zz4="
    }

    /**
     * Affiche la vue de commande des backup
     * @param {div} Div element div qui contiendra la vue
     * @param {array} Data All data of schduler
     */
    SetBackupView(DivContent, Data){
        this._JobScheduleHour = Data.JobScheduleHour
        this._JobScheduleMinute = Data.JobScheduleMinute
        // vider les textes
        DivContent.innerHTML = ""
        document.getElementById("InfoStart").innerHTML=""
        document.getElementById("ErrorStart").innerHTML=""
        // Backup now
        let DivBackupNowSection = CoreXBuild.DivFlexRowStart()
        DivBackupNowSection.style.margin = "2vh 0px 2vh 0px"
        let txtBackupNow = CoreXBuild.DivTexte("Backup now the DB :", "", "CoreXAdminBackupText", "margin:1%;")
        txtBackupNow.classList.add("CoreXAdminBackupWidthInfoText")
        DivBackupNowSection.appendChild(txtBackupNow)
        DivBackupNowSection.appendChild(CoreXBuild.Button("Backup",this.BackupNow.bind(this),"CoreXAdminBackupButton"))
        DivContent.appendChild(DivBackupNowSection)
        // Restore now
        let DivRstoreNowSection = CoreXBuild.DivFlexRowStart()
        DivRstoreNowSection.style.margin = "2vh 0px 2vh 0px"
        let txtRestoreNow = CoreXBuild.DivTexte("Restore now the DB :", "", "CoreXAdminBackupText", "margin:1%;")
        txtRestoreNow.classList.add("CoreXAdminBackupWidthInfoText")
        DivRstoreNowSection.appendChild(txtRestoreNow)
        DivRstoreNowSection.appendChild(CoreXBuild.Button("Restore",this.RestoreNow.bind(this),"CoreXAdminBackupButton"))
        DivContent.appendChild(DivRstoreNowSection)
        // on ajoute un espace vide
        DivContent.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Scheduler status
        let DivSchedulerStartedSection = CoreXBuild.DivFlexRowStart()
        DivSchedulerStartedSection.style.margin = "2vh 0px 2vh 0px"
        let txtSchedulerStarted = CoreXBuild.DivTexte("Scheduler status :", "", "CoreXAdminBackupText", "margin:1%;")
        txtSchedulerStarted.classList.add("CoreXAdminBackupWidthInfoText")
        DivSchedulerStartedSection.appendChild(txtSchedulerStarted)
        let ToogleScheduler = CoreXBuild.ToggleSwitch("SchedulerStarted",Data.JobScheduleStarted,30)
        DivSchedulerStartedSection.appendChild(ToogleScheduler)
        let me = this
        ToogleScheduler.addEventListener('change', (event) => {
            if (event.target.checked) {
                me.SchedulerSetStatus(true)
            } else {
                me.SchedulerSetStatus(false)
            }
        })
        DivContent.appendChild(DivSchedulerStartedSection)
        // Scheduler next 
        let DivSchedulerNextSection = CoreXBuild.DivFlexRowStart()
        DivSchedulerNextSection.style.margin = "2vh 0px 2vh 0px"
        let txtSchedulerNext = CoreXBuild.DivTexte("Scheduler next time :", "", "CoreXAdminBackupText", "margin:1%;")
        txtSchedulerNext.classList.add("CoreXAdminBackupWidthInfoText")
        DivSchedulerNextSection.appendChild(txtSchedulerNext)
        DivSchedulerNextSection.appendChild(CoreXBuild.DivTexte(Data.JobScheduleNext,"SchedulerConfigNext","CoreXAdminBackupText","margin:1%;"))
        DivContent.appendChild(DivSchedulerNextSection)
        // Scheduler configuration
        let DivSchedulerConfigSection = CoreXBuild.DivFlexRowStart()
        DivSchedulerConfigSection.style.margin = "2vh 0px 2vh 0px"
        let txtSchedulerConfig = CoreXBuild.DivTexte("Scheduler time :", "", "CoreXAdminBackupText", "margin:1%;")
        txtSchedulerConfig.classList.add("CoreXAdminBackupWidthInfoText")
        DivSchedulerConfigSection.appendChild(txtSchedulerConfig)
        DivSchedulerConfigSection.appendChild(CoreXBuild.DivTexte(this._JobScheduleHour +"H" + this._JobScheduleMinute,"SchedulerConfigTxt","CoreXAdminBackupText","margin:1%;"))
        DivContent.appendChild(DivSchedulerConfigSection)
        // Scheduler change config
        let DivSchedulerChangeConfSection = CoreXBuild.DivFlexRowStart()
        DivSchedulerChangeConfSection.style.margin = "2vh 0px 2vh 0px"
        let txtSchedulerChangeConf = CoreXBuild.DivTexte("Change Scheduler time:", "", "CoreXAdminBackupText", "margin:1%;")
        txtSchedulerChangeConf.classList.add("CoreXAdminBackupWidthInfoText")
        DivSchedulerChangeConfSection.appendChild(txtSchedulerChangeConf)
        DivSchedulerChangeConfSection.appendChild(CoreXBuild.Button("Change",this.SchedulerChangeConfig.bind(this),"CoreXAdminBackupButton"))
        DivContent.appendChild(DivSchedulerChangeConfSection)
        // on ajoute un espace vide
        DivContent.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Update Google Key
        let DivGoogleKeySection = CoreXBuild.DivFlexRowStart()
        DivGoogleKeySection.style.margin = "2vh 0px 2vh 0px"
        let txtGoogleKeyNow = CoreXBuild.DivTexte("Update Google Key :", "", "CoreXAdminBackupText", "margin:1%;")
        txtGoogleKeyNow.classList.add("CoreXAdminBackupWidthInfoText")
        DivGoogleKeySection.appendChild(txtGoogleKeyNow)
        DivGoogleKeySection.appendChild(CoreXBuild.Button("Update Key",this.SetGoogleKeyView.bind(this, document.getElementById("ContentControle")),"CoreXAdminBackupButton"))
        DivContent.appendChild(DivGoogleKeySection)
    }
    /**
     * Affiche la vue qui permet d'enregistrer la clef google
     * @param {div} DivContent element div qui contiendra la vue
     */
    SetGoogleKeyView(DivContent){
        // vider les textes
        DivContent.innerHTML = ""
        document.getElementById("InfoStart").innerHTML=""
        document.getElementById("ErrorStart").innerHTML=""
        let DivFlexContent = CoreXBuild.DivFlexColumn("DivFlexContent")
        DivContent.appendChild(DivFlexContent)
        let Textareafolder = CoreXBuild.Textarea("Googlefolder", "Insert folder key", "CoreXAdminBackupTextArea")
        Textareafolder.setAttribute("rows", "1")
        DivFlexContent.appendChild(Textareafolder)
        DivFlexContent.appendChild(CoreXBuild.Div("","","height:2vh;"))
        DivFlexContent.appendChild(CoreXBuild.Textarea("GoogleKey", "Insert google key", "CoreXAdminBackupTextAreaBig"))
        let DivButton = CoreXBuild.Div("", "CoreXAdminBackupFlexRowCenterspacearound", "width:90%; margin-top:1%;")
        DivFlexContent.appendChild(DivButton)
        DivButton.appendChild(CoreXBuild.Button("Save google key",this.SaveGoogleKey.bind(this),"CoreXAdminBackupButton"))
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.Start.bind(this),"CoreXAdminBackupButton"))
        // on ajoute un espace vide
        DivFlexContent.appendChild(CoreXBuild.Div("","","height:2vh;"))
    }

    /** Backup Now */
    BackupNow(){
        // Wainting text
        document.getElementById("InfoStart").innerHTML="Backup in progress..."
        document.getElementById("ErrorStart").innerHTML=""
        // Get All Log
        let ApiData = new Object()
        ApiData.Fct = "BackupNow"
        ApiData.Data = null
        GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
            document.getElementById("InfoStart").innerHTML=reponse
        },(erreur)=>{
            document.getElementById("InfoStart").innerHTML=""
            document.getElementById("ErrorStart").innerHTML=erreur
        })
    }
    /** Restore Now */
    RestoreNow(){
        // Wainting text
        document.getElementById("InfoStart").innerHTML="Restore in progress..."
        document.getElementById("ErrorStart").innerHTML=""
        // Get All Log
        let ApiData = new Object()
        ApiData.Fct = "RestoreNow"
        ApiData.Data = null
        GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
            document.getElementById("InfoStart").innerHTML=reponse
        },(erreur)=>{
            document.getElementById("InfoStart").innerHTML=""
            document.getElementById("ErrorStart").innerHTML=erreur
        })
    }

    /**
     * Start and stop scheduler
     * @param {boolean} Value true to start scheduler
     */
    SchedulerSetStatus(Value){
        document.getElementById("ErrorStart").innerHTML=""
        let ApiData = new Object()
        ApiData.Fct = "SchedulerSetStatus"
        ApiData.Started = Value
        GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
            this._JobScheduleHour = reponse.JobScheduleHour
            this._JobScheduleMinute = reponse.JobScheduleMinute
            document.getElementById("SchedulerConfigNext").innerHTML= reponse.JobScheduleNext
            document.getElementById("SchedulerConfigTxt").innerHTML= this._JobScheduleHour +"H" + this._JobScheduleMinute
        },(erreur)=>{
            document.getElementById("ErrorStart").innerHTML=erreur
            if (Value){ 
                document.getElementById("SchedulerStarted").checked = false
            } else {
                document.getElementById("SchedulerStarted").checked = true
            }
        })
    }
    /**
     * Change confiuguration of scheduler
     */
    SchedulerChangeConfig(){
        let ContentConfig = CoreXBuild.Div("ContentControle","","")
        // Titre
        ContentConfig.appendChild(CoreXBuild.DivTexte("Scheduler timer configuration:", "", "CoreXAdminBackupText", "margin:1%; color: var(--CoreX-color);"))
        // on ajoute un espace vide
        ContentConfig.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Hour
        let DivHourSection = CoreXBuild.DivFlexRowStart()
        let txtHour = CoreXBuild.DivTexte("Scheduler Hour:", "", "CoreXAdminBackupText", "margin:1%; width:50%;")
        DivHourSection.appendChild(txtHour)
        let InputHour = CoreXBuild.Input("Schedulerhour",this._JobScheduleHour,"CoreXAdminBackupInput","","number","Schedulerhour","")
        InputHour.setAttribute("min", 0)
        InputHour.setAttribute("max", 23)
        DivHourSection.appendChild(InputHour)
        ContentConfig.appendChild(DivHourSection)
        // Minute
        let DivMinuteSection = CoreXBuild.DivFlexRowStart()
        let txtMinute = CoreXBuild.DivTexte("Scheduler Minute:", "", "CoreXAdminBackupText", "margin:1%; width:50%;")
        DivMinuteSection.appendChild(txtMinute)
        let inputMinute = CoreXBuild.Input("SchedulerMinute",this._JobScheduleMinute,"CoreXAdminBackupInput","","number","SchedulerMinute","")
        inputMinute.setAttribute("min", 0)
        inputMinute.setAttribute("max", 59)
        DivMinuteSection.appendChild(inputMinute)
        ContentConfig.appendChild(DivMinuteSection)
        // Error text
        ContentConfig.appendChild(CoreXBuild.DivTexte("","ErrorConfig","CoreXAdminBackupText","color:red; text-align: center;"))
        // Save button
        let DivButton = CoreXBuild.Div("", "CoreXAdminBackupFlexRowCenterspacearound", "margin-top:1%;")
        ContentConfig.appendChild(DivButton)
        DivButton.appendChild(CoreXBuild.Button("Save",this.SchedulerSaveConfig.bind(this),"CoreXAdminBackupButton", "ButtonSave"))
        // Create window
        CoreXWindow.BuildWindow(ContentConfig)
    }
    /**
     * Save Scheduler config
     */
    SchedulerSaveConfig(){
        document.getElementById("ErrorConfig").innerHTML=""
        let Hour = document.getElementById("Schedulerhour").value
        let Minute = document.getElementById("SchedulerMinute").value
        let valide = true
        if ((Hour < 0)||(Hour >= 24)){
            valide = false
            document.getElementById("ErrorConfig").innerHTML= "Error: Hour must be between 0 and 23"
        }
        if ((Minute < 0)||(Minute >= 60)){
            valide = false
            document.getElementById("ErrorConfig").innerHTML= "Error: Minute must be between 0 and 59"
        }
        if (valide){
            document.getElementById("ButtonSave").innerHTML="waiting..."
            // Save Data
            let ApiData = new Object()
            ApiData.Fct = "SaveConfig"
            ApiData.Hour = Hour
            ApiData.Minute = Minute
            GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
                this._JobScheduleHour = reponse.JobScheduleHour
                this._JobScheduleMinute = reponse.JobScheduleMinute
                document.getElementById("SchedulerConfigNext").innerHTML= reponse.JobScheduleNext
                document.getElementById("SchedulerConfigTxt").innerHTML= this._JobScheduleHour +"H" + this._JobScheduleMinute
                CoreXWindow.DeleteWindow()
            },(erreur)=>{
                document.getElementById("ErrorConfig").innerHTML=erreur
            })
        }
    }

    /**
     * Save Google key
     */
    SaveGoogleKey(){
        let key = document.getElementById("GoogleKey").value
        let folder = document.getElementById("Googlefolder").value
        if((key == "") || (folder == "")){
            document.getElementById("ErrorStart").innerHTML="Empty value for key of folder!"
        } else {
            // On vide le content
            document.getElementById("ContentControle").innerHTML=""
            document.getElementById("InfoStart").innerHTML="Waiting for saving key in BD..."
            document.getElementById("ErrorStart").innerHTML=""
            // Save Data
            let ApiData = new Object()
            ApiData.Fct = "SaveGoogleKey"
            ApiData.key = key
            ApiData.folder = folder
            GlobalCallApiPromise("Backup", ApiData).then((reponse)=>{
                this.Start()
            },(erreur)=>{
                document.getElementById("InfoStart").innerHTML=""
                document.getElementById("ErrorStart").innerHTML=erreur
            })
        }
    }

    /** Css de l'application */
    GetCss(){
        return /*html*/`
        <style>
            #CoreXAdminBackupTitre{
                margin: 1% 1% 4% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .CoreXAdminBackupText{font-size: var(--CoreX-font-size);}
            .CoreXAdminBackupButton{
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
            .CoreXAdminBackupButton:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }
            .CoreXAdminBackupInput {
                width: 20%;
                font-size: var(--CoreX-font-size);
                padding: 1vh;
                border: solid 0px #dcdcdc;
                border-bottom: solid 1px transparent;
                margin: 1% 0px 1% 0px;
            }
            .CoreXAdminBackupInput:focus,
            .CoreXAdminBackupInput.focus {
                outline: none;
                border: solid 0px #707070;
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }
            .CoreXAdminBackupInput:hover{
                border-bottom-width: 1px;
                border-color: var(--CoreX-color);
            }
            .CoreXAdminBackupWidthInfoText{width:25%;}
            .CoreXAdminBackupFlexRowCenterspacearound{
                display: flex;
                flex-direction: row;
                justify-content:space-around;
                align-content:center;
                align-items: center;
                flex-wrap: wrap;
            }
            .CoreXAdminBackupTextArea{
                outline: none;
                resize: none;
                overflow: auto;
                padding: 1%;
                font-size: var(--CoreX-font-size);
                width:70%;
            }
            .CoreXAdminBackupTextAreaBig{
                outline: none;
                resize: none;
                overflow: auto;
                padding: 1%;
                font-size: var(--CoreX-font-size);
                width:70%;
                height: 40vh;
            }

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #CoreXAdminBackupTitre{font-size: var(--CoreX-TitreIphone-font-size);}
                .CoreXAdminBackupText{font-size: var(--CoreX-Iphone-font-size);}
                .CoreXAdminBackupButton{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
                .CoreXAdminBackupInput {
                    font-size: var(--CoreX-Iphone-font-size);
                    border-bottom: solid 1px #dcdcdc;
                }
                .CoreXAdminBackupWidthInfoText{width:50%;}
                .CoreXAdminBackupTextArea{
                    font-size: var(--CoreX-Iphone-font-size);
                    width:90%;
                }
                .CoreXAdminBackupTextAreaBig{
                    font-size: var(--CoreX-Iphone-font-size);
                    width:90%;
                }
            }
            @media screen and (min-width: 1200px)
            {
                #CoreXAdminBackupTitre{font-size: var(--CoreX-TitreMax-font-size);}
                .CoreXAdminBackupText{font-size: var(--CoreX-Max-font-size);}
                .CoreXAdminBackupButton{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
                .CoreXAdminBackupInput {font-size: var(--CoreX-Max-font-size);}
                .CoreXAdminBackupTextArea{font-size: var(--CoreX-Max-font-size);}
                .CoreXAdminBackupTextAreaBig{font-size: var(--CoreX-Max-font-size);}
            }
        </style>`
    }
}