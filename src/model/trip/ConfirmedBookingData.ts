import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any } from "json2typescript";
import { BookingConfirmation } from "./BookingInfo";
import Location from "../Location";
import Util from "../../util/Util";
import ModeInfo from "./ModeInfo";


@JsonObject
class TripLeg {
    @JsonProperty("modeInfo", ModeInfo, true)
    modeInfo?: ModeInfo
    @JsonProperty("metric", Any, true)
    metric?: any
}

@JsonObject
class TripInfo {
    @JsonProperty("origin", Location, true)
    public origin?: Location = undefined;
    @JsonProperty("destination", Location, true)
    public destination?: Location = undefined;
    @JsonProperty("legs", [TripLeg], true)
    public legs?: TripLeg[] = undefined;
    @JsonProperty("depart", String, true)
    public depart: string = "";
    @JsonProperty("arrive", String, true)
    public arrive: string = "";
    @JsonProperty("queryIsLeaveAfter", Boolean, true)
    public queryIsLeaveAfter: boolean = true;
}

@JsonConverter
class ConfirmedBookingDataConverter implements JsonCustomConvert<ConfirmedBookingData> {
    public serialize(carPodInfo: ConfirmedBookingData): any {
        return Util.serialize(carPodInfo);
    }
    public deserialize(carPodInfoJson: any): ConfirmedBookingData {
        return Util.deserialize(carPodInfoJson, ConfirmedBookingData);
    }
}

@JsonObject
class RelatedBooking {
    @JsonProperty("bookingId", String, true)
    public bookingId: string = "";
    @JsonProperty("type", String, true)
    public type: string = "";
    @JsonProperty("confirmedBookingData", ConfirmedBookingDataConverter, true)
    public confirmedBookingData?: ConfirmedBookingData = undefined;
}

@JsonObject
class ConfirmedBookingData {
    @JsonProperty("confirmation", BookingConfirmation, true)
    public confirmation?: BookingConfirmation = undefined;
    /**
     * @deprecated
     */
    @JsonProperty("trips", [String], true)
    public trips?: string[] = undefined;
    /**
     * @deprecated
     */
    @JsonProperty("tripsInfo", [TripInfo], true)
    public tripsInfo?: TripInfo[] = undefined;
    @JsonProperty("trip", String, true)
    public trip?: string = undefined;
    @JsonProperty("tripInfo", TripInfo, true)
    public tripInfo?: TripInfo = undefined;
    @JsonProperty("mode", String, true)
    public mode?: string = undefined;
    /**
     * In ISO format (includes timezone).
     */
    @JsonProperty("datetime", String, true)
    public datetime: string = "";
    @JsonProperty("time", Number, true)
    public time?: number = undefined;
    @JsonProperty("timeZone", String, true)
    public timeZone?: string = undefined;
    @JsonProperty("index", Number, true)
    public index?: number = undefined;
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("relatedBookings", [RelatedBooking], true)
    public relatedBookings?: RelatedBooking[] = undefined;

    public get modeInfo(): ModeInfo | undefined {
        return this.tripsInfo?.[0]?.legs?.find(leg => leg.modeInfo?.identifier === this.mode)?.modeInfo;
    }
}

@JsonObject
class ConfirmedBookingsResult {
    @JsonProperty("bookings", [ConfirmedBookingData], true)
    public bookings?: ConfirmedBookingData[] = undefined;
    @JsonProperty("count", Number, true)
    public count?: number = undefined;
}

export default ConfirmedBookingData;
export { ConfirmedBookingsResult };