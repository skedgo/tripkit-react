import { JsonCustomConvert } from "json2typescript";
declare enum GeocodingSource {
    PELIAS = "PELIAS",
    SKEDGO = "SKEDGO",
    ACT_SCHOOLS = "ACT_SCHOOLS",
    OTHER = "OTHER"
}
export declare class GeocodingSourceConverter implements JsonCustomConvert<GeocodingSource> {
    serialize(value: GeocodingSource): any;
    deserialize(valueS: any): GeocodingSource;
}
export default GeocodingSource;
