import { MongoClient, ObjectId, Db, Collection } from 'mongodb';
import { Paper } from './types';

import * as config from './config.json';

 

export class DbAccess {
    client: MongoClient;
    db: Db;
    collection: Collection;

    async connect() {
        this.client = new MongoClient(config.mongodbConnection, { useUnifiedTopology: true });
        await this.client.connect();

        this.db = this.client.db(config.db);
        this.collection = this.db.collection('paper');
    }

    async insert(batch: Paper[]) {
        for (const paper of batch) {
            this.clean(paper);
        }

        await this.collection.insertMany(batch);
    }

    async disconnect() {
        await this.client.close();
    }

    private clean(paper: Paper) {
        const id = paper.Id.toString().padEnd(12, '-');
        paper._id = new ObjectId(id);

        for (const key in paper.IA?.InvertedIndex) {
            paper.IA.InvertedIndex[key.replace('/./g', '!')] = paper.IA?.InvertedIndex[key];
            delete paper.IA?.InvertedIndex[key];
        }
    }
}