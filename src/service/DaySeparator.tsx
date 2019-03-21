import * as React from "react";
import {Moment} from "moment-timezone";
import "./DaySeparator.css";
import DateTimeUtil from "../util/DateTimeUtil";
import {default as DeviceUtil} from "../util/DeviceUtil";

interface IProps {
    date: Moment;
    scrollRef?: any;
}

interface IState {
    showOnTop: boolean;
}

class DaySeparator extends React.Component<IProps, IState> {

    private ref: any;
    private hasScrollHandler: boolean;


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
        return (
            [
                <div className={"DaySeparator" + (!showOnTop ? " DaySeparator-rise" : "")}
                     key={"DaySeparator-1"}
                     ref={(ref: any) => this.ref = ref}
                >
                    {dayText}
                    {/*{dayText + " " + Math.floor(this.props.scrollRef.scrollTop!) + (this.ref ? " " + this.ref.offsetTop : "")}*/}
                </div>,
                showOnTop && <div className="DaySeparator DaySeparator-top"
                                  key={"DaySeparator-2"}
                >
                    {dayText}
                    {/*{dayText + " " + Math.floor(this.props.scrollRef.scrollTop!) + (this.ref ? " " + this.ref.offsetTop : "")}*/}
                </div>
            ]
        );
    }

    public componentDidMount() {
        if (!DeviceUtil.isIOS && !this.hasScrollHandler && this.props.scrollRef) {
            this.props.scrollRef.addEventListener("scroll", () => {
                const newScrollTop = Math.floor(this.props.scrollRef.scrollTop);
                const showOnTop = this.ref !== undefined && newScrollTop >= this.ref.offsetTop;
                if (this.state.showOnTop !== showOnTop) {
                    this.setState(() => {
                        return {
                            showOnTop: showOnTop,
                        }})
                }
            });
            this.hasScrollHandler = true;
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