import Util from "../../util/Util";
import {JsonConverter, JsonCustomConvert, JsonConvert} from "json2typescript";
import ModeInfo from "./ModeInfo";

@JsonConverter
export class ModeInfoConverter implements JsonCustomConvert<ModeInfo> {
    public serialize(modeInfo: ModeInfo): any {
        const jsonConvert = new JsonConvert();
        return jsonConvert.serialize(modeInfo);
    }
    public deserialize(modeInfo: any): ModeInfo {
        if (Util.isEmpty(modeInfo)) {
            return new ModeInfo();
        }
        const jsonConvert = new JsonConvert();
        return jsonConvert.deserialize(modeInfo, ModeInfo);
    }
}

export default ModeInfoConverter;