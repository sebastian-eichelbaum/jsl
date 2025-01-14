import _ from "lodash";
import path from "path";
import fs from "fs";

import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

import { defineConfig as viteDefineConfig } from "vite";

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
    define: {
        // Provide the package app version
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),

        // Pick-up the env var "APP_CUSTOMIZATION_ID" to make specific builds
        __APP_CUSTOMIZATION_ID__: JSON.stringify(process.env.APP_CUSTOMIZATION_ID || ""),
    },
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
