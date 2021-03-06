class CoreXSocketIo{
    constructor(){
        this._SocketIo = null
    }

    get SocketIo() {
        return this._SocketIo
    }
    
    Init(){
        this._SocketIo = io({autoConnect: false, reconnection: true, reconnectionAttempts: 2, reconnectionDelay: 1000, reconnectionDelayMax: 1000})
        this.InitSocketIoMessage()
        this.Open()
    }

    Open(){
        this._SocketIo.io.opts.query = {token: GlobalGetToken()}
        this._SocketIo.open() 
    }

    Close(){
        this._SocketIo.disconnect()
    }

    InitSocketIoMessage(){
        let me = this
        // Init des messages error socket io
        this._SocketIo.on('error', function(err) {
            console.log(me.GetTime() + ' SocketIo.on error, err: ' + err.type)
            if (err.type != "TransportError"){
                document.body.innerHTML =`
                <div style='font-size: 3vh; color: red; text-align: center; margin-top: 10%;'>SocketIo.on error: ` + err.type +`</div>
                `
            }
        })
        
        // Init des messages connect socket io
        this._SocketIo.on('connect', () => {
            console.log(me.GetTime() + ' SocketIo.on connect')
        })
        
        this._SocketIo.on("connect_error", (err) => {
            console.log(me.GetTime() + ' SocketIo.on connect_error ' + err.message + " " + err.data)
        });
        
        // Init des messages disconnect socket io
        this._SocketIo.on('disconnect', (reason) => {
            console.log(me.GetTime() + ' SocketIo.on disconnect, reason : ' + reason)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect', (attemptNumber) => {
            console.log('SocketIo.on reconnect, attemptNumber: ' + attemptNumber)
        })
        
        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_attempt', (attemptNumber) => {
            console.log('SocketIo.on reconnect_attempt, attemptNumber: ' + attemptNumber)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnecting', (attemptNumber) => {
            console.log('SocketIo.on reconnecting, attemptNumber: ' + attemptNumber)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_error', (error) => {
            console.log(me.GetTime() + ' SocketIo.on reconnect_error, ' + error)
        })

        // Init des messages disconnect socket io
        this._SocketIo.on('reconnect_failed', () => {
            console.log(me.GetTime() + ' SocketIo.on reconnect_failed')
            document.body.innerHTML = `
                <div style='font-size: 3vh; color: red; text-align: center; margin-top: 10%;'>SocketIo: User disconnected</div>
                <div style='margin-top: 2%; display: flex; justify-content: center;'><button style='padding: 1vh; font-size: 3vh; cursor: pointer; border: 1px solid rgb(44,1,21); border-radius: 20px; text-align: center; box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7); background: white; outline: none;' onclick="location.reload();">Reload</button></div>
                `
        })
    }

    GetTime(){
        const today = new Date()
        return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    }
}