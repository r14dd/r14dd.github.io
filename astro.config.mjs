// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: "https://riad.cc",
    output: "static",
    build: {
        // Inline all CSS into the HTML <head> instead of an external
        // stylesheet. CSS then always arrives with the document, so the
        // page can never render unstyled (no FOUC) if the separate CSS
        // request stalls or a stale HTML points at a rotated CSS hash.
        inlineStylesheets: "always",
    },
});
