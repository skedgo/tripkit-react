import * as React from "react";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import * as CSS from 'csstype';
import {CardPresentation, TKUICardClientProps} from "../card/TKUICard";
import TKUIControlsCard from "../card/TKUIControlsCard";
import {ReactComponent as IconShare} from "../images/ic-share.svg";
import TKUIShareView from "../share/TKUIShareView";
import Util from "../util/Util";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";

interface IProps {
    title: string;
    link: string | (() => Promise<string>);
    message: string;
    vertical?: boolean;
    presentation?: CardPresentation;
    style?: CSS.Properties;
}

class TKUIShareAction extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <TKUIControlsCard>
                {(setProps: (props: TKUICardClientProps) => void) => {
                    return <TKUIViewportUtil>
                        {(viewportProps: TKUIViewportUtilProps) =>
                            <TKUIButton text={this.props.title} icon={<IconShare/>}
                                        type={this.props.vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                                        onClick={() => {
                                            setProps({
                                                title: this.props.title,
                                                presentation: this.props.presentation ? this.props.presentation :
                                                    viewportProps.portrait ? CardPresentation.SLIDE_UP : CardPresentation.MODAL,
                                                children:
                                                    <TKUIShareView
                                                        link={typeof this.props.link === "string" ? this.props.link : undefined}
                                                        customMsg={this.props.message}
                                                    />,
                                                open: true,
                                                slideUpOptions: {
                                                    position: TKUISlideUpPosition.UP,
                                                    draggable: false
                                                },
                                                onRequestClose: () => {
                                                    setProps({
                                                        open: false
                                                    })
                                                }
                                            });
                                            Util.isFunction(this.props.link) &&
                                            (this.props.link as () => Promise<string>)().then((link: string) =>
                                                setProps({
                                                    children:
                                                        <TKUIShareView
                                                            link={link}
                                                            customMsg={""}
                                                        />
                                                })
                                            );
                                        }}
                                        key={"shareActionBtn"}
                            />
                        }
                    </TKUIViewportUtil>
                }}
            </TKUIControlsCard>
        );
    }
}

export default TKUIShareAction;