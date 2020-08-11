import axios, { AxiosError } from 'axios';

import * as config from "./config.json";
import { DbAccess } from "./lib/db";
import { EvaluateRequest, EvaluateResponse, Paper } from "./lib/types";


const url = config.api.url;

const attributes = 'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y';

const headers = {
    'Ocp-Apim-Subscription-Key': config.api.key
};

const MAX_OFFSET = 1000000;
const COUNT = 500;

const START = 2010;
const END = 2020;

let dbAccess: DbAccess;

(async () => {
    console.time('time');

    // connect and verify db
    dbAccess = new DbAccess();
    await dbAccess.connect();
    console.log(`Successfully connected to ${config.db.connection}`);

    for (let year = START; year < END; year++) {
        console.log();
        console.log(`Starting to query "${MAX_OFFSET}" publications from year "${year}".`);

        for (let offset = 0; offset < MAX_OFFSET; offset += COUNT) {
            console.log(`Fetching publications ${offset + 1} - ${offset + COUNT}.`);
            const batch = await queryBatch(year, offset);
            
            console.log('Saving batch to db.');
            await dbAccess.insert(batch);

            if (batch.length < COUNT)
                break;
        }

    }

})()
.catch(error => {
    if (error.response?.data) {
        const err = error as AxiosError;
        console.error(err.response.data);
    } else {
        console.error(error);
    }
})
.finally(() => {
    console.timeEnd('time');
    return dbAccess.disconnect();
})
.catch(console.error);



async function queryBatch(year: number, offset: number) {

    const evaluateRequest: EvaluateRequest = {
        expr: `Y=${year}`,
        orderby: 'CC:desc',
        attributes,
        count: COUNT,
        offset
    };

    const res = await axios.post<EvaluateResponse<Paper>>(url, evaluateRequest, { headers });
    return res.data.entities;
}
