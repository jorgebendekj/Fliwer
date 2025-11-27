// Web-compatible shim for ActionSheetIOS
// ActionSheetIOS is iOS-only and doesn't exist in react-native-web

const ActionSheetIOS = {
    showActionSheetWithOptions: (options, callback) => {
        // Fallback to browser's native confirm/alert or a custom modal
        if (options.options && options.options.length > 0) {
            const selected = window.confirm(
                (options.title ? options.title + '\n\n' : '') +
                options.options.map((opt, index) => `${index + 1}. ${opt}`).join('\n') +
                '\n\nPlease select an option (this is a fallback - ActionSheetIOS is iOS-only)'
            );
            if (callback) {
                // Return cancel index if user cancels
                callback(selected ? 0 : (options.cancelButtonIndex || options.options.length - 1));
            }
        }
    },
    showShareActionSheetWithOptions: (options, failureCallback, successCallback) => {
        // Web fallback for share sheet
        if (navigator.share && options.url) {
            navigator.share({
                title: options.subject,
                text: options.message,
                url: options.url
            }).then(() => {
                if (successCallback) successCallback(true, null);
            }).catch(() => {
                if (failureCallback) failureCallback();
            });
        } else {
            if (failureCallback) failureCallback();
        }
    }
};

module.exports = ActionSheetIOS;

