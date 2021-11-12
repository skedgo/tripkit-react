import React, {useState, ChangeEvent, useEffect} from 'react';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {CardPresentation, default as TKUICard} from "../../../card/TKUICard";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../../../util/TKUIResponsiveUtil";
import TKUIButton, {TKUIButtonType} from "../../../buttons/TKUIButton";
import {Subtract} from "utility-types";
import {TKUISlideUpOptions} from "../../../card/TKUISlideUp";
import {TGUIFeedbackFormStyle} from "../feedback/TGUIFeedbackForm";
import {tGUILoadTripsViewDefaultStyle} from "./TGUILoadTripsView.css";
import TKStateConsumer from "../../../config/TKStateConsumer";
import {TKState} from "../../../config/TKState";
import Trip from "../../../model/trip/Trip";
import DeviceUtil, {BROWSER} from "../../../util/DeviceUtil";
import {TKError} from "../../../error/TKError";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose: (closeAll: boolean) => void;
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

export const validUrl = (text: string) => {
    const url_pattern = "^https?:\\/\\/[^\\s$.?#].[^\\s]*$";
    const urlRegex = RegExp(url_pattern);
    return urlRegex.test(text);
};

export const loadTripState = (sharedTripJsonUrl: any, tKState: any): Promise<void> => {
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
        }).catch((error: Error) => {
            tKState.onWaitingStateLoad(false,
                new TKError("Error loading trips" + (error.message ? ": " + error.message : ""), error.name, false, error.stack));
        });
};

let inputRef: any = undefined;

const TGUILoadTripsView: React.SFC<IProps> = (props: IProps) => {
    const [tripsUrl, setTripsUrl] = useState<string>("");
    const [tripsUrlError, setTripsUrlError] = useState<string | undefined>(undefined);
    const validateForm = () => {
        let validTripsUrl = true;
        if (tripsUrl === "") {
            setTripsUrlError("Required.");
            validTripsUrl = false;
        }
        // Comment for now since can paste other things now.
        // else if (!validUrl(tripsUrl)) {
        //     setTripsUrlError("Invalid url.");
        //     validTripsUrl = false;
        // }
        return validTripsUrl;
    };

    useEffect(() => {
        if (!navigator.clipboard || !navigator.clipboard.readText || DeviceUtil.browser === BROWSER.SAFARI) {
            setTimeout(() => inputRef && inputRef.focus(), 200);
        } else {
            navigator.clipboard.readText().then(t => {
                setTripsUrl(t);
                inputRef && inputRef.select();
            }).catch((e) => console.log(e));
        }
    }, []);


    const classes = props.classes;
    const placeholder = "Paste trips in JSON format or a url returning trips (either absolute or relative, e.g. starting with routing.json). " +
        "Shortcut to open this dialog: meta key + shift + L.";
    return (
        <TKUICard
            title={"Load trips"}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={props.slideUpOptions}
            onRequestClose={() => props.onRequestClose && props.onRequestClose(false)}
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
                    ref={(ref: any) => inputRef = ref}
                />
                    {tripsUrlError &&
                    <div className={classes.fieldError}>
                        {tripsUrlError}
                    </div>}
                </div>
                <TKUIButton type={TKUIButtonType.PRIMARY} text={"Load"}
                            onClick={() => {
                                if (validateForm()) {
                                    loadTripState(tripsUrl, props.tKState)
                                        .then(() => {
                                            props.onRequestClose(true);
                                            props.tKState.setShowUserProfile(false);
                                        });
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