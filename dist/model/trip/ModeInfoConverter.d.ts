import { JsonCustomConvert } from "json2typescript";
import ModeInfo from "./ModeInfo";
export declare class ModeInfoConverter implements JsonCustomConvert<ModeInfo> {
    serialize(modeInfo: ModeInfo): any;
    deserialize(modeInfo: any): ModeInfo;
}
export default ModeInfoConverter;
