import * as React from "react";
import { Polyline, PolylineProps, Tooltip } from "react-leaflet";
import Street, { roadTagColor, roadTagDisplayS } from "../model/trip/Street";
import ModeInfo from "../model/trip/ModeInfo";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIFriendlinessColors } from "../trip/TKUIWCSegmentInfo.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    streets: Street[];
    color?: string;
    toPolylineProps?: (streets: Street[], color?: string) => PathProps | PathProps[];
    modeInfo?: ModeInfo;
    id: string;
}

export interface IStyle { }

export type TKUIMapStreetsProps = IProps;
export type TKUIMapStreetsStyle = IStyle;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapStreets {...props} />,
    styles: {},
    classNamePrefix: "TKUIMapStreets"
};

export type PathProps = PolylineProps & { tooltip?: string; }

class TKUIMapStreets extends React.Component<IProps, {}> {

    /**
     * if color === null show friendliness (which makes sense for bicycle and wheelchair segments)
     * TODO: make MapTripSegment to override this (by sending toPolylineProps) for bicycle and wheelchair modes.
     * MapTripSegment may know if we should display friendliness or road tags for cycle paths.
     */
    private streetsRenderer(streets: Street[], modeInfo?: ModeInfo, color?: string) {
        let result = streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 9,
                color: "black",
                opacity: 1,  // Disable safe distinction for now
                ...modeInfo?.isBicycle() && {
                    dashArray: '20 20'
                }
            } as PathProps
        }).concat(streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 7,
                color: color ? color :
                    street.roadTags.length > 0 ? roadTagColor(street.roadTags[0]) : // This happens just when modeInfo?.isBicycle()
                        street.safe ? tKUIFriendlinessColors.safe :
                            street.safe === false ? tKUIFriendlinessColors.unsafe :
                                street.dismount ? tKUIFriendlinessColors.dismount : tKUIFriendlinessColors.unknown,
                opacity: 1,  // Disable safe distinction for now
                ...modeInfo?.isBicycle() && {
                    dashArray: '20 20'
                }
            } as PathProps
        }));
        // if (modeInfo?.isBicycle()) {
        //     result = result.concat(streets.map((street: Street) => {
        //         return {
        //             positions: street.waypoints,
        //             weight: 20,
        //             opacity: 0,
        //             dashArray: '20 20',
        //             tooltip: street.roadTags[0] && roadTagDisplayS(street.roadTags[0])
        //         } as PathProps
        //     }))
        // }
        return result;
    }

    public render(): React.ReactNode {
        const polylineOptions = this.props.toPolylineProps ? this.props.toPolylineProps(this.props.streets, this.props.color) :
            this.streetsRenderer(this.props.streets, this.props.modeInfo, this.props.color);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PathProps[];
        return polylineOptionsArray
            .map((options: PathProps, i: number) =>
                <Polyline {...options} key={this.props.id + "-" + i}>
                    {options.tooltip && <Tooltip sticky>{options.tooltip}</Tooltip>}
                </Polyline>)
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapStreets, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));