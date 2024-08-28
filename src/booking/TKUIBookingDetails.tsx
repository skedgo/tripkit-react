import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingDetailsDefaultStyle } from "./TKUIBookingDetails.css";
import DateTimeUtil from '../util/DateTimeUtil';
import TKUIFromTo from './TKUIFromTo';
import Segment from '../model/trip/Segment';
import Trip from '../model/trip/Trip';
import classNames from 'classnames';
import TKUITicketSelect from '../stripekit/TKUITicketSelect';
import { BookingInputForm } from './TKUIBookingForm';
import FormatUtil from '../util/FormatUtil';
import TKUIBookingActions from './TKUIBookingActions';
import { ReactComponent as IconNote } from '../images/ic-note.svg';
import { ReactComponent as IconPerson } from '../images/ic-person-circle.svg';
import { ReactComponent as IconShuttle } from '../images/ic-shuttle-circle.svg';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingDetailsDefaultStyle>

export type TKUIBookingDetailsProps = IProps;
export type TKUIBookingDetailsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingDetails {...props} />,
    styles: tKUIBookingDetailsDefaultStyle,
    classNamePrefix: "TKUIBookingDetails"
};

const TKUIBookingDetails: React.FunctionComponent<IProps> = (props: IProps) => {
    const { segment, trip, classes, injectedStyles } = props;
    const booking = segment.booking!;
    const confirmation = booking.confirmation!;
    const status = confirmation.status!;
    return (
        <div>
            <div className={classes.status}>
                <div className={classes.statusInfo}>
                    <div className={classes.statusTitle}>
                        {status.title}
                    </div>
                    {status.subtitle}
                </div>
                <img src={status.imageURL} className={classes.statusImg} />
            </div>
            <div className={classes.fromToDetails}>
                <TKUIFromTo
                    from={segment.from}
                    to={segment.to}
                    startTime={segment.startTime}
                    endTime={segment.endTime}
                    queryIsLeaveAfter={trip?.queryIsLeaveAfter ?? undefined}
                    timezone={segment.from.timezone}
                    status={confirmation.status?.value}
                />
            </div>
            <div className={classes.service}>
                <div className={classes.serviceImages}>
                    <IconPerson className={classes.iconPerson} />
                    <IconShuttle className={classes.iconShuttle} />
                </div>
                {confirmation.vehicle &&
                    <div className={classes.vehicle}>
                        <div className={classes.title}>{confirmation.vehicle.title}</div>
                        <div className={classes.subtitle}>{confirmation.vehicle.subtitle}</div>
                    </div>}
                {confirmation.provider &&
                    <div className={classes.provider}>
                        <div className={classes.title}>{confirmation.provider.title}</div>
                        <a href={"tel:" + confirmation.provider.subtitle} className={classes.subtitle}>
                            {confirmation.provider.subtitle}
                        </a>
                    </div>}
                {confirmation.purchase &&
                    <div className={classes.price}>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency ? confirmation.purchase.currency + " " : undefined, forceDecimals: true })}</div>}
            </div>
            <div className={classes.main}>
                {confirmation.tickets && confirmation.tickets?.length > 0 &&
                    <div className={classNames(classes.group, classes.divider)}>
                        <TKUITicketSelect
                            tickets={confirmation.tickets}
                        />
                    </div>}
                <BookingInputForm
                    inputFields={confirmation.input}
                    classes={classes}
                    injectedStyles={injectedStyles as any}
                    segment={segment}
                />
                {confirmation.notes &&
                    <div className={classes.group}>
                        <div className={classes.icon}>
                            <IconNote />
                        </div>
                        <div className={classes.groupRight} style={{ minWidth: 0 }}>
                            <div className={classes.label}>
                                Notes from operator
                            </div>
                            <div className={classes.value}>
                                {confirmation.notes.map((note, i) => (
                                    <div className={classes.note} key={i}>
                                        <div className={classes.noteText}>
                                            {note.text}
                                        </div>
                                        <div className={classes.noteFooter}>
                                            <div className={classes.noteProvider}>{note.provider}</div>
                                            <div className={classes.noteTime}>{DateTimeUtil.formatRelativeDay(DateTimeUtil.moment(note.timestamp),
                                                DateTimeUtil.dayMonthFormat() + ", YYYY") +
                                                " at " + DateTimeUtil.moment(note.timestamp).format(DateTimeUtil.timeFormat())}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>}
            </div>
            {confirmation.actions.length > 0 &&
                <TKUIBookingActions
                    actions={confirmation.actions}
                />}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingDetails, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));