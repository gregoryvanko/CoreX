// Creation des applications
let AppLog = new CoreXAdminLogApp(GlobalCoreXGetAppContentId())
let AppUser = new CoreXAdminUserApp(GlobalCoreXGetAppContentId())
let AppBackup = new CoreXAdminBackupApp(GlobalCoreXGetAppContentId())
let AppStat = new CoreXAdminStatApp(GlobalCoreXGetAppContentId())

// Ajout des applications
GlobalCoreXAddApp(AppLog.GetTitre(), AppLog.GetImgSrc(),AppLog.Start.bind(AppLog))
GlobalCoreXAddApp(AppUser.GetTitre(), AppUser.GetImgSrcUser(),AppUser.Start.bind(AppUser))
GlobalCoreXAddApp(AppBackup.GetTitre(), AppBackup.GetImgSrc(),AppBackup.Start.bind(AppBackup))
GlobalCoreXAddApp(AppStat.GetTitre(), AppStat.GetImgSrc(),AppStat.Start.bind(AppStat))
