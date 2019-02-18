import Segment from "../../model/trip/Segment";
declare class ChoiceSegment {
    private _mode;
    private _duration;
    static create(segment: Segment): ChoiceSegment;
    readonly mode: string;
    readonly duration: number;
}
export default ChoiceSegment;
