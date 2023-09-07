import { JsonObject, JsonProperty } from "json2typescript";
import { Bundle } from "./CurrentBundle";

@JsonObject
class FutureBillingCycle {
    @JsonProperty("toBeAppliedTimestamp", String, true)
    public readonly toBeAppliedTimestamp: string = "";
    @JsonProperty("paymentTimestamp", String, true)
    public readonly paymentTimestamp: string = "";
    @JsonProperty("externalPaymentID", String, true)
    public readonly externalPaymentID: string = "";
    @JsonProperty("paymentStatus", String, true)
    public readonly paymentStatus: string = "";
}

@JsonObject
class FutureBundle extends Bundle {
    @JsonProperty("futureBillingCycle", FutureBillingCycle, true)
    public readonly futureBillingCycle: FutureBillingCycle = new FutureBillingCycle();
}

export default FutureBundle;