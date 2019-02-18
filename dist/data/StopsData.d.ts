import StopLocation from "../model/StopLocation";
declare class StopsData {
    private stops;
    private static _instance;
    static readonly instance: StopsData;
    getStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation>;
}
export default StopsData;
