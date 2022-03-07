import React from "react";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";
import {TKUISlideUpOptions} from "./TKUISlideUp";
import classNames from "classnames";
import Util from "../util/Util";
import TKUISlideUp from "./TKUISlideUp";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {tKUICardCarouselDefaultStyle} from "./TKUICardCarousel.css";
import {Subtract} from "utility-types";
import WaiAriaUtil from "../util/WaiAriaUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    selected?: number;
    onChange?: (selected: number) => void;
    slideUpOptions?: TKUISlideUpOptions;
    children?: any;
    showControls?: boolean;
    parentElement?: any;
    swipeable?: boolean; // default true
}

interface IConsumedPros extends TKUIViewportUtilProps {}

interface IStyle {
    modalContainer: CSSProps<IProps>;
    main: CSSProps<IProps>;
    lotOfPages: CSSProps<IProps>;
    pageWrapper: CSSProps<IProps>;
    hidden: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedPros, TKUIWithClasses<IStyle, IProps> {}

export type TKUICardCarouselProps = IProps;
export type TKUICardCarouselStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICardCarousel {...props}/>,
    styles: tKUICardCarouselDefaultStyle,
    classNamePrefix: "TKUICardCarousel"
};

interface IState {
    freezeCarousel: boolean;
    handles: Map<number, any>;
    hideOtherPages: boolean;    // This is to avoid browser to give focus to elements on the other pages on keyboard navigation.
}

class TKUICardCarousel extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            freezeCarousel: false,
            handles: new Map<number, any>(),
            hideOtherPages: true
        };
        this.registerHandle = this.registerHandle.bind(this);
    }

    private registerHandle(index: number, handle: any) {
        // handles is part of the state to force a re-render when a new handle is registered, and so TKUISlideUp always
        // has the current handle.
        const handles = this.state.handles;
        handles.set(index, handle);
        this.setState({
            handles: handles
        });
    }

    public render(): React.ReactNode {
        const children = Util.isFunction(this.props.children) ?
            (this.props.children as (registerHandle: (index: number, handle: any) => void)=> JSX.Element)(this.registerHandle) :
            this.props.children;
        const classes = this.props.classes;
        return (
            <TKUISlideUp
                {...this.props.slideUpOptions}
                containerClass={classes.modalContainer}
                onDrag={() => {
                    this.setState({freezeCarousel: true});
                }}
                onDragEnd={() => {
                    this.setState({freezeCarousel: false});
                }}
                handleRef={this.props.selected !== undefined && this.state.handles.get(this.props.selected)}
                parentElement={this.props.parentElement}
            >
                <div className={classNames(classes.main,
                    children && Array.isArray(children) && children.length > 12 && classes.lotOfPages)}>
                    <Carousel
                        showStatus={false}
                        showThumbs={false}
                        showArrows={this.props.showControls !== undefined ? this.props.showControls : !DeviceUtil.isTouch()}
                        showIndicators={this.props.showControls}
                        transitionTime={500}
                        selectedItem={this.props.selected}
                        onChange={(selected: number) => {
                            this.props.onChange && this.props.onChange(selected);
                            this.setState({hideOtherPages: false});
                            setTimeout(() => this.setState({hideOtherPages: true}), 1000);
                        }}
                        // emulateTouch={true}
                        swipeable={this.props.swipeable !== false && !this.state.freezeCarousel}
                        useKeyboardArrows={DeviceUtil.isDesktop}
                    >
                        {React.Children.map(children, (child: any, i: number) =>
                            <div className={classNames(classes.pageWrapper,
                                i !== this.props.selected && this.state.hideOtherPages && classes.hidden)} key={i}>
                                {child}
                            </div>
                        )}
                    </Carousel>
                </div>
            </TKUISlideUp>
        );
    }

    componentDidMount() {
        WaiAriaUtil.apply(".carousel-root", {tabIndex: -1});
        WaiAriaUtil.applyToAll(".control-arrow", {tabIndex: -1, ariaHidden: true});
        WaiAriaUtil.applyToAll(".dot", {tabIndex: -1, ariaHidden: true});
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => {
                return children!({...inputProps, ...viewportProps});
            }}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUICardCarousel, config, Mapper);