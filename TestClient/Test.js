class TestCoreXApp{
    constructor(){
        this._MyCoreXActionButton = new CoreXActionButton()
    }
    /** Start de l'application */
    Sart(){
        document.body.innerHTML = this._MyCoreXActionButton.Rendre() + `<div id="TestCSS">coucou les amis</div>`
        this._MyCoreXActionButton.Start()
    }
    ClickTestButton(){
        GlobalCallAPI("Test", "TestDataGreg", this.CallBackTestApi.bind(this), this.ErrCallBackTestApi.bind(this))
    }
    ClickTestCButton(){
        GlobalCallAPI("TestC", "TestData for Fct C", this.CallBackTestApi.bind(this), this.ErrCallBackTestApi.bind(this))
    }
    CallBackTestApi(Data){
        alert(Data)
    }
    ErrCallBackTestApi(Data){
        alert(Data)
    }
}

// Lancement de l'application
let MyApp = new TestCoreXApp()
MyApp.Sart()