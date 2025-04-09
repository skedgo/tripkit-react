import React, { useState } from 'react';
import TicketOption, { FareGroup, PurchasedTicket } from '../model/trip/TicketOption';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import genStyles from '../css/GenStyle.css';
import { ReactComponent as IconPassenger } from '../images/ic-booking-passenger.svg';
import { ReactComponent as IconAdd } from '../images/ic-add.svg';
import { ReactComponent as IconRemove } from '../images/ic-remove.svg';
import TKUIRow from '../options/TKUIRow';
import FormatUtil from '../util/FormatUtil';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKComponentDefaultConfig } from '../config/TKUIConfig';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import Util from '../util/Util';
import { black, TKUITheme } from '../jss/TKUITheme';
import TKUIHTMLTicketView from './TKUIHTMLTicketView';
import { tKUIBookingFormDefaultStyle } from '../booking/TKUIBookingForm.css';
import Tabs from '@mui/material/Tabs/Tabs';
import Tab from '@mui/material/Tab/Tab';

const ticketSelectJss = (theme: TKUITheme) => {
    const { form, group, icon } = tKUIBookingFormDefaultStyle(theme);
    return ({
        main: {
            ...genStyles.flex,
            ...genStyles.column
        },
        title: {
            ...theme.textColorGray,
            ...theme.textWeightSemibold,
            marginBottom: '16px'
        },
        form,
        option: group,
        icon,
        row: {
            padding: 0,
            ...genStyles.grow
        },
        formButton: {
            padding: '4px 16px',
            color: theme.colorPrimary
        },
        mainReadOnly: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow,
            '&>*:not(:first-child)': {
                marginTop: '10px'
            }
        },
        infoReadonly: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.grow
        },
        ticketsReadonly: {
            ...genStyles.grow,
            ...genStyles.flex,
            ...genStyles.column,
            '&>*:not(:first-child)': {
                marginTop: '5px'
            }
        },
        priceReadOnly: {
            whiteSpace: 'nowrap'
        },
        passengersStepper: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...theme.textSizeBody
        },
        stepperButtons: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '&>*:not(:last-child)': {
                marginRight: '10px'
            }
        },
        stepperBtn: {
            padding: '2px',
            height: '32px',
            width: '32px',
            '& svg': {
                width: '14px',
                height: '14px',
                '& path': {
                    fill: black(0, theme.isDark)
                }
            }
        },
        group: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            border: '1px solid lightgray',
            borderRadius: '8px',
            padding: '10px 4px 10px 36px',
            marginBottom: '34px'
        },
        tabs: {
            '& .MuiTabs-root': {
                borderBottom: '1px solid ' + black(4)
            },
            '& .MuiTabs-flexContainer': {

            },
            '& .MuiTab-root': {
                textTransform: 'initial'
            },
            '& .MuiTab-root.Mui-selected': {
                color: theme.colorPrimary
            },
            '& .MuiTabs-indicator': {
                backgroundColor: theme.colorPrimary + '!important'
            },
            marginBottom: '20px'
        },
    });
};

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    tickets: TicketOption[];
    groups?: FareGroup[];
    title?: string;
    onChange?: (update: TicketOption[]) => void;
    onSelectedGroup?(group: FareGroup): void;
    singleFareOnly?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof ticketSelectJss>

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITicketSelect {...props} />,
    styles: ticketSelectJss,
    classNamePrefix: "TKUITicketSelect"
};

