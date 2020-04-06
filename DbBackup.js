class DbBackup{
    constructor(BdName){
        this._BdName = BdName
    }
    Start(){
        var me = this
        return new Promise((resolve, reject)=>{
            const fs = require("fs")
            const exec = require('child_process').exec
            const execSync = require('child_process').execSync
            // Creation d'un repertoire Temp si il n'exites pas, ou le vider si il existe
            const Path = process.cwd() + "/Temp"
            if (fs.existsSync(Path)) {
                console.log("Delete du repertoire Temp")
                execSync('rm -r ' + Path)
                fs.mkdirSync(Path)
            } else {
                console.log("Creation du repertoire Temp")
                fs.mkdirSync(Path)
            }
            // Backup de la db
            const cmd = 'mongodump --db ' + this._BdName + ' --out ' + Path
            exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    reject(error)
                } else {
                    me.GoogleBackup(Path + "/" + me._BdName, resolve, reject)
                }
            })
        })
    }

    GoogleBackup(PathDb, resolve, reject){
        resolve("DB Backuped")
    }
}

module.exports.DbBackup = DbBackup