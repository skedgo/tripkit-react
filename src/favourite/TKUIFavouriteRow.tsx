import * as React from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Favourite from "../model/favourite/Favourite";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIFavouriteRowDefaultStyle } from "./TKUIFavouriteRow.css";
import { ReactComponent as IconFavLoc } from "../images/favourite/ic-favourite-location.svg";
import { ReactComponent as IconFavTrip } from "../images/favourite/ic-favourite-trip.svg";
import { ReactComponent as IconInfo } from "../images/ic-info.svg";
import TKUIModeLocationIcon from "../map/TKUIModeLocationIcon";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LocationUtil from "../util/LocationUtil";
import { ReactComponent as IconRemove } from '../images/ic-cross.svg';
import { ReactComponent as IconDrag } from '../images/ic-drag-handle.svg';
import WaiAriaUtil from "../util/WaiAriaUtil";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import classNames from "classnames";
import UIUtil from "../util/UIUtil";
import TKUIRow from "../options/TKUIRow";
import { genStylesJSS } from "..";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Favourite;
    onClick?: () => void;
    onEdit?: () => void;
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
    const { value, onClick, onEdit, onRemove, onHandleMouseDown, classes, t, theme } = props;
    let text: string;
    let icon: JSX.Element;
    if (value instanceof FavouriteStop) {
        icon = value.stop ?
            <TKUIModeLocationIcon
                location={value.stop}
                style={{
                    width: '40px',
                    height: '40px',
                    padding: '6px'
                }}
                isDarkMode={theme.isDark}
            /> : <div className={classes.loadingFav} />;
        text = value.name ?? (value.stop ? LocationUtil.getMainText(value.stop, t) : "");
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
                UIUtil.confirmMsg({
                    title: "Delete",
                    message: "Are you sure you want to delete this favourite?",
                    onConfirm: () => {
                        onRemove!();
                    }
                });
                e.stopPropagation();
            }}>
            <IconRemove />
        </button>;
    const infoBtn = onEdit &&
        <button
            className={classes.editBtn}
            onClick={e => {
                onEdit!();
                e.stopPropagation();
            }}
        >
            <IconInfo />
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
            <TKUIRow
                title={text}
                subtitle={(value instanceof FavouriteStop && value.stop?.services) ? value.stop?.services : undefined}
                styles={{
                    main: overrideClass({
                        ...genStylesJSS.grow
                    })
                }}
            />
            {infoBtn}
            {removeBtn}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIFavouriteRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));