import _ from "lodash";

/**
 * Generates a forward prop that takes the value passed by the component user of a named prop an merges it with
 * the defaults defined.
 *
 * This allows to forward props as structs.
 *
 * Usage:
 *
 * In A.vue
 * const props = defineProps({
 *     // Define a prop "background" in A. Provide some defaults.
 *     ...fwdProps("background", { alpha: "0.0", blur: "0px", image: DefaultBackground }),
 *
 *     // ... more
 * });
 *
 * In A.vue <template>
 * // assuming that BackgroundComponent is the final consuming component:
 * <BackgroundComponent v-bind="fwd_background" />
 * // If BackgroundComponent also just forwards, use the usual syntax
 * <BackgroundComponent :background="fwd_background" />
 *
 * In B.vue that uses A
 * <A :background="{alpha: '0', image: myImage}" />
 *
 * @param {String} name The name of the property exported by the component using this
 * @param {Object} defaultValue - The default value.
 *
 * @return
 */
export function fwdProps(name, defaultValue = {}) {
    let result = {};

    if (!(typeof name === "string" || name instanceof String)) {
        throw new Error("Property-name must be a string. Got: " + typeof name);
    }

    if (typeof defaultValue !== "object") {
        throw new Error("Property-default must be an object. Got: " + typeof defaultValue);
    }

    // Generate the property exported to the outside world:
    result[name] = {
        type: Object,
        required: false,
        default: {},
    };

    // Generate the prop that will not be set by the component user. This defines the default.
    result["fwd_" + name] = {
        type: Object,
        required: false,
        // This uses the fact that the default function gets all passed props as parameter. We can merge the given value
        // in the prop "name" with the defaults. The component can just v-bind="fwd_name" to forward everything,
        // properly merged.
        default: (p) => {
            //console.log(p);
            //console.log(p[name]);
            return _.merge(defaultValue, p[name]);
        },
    };

    return result;
}
