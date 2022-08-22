import * as React from "react";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";
import { Visibility } from "../model/trip/SegmentTemplate";
import TKUITrackTransport from "./TKUITrackTransport";
import { TKUITheme } from "../jss/TKUITheme";
import { TKUIWithClasses, withStyles } from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";

const tripRowTrackStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        flexWrap: 'wrap',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        '& > *': {
            marginRight: '3px'
        }
    }
});

type IStyle = ReturnType<typeof tripRowTrackStyle>;
export interface IProps extends TKUIWithClasses<IStyle, IProps> {
    value: Trip;
}

class TripRowTrack extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        let brief: boolean | undefined;
        const segments = this.props.value.getSegments(Visibility.IN_SUMMARY);
        const nOfSegments = segments.length;
        if (nOfSegments > 4 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        } else if (nOfSegments < 4) {
            brief = false;
        }
        return (
            <div className={this.props.classes.main}>
                {segments.map((segment: Segment, i: number) =>
                    <TKUITrackTransport segment={segment} brief={brief} key={i} />)}
            </div>
        );
    }
}

export default withStyles(TripRowTrack, tripRowTrackStyle);