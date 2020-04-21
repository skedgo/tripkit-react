import Segment from "../../model/trip/Segment";
declare class ChoiceSegment {
    private _mode;
    private _duration;
    static create(segment: Segment): ChoiceSegment;
    get mode(): string;
    get duration(): number;
}
export default ChoiceSegment;
