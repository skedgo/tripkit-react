import TripGoApi from "../api/TripGoApi";
import StopLocation from "../model/StopLocation";
import LocationsData from "./LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import {TKError} from "../error/TKError";

class StopsData {

    // private stops: Map<string, StopLocation> = new Map<string, StopLocation>();

    private static _instance: StopsData;

    public static get instance(): StopsData {
        if (!this._instance) {
            this._instance = new StopsData();
        }
        return this._instance;
    }


    public getStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation> {
        // const regionStopCode = regionCode + "-" + stopCode;
        // const cachedStop = this.stops.get(regionStopCode);
        // if (cachedStop) {
        //     return Promise.resolve(cachedStop);
        // }
        const id = "pt_pub|" + regionCode + "|" + stopCode;
        return LocationsData.instance.getLocationInfo(id)
            .then((locInfo: TKLocationInfo) => {
                if (locInfo.stop) {
                    return locInfo.stop;
                }
                throw new TKError("Stop couldn't be found for id: " + id, "STOP_NOT_FOUND");
            });
    }
}

export default StopsData;