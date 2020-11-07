class VideoStream{
    constructor(VideoFolder, TagName){
        this._VideoFolder = VideoFolder
        this._TagName = TagName
    }

    Exectue(req, res ){
        console.log("video")
    }
}

module.exports.VideoStream = VideoStream