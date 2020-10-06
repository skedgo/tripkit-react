import React, {useState} from 'react';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import * as CSS from 'csstype';
import {CardPresentation, default as TKUICard, TKUICardClientProps} from "../card/TKUICard";
import {ReactComponent as IconShare} from "../images/ic-share.svg";
import TKUIShareView from "../share/TKUIShareView";
import Util from "../util/Util";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import {cardSpacing} from "../jss/TKUITheme";
import {overrideClass} from "../jss/StyleHelper";

interface IProps {
    title: string;
    link: string | (() => Promise<string>);
    message: string;
    vertical?: boolean;
    buttonType?: TKUIButtonType;
    presentation?: CardPresentation;
    style?: CSS.Properties;
}

const TKUIShareAction: React.SFC<IProps> = (props: IProps) => {
    const [show, setShow] = useState<boolean>(false);
    const [link, setLink] = useState<string | undefined>(typeof props.link === "string" ? props.link : undefined);
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => [
                <TKUIButton text={props.title} icon={<IconShare/>}
                            type={props.buttonType ? props.buttonType :
                                props.vertical ? TKUIButtonType.SECONDARY_VERTICAL : TKUIButtonType.SECONDARY}
                            onClick={() => {
                                setShow(true);
                                Util.isFunction(props.link) &&
                                (props.link as () => Promise<string>)().then((link: string) =>
                                    setLink(link));
                            }}
                            key={"shareActionBtn"}
                            styles={{
                                main: overrideClass(props.style as any)
                            }}
                />,
                show &&
                <TKUICard
                    title={props.title}
                    presentation={props.presentation ? props.presentation :
                        viewportProps.portrait ? CardPresentation.SLIDE_UP : CardPresentation.MODAL}
                    open={true}
                    slideUpOptions={{
                        position: TKUISlideUpPosition.UP,
                        draggable: false,
                        modalUp: {top: cardSpacing(viewportProps.landscape), unit: 'px'}
                    }}
                    onRequestClose={() => setShow(false)}
                    key={"shareActionCard"}
                >
                    <TKUIShareView
                        link={link}
                        customMsg={props.message}
                    />
                </TKUICard>
            ]
            }
        </TKUIViewportUtil>
    );
};

export default TKUIShareAction;