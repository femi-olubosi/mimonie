const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const pushNotification = {
  async sendBatch(pushTokens = [], title, body, imageUrl = null, data = {}) {
    // Filter valid Expo tokens
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.warn('No valid Expo push tokens in batch');
      return;
    }

    // Build messages
    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      ...(imageUrl && {
        richContent: {
          image: imageUrl,
        },
      }),
    }));

    // Chunk into max of 100 (Expo limit)
    const chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Sent chunk:', ticketChunk);
      } catch (err) {
        console.error('Expo push error:', err);
      }
    }
  },
};

module.exports = pushNotification;
