import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import Favourite from "../model/favourite/Favourite";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIFavouriteRowDefaultStyle} from "./TKUIFavouriteRow.css";
import {ReactComponent as IconFavLoc} from "../images/favourite/ic-favourite-location.svg";
import {ReactComponent as IconFavTrip} from "../images/favourite/ic-favourite-trip.svg";
import {black} from "../jss/TKUITheme";
import StopIcon from "../map/StopIcon";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LocationUtil from "../util/LocationUtil";
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Favourite;
    onClick?: () => void;
    onRemove?: () => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    iconPanel: CSSProps<IProps>;
    text: CSSProps<IProps>;
    removeBtn: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIFavouriteRowProps = IProps;
export type TKUIFavouriteRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFavouriteRow {...props}/>,
    styles: tKUIFavouriteRowDefaultStyle,
    classNamePrefix: "TKUIFavouriteRow"
};

class TKUIFavouriteRow extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        const classes = this.props.classes;
        const value = this.props.value;
        let text: string;
        let icon: JSX.Element;
        if (value instanceof FavouriteStop) {
            icon =
                <StopIcon
                    stop={value.stop}
                    style={{
                        width: '20px',
                        height: '20px',
                        background: black(1, this.props.theme.isDark)
                    }}
                    isDarkMode={this.props.theme.isDark}
                />;
            text = value.stop.name;
        } else {
            const favTrip = value as FavouriteTrip;
            icon = favTrip.from.isCurrLoc() ? <IconFavLoc/> : <IconFavTrip/>;
            text = favTrip.from.isCurrLoc() ?
                "To " + LocationUtil.getMainText(favTrip.to) :
                LocationUtil.getMainText(favTrip.from) + " to " + LocationUtil.getMainText(favTrip.to)
        }
        const removeBtn = this.props.onRemove &&
            <button className={classes.removeBtn}
                    onClick={(e: any) => {
                        this.props.onRemove!();
                        e.stopPropagation();

                    }}>
                <IconRemove/>
            </button>;
        return (
            <div className={classes.main} onClick={this.props.onClick}>
                <span className={classes.iconPanel}>
                {icon}
                </span>
                <span className={classes.text}>
                {text}
                </span>
                {removeBtn}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIFavouriteRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));