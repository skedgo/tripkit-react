import * as React from "react";
import Trip from "../model/trip/Trip";
import TripRowProps, {TRIP_ALT_PICKED_EVENT} from "./TripRowProps";
import "./TripsView.css";
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg';
import {EventEmitter} from "fbemitter";
import TripGroup from "../model/trip/TripGroup";


interface IProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    waiting?: boolean;
    className?: string;
    onChange?: (value: Trip) => void;
    eventBus?: EventEmitter;
    renderTrip: <P extends TripRowProps>(tripRowProps: P) => JSX.Element;
}

class TripsView extends React.Component<IProps, {}> {

    private rowRefs: any[] = [];

    constructor(props: IProps) {
        super(props);
        if (this.props.eventBus) {
            this.props.eventBus.addListener(TRIP_ALT_PICKED_EVENT, (orig: TripGroup, update: TripGroup) => {
                setTimeout(() => {
                    const updatedTripIndex = this.props.values.indexOf(update);
                    if (updatedTripIndex !== -1) {
                        this.rowRefs[updatedTripIndex].focus();
                    }
                }, 100);

            });
        }
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            const selectedI = this.props.value ? this.props.values.indexOf(this.props.value) : 0;
            if (this.props.onChange) {
                const nextIndex = this.nextIndex(selectedI, e.keyCode === 38);
                this.props.onChange(this.props.values[nextIndex]);
                this.rowRefs[nextIndex].focus();
            }
        }
    }

    private nextIndex(i: number, prev: boolean) {
        return (i + (prev ? -1 : 1) + this.props.values.length) % this.props.values.length;
    }

    public render(): React.ReactNode {
        return (
            <div className={"TripsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                {this.props.values.map((trip: Trip, index: number) =>
                    this.props.renderTrip(
                        { value: trip,
                            className: trip === this.props.value ? "selected" : undefined,
                            onClick: this.props.onChange ? () => this.props.onChange!(trip) : undefined,
                            onFocus: this.props.onChange ? () => this.props.onChange!(trip) : undefined,
                            onKeyDown: this.onKeyDown,
                            eventBus: this.props.eventBus,
                            key: index + trip.getKey(),
                            ref: (el: any) => this.rowRefs[index] = el
                        })
                )}
                {this.props.waiting ?
                    <IconSpin className="TripsView-iconLoading sg-animate-spin gl-align-self-center" focusable="false"/> : null}
            </div>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (!prevProps.value && this.props.value) {
            this.rowRefs[this.props.values.indexOf(this.props.value)].focus();
        }
    }

    public static sortTrips(trips: Trip[]) {
        return trips.slice().sort((t1: Trip, t2: Trip) => {
            return t1.weightedScore - t2.weightedScore;
        });
    }
}

export default TripsView;