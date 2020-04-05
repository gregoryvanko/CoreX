class GoogleBackup{
    constructor(res){
        this._res = res
    }
    Start(){
        // ToDo
        this._res.json({Error: false, ErrorMsg: "DB Backuped", Data: "DB Backuped"})
    }
}

module.exports.GoogleBackup = GoogleBackup