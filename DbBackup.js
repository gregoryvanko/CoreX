class DbBackup{
    constructor(BdName){
        this._BdName = BdName
        this._GoogleBackupFolderId = "1JCZoiwqL7Il_0jcGIPUwKPI_YjY6iOO4"
    }

    /** Backup */
    Backup(){
        var me = this
        return new Promise((resolve, reject)=>{
            const fs = require("fs")
            const exec = require('child_process').exec
            const execSync = require('child_process').execSync
            // Creation d'un repertoire Temp si il n'exites pas, ou le vider si il existe
            const Path = process.cwd() + "/Temp"
            if (fs.existsSync(Path)) {
                //console.log("Delete du repertoire Temp")
                execSync('rm -r ' + Path)
                fs.mkdirSync(Path)
            } else {
                //console.log("Creation du repertoire Temp")
                fs.mkdirSync(Path)
            }
            // Backup de la db
            const cmd = 'mongodump --db ' + this._BdName + ' --gzip --archive=' + Path + "/" + this._BdName +".gz"
            exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    console.log(error)
                    reject("Erreur lors de la creation du dump de la DB")
                } else {
                    me.GoogleBackup(Path, me._BdName +".gz", resolve, reject)
                }
            })
        })
    }

    GoogleBackup(BackupDbPath, BackupDbName, resolve, reject){
        var me = this
        const {google} = require('googleapis');
        let credentials = require("./privatekey.json")
        const scopes = ['https://www.googleapis.com/auth/drive']
        const auth = new google.auth.JWT(credentials.client_email, null,credentials.private_key, scopes)
        const drive = google.drive({ version: "v3", auth })

        // Lister les fichier sur le Google Drive dans le repertoire oogleBackupFolderId
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
                resolve("DB Backuped")
            }
        })
        
    }

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
                resolve("DB Backuped")
            }
        })
    }

    /** Restore */
    Restore(){
        var me = this
        return new Promise((resolve, reject)=>{
            resolve("DB Restored")
        })
    }

}


module.exports.DbBackup = DbBackup