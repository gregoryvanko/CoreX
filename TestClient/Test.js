class TestCoreXApp{
    constructor(){
        this._MyCoreXActionButton = new CoreXActionButton()
    }
    /** Start de l'application */
    Sart(){
        document.body.innerHTML = this._MyCoreXActionButton.Rendre() + `<div id="TestCSS">coucou les amis</div>`
        this._MyCoreXActionButton.Start()
    }
}

// Lancement de l'application
let MyApp = new TestCoreXApp()
MyApp.Sart()