const TKUITicketSelect: React.FunctionComponent<IProps> =
    ({ tickets, groups, title, onChange, onSelectedGroup, singleFareOnly, classes, injectedStyles, theme }) => {
        const readonly = !onChange;
        const singleTicketSelection = singleFareOnly && tickets.every(t => t.max === 1);
        const onTicketValueChange = (ticket: TicketOption, increase: boolean) => {
            const ticketIndex = tickets.indexOf(ticket);
            const update = tickets.slice();
            const newValue = ticket.value + (increase ? 1 : -1);
            update[ticketIndex] = Util.iAssign(ticket, { value: newValue });
            onChange!(update);
        }
        const [showTicket, setShowTicket] = useState<boolean>(false);
        const purchasedTickets = tickets?.reduce((ptickets, ticket) => ptickets.concat(ticket.purchasedTickets ?? []), [] as PurchasedTicket[]);
        // Select by default the first group with a selected ticket. For the single ticket selection case, this allows to preserve the group
        // selecation state along in the tickets array, so going forward and back to this view preserves the group selection.
        const selectedGroup = groups?.find(group => group.selected) ?? groups?.[0];
        const selectedGroupTickets = selectedGroup ? tickets!.filter(ticket => ticket.groupIDs?.some(tgid => tgid === selectedGroup.id)) : tickets;
        const groupTabs = groups && onSelectedGroup &&
            <div className={classes.tabs}>
                <Tabs
                    value={selectedGroup}
                    onChange={(_event, value) => onSelectedGroup(value)}
                >
                    {groups.map((group, i) =>
                        <Tab key={i} value={group} label={Util.toFirstUpperCase(group.name)} disableFocusRipple disableTouchRipple />)}
                </Tabs>
            </div>;
        return (
            readonly ?
                <div className={classes.mainReadOnly}>
                    <div className={classes.infoReadonly}>
                        <IconPassenger className={classes.icon} />
                        <div className={classes.ticketsReadonly}>
                            {tickets.map((ticket, i) =>
                                <div key={i}>
                                    {ticket.value + " x " + ticket.name}
                                </div>)}
                        </div>
                        <div className={classes.priceReadOnly}>
                            {FormatUtil.toMoney(tickets.reduce((totalPrice, ticket) => totalPrice + ticket.price * ticket.value, 0),
                                { currency: tickets[0].currency ? tickets[0].currency + " " : undefined, nInCents: true })}
                        </div>
                    </div>
                    {((purchasedTickets?.length ?? 0) > 0) &&
                        <TKUIButton
                            text={((purchasedTickets?.length ?? 0) > 1) ? "Tickets" : "Ticket"}
                            onClick={() => setShowTicket(true)}
                        />}
                    {showTicket &&
                        <TKUIHTMLTicketView purchasedTickets={purchasedTickets} onRequestClose={() => setShowTicket(false)} />}
                </div>
                :
                <div className={classes.main}>
                    {title &&
                        <div className={classes.title}>
                            {title}
                        </div>}
                    <div className={classes.form}>
                        {groupTabs}
                        {selectedGroupTickets.map((ticket, i) =>
                            <div className={classes.option} key={i}>
                                <IconPassenger className={classes.icon} />
                                <TKUIRow
                                    title={ticket.name}
                                    subtitle={FormatUtil.toMoney(ticket.price, { currency: ticket.currency + " ", nInCents: true, forceDecimals: true })}
                                    styles={{
                                        main: overrideClass(injectedStyles.row)
                                    }}
                                />
                                {(ticket.value === 0 || singleTicketSelection) ?
                                    <TKUIButton
                                        text={"Select"}
                                        onClick={() => {
                                            const update = tickets.slice();
                                            if (singleFareOnly) {   // Reset all other tickets to 0 if singleFareOnly is true
                                                update.forEach((t) => t.value = 0);
                                            }
                                            const ticketIndex = update.indexOf(ticket);
                                            update[ticketIndex] = Util.iAssign(update[ticketIndex], { value: 1 });
                                            onChange!(update);
                                        }}
                                        type={TKUIButtonType.SECONDARY}
                                        styles={{
                                            secondary: overrideClass(injectedStyles.formButton)
                                        }}
                                    /> :
                                    <div className={classes.passengersStepper}>
                                        <span style={{ marginRight: '14px' }}>{"x" + ticket.value}</span>
                                        <div className={classes.stepperButtons}>
                                            <TKUIButton
                                                type={TKUIButtonType.SECONDARY_VERTICAL}
                                                onClick={() => onTicketValueChange(ticket, false)}
                                                icon={<IconRemove />}
                                                styles={{ secondary: overrideClass(injectedStyles.stepperBtn) }}
                                            />
                                            <TKUIButton
                                                type={TKUIButtonType.SECONDARY_VERTICAL}
                                                onClick={() => onTicketValueChange(ticket, true)}
                                                icon={<IconAdd />}
                                                styles={{ secondary: overrideClass(injectedStyles.stepperBtn) }}
                                                disabled={ticket.max !== undefined && (ticket.value >= ticket.max)}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                </div>
        );
    };

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));