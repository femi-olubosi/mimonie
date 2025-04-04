const { Expo } = require('expo-server-sdk');
let expo = new Expo();


const pushNotification = {
      async sendNotification(pushToken, title, body, data = {}){
          if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return;
          }
        
          const message = {
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
          };
        
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync([message]);
            console.log('Notification sent:', ticketChunk);
          } catch (error) {
            console.error('Error sending notification:', error);
          }
      }
}

module.exports = pushNotification;