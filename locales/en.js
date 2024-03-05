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
                back: "Back",
                backToOverview: "Back to the overview",
                start: "Start",
                stop: "Stop",
                delete: "Delete",
                download: "Download",
                play: "Play",
                yourX: "Your {x}",
                project: "Project | Projects",
                app: "App | Apps",
                game: "Game | Games",
                hardware: "Hardware | Hardware",
                lock: "Lock",
                unlock: "Unlock",
                validate: "Validate",
                unpack: "Unpack",
                controller: "Controller",
                touch: "Touch",
                object: "Object",
                update: "Update",
                later: "Later",
                restart: "Restart",
                restartNow: "Restart now",
                support: "Support",
                help: "Help",
                visit: "Visit {what}",
            },
            prompt: {
                areYouSure: "Are you sure?",
                areYouSureToQuit: "Are you sure you want to quit?",
                areYouSureToAbort: "Are you sure you want to abort?",
                enterUnlockPin: "Enter PIN to unlock.",
                enterLockPin: "Enter new PIN to lock.",
                updateReadyToInstall:
                    "An update has been downloaded. The update will be installed automatically upon restart.",
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
                notInstalled: "Not installed.",
                unattendedModeLock: "Unattended Mode Lock",
                unattendedModeLockExplanation:
                    "The lock makes the app suited for unattended use. Once activated, the lock will prevent the use of administrative functions, like the user profile, closing the app, adding/deleting content, and more. To unlock, the PIN has to be entered again or the system has to be restarted.",

                unlockFailed: "Could not unlock.",
                unlockFailedWrongPin: "@:common.msg.unlockFailed Wrong PIN.",
                updateReadyToInstall: "Update available",
            },
        },

        form: {
            msg: {
                inputRequired: "Input required",
                inputInvalidEmail: "Not a valid e-mail address",
                inputTooLong: "Input is too long: max {max} characters",
                inputTooShort: "Input is too short: min {min} characters",
                inputPasswordTooWeak: "Password too weak: use mixed case, spaces, numbers and special characters.",
                inputPasswordTooShort: "Password too short: min {min} characters",
                inputPasswordsDoNotMatch: "Passwords do not match",
                inputBlacklistedChar: "Character not allowed: {chars}", // "char" is the offending char
                inputNumbersOnly: "Character not allowed: Numbers only",

                inputNotValidated: "Correct the highlighted fields",
            },
            ui: {
                email: "E-mail",
                password: "Password",
                pin: "PIN",
                confirmPassword: "Confirm password",
                passwordCurrent: "Current password",
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
                updateFailed: "Update failed.",

                loginInvalidCredentials: "@:user.msg.loginFailed Invalid e-mail or password.",
                loginUserDisabled: "@:user.msg.loginFailed User is disabled.",
                loginUnknownError: "@:user.msg.loginFailed Unknown error. Guru code: {error}.",

                signupInvalidCredentials: "@:user.msg.signupFailed Invalid e-mail or password.",
                signupEmailInUse: "@:user.msg.signupFailed E-mail address is already used.",
                signupUnknownError: "@:user.msg.signupFailed Unknown error. Guru code: {error}.",

                recoverInvalidCredentials: "@:user.msg.recoverFailed Invalid e-mail.",
                recoverUnknownUser: "@:user.msg.recoverFailed Unknown user.",
                recoverUnknownError: "@:user.msg.recoverFailed Unknown error. Guru code: {error}.",

                updateUnknownError: "@:user.msg.updateFailed Unknown error. Guru code: {error}.",
                updateInvalidName: "@:user.msg.updateFailed Invalid name.",
                updateInvalidPassword: "@:user.msg.updateFailed Invalid password.",
                updateUnknownUser: "@:user.msg.updateFailed Unknown user.",

                logoutUnknownError: "@:user.msg.logoutFailed Unknown error. Guru code: {error}.",

                recoverMailSent: "We have sent you an e-mail to reset your password.",
            },
            ui: {
                login: "Login",
                logout: "Logout",
                signup: "Sign Up",
                passwordReset: "Reset Password",
                passwordResetLink: "Forgot Password?",
                anonymous: "Anonymous",

                updatePassword: "Change password",
                updateName: "Change name",
                updateEMail: "Change e-mail",
            },
            prompt: {
                login: "Login using your e-mail address and your password.",
                signup: "Sign-up using your e-mail address.",
                passwordReset: "Reset your password via e-mail. Follow the instructions in the sent e-mail.",

                areYouSureToLogout: "Are you sure you want to logout?",

                updatePassword:
                    "Change your password here. Enter your current password for validation. The change will take effect immediately.",
                updateName: "Change your profile-name here. This is the name we use to address you in e-mails.",
                updateEMail:
                    "Change your e-mail addess here. This address will be used for logging in and for communicating with you.",
            },
        },
    },
};
