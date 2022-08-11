interface EphemeralResult {
    associated_objects: {
        type: string; // "customer" 
        id: string;
    }[];
    id: string;
    object: string;
    secret: string; // the key
}

export default EphemeralResult;