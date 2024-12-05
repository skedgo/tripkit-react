import React from "react";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIBookingProviderOptionsDefaultStyle } from "./TKUIBookingProviderOptions.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIConfig } from "../config/TKUIConfig";
import { TKUICardClientProps } from "../card/TKUICard";
import { ProviderOptionsForm } from "../model/trip/BookingInfo";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<TKUICardClientProps, "onRequestClose"> {
    form: ProviderOptionsForm;
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
    const { classes } = props;
    return (
        <div className={classes.main}>

        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIBookingProviderOptions, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));