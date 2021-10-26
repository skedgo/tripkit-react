import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import TripRowTrack from "./TripRowTrack";
import TKUITripTime from "./TKUITripTime";
import Trip from "../model/trip/Trip";
import {EventEmitter} from "fbemitter";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUITripRowDefaultStyle} from "./TKUITripRow.css";
import {ReactComponent as IconBadgeCheapest} from '../images/badges/ic-badge-money.svg';
import {ReactComponent as IconBadgeEasiest} from '../images/badges/ic-badge-like.svg';
import {ReactComponent as IconBadgeFastest} from '../images/badges/ic-badge-lightning.svg';
import {ReactComponent as IconBadgeGreenest} from '../images/badges/ic-badge-leaf.svg';
import {ReactComponent as IconBadgeHealthiest} from '../images/badges/ic-badge-like.svg';
import {ReactComponent as IconBadgeRecommended} from '../images/badges/ic-badge-check.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {Badges} from "./TKMetricClassifier";
import classNames from "classnames";
import {TKUIConfig, TKComponentDefaultConfig} from "../config/TKUIConfig";
import {Subtract} from "utility-types";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TranslationFunction} from "../i18n/TKI18nProvider";
import WaiAriaUtil from "../util/WaiAriaUtil";
import DeviceUtil from "../util/DeviceUtil";
import Segment from "../model/trip/Segment";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ctype
     */
    value: Trip;

    /**
     * States if the trip is selected.
     * @ctype
     */
    selected?: boolean;

    /**
     * Function that will be called on main element click.
     * @ctype
     */
    onClick?: () => void;

    /**
     * @ignore
     */
    brief?: boolean;

    /**
     * Function that will be called when main element gets focus.
     * @ctype
     */
    onFocus?: () => void;

    /**
     * Function that will be called on trip alternative click.
     * @ctype
     */
    onAlternativeClick?: (group: TripGroup, alt: Trip) => void;

    /**
     * Function that will be called on detail button click.
     * @ctype
     */
    onDetailClick?: () => void;

    /**
     * Function that will be forwarded to the main element. It can be useful to implement support for keyboard navigation.
     * @ctype
     */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLDivElement>) => void;

    /**
     * Callback reference to be passed to main element.
     * @ctype
     */
    reference?: (ref: any) => void;

    /**
     * Badge assigned to this trip. <br>
     * Values: Badges.CHEAPEST, Badges.EASIEST, Badges.FASTEST, Badges.GREENEST, Badges.HEALTHIEST, Badges.RECOMMENDED
     * @ctype
     */
    badge?: Badges;

    /**
     * Number of trip alternatives that should be displayed when not expanded.
     * @default 2
     */
    visibleAlternatives?: number;

    /**
     * States if trip alternatives list should be displayed expanded or not.
     * Together with [```onExpand```]{@link TKUITripRow#onExpand} allows a controlled handling of alternatives expansion,
     * for instance, to force that just the selected trip is expanded.
     *
     * @default false
     */
    expanded?: boolean; // TODO: An alternative is to define it in the state, and onComponentDidUpdate detect unselection
                        // (!this.props.selected && prevProps.selected) and update expanded in state to false.
                        // Advantage: get rid of expanded / onExpand properties, that don't make much sense, and give an
                        // additional purpose to selected property.

    /**
     * Function that will be run when 'More' / 'Less' button is clicked.
     * @ctype
     */
    onExpand?: (expand: boolean) => void;

    onSegmentSelected?: (segment: Segment) => void;
}

interface IStyle {
    main: CSSProps<IProps>;
    badge: CSSProps<IProps>;
    info: CSSProps<IProps>;
    trackAndAction: CSSProps<IProps>;
    track: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    alternative: CSSProps<IProps>;
    pastAlternative: CSSProps<IProps>;
    selectedAlternative: CSSProps<IProps>;
    crossOut: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITripRowProps = IProps;
export type TKUITripRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripRow {...props}/>,
    styles: tKUITripRowDefaultStyle,
    classNamePrefix: "TKUITripRow",
    randomizeClassNames: true // This needs to be true since multiple instances are rendered,
                              // each with a different badge color.
};

