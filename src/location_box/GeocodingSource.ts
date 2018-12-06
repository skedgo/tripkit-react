import {JsonConverter, JsonCustomConvert} from "json2typescript";

enum GeocodingSource {
    PELIAS =  "PELIAS",
    SKEDGO = "SKEDGO",
    ACT_SCHOOLS = "ACT_SCHOOLS",
    OTHER = "OTHER"
}

@JsonConverter
export class GeocodingSourceConverter implements JsonCustomConvert<GeocodingSource> {
    public serialize(value: GeocodingSource): any {
        return value;
    }
    public deserialize(valueS: any): GeocodingSource {
        return valueS;
    }
}

export default GeocodingSource;