class CoreXAdminStatApp{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
    }

    /** Start de l'application */
    Start(){
        // Add refresh action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        this._DivApp.style.width = "96%"
        // Add CSS
        this._DivApp.innerHTML = this.GetCss()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Statistics", "CoreXAdminStatTitre", "", "")) 
        // Liste Stat
        let Content = CoreXBuild.Div("Content", "CoreXAdminStatFlexColumnCenterSpaceAround", "")
        this._DivApp.appendChild(Content)
        // Button Stat connection Day
        Content.appendChild(CoreXBuild.Button("Connections (Days)", this.StatConnectionStart.bind(this, "ConnectionsDay"), "CoreXAdminStatButtonLarge"))
        // Button Stat connection Month
        Content.appendChild(CoreXBuild.Button("Connections (Months)", this.StatConnectionStart.bind(this, "ConnectionsMonth"), "CoreXAdminStatButtonLarge"))
        // Button Stat User Day
        Content.appendChild(CoreXBuild.Button("User (Days)", this.StatUserStart.bind(this, "UserDay"), "CoreXAdminStatButtonLarge"))
        // Button Stat User Month
        Content.appendChild(CoreXBuild.Button("User (Months)", this.StatUserStart.bind(this, "UserMonth"), "CoreXAdminStatButtonLarge"))
    }

    StatConnectionStart(type){
        let Content = document.getElementById("Content")
        Content.innerHTML=""
        Content.appendChild(CoreXBuild.DivTexte("Get Data...", "", "CoreXAdminStatText",""))
        // Get All connection data
        let DataStat = new Object()
        DataStat.Type = type
        DataStat.Data = null
        GlobalCallApiPromise("Stat", DataStat).then((reponse)=>{
            this.StatConnectionLoadGraph(reponse, type)
        },(erreur)=>{
            Content.innerHTML=""
            Content.appendChild(CoreXBuild.DivTexte(erreur,"","CoreXAdminStatText","color:red;"))
        })
    }

    StatConnectionLoadGraph(Data, Type){
        let titre = ""
        if (Type == "ConnectionsDay"){titre = "Connections per day"}
        if (Type == "ConnectionsMonth"){titre = "Connections per month"}

        let Content = document.getElementById("Content")
        Content.innerHTML=""
        if (Data == null){
            Content.appendChild(CoreXBuild.DivTexte("No stat data...", "", "CoreXAdminStatText",""))
        } else {
            let chartdiv = document.createElement("div")
            chartdiv.setAttribute("Class", "CoreXAdminStatChart")
            Content.appendChild(chartdiv)
            let canvas = document.createElement("canvas")
            canvas.setAttribute("id", "myChart")
            chartdiv.appendChild(canvas)
            
            // Preparer les data
            let GraphLabel = []
            let GraphDataFirstConnection = []
            let GraphDataApp = []
            let GraphDataAdmin = []
            let GraphDataError = []
            Data.forEach(element => {
                let date = element.Jour + "/" + element.Mois 
                GraphLabel.push(date)
                GraphDataFirstConnection.push(element.FirstGet)
                GraphDataApp.push(element.App)
                GraphDataAdmin.push(element.Admin)
                GraphDataError.push(element.Error)
            });
            // Dessiner le graph
            let ctx = document.getElementById('myChart').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: GraphLabel,
                    datasets: [{
                        label: 'Connection',
                        type: "line",
                        borderColor: "rgba(54, 162, 235, 1)",
                        fill: false,
                        data: GraphDataFirstConnection,
                    },{
                        label: 'App',
                        type: "bar",
                        backgroundColor: "rgba(75, 192, 192, 1)",
                        data: GraphDataApp,
                    },{
                        label: 'Admin',
                        type: "bar",
                        backgroundColor: "rgba(255, 206, 86, 1)",
                        data: GraphDataAdmin,
                    },{
                        label: 'Error',
                        type: "bar",
                        backgroundColor: "rgba(255, 99, 132, 1)",
                        data: GraphDataError,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: titre
                    },
                    legend: {
                        display: true,
                        position: "bottom"
                    },
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true,
                                precision: 0
                            }
                        }]
                    }
                }
            });
        }
        // Button back
        Content.appendChild(CoreXBuild.Button("Back", this.Start.bind(this), "CoreXAdminStatButtonLarge"))
    }

    StatUserStart(Type){
        let Content = document.getElementById("Content")
        Content.innerHTML=""
        Content.appendChild(CoreXBuild.DivTexte("Get Users...", "", "CoreXAdminStatText",""))
        // Get All User
        GlobalCallApiPromise("GetAllUser", "").then((reponse)=>{
            let ListOfUsers = []
            if (reponse != null){ListOfUsers = reponse}
            this.LoadStatUser(ListOfUsers, Type)
        },(erreur)=>{
            Content.innerHTML=""
            Content.appendChild(CoreXBuild.DivTexte(erreur, "", "CoreXAdminStatText","color:red;"))
        })
    }

    LoadStatUser(ListOfUsers, Type){
        let Content = document.getElementById("Content")
        Content.innerHTML=""
        let BoxInput = CoreXBuild.Div("","CoreXAdminStatBox")
        Content.appendChild(BoxInput)
        // User
        BoxInput.appendChild(CoreXBuild.InputWithLabel("CoreXAdminStatInputBox", "Select User", "CoreXAdminStatText CoreXAdminStatMarginTxt", "CoreXAdminStatInputUser","", "CoreXAdminStatInput", "text", "User"))
        CoreXAdminStatInputUser.setAttribute("autocomplete", "off")
        // AutoComplete
        let me = this
        autocomplete({
            input: document.getElementById("CoreXAdminStatInputUser"),
            minLength: 1,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                let suggestions = []
                text = text.toLowerCase();
                var GroupFiltred = ListOfUsers.filter(n => n.User.toLowerCase().startsWith(text))
                GroupFiltred.forEach(element => {
                    var MyObject = new Object()
                    MyObject.label = element.User
                    suggestions.push(MyObject)
                });
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("CoreXAdminStatInputUser").value = item.label;
                me.StatUserGetData(item.label, Type)
            }
        });
        Content.appendChild(CoreXBuild.Div("ContentGraph", "CoreXAdminStatFlexColumnCenterSpaceAround", "width: 100%;"))
    }

    StatUserGetData(User, Type){
        // Focus out
        document.getElementById("CoreXAdminStatInputUser").blur()
        let Content = document.getElementById("ContentGraph")
        Content.innerHTML=""
        Content.appendChild(CoreXBuild.DivTexte("Get Data...", "", "CoreXAdminStatText",""))
        // Get All connection data
        let DataStat = new Object()
        DataStat.Type = Type
        DataStat.Data = User
        GlobalCallApiPromise("Stat", DataStat).then((reponse)=>{
            this.StatUserLoadGraph(reponse, Type)
        },(erreur)=>{
            Content.innerHTML=""
            Content.appendChild(CoreXBuild.DivTexte(erreur,"","CoreXAdminStatText","color:red;"))
        })
    }

    StatUserLoadGraph(Data, Type){
        let titre = ""
        if (Type == "UserDay"){titre = "Connections per day"}
        if (Type == "UserMonth"){titre = "Connections per month"}

        let Content = document.getElementById("ContentGraph")
        Content.innerHTML=""
        if (Data == null){
            Content.appendChild(CoreXBuild.DivTexte("No stat data...", "", "CoreXAdminStatText",""))
        } else {
            let chartdiv = document.createElement("div")
            chartdiv.setAttribute("Class", "CoreXAdminStatChart")
            Content.appendChild(chartdiv)
            let canvas = document.createElement("canvas")
            canvas.setAttribute("id", "myChart")
            chartdiv.appendChild(canvas)
            // Preparer les data
            let GraphLabel = []
            let GraphDataApp = []
            let GraphDataAdmin = []
            Data.forEach(element => {
                let date = element.Jour + "/" + element.Mois 
                GraphLabel.push(date)
                GraphDataApp.push(element.App)
                GraphDataAdmin.push(element.Admin)
            });
            // Dessiner le graph
            let ctx = document.getElementById('myChart').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: GraphLabel,
                    datasets: [{
                        label: 'App',
                        type: "bar",
                        backgroundColor: "rgba(75, 192, 192, 1)",
                        data: GraphDataApp,
                    },{
                        label: 'Admin',
                        type: "bar",
                        backgroundColor: "rgba(255, 206, 86, 1)",
                        data: GraphDataAdmin,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: titre
                    },
                    legend: {
                        display: true,
                        position: "bottom"
                    },
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true,
                                precision: 0
                            }
                        }]
                    }
                }
            });
        }
        // Button back
        Content.appendChild(CoreXBuild.Button("Back", this.Start.bind(this), "CoreXAdminStatButtonLarge"))
    }

    GetTitre(){
        return "Stat"
    }
    GetImgSrc(){
        return `data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik0xOS4zNSwzMC4xYy00LjcyNDI3LDAgLTguNiwzLjg3NTczIC04LjYsOC42djgxLjdjMCwxLjU5NjcxIDAuNTYyNTcsMy4wMTQwMiAxLjMzMTE1LDQuM2gtOS45MzExNXY2LjQ1YzAsNS45MTE0NiA0LjgzODU0LDEwLjc1IDEwLjc1LDEwLjc1aDE0Ni4yYzUuOTExNDYsMCAxMC43NSwtNC44Mzg1NCAxMC43NSwtMTAuNzV2LTYuNDVoLTkuOTMxMTVjMC43Njg1OSwtMS4yODU5OCAxLjMzMTE1LC0yLjcwMzI5IDEuMzMxMTUsLTQuM3YtODEuN2MwLC00LjcyNDI3IC0zLjg3NTczLC04LjYgLTguNiwtOC42ek0xOS4zNSwzNC40aDEzMy4zYzIuNDAwODMsMCA0LjMsMS44OTkxNyA0LjMsNC4zdjgxLjdjMCwyLjQwMDgzIC0xLjg5OTE3LDQuMyAtNC4zLDQuM2gtNTMuNzV2Mi4xNWMwLDEuMjE0ODEgLTAuOTM1MTksMi4xNSAtMi4xNSwyLjE1aC0yMS41Yy0xLjIxNDgxLDAgLTIuMTUsLTAuOTM1MTkgLTIuMTUsLTIuMTV2LTIuMTVoLTUzLjc1Yy0yLjQwMDgzLDAgLTQuMywtMS44OTkxNyAtNC4zLC00LjN2LTgxLjdjMCwtMi40MDA4MyAxLjg5OTE3LC00LjMgNC4zLC00LjN6TTI1LjgsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMzQuNCw0M2MtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek00Myw0M2MtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek01MS42LDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTYwLjIsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNNjguOCw0M2MtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek03Ny40LDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTg2LDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTk0LjYsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTAzLjIsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTExLjgsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTIwLjQsNDNjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTI5LDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTEzNy42LDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTE0Ni4yLDQzYy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTI1LjgsNTEuNmMtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek0xNDYuMiw1MS42Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTc1LjI1LDU1Ljl2Mi4xNXY1My43NWgtNC4zdi0yNy45NWgtMjEuNXYyLjE1djI1LjhoLTYuNDV2NC4zaDg2di00LjNoLTYuNDV2LTQwLjg1aC0yMS41djIuMTV2MzguN2gtNC4zdi01NS45ek0yNS44LDYwLjJjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNNzkuNTUsNjAuMmgxMi45djUxLjZoLTEyLjl6TTE0Ni4yLDYwLjJjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMjUuOCw2OC44Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTE0Ni4yLDY4LjhjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTA1LjM1LDc1LjI1aDEyLjl2MzYuNTVoLTEyLjl6TTI1LjgsNzcuNGMtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek0xNDYuMiw3Ny40Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTI1LjgsODZjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMTQ2LjIsODZjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNNTMuNzUsODguMTVoMTIuOXYyMy42NWgtMTIuOXpNMjUuOCw5NC42Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTE0Ni4yLDk0LjZjLTEuMTg2OCwwIC0yLjE1LDAuOTYzMiAtMi4xNSwyLjE1YzAsMS4xODY4IDAuOTYzMiwyLjE1IDIuMTUsMi4xNWMxLjE4NjgsMCAyLjE1LC0wLjk2MzIgMi4xNSwtMi4xNWMwLC0xLjE4NjggLTAuOTYzMiwtMi4xNSAtMi4xNSwtMi4xNXpNMjUuOCwxMDMuMmMtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek0xNDYuMiwxMDMuMmMtMS4xODY4LDAgLTIuMTUsMC45NjMyIC0yLjE1LDIuMTVjMCwxLjE4NjggMC45NjMyLDIuMTUgMi4xNSwyLjE1YzEuMTg2OCwwIDIuMTUsLTAuOTYzMiAyLjE1LC0yLjE1YzAsLTEuMTg2OCAtMC45NjMyLC0yLjE1IC0yLjE1LC0yLjE1ek0yNS44LDExMS44Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTE0Ni4yLDExMS44Yy0xLjE4NjgsMCAtMi4xNSwwLjk2MzIgLTIuMTUsMi4xNWMwLDEuMTg2OCAwLjk2MzIsMi4xNSAyLjE1LDIuMTVjMS4xODY4LDAgMi4xNSwtMC45NjMyIDIuMTUsLTIuMTVjMCwtMS4xODY4IC0wLjk2MzIsLTIuMTUgLTIuMTUsLTIuMTV6TTYuNDUsMTI5aDEyLjloNTAuMzQ0NDNjMC45NTMzMiwyLjM3OTM5IDIuODUzODMsNC4zIDUuNTU1NTcsNC4zaDIxLjVjMi43MDE3NCwwIDQuNjAyMjUsLTEuOTIwNjEgNS41NTU1NywtNC4zaDUwLjM0NDQzaDEyLjl2Mi4xNWMwLDMuNTg3MjQgLTIuODYyNzYsNi40NSAtNi40NSw2LjQ1aC0xNDYuMmMtMy41ODcyNCwwIC02LjQ1LC0yLjg2Mjc2IC02LjQ1LC02LjQ1eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+`
    }
    /** Css de l'application */
    GetCss(){
        return /*html*/`
        <style>
            #CoreXAdminStatTitre{
                margin: 1% 1% 1% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .CoreXAdminStatText{font-size: var(--CoreX-font-size);}
            .CoreXAdminStatTextSelect{
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text; 
            }
            .CoreXAdminStatFlexColumnCenterSpaceAround{
                display: flex;
                flex-direction: column;
                justify-content:space-around;
                align-content:center;
                align-items: center;
            }
            .CoreXAdminStatFlexRowCenterspacearound{
                display: flex;
                flex-direction: row;
                justify-content:space-around;
                align-content:center;
                align-items: center;
                flex-wrap: wrap;
            }
            .CoreXAdminStatFlexRowStartCenter{
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-content: center;
                align-items: center;
                flex-wrap: wrap;
                width:100%; 
                border-top: 1px solid black; 
                padding: 0.5vh;
            }
            .CoreXAdminStatButtonLarge{
                margin: 1vh 0vh 1vh 0vh;
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
                width: 20%;
            }
            @media (hover: hover) {
                .CoreXAdminStatButtonLarge:hover:enabled{
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
                }
            }

            .CoreXAdminStatInputBox{
                margin-bottom: 2vh;
                width: 90%;
                margin-left: auto;
                margin-right: auto;
            }
            .CoreXAdminStatMarginTxt{
                margin-bottom: 1vh;
            }
            .CoreXAdminStatInput {
                border: solid 1px #dcdcdc;
                width: 100%;
                font-size: var(--CoreX-font-size);
                padding: 1vh;
            }
            .CoreXAdminStatInput:focus,
            .CoreXAdminStatInput.focus {
                border-color: var(--CoreX-color);
            }
            @media (hover: hover) {
                .CoreXAdminStatInput:hover{
                    border-color: var(--CoreX-color);
                }
            }
            .CoreXAdminStatBox{
                width: 45%;
            }

            .CoreXAdminStatChart{
                height:65vh; 
                width:94vw;
            }

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #CoreXAdminStatTitre{font-size: var(--CoreX-TitreIphone-font-size);}
                .CoreXAdminStatText{font-size: var(--CoreX-Iphone-font-size);}
                .CoreXAdminStatButtonLarge{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px; width: 40%;}
                .CoreXAdminStatInput{font-size: var(--CoreX-Iphone-font-size);}
                .CoreXAdminStatBox{width: 80%;}
                .CoreXAdminStatChart{height:30vh; width:94vw;}
            }
            @media screen and (min-width: 1200px)
            {
                #CoreXAdminStatTitre{font-size: var(--CoreX-TitreMax-font-size);}
                .CoreXAdminStatText{font-size: var(--CoreX-Max-font-size);}
                .CoreXAdminStatButtonLarge{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
                .CoreXAdminStatInput{font-size: var(--CoreX-Max-font-size);}
            }
        </style>`
    }

}