function badgeIcon(badge: Badges): JSX.Element {
    switch (badge) {
        case Badges.CHEAPEST: return <IconBadgeCheapest aria-hidden="true"/>;
        case Badges.EASIEST: return <IconBadgeEasiest aria-hidden="true"/>;
        case Badges.FASTEST: return <IconBadgeFastest aria-hidden="true"/>;
        case Badges.GREENEST: return <IconBadgeGreenest aria-hidden="true"/>;
        case Badges.HEALTHIEST: return <IconBadgeHealthiest aria-hidden="true"/>;
        default: return <IconBadgeRecommended aria-hidden="true"/>;
    }
}

function badgeColor(badge: Badges): string {
    switch (badge) {
        case Badges.CHEAPEST: return "#d14600";
        case Badges.EASIEST: return "#1a8446";
        case Badges.FASTEST: return "#94710a";
        case Badges.GREENEST: return "#008571";
        case Badges.HEALTHIEST: return "#da3450";
        default: return "#1565C0";
    }
}

function badgeLabel(badge: Badges, t: TranslationFunction): string {
    switch (badge) {
        case Badges.CHEAPEST: return t("Cheapest");
        case Badges.EASIEST: return t("Easiest");
        case Badges.FASTEST: return t("Fastest");
        case Badges.GREENEST: return t("Greenest");
        case Badges.HEALTHIEST: return t("Healthiest");
        default: return t("Recommended");
    }
}

class TKUITripRow extends React.Component<IProps, {}> {

    private ref: any;

