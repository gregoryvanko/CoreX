// Creation des applications
let AppLog = new CoreXAdminLogApp(GlobalCoreXGetAppContentId())
let AppUser = new CoreXAdminUserApp(GlobalCoreXGetAppContentId(), false)
let AppAdmin = new CoreXAdminUserApp(GlobalCoreXGetAppContentId(), true)
let AppBackup = new CoreXAdminBackupApp(GlobalCoreXGetAppContentId())

// Ajout des applications
GlobalCoreXAddApp(AppLog.GetTitre(), AppLog.GetImgSrc(),AppLog.Start.bind(AppLog))
GlobalCoreXAddApp(AppUser.GetTitreUser(), AppUser.GetImgSrcUser(),AppUser.Start.bind(AppUser))
GlobalCoreXAddApp(AppAdmin.GetTitreAdmin(), AppAdmin.GetImgSrcAdmin(),AppAdmin.Start.bind(AppAdmin))
GlobalCoreXAddApp(AppBackup.GetTitre(), AppBackup.GetImgSrc(),AppBackup.Start.bind(AppBackup))
