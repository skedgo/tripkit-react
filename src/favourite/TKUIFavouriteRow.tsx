import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Favourite from "../model/favourite/Favourite";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIFavouriteRowDefaultStyle } from "./TKUIFavouriteRow.css";
import { ReactComponent as IconFavLoc } from "../images/favourite/ic-favourite-location.svg";
import { ReactComponent as IconFavTrip } from "../images/favourite/ic-favourite-trip.svg";
import TKUIModeLocationIcon from "../map/TKUIModeLocationIcon";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LocationUtil from "../util/LocationUtil";
import { ReactComponent as IconRemove } from '../images/ic-cross.svg';
import { ReactComponent as IconDrag } from '../images/ic-drag-handle.svg';
import WaiAriaUtil from "../util/WaiAriaUtil";
import StopLocation from "../model/StopLocation";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Favourite;
    onClick?: () => void;
    onRemove?: () => void;
    onHandleMouseDown?: React.MouseEventHandler;
}

type IStyle = ReturnType<typeof tKUIFavouriteRowDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIFavouriteRowProps = IProps;
export type TKUIFavouriteRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFavouriteRow {...props} />,
    styles: tKUIFavouriteRowDefaultStyle,
    classNamePrefix: "TKUIFavouriteRow"
};
const TKUIFavouriteRow: React.FunctionComponent<IProps> = (props) => {
    const { value, onClick, onRemove, onHandleMouseDown, classes, t, theme } = props;
    console.log(value);
    let text: string;
    let icon: JSX.Element;
    if (value instanceof FavouriteStop) {
        icon =
            <TKUIModeLocationIcon
                location={value.stop ?? new StopLocation()}
                style={{
                    width: '40px',
                    height: '40px',
                    padding: '6px',
                    // background: value.stop && !isRemoteIcon(value.stop.modeInfo) ? black(1) : undefined
                }}
                isDarkMode={theme.isDark}
            />;
        text = value.name ?? LocationUtil.getMainText(value.stop ?? new StopLocation(), t);
    } else if (value instanceof FavouriteLocation) {
        icon = <IconFavLoc />;
        text = `To ${value.name ?? LocationUtil.getMainText(value.location, t)}`;
    } else {
        const favTrip = value as FavouriteTrip;
        icon = <IconFavTrip />;
        text = favTrip.name ?? (LocationUtil.getMainText(favTrip.startLocation, t) + " to " + LocationUtil.getMainText(favTrip.endLocation, t));
    }
    const removeBtn = onRemove &&
        <button className={classes.removeBtn}
            onClick={(e: any) => {
                onRemove!();
                e.stopPropagation();

            }}>
            <IconRemove />
        </button>;
    return (
        <div
            className={classNames(classes.main, onClick && classes.pointer)}
            onClick={onClick}
            onKeyDown={onClick && WaiAriaUtil.keyDownToClick(onClick)}
            tabIndex={0}
        >
            {onHandleMouseDown &&
                <button className={classes.dragHandle} onMouseDown={onHandleMouseDown}>
                    <IconDrag />
                </button>}
            <div className={classNames(classes.iconPanel, value instanceof FavouriteLocation || value instanceof FavouriteTrip ? classes.iconBackground : "")}>
                {icon}
            </div>
            <span className={classes.text}>
                {text}
            </span>
            {removeBtn}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIFavouriteRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));