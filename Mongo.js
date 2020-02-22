class Mongo {
    constructor(MongoUrl, MongoDbName){
        this._MongoDbName = MongoDbName
        this._Url = MongoUrl+ "/" + MongoDbName
        this._MongoClient = require('mongodb').MongoClient
    }
    /* Check if collection exist */
    CollectionExist(Collection, DoneCallback, ErrorCallback){
        this._MongoClient.connect(this._Url, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
            if(err) {ErrorCallback(err)}
            else {
                client.db(this._MongoDbName).listCollections({name:Collection}).toArray(function(err, items) {
                    if(err) {ErrorCallback(err)}
                    else {
                        if ((items.length == 1) && (items[0].name == Collection)){DoneCallback(true)}
                        else {DoneCallback(false)}
                    }
                    client.close()
                })
            }
        })
    }
    /* Trouver un element dans la collecrtion:Collection suivant la querry:Querry et la projection:Projection */
    FindPromise(Querry, Projection, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const LoginCollection = client.db(this._MongoDbName).collection(Collection)
                    LoginCollection.find(Querry,Projection).toArray(function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
    /* Trouver un element dans la collecrtion:Collection suivant la querry:Querry et la projection:Projection et faire un sort */
    FindSortPromise(Querry, Projection, Sort, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const LoginCollection = client.db(this._MongoDbName).collection(Collection)
                    LoginCollection.find(Querry,Projection).sort(Sort).toArray(function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
    /* Trouver un element dans la collecrtion:Collection suivant la querry:Querry et la projection:Projection et faire un sort en limitant et en skipant*/
    FindSortLimitSkipPromise(Querry, Projection, Sort, Limit, Skip, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const LoginCollection = client.db(this._MongoDbName).collection(Collection)
                    LoginCollection.find(Querry,Projection).limit(Limit).skip(Skip).sort(Sort).toArray(function(err, result) {
                        if(err) reject(err)
                        else {resolve(result) }
                        client.close()
                    })
                }
            })
        })
    }
    /* Delete d'un element par ID dans la collecrtion:Collection */
    DeleteByIdPromise(Id, Collection){
        return new Promise((resolve, reject)=>{
            let ObjectID = require('mongodb').ObjectID
            let Query = {"_id": new ObjectID(Id)}
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const MyCollection = client.db(this._MongoDbName).collection(Collection)
                    MyCollection.deleteOne(Query, function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
    /* Delete d'un element par querry dans la collecrtion:Collection */
    DeleteByQueryPromise(Query, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const MyCollection = client.db(this._MongoDbName).collection(Collection)
                    MyCollection.deleteMany(Query, function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
    /* Update d'un element par ID dans la collecrtion:Collection */
    UpdateByIdPromise(Id, Data, Collection, Url, DbName){
        return new Promise((resolve, reject)=>{
            let ObjectID = require('mongodb').ObjectID
            let Query = {"_id": new ObjectID(Id)}
            let Newvalues = { $set: Data }
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const MyCollection = client.db(this._MongoDbName).collection(Collection)
                    MyCollection.updateOne(Query, Newvalues, function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
    /* Compter un element dans la collecrtion:Collection suivant la querry:Querry */
    CountPromise(Querry, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const LoginCollection = client.db(this._MongoDbName).collection(Collection)
                    LoginCollection.find(Querry).count(function(err, result) {
                        if(err) reject(err)
                        else {resolve(result) }
                        client.close()
                    })
                }
            })
        })
    }
    /* Ajout d'un element par ID dans la collecrtion:Collection */
    InsertOnePromise(Data, Collection){
        return new Promise((resolve, reject)=>{
            this._MongoClient.connect(this._Url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const MyCollection = client.db(this._MongoDbName).collection(Collection)
                    MyCollection.insertOne(Data, function(err, result) {
                        if(err) reject(err)
                        else {resolve(result)}
                        client.close()
                    })
                }
            })
        })
    }
}

module.exports.Mongo = Mongo;
module.exports.MongoObjectId = require('mongodb').ObjectID;