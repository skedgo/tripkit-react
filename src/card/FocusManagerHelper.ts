/**
 * Got from here: https://github.com/reactjs/react-modal/blob/master/src/helpers/focusManager.js
 */

const focusLaterElements: any[] = [];
let modalElement: any = null;
let needToFocus = false;

export function handleBlur() {
    needToFocus = true;
}

export function handleFocus() {
    if (needToFocus) {
        needToFocus = false;
        if (!modalElement) {
            return;
        }
        // need to see how jQuery shims document.on('focusin') so we don't need the
        // setTimeout, firefox doesn't support focusin, if it did, we could focus
        // the element outside of a setTimeout. Side-effect of this implementation
        // is that the document.body gets focus, and then we focus our element right
        // after, seems fine.
        setTimeout(() => {
            if (!modalElement || modalElement!.contains(document.activeElement)) {
                return;
            }
            const el = findTabbableDescendants(modalElement)[0] || modalElement;
            el.focus();
        }, 0);
    }
}

export function markForFocusLater() {
    focusLaterElements.push(document.activeElement);
}

/* eslint-disable no-console */
export function returnFocus(preventScroll = false) {
    let toFocus: any = null;
    try {
        if (focusLaterElements.length !== 0) {
            toFocus = focusLaterElements.pop();
            toFocus.focus({ preventScroll });
        }
        return;
    } catch (e) {
        console.warn(
            [
                "You tried to return focus to",
                toFocus,
                "but it is not in the DOM anymore"
            ].join(" ")
        );
    }
}
/* eslint-enable no-console */

export function popWithoutFocus() {
    focusLaterElements.length > 0 && focusLaterElements.pop();
}

export function setupScopedFocus(element) {
    modalElement = element;

    if (window.addEventListener) {
        window.addEventListener("blur", handleBlur, false);
        document.addEventListener("focus", handleFocus, true);
    } else {
        (window as any).attachEvent("onBlur", handleBlur);
        (document as any).attachEvent("onFocus", handleFocus);
    }
}

export function teardownScopedFocus() {
    modalElement = null;

    if (window.addEventListener) {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("focus", handleFocus);
    } else {
        (window as any).detachEvent("onBlur", handleBlur);
        (document as any).detachEvent("onFocus", handleFocus);
    }
}

/*!
 * Adapted from jQuery UI core
 *
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */

const tabbableNode = /input|select|textarea|button|object/;

function hidesContents(element) {
    const zeroSize = element.offsetWidth <= 0 && element.offsetHeight <= 0;

    // If the node is empty, this is good enough
    if (zeroSize && !element.innerHTML) return true;

    // Otherwise we need to check some styles
    const style = window.getComputedStyle(element);
    return zeroSize
        ? style.getPropertyValue("overflow") !== "visible" ||
        // if 'overflow: visible' set, check if there is actually any overflow
        (element.scrollWidth <= 0 && element.scrollHeight <= 0)
        : style.getPropertyValue("display") == "none";
}

function visible(element) {
    let parentElement = element;
    while (parentElement) {
        if (parentElement === document.body) break;
        if (hidesContents(parentElement)) return false;
        parentElement = parentElement.parentNode;
    }
    return true;
}

function focusable(element, isTabIndexNotNaN) {
    const nodeName = element.nodeName.toLowerCase();
    const res =
        (tabbableNode.test(nodeName) && !element.disabled) ||
        (nodeName === "a" ? element.href || isTabIndexNotNaN : isTabIndexNotNaN);
    return res && visible(element);
}

function tabbable(element) {
    let tabIndex = element.getAttribute("tabindex");
    if (tabIndex === null) tabIndex = undefined;
    const isTabIndexNaN = isNaN(tabIndex);
    return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
}

export default function findTabbableDescendants(element) {
    return [].slice.call(element.querySelectorAll("*"), 0).filter(tabbable);
}
