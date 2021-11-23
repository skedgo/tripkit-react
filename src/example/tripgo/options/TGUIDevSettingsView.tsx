import React, {useState, Dispatch, SetStateAction, useEffect} from 'react';
import {ChangeEvent} from "react";
import {CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../../../util/TKUIResponsiveUtil";
import {tGUIDevSettingsViewDefaultStyle} from "./TGUIDevSettingsView.css";
import TKUICard, {CardPresentation} from "../../../card/TKUICard";
import {TKUISlideUpOptions, TKUISlideUpPosition} from "../../../card/TKUISlideUp";
import TKUISelect, {SelectOption} from "../../../buttons/TKUISelect";
import classNames from "classnames";
import Util from "../../../util/Util";
import {ReactComponent as IconAngleDown} from "../../../images/ic-angle-down.svg";
import {TKUIProfileViewStyle} from "../../../options/TKUIProfileView";
import TGUIEditApiKeyView, {EditResult} from "./TGUIEditApiKeyView";
import TKUISettingSection from "../../../options/TKUISettingSection";
import TKUISettingLink from "../../../options/TKUISettingLink";
import TGUILoadTripsView from "./TGUILoadTripsView";
import TripGoApi from "../../../api/TripGoApi";
import {IOptionsContext, OptionsContext} from "../../../options/OptionsProvider";
import {cardSpacing} from "../../../jss/TKUITheme";
import TKUserProfile from "../../../model/options/TKUserProfile";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    showLoadTrips?: boolean;
    setShowLoadTrips?: Dispatch<SetStateAction<boolean>>;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps, IOptionsContext {}

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
        'production': document.referrer.startsWith("https://tfgm.com") ? 'c923000febe2292c458b4a1ad8ef736b' : '790892d5eae024712cfd8616496d7317',
        'beta': '032de02a53a155f901e6953bcdbf77ad'
    });
}

