const overlayHTML = `
<div id="jsl_InitialLoadOverlay">
    <div id="jsl_InitialLoadOverlayLoaderCenter">
        <div id="jsl_InitialLoadOverlayLoaderContent">
            <div id="jsl_InitialLoadOverlayLogo"></div>
            <div id="jsl_InitialLoadOverlayLoader"></div>
        </div>
    </div>
</div>`;

// The style that will be injected. The tags in {} will be replaced. See @see InitOverlay.inject.
const overlayStyle = `
            #jsl_InitialLoadOverlay {
                display: block;
                height: 0%;
                width: 100%;
                position: fixed;
                z-index: 100000;
                left: 0;
                top: 0;

                opacity: 0;

                background-color: {background};
                overflow-x: hidden;
                /* When setting this, keep in mind that you might see the app for a fraction of a second. */
                /* transition: opacity 0.5s; */
            }

            #jsl_InitialLoadOverlayLoaderContent {
                width: 128px;
                height: 128px;
                position: relative;
            }

            #jsl_InitialLoadOverlayLogo {
                width: 64px;
                height: 64px;
                position: absolute;
                top: 32px;
                left: 32px;
            }

            #jsl_InitialLoadOverlayLoader {
                border: 8px solid {spinnerBackground};
                border-top: 8px solid {spinnerColor};
                border-radius: 50%;
                width: 128px;
                height: 128px;
                animation: jsl_InitialLoadOverlaySpin 2s linear infinite;
                box-sizing: border-box;
                position: absolute;
            }

            #jsl_InitialLoadOverlayLoaderCenter {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
            }

            @keyframes jsl_InitialLoadOverlaySpin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
`;

// Handles the overlay created in index.html.
export default class InitOverlay {
    /**
     * Init overlay default config.
     */
    static defaultConfig() {
        return {
            background: "rgba(255, 255, 255, 1)",
            spinnerBackground: "rgba(225, 225, 225, 1)",
            spinnerColor: "rgba(175, 175, 175, 1)",
        };
    }

    /**
     * Inject the global overlay into the DOM at top-level.
     */
    static inject(config = {}) {
        const processedStyle = overlayStyle
            .replace("{background}", config.background || InitOverlay.defaultConfig().background)
            .replace("{spinnerBackground}", config.spinnerBackground || InitOverlay.defaultConfig().spinnerBackground)
            .replace("{spinnerColor}", config.spinnerColor || InitOverlay.defaultConfig().spinnerColor);

        const style = document.createElement("style");
        style.textContent = processedStyle;
        document.head.append(style);

        document.body.innerHTML += overlayHTML;
        // The overlay is not visible by default. Set visible if scripting is possible. If not, the error above
        // will be show.
        document.getElementById("jsl_InitialLoadOverlay").style.height = "100%";
        document.getElementById("jsl_InitialLoadOverlay").style.opacity = 1;
    }

    // Hide the overlay
    static hide() {
        const target = document.getElementById("jsl_InitialLoadOverlay");
        if(!target)
        {
            // Already gone
            return;
        }
        target.addEventListener("transitionend", () => target.remove());
        // To avoid initial flicker, the transition is set when hiding. When set from the beginning, you might
        // see a build up of the app in background for a fraction of a second
        target.style.transition = "opacity 1.0s";
        target.style.opacity = 0;
    }

    // Hide the overlay in ms delay (or the given one)
    static delayedHide(delay = 250) {
        setTimeout(function () {
            InitOverlay.hide();
        }, delay);
    }
}
