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
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import FormatUtil from "../util/FormatUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<TKUICardClientProps, "onRequestClose"> {
    provider: AvailableProviderOption;
    onChange: (update: TicketOption[]) => void;
    onSubmit: () => void;
    onClose?: () => void;
    cancelText?: string;
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
    const { provider, onChange, onSubmit, onClose, cancelText, classes, t } = props;
    const fares = provider.fares!;
    const numOfTickets = fares.reduce((acc, ticket) => acc + ticket.value, 0);
    const totalPrice = fares.reduce((acc, ticket) => acc + ticket.price * ticket.value, 0);
    const singleTicketSelection = provider.singleFareOnly && fares.every(t => t.max === 1);
    return (
        <div className={classes.main}>
            <TKUITicketSelect
                title={provider.bookingTitle}
                tickets={fares}
                singleFareOnly={provider.singleFareOnly}
                onChange={(tickets) => {
                    onChange(tickets);
                    if (singleTicketSelection) {
                        onSubmit();
                    }
                }}
                groups={provider.fareGroups}
            />
            <div className={classes.divider} />
            <div className={classes.footer}>
                {!singleTicketSelection &&
                    <div className={classes.fareSummary}>
                        <div>
                            {numOfTickets + " " + (numOfTickets === 1 ? "ticket" : "tickets")}
                        </div>
                        <div>⋅</div>
                        <div>
                            {FormatUtil.toMoney(totalPrice, { nInCents: true, forceDecimals: true, zeroAsFree: false })}
                        </div>
                    </div>}
                <div className={classes.buttons}>
                    {onClose &&
                        <TKUIButton
                            text={cancelText ?? t("Cancel")}
                            type={TKUIButtonType.SECONDARY}
                            onClick={() => onClose()}
                        />}
                    {!singleTicketSelection &&
                        <TKUIButton
                            text={t("Continue")}
                            onClick={onSubmit}
                            disabled={!fares.some(ticket => ticket.value > 0)}
                            name="continue-tickets-btn"
                        />}
                </div>
            </div>
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIProviderTicketsForm, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));