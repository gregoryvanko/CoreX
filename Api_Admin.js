class ApiAdmin{
    constructor(LogAppliInfoFct, LogAppliErrorFct, MongoFct, MongoVar, OnDeleteUser){
        this.LogAppliInfo = LogAppliInfoFct
        this.LogAppliError = LogAppliErrorFct
        this._Mongo = MongoFct
        this._MongoVar = MongoVar
        this._OnDeleteUser = OnDeleteUser
    }

    /* Get list of all user via l'ApiAdmin */
    GetAllUsers(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin GetAllUsers", User, UserId)
        const Query = {}
        const Projection = { projection:{ _id: 1, [this._MongoVar.LoginUserItem]: 1}}
        const Sort = {[this._MongoVar.LoginUserItem]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, this._MongoVar.UserCollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No user in BD", Data: null})
            } else {
                res.json({Error: false, ErrorMsg: "User in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetAllUsers DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: ""})
        })
    }

    /* Get list of user data via l'ApiAdmin */
    GetUserData(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin GetUserData, Data: " + JSON.stringify(Data), User, UserId)
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        // Definition de la Query de Mongo
        const Query = {'_id': new MongoObjectId(Data.UsesrId)}
        // Definition de la projection de Mongo en fonction du type de user
        let Projection = {projection:{}}
        // Find de type Promise de Mongo
        this._Mongo.FindPromise(Query,Projection, this._MongoVar.UserCollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Wrong UserId", User, UserId)
                res.json({Error: true, ErrorMsg: "Wrong UserId", Data: null})
            } else {
                // les password sont effacés de la réponse
                reponse[0][this._MongoVar.LoginPassItem]=""
                reponse[0][this._MongoVar.LoginConfirmPassItem]=""
                // la reponse est envoyée
                res.json({Error: false, ErrorMsg: "User data in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetUserData DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    /* Delete d'un user via l'ApiAdmin */
    DeleteUser(Data, res, User, UserId){
        // Log
        this.LogAppliInfo("Call ApiAdmin DeleteUser, Data: " + JSON.stringify(Data), User, UserId)
        // Execute action before delete the user
        if (this._OnDeleteUser){
            this._OnDeleteUser(Data.UsesrId, Data.UserLogin, User, UserId).then(()=>{
                // Delete de type Promise de Mongo
                this._Mongo.DeleteByIdPromise(Data.UsesrId, this._MongoVar.UserCollection).then((reponse)=>{
                    if (reponse.deletedCount==1) {
                        res.json({Error: false, ErrorMsg: "User deleted in DB", Data: null})
                    } else {
                        this.LogAppliError("User not found in DB", User, UserId)
                        res.json({Error: true, ErrorMsg: "User not found in DB", Data: null})
                    }
                },(erreur)=>{
                    this.LogAppliError("ApiAdminDeleteUser DB error : " + erreur, User, UserId)
                    res.json({Error: true, ErrorMsg: "DB Error", Data: null})
                })
            }, ()=>{
                this.LogAppliError("ApiAdminDeleteUser error during OnDeleteUser function", User, UserId)
                res.json({Error: true, ErrorMsg: "Error during OnDeleteUser function", Data: null})
            })
        } else {
            // Delete de type Promise de Mongo
            this._Mongo.DeleteByIdPromise(Data.UsesrId, this._MongoVar.UserCollection).then((reponse)=>{
                if (reponse.deletedCount==1) {
                    res.json({Error: false, ErrorMsg: "User deleted in DB", Data: null})
                } else {
                    this.LogAppliError("User not found in DB", User, UserId)
                    res.json({Error: true, ErrorMsg: "User not found in DB", Data: null})
                }
            },(erreur)=>{
                this.LogAppliError("ApiAdminDeleteUser DB error : " + erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "DB Error", Data: null})
            })
        }
    }

    /* Update d'un user (meme fonction pour Api et ApiAdmin) */
    UpdateUser(Data, res, User, UserId){
        this.LogAppliInfo("Call Api"+ Data.UserType + " UpdateUser, Data: " + JSON.stringify(Data), User, UserId)
        // changement du password que si il est different de vide
        if (Data.Data[this._MongoVar.LoginPassItem] == ""){
            delete Data.Data[this._MongoVar.LoginPassItem]
            delete Data.Data[this._MongoVar.LoginConfirmPassItem]
        }
        // Update de type Promise de Mongo
        this._Mongo.UpdateByIdPromise(Data.UsesrId, Data.Data, this._MongoVar.UserCollection).then((reponse)=>{
            if (reponse.matchedCount==1) {
                res.json({Error: false, ErrorMsg: "User Updated in DB", Data: null})
            } else {
                this.LogAppliError("User not found in DB", User, UserId)
                res.json({Error: true, ErrorMsg: "User not found in DB", Data: null})
            }
        },(erreur)=>{
            this.LogAppliError("UpdateUser DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    /** Get de la structure d'un user */
    GetUserDataStructure(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin GetUserDataStructure, Data: " + Data, User, UserId)
        let reponse=[]
        // Data strucutre d'un user
        reponse.push(this._MongoVar.LoginUserItem)
        reponse.push(this._MongoVar.LoginFirstNameItem)
        reponse.push(this._MongoVar.LoginLastNameItem)
        reponse.push(this._MongoVar.LoginPassItem)
        reponse.push(this._MongoVar.LoginConfirmPassItem)
        reponse.push(this._MongoVar.LoginAdminItem)
        res.json({Error: false, ErrorMsg: "User data structure", Data: reponse})
    }

    /** Creation d'un nouvel user */
    NewUser(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin NewUser, Data: " + JSON.stringify(Data), User, UserId)
        let DataToDb = { [this._MongoVar.LoginUserItem]: Data.Data[this._MongoVar.LoginUserItem], [this._MongoVar.LoginFirstNameItem]: Data.Data[this._MongoVar.LoginFirstNameItem], [this._MongoVar.LoginLastNameItem]: Data.Data[this._MongoVar.LoginLastNameItem], [this._MongoVar.LoginPassItem]: Data.Data[this._MongoVar.LoginPassItem], [this._MongoVar.LoginConfirmPassItem]: Data.Data[this._MongoVar.LoginConfirmPassItem], [this._MongoVar.LoginAdminItem]: Data.Data[this._MongoVar.LoginAdminItem]}
        // Insert de type Promise de Mongo
        this._Mongo.InsertOnePromise(DataToDb, this._MongoVar.UserCollection).then((reponse)=>{
            res.json({Error: false, ErrorMsg: "User added in DB", Data: null})
        },(erreur)=>{
            this.LogAppliError("ApiAdminNewUser DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    /** Get My Data of a connected user (meme fonction pour Api et ApiAdmin) */
    GetMyData(App, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin ApiGetMyData, Data: App=" + App, User, UserId)
        let MongoObjectId = require('./Mongo.js').MongoObjectId
        // Definition de la Query de Mongo
        const Query = {'_id': new MongoObjectId(UserId)}
        // Definition de la projection de Mongo en fonction du type de user
        let Projection = { projection:{ _id: 0, [this._MongoVar.LoginUserItem]:0, [this._MongoVar.LoginAdminItem]:0}}
        // Find de type Promise de Mongo
        this._Mongo.FindPromise(Query,Projection, this._MongoVar.UserCollection).then((reponse)=>{
            if(reponse.length == 0){
                this.LogAppliError("Wrong UserId", User, UserId)
                res.json({Error: true, ErrorMsg: "Wrong UserId", Data: null})
            } else {
                // les password sont effacés de la réponse
                reponse[0][this._MongoVar.LoginPassItem]=""
                reponse[0][this._MongoVar.LoginConfirmPassItem]=""
                // la reponse est envoyée
                res.json({Error: false, ErrorMsg: "User data in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiGetMyData DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    /** Get des log de l'application */
    GetLog(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin GetLog, Skip data value: " + JSON.stringify(Data), User, UserId)
        // Si Data.LogInfoType = All alors tous les type
        const LogfInfoType = (Data.LogInfoType == "All") ? '.*' : Data.LogInfoType
        // Data.LogUser value
        const LogUser = Data.LogUser
        // Data.LogMessage value
        const LogMessage = Data.LogMessage
        let Query = {}
        // Si les date et heure sont vide
        if ((Data.LogDate == "") && (Data.LogHeure == "")){
            Query = {$and:[{[this._MongoVar.LogAppliType]:{$regex:".*" + LogfInfoType + ".*"}},{[this._MongoVar.LogAppliUser]:{$regex:".*" + LogUser + ".*"}},{[this._MongoVar.LogAppliValeur]:{$regex:".*" + LogMessage + ".*"}}]}
        } else {
            if(Data.LogDate != ""){
                let jour = Data.LogDate.substring(0, 2)
                let mois = Data.LogDate.substring(3,5)
                let annee = Data.LogDate.substring(6)
                let date = ""
                if (Data.LogHeure == ""){
                    date = { $gte:new Date(annee+'-' + mois + '-' + jour +'T00:00:00.000Z'), $lt:new Date(annee+'-' + mois + '-' + jour +'T23:59:59.999Z') }
                } else {
                    let Ijour = parseInt(Data.LogDate.substring(0, 2))
                    let Imois = parseInt(Data.LogDate.substring(3,5))-1
                    let Iannee = parseInt(Data.LogDate.substring(6))
                    let Iheure = parseInt(Data.LogHeure.substring(0, 2))
                    let Iminute = parseInt(Data.LogHeure.substring(3))
                    var isoDate1 = new Date(Iannee, Imois, Ijour, Iheure, Iminute, 0, 0).toISOString()
                    var isoDate2 = new Date(Iannee, Imois, Ijour, Iheure, Iminute, 59, 999).toISOString()
                    date = { $gte:new Date(isoDate1), $lt:new Date(isoDate2) }
                    //date = { $gte:new Date(annee+'-' + mois + '-' + jour +'T' + heure +':' + minute +':00.000Z'), $lt:new Date(annee+'-' + mois + '-' + jour +'T' + heure +':' + minute +':59.999Z') }
                }
                Query = {$and:[{[this._MongoVar.LogAppliType]:{$regex:".*" + LogfInfoType + ".*"}},{[this._MongoVar.LogAppliUser]:{$regex:".*" + LogUser + ".*"}},{[this._MongoVar.LogAppliValeur]:{$regex:".*" + LogMessage + ".*"}},{[this._MongoVar.LogAppliNow]:date}]}
            } else {
                Query = {$and:[{[this._MongoVar.LogAppliType]:{$regex:".*" + LogfInfoType + ".*"}},{[this._MongoVar.LogAppliUser]:{$regex:".*" + LogUser + ".*"}},{[this._MongoVar.LogAppliValeur]:{$regex:".*" + LogMessage + ".*"}}]}
            }
        }

        let mongocollection = this._MongoVar.LogAppliCollection
        const Projection = {}
        const Sort = {[this._MongoVar.LogAppliNow]: -1}
        this._Mongo.FindSortLimitSkipPromise(Query,Projection, Sort, 20, parseInt(Data.LogCursor), mongocollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No Log in BD", Data: null})
            } else {
                res.json({Error: false, ErrorMsg: "Log in DB", Data: reponse})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdminGetLog DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: ""})
        })
    }

    CleanLog(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin CleanLog", User, UserId)
        const Query = {}
        this._Mongo.DeleteByQueryPromise(Query, this._MongoVar.LogAppliCollection).then((reponse)=>{
            res.json({Error: false, ErrorMsg: "CleanLog Data", Data: null})
        },(erreur)=>{
            this.LogAppliError("CleanLog error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "Error during CleanLog: "+ erreur, Data: ""})
        })
    }

    /** Get des log de l'application */
    Backup(ApiData, res, GetJobSchedule, SetJobSchedule, User, UserId){
        if (ApiData.Fct == "BackupNow"){
            this.LogAppliInfo("Call ApiAdmin BackupNow", User, UserId)
            // Get GoogleKey
            this.GetDbConfig("BackupGoogle").then((reponse)=>{
                res.json({Error: false, ErrorMsg: "", Data: "DB Backup Started, see log for end validation"})
                let credentials = JSON.parse(reponse.GoogleKey)
                let folder = reponse.Folder
                let DbBackup = require('./DbBackup').DbBackup
                let MyDbBackup = new DbBackup(this._MongoVar.DbName,credentials,folder, this.LogAppliInfo.bind(this))
                MyDbBackup.Backup().then((reponse)=>{
                    this.LogAppliInfo("Backup Now sucessfully ended", User, UserId)
                },(erreur)=>{
                    this.LogAppliError("Backup Now error: " + erreur, User, UserId)
                })
            },(erreur)=>{
                this.LogAppliError("BackupNow Get GoogleKey: "+ erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "Error during BackupNow Get GoogleKey: "+ erreur, Data: ""})
            })
        } else if (ApiData.Fct == "RestoreNow"){
            this.LogAppliInfo("Call ApiAdmin RestoreNow", User, UserId)
            // Get GoogleKey
            this.GetDbConfig("BackupGoogle").then((reponse)=>{
                res.json({Error: false, ErrorMsg: "", Data: "DB Restore Started, see log for end validation and reload browser"})
                let credentials = JSON.parse(reponse.GoogleKey)
                let folder = reponse.Folder
                let DbBackup = require('./DbBackup').DbBackup
                let MyDbBackup = new DbBackup(this._MongoVar.DbName, credentials,folder, this.LogAppliInfo.bind(this))
                MyDbBackup.Restore().then((reponse)=>{
                    this.LogAppliInfo("Restore Now sucessfully ended", User, UserId)
                },(erreur)=>{
                    this.LogAppliError("Restore Now error: " + erreur, User, UserId)
                })
            },(erreur)=>{
                this.LogAppliError("RestoreNow Get GoogleKey: "+ erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "Error during RestoreNow Get GoogleKey: "+ erreur, Data: ""})
            })
        } else if (ApiData.Fct == "GetSchedulerData"){
            this.LogAppliInfo("Call ApiAdmin GetSchedulerData", User, UserId)
            let ApiReponse = new Object()
            ApiReponse.GoogleKeyExist = false
            ApiReponse.SchedulerData = null
            this.GetDbConfig("BackupGoogle").then((reponse)=>{
                if((reponse.GoogleKey == "") || (reponse.Folder == "")){
                    res.json({Error: false, ErrorMsg: "Scheduler Data", Data: ApiReponse})
                } else {
                    // Get scheduler data
                    let JobSchedule = GetJobSchedule()
                    this.GetSchedulerData(JobSchedule).then((reponsedata)=>{
                        ApiReponse.GoogleKeyExist = true
                        ApiReponse.SchedulerData =reponsedata
                        res.json({Error: false, ErrorMsg: "Scheduler Data", Data: ApiReponse})
                    },(erreur)=>{
                        this.LogAppliError("GetSchedulerData error : " + erreur, User, UserId)
                        res.json({Error: true, ErrorMsg: "Error during GetSchedulerData: "+ erreur, Data: ""})
                    })
                }
            },(erreur)=>{
                this.LogAppliError("GetSchedulerData error in get google key : " + erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "Error during GetSchedulerData, get google key: "+ erreur, Data: ""})
            })
        } else if (ApiData.Fct == "SaveConfig"){
            this.LogAppliInfo("Call ApiAdmin SaveConfig", User, UserId)
            // Save nouvelle heure
            let BackupScheduler = new Object()
            BackupScheduler.JobScheduleHour = ApiData.Hour
            BackupScheduler.JobScheduleMinute = ApiData.Minute
            let JobSchedule = GetJobSchedule()
            if (JobSchedule == null){
                BackupScheduler.JobScheduleStarted = false
            } else {
                BackupScheduler.JobScheduleStarted = true
            }
            let Data = new Object()
            Data.Value = BackupScheduler
            const Query = { [this._MongoVar.ConfigKey]: "BackupScheduler"}
            this._Mongo.UpdatePromise(Query, Data, this._MongoVar.ConfigCollection).then((reponse)=>{
                if (reponse.matchedCount==1) {
                    let JobSchedule = GetJobSchedule()
                    if (JobSchedule != null){
                        let options = {minute: ApiData.Minute, hour: ApiData.Hour}
                        JobSchedule.reschedule(options)
                        SetJobSchedule(JobSchedule)
                    }
                    this.GetSchedulerData(JobSchedule).then((reponse)=>{
                        res.json({Error: false, ErrorMsg: "Scheduler Data", Data: reponse})
                    },(erreur)=>{
                        this.LogAppliError("SaveConfig error : " + erreur, User, UserId)
                        res.json({Error: true, ErrorMsg: "Error during SaveConfig: "+ erreur, Data: ""})
                    })
                } else {
                    res.json({Error: true, ErrorMsg: "Upadte error : Key Value not found in config", Data: ""})
                }
            },(erreur)=>{
                this.LogAppliError("SaveConfig error : " + erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "Error during SaveConfig: "+ erreur, Data: ""})
            })
        } else if (ApiData.Fct == "SchedulerSetStatus"){
            this.LogAppliInfo("Call ApiAdmin SchedulerSetStatus", User, UserId)
            if (ApiData.Started){
                let JobSchedule = GetJobSchedule()
                if (JobSchedule== null){
                    this.GetSchedulerData(JobSchedule).then((reponse)=>{
                        let SchedulerData = reponse
                        var schedule = require('node-schedule')
                        let options = {minute: SchedulerData.JobScheduleMinute, hour: SchedulerData.JobScheduleHour}
                        // Get GoogleKey
                        this.GetDbConfig("BackupGoogle").then((reponseGoogle)=>{
                            let credentials = JSON.parse(reponseGoogle.GoogleKey)
                            let folder = reponseGoogle.Folder
                            var me = this
                            let JobSchedule = schedule.scheduleJob(options, function(){
                                let DbBackup = require('./DbBackup').DbBackup
                                let MyDbBackup = new DbBackup(me._MongoVar.DbName,credentials,folder,me.LogAppliInfo.bind(me))
                                MyDbBackup.Backup().then((reponse)=>{
                                    var now = new Date()
                                    me.LogAppliInfo(reponse, User, UserId)
                                    console.log(reponse + " " + now)
                                },(erreur)=>{
                                    me.LogAppliError("SchedulerSetStatus error : " + erreur, User, UserId)
                                    console.log("Error during SchedulerSetStatus: "+ erreur + " " + now)
                                })
                            })
                            SetJobSchedule(JobSchedule)
                            // Save nouveau status
                            let BackupScheduler = new Object()
                            BackupScheduler.JobScheduleHour = SchedulerData.JobScheduleHour
                            BackupScheduler.JobScheduleMinute = SchedulerData.JobScheduleMinute
                            BackupScheduler.JobScheduleStarted = ApiData.Started
                            let DataS = new Object()
                            DataS.Value = BackupScheduler
                            const Query = { [this._MongoVar.ConfigKey]: "BackupScheduler",}
                            this._Mongo.UpdatePromise(Query, DataS, this._MongoVar.ConfigCollection).then((reponseUpdateSatus)=>{
                                if (reponseUpdateSatus.matchedCount==1) {
                                    let JobSchedule = GetJobSchedule()
                                    BackupScheduler.JobScheduleNext = this.GetDateTimeString(JobSchedule.nextInvocation())
                                    res.json({Error: false, ErrorMsg: "Scheduler Data", Data: BackupScheduler})
                                } else {
                                    this.LogAppliError("SaveConfig Status error : more than 1 entry in DB", User, UserId)
                                    res.json({Error: true, ErrorMsg: "Error during SaveConfig Status: more than 1 entry in DB", Data: ""})
                                }
                            },(erreur)=>{
                                this.LogAppliError("SaveConfig Status error : " + erreur, User, UserId)
                                res.json({Error: true, ErrorMsg: "Error during SaveConfig Status: "+ erreur, Data: ""})
                            })
                        },(erreur)=>{
                            this.LogAppliError("SchedulerSetStatus, get Google key error : " + erreur, User, UserId)
                            res.json({Error: true, ErrorMsg: "Error during SchedulerSetStatus Get GoogleKey: "+ erreur, Data: ""})
                        })
                    },(erreur)=>{
                        this.LogAppliError("SchedulerSetStatus error : " + erreur, User, UserId)
                        res.json({Error: true, ErrorMsg: "Error during SchedulerSetStatus: "+ erreur, Data: ""})
                    })
                } else {
                    this.LogAppliError("JobScheduler already exist", User, UserId)
                    res.json({Error: true, ErrorMsg: "Error JobScheduler already exist", Data: ""})
                }
            } else {
                let JobSchedule = GetJobSchedule()
                if ( JobSchedule == null){
                    res.json({Error: true, ErrorMsg: "Error no JobScheduler defined", Data: ""})
                } else {
                    JobSchedule.cancel()
                    SetJobSchedule(null)
                    // Save nouveau status
                    this.GetSchedulerData(null).then((reponse)=>{
                        let BackupScheduler = new Object()
                        BackupScheduler.JobScheduleHour = reponse.JobScheduleHour
                        BackupScheduler.JobScheduleMinute = reponse.JobScheduleMinute
                        BackupScheduler.JobScheduleStarted = ApiData.Started
                        let DataS = new Object()
                        DataS.Value = BackupScheduler
                        const Query = { [this._MongoVar.ConfigKey]: "BackupScheduler"}
                        this._Mongo.UpdatePromise(Query, DataS, this._MongoVar.ConfigCollection).then((reponse)=>{
                            if (reponse.matchedCount==1) {
                                BackupScheduler.JobScheduleNext = "Scheduler not started"
                                res.json({Error: false, ErrorMsg: "Scheduler Data", Data: BackupScheduler})
                            } else {
                                this.LogAppliError("SaveConfig Status error : more than 1 entry in DB", User, UserId)
                                res.json({Error: true, ErrorMsg: "Error during SaveConfig Status: more than 1 entry in DB", Data: ""})
                            }
                        },(erreur)=>{
                            this.LogAppliError("SaveConfig Status error : " + erreur, User, UserId)
                            res.json({Error: true, ErrorMsg: "Error during SaveConfig Status: "+ erreur, Data: ""})
                        })
                    },(erreur)=>{
                        this.LogAppliError("SchedulerSetStatus error : " + erreur, User, UserId)
                        res.json({Error: true, ErrorMsg: "Error during SchedulerSetStatus: "+ erreur, Data: ""})
                    })
                }
            }
        } else if (ApiData.Fct == "SaveGoogleKey"){
            this.LogAppliInfo("Call ApiAdmin SaveGoogleKey", User, UserId)
            // Save Google Key
            let BackupGoogle = new Object()
            BackupGoogle.GoogleKey = ApiData.key
            BackupGoogle.Folder = ApiData.folder
            let Data = new Object()
            Data.Value = BackupGoogle
            const Query = { [this._MongoVar.ConfigKey]: "BackupGoogle"}
            this._Mongo.UpdatePromise(Query, Data, this._MongoVar.ConfigCollection).then((reponse)=>{
                if (reponse.matchedCount==1) {
                    res.json({Error: false, ErrorMsg: "SaveGoogleKey Data", Data: null})
                } else {
                    this.LogAppliError("Upadte error : Key Value not found in config", User, UserId)
                    res.json({Error: true, ErrorMsg: "Upadte error : Key Value not found in config", Data: ""})
                }
            },(erreur)=>{
                this.LogAppliError("SaveGoogleKey error : " + erreur, User, UserId)
                res.json({Error: true, ErrorMsg: "Error during SaveGoogleKey: "+ erreur, Data: ""})
            })

        } else {
            this.LogAppliError("Backup: ApiData.Fct not found= "+ ApiData.Fct, User, UserId)
            res.json({Error: true, ErrorMsg: "Error during Backup: ApiData.Fct not found= "+ ApiData.Fct, Data: ""})
        }
    }

    /**
     * Promise qui recupère un element de config dans la DB
     * @param {string} Key clef d'un element de la Config
     */
    GetDbConfig(Key){
        return new Promise((resolve, reject)=>{
            const Query = { [this._MongoVar.ConfigKey]: Key} 
            const Projection = { projection:{[this._MongoVar.ConfigValue]: 1}}
            this._Mongo.FindPromise(Query,Projection, this._MongoVar.ConfigCollection).then((reponse)=>{
                if(reponse.length == 0){
                    reject("Error GetDbConfig: no entry for this Key and ConfigType")
                } else if (reponse.length == 1){
                    resolve(reponse[0].Value)
                } else {
                    reject("Error GetDbConfig: too much entry for this Key and ConfigType")
                }
            },(erreur)=>{
                this.LogAppliError("GetDbConfig error : " + erreur, "Server", "Server")
                reject(erreur)
            })
        })
    }

    /**
     * Promise Get scheduler data
     */
    GetSchedulerData(JobSchedule){
        return new Promise((resolve, reject)=>{
            let SchedulerData = new Object()
            this.GetDbConfig("BackupScheduler").then((reponse)=>{
                SchedulerData = reponse
                if (JobSchedule == null) {
                    SchedulerData.JobScheduleStarted = false
                    SchedulerData.JobScheduleNext = "Scheduler not started"
                } else {
                    SchedulerData.JobScheduleStarted = true
                    SchedulerData.JobScheduleNext = this.GetDateTimeString(JobSchedule.nextInvocation())
                }
                resolve(SchedulerData)
            },(erreur)=>{
                this.LogAppliError("GetSchedulerData error : " + erreur, "Server", "Server")
                reject(erreur)
            })
        })
    }

    /**
     * retourne un string avec la date formatee
     * @param {string} DateString string de format date
     */
    GetDateTimeString(DateString){
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

    Stat(Data, res, User, UserId){
        this.LogAppliInfo("Call ApiAdmin get Stat, Data: " + JSON.stringify(Data), User, UserId)

        if (Data.Type == "ConnectionsDay"){
            this.StatConnectionsDay(res, User, UserId)
        } else if(Data.Type == "ConnectionsMonth"){
            this.StatConnectionsMonth(res, User, UserId)
        } else if (Data.Type == "UserDay"){
            this.StatUserDay(Data.Data, res, User, UserId)
        } else if (Data.Type == "UserMonth"){
            this.StatUserMonth(Data.Data, res, User, UserId)
        } else {
            res.json({Error: true, ErrorMsg: "Stat type not correct", Data: null})
        }
    }
    
    StatConnectionsDay(res, User, UserId){
        const Query = {[this._MongoVar.LogAppliType]: "Stat"}
        const Projection = {}
        const Sort = {[this._MongoVar.LogAppliNow]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, this._MongoVar.LogAppliCollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No stat in DB", Data: null})
            } else {
                let ReponseConnections = []
                let date = new Date()
                date.setHours(1,0,0,0)
                date.setDate( date.getDate() - 29 )

                for (let index = 0; index <= 29; index++) {
                    let NewElement = new Object()
                    NewElement.Date = new Date(date.getTime())
                    NewElement.Jour = date.getDate()
                    NewElement.Mois = date.getMonth() + 1
                    NewElement.FirstGet = 0
                    NewElement.App = 0
                    NewElement.Admin = 0
                    NewElement.Error = 0
                    ReponseConnections.push(NewElement)
                    date.setDate( date.getDate() +1 )
                }
                let startindexreponse = 0
                reponse.forEach(element => {
                    for (let index = startindexreponse; index<ReponseConnections.length; index++){
                        let ReponseDate = ReponseConnections[index].Date
                        if ((ReponseDate.getFullYear() === element.Now.getFullYear()) && (ReponseDate.getMonth() === element.Now.getMonth()) && (ReponseDate.getDate() === element.Now.getDate())){
                            startindexreponse = index
                            const Valeur = JSON.parse(element.Valeur)
                            if (Valeur.Type == "FirstGet"){
                                ReponseConnections[index].FirstGet +=1
                            } else if (Valeur.Type == "UserConnected"){
                                if (Valeur.App == "App"){
                                    ReponseConnections[index].App +=1
                                } else if (Valeur.App == "Admin"){
                                    ReponseConnections[index].Admin +=1
                                }
                            } else if (Valeur.Type == "UserNotConnected"){
                                ReponseConnections[index].Error +=1
                            }
                        } else if (element.Now.getTime()<ReponseDate.getTime()){
                            index = reponse.length
                        }
                    }
                });
                res.json({Error: false, ErrorMsg: "Stat in DB", Data: ReponseConnections})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdmin Stat DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    StatConnectionsMonth(res, User, UserId){
        const Query = {[this._MongoVar.LogAppliType]: "Stat"}
        const Projection = {}
        const Sort = {[this._MongoVar.LogAppliNow]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, this._MongoVar.LogAppliCollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No stat in DB", Data: null})
            } else {
                let ReponseConnections = []
                let date = new Date()
                date.setHours(1,0,0,0)
                date.setDate(1)
                date.setMonth(date.getMonth() - 11)

                for (let index = 0; index <= 11; index++) {
                    let NewElement = new Object()
                    NewElement.Date = new Date(date.getTime())
                    NewElement.Jour = date.getMonth() + 1
                    NewElement.Mois = date.getFullYear()
                    NewElement.FirstGet = 0
                    NewElement.App = 0
                    NewElement.Admin = 0
                    NewElement.Error = 0
                    ReponseConnections.push(NewElement)
                    date.setMonth( date.getMonth() +1 )
                }
                let startindexreponse = 0
                reponse.forEach(element => {
                    for (let index = startindexreponse; index<ReponseConnections.length; index++){
                        let ReponseDate = ReponseConnections[index].Date
                        if ((ReponseDate.getFullYear() === element.Now.getFullYear()) && (ReponseDate.getMonth() === element.Now.getMonth())){
                            startindexreponse = index
                            const Valeur = JSON.parse(element.Valeur)
                            if (Valeur.Type == "FirstGet"){
                                ReponseConnections[index].FirstGet +=1
                            } else if (Valeur.Type == "UserConnected"){
                                if (Valeur.App == "App"){
                                    ReponseConnections[index].App +=1
                                } else if (Valeur.App == "Admin"){
                                    ReponseConnections[index].Admin +=1
                                }
                            } else if (Valeur.Type == "UserNotConnected"){
                                ReponseConnections[index].Error +=1
                            }
                        } else if (element.Now.getTime()<ReponseDate.getTime()){
                            index = reponse.length
                        }
                    }
                });
                res.json({Error: false, ErrorMsg: "Stat in DB", Data: ReponseConnections})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdmin Stat DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    StatUserDay(Data, res, User, UserId){
        const Query = {$and:[{[this._MongoVar.LogAppliType]: "Stat"}, {[this._MongoVar.LogAppliUser]: Data}]}
        const Projection = {}
        const Sort = {[this._MongoVar.LogAppliNow]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, this._MongoVar.LogAppliCollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No stat in DB", Data: null})
            } else {
                let ReponseConnections = []
                let date = new Date()
                date.setHours(1,0,0,0)
                date.setDate( date.getDate() - 29 )

                for (let index = 0; index <= 29; index++) {
                    let NewElement = new Object()
                    NewElement.Date = new Date(date.getTime())
                    NewElement.Jour = date.getDate()
                    NewElement.Mois = date.getMonth() + 1
                    NewElement.App = 0
                    NewElement.Admin = 0
                    ReponseConnections.push(NewElement)
                    date.setDate( date.getDate() +1 )
                }
                let startindexreponse = 0
                reponse.forEach(element => {
                    for (let index = startindexreponse; index<ReponseConnections.length; index++){
                        let ReponseDate = ReponseConnections[index].Date
                        if ((ReponseDate.getFullYear() === element.Now.getFullYear()) && (ReponseDate.getMonth() === element.Now.getMonth()) && (ReponseDate.getDate() === element.Now.getDate())){
                            startindexreponse = index
                            const Valeur = JSON.parse(element.Valeur)
                            if (Valeur.App == "App"){
                                ReponseConnections[index].App +=1
                            } else if (Valeur.App == "Admin"){
                                ReponseConnections[index].Admin +=1
                            }
                        } else if (element.Now.getTime()<ReponseDate.getTime()){
                            index = reponse.length
                        }
                    }
                });
                res.json({Error: false, ErrorMsg: "Stat in DB", Data: ReponseConnections})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdmin Stat DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

    StatUserMonth(Data, res, User, UserId){
        const Query = {$and:[{[this._MongoVar.LogAppliType]: "Stat"}, {[this._MongoVar.LogAppliUser]: Data}]}
        const Projection = {}
        const Sort = {[this._MongoVar.LogAppliNow]: 1}
        this._Mongo.FindSortPromise(Query,Projection, Sort, this._MongoVar.LogAppliCollection).then((reponse)=>{
            if(reponse.length == 0){
                res.json({Error: false, ErrorMsg: "No stat in DB", Data: null})
            } else {
                let ReponseConnections = []
                let date = new Date()
                date.setHours(1,0,0,0)
                date.setDate(1)
                date.setMonth(date.getMonth() - 11)

                for (let index = 0; index <= 11; index++) {
                    let NewElement = new Object()
                    NewElement.Date = new Date(date.getTime())
                    NewElement.Jour = date.getMonth() + 1
                    NewElement.Mois = date.getFullYear()
                    NewElement.App = 0
                    NewElement.Admin = 0
                    ReponseConnections.push(NewElement)
                    date.setMonth( date.getMonth() +1 )
                }
                let startindexreponse = 0
                reponse.forEach(element => {
                    for (let index = startindexreponse; index<ReponseConnections.length; index++){
                        let ReponseDate = ReponseConnections[index].Date
                        if ((ReponseDate.getFullYear() === element.Now.getFullYear()) && (ReponseDate.getMonth() === element.Now.getMonth())){
                            startindexreponse = index
                            const Valeur = JSON.parse(element.Valeur)
                            if (Valeur.App == "App"){
                                ReponseConnections[index].App +=1
                            } else if (Valeur.App == "Admin"){
                                ReponseConnections[index].Admin +=1
                            }
                        } else if (element.Now.getTime()<ReponseDate.getTime()){
                            index = reponse.length
                        }
                    }
                });
                res.json({Error: false, ErrorMsg: "Stat in DB", Data: ReponseConnections})
            }
        },(erreur)=>{
            this.LogAppliError("ApiAdmin Stat DB error : " + erreur, User, UserId)
            res.json({Error: true, ErrorMsg: "DB Error", Data: null})
        })
    }

}

module.exports.ApiAdmin = ApiAdmin