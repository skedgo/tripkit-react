import { JsonObject, JsonProperty } from "json2typescript";
import ModeInfo from "../trip/ModeInfo";

@JsonObject
class Balance {
    @JsonProperty("id", String, true)
    public readonly id: string = "";
    @JsonProperty("timestamp", String, true)
    public readonly timestamp: string = "";
    @JsonProperty("rawBalance", Number, true)
    public readonly rawBalance: number = 0;
    @JsonProperty("userBalance", Number, true)
    public readonly userBalance: number = 0;
    @JsonProperty("rewardsBalance", Number, true)
    public readonly rewardsBalance: number = 0;
    @JsonProperty("availableRewardsBalance", Number, true)
    public readonly availableRewardsBalance: number = 0;
    @JsonProperty("lifetimeRewardsBalance", Number, true)
    public readonly lifetimeRewardsBalance: number = 0;
    @JsonProperty("currency", String, true)
    public readonly currency: string = "";
    @JsonProperty("bundleID", String, true)
    public readonly bundleID: string = "";
    @JsonProperty("type", String, true)
    public readonly type: string = "";
}

@JsonObject
class CurrentBillingCycle {
    @JsonProperty("appliedTimestamp", String, true)
    public readonly appliedTimestamp: string = "";
    @JsonProperty("expirationTimestamp", String, true)
    public readonly expirationTimestamp: string = "";
    @JsonProperty("paymentTimestamp", String, true)
    public readonly paymentTimestamp: string = "";
    @JsonProperty("externalPaymentID", String, true)
    public readonly externalPaymentID: string = "";
    @JsonProperty("paymentStatus", String, true)
    public readonly paymentStatus: string = "";
}

@JsonObject
class BundleMode {
    @JsonProperty("mode", String, true)
    public readonly mode: string = "";
    @JsonProperty("hideCost", Boolean, true)
    public readonly hideCost: boolean = false;
    @JsonProperty("pointsPerCost", Number, true)
    public readonly pointsPerCost: number = 0;
    @JsonProperty("rewardPerCost", Number, true)
    public readonly rewardPerCost: number = 0;
    @JsonProperty("symbolicRewardPerCost", Boolean, true)
    public readonly symbolicRewardPerCost: boolean = false;
    @JsonProperty("modeInfo", ModeInfo, true)
    public readonly modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("offerDescription", String, true)
    public readonly offerDescription?: string = undefined;
}

@JsonObject
class Bundle {
    @JsonProperty("id", String, true)
    public readonly id: string = "";
    @JsonProperty("name", String, true)
    public readonly name: string = "";
    @JsonProperty("description", String, true)
    public readonly description: string = "";
    @JsonProperty("currency", String, true)
    public readonly currency: string = "";
    @JsonProperty("status", String, true)
    public readonly status: string = "";
    @JsonProperty("subscriptionDurationInDays", Number, true)
    public readonly subscriptionDurationInDays: number = 0;
    @JsonProperty("subscriptionFee", Number, true)
    public readonly subscriptionFee: number = 0;
    @JsonProperty("purchaseDenialReason", String, true)
    public readonly purchaseDenialReason: string = "";
    @JsonProperty("mayPurchase", Boolean, true)
    public readonly mayPurchase: boolean = false;
    @JsonProperty("transportModes", [BundleMode], true)
    public readonly transportModes: BundleMode[] = [];
}

@JsonObject
class CurrentBundle extends Bundle {
    @JsonProperty("balance", Balance, true)
    public readonly balance: Balance = new Balance();
    @JsonProperty("currentBillingCycle", CurrentBillingCycle, true)
    public readonly currentBillingCycle: CurrentBillingCycle = new CurrentBillingCycle();
}

export default CurrentBundle;

export { Balance, Bundle }