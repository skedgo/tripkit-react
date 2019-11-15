import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import TripRowTrack from "./TripRowTrack";
import {default as TrackTransport, TrackTransportProps} from "./TrackTransport";
import TKUITripTime from "./TKUITripTime";
import Trip from "../model/trip/Trip";
import {EventEmitter} from "fbemitter";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tTKUITripRowDefaultStyle} from "./TKUITripRow.css";
import {ReactComponent as IconBadge} from '../images/badges/ic-badge.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {Badges} from "./TKMetricClassifier";
import classNames from "classnames";
import {TKUIConfig, ITKUIComponentDefaultConfig} from "../config/TKUIConfig";
import {Subtract} from "utility-types";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface ITKUITripRowProps extends TKUIWithStyle<ITKUITripRowStyle, IProps> {
    value: Trip;
    className?: string;
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

export const TRIP_ALT_PICKED_EVENT = "onTripAltPicked";

export interface ITKUITripRowStyle {
    main: CSSProps<IProps>;
    badge: CSSProps<IProps>;
    info: CSSProps<IProps>;
    trackAndAction: CSSProps<IProps>;
    track: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    alternative: CSSProps<IProps>;
    selectedAlternative: CSSProps<IProps>;
}

export interface IProps extends ITKUITripRowProps, TKUIWithClasses<ITKUITripRowStyle, IProps> {}

export const tKUITripRowDefaultConfig: ITKUIComponentDefaultConfig<IProps, ITKUITripRowStyle> = {
    render: props => <TKUITripRow {...props}/>,
    styles: tTKUITripRowDefaultStyle,
    classNamePrefix: "TKUITripRow",
    randomizeClassNames: false
};

function badgeIcon(badge: Badges): JSX.Element {
    return <IconBadge/>;
}

export function badgeColor(badge: Badges): string {
    switch (badge) {
        case Badges.CHEAPEST: return "rgb(255, 141, 27)";
        case Badges.EASIEST: return "rgb(35, 177, 94)";
        case Badges.FASTEST: return "rgb(255, 191, 0)";
        case Badges.GREENEST: return "rgb(0, 168, 143)";
        case Badges.HEALTHIEST: return "rgb(225, 91, 114)";
        default: return "rgb(24, 128, 231)";
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
        const carbon = trip.carbonCost > 0 ? trip.carbonCost + " kg CO2" : undefined;
        let info = cost || "";
        if (calories) {
            info += (info ? " · " : "") + calories;
        }
        if (carbon) {
            info += (info ? " · " : "") + carbon;
        }
        const alternatives = (trip as TripGroup).trips;
        let nOfAlts = this.props.expanded ? alternatives.length :
            Math.min(alternatives.length, this.props.visibleAlternatives ? this.props.visibleAlternatives : 2);
        const visibleAlternatives = alternatives.slice(0, nOfAlts);
        const selectedAlt = (trip as TripGroup).getSelectedTrip();
        if (!visibleAlternatives.includes(selectedAlt)) {
            visibleAlternatives.push(selectedAlt)
        }
        const classes = this.props.classes;
        return (
            <div className={classNames(classes.main, this.props.className)}
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
                <div className={classes.badge}>
                    {badgeIcon(this.props.badge)}
                    {this.props.badge}
                </div>
                }
                {visibleAlternatives.map((altTrip: Trip) =>
                    <div className={classNames(classes.alternative,
                        nOfAlts > 1 && altTrip === selectedAlt && classes.selectedAlternative)}
                         onClick={() => this.props.onAlternativeClick &&
                         this.props.onAlternativeClick(trip as TripGroup, altTrip)}
                    >
                        <TKUITripTime value={altTrip} brief={this.props.brief}/>
                        <div className={classes.trackAndAction}>
                            <TripRowTrack value={altTrip}
                                          renderTransport={(props: TrackTransportProps) => <TrackTransport {...props}/>}
                                          className={classes.track}
                            />
                            <TKUIButton
                                type={TKUIButtonType.PRIMARY_LINK}
                                text={"Detail"}
                                onClick={this.props.onDetailClick}
                            />
                        </div>
                    </div>
                )}
                <div className={classes.footer}>
                    <div className={classes.info}>
                        {info}
                    </div>
                    {alternatives.length > 1 &&
                        <TKUIButton
                            text={this.props.expanded ? "Less routes" : "More routes"}
                            type={TKUIButtonType.PRIMARY_LINK}
                            onClick={(e: any) => {
                                this.props.onExpand && this.props.onExpand(!this.props.expanded);
                                e.stopPropagation();
                            }}
                        />
                    }
                </div>
            </div>
        )
    }
}

export default connect(
    (config: TKUIConfig) => config.TKUITripRow, tKUITripRowDefaultConfig,
    mapperFromFunction((clientProps: ITKUITripRowProps) => clientProps));