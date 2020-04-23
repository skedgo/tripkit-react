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
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUICardCarouselDefaultStyle} from "./TKUICardCarousel.css";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    selected?: number;
    onChange?: (selected: number) => void;
    slideUpOptions?: TKUISlideUpOptions;
    children?: any;
}

interface IStyle {
    modalContainer: CSSProps<IProps>;
    main: CSSProps<IProps>;
    lotOfPages: CSSProps<IProps>;
    pageWrapper: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

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
}

class TKUICardCarousel extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            freezeCarousel: false,
            handles: new Map<number, any>()
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
            <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
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
                    >
                        <div className={classNames(classes.main,
                            children && Array.isArray(children) && children.length > 12 && classes.lotOfPages)}>
                            <Carousel
                                showStatus={false}
                                showThumbs={false}
                                showArrows={!DeviceUtil.isTouch()}
                                // showIndicators={!DeviceUtil.isTouch()}
                                transitionTime={500}
                                selectedItem={this.props.selected}
                                onChange={this.props.onChange}
                                // emulateTouch={true}
                                swipeable={!this.state.freezeCarousel}
                                useKeyboardArrows={DeviceUtil.isDesktop}
                            >
                                {React.Children.map(children, (child: any, i: number) =>
                                    <div className={classes.pageWrapper} key={i}>
                                        {child}
                                    </div>
                                )}
                            </Carousel>
                        </div>
                    </TKUISlideUp>
                }
            </TKUIViewportUtil>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUICardCarousel, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));