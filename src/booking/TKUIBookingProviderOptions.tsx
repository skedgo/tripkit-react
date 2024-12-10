import React from "react";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIBookingProviderOptionsDefaultStyle } from "./TKUIBookingProviderOptions.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIConfig } from "../config/TKUIConfig";
import { TKUICardClientProps } from "../card/TKUICard";
import { AvailableProviderOption, ProviderOptionsForm } from "../model/trip/BookingInfo";
import FormatUtil from "../util/FormatUtil";
import { ReactComponent as AlertIcon } from "../images/ic-alert.svg";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<TKUICardClientProps, "onRequestClose"> {
    form: ProviderOptionsForm;
    onProviderSelected: (provider: AvailableProviderOption) => void;
}

export type TKUIBookingProviderOptionsClientProps = IClientProps;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingProviderOptionsDefaultStyle>

export type TKUIBookingProviderOptionsProps = IProps;
export type TKUIBookingProviderOptionsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingProviderOptions {...props} />,
    styles: tKUIBookingProviderOptionsDefaultStyle,
    classNamePrefix: "TKUIBookingProviderOptions"
};

const TKUIBookingProviderOptions: React.FunctionComponent<IProps> = (props: IProps) => {
    const { form, onProviderSelected, classes } = props;
    return (
        <div className={classes.main}>
            <div className={classes.title}>
                Available
            </div>
            <div className={classes.available}>
                {form.availableList.map((option, i) => {
                    const price = FormatUtil.toMoney(option.minPrice, { currency: option.fares?.[0]?.currency, nInCents: true, forceDecimals: true })
                        + (option.minPrice !== option.maxPrice ?
                            " - " + FormatUtil.toMoney(option.maxPrice, { currency: option.fares?.[0]?.currency, nInCents: true, forceDecimals: true }) : "");
                    return (
                        <div className={classes.option} key={i} onClick={() => { onProviderSelected(option); }}>
                            <div className={classes.optionTitle}>
                                {option.title}
                            </div>
                            <div className={classes.priceRange}>
                                {price}
                            </div>
                        </div>
                    );
                })}
            </div>
            {form.unavailableList.length > 0 &&
                <>
                    <div className={classes.separator} />
                    <div className={classes.title}>
                        Not Available
                    </div>
                    <div className={classes.unavailable}>
                        {form.unavailableList.map((option, i) => (
                            <div className={classes.unavailableOption} key={i}>
                                <div className={classes.uOptionTitle}>
                                    {option.title}
                                </div>
                                {option.warningMessage &&
                                    <div className={classes.warningMessage}>
                                        <AlertIcon />
                                        {option.warningMessage}
                                    </div>}
                            </div>
                        ))}
                    </div>
                </>}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIBookingProviderOptions, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));