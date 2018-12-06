import React, {Component} from "react";
import Location from "../model/Location";
import './ResultItem.css';
import IconCurrLoc from '-!svg-react-loader!../images/ic-curr-loc.svg';
import LocationUtil from "../util/LocationUtil";
import GeocodingSource from "./GeocodingSource";
import Environment from "../env/Environment";
import TransportUtil from "../trip/TransportUtil";
import ModeIdentifier from "../model/region/ModeIdentifier";

interface IProps {
    location: Location;
    highlighted: boolean;
    ariaSelected?: boolean;
    key: number;
    onClick?: () => void;
    id?: string;
}

class ResultItem extends Component<IProps, {}> {

    public render(): React.ReactNode {
        let addressComponent: JSX.Element;
        if (this.props.location.suggestion
            && this.props.location.suggestion.structured_formatting) { // Google result
            let mainAddressComponent: JSX.Element;
            const structuredFormatting = this.props.location.suggestion.structured_formatting;
            const mainText = structuredFormatting.main_text;
            const matchedSubstrings = structuredFormatting.main_text_matched_substrings;
            let offset: number = 0;
            const mainAddressComponents:JSX.Element[] = [];
            for (const matchedSubstring of matchedSubstrings) {
                const substrOffset = matchedSubstring.offset;
                const substrLength = matchedSubstring.length;
                if (offset < substrOffset) {
                    mainAddressComponents.push(<span key={offset}>{mainText.substr(offset, substrOffset)}</span>);
                }
                mainAddressComponents.push(<span key={substrOffset} className="ResultItem-matchingSubstr">{mainText.substr(substrOffset, substrLength)}</span>);
                offset = substrOffset + substrLength;
            }
            mainAddressComponents.push(<span key={offset}>{mainText.substr(offset, mainText.length)}</span>);
            mainAddressComponent = <span key={1} className="ResultItem-mainAddress">{mainAddressComponents}</span>;
            addressComponent = <span className="ResultItem-address"> {[
                mainAddressComponent,
                <span key={2} className="ResultItem-secondaryAddress">{structuredFormatting.secondary_text}</span>
            ]}
            </span>;
        } else {
            addressComponent =
                <span className="ResultItem-address">
                    {   (Environment.isDevAnd(this.props.location.source === GeocodingSource.ACT_SCHOOLS && false) ? "*SCH*" : "") +
                        (Environment.isDevAnd(this.props.location.source === GeocodingSource.SKEDGO  && false) ? "*SG*" : "") +
                        LocationUtil.getMainText(this.props.location)
                    }
                    <span key={2} className="ResultItem-secondaryAddress">{LocationUtil.getSecondaryText(this.props.location)}</span>
                </span>;
        }
        return (
            <div key={this.props.key}
                 style={{background: this.props.highlighted ? '#efeded' : 'white'}}
                 className={"gl-flex gl-space-between ResultItem" + (this.props.location.isCurrLoc() ? " currLoc" : "")}
                 onClick={this.props.onClick}
                 role="option"
                 id={this.props.id}
                 aria-selected={this.props.ariaSelected}
            >
                {addressComponent}
                {this.props.location.isCurrLoc() ? <IconCurrLoc aria-hidden={true} focusable="false"/> : ""}
                {this.props.location.source === GeocodingSource.ACT_SCHOOLS ?
                    <img src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(ModeIdentifier.SCHOOLBUS_ID))}
                         className="ResultItem-icon"
                    /> : ""}
            </div>
        );
    }
}

export default ResultItem;