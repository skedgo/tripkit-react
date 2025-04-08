// import { TranslationFunction } from "./TKI18nProvider";

// To facilitate access from static methods (helpers / utils).
export const i18n: { t: any, locale: string, distanceUnit: () => "metric" | "imperial" } = {
    t: (key: string, params?: any) => "",
    locale: "en",
    distanceUnit: () => {
        switch (i18n.locale) {
            case "en-US":
            case "en-GB":
                return "imperial";
            default:
                return "metric";
        }
    }
}