import Location from "../Location";
import { JsonObject, JsonProperty } from "json2typescript/src/json2typescript/json-convert-decorators";

@JsonObject
class SchoolLocation extends Location {
    @JsonProperty('modeIdentifiers', [String], true)
    public modeIdentifiers: string[] = [];
}

export default SchoolLocation