import * as React from "react";
import {useState, ChangeEvent, useContext} from 'react';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {TKError, TKUIButtonType} from "../../../index";
import {CardPresentation, default as TKUICard} from "../../../card/TKUICard";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../../../util/TKUIResponsiveUtil";
import TKUIButton from "../../../buttons/TKUIButton";
import {Subtract} from "utility-types";
import {TKUISlideUpOptions} from "../../../card/TKUISlideUp";
import {TGUIFeedbackFormStyle} from "../feedback/TGUIFeedbackForm";
import {tGUILoadTripsViewDefaultStyle} from "./TGUILoadTripsView.css";
import {ERROR_LOADING_DEEP_LINK} from "../../../error/TKErrorHelper";
import {TKState, default as TKStateConsumer} from "../../../config/TKStateConsumer";
import Trip from "../../../model/trip/Trip";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose: (closeAll?: boolean) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    tKState: TKState;
}

export interface IStyle extends TGUIFeedbackFormStyle {
    main: CSSProps<IProps>;
    fieldError: CSSProps<IProps>;
    content: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TGUILoadTripsViewProps = IProps;
export type TGUILoadTripsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TGUILoadTripsView {...props}/>,
    styles: tGUILoadTripsViewDefaultStyle,
    classNamePrefix: "TGUILoadTripsView"
};

const TGUILoadTripsView: React.SFC<IProps> = (props: IProps) => {
    const [tripsUrl, setTripsUrl] = useState<string>("");
    const [tripsUrlError, setTripsUrlError] = useState<string | undefined>(undefined);

    const loadTripState = (sharedTripJsonUrl): Promise<void> => {
        const tKState = props.tKState;
        tKState.onWaitingStateLoad(true);
        return tKState.onTripJsonUrl(sharedTripJsonUrl)
            .then((trips?: Trip[]) => {
                // Need to use trips from promise since
                // - tKState is old at callback execution, and so also tKState.trips (workaround: useContext hook)
                // - I need to close TGUILoadTripsView right after user clicked load button, and so life cycle is
                //   stopped, not receiving props updates anymore (useContext hook does not resolve this).
                tKState.onWaitingStateLoad(false);
                if (trips && trips.length === 1) {
                    tKState.onTripDetailsView(true);
                }
            })
            .catch((error: Error) => tKState.onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false)));
    };

    const validateForm = () => {
        let validTripsUrl = true;
        if (tripsUrl === "") {
            setTripsUrlError("Required.");
            validTripsUrl = false;
        } else if (!validUrl(tripsUrl)) {
            setTripsUrlError("Invalid url.");
            validTripsUrl = false;
        }
        return validTripsUrl;
    };

    const validUrl = (text: string) => {
        const url_pattern = "^https?:\\/\\/[^\\s$.?#].[^\\s]*$";
        const urlRegex = RegExp(url_pattern);
        return urlRegex.test(text);
    };

    const classes = props.classes;
    const placeholder = "Paste a url returning trips in JSON format";
    return (
        <TKUICard
            title={"Load trips from url"}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={props.slideUpOptions}
            onRequestClose={() => props.onRequestClose()}
        >
            <div className={classes.main}>
                <div className={classes.content}>
                <textarea
                    placeholder={placeholder}
                    className={classes.msgTextArea}
                    value={tripsUrl}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        setTripsUrl(e.target.value);
                        if (tripsUrlError) {
                            setTripsUrlError(undefined);
                        }
                    }}
                />
                    {tripsUrlError &&
                    <div className={classes.fieldError}>
                        {tripsUrlError}
                    </div>}
                </div>
                <TKUIButton type={TKUIButtonType.PRIMARY} text={"Load"}
                            onClick={() => {
                                if (validateForm()) {
                                    loadTripState(tripsUrl);
                                        // .then(() => props.onRequestClose(true));
                                    props.onRequestClose(true);
                                }
                            }}
                />
            </div>
        </TKUICard>
    )
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKStateConsumer>
            {(state: TKState) =>
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) => children!({...inputProps, ...viewportProps, tKState: state})}
                </TKUIViewportUtil>
            }
        </TKStateConsumer>;

export default connect(() => undefined, config, Mapper);