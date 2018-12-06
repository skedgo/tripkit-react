import * as React from "react";
import "./SegmentPinIcon.css";
import IconPin from "-!svg-react-loader!../images/ic-map-pin-transparent.svg";

interface IProps {
    transIcon: string;
    color: string;
    onDark?: boolean;
}

class SegmentPinIcon extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        return (
            <div>
                <IconPin className={"SegmentPinIcon-pin" +
                (this.props.onDark ? " gl-svg-path-fill-currColor" : " gl-svg-path-stroke-currColor SegmentPinIcon-whiteFill")}
                         style={{color: this.props.color}}
                         focusable="false"
                />
                <img src={this.props.transIcon} className="SegmentPinIcon-transport"/>
            </div>
        )
    }
}

export default SegmentPinIcon;