"use client";

import { useEffect } from "react";

export function PWAInit() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => console.log("Scope: ", registration.scope))
                .catch((err) => console.log("SW Registration Failed: ", err));
        }
    }, []);

    return null;
}
