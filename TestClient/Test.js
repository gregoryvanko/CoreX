class TestCoreXApp{
    constructor(HtmlId){
        this._HtmlId = HtmlId
    }
    /** Start de l'application */
    Start(){
        document.getElementById(this._HtmlId).innerHTML = `<div id="TestCSS">coucou les amis</div>`
        GlobalAddActionInList("Test 1", this.ClickTestButton.bind(this))
        GlobalAddActionInList("Test 2", this.ClickTestCButton.bind(this))
    }
    ClickTestButton(){
        GlobalCallApiPromise("Test", "TestDataGreg").then((reponse)=>{
            alert(reponse)
        },(erreur)=>{
            alert(erreur)
        })
    }
    ClickTestCButton(){
        GlobalCallApiPromise("TestC", "TestData for Fct C").then((reponse)=>{
            GlobalClearActionList()
            alert(reponse)
        },(erreur)=>{
            alert(erreur)
        })
    }
}


// Creation de l'application
let MyApp = new CoreXApp()
// Fonction globale GetContentAppId
function GlobalGetContentAppId() {
    return MyApp.ContentAppId
}
// Fonction globale GlobalClearActionList
function GlobalClearActionList() {
    MyApp.ClearActionList()
}
// Fonction gloable AddActionInList
function GlobalAddActionInList(Titre, Action) {
    MyApp.AddActionInList(Titre, Action)
}



// Creation de l'application 1
let App1 = new TestCoreXApp(GlobalGetContentAppId())
// Ajout de l'application 1
MyApp.AddApp("App1", "",App1.Start.bind(App1))

// Lancement de l'application
MyApp.Start()