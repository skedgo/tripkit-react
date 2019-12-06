import React, {Component} from "react";
import Location from "../model/Location";
import './ResultItem.css';
import {ReactComponent as IconPin} from '../images/ic-pin-start.svg';
import {ReactComponent as IconCurrLoc} from '../images/location/ic-curr-loc.svg';
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import SkedgoGeocoder from "../geocode/SkedgoGeocoder";
import classNames from "classnames";
import genStylesCss from "../css/general.module.css";

interface IProps {
    location: Location;
    highlighted: boolean;
    ariaSelected?: boolean;
    onClick?: () => void;
    id?: string;
    renderIcon?: (location: Location) => JSX.Element;
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
                    {   (Environment.isDevAnd(this.props.location.source === SkedgoGeocoder.SOURCE_ID  && false) ? "*SG*" : "") +
                        LocationUtil.getMainText(this.props.location)
                    }
                    <span key={2} className="ResultItem-secondaryAddress">{LocationUtil.getSecondaryText(this.props.location)}</span>
                </span>;
        }
        return (
            <div style={{background: this.props.highlighted ? '#efeded' : 'white'}}
                 className={"gl-flex gl-space-between ResultItem"}
                 onClick={this.props.onClick}
                 role="option"
                 id={this.props.id}
                 aria-selected={this.props.ariaSelected}
            >
                <div className={classNames("ResultItem-icon", genStylesCss.svgPathFillCurrColor)}>
                    {this.props.renderIcon ? this.props.renderIcon(this.props.location) :
                    this.props.location.isCurrLoc() ? <IconCurrLoc aria-hidden={true} focusable="false"/> : <IconPin/>}
                </div>
                {addressComponent}
            </div>
        );
    }
}

export default ResultItem;