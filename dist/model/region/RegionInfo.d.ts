import ModeInfo from "../trip/ModeInfo";
declare class RegionInfo {
    code: string;
    streetBicyclePaths: boolean;
    streetWheelchairAccessibility: boolean;
    transitBicycleAccessibility: boolean;
    transitConcessionPricing: boolean;
    transitWheelchairAccessibility: boolean;
    transitModes: ModeInfo[];
}
export default RegionInfo;
