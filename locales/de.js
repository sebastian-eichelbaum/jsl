export const de = {
    iso: "de",
    name: "Deutsch",

    formats: {},

    translations: {
        common: {
            ui: {
                dataPrivacy: "Datenschutz",
                termsAndConditions: "AGB",
                imprint: "Impressum",
                shop: "Shop",
                yes: "Ja",
                no: "Nein",
                settings: "Einstellungen",
                profile: "Profil",
                options: "Optionen",
                abort: "Abbrechen",
                start: "Starten",
                stop: "Stoppen",
                delete: "Löschen",
                download: "Herunterladen",
                play: "Spielen",
                yourX: "Deine {x}",
                project: "Projekt | Projekte",
                app: "App | Apps",
                game: "Spiel | Spiele",
                hardware: "Hardware | Hardware",
                lock: "Sperren",
                unlock: "Entsperren",
                validate: "Validieren",
                unpack: "Entpacken",
                controller: "Controller",
                touch: "Touch",
                object: "Objekt",
                update: "Update",
                later: "Später",
                restart: "Neu starten",
                restartNow: "Jetzt neu starten",
                support: "Support",
                help: "Hilfe",
                visit: "Besuche {what}",
            },
            prompt: {
                areYouSure: "Bist du sicher?",
                areYouSureToQuit: "Bist du sicher, dass du beenden willst?",
                areYouSureToAbort: "Bist du sicher, dass du abbrechen willst?",
                enterUnlockPin: "Sperr-PIN eingeben zum entsperren.",
                enterLockPin: "Neue Sperr-PIN eingeben.",
                updateReadyToInstall:
                    "Ein Update wurde heruntergeladen. Das Update wird nach einem Neustart automatisch installiert.",
            },
            msg: {
                greet: "Hallo {user}",
                todo: "TODO: {what}",
                devhint: "Entwickler Hinweis: {what}",
                sid: "Dieser Teil der Anwendung ist noch in Entwicklung.",
                unknownError: "Unbekannter Fehler. Guru code: {error}.",
                settingsExplanation: "Hier findest du alle Einstellungmöglichkeiten.",
                settingsAndProfileExplanation: "Hier findest du deine Profiloptionen and Einstellungen.",
                unsavedChangesWillBeLost: "Ungespeicherte Änderungen gehen verloren!",
                noDataAvailable: "Keine Daten vorhanden.",
                notInstalled: "Nicht installiert.",
                unattendedModeLock: "Unbeaufsichtigter Modus",
                unattendedModeLockExplanation:
                    "In diesem Modus werden alle administrativen Funktionen, wie das Benutzermenü, das Schließen der App oder das Hinzufügen/Entfernen von Content abgeschalten. Um die Anwendung zu entsperren, muss diese PIN erneut eingegeben werden oder das System neu gestartet werden.",
                unlockFailed: "Entsperren fehlgeschlagen.",
                unlockFailedWrongPin: "@:common.msg.unlockFailed Falsche PIN.",
                updateReadyToInstall: "Update verfügbar",
            },
        },

        form: {
            msg: {
                inputRequired: "Eingabe erforderlich",
                inputInvalidEmail: "Ungültige E-Mail Adresse",
                inputTooLong: "Eingabe zu lang: max. {max} Zeichen",
                inputTooShort: "Eingabe zu kurz: min. {min} Zeichen",
                inputPasswordTooWeak:
                    "Passwort zu schwach: Nutze Groß-/Kleinschreibung, Leerzeichen, Zahlen und Sonderzeichen",
                inputPasswordTooShort: "Passwort zu kurz: Min. {min} Zeichen",
                inputPasswordsDoNotMatch: "Passwort stimmt nicht überein",
                inputBlacklistedChar: "Zeichen nicht erlaubt: {chars}", // "char" is the offending char
                inputNumbersOnly: "Nur Zahlen erlaubt",

                inputNotValidated: "Korigiere die markierten Felder",
            },
            ui: {
                email: "E-Mail",
                password: "Passwort",
                pin: "PIN",
                confirmPassword: "Passwort bestätigen",
                firstname: "Vorname",
                lastname: "Nachame",
                name: "Name",
                company: "Firma",
            },
            prompt: {},
        },

        user: {
            msg: {
                loginFailed: "Anmeldung fehlgeschlagen.",
                signupFailed: "Registrierung fehlgeschlagen.",
                recoverFailed: "Rücksetzen fehlgeschlagen.",
                logoutFailed: "Abmeldung fehlgeschlagen.",

                loginInvalidCredentials: "@:user.msg.loginFailed Ungültige E-Mail oder Passwort.",
                loginUserDisabled: "@:user.msg.loginFailed User is disabled.",
                loginUnknownError: "@:user.msg.loginFailed Unknown error. Guru code: {error}.",

                signupInvalidCredentials: "@:user.msg.signupFailed Ungültige E-Mail oder Passwort.",
                signupEmailInUse: "@:user.msg.signupFailed E-Mail Adresse ist bereits registriert.",
                signupUnknownError: "@:user.msg.signupFailed Unbekannter Fehler. Guru code: {error}.",

                recoverInvalidCredentials: "@:user.msg.recoverFailed Ungültige E-Mail Adresse.",
                recoverUnknownUser: "@:user.msg.recoverFailed Unbekannter Benutzer.",
                recoverUnknownError: "@:user.msg.recoverFailed Unbekannter Fehler. Guru code: {error}.",

                logoutUnknownError: "@:user.msg.logoutFailed Unbekannter Fehler. Guru code: {error}.",
            },
            ui: {
                login: "Anmelden",
                logout: "Abmelden",
                signup: "Registrieren",
                passwordReset: "Passwort zurücksetzen",
                passwordResetLink: "Passwort vergessen?",
                anonymous: "Anonym",
            },
            prompt: {
                login: "Melde dich mit deiner E-Mail Adresse und deinem Passwort an.",
                signup: "Registriere dich ganz einfach mit deiner E-Mail Adresse.",
                passwordReset:
                    "Setze dein Passwort per E-Mail zurück. Folge dazu den Anweisungen in der gesendeten E-Mail.",
                areYouSureToLogout: "Bist du sicher, dass du dich abmelden willst?",
            },
        },
    },
};
