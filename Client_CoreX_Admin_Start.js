// Creation des applications
let AppLog = new CoreXAdminLogApp(GlobalCoreXGetAppContentId())

// Ajout des applications
GlobalCoreXAddApp(AppLog.GetTitre(), AppLog.GetImgSrc(),AppLog.Start.bind(AppLog))

// Lancement de l'application CoreXApp
GlobalCoreXStart()