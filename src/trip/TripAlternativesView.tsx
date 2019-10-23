import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import "./TripAlternativesView.css";
import Util from "../util/Util";
import {ITKUITripRowProps} from "./TKUITripRow";

interface IProps {
    value: TripGroup;
    onChange: (value: TripGroup) => void;
    renderTrip: <P extends ITKUITripRowProps>(tripRowProps: P) => JSX.Element;
}

class TripAlternativesView extends React.Component<IProps, {}> {

    private ref: any;
    private rowRefs: any[] = [];

    constructor(props: Readonly<IProps>) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    public focus() {
        this.ref.focus();
    }

    public render(): React.ReactNode {
        return (
            <div className="TripAlternativesView gl-flex"
                 ref={el => this.ref = el}
                 tabIndex={0}
                 aria-label="Trip alternatives list. Browse through alternatives using tab key, and press return to pick alternative."
            >
                <div className="gl-scrollable-y gl-grow">
                    { this.props.value.trips.map((trip: Trip, i: number) =>
                        this.props.renderTrip(
                            { value: trip,
                                brief: true,
                                className: "TripAlternativesView-tripRow" + (trip === this.props.value.getSelectedTrip() ? " selected" : ""),
                                onClick: () => {
                                    return this.onSelected(i);
                                },
                                onKeyDown: (e: any) => this.onKeyDown(e, i),
                                key: i + trip.getKey(),
                                reference: (el: any) => this.rowRefs[i] = el
                            })
                    )}
                </div>
            </div>
        );
    }

    private onKeyDown(e: any, targetI: number) {
        if (e.keyCode === 13) {
            this.onSelected(targetI);
            return
        }
        if (e.keyCode === 38 || e.keyCode === 40) {
            const nextIndex = this.nextIndex(targetI, e.keyCode === 38);
            this.rowRefs[nextIndex].focus();
        }
    }

    private nextIndex(i: number, prev: boolean) {
        return (i + (prev ? -1 : 1) + this.props.value.trips.length) % this.props.value.trips.length;
    }

    private onSelected(i: number) {
        const update = Util.clone(this.props.value);
        update.setSelected(i);
        return this.props.onChange(update);
    }
}

export default TripAlternativesView;