import StopLocation from "../StopLocation";
declare class StopLocationParent extends StopLocation {
    children: StopLocation[];
    getStopFromCode(code: string): StopLocation | undefined;
}
export default StopLocationParent;
