import React from "react";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIProviderTicketsFormDefaultStyle } from "./TKUIProviderTicketsForm.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIConfig } from "../config/TKUIConfig";
import { TKUICardClientProps } from "../card/TKUICard";
import { AvailableProviderOption } from "../model/trip/BookingInfo";
import TicketOption from "../model/trip/TicketOption";
import TKUITicketSelect from "./TKUITicketSelect";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<TKUICardClientProps, "onRequestClose"> {
    provider: AvailableProviderOption;
    onTicketSelected: (ticket: TicketOption) => void;
}

export type TKUIProviderTicketsFormClientProps = IClientProps;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIProviderTicketsFormDefaultStyle>

export type TKUIProviderTicketsFormProps = IProps;
export type TKUIProviderTicketsFormStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIProviderTicketsForm {...props} />,
    styles: tKUIProviderTicketsFormDefaultStyle,
    classNamePrefix: "TKUIProviderTicketsForm"
};

const TKUIProviderTicketsForm: React.FunctionComponent<IProps> = (props: IProps) => {
    const { provider, onTicketSelected, classes } = props;
    return (
        <div className={classes.main}>
            <TKUITicketSelect
                tickets={provider.fares!}
                onChange={(tickets) => onTicketSelected(tickets[0])}
            />
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIProviderTicketsForm, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));