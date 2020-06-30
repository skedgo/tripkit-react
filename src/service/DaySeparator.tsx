import * as React from "react";
import {Moment} from "moment-timezone";
import "./DaySeparator.css";
import DateTimeUtil from "../util/DateTimeUtil";
import {default as DeviceUtil} from "../util/DeviceUtil";
import {black} from "../jss/TKUITheme";

interface IProps {
    date: Moment;
    scrollRef?: any;
    isDark?: boolean;
}

interface IState {
    showOnTop: boolean;
}

class DaySeparator extends React.Component<IProps, IState> {

    private ref: any;
    private hasScrollHandler: boolean = false;


    constructor(props: IProps) {
        super(props);
        this.state = {
            showOnTop: false
        };
    }

    public render(): React.ReactNode {
        const showOnTop = this.state.showOnTop;
        const dayText = this.props.date.calendar(DateTimeUtil.getNow(), {
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'ddd D',
            lastDay: '[Yesterday]',
            lastWeek: 'ddd D',
            sameElse: 'ddd D'
        });
        const daySeparatorStyle = {
            backgroundColor: this.props.isDark ? '#353535' : 'rgb(243, 243, 243)',
            color: black(1, this.props.isDark)
        };
        return (
            [
                <div className={"DaySeparator" + (!showOnTop ? " DaySeparator-rise" : "")}
                     key={"DaySeparator-1"}
                     ref={(ref: any) => this.ref = ref}
                     style={daySeparatorStyle}
                >
                    {dayText}
                    {/*{dayText + " " + Math.floor(this.props.scrollRef.scrollTop!) + (this.ref ? " " + this.ref.offsetTop : "")}*/}
                </div>,
                showOnTop && <div className="DaySeparator DaySeparator-top"
                                  key={"DaySeparator-2"}
                                  style={daySeparatorStyle}
                >
                    {dayText}
                    {/*{dayText + " " + Math.floor(this.props.scrollRef.scrollTop!) + (this.ref ? " " + this.ref.offsetTop : "")}*/}
                </div>
            ]
        );
    }

    private scrollHandler?: () => void;

    public componentDidMount() {
        if (!DeviceUtil.isIOS && !this.hasScrollHandler && this.props.scrollRef) {
            this.scrollHandler = () => {
                const newScrollTop = Math.floor(this.props.scrollRef.scrollTop);
                const showOnTop = this.ref !== undefined && newScrollTop >= this.ref.offsetTop;
                if (this.state.showOnTop !== showOnTop) {
                    this.setState(() => {
                        return {
                            showOnTop: showOnTop,
                        }
                    })
                }
            };
            this.props.scrollRef.addEventListener("scroll", this.scrollHandler);
            this.hasScrollHandler = true;
        }
    }

    public componentWillUnmount() {
        if (this.props.scrollRef && this.scrollHandler) {
            this.props.scrollRef.removeEventListener("scroll", this.scrollHandler);
        }
    }

    // public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
    //     if (!this.hasScrollHandler && this.props.scrollRef) {
    //         this.props.scrollRef.addEventListener("scroll", () => {
    //             const newScrollTop = Math.floor(this.props.scrollRef.scrollTop);
    //             const showOnTop = this.ref !== undefined && newScrollTop >= this.ref.offsetTop;
    //             if (this.state.showOnTop !== showOnTop) {
    //                 this.setState(() => {
    //                     return {
    //                     showOnTop: showOnTop,
    //                 }})
    //             }
    //         });
    //         this.hasScrollHandler = true;
    //     }
    // }
}

export default DaySeparator;