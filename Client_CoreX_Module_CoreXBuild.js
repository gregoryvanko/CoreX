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
        let element = CoreXBuild.DivFlexColumn("")
        let video = document.createElement("video")
        if (Id){video.setAttribute("id", Id)}
        if (Class){video.setAttribute("Class", Class)}
        if (Style){video.setAttribute("Style", Style)}
        video.controls = true
        video.onerror = ()=>{element.innerHTML = `Video Error: ErrorCode= ${video.error.code} details= ${video.error.message}`}
        video.src = Src
        element.appendChild(video)
        return element
    }
}