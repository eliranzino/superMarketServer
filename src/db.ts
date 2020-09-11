import { MongoClient, Db } from 'mongodb';

let clinet: MongoClient;
const MONGODB_URL = 'mongodb://localhost:27017';

export async function connect(): Promise<Db> {
    if (!clinet){
        clinet = await MongoClient.connect(MONGODB_URL) 
    }
    return clinet.db('supermarket'); 
};

export async function closeDb() {
    if(!clinet){
        return;
    }

    clinet.close();
}

