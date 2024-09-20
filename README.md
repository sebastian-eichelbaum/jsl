# jsl for VUE/JavaScript

A collection of UI components and backend wrappers. Its focus is on Vue, Vuetify and Firebase as backend. Its purpose is to simplify generating a simple, yet good looking, UI in my projects.

> **Warning**
> This library is not actively maintained. It is updated and extended whenever I use it in a project.
>
> So, do not use it in your projects. As with all things JavaScript, it will be deprecated in three days anyways.

## Requirements

-   A working Node JS project.

## Setup

1. Scaffold your base app using some magic tools
1. Install:

    ```sh
    cd myProject
    git submodule add git@github.com:sebastian-eichelbaum/jsl.git ./jsl
    # This installs the lib as local dependency. npm link might also be used.
    npm install ./jsl
    ```

1. Add a Backend. By default, jsl does not install a backend package in its `package.json`. You have to install it in your project:
    - Install according to the backend docs:
    ```sh
    npm install firebase
    # Configure according to google. Create an app and copy the firebase project config.
    # ...
    ```
    - Now you can use `jsl/backends/Firebase`
1. Configure your packager to add some global variables and jsl aliases. An example for `vite.config.js`:

    ```js
    // ...

    // For path.resolve
    import path from "path";

    export default defineConfig({
        plugins: [
            /* ... */
        ],
        define: {
            // ...

            // Provide the package app version
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        },
        resolve: {
            alias: {
                // ...
                "@": path.resolve(__dirname, "./src"),

                // JSL aliases:
                "@jsl": path.resolve(__dirname, "./jsl/src"),
                "@jslassets": path.resolve(__dirname, "./jsl/assets"),
                "@jsllocales": path.resolve(__dirname, "./jsl/locales"),

                // Global asset alias
                "@assets": path.resolve(__dirname, "./assets"),
            },
        },
    });
    ```

    **Hint:** for electron apps, repeat this for main and preload.

## Recipes

### App Boilerplate

-   Ensure your `index.html` contains a div with id `#app`. This was created by your scaffolding tool.
-   Create a **new** `src/App.vue`:

    ```html
    <template>
        <App>Hello!</App>
    </template>

    <script setup>
        import App from "@jsl/App.vue";
    </script>
    ```

-   Create a **new** `src/main.js`:

    ```js
    import { run } from "@jsl/App";

    // Import your main app component
    import App from "./App.vue";

    // Use all the boilerplate magic in jsl to bring up the app. This can either be a function that returns a config or the
    // config directly. Refer to @see @jsl/App on how to configure it.
    run(async (_) => {
        return {
            // Configure Vue3 itself. Tell vue which component to use.
            vue: {
                // Which component is the main (entry point component)?
                mainComponent: App,

                // Additional properties of your App.vue
                // props: {},

                // Called before mount. This allows you to add more vue plugins as needed.
                // onSetup: (app) => {
                //     app.use(createPinia());
                // },
            },

            // See @jsl/App for all the config options. A lot of these config options only make sense, once you use the jsl
            // vue components and backend wrappers.
            // Check: platform, appConfig, backend, localization, vuetify, ...
        };
    });
    ```

*   Congratulations. You have a basic app up and running. But it is boring. Check out the other recipies and the [jsl components](src/components), [backend wrappers](src/backends), and more. Most of the things are well documented, including some usage examples.

### Loading Spinner

-   Edit your `index.html`:

    ```html
    <body>
        <!-- Add this to ensure there is a nice spinner overlay until everything is loaded and started. -->
        <script type="module">
            import InitOverlay from "@jsl/InitOverlay.js";
            // Use the default. This loads either bright or dark mode, depending on the user's preference
            InitOverlay.inject();

            // OR: specify your own
            InitOverlay.inject({
                // Refer to InitOverlay.js for more details.
                // You can either set dark:true/false to force dark/bright mode or set the colors manually.
                background: "rgb(100,0,0)",
                spinnerBackground: "rgba(50, 50, 50, 1)",
                spinnerColor: "#ccc",
            });
        </script>

        ...
    </body>
    ```

-   When using the jsl App.vue component, the overlay hides on mount.

    ```html
    <template>
        <App>...</App>
    </template>
    <script setup>
        import App from "@jsl/App.vue";
        // ...
    </script>
    ```

-   To hide the spinner when done via JavaScript:
    ```js
    import InitOverlay from "@jsl/InitOverlay";
    InitOverlay.hide();
    ```
