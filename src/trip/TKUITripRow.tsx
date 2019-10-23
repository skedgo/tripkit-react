import * as React from "react";
import "./TripRowDelete.css";
import TripGroup from "../model/trip/TripGroup";
import TripAltBtn from "./TripAltBtn";
import TripRowTrack from "./TripRowTrack";
import {default as TrackTransport, TrackTransportProps} from "./TrackTransport";
import TKUITripTime from "./TKUITripTime";
import Trip from "../model/trip/Trip";
import {EventEmitter} from "fbemitter";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {tTKUITripRowDefaultStyle} from "./TKUITripRow.css";
import {ReactComponent as IconBadge} from '../images/badges/ic-badge.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {Badges} from "./TKMetricClassifier";

export interface ITKUITripRowProps extends TKUIWithStyle<ITKUITripRowStyle, ITKUITripRowProps> {
    value: Trip;
    className?: string;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: any) => void;
    onDetailClick?: () => void;
    eventBus?: EventEmitter;
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    reference?: (ref: any) => void;
    badge?: Badges;
}

export const TRIP_ALT_PICKED_EVENT = "onTripAltPicked";

export interface ITKUITripRowStyle {
    main: CSSProps<ITKUITripRowProps>;
    badge: CSSProps<ITKUITripRowProps>;
    info: CSSProps<ITKUITripRowProps>;
    trackAndAction: CSSProps<ITKUITripRowProps>;
    track: CSSProps<ITKUITripRowProps>;
    footer: CSSProps<ITKUITripRowProps>;
}

interface IProps extends ITKUITripRowProps {
    classes: ClassNameMap<keyof ITKUITripRowStyle>;
}

export class TKUITKUITripRowConfig implements TKUIWithStyle<ITKUITripRowStyle, ITKUITripRowProps> {
    public styles = tTKUITripRowDefaultStyle;
    public randomizeClassNames?: boolean;

    public static instance = new TKUITKUITripRowConfig();
}

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
        const classes = this.props.classes;
        return (
            <div className={classes.main + " TKUITripRow" + (this.props.className ? " " + this.props.className : "")}
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
                <div className="TripRow-body">
                    <TKUITripTime value={trip} brief={this.props.brief}/>
                    <div className={classes.trackAndAction}>
                        <TripRowTrack value={trip}
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
                <div className={classes.footer}>
                    <div className={classes.info}>
                        {info}
                    </div>
                    <TripAltBtn
                        value={trip as TripGroup}
                        onChange={(value: TripGroup) => {
                            if (this.props.onAlternativeChange) {
                                this.props.onAlternativeChange(this.props.value as TripGroup, value.getSelectedTrip());
                            }
                        }}
                        renderTrip={<P extends ITKUITripRowProps>(props: P) => <Connected {...props}/>}
                    />
                </div>
            </div>
        )
    }
}

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUITripRow");
    return (props: ITKUITripRowProps) => {
        const stylesToPass = props.styles || TKUITKUITripRowConfig.instance.styles;
        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
            TKUITKUITripRowConfig.instance.randomizeClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} randomizeClassNames={randomizeClassNamesToPass}/>;
    };
};

const Connected = Connect(TKUITripRow);
export default Connected;