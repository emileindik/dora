export type EvaluateRequest = {
    /**
     * A query expression that specifies which entities should be returned.
     */
    expr: string;

    /**
     * Name of the model that you wish to query. Currently, the value defaults to latest.
     */
    model?: string;

    /**
     * A comma-delimited list that specifies the attribute values that are included in the response. Attribute names are case-sensitive.
     * @default 'Id'
     */
    attributes?: string;

    /**
     * Number of results to return.
     * @default 10
     */
    count?: number;

    /**
     * Index of the first result to return.
     * @default 0
     */
    offset?: number;

    /**
     * Name of an attribute that is used for sorting the entities. Optionally, ascending/descending can be specified. The format is: name:asc or name:desc.
     * @default 'prob:desc'
     */
    orderby?: string;

    timeout?: number;
}

export type EvaluateResponse<T=object> = {
    expr: string;
    entities: T[];
    timed_out: boolean;
}

export type Paper = {
    'AA.AfId'?: number;
    'AA.AfN'?: string;
    'AA.AuId'?: number;
    'AA.AuN'?: string;
    'AA.DAuN'?: string;
    'AA.DAfN'?: string;
    'AA.S'?: number;
    /**
     * Return types of AA entity
     */
    AA?: {
        AfId?: number;
        AfN?: string;
        AuId?: number;
        AuN?: string;
        DAuN?: string;
        DAfN?: string;
        S?: number;
    };
    AW?: string[];
    BT?: string;
    BV?: string;
    'C.CId'?: number;
    'C.CN'?: string;
    /**
     * Return types of C entity
     */
    C?: {
        CId?: number;
        CN?: string;
    };
    CC?: number;
    CitCon?: any;
    D?: string;
    DN?: string;
    DOI?: string;
    ECC?: number;
    /**
     * Return types of F entity
     */
    'F.DFN'?: string;
    'F.FId'?: number;
    'F.FN'?: string;
    F?: {
        DFN?: string;
        FId?: number;
        FN?: string;
    }
    FamId?: number;
    FP?: string;
    I?: string;
    IA?: {
        IndexLength?: number;
        InvertedIndex?: Record<string, number[]>;
    };
    Id?: number;
    'J.JId'?: number;
    'J.JN'?: string;
    /**
     * Return types of J entity
     */
    J?: {
        JId?: number;
        JN?: string;
    };
    LP?: string;
    PB?: string;
    Pt?: string;
    RId?: number[];
    S?: {
        Ty?: number;
        U?: string;
    }[];
    Ti?: string;
    V?: string;
    VFN?: string;
    VSN?: string;
    W?: string[];
    Y?: number;
    [index: string]: any;
}