import React, { useState } from "react";

export interface IAccessibilityContext {
    /**     
     * @ignore     
     */
    enableTabbingDetection: () => void;
    /**
     * @ignore    
     */
    isUserTabbing: boolean;
}

export const TKAccessibilityContext = React.createContext<IAccessibilityContext>({
    enableTabbingDetection: () => { },
    isUserTabbing: false
});


const TKAccessibilityProvider: React.SFC<{ children: any }> = props => {
    const [isUserTabbing, setUserTabbing] = useState<boolean>(false);
    const enableTabbingDetection = () => {
        window.addEventListener('keydown', handleFirstTab);
        // This breaks WCAG Accessibility Audit chrome plugin, comment to run the tool.
        // TODO: chech if this is still necessary
        document.body.setAttribute("tabindex", "-1");
    }
    const handleFirstTab = (e: any) => {
        if (e.keyCode === 9) {
            setUserTabbing(true);
            window.removeEventListener('keydown', handleFirstTab);
            window.addEventListener('mousedown', handleMouseDownOnce);
        }
    }
    const handleMouseDownOnce = () => {
        setUserTabbing(false);
        window.removeEventListener('mousedown', handleMouseDownOnce);
        window.addEventListener('keydown', handleFirstTab);
    }
    return (
        <TKAccessibilityContext.Provider value={{ enableTabbingDetection, isUserTabbing }}>
            {props.children}
        </TKAccessibilityContext.Provider>
    );
}

export default TKAccessibilityProvider;