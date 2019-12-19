import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIFavouritesViewDefaultStyle} from "./TKUIFavouritesView.css";
import Favourite from "../model/favourite/Favourite";
import {CardPresentation, default as TKUICard} from "../card/TKUICard";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {IFavouritesContext, TKFavouritesContext} from "./TKFavouritesProvider";
import TKUIFavouriteRow from "./TKUIFavouriteRow";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    filter?: (favouriteList: Favourite[], recentList: Favourite[]) => Favourite[];
    onFavouriteClicked?: (item: Favourite) => void;
    onRequestClose?: () => void;
    top?: number;
}

interface IConsumedProps {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onRemoveFavourite: (value: Favourite) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    subHeader: CSSProps<IProps>;
    editBtn: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIFavouritesViewProps = IProps;
export type TKUIFavouritesViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFavouritesView {...props}/>,
    styles: tKUIFavouritesViewDefaultStyle,
    classNamePrefix: "TKUIFavouritesView"
};

interface IState {
    editing: boolean
}

class TKUIFavouritesView extends React.Component<IProps, IState> {


    constructor(props: IProps) {
        super(props);
        this.state = {editing: false}
    }

    public static defaultProps: Partial<IProps> = {
        title: "Favourites",
        filter: (favouriteList: Favourite[], recentList: Favourite[]) => {
            const sortedFavs = recentList.filter((recent: Favourite) => favouriteList.find((fav: Favourite) => fav.equals(recent)));
            return sortedFavs.concat(favouriteList.filter((fav: Favourite) => !sortedFavs.find((sfav: Favourite) => sfav.equals(fav))));
        }
    };

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <TKUICard
                title={this.props.title}
                presentation={CardPresentation.SLIDE_UP}
                renderSubHeader={() =>
                    <div className={classes.subHeader}>
                        <TKUIButton text={this.state.editing ? "Done" : "Edit"}
                                    onClick={() => this.setState((prev: IState) => ({editing: !prev.editing}))}
                                    type={TKUIButtonType.PRIMARY_LINK}
                                    style={this.props.injectedStyles.editBtn}
                        />
                    </div>}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={this.props.top ? {modalUp: {top: this.props.top, unit: 'px'}} : undefined}
            >
                <div className={classes.main}>
                    {this.props.filter!(this.props.favouriteList, this.props.recentList)
                        .map((item: Favourite) =>
                            <TKUIFavouriteRow
                                value={item}
                                onClick={() => this.props.onFavouriteClicked && this.props.onFavouriteClicked(item)}
                                onRemove={this.state.editing ? () => this.props.onRemoveFavourite(item) : undefined}
                            />)}
                </div>
            </TKUICard>
        );
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
        return (
            <TKFavouritesContext.Consumer>
                {(favouriteContext: IFavouritesContext) => {
                    const consumerProps: IConsumedProps = {
                        favouriteList: favouriteContext.favouriteList,
                        recentList: favouriteContext.recentList,
                        onRemoveFavourite: favouriteContext.onRemoveFavourite
                    };
                    return props.children!(consumerProps);
                }}
            </TKFavouritesContext.Consumer>
        );
    };

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIFavouritesView, config, Mapper);