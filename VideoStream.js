class VideoStream{
    constructor(VideoFolder, TagName, LogInfo, LogError){
        this._VideoFolder = VideoFolder
        this._TagName = TagName
        this._LogInfo = LogInfo
        this.LogError = LogError
    }

    Exectue(req, res ){
        console.log("video")
    }
}

module.exports.VideoStream = VideoStream