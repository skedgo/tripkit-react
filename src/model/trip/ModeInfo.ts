import {JsonObject, JsonProperty} from "json2typescript";
import Color from "./Color";

@JsonObject
class ModeInfo {

    /**
     * Missing for stationary segments.
     */
    @JsonProperty("identifier", String, true) private _identifier: string | undefined = undefined;

    /**
     * Textual alternative to icon. Required.
     */
    @JsonProperty("alt", String) private _alt: string = "";

    /**
     * Name of the mode (localized) or product.
     */
    @JsonProperty("description", String, true)
    public description: string = "";

    /**
     * Part of icon file name that should be shipped with app. Required.
     */
    @JsonProperty("localIcon", String) public localIcon: string = "";

    /**
     * Part of icon file name that can be fetched from server.
     */
    @JsonProperty("remoteIcon", String, true) private _remoteIcon: string | undefined = undefined;

    /**
     * Part of icon file name for dark background that can be fetched from server.
     */
    @JsonProperty("remoteDarkIcon", String, true) private _remoteDarkIcon: string | undefined = undefined;

    @JsonProperty("color", Color, true) private _color: Color | undefined = undefined;

    /**
     * Whether the remote icon is a representing the brand not the mode. 
     * If this is true it's a good idea to show the brand icon plus an icon indicating the mode.
     */
    @JsonProperty("remoteIconIsBranding", Boolean, true) 
    public remoteIconIsBranding: boolean = false;


    get identifier(): string | undefined {
        return this._identifier;
    }

    get alt(): string {
        return this._alt;
    }

    get remoteIcon(): string | undefined {
        return this._remoteIcon;
    }

    get remoteDarkIcon(): string | undefined {
        return this._remoteDarkIcon;
    }

    get color(): Color | undefined {
        return this._color;
    }

    public isBicycle(): boolean {
        return !!(this.identifier?.startsWith("cy_bic") || this.identifier?.startsWith("me_mic_bic"));
    }
}

export default ModeInfo;