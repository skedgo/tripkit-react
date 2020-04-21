import Color from "./Color";
declare class ModeInfo {
    /**
     * Missing for stationary segments.
     */
    private _identifier;
    /**
     * Textual alternative to icon. Required.
     */
    private _alt;
    /**
     * Part of icon file name that should be shipped with app. Required.
     */
    private _localIcon;
    /**
     * Part of icon file name that can be fetched from server.
     */
    private _remoteIcon;
    /**
     * Part of icon file name for dark background that can be fetched from server.
     */
    private _remoteDarkIcon;
    private _color;
    get identifier(): string | undefined;
    get alt(): string;
    get localIcon(): string;
    get remoteIcon(): string | undefined;
    get remoteDarkIcon(): string | undefined;
    get color(): Color | undefined;
}
export default ModeInfo;
