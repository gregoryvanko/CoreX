class DbBackup{
    constructor(BdName){
        this._BdName = BdName
        this._PathTemp = __dirname + "/Temp"
        this._GoogleBackupFolderId = "1JCZoiwqL7Il_0jcGIPUwKPI_YjY6iOO4"
    }

    /**
     * Backup d'une BD mongodb sur google drive
     */
    Backup(){
        var me = this
        return new Promise((resolve, reject)=>{
            const fs = require("fs")
            if(fs.existsSync(__dirname + "/privatekey.json")){
                const exec = require('child_process').exec
                const execSync = require('child_process').execSync
                // Creation d'un repertoire Temp si il n'exites pas, ou le vider si il existe
                if (fs.existsSync(this._PathTemp)) {
                    //console.log("Delete du repertoire Temp")
                    execSync('rm -r ' + this._PathTemp)
                    fs.mkdirSync(this._PathTemp)
                } else {
                    //console.log("Creation du repertoire Temp")
                    fs.mkdirSync(this._PathTemp)
                }
                // Backup de la db
                const cmd = 'mongodump --db ' + this._BdName + ' --gzip --archive=' + this._PathTemp + "/" + this._BdName +".gz"
                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        console.log(error)
                        reject("Erreur lors de la creation du dump de la DB")
                    } else {
                        me.GoogleBackup(me._PathTemp, me._BdName +".gz", resolve, reject)
                    }
                })
            } else {
                reject("Erreur no privatekey file")
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
        var me = this
        const {google} = require('googleapis');
        let credentials = require("./privatekey.json")
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
                //console.log('File Id: ', result.data.id)
                if (fs.existsSync(BackupDbPath)) {
                    //console.log("Delete du repertoire Temp")
                    const execSync = require('child_process').execSync
                    execSync('rm -r ' + BackupDbPath)
                }
                resolve("DB Backuped")
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
                //console.log('File Id: ', file.data.id)
                if (fs.existsSync(BackupDbPath)) {
                    //console.log("Delete du repertoire Temp")
                    const execSync = require('child_process').execSync
                    execSync('rm -r ' + BackupDbPath)
                }
                resolve("DB Backuped")
            }
        })
    }

    /**
     * Restore d'une DB mongodb a partir de google drive
     */
    Restore(){
        return new Promise((resolve, reject)=>{
            const fs = require("fs")
            if(fs.existsSync(__dirname + "/privatekey.json")){
                const execSync = require('child_process').execSync
                // Creation d'un repertoire Temp si il n'exites pas, ou le vider si il existe
                if (fs.existsSync(this._PathTemp)) {
                    //console.log("Delete du repertoire Temp")
                    execSync('rm -r ' + this._PathTemp)
                    fs.mkdirSync(this._PathTemp)
                } else {
                    //console.log("Creation du repertoire Temp")
                    fs.mkdirSync(this._PathTemp)
                }
                // Recuperer le Backup sur google drive
                this.GoogleRestore(this._PathTemp, this._BdName +".gz", resolve, reject)
            } else {
                reject("Erreur no privatekey file")
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
        var me = this
        const {google} = require('googleapis');
        let credentials = require("./privatekey.json")
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
        var me = this
        const fs = require("fs")
        var dest = fs.createWriteStream(BackupDbPath + "/" + BackupDbName)

        drive.files.get({fileId: GoogleBackupFileId, alt: 'media'}, {responseType: 'stream'},function(err, res){
            res.data
            .on('end', () => {
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
        const exec = require('child_process').exec
        const execSync = require('child_process').execSync
        let DbName = BackupDbName.replace(".gz", "")
        const cmd = 'mongorestore --drop --gzip --db=' + DbName + ' --archive=' + BackupDbPath + "/" + BackupDbName
        exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.log(error)
                reject("Erreur lors du restore du dump de la DB")
            } else {
                // Delete du repertoire Temp
                if (fs.existsSync(BackupDbPath)) {
                    //console.log("Delete du repertoire Temp")
                    execSync('rm -r ' + BackupDbPath)
                    resolve("DB Restored")
                } else {
                    resolve("DB Restored")
                }
            }
        })
    }

}


module.exports.DbBackup = DbBackup