import React, { FunctionComponent, useContext, useEffect } from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIFavouritesViewDefaultStyle } from "./TKUIFavouritesView.css";
import Favourite from "../model/favourite/Favourite";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { IFavouritesContext, TKFavouritesContext } from "./TKFavouritesProvider";
import TKUIFavouriteRow from "./TKUIFavouriteRow";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import TKUIReorderList from "../util_components/TKUIReorderList";
import TKUIEditFavouriteView from "./TKUIEditFavouriteView";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKLoading from "../card/TKLoading";
import { ReactComponent as IconRefresh } from '../images/ic-refresh.svg';
import { ReactComponent as IconAdd } from '../images/ic-plus-circle.svg';
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import UIUtil from "../util/UIUtil";
import { TKError } from "../error/TKError";
import { useResponsiveUtil } from "../util/TKUIResponsiveUtil";

export interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    title?: string;
    onFavouriteClicked?: (item: Favourite) => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends IFavouritesContext { }

export type IStyle = ReturnType<typeof tKUIFavouritesViewDefaultStyle>

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIFavouritesViewProps = IProps;
export type TKUIFavouritesViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFavouritesView {...props} />,
    styles: tKUIFavouritesViewDefaultStyle,
    classNamePrefix: "TKUIFavouritesView"
};

const TKUIFavouritesView: FunctionComponent<IProps> = (props) => {
    const { classes, t, slideUpOptions = {}, title = t("Favourites"), injectedStyles, onRequestClose, onFavouriteClicked, favouriteList, onRemoveFavourite, onReorderFavourite, isLoadingFavourites, onRefreshFavourites } = props;
    const { landscape } = useResponsiveUtil();
    const [editing, setEditing] = React.useState<boolean>(false);
    const [editingFav, setEditingFav] = React.useState<Favourite | undefined>(undefined);
    const [isCreatingFav, setIsCreatingFav] = React.useState<boolean>(false);
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);    
    const handleEditClose = async (update?: Favourite) => {
        setEditingFav(undefined);
        if (update) {
            try {
                onWaitingStateLoad(true);
                await (isCreatingFav ? props.onAddFavourite(update) : props.onUpdateFavourite(update));
            } catch (e) {
                UIUtil.errorMsg(new TKError(isCreatingFav ? "Failed to create favourite." : "Failed to update favourite."));
            } finally {
                onWaitingStateLoad(false);
            }
        }
        setIsCreatingFav(false);
    };
    const handleRemoveFavourite = (favourite: Favourite) => {
        UIUtil.confirmMsg({
            title: "Delete",
            message: "Are you sure you want to delete this favourite?",
            onConfirm: async () => {
                try {
                    onWaitingStateLoad(true);
                    await onRemoveFavourite?.(favourite);
                } catch (e) {
                    UIUtil.errorMsg(new TKError("Failed to delete favourite."));
                } finally {
                    onWaitingStateLoad(false);
                    setEditingFav(undefined);
                }
            }
        });
    }
    return (
        <>
            <TKUICard
                title={title}
                presentation={CardPresentation.SLIDE_UP}
                renderSubHeader={() =>
                    <div className={classes.subHeader}>
                        <TKUIButton text={editing ? t("Done") : t("edit")}
                            onClick={() => setEditing(!editing)}
                            type={TKUIButtonType.PRIMARY_LINK}
                            styles={{
                                main: overrideClass(injectedStyles.editBtn)
                            }}
                        />
                        {onRefreshFavourites &&
                            <button className={classes.refresh}
                                onClick={() => {
                                    // if (resultsRef.current) {
                                    //     resultsRef.current.scrollTop = 0;
                                    // };
                                    onRefreshFavourites({ shouldRefreshStops: true });
                                }}>
                                <IconRefresh />
                            </button>}
                        <button className={classes.add}
                            onClick={() => {
                                setIsCreatingFav(true);
                            }}>
                            <IconAdd />
                        </button>
                    </div>}
                onRequestClose={onRequestClose}
                slideUpOptions={slideUpOptions}
                styles={{
                    subHeader: overrideClass({ padding: '0 16px' })
                }}
            >
                <div className={classes.main}>
                    <TKUIReorderList
                        onDragEnd={onReorderFavourite}
                    >
                        {(onHandleMouseDown) =>
                            favouriteList.map((item, i) =>
                                <TKUIFavouriteRow
                                    value={item}
                                    onClick={editing ? undefined : () => onFavouriteClicked?.(item)}
                                    onRemove={editing ? () => handleRemoveFavourite(item) : undefined}
                                    onEdit={!editing && (item instanceof FavouriteStop ? item.stop : true) ? () => setEditingFav(item) : undefined}
                                    onHandleMouseDown={editing ? (e: any) => onHandleMouseDown(e, i) : undefined}
                                    key={i}
                                />)
                        }
                    </TKUIReorderList>
                    {isLoadingFavourites &&
                        <div className={classes.loadingPanel}>
                            <TKLoading />
                        </div>}
                </div>
            </TKUICard>
            {(editingFav || isCreatingFav) &&
                <TKUIEditFavouriteView
                    value={editingFav}
                    onRequestClose={handleEditClose}
                    onRemove={editingFav ? () => handleRemoveFavourite(editingFav) : undefined}
                    cardPresentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    slideUpOptions={{ draggable: false }}
                    styles={{
                        formGroup: overrideClass({
                            '& label[for="address"]': {
                                display: 'none'
                            }
                        })
                    }}
                />}
        </>
    );
}


const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = (props) => {
    const favouritesContext = useContext(TKFavouritesContext);
    return <>{props.children!({ ...favouritesContext })}</>;
};

export default connect((config: TKUIConfig) => config.TKUIFavouritesView, config, mapperFromFunction((clientProps: IClientProps) => clientProps));

export const TKUIFavouritesViewHelpers = {
    TKStateProps: Consumer,
    useTKStateProps: () => { }   // Hook version of TKStateProps, not defined for now.
}