import { TKUITheme } from "../jss/TKUITheme";
import { tKUIBookingFormDefaultStyle } from "./TKUIBookingForm.css";

export const tKUIBookingDetailsDefaultStyle = (theme: TKUITheme) => ({
    ...tKUIBookingFormDefaultStyle(theme)
});
