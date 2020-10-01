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

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    selected?: boolean;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onAlternativeClick?: (group: TripGroup, alt: Trip) => void;
    onDetailClick?: () => void;
    onKeyDown?: (e: any) => void;
    eventBus?: EventEmitter;
    reference?: (ref: any) => void;
    badge?: Badges;
    visibleAlternatives?: number;
    expanded?: boolean;
    onExpand?: (expand: boolean) => void;
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
        case Badges.CHEAPEST: return <IconBadgeCheapest/>;
        case Badges.EASIEST: return <IconBadgeEasiest/>;
        case Badges.FASTEST: return <IconBadgeFastest/>;
        case Badges.GREENEST: return <IconBadgeGreenest/>;
        case Badges.HEALTHIEST: return <IconBadgeHealthiest/>;
        default: return <IconBadgeRecommended/>;
    }
}

function badgeColor(badge: Badges): string {
    switch (badge) {
        case Badges.CHEAPEST: return "rgb(255, 141, 27)";
        case Badges.EASIEST: return "rgb(35, 177, 94)";
        case Badges.FASTEST: return "rgb(255, 191, 0)";
        case Badges.GREENEST: return "rgb(0, 168, 143)";
        case Badges.HEALTHIEST: return "rgb(225, 91, 114)";
        default: return "rgb(24, 128, 231)";
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

    public focus() {
        this.ref.focus();
    }

    private formatCost(cost: number): string {
        return cost.toFixed(2);
    }

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
            >
                {this.props.badge &&
                <div className={classes.badge}
                     key={"badge"}
                     aria-label={badgeLabel(this.props.badge, this.props.t) + " result."}
                >
                    {badgeIcon(this.props.badge)}
                    {badgeLabel(this.props.badge, this.props.t)}
                </div>
                }
                {visibleAlternatives.map((altTrip: Trip, i: number) =>
                    <div className={classNames(classes.alternative,
                        this.props.selected && altTrip === selectedAlt && classes.selectedAlternative)}
                         onClick={() => this.props.onAlternativeClick &&
                             this.props.onAlternativeClick(trip as TripGroup, altTrip)}
                         key={i}
                         aria-label={altTrip.getAriaDescription(t)}
                         aria-hidden={i !== 0}
                    >
                        <div className={(visiblePastAlternatives.includes(altTrip) || altTrip.isCancelled()) ? classes.pastAlternative : ''}>
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
                                    aria-hidden={i !== 0}
                                    tabIndex={i !== 0 ? -1 : undefined}
                                />}
                            </div>
                        </div>
                    </div>)}
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
                            aria-hidden={true}
                            tabIndex={-1}
                        />
                    }
                </div>
            </div>
        )
    }
}

export default connect((config: TKUIConfig) => config.TKUITripRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export {badgeColor}