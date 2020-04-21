import Trip from "../model/trip/Trip";
export declare enum Badges {
    CHEAPEST = "Cheapest",
    EASIEST = "Easiest",
    FASTEST = "Fastest",
    GREENEST = "Greenest",
    HEALTHIEST = "Healthiest",
    RECOMMENDED = "Recommended"
}
declare class TKMetricClassifier {
    static getTripClassifications(trips: Trip[]): Map<Trip, Badges>;
    private static classification;
    private static matches;
}
export default TKMetricClassifier;
