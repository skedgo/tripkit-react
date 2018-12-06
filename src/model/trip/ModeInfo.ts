import {JsonObject, JsonProperty} from "json2typescript";
import Color from "./Color";

@JsonObject
class ModeInfo {

    /**
     * Missing for stationary segments.
     */
    @JsonProperty("identifier", String, true) private _identifier: string | null = null;

    /**
     * Textual alternative to icon. Required.
     */
    @JsonProperty("alt", String) private _alt: string = "";

    /**
     * Part of icon file name that should be shipped with app. Required.
     */
    @JsonProperty("localIcon", String) private _localIcon: string = "";

    /**
     * Part of icon file name that can be fetched from server.
     */
    @JsonProperty("remoteIcon", String, true) private _remoteIcon: string | null = null;

    /**
     * Part of icon file name for dark background that can be fetched from server.
     */
    @JsonProperty("remoteDarkIcon", String, true) private _remoteDarkIcon: string | null = null;

    @JsonProperty("color", Color, true) private _color: Color | null = null;


    get identifier(): string | null {
        return this._identifier;
    }

    get alt(): string {
        return this._alt;
    }

    get localIcon(): string {
        return this._localIcon;
    }

    get remoteIcon(): string | null {
        return this._remoteIcon;
    }

    get remoteDarkIcon(): string | null {
        return this._remoteDarkIcon;
    }

    get color(): Color | null {
        return this._color;
    }
}

export default ModeInfo;