// Creation des applications
let AppLog = new CoreXAdminLogApp(GlobalCoreXGetAppContentId())
let AppUser = new CoreXAdminUserApp(GlobalCoreXGetAppContentId(), false)
let AppAdmin = new CoreXAdminUserApp(GlobalCoreXGetAppContentId(), true)

// Ajout des applications
GlobalCoreXAddApp(AppLog.GetTitre(), AppLog.GetImgSrc(),AppLog.Start.bind(AppLog))
GlobalCoreXAddApp(AppUser.GetTitreUser(), AppUser.GetImgSrcUser(),AppUser.Start.bind(AppUser))
GlobalCoreXAddApp(AppAdmin.GetTitreAdmin(), AppAdmin.GetImgSrcAdmin(),AppAdmin.Start.bind(AppAdmin))
