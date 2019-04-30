import {JsonObject, JsonProperty} from "json2typescript";
import Segment from "../../model/trip/Segment";

@JsonObject
class ChoiceSegment {

    @JsonProperty('mode', String)
    private _mode: string = "";
    @JsonProperty('duration', Number)
    private _duration: number = 0; /* In secs. */

    public static create(segment: Segment): ChoiceSegment {
        const instance = new ChoiceSegment();
        const modeInfo = segment.modeInfo;
        instance._mode = modeInfo ?
            (modeInfo.identifier ? modeInfo.identifier : modeInfo.alt.toLowerCase()) : "";
        instance._duration = segment.endTime - segment.startTime;
        return instance;
    }


    get mode(): string {
        return this._mode;
    }

    get duration(): number {
        return this._duration;
    }
}

export default ChoiceSegment;