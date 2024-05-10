import Location, { AutocompleteStructuredFormatting } from "../model/Location";
import LatLng from "../model/LatLng";
import { TranslationFunction } from "../i18n/TKI18nProvider";

class LocationUtil {
    public static getMainText(loc: Location, t?: TranslationFunction): string {
        // If Google result, this will be equals to `structured_formatting.main_text` (given how the address is set in TKGoogleGeocoder.locationFromAutocompleteResult)        
        if (loc.isCurrLoc() && t) {
            return t("Current.Location");
        }
        if (loc.name) {
            return loc.name;
        }
        const address = loc.address;
        return address ?
            (address.includes(",") ? address.substring(0, address.indexOf(",")) : address) :
            loc.getLatLngDisplayString();
    }

    public static getSecondaryText(loc: Location): string | undefined {
        const address = loc.address;
        if (loc.name && address && !address.includes(loc.name)) {
            return address;
        }
        return address && address.includes(",") ? address.substring(address.indexOf(",") + 1).trim() : undefined;
    }

    public static equal<T extends LatLng>(loc1: T | null, loc2: T | null) {
        return loc1 === null ? loc2 === null :
            (loc2 !== null && loc1.getKey() === loc2.getKey());
    }

    public static computeLevenshteinDistance(str1: string, str2: string): number {
        const distance: number[][] = new Array(str1.length + 1);
        for (let i = 0; i < str1.length + 1; i++) {
            distance[i] = new Array(str2.length + 1);
        }
        for (let i = 0; i <= str1.length; i++) {
            distance[i][0] = i;
        }
        for (let j = 1; j <= str2.length; j++) {
            distance[0][j] = j;
        }
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                distance[i][j] = Math.min(
                    distance[i - 1][j] + 1,
                    distance[i][j - 1] + 1,
                    distance[i - 1][j - 1] + ((str1.charAt(i - 1) === str2.charAt(j - 1)) ? 0 : 1));
            }
        }
        return distance[str1.length][str2.length];
    }

    public static relevanceStr(query: string, searchResult: string, options: { preferShorter?: boolean } = {}): number {
        return this.relevance(query, Location.create(LatLng.createLatLng(0, 0), searchResult, "", ""), options);
    }

    public static relevance(query: string, searchResult: Location, options: { preferShorter?: boolean } = {}): number {
        return this.match(query, searchResult, options).relevance;
    }

    public static match(query: string, searchResult: Location, options: { preferShorter?: boolean, fillStructuredFormatting?: boolean } = {}): { relevance: number, structuredFormatting?: AutocompleteStructuredFormatting } {
        const { preferShorter, fillStructuredFormatting } = options;
        const result: { relevance: number, structuredFormatting?: AutocompleteStructuredFormatting } = { relevance: 0, structuredFormatting: undefined };
        try {
            query = query.toLowerCase().trim();
            const mainText = this.getMainText(searchResult);
            const secondaryText = this.getSecondaryText(searchResult);
            const targetMainText = mainText.toLowerCase();
            const targetSecondaryText = secondaryText?.toLowerCase();
            let targetText = targetMainText + (targetSecondaryText ? ", " + targetSecondaryText : "");
            targetText = targetText.toLowerCase();
            if (fillStructuredFormatting) {
                result.structuredFormatting = { main_text: mainText, main_text_matched_substrings: [], secondary_text: secondaryText || "", secondary_text_matched_substrings: [] };
            }
            if (query === targetText) { // query equals to search result
                if (fillStructuredFormatting) {
                    result.structuredFormatting!.main_text_matched_substrings = [{ offset: 0, length: targetMainText.length }];
                    result.structuredFormatting!.secondary_text_matched_substrings = targetSecondaryText ? [{ offset: 0, length: targetSecondaryText.length }] : undefined;
                }
                result.relevance = 1;
                return result;
            }
            if (query === targetMainText) { // query equals to main text
                if (fillStructuredFormatting) {
                    result.structuredFormatting!.main_text_matched_substrings = [{ offset: 0, length: targetMainText.length }];
                }
                result.relevance = .9;
                return result;
            }
            const targetTextWords = targetText.split(" ");
            const mainTextWords = targetMainText.split(" ");
            const secondaryTextWords = targetSecondaryText?.split(" ");
            if (targetText.startsWith(query)) { // main text starts with query
                if (fillStructuredFormatting) {
                    result.structuredFormatting!.main_text_matched_substrings = [{ offset: 0, length: query.length }];
                }
                result.relevance = .8 * (preferShorter ? 40 / (40 + targetTextWords.length) : 1);    // reduce weight if the result is longer (has more words);
                return result;
            }
            let relevance = 0;
            const queryWords = query.split(" ").filter(w => w.length > 0);
            for (const queryWord of queryWords) {
                const matchingMainWord = mainTextWords.find(w => w === queryWord) ?? mainTextWords.find(w => w.startsWith(queryWord)) ?? mainTextWords.find(w => w.includes(queryWord));
                if (matchingMainWord) {
                    if (matchingMainWord === queryWord) {
                        relevance += .7 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.main_text_matched_substrings!.push({ offset: targetMainText.indexOf(matchingMainWord), length: queryWord.length });
                        }
                    } else if (matchingMainWord.startsWith(queryWord)) {
                        relevance += .6 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.main_text_matched_substrings!.push({ offset: targetMainText.indexOf(matchingMainWord), length: queryWord.length });
                        }
                    } else {
                        relevance += .5 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.main_text_matched_substrings!.push({ offset: targetMainText.indexOf(matchingMainWord) + matchingMainWord.indexOf(queryWord), length: queryWord.length });
                        }
                    }
                    mainTextWords.splice(mainTextWords.indexOf(matchingMainWord), 1);
                    continue;
                }
                const matchingSecondaryWord = secondaryTextWords?.find(w => w === queryWord) ?? secondaryTextWords?.find(w => w.startsWith(queryWord)) ?? secondaryTextWords?.find(w => w.includes(queryWord));
                if (matchingSecondaryWord) {
                    if (matchingSecondaryWord === queryWord) {
                        relevance += .4 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.secondary_text_matched_substrings!.push({ offset: targetSecondaryText!.indexOf(matchingSecondaryWord), length: queryWord.length });
                        }
                    } else if (matchingSecondaryWord.startsWith(queryWord)) {
                        relevance += .3 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.secondary_text_matched_substrings!.push({ offset: targetSecondaryText!.indexOf(matchingSecondaryWord), length: queryWord.length });
                        }
                    } else {
                        relevance += .2 / queryWords.length;
                        if (fillStructuredFormatting) {
                            result.structuredFormatting!.secondary_text_matched_substrings!.push({ offset: targetSecondaryText!.indexOf(matchingSecondaryWord) + matchingSecondaryWord.indexOf(queryWord), length: queryWord.length });
                        }
                    }
                    secondaryTextWords!.splice(secondaryTextWords!.indexOf(matchingSecondaryWord), 1);
                    continue;
                }
                let minDistance = Number.MAX_VALUE;
                for (const searchResultWord of targetTextWords) {
                    minDistance = Math.min(minDistance, LocationUtil.computeLevenshteinDistance(queryWord, searchResultWord));
                }
                relevance += .5 / (queryWords.length + minDistance);
            }
            result.structuredFormatting?.main_text_matched_substrings?.sort((s1, s2) => s1.offset - s2.offset);
            if (result.structuredFormatting?.secondary_text_matched_substrings) {
                if (result.structuredFormatting?.secondary_text_matched_substrings.length === 0) {
                    delete result.structuredFormatting.secondary_text_matched_substrings;
                } else {
                    result.structuredFormatting.secondary_text_matched_substrings.sort((s1, s2) => s1.offset - s2.offset);
                }
            }
            result.relevance = relevance * (preferShorter ? 40 / (40 + targetTextWords.length) : 1);
            return result
        } catch (e) {
            console.log(e);
            console.log(result);
            return result;
        }
    }

    private static readonly earthRadius = 6371000;
    private static readonly radians = 3.14159 / 180;

    /* This is the Equirectangular approximation. It's a little slower than the Region.distanceInMetres() formula. */
    public static distanceInMetres(c1: LatLng, c2: LatLng): number {
        let lngDelta = Math.abs(c1.lng - c2.lng);
        if (lngDelta > 180) {
            lngDelta = 360 - lngDelta;
        }
        const p1 = lngDelta * Math.cos(0.5 * this.radians * (c1.lat + c2.lat));
        const p2 = (c1.lat - c2.lat);
        return this.earthRadius * this.radians * Math.sqrt(p1 * p1 + p2 * p2);
    }

    public static standarizeForMatch(text: string): string {
        return text.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');
    }
}

export default LocationUtil;