export const en = {
    iso: "en",
    name: "English",

    formats: {},

    translations: {
        common: {
            ui: {
                dataPrivacy: "Data Privacy",
                termsAndConditions: "Terms and Conditions",
                imprint: "Imprint",
                shop: "Shop",
                yes: "Yes",
                no: "No",
                settings: "Settings",
                profile: "Profile",
                options: "Options",
                abort: "Abort",
            },
            prompt: {
                areYouSure: "Are you sure?",
                areYouSureToQuit: "Are you sure you want to quit?",
                areYouSureToAbort: "Are you sure you want to abort?",
            },
            msg: {
                greet: "Hello {user}",
                todo: "TODO: {what}",
                sid: "This part of the application is still in development.",
                devhint: "Developer Hint: {what}",
                unknownError: "Unknown error. Guru code: {error}",
                settingsExplanation: "Here, you will find all settings.",
                settingsAndProfileExplanation: "Here, you will find your profile options and settings.",
                unsavedChangesWillBeLost: "Unsaved changes will be lost!",
                noDataAvailable: "No data available.",
            },
        },

        form: {
            msg: {
                inputRequired: "Input required",
                inputInvalidEmail: "Not a valid Email address",
                inputTooLong: "Input is too long: max {max} characters",
                inputTooShort: "Input is too short: min {min} characters",
                inputPasswordTooWeak: "Password too weak: use mixed case, spaces, numbers and special characters.",
                inputPasswordTooShort: "Password too short: min {min} characters",
                inputPasswordsDoNotMatch: "Passwords do not match",
                inputBlacklistedChar: "Character not allowed: {chars}", // "char" is the offending char
            },
            ui: {
                email: "Email",
                password: "Password",
                confirmPassword: "Confirm password",
                firstname: "First name",
                lastname: "Last name",
                name: "Name",
                company: "Company",
            },
            prompt: {},
        },

        user: {
            msg: {
                loginFailed: "Could not login.",
                signupFailed: "Could not sign up.",
                recoverFailed: "Could not recover.",
                logoutFailed: "Could not logout.",

                loginInvalidCredentials: "@:user.msg.loginFailed Invalid email or password.",
                loginUserDisabled: "@:user.msg.loginFailed User is disabled.",
                loginUnknownError: "@:user.msg.loginFailed Unknown error. Guru code: {error}.",

                signupInvalidCredentials: "@:user.msg.signupFailed Invalid email or password.",
                signupEmailInUse: "@:user.msg.signupFailed Email address is already used.",
                signupUnknownError: "@:user.msg.signupFailed Unknown error. Guru code: {error}.",

                recoverInvalidCredentials: "@:user.msg.recoverFailed Invalid email.",
                recoverUnknownUser: "@:user.msg.recoverFailed Unknown user.",
                recoverUnknownError: "@:user.msg.recoverFailed Unknown error. Guru code: {error}.",

                logoutUnknownError: "@:user.msg.logoutFailed Unknown error. Guru code: {error}.",
            },
            ui: {
                login: "Login",
                logout: "Logout",
                signup: "Sign Up",
                passwordReset: "Reset Password",
                passwordResetLink: "Forgot Password?",
                anonymous: "Anonymous",
            },
            prompt: {
                login: "Login using your Email address and your password.",
                signup: "Sign-up using your Email address.",
                passwordReset: "Reset your password via Email. Follow the instructions in the sent e-mail.",

                areYouSureToLogout: "Are you sure you want to logout?",
            },
        },
    },
};
