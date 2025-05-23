import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIStreetStepDefaultStyle } from "./TKUIStreetStep.css";
import Street, {
    roadTagColor,
    roadTagDisplayS,
    RoadTags,
    StreetInstructions
} from "../model/trip/Street";
import { ReactComponent as IconContinueStraight } from "../images/directions/ic-continue-straight.svg";
import { ReactComponent as IconHeadTowards } from "../images/directions/ic-head-towards.svg"
import { ReactComponent as IconTurnRight } from "../images/directions/ic-turn-right.svg"
import { ReactComponent as IconTurnLeft } from "../images/directions/ic-turn-left.svg"
import { ReactComponent as IconTurnSharplyRight } from "../images/directions/ic-turn-sharply-right.svg"
import { ReactComponent as IconTurnSlightlyRight } from "../images/directions/ic-turn-slightly-right.svg"
import { ReactComponent as IconTurnSharplyLeft } from "../images/directions/ic-turn-sharply-left.svg"
import { ReactComponent as IconTurnSlightlyLeft } from "../images/directions/ic-turn-slightly-left.svg"
import TransportUtil from "./TransportUtil";
import { black, white } from '../jss/TKUITheme';

function roadTagTextColor(tag: RoadTags) {
    return tag === "MAIN-ROAD" || tag === "SIDE-ROAD" ? black() : white();
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    street: Street;
    onClick?: () => void;
}

interface IConsumedProps { }

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIStreetStepDefaultStyle>

export type TKUIStreetStepProps = IProps;
export type TKUIStreetStepStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIStreetStep {...props} />,
    styles: tKUIStreetStepDefaultStyle,
    classNamePrefix: "TKUIStreetStep"
};

function instructionIcon(instruction: StreetInstructions) {
    switch (instruction) {
        case StreetInstructions.CONTINUE_STRAIGHT:
            return <IconContinueStraight />;
        case StreetInstructions.HEAD_TOWARDS:
            return <IconHeadTowards />;
        case StreetInstructions.TURN_RIGHT:
            return <IconTurnRight />;
        case StreetInstructions.TURN_LEFT:
            return <IconTurnLeft />;
        case StreetInstructions.TURN_SLIGHTLY_RIGHT:
            return <IconTurnSlightlyRight />;
        case StreetInstructions.TURN_SLIGHTLY_LEFT:
            return <IconTurnSlightlyLeft style={{ transform: 'scaleX(-1)' }} />;
        case StreetInstructions.TURN_SHARPLY_RIGHT:
            return <IconTurnSharplyRight />;
        case StreetInstructions.TURN_SHARPLY_LEFT:
            return <IconTurnSharplyLeft style={{ transform: 'scaleX(-1)' }} />;
    }
    return <IconContinueStraight />;
}

const TKUIStreetStep: React.FunctionComponent<IProps> = (props: IProps) => {
    const { street, onClick, classes } = props;
    return (
        <div className={classes.main} onClick={onClick}>
            <div className={classes.icon}>
                {instructionIcon(street.instruction)}
            </div>
            <div className={classes.column}>
                {street.metres &&
                    <div className={classes.title}>
                        {TransportUtil.distanceToBriefString(street.metres)}
                    </div>}
                <div className={classes.subtitle}>
                    {"Along " + (street.name || "unnamed street")}
                </div>
                <div className={classes.tags}>
                    {street.roadTags.map((tag, i) =>
                        <div className={classes.tag} style={{ background: roadTagColor(tag), color: roadTagTextColor(tag) }} key={i}>
                            {roadTagDisplayS(tag)}
                        </div>)}
                </div>
            </div>
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIStreetStep, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));