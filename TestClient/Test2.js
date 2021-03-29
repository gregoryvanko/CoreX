class TestCoreXApp2{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())
    }
    
    /** Start de l'application */
    Start(){
        //*** Test CoreXBuild
        this._DivApp.appendChild(CoreXBuild.DivTexte("Titre Page Test2", "Titre", "", "margin-top:4%"))
        
    }
    
    GetTitre(){
        return ""
    }
    GetImgSrc(){
        return ""
    }
}

//*** Ajout de l'application 
let App3 = new TestCoreXApp2()
GlobalCoreXAddApp("Test2", "",App3.Start.bind(App3))