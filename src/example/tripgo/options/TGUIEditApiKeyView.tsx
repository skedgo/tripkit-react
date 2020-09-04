import * as React from "react";
import {useState, ChangeEvent} from 'react';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {TKUIButtonType} from "../../../index";
import {CardPresentation, default as TKUICard} from "../../../card/TKUICard";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../../../util/TKUIResponsiveUtil";
import TKUIButton from "../../../buttons/TKUIButton";
import {Subtract} from "utility-types";
import {TKUISlideUpOptions} from "../../../card/TKUISlideUp";
import {tGUIEditApiKeyViewDefaultStyle} from "./TGUIEditApiKeyView.css";
import {TGUIFeedbackFormStyle} from "../feedback/TGUIFeedbackForm";

export enum EditResult {
    SAVE,
    DELETE,
    CANCEL
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    editingKey: string;
    apiKeys: object;
    onRequestClose: (result: EditResult, update?: {keyName: string, keyValue: string}) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle extends TGUIFeedbackFormStyle {
    newApiKey: CSSProps<IProps>;
    newApiKeyRow: CSSProps<IProps>;
    newApiKeyButtons: CSSProps<IProps>;
    fieldError: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TGUIEditApiKeyViewProps = IProps;
export type TGUIEditApiKeyViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TGUIEditApiKeyView {...props}/>,
    styles: tGUIEditApiKeyViewDefaultStyle,
    classNamePrefix: "TGUIEditApiKeyView"
};

const TGUIEditApiKeyView: React.SFC<IProps> = (props: IProps) => {
    const editingKey = props.editingKey;
    const [keyName, setKeyName] = useState(editingKey);
    const [keyNameError, setKeyNameError] = useState<string | undefined>(undefined);
    const apiKeys = props.apiKeys;
    const [keyValue, setKeyValue] = useState(editingKey !== "" ? apiKeys[editingKey] : "");
    const [keyValueError, setKeyValueError] = useState<string | undefined>(undefined);

    const validateForm = () => {
        let validKeyName = true;
        if (keyName === "") {
            setKeyNameError("Required.");
            validKeyName = false;
        } else if (keyName !== editingKey && Object.keys(apiKeys).includes(keyName)) {
            setKeyNameError("API key with this name already exists.");
            validKeyName = false;
        }
        let validKeyValue = true;
        if (keyValue === "") {
            setKeyValueError("Required.");
            validKeyValue = false;
        }
        return validKeyName && validKeyValue;
    };
    const classes = props.classes;
    return (
        <TKUICard
            title={editingKey === '' ? "New API key" : "Edit API key"}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={props.slideUpOptions}
            onRequestClose={() => props.onRequestClose(EditResult.CANCEL)}
        >
            <div className={classes.newApiKey}>
                <div className={classes.row}>
                    <div className={classes.label}>
                        Name:
                    </div>
                    <input className={classes.input}
                           value={keyName}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setKeyName(e.target.value);
                               if (keyNameError) {
                                   setKeyNameError(undefined);
                               }
                           }}
                           placeholder={"(required)"}
                           type="text"
                           spellCheck="false"
                           autoComplete="off"
                           autoCorrect="off"
                           autoCapitalize="off"
                    />
                    {keyNameError&&
                    <div className={classes.fieldError}>
                        {keyNameError}
                    </div>}
                </div>
                <div className={classes.row}>
                    <div className={classes.label}>
                        Key:
                    </div>
                    <input className={classes.input}
                           value={keyValue}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               if (keyValueError) {
                                   setKeyValueError(undefined);
                               }
                               setKeyValue(e.target.value);
                           }}
                           placeholder={"(required)"}
                           type="text"
                           spellCheck="false"
                           autoComplete="off"
                           autoCorrect="off"
                           autoCapitalize="off"
                    />
                    {keyValueError &&
                    <div className={classes.fieldError}>
                        {keyValueError}
                    </div>}
                </div>
                <div className={classes.newApiKeyButtons}>
                    {editingKey !== undefined && editingKey !== '' ?
                        <TKUIButton
                            type={TKUIButtonType.SECONDARY}
                            text={"Delete"}
                            onClick={() => {
                                props.onRequestClose(EditResult.DELETE);
                            }}
                        /> : <div/>}
                    <TKUIButton type={TKUIButtonType.PRIMARY} text={"Save"}
                                onClick={() => {
                                    if (validateForm()) {
                                        props.onRequestClose(EditResult.SAVE, {
                                            keyName: keyName,
                                            keyValue: keyValue
                                        });
                                    }
                                }}
                    />
                </div>
            </div>
        </TKUICard>
    )
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect(() => undefined, config, Mapper);