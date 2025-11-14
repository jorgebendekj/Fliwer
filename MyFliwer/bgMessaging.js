import {Platform} from 'react-native'
import firebase from './app/utils/firebase/firebase';

/**
 * this code is resolved in background, so debugger and logs doesn't work here.
 * It's easier to test code somewhere else in foreground and then paste here.
 */

export default async message => {

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        
        console.log("bgMessaging message", message.data);
        
        if (message.data.type != "cancel_notification") {
           
            const smallIcon = '@drawable/notification_icon';

            const groupNotification = new firebase.notifications.Notification()
            .setNotificationId(message.data.groupId)
            .setSubtitle(message.data.groupName) // This is setSubText(..) in Android
            groupNotification
                    .android.setGroup(message.data.groupId)
                    .android.setGroupSummary(true)
                    .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
                    .android.setChannelId(message.data.channelId)
                    .android.setSmallIcon(smallIcon) // Sets small icon to group notification
                    .android.setAutoCancel(true);                
           
            const notification = new firebase.notifications.Notification();
            notification.android
                    .setChannelId(message.data.channelId)
                    .setNotificationId(message.messageId)
                    .setTitle(message.data.title)
                    .setBody(message.data.body)
                    //.setData(message.data)
                    .android.setVisibility(firebase.notifications.Android.Visibility.Public)
                    .android.setBigText(message.data.body)
                    .android.setSmallIcon(smallIcon)
                    .android.setWhen(Date.now())
            
            if (message.data.groupId) {
                notification.android.setGroup(message.data.groupId);
                notification.android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children);
                
            }
            if (message.data.largeIcon) {
                if (message.data.groupId) groupNotification.android.setLargeIcon(message.data.largeIcon);
                notification.android.setLargeIcon(message.data.largeIcon);
            }
            if (message.data.bigPicture) {
                if (message.data.groupId) groupNotification.android.setBigPicture(message.data.bigPicture);
                notification.android.setBigPicture(message.data.bigPicture);
            }
            
            if (message.data.groupId) firebase.notifications().displayNotification(groupNotification)
            firebase.notifications().displayNotification(notification);
            
        } else {
            var cancelIds = JSON.parse(message.data.cancelIds).filter((n) => {
                return n.serviceType == 2;
            });
            for (var i = 0; i < cancelIds.length; i++) {
                firebase.notifications().removeDeliveredNotification(cancelIds[i].idMessage);
            }
        }
    }

    return Promise.resolve();
};
