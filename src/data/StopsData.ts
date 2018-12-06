import TripGoApi from "../api/TripGoApi";
import StopLocation from "../model/StopLocation";

class StopsData {

    private stops: Map<string, StopLocation> = new Map<string, StopLocation>();

    private static _instance: StopsData;

    public static get instance(): StopsData {
        if (!this._instance) {
            this._instance = new StopsData();
        }
        return this._instance;
    }


    public getStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation> {
        const regionStopCode = regionCode + "-" + stopCode;
        const cachedStop = this.stops.get(regionStopCode);
        if (cachedStop) {
            return Promise.resolve(cachedStop);
        }
        return TripGoApi.findStopFromCode(regionCode, stopCode)
            .then((stopLocation: StopLocation) => {
                this.stops.set(regionStopCode, stopLocation);
                return stopLocation;
            });
    }
}

export default StopsData;