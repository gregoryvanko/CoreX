class DbBackup{
    constructor(BdName, Privatekey, FolderId, LogFct){
        this._BdName = BdName
        this._GoogleBackupFolderId = FolderId
        this._GooglePrivatekey = Privatekey
        this._LogFct = LogFct
    }

    /**
     * Backup d'une BD mongodb sur google drive
     */
    Backup(){
        this._LogFct("Start Backup", "Server", "Server")
        var me = this
        return new Promise((resolve, reject)=>{
            if(this._GooglePrivatekey){
                this._LogFct("Start Mongodump", "Server", "Server")
                const exec = require('child_process').exec
                // Backup de la db
                const cmd = 'mongodump --db ' + this._BdName + ' --gzip --archive=' + __dirname + "/" + this._BdName +".gz"
                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        console.log(error)
                        reject("Erreur lors de la creation du dump de la DB")
                    } else {
                        me.GoogleBackup(__dirname, me._BdName +".gz", resolve, reject)
                    }
                })
            } else {
                reject("Erreur no privatekey defined")
            }
        })
    }

    /**
     * Realise un backup d'un fichier sur google drive
     * @param {string} BackupDbPath Chemin vers le fichier a backuper
     * @param {string} BackupDbName Nom du fichier a backuper
     * @param {resolve} resolve resolve
     * @param {reject} reject reject
     */
    GoogleBackup(BackupDbPath, BackupDbName, resolve, reject){
        this._LogFct("Get Google file list", "Server", "Server")
        var me = this
        const {google} = require('googleapis');
        let credentials = this._GooglePrivatekey
        const scopes = ['https://www.googleapis.com/auth/drive']
        const auth = new google.auth.JWT(credentials.client_email, null,credentials.private_key, scopes)
        const drive = google.drive({ version: "v3", auth })
        // Lister les fichier sur le Google Drive dans le repertoire googleBackupFolderId
        drive.files.list({q:"'"+ this._GoogleBackupFolderId +"' in parents", fields: 'files(id,name)'}, (err, res) => {
            if (err){
                console.log(err)
                reject("Erreur lors de la reception de la liste des fichiers sur google drive")
            } else {
                const files = res.data.files;
                if (files.length) {
                    // Chercher l'esistance d'un fichier de backup existant
                    let Backupfilefound = false
                    let GoogleBackupFileId = null
                    files.forEach(element => {
                        if(element.name == BackupDbName){
                            Backupfilefound = true
                            GoogleBackupFileId = element.id
                        }
                    })
                    if (Backupfilefound){
                        //console.log("File found")
                        me.GoogleUpdateFile(drive, GoogleBackupFileId, BackupDbPath, BackupDbName, resolve, reject)
                    } else {
                        //console.log("File not found")
                        me.GoogleCreateFile(drive, me._GoogleBackupFolderId, BackupDbPath, BackupDbName, resolve, reject)
                    }
                } else {
                    //console.log('No files found')
                    me.GoogleCreateFile(drive, me._GoogleBackupFolderId, BackupDbPath, BackupDbName, resolve, reject)
                }
            }
        })
    }

    /**
     * Création d'un fichier sur google drive
     * @param {drive} drive Objet drive de de googleapi
     * @param {string} GoogleBackupFolderId Id google du folder de backup sur google drive
     * @param {string} BackupDbPath Chemin vers le fichier a backuper
     * @param {string} BackupDbName Nom du fichier a backuper
     * @param {resolve} resolve Fonction resolve
     * @param {reject} reject Fonction reject
     */
    GoogleCreateFile(drive, GoogleBackupFolderId, BackupDbPath, BackupDbName, resolve, reject){
        this._LogFct("Start creation file on google", "Server", "Server")
        const fs = require("fs")
        drive.files.create({
            resource: {'name': BackupDbName, parents: [GoogleBackupFolderId]},
            media: {mimeType: 'application/gzip',body: fs.createReadStream(BackupDbPath + "/" + BackupDbName)},
            fields: 'id'
        }, (err, result) => {
            if( err ) {
                console.log(err)
                reject("Erreur lors de la creation du fichier backup sur google drive")
            } else {
                this._LogFct("File on google created", "Server", "Server")
                //console.log('File Id: ', result.data.id)
                fs.unlink(BackupDbPath + "/" + BackupDbName, (err) => {
                    if (err){
                        console.log(err)
                        reject("Erreur lors du delete du ficher temp.gz lors la creation du fichier backup sur google drive")
                    } else {
                        resolve("DB Backuped")
                    }
                })
            }
        })
    }

    /**
     * Update un ficher existant sur google drive
     * @param {drive} drive Object drive de googleapi
     * @param {string} GoogleBackupFileId google Id du fichier a remplacer
     * @param {string} BackupDbPath Chemin vers le repertoire contenant le fichier a backuper
     * @param {string} BackupDbName Nom du fichier a backuper
     * @param {resove} resolve resolve de la fonction promise de backup
     * @param {reject} reject reject de la fonction promise de backup
     */
    GoogleUpdateFile(drive, GoogleBackupFileId, BackupDbPath, BackupDbName, resolve, reject){
        this._LogFct("Start update file on google", "Server", "Server")
        const fs = require("fs")
        drive.files.update({
            fileId: GoogleBackupFileId,
            resource: {},
            media: {body: fs.createReadStream(BackupDbPath + "/" + BackupDbName)}
        }, (err, file) => {
            if (err) {
              console.log(err)
              reject("Erreur lors de l'update du fichier backup sur google drive")
            } else {
                this._LogFct("File on Google updated", "Server", "Server")
                //console.log('File Id: ', file.data.id)
                fs.unlink(BackupDbPath + "/" + BackupDbName, (err) => {
                    if (err){
                        console.log(err)
                        reject("Erreur lors du delete du ficher temp.gz lors de l'update du fichier backup sur google drive")
                    } else {
                        resolve("DB Backuped")
                    }
                })
            }
        })
    }

    /**
     * Restore d'une DB mongodb a partir de google drive
     */
    Restore(){
        this._LogFct("Start restore backup", "Server", "Server")
        return new Promise((resolve, reject)=>{
            if(this._GooglePrivatekey){
                // Recuperer le Backup sur google drive
                this.GoogleRestore(__dirname, this._BdName +".gz", resolve, reject)
            } else {
                reject("Erreur no privatekey defined")
            }
        })
    }

    /**
     * Download du fichier backup se trouvant sur google drive
     * @param {string} BackupDbPath Chemin ver le repertoire temp pour le fichier backup
     * @param {string} BackupDbName nom du fichier a backuper
     * @param {resove} resolve reslve de la fonction primise Restore
     * @param {reject} reject reject de la fonctin promise Restore
     */
    GoogleRestore(BackupDbPath, BackupDbName, resolve, reject){
        this._LogFct("Get google file list", "Server", "Server")
        var me = this
        const {google} = require('googleapis');
        let credentials = this._GooglePrivatekey
        const scopes = ['https://www.googleapis.com/auth/drive']
        const auth = new google.auth.JWT(credentials.client_email, null,credentials.private_key, scopes)
        const drive = google.drive({ version: "v3", auth })
        // Lister les fichier sur le Google Drive dans le repertoire googleBackupFolderId
        drive.files.list({q:"'"+ this._GoogleBackupFolderId +"' in parents", fields: 'files(id,name)'}, (err, res) => {
            if (err){
                console.log(err)
                reject("Erreur lors de la reception de la liste des fichiers sur google drive")
            } else {
                const files = res.data.files;
                if (files.length) {
                    // Chercher l'esistance d'un fichier de backup existant
                    let Backupfilefound = false
                    let GoogleBackupFileId = null
                    files.forEach(element => {
                        if(element.name == BackupDbName){
                            Backupfilefound = true
                            GoogleBackupFileId = element.id
                        }
                    })
                    if (Backupfilefound){
                        //console.log("File found")
                        me.GoogleGetBackupFile(drive, GoogleBackupFileId, BackupDbPath, BackupDbName, resolve, reject)
                    } else {
                        //console.log("File not found")
                        reject("Erreur pas de fichier BackupDbName sur google drive")
                    }
                } else {
                    //console.log('No files found')
                    reject("Erreur pas de fichier sur google drive")
                }
            }
        })
    }

    /**
     * Telecharger le ficher backup existant sur google drive
     * @param {drive} drive Object drive de googleapi
     * @param {string} GoogleBackupFileId google Id du fichier a remplacer
     * @param {string} BackupDbPath Chemin vers le repertoire contenant le fichier a backuper
     * @param {string} BackupDbName Nom du fichier a backuper
     * @param {resove} resolve resolve de la fonction promise de backup
     * @param {reject} reject reject de la fonction promise de backup
     */
    GoogleGetBackupFile(drive, GoogleBackupFileId, BackupDbPath, BackupDbName, resolve, reject){
        this._LogFct("Start downloading backup", "Server", "Server")
        var me = this
        const fs = require("fs")
        var dest = fs.createWriteStream(BackupDbPath + "/" + BackupDbName)
        drive.files.get({fileId: GoogleBackupFileId, alt: 'media'}, {responseType: 'stream'},function(err, res){
            res.data
            .on('end', () => {
                me._LogFct("Backup file is downloaded", "Server", "Server")
                // Restore de la db
                me.RestoreDb(BackupDbPath, BackupDbName, resolve, reject)
            })
            .on('error', err => {
                console.log('Error', err)
                reject("Erreur lors du download du fichier backup de google drive")
            })
            .pipe(dest);
        })
    }

    /**
     * Restore de la DB avec le fichier venant de google drive
     * @param {string} BackupDbPath Chemin vers le repertoire contenant le fichier a backuper
     * @param {string} BackupDbName Nom du fichier a backuper
     * @param {resove} resolve resolve de la fonction promise de backup
     * @param {reject} reject reject de la fonction promise de backup
     */
    RestoreDb(BackupDbPath, BackupDbName, resolve, reject){
        const fs = require("fs")
        let me = this
        const exec = require('child_process').exec
        let DbName = BackupDbName.replace(".gz", "")
        const cmd = 'mongorestore --drop --gzip --db=' + DbName + ' --archive=' + BackupDbPath + "/" + BackupDbName
        exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.log(error)
                reject("Erreur lors du restore du dump de la DB")
            } else {
                me._LogFct("MongoRestore Done", "Server", "Server")
                fs.unlink(BackupDbPath + "/" + BackupDbName, (err) => {
                    if (err){
                        console.log(err)
                        reject("Erreur lors du delete du ficher temp.gz lors du restore du fichier backup sur google drive")
                    } else {
                        resolve("DB Restored")
                    }
                })
            }
        })
    }
}

module.exports.DbBackup = DbBackup