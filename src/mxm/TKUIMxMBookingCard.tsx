import React, {useState, useEffect, Fragment} from 'react';
import {overrideClass, TKUIWithClasses, withStyles} from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import {tKUIMxMBookingCardDefaultStyle} from "./TKUIMxMBookingCard.css";
import DateTimeUtil from "../util/DateTimeUtil";
import Util from "../util/Util";
import BookingInfo, {BookingField, BookingFieldOption} from "../model/trip/BookingInfo";
import TKUISelect, {SelectOption} from "../buttons/TKUISelect";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';

type IStyle = ReturnType<typeof tKUIMxMBookingCardDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    segment: Segment;
    onRequestClose: () => void;
    refreshSelectedTrip: () => Promise<boolean>;
}

const onChangeFc = (id: string, value: string | string[], bookingInfo: BookingInfo, setBookingInfo: (bookingInfo: BookingInfo) => void) => {
    const update = Util.clone(bookingInfo);
    const bookingField = update.input.find((field: BookingField) => field.id === id)!;
    if (Array.isArray(value)) {
        bookingField.values = value;
    } else {
        bookingField.value = value;
    }
    setBookingInfo(update);
    console.log(update);
};

const canBook = (bookingInfo: BookingInfo) =>
    bookingInfo.input.every((field: BookingField) => !field.required || field.value || (field.values && field.values.length > 0));

const TKUIMxMBookingCard: React.SFC<IProps> = ({segment, onRequestClose, refreshSelectedTrip, classes, injectedStyles}) => {
    const booking = segment.booking!;
    const confirmation = booking.confirmation;
    const [bookingInfo, setBookingInfo] = useState<BookingInfo | undefined>(undefined);
    const [waiting, setWaiting] = useState<boolean>(!confirmation);
    useEffect(() => {
        if (!confirmation) {
            const bookingInfosUrl = booking.quickBookingsUrl!;
            TripGoApi.apiCallUrl(bookingInfosUrl, "GET")
                .then((bookingsInfoJsonArray) => {
                    const bookingsInfo = bookingsInfoJsonArray.map(infoJson => Util.deserialize(infoJson, BookingInfo));
                    console.log(bookingsInfo);
                    setBookingInfo(bookingsInfo[0]);
                    setWaiting(false);
                });
        }
    }, []);
    let content;
    if (confirmation) {
        const status = confirmation.status;
        content = (
            <Fragment>
                <div className={classes.status}>
                    <div className={classes.statusInfo}>
                        <div className={classes.statusTitle}>
                            {status.title}
                        </div>
                        {status.subtitle}
                    </div>
                    <img src={status.imageURL} className={classes.statusImg}/>
                </div>
                <div className={classes.actions}>
                    <TKUIButton text={"Cancel Ride"} type={TKUIButtonType.PRIMARY_LINK}/>
                    <TKUIButton text={"Call Driver"} type={TKUIButtonType.PRIMARY_LINK}/>
                </div>
            </Fragment>
        )
    } else if (bookingInfo) {
        content = (
            <div className={classes.bookingFormMain}>
                <div className={classes.startTime}>
                    {DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone)
                        .format(DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat())}
                </div>
                <div className={classes.form}>
                    <div className={classes.group}>
                        <div className={classes.fromToTrack}>
                            <div className={classes.circle}/>
                            <div className={classes.line}/>
                            <div className={classes.circle}/>
                        </div>
                        <div className={classes.groupRight}>
                            <div className={classes.label}>
                                Pickup
                            </div>
                            <div className={classes.input}>
                                {segment.from.getDisplayString()}
                            </div>
                            <div className={classes.label}>
                                Drop off
                            </div>
                            <div className={classes.input}>
                                {segment.to.getDisplayString()}
                            </div>
                        </div>
                    </div>
                    {bookingInfo.input.map((input, i) => {
                        let value: JSX.Element | undefined = undefined;
                        const onChange = valueUpdate =>
                            onChangeFc(input.id, valueUpdate, bookingInfo, setBookingInfo);
                        if (input.type === "SINGLE_CHOICE") {
                            value = (
                                <TKUISelect
                                    options={input.options.map((option: BookingFieldOption) => ({
                                        value: option.id,
                                        label: option.title
                                    }))}
                                    styles={() => ({
                                        main: overrideClass(injectedStyles.optionSelect),
                                        menu: overrideClass({marginTop: '2px'})
                                    })}
                                    onChange={update => onChange(update.value)}
                                />
                            );
                        } else if (input.type === "MULTIPLE_CHOICE") {
                            value = (
                                <TKUISelect
                                    options={input.options.map((option: BookingFieldOption) => ({
                                        value: option.id,
                                        label: option.title
                                    }))}
                                    isMulti
                                    styles={() => ({
                                        main: overrideClass(injectedStyles.optionSelect),
                                        menu: overrideClass({marginTop: '2px'})
                                    })}
                                    onChange={(update: SelectOption[]) => // update is null if no option is selected.
                                        onChange((update || []).map(option => option.value))}
                                />
                            );
                        } else if (input.type === "LONG_TEXT") {
                            value = (
                                <textarea
                                    // placeholder={msgPlaceholder}
                                    // value={this.state.msg}
                                    // onChange={(e: any) => this.setState({msg: e.target.value})}
                                    onChange={e => onChange(e.target.value)}
                                >
                                </textarea>
                            )
                        }
                        return (
                            <div className={classes.group} key={i}>
                                <div className={classes.icon}>
                                </div>
                                <div className={classes.groupRight}>
                                    <div className={classes.label}>
                                        {input.title}
                                        {input.required &&
                                        <div className={classes.required}>required</div>}
                                    </div>
                                    <div className={classes.input}>
                                        {value}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <TKUIButton
                        text={"Book"}
                        onClick={() => {
                            setWaiting(true);
                            TripGoApi.apiCallUrl(bookingInfo.bookingURL, NetworkUtil.MethodType.POST, Util.serialize(bookingInfo))
                                .then(refreshSelectedTrip)
                                .finally(() => setWaiting(false))
                        }}
                        disabled={!canBook(bookingInfo)}
                    />
                </div>
            </div>
        );
    }
    return (
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            onRequestClose={onRequestClose}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative'})
            }}
            key={segment.id}
        >
            {content}
            {waiting &&
            <div className={classes.loadingPanel}>
                <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results"/>
            </div>}
        </TKUICard>
    );
};

export default withStyles(TKUIMxMBookingCard, tKUIMxMBookingCardDefaultStyle);