import * as React from "react";
import {ChangeEvent} from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../../../util/TKUIResponsiveUtil";
import {tGUIDevSettingsViewDefaultStyle} from "./TGUIDevSettingsView.css";
import {CardPresentation} from "../../../card/TKUICard";
import {TKUISlideUpOptions} from "../../../card/TKUISlideUp";
import {TKUICard, TKUserProfile} from "../../../index";
import TKUISelect from "buttons/TKUISelect";
import classNames from "classnames";
import Util from "../../../util/Util";
import {ReactComponent as IconAngleDown} from "../../../images/ic-angle-down.svg";
import {TKUIProfileViewStyle} from "../../../options/TKUIProfileView";
import {useState} from 'react';
import {OptionProps} from "react-select";
import TGUIEditApiKeyView, {EditResult} from "./TGUIEditApiKeyView";
import TKUISettingSection from "../../../options/TKUISettingSection";
import TKUISettingLink from "../../../options/TKUISettingLink";
import TGUILoadTripsView from "./TGUILoadTripsView";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void;
    onRequestClose?: (closeAll: boolean) => void;
    slideUpOptions?: TKUISlideUpOptions;
    parentElement?: any;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle extends TKUIProfileViewStyle {
    apiKeyOption: CSSProps<IProps>;
    apiKeyOptionSelected: CSSProps<IProps>;
    apiKeyOptionFocused: CSSProps<IProps>;
    apiKeyEditBtn: CSSProps<IProps>;
}


interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TGUIDevSettingsViewProps = IProps;
export type TGUIDevSettingsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TGUIDevSettingsView {...props}/>,
    styles: tGUIDevSettingsViewDefaultStyle,
    classNamePrefix: "TGUIDevSettingsView"
};

function getPredefinedApiKeys(): object {
    return ({
        'production': '790892d5eae024712cfd8616496d7317',
        'beta': '032de02a53a155f901e6953bcdbf77ad'
    });
}

export function getApiKey(userProfile: TKUserProfile): string {
    const customData = userProfile.customData;
    const customApiKeys = customData && customData.apiKeys ? customData.apiKeys : undefined;
    const apiKeys = {
        ...getPredefinedApiKeys(),
        ...customApiKeys
    };
    const apiKeyName = customData && customData.apiKey ? customData.apiKey :
        Object.keys(getPredefinedApiKeys())[0];
    console.log(apiKeyName);
    return apiKeys[apiKeyName];
}

const TGUIDevSettingsView: React.SFC<IProps> = (props: IProps) => {
    const [editingKey, setEditingKey] = useState<string | undefined>(undefined);
    const [showLoadTrips, setShowLoadTrips] = useState<boolean>(false);
    const classes = props.classes;
    const userProfile = props.value;
    const customData = userProfile.customData;
    const customApiKeys = customData && customData.apiKeys ? customData.apiKeys : undefined;
    const apiKeys = {
        ...getPredefinedApiKeys(),
        ...customApiKeys
    };
    const apiKeyName = customData && customData.apiKey ? customData.apiKey :
        Object.keys(getPredefinedApiKeys())[0];
    const apiKeyOptions = Object.keys(apiKeys)
        .map((apiKeyName: string) => ({ value: apiKeys[apiKeyName], label: apiKeyName}))
        .concat([{ value: 'add', label: 'Add...'}]);

    const ApiKeyOption = (props: any) => {
        const {
            children,
            className,
            cx,
            getStyles,
            isDisabled,
            isFocused,
            isSelected,
            innerRef,
            innerProps,
            data
        } = props;
        const editable = data.value !== 'add' && !Object.keys(getPredefinedApiKeys()).includes(data.label);
        return (
            <div ref={innerRef}
                 {...innerProps}
                 className={classNames(classes.apiKeyOption, isSelected && classes.apiKeyOptionSelected,
                     isFocused && classes.apiKeyOptionFocused)}
            >
                {children}
                {editable &&
                <button className={classes.apiKeyEditBtn}
                        onClick={() => setEditingKey(data.label)}
                >
                    Edit
                </button>}
            </div>
        );
    };

    const editAPIKey = editingKey !== undefined &&
        <TGUIEditApiKeyView
            apiKeys={apiKeys}
            editingKey={editingKey}
            onRequestClose={(result: EditResult, keyUpdate?: {keyName: string, keyValue: string}) => {
                if (result === EditResult.SAVE) {
                    const apiKeysUpdate = {
                        ...customApiKeys
                    };
                    if (editingKey !== '') {
                        delete apiKeysUpdate[editingKey];
                    }
                    apiKeysUpdate[keyUpdate!.keyName] = keyUpdate!.keyValue;
                    const customDataUpdate = {
                        ...customData,
                        apiKeys: apiKeysUpdate,
                        apiKey: keyUpdate!.keyName
                    };
                    const update = Util.iAssign(props.value, { customData: customDataUpdate });
                    props.onChange(update);
                    setEditingKey(undefined);
                } else if (result === EditResult.DELETE) {
                    const apiKeysUpdate = {
                        ...customApiKeys
                    };
                    delete apiKeysUpdate[editingKey];
                    const customDataUpdate = {
                        ...customData,
                        apiKeys: apiKeysUpdate,
                        apiKey: getPredefinedApiKeys()[0]
                    };
                    const profileUpdate = Util.iAssign(props.value, { customData: customDataUpdate });
                    props.onChange(profileUpdate);
                }
                setEditingKey(undefined);
            }}
            slideUpOptions={props.slideUpOptions}
        />;
    return (
        <TKUICard
            title={"Beta Testing"}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            onRequestClose={() => props.onRequestClose && props.onRequestClose(false)}
            slideUpOptions={props.slideUpOptions}
        >
            <div className={classes.main}>
                <TKUISettingSection>
                    <div className={classes.checkboxRow}>
                        <div>
                            API key
                        </div>
                        <TKUISelect
                            options={apiKeyOptions}
                            value={apiKeyOptions.find((option: any) =>
                                editingKey === '' ? option.value === 'add' : option.label === apiKeyName)}
                            onChange={(option) => {
                                if (option.value === 'add') {
                                    setEditingKey('');
                                    return;
                                }
                                const customDataUpdate = {
                                    ...customData,
                                    apiKey: option.label
                                };
                                const update = Util.iAssign(props.value, { customData: customDataUpdate });
                                props.onChange(update);
                            }}
                            isDisabled={editingKey !== undefined}
                            className={classes.optionSelect}
                            menuStyle={{
                                marginTop: '2px',
                            }}
                            renderArrowDown={() => <IconAngleDown style={{width: '11px', height: '11px', marginRight: '5px'}}/>}
                            components={{
                                Option: ApiKeyOption
                            }}
                        />
                    </div>
                    {editAPIKey}
                </TKUISettingSection>
                <TKUISettingSection>
                    <TKUISettingLink
                        text={"Load trips from url"}
                        onClick={() => setShowLoadTrips(true)}
                    />
                    {showLoadTrips &&
                    <TGUILoadTripsView
                        onRequestClose={(closeAll: boolean) => {
                            setShowLoadTrips(false);
                            if (closeAll) {
                                props.onRequestClose && props.onRequestClose(true);
                            }
                        }}
                        slideUpOptions={props.slideUpOptions}
                    />}
                </TKUISettingSection>
            </div>
        </TKUICard>
    );

};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect(() => undefined, config, Mapper);