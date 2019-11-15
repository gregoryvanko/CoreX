class Mongo {

    /* Check if collection exist */
    static CollectionExist(Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let url = Url+ "/" + DbName
        MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
            if(err) {ErrorCallback(err)}
            else {
                client.db(DbName).listCollections({name:Collection}).toArray(function(err, items) {
                    if(err) {ErrorCallback(err)}
                    else {
                        if ((items.length == 1) && (items[0].name == Collection)){
                            DoneCallback(true)
                        } else {
                            DoneCallback(false)
                        }
                    }
                })
                client.close()
            }
        })
    }

    /* Trouver un element dans la collecrtion:Collection suivant la querry:Querry */
    static FindPromise(Querry, Projection, Collection, Url, DbName){
        return new Promise((resolve, reject)=>{
            let MongoClient = require('mongodb').MongoClient
            let url = Url+ "/" + DbName
            MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if(err) reject(err)
                else {
                    const LoginCollection = client.db(DbName).collection(Collection)
                    LoginCollection.find(Querry,Projection).toArray(function(err, result) {
                        if(err) reject(err)
                        else {
                            resolve(result) 
                        }
                    })
                    client.close()
                }
            })
        })
    }

    /* Save (add or update) */
    static InsertOne(Data, Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let url = Url+ "/" + DbName
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if(err) {
                ErrorCallback(err)
            }
            else {
                const MyCollection = client.db(DbName).collection(Collection)
                MyCollection.insertOne(Data,function(err, res) {
                    if (err) ErrorCallback(err)
                    DoneCallback(res.ops[0])
                })
                client.close()
            }
        })
    }

    /* Find with querry and Projection */
    static FindQuerryProjection(Querry, Projection, Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let url = Url+ "/" + DbName
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if(err) {
                ErrorCallback(err)
            }
            else {
                const MyCollection = client.db(DbName).collection(Collection)
                MyCollection.find(Querry,Projection).toArray(function(err, res) {
                    if (err) ErrorCallback(err)
                    DoneCallback(res)
                })
                client.close()
            }
        })
    }

    /* Find All */
    static FindAll(Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let url = Url+ "/" + DbName
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if(err) {
                ErrorCallback(err)
            }
            else {
                const MyCollection = client.db(DbName).collection(Collection)
                MyCollection.find().toArray(function(err, res) {
                    if (err) ErrorCallback(err)
                    DoneCallback(res)
                })
                client.close()
            }
        })
    }

    /* Update */
    static UpdateById(Id, Newvalues, Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let ObjectID = require('mongodb').ObjectID
        let Query = {"_id": new ObjectID(Id)}   
        let url = Url+ "/" + DbName
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if(err) {
                ErrorCallback(err)
            }
            else {
                const MyCollection = client.db(DbName).collection(Collection)
                MyCollection.updateOne(Query, Newvalues, function(err, res) {
                    if (err) ErrorCallback(err)
                    DoneCallback(res)
                })
                client.close()
            }
        })
    }

    /* Delete by Id */
    static DeleteById(Id, Collection, Url, DbName, DoneCallback, ErrorCallback){
        let MongoClient = require('mongodb').MongoClient
        let ObjectID = require('mongodb').ObjectID
        let Query = {"_id": new ObjectID(Id)}   
        let url = Url+ "/" + DbName
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if(err) {
                ErrorCallback(err)
            }
            else {
                const MyCollection = client.db(DbName).collection(Collection)
                MyCollection.deleteOne(Query, function(err, res) {
                    if (err) ErrorCallback(err)
                    DoneCallback(res)
                })
                client.close()
            }
        })
    }
}

module.exports.Mongo = Mongo;