function getPredefinedServers(): object {
    return ({
        'production': TripGoApi.SATAPP,
        'beta': TripGoApi.SATAPP_BETA
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
    return apiKeys[apiKeyName];
}

export function getServer(userProfile: TKUserProfile): string {
    const customData = userProfile.customData;
    const customServers = customData && customData.servers ? customData.servers : undefined;
    const servers = {
        ...getPredefinedServers(),
        ...customServers
    };
    const serverName = customData && customData.server ? customData.server :
        Object.keys(getPredefinedServers())[0];
    return servers[serverName];
}

let serverOptions: SelectOption[] = [];

const TGUIDevSettingsView: React.SFC<IProps> = (props: IProps) => {
    const [editingKey, setEditingKey] = useState<string | undefined>(undefined);
    const [editingServer, setEditingServer] = useState<string | undefined>(undefined);
    let [showLoadTrips, setShowLoadTrips] = useState<boolean>(false);
    if (props.showLoadTrips !== undefined && props.setShowLoadTrips !== undefined) {
        [showLoadTrips, setShowLoadTrips] = [props.showLoadTrips, props.setShowLoadTrips]
    }

    const classes = props.classes;
    const userProfile = props.userProfile;
    const customData = userProfile.customData;

    const customServers = customData && customData.servers ? customData.servers : undefined;
    const servers = {
        ...getPredefinedServers(),
        ...customServers
    };
    const serverName = customData && customData.server ? customData.server :
        Object.keys(getPredefinedServers())[0];

    // Revert this change, that was done so SelectBox works well with screen readers, since server options
    // needs to be updated after adding / editing a server. TODO: see how to trigger an update int that case.
    // Util.useComponentWillMount(() => {
        serverOptions = Object.keys(servers)
            .map((serverName: string) => ({ value: servers[serverName], label: serverName}))
            .concat([{ value: 'add', label: 'Add...'}]);
    // });

    const ServerOption = (props: any) => {
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
        const editable = data.value !== 'add' && !Object.keys(getPredefinedServers()).includes(data.label);
        return (
            <div ref={innerRef}
                 {...innerProps}
                 className={classNames(classes.apiKeyOption, isSelected && classes.apiKeyOptionSelected,
                     isFocused && classes.apiKeyOptionFocused)}
            >
                {children}
                {editable &&
                <button className={classes.apiKeyEditBtn}
                        onClick={() => setEditingServer(data.label)}
                >
                    Edit
                </button>}
            </div>
        );
    };

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

    const editServer = editingServer !== undefined &&
        <TGUIEditApiKeyView
            title={editingServer === '' ? "New server" : "Edit server"}
            apiKeys={servers}
            editingKey={editingServer}
            nameLabel={"Name"}
            namePlaceholder={"(required)"}
            valueLabel={"Url"}
            valueType={"url"}
            valuePlaceholder={"e.g. http://localhost:8080/satapp-debug (required)"}
            onRequestClose={(result: EditResult, keyUpdate?: {keyName: string, keyValue: string}) => {
                if (result === EditResult.SAVE) {
                    const serversUpdate = {
                        ...customServers
                    };
                    if (editingServer !== '') {
                        delete serversUpdate[editingServer];
                    }
                    let updateValue = keyUpdate!.keyValue;
                    if (updateValue.endsWith("/")) {
                        updateValue = updateValue.slice(0, -1);
                    }
                    serversUpdate[keyUpdate!.keyName] = updateValue;
                    const customDataUpdate = {
                        ...customData,
                        servers: serversUpdate,
                        server: keyUpdate!.keyName
                    };
                    const update = Util.iAssign(userProfile, { customData: customDataUpdate });
                    props.onUserProfileChange(update);
                } else if (result === EditResult.DELETE) {
                    const serversUpdate = {
                        ...customServers
                    };
                    delete serversUpdate[editingServer];
                    const customDataUpdate = {
                        ...customData,
                        servers: serversUpdate,
                        server: Object.keys(getPredefinedServers())[0]
                    };
                    const profileUpdate = Util.iAssign(userProfile, { customData: customDataUpdate });
                    props.onUserProfileChange(profileUpdate);
                }
                setEditingServer(undefined);
            }}
            slideUpOptions={props.slideUpOptions}
        />;

    const editAPIKey = editingKey !== undefined &&
        <TGUIEditApiKeyView
            title={editingServer === '' ? "New API key" : "Edit API key"}
            apiKeys={apiKeys}
            editingKey={editingKey}
            nameLabel={"Name"}
            namePlaceholder={"(required)"}
            valueLabel={"Key"}
            valuePlaceholder={"(required)"}
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
                    const update = Util.iAssign(userProfile, { customData: customDataUpdate });
                    props.onUserProfileChange(update);
                } else if (result === EditResult.DELETE) {
                    const apiKeysUpdate = {
                        ...customApiKeys
                    };
                    delete apiKeysUpdate[editingKey];
                    const customDataUpdate = {
                        ...customData,
                        apiKeys: apiKeysUpdate,
                        apiKey: Object.keys(getPredefinedApiKeys())[0]
                    };
                    const profileUpdate = Util.iAssign(props.userProfile, { customData: customDataUpdate });
                    props.onUserProfileChange(profileUpdate);
                }
                setEditingKey(undefined);
            }}
            slideUpOptions={props.slideUpOptions}
        />;

    useEffect(() => {
        const keyEventListener = (zEvent: any) => {
            if (zEvent.keyCode === 27 && !showLoadTrips) { // Close on escape
                props.onRequestClose && props.onRequestClose();
            }
        };
        document.addEventListener("keydown", keyEventListener);
        return () => {
            document.removeEventListener("keydown", keyEventListener);
        };
    });

    return (
        <TKUICard
            title={"Beta Testing"}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            onRequestClose={() => props.onRequestClose && props.onRequestClose()}
            slideUpOptions={{
                position: TKUISlideUpPosition.UP,
                modalUp: {top: cardSpacing(props.landscape), unit: 'px'},
                draggable: false,
                ...props.slideUpOptions
            }}
        >
            <div className={classes.main}>
                <TKUISettingSection>
                    <div className={classes.checkboxRow}>
                        <div>
                            Server
                        </div>
                        <TKUISelect
                            options={serverOptions}
                            value={serverOptions.find((option: SelectOption) =>
                                editingServer === '' ? option.value === 'add' : option.label === serverName)!}
                            onChange={(option) => {
                                if (option.value === 'add') {
                                    setEditingServer('');
                                    return;
                                }
                                const customDataUpdate = {
                                    ...customData,
                                    server: option.label
                                };
                                const update = Util.iAssign(userProfile, {customData: customDataUpdate});
                                props.onUserProfileChange(update);
                            }}
                            isDisabled={editingServer !== undefined}
                            styles={{
                                main: overrideClass(props.injectedStyles.optionSelect),
                                menu: overrideClass({ marginTop: '2px' })
                            }}
                            components={{
                                IndicatorsContainer: () => <IconAngleDown style={{width: '11px', height: '11px', marginRight: '5px'}}/>,
                                Option: ServerOption
                            }}
                        />
                    </div>
                    {editServer}
                    <div className={classes.checkboxRow}>
                        <div>
                            API key
                        </div>
                        <TKUISelect
                            options={apiKeyOptions}
                            value={apiKeyOptions.find((option: SelectOption) =>
                                editingKey === '' ? option.value === 'add' : option.label === apiKeyName)!}
                            onChange={(option) => {
                                if (option.value === 'add') {
                                    setEditingKey('');
                                    return;
                                }
                                const customDataUpdate = {
                                    ...customData,
                                    apiKey: option.label
                                };
                                const update = Util.iAssign(userProfile, {customData: customDataUpdate});
                                props.onUserProfileChange(update);
                            }}
                            isDisabled={editingKey !== undefined}
                            styles={{
                                main: overrideClass(props.injectedStyles.optionSelect),
                                menu: overrideClass({ marginTop: '2px' })
                            }}
                            components={{
                                IndicatorsContainer: () => <IconAngleDown style={{width: '11px', height: '11px', marginRight: '5px'}}/>,
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
                                props.onRequestClose && props.onRequestClose();
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
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) => children!({...inputProps, ...viewportProps, ...optionsContext})}
                </TKUIViewportUtil>
            }
        </OptionsContext.Consumer>;

export default connect(() => undefined, config, Mapper);