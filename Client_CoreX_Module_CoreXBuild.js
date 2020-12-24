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
        element.innerText = Texte
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

    static ButtonLeftAction(OnClick, Id){
        let divconent = document.createElement("div")
        if (Id){divconent.setAttribute("id", Id)}
        divconent.setAttribute("style", "display: bloc; z-index: 999")
        divconent.innerHTML = `
        <style>
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
            opacity: 1;
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
            .CoreXActionMenuButton{font-size: calc(3vw * 1.5);height: 10VW; width: 10VW;}
        }
        @media screen and (min-width: 1200px)
        {
            .CoreXActionMenuButton {font-size: 18px;}
        }
        </style>
        `
        let Button = document.createElement("button")
        Button.setAttribute("style", "left: 0px; display: inline; z-index: 999")
        Button.setAttribute("class", "CoreXActionMenuButton")
        Button.innerHTML = "&#9733"
        Button.addEventListener("click", OnClick)
        divconent.appendChild(Button)
        return divconent
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

    static Input(Id, Value, Class, Style, Type, Name, Placeholder){
        let element = document.createElement("input")
        if (Id){element.setAttribute("id", Id)}
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        if (Value){element.setAttribute("value", Value)}
        if (Type){element.setAttribute("type", Type)}
        if (Name){element.setAttribute("name", Name)}
        if (Placeholder){element.setAttribute("placeholder", Placeholder)}
        return element
    }

    static InputWithLabel(BoxClass=null, Label=null, LabelClass=null, Id="Input", InputValue="", InputClass="", InputType="text", InputPlaceholder="", OnBlur=null){
        let element = document.createElement("div")
        if ((BoxClass!=null)&&(BoxClass!="")){element.setAttribute("Class", BoxClass)}
        if ((Label!=null)&&(Label!="")){
            if ((LabelClass!=null)&&(LabelClass!="")){
                element.appendChild(CoreXBuild.DivTexte(Label,"",LabelClass,"width: 100%;"))
            } else {
                element.appendChild(CoreXBuild.DivTexte(Label,"","","width: 100%;"))
            }
        }
        let inputStyle="box-sizing: border-box; outline: none; margin: 0; background: #fafafa; -webkit-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -moz-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #666;"
        let InputProgramName = CoreXBuild.Input(Id,InputValue,InputClass,inputStyle,InputType,Id,InputPlaceholder)
        InputProgramName.onfocus = function(){InputProgramName.placeholder = ""}
        if (OnBlur!=null){
            InputProgramName.onblur = OnBlur
        }
        element.appendChild(InputProgramName)
        return element
    }

    static Textarea(Id,Placeholder, Class, Style){
        let element = document.createElement("textarea")
        element.setAttribute("wrap", "off")
        if (Id){element.setAttribute("id", Id)}
        if (Placeholder){element.setAttribute("placeholder", Placeholder)}
        if (Class){element.setAttribute("Class", Class)}
        if (Style){element.setAttribute("Style", Style)}
        return element
    }

    static Video (Src,Id, Class,Style){
        let element = document.createElement("div")
        element.setAttribute("style","display: -webkit-flex; display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center; flex-wrap: wrap;")
        if (Style){element.setAttribute("Style", Style)}
        if (Class){element.setAttribute("Class", Class)}
        let video = document.createElement("video")
        if (Id){video.setAttribute("id", Id)}
        video.style.width = "100%"
        video.controls = true
        video.setAttribute("playsinline", "")
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        if (!isChrome){
            video.setAttribute("autoplay", "false")
        }
        video.onerror = ()=>{element.innerHTML = `Video Error: ErrorCode= ${video.error.code} details= ${video.error.message}`}
        video.src = Src
        element.appendChild(video)
        return element
    }
}