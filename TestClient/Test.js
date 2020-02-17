class TestCoreXApp{
    constructor(){
        this._MyCoreXActionButton = new CoreXActionButton()
    }
    /** Start de l'application */
    Sart(){
        document.body.innerHTML = `<div id="TestCSS">coucou les amis</div>`
        this._MyCoreXActionButton.Start()
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
            alert(reponse)
        },(erreur)=>{
            alert(erreur)
        })
    }
}

// Lancement de l'application
let MyApp = new TestCoreXApp()
MyApp.Sart()