import {JsonObject, JsonProperty} from "json2typescript";
import Util from "../../util/Util";
import Color, { ColorI } from "./Color";

/**
 * This interface matches the api model, so the property names should match the names specified by @JsonProperty tags in the class.
 * Notice the fromJSON creates a ModeInfo instance by deserializing a json matching ModeInfoI.
 * To keep that correlation maybe do something like with ColorI and Color (Color.ts).
 */
export interface ModeInfoI {
    identifier?: string;
    alt: string;
    description: string;
    localIcon: string;
    remoteIcon?: string;
    remoteDarkIcon?: string;
    color?: ColorI;
}
@JsonObject
class ModeInfo implements ModeInfoI {

    public static fromJSON(json: ModeInfoI): ModeInfo {
        return Util.deserialize(json, ModeInfo);
    }

    /**
     * Missing for stationary segments.
     */
    @JsonProperty("identifier", String, true)
    public readonly identifier: string | undefined = undefined;

    /**
     * Textual alternative to icon. Required.
     */
    @JsonProperty("alt", String) 
    public readonly alt: string = "";

    /**
     * Name of the mode (localized) or product.
     */
    @JsonProperty("description", String, true)
    public readonly description: string = "";

    /**
     * Part of icon file name that should be shipped with app. Required.
     */
    @JsonProperty("localIcon", String, true) 
    public localIcon: string = "";

    /**
     * Part of icon file name that can be fetched from server.
     */
    @JsonProperty("remoteIcon", String, true) 
    public readonly remoteIcon: string | undefined = undefined;

    /**
     * Part of icon file name for dark background that can be fetched from server.
     */
    @JsonProperty("remoteDarkIcon", String, true) 
    public readonly remoteDarkIcon: string | undefined = undefined;

    @JsonProperty("color", Color, true) private 
    public readonly color: Color | undefined = undefined;

    /**
     * Whether the remote icon is a representing the brand not the mode. 
     * If this is true it's a good idea to show the brand icon plus an icon indicating the mode.
     */
    @JsonProperty("remoteIconIsBranding", Boolean, true) 
    public readonly remoteIconIsBranding: boolean = false;    

    public isBicycle(): boolean {
        return !!(this.identifier?.startsWith("cy_bic") || this.identifier?.startsWith("me_mic_bic"));
    }
}

export default ModeInfo;