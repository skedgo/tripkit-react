import React, { Component } from "react";
import Location from "../model/Location";
import { ReactComponent as IconPin } from '../images/ic-pin-start.svg';
import { ReactComponent as IconCurrLoc } from '../images/location/ic-curr-loc.svg';
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIAutocompleteResultDefaultStyle } from "./TKUIAutocompleteResult.css";
import classNames from "classnames";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import StopLocation from "../model/StopLocation";
import { genClassNames } from "../css/GenStyle.css";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    highlighted: boolean;
    ariaSelected?: boolean;
    onClick?: () => void;
    id?: string;
    renderIcon?: (location: Location) => JSX.Element;
    reference?: (el: any) => void;
    scrollIntoView?: boolean;
}

interface IStyle {
    main: CSSProps<IProps>;
    highlighted: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    address: CSSProps<IProps>;
    mainAddress: CSSProps<IProps>;
    matchingSubstr: CSSProps<IProps>;
    secondaryAddress: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIAutocompleteResultProps = IProps;
export type TKUIAutocompleteResultStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIAutocompleteResult {...props} />,
    styles: tKUIAutocompleteResultDefaultStyle,
    classNamePrefix: "TKUIAutocompleteResult"
};

class TKUIAutocompleteResult extends Component<IProps, {}> {

    public render(): React.ReactNode {
        const { location, classes } = this.props;
        let addressComponent: JSX.Element;
        if (location.suggestion
            && this.props.location.suggestion.structured_formatting) { // Google result
            let mainAddressComponent: JSX.Element;
            const structuredFormatting = this.props.location.suggestion.structured_formatting;
            const mainText = structuredFormatting.main_text;
            const matchedSubstrings = structuredFormatting.main_text_matched_substrings;
            let offset: number = 0;
            const mainAddressComponents: JSX.Element[] = [];
            for (const matchedSubstring of matchedSubstrings) {
                const substrOffset = matchedSubstring.offset;
                const substrLength = matchedSubstring.length;
                if (offset < substrOffset) {
                    mainAddressComponents.push(<span key={offset}>{mainText.substr(offset, substrOffset)}</span>);
                }
                mainAddressComponents.push(<span key={substrOffset} className={classes.matchingSubstr}>{mainText.substr(substrOffset, substrLength)}</span>);
                offset = substrOffset + substrLength;
            }
            mainAddressComponents.push(<span key={offset}>{mainText.substr(offset, mainText.length)}</span>);
            mainAddressComponent = <span key={1} className={classes.mainAddress}>{mainAddressComponents}</span>;
            addressComponent = <span className={classes.address} role="none"> {[
                mainAddressComponent,
                <span key={2} className={classes.secondaryAddress}>{structuredFormatting.secondary_text}</span>
            ]}
            </span>;
        } else {
            addressComponent =
                <span className={classes.address} role="none">
                    {(Environment.isDevAnd(this.props.location.source === TKDefaultGeocoderNames.skedgo && false) ? "*SG*" : "") +
                        LocationUtil.getMainText(this.props.location, this.props.t)}
                    <span key={2} className={classes.secondaryAddress}>{LocationUtil.getSecondaryText(this.props.location)}</span>
                </span>;
        }
        if (location instanceof StopLocation && location.services) {
            addressComponent =
                <div className={classNames(genClassNames.flex, genClassNames.column, genClassNames.grow, genClassNames.overflowEllipsis)}>
                    {addressComponent}
                    {location.services}
                </div>
        }
        return (
            <div className={classNames(classes.main, this.props.highlighted && classes.highlighted)}
                onClick={this.props.onClick}
                role="option"
                id={this.props.id}
                aria-selected={this.props.ariaSelected}
                ref={(ref) => {
                    this.props.reference?.(ref);
                    this.props.scrollIntoView && this.props.highlighted && ref
                        && ref.scrollIntoView({ block: 'nearest' });
                }}
            >
                <div className={classes.icon} aria-hidden={true}>
                    {this.props.renderIcon ? this.props.renderIcon(this.props.location) :
                        this.props.location.isCurrLoc() ? <IconCurrLoc focusable="false" /> : <IconPin />}
                </div>
                {addressComponent}
            </div>
        );
    }
}

const Connected = connect((config: TKUIConfig) => config.TKUIAutocompleteResult, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

// If I need it many times then add to connect function.
// This ref forwarding is necessary since react-select passes a reference
// to this component (if I ommit this an exception is thrown).
export default React.forwardRef((props: IClientProps, ref: any) => (
    <Connected {...props} reference={ref} />
));