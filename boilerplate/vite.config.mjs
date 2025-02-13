import _ from "lodash";
import path from "path";
import fs from "fs";

// ATTENTION: To utilize this boilerplate:
//
// npm install --save-dev vite-plugin-vuetify
// npm install --save-dev "@vitejs/plugin-vue"

import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

import { defineConfig as viteDefineConfig } from "vite";

// Integrate .env dotfile vars
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

// The defined/injected variables, common to all jsl based apps
const commonDefines = {
    // The package name as defined in the package json during build
    __APP_NAME__: JSON.stringify(process.env.npm_package_name || ""),

    // Provide the package app version
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),

    // Pick-up the env var "APP_CUSTOMIZATION_ID" to make specific builds
    __APP_CUSTOMIZATION_ID__: JSON.stringify(process.env.APP_CUSTOMIZATION_ID || ""),
};

// https://vitejs.dev/config/
export const defaultConfig = {
    plugins: [
        // Mandatory
        vue(),
        // Useful?
        vuetify({
            // If the user created this file, use it as config file in vuetify. It allows to override those vuetify
            // variables.
            styles: fs.existsSync("./src/vuetify-settings.scss")
                ? {
                      // Ensures that you can override those vite variables. Generate a file
                      // vuetify-settings.scss:
                      // Fill with
                      // @use "vuetify/settings" with (
                      //     $tooltip-background-color: #ff0000
                      //);
                      configFile: "./src/vuetify-settings.scss",
                  }
                : undefined,
        }),
    ],
    define: commonDefines,
    resolve: {
        alias: {},
    },
};

/**
 * Generate a proper vite config by merging the default jsl config with your custom configs
 *
 * @param {Object} configs - List of configs to merge
 * @returns {Object} The vite config
 */
export function defineConfig(...configs) {
    const mergedCfg = _.mergeWith(
        defaultConfig,
        ...configs,

        (objValue, srcValue) => {
            if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        },
    );

    return viteDefineConfig(mergedCfg);
}

/**
 * Generate an Electron vite config for the main process and extend the defaults with the given overrides.
 */
export function makeMainConfig(config = {}) {
    return viteDefineConfig(
        _.merge(
            {
                define: commonDefines,
                resolve: {
                    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
                    browserField: false,
                    conditions: ["node"],
                    mainFields: ["module", "jsnext:main", "jsnext"],
                    alias: {
                        // "@": path.resolve(__dirname, "./src"),
                    },
                },
            },
            config || {},
        ),
    );
}

/**
 * Generate an Electron vite config for the render process and extend the defaults with the given overrides.
 */
export function makeRendererConfig(config = {}) {
    // The render process is the same as the standard web build.
    // NOTE: defineConfig automatically merges with defaultConfig
    return defineConfig(config || {});
}

/**
 * Generate an Electron preload vite config and extend the defaults with the given overrides.
 */
export function makePreloadConfig(config = {}) {
    // NOTE: defineConfig automatically merges with defaultConfig. This is not wanted here.
    return viteDefineConfig(
        _.merge(
            {
                define: commonDefines,
            },
            config || {},
        ),
    );
}
