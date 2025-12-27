import { useAppBridge } from "@shopify/app-bridge-react";
// import { Redirect } from "@shopify/app-bridge/actions"; // Removed v3 action

/**
 * A hook that returns an authenticated fetch function.
 * The returned function adds the session token to the request headers.
 * @returns {Function} authenticatedFetch
 */
export function useAuthenticatedFetch() {
    const app = useAppBridge();

    return async (uri, options) => {
        const headers = {
            ...(options && options.headers),
        };

        // In App Bridge v4, we get the token from the app instance
        const token = await app.idToken();

        headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(uri, {
            ...options,
            headers,
        });

        checkHeadersForReauthorization(response.headers, app);
        return response;
    };
}

function checkHeadersForReauthorization(headers, app) {
    if (headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
        const authUrlHeader = headers.get(
            "X-Shopify-API-Request-Failure-Reauthorize-Url"
        );

        // Initial simple fallback for re-auth redirection
        // In v4, navigation is often handled by the host, but window.open might work for full page redirects
        // or we should use the new navigation API if available.
        // For now, avoiding the crash is priority.

        const url = authUrlHeader || `/api/auth`;

        if (window.top === window.self) {
            window.location.href = url;
        } else {
            // Embedded context - try to break out or use app bridge navigation if possible
            // app.dispatch(...) is not available on the v4 'app' object in the same way
            console.warn("Reauthorization required. Redirecting:", url);
            // Attempt basic redirect, though might be blocked by iframe
            // window.open(url, "_top"); 
        }
    }
}
