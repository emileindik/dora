import axios, { AxiosError } from 'axios';

import * as config from '../config.json';
import { EvaluateRequest, EvaluateResponse, Paper } from '../lib/types';


const url = 'https://api.labs.cognitive.microsoft.com/academic/v1.0/evaluate';

const attributes = 'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y';

const headers = {
    'Ocp-Apim-Subscription-Key': config.api.key
};

const COUNT = 100;


(async () => {
    console.time('time');
    const batch = await queryBatch();
    console.log(batch[0]);
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
});



async function queryBatch() {

    const evaluateRequest: EvaluateRequest = {
        expr: `Y=2010`,
        // orderby: 'CC:desc',
        // attributes,
        // count: COUNT,
        offset: 500000
    };

    const res = await axios.post<EvaluateResponse<Paper>>(url, evaluateRequest, { headers });
    return res.data.entities;
}
