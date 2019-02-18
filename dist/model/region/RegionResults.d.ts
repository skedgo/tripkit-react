import { Any } from "json2typescript";
import Region from "./Region";
declare class RegionResults {
    private _hashCode;
    private _modes;
    private _regions;
    readonly hashCode: number;
    readonly modes: Any;
    readonly regions: Region[];
}
export default RegionResults;
