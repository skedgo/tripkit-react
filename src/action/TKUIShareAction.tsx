import * as React from "react";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import * as CSS from 'csstype';
import {CardPresentation, TKUICardClientProps} from "../card/TKUICard";
import {ReactComponent as IconShare} from "../images/ic-share.svg";
import TKUIShareView from "../share/TKUIShareView";
import Util from "../util/Util";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import TKUIRendersCard from "../card/TKUIRendersCard";
import {cardSpacing} from "../jss/TKUITheme";

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
            <TKUIRendersCard>
                {(renderCard: (props: TKUICardClientProps, id: any) => void) =>
                    <TKUIViewportUtil>
                        {(viewportProps: TKUIViewportUtilProps) =>
                            <TKUIButton text={this.props.title} icon={<IconShare/>}
                                        type={this.props.vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                                        onClick={() => {
                                            const cardProps = {
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
                                                    draggable: false,
                                                    modalUp: {top: cardSpacing(viewportProps.landscape), unit: 'px'},
                                                },
                                                onRequestClose: () =>
                                                    renderCard({
                                                        ...cardProps,
                                                        open: false
                                                    }, this)
                                            };
                                            renderCard(cardProps, this);
                                            Util.isFunction(this.props.link) &&
                                            (this.props.link as () => Promise<string>)().then((link: string) =>
                                                renderCard({
                                                    ...cardProps,
                                                    children:
                                                        <TKUIShareView
                                                            link={link}
                                                            customMsg={""}
                                                        />
                                                }, this)
                                            );
                                        }}
                                        key={"shareActionBtn"}
                            />
                        }
                    </TKUIViewportUtil>
                }
            </TKUIRendersCard>
        );
    }
}

export default TKUIShareAction;