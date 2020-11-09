class VideoStream{
    constructor(VideoFolder, TagName, LogInfo, LogError){
        this._VideoFolder = VideoFolder
        this._TagName = TagName
        this._LogInfo = LogInfo
        this._LogError = LogError
        this._fs = require("fs");
    }

    Exectue(req, res ){
        const filePath = this._VideoFolder + "/" + req.query[this._TagName]

        if (req.query[this._TagName].match(/^[a-z0-9-_ ]+\.(mp4|mov)$/i)){
            if(this._fs.existsSync(filePath)){
                const options = {};
                let start;
                let end;
                const range = req.headers.range;
                if (range) {
                    const bytesPrefix = "bytes=";
                    if (range.startsWith(bytesPrefix)) {
                        const bytesRange = range.substring(bytesPrefix.length);
                        const parts = bytesRange.split("-");
                        if (parts.length === 2) {
                            const rangeStart = parts[0] && parts[0].trim();
                            if (rangeStart && rangeStart.length > 0) {
                                options.start = start = parseInt(rangeStart);
                            }
                            const rangeEnd = parts[1] && parts[1].trim();
                            if (rangeEnd && rangeEnd.length > 0) {
                                options.end = end = parseInt(rangeEnd);
                            }
                        }
                    }
                }
                res.setHeader("content-type", "video/mp4");
                var stats = this._fs.statSync(filePath)
                var contentLength = stats["size"]
                if (req.method === "HEAD") {
                    res.statusCode = 200;
                    res.setHeader("accept-ranges", "bytes");
                    res.setHeader("content-length", contentLength);
                    res.end();
                }else {       
                    let retrievedLength;
                    if (start !== undefined && end !== undefined) {
                        retrievedLength = (end+1) - start;
                    }else if (start !== undefined) {
                        retrievedLength = contentLength - start;
                    }else if (end !== undefined) {
                        retrievedLength = (end+1);
                    }else {
                        retrievedLength = contentLength;
                    }
                    res.statusCode = start !== undefined || end !== undefined ? 206 : 200;
                    res.setHeader("content-length", retrievedLength);
                    if (range !== undefined) {  
                        res.setHeader("content-range", `bytes ${start || 0}-${end || (contentLength-1)}/${contentLength}`);
                        res.setHeader("accept-ranges", "bytes");
                    }
                    const fileStream = this._fs.createReadStream(filePath, options);
                    fileStream.on("error", error => {
                        res.sendStatus(500);
                        this._LogError(`Video error reading file ${filePath}. Error: ${error}`, "Server", "Server")
                    });
                    fileStream.pipe(res);
                }
            }else {
                res.status(404).send(`Video file not foud: ${filePath}`)
                this._LogError(`Video file not foud: ${filePath}`, "Server", "Server")
            }
        } else {
            res.status(404).send(`Video file name not match with reg expression: ${req.query[this._TagName]}`)
            this._LogError(`Video file name not match with reg expression: ${req.query[this._TagName]}`, "Server", "Server")
        }
    }
}

module.exports.VideoStream = VideoStream