    public render(): React.ReactNode {
        const trip = this.props.value;
        const currencySymbol = trip.currencySymbol || "$";
        const cost = trip.moneyCost === null ? undefined :
            (trip.moneyCost === 0 ? "Free" : currencySymbol + trip.moneyCost);
        const calories = trip.caloriesCost > 0 ? trip.caloriesCost + " kcal" : undefined;
        const carbon = trip.carbonCost === 0 ? " No CO2" : trip.carbonCost + " kg CO2";
        let info = cost || "";
        if (calories) {
            info += (info ? " · " : "") + calories;
        }
        if (carbon) {
            info += (info ? " · " : "") + carbon;
        }
        const alternatives = (trip as TripGroup).trips
            // create a copy to preserve original sorting of trip.trips.
            .slice()
            // sort by depart, ascending if leave after (the sooner the better), descending if arrive by (the later the better).
            .sort((t1: Trip, t2: Trip) => {
                return trip.queryIsLeaveAfter === false ? t2.depart - t1.depart : t1.depart - t2.depart;
            });
        const pastAlternatives = alternatives.filter((alt: Trip) =>
            alt.queryTime !== null && alt.queryIsLeaveAfter !== null &&
            (alt.queryIsLeaveAfter ? Math.floor(alt.depart/60) < Math.floor(alt.queryTime/60) :
                Math.floor(alt.arrive/60) > Math.floor(alt.queryTime/60)));
        const futureAlternatives = alternatives.filter((alt: Trip) =>
            alt.queryTime === null || alt.queryIsLeaveAfter === null ||
            (alt.queryIsLeaveAfter ? Math.floor(alt.depart/60) >= Math.floor(alt.queryTime/60) :
                Math.floor(alt.arrive/60) <= Math.floor(alt.queryTime/60)));
        const selectedAlt = (trip as TripGroup).getSelectedTrip();
        const visibleAlternativesCount = this.props.visibleAlternatives ? this.props.visibleAlternatives : 2;
        const visiblePastAlternatives = this.props.expanded ? pastAlternatives :
            pastAlternatives.includes(selectedAlt) ? [selectedAlt] : [];
        const visibleFutureAlternatives = this.props.expanded ? futureAlternatives :
                futureAlternatives.slice(0, Math.min(futureAlternatives.length, visibleAlternativesCount));
        if (futureAlternatives.includes(selectedAlt) && !visibleFutureAlternatives.includes(selectedAlt)) {
            visibleFutureAlternatives.push(selectedAlt);
        }
        const visibleAlternatives = visiblePastAlternatives.concat(visibleFutureAlternatives);
        const classes = this.props.classes;
        const t = this.props.t;
        const collapsed = !this.props.expanded;
        const bookingSegment = trip.segments.find(segment => segment.booking);
        return (
            <div className={classes.main}
                 onClick={this.props.onClick}
                 tabIndex={0}
                 onFocus={this.props.onFocus}
                 onKeyDown={this.props.onKeyDown}
                 ref={el => {
                     this.ref = el;
                     this.props.reference && this.props.reference(el);
                 }}
                 aria-label={collapsed ? undefined : selectedAlt.getAriaDescription(t)}
            >
                {!collapsed && !DeviceUtil.isTouch() &&
                <div role="status" style={{height: 0, overflow: 'hidden'}}>To browse alternatives start pressing tab button</div>}
                {this.props.badge &&
                <div className={classes.badge}
                     key={"badge"}
                     aria-label={badgeLabel(this.props.badge, this.props.t) + " result."}
                >
                    {badgeIcon(this.props.badge)}
                    {badgeLabel(this.props.badge, this.props.t)}
                </div>
                }
                {visibleAlternatives.map((altTrip: Trip, i: number) => {
                    const isSelectedAlt = altTrip === selectedAlt;
                    return (
                        <div className={classNames(classes.alternative,
                            this.props.selected && isSelectedAlt && classes.selectedAlternative)}
                             onClick={() => this.props.onAlternativeClick &&
                                 this.props.onAlternativeClick(trip as TripGroup, altTrip)}
                             onKeyDown={(e) => {
                                 // To get the same effect of a click when user presses enter (pick the alternative).
                                 // Couldn't use a button since a button (Details) inside a button is forbidden.
                                 if (e.keyCode === 13) {
                                     this.props.onAlternativeClick &&
                                     this.props.onAlternativeClick(trip as TripGroup, altTrip)
                                 }
                             }}
                             key={i}
                             aria-label={collapsed ? altTrip.getAriaDescription(t) : altTrip.getAriaTimeDescription(t)}
                             aria-hidden={collapsed && !isSelectedAlt && !DeviceUtil.isTouch()}
                             tabIndex={collapsed && !DeviceUtil.isTouch() ? -1 : 0}
                             role={DeviceUtil.isTouch() ? "button" : undefined}
                        >
                            <div
                                className={(visiblePastAlternatives.includes(altTrip) || altTrip.isCancelled()) ? classes.pastAlternative : ''}>
                                <TKUITripTime value={altTrip} brief={this.props.brief}/>
                                <div className={classes.trackAndAction}>
                                    <div style={{position: 'relative'}}>
                                        {trip.isCancelled() &&
                                        <div className={classes.crossOut}/>}
                                        <TripRowTrack value={altTrip}
                                                      className={classes.track}
                                        />
                                    </div>
                                    {this.props.onDetailClick &&
                                    <TKUIButton
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        text={t("Details")}
                                        onClick={this.props.onDetailClick}
                                        aria-hidden={!collapsed || !isSelectedAlt}
                                        tabIndex={!collapsed || !isSelectedAlt ? -1 : undefined}
                                    />}
                                </div>
                            </div>
                        </div>
                    );})}
                <div className={classes.footer}
                     key={"footer"}
                     aria-label={info.replace(/ · /gi, ". ")}
                >
                    <div className={classes.info}>
                        {info}
                    </div>
                    {(this.props.expanded || alternatives.length > visibleAlternatives.length) &&
                        <TKUIButton
                            text={this.props.expanded ? t("Less") : t("More")}
                            type={TKUIButtonType.PRIMARY_LINK}
                            onClick={(e: any) => {
                                this.props.onExpand && this.props.onExpand(!this.props.expanded);
                                e.stopPropagation();
                            }}
                            onKeyDown={(e) => {
                                if (e.keyCode === 9 && WaiAriaUtil.isUserTabbing() && this.props.expanded) {
                                    // If navigating with keyboard, button is focused, alternatives are expanded,
                                    // and press tab, then put focus on main element.
                                    this.ref && this.ref.focus();
                                    e.stopPropagation();
                                    e.preventDefault();
                                }
                            }}
                            role={"button"}
                            aria-pressed={this.props.expanded}
                            aria-label={this.props.expanded ? "Less alternatives" : "More alternatives"}
                        />
                    }
                    {bookingSegment &&
                    <TKUIButton
                        text={t("Book")}
                        type={TKUIButtonType.PRIMARY_LINK}
                        onClick={(e: any) => {
                            this.props.onSegmentSelected?.(bookingSegment);
                            e.stopPropagation();
                        }}
                        role={"button"}
                        aria-label={t("Book")}
                    />}
                </div>
            </div>
        )
    }
}

export default connect((config: TKUIConfig) => config.TKUITripRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export {badgeColor}