/**
 * @type {import('@types/aws-lambda').SQSEvent}
 */

const pushNotification = require('./functions/pushNotification');

exports.handler = async (event) => {
  for (const record of event.Records) {
    const request = JSON.parse(record.body);
    console.log('Processing SQS message:', request);

    try {
      const { push_tokens, title, body, imageUrl, data } = request;
      await pushNotification.sendBatch(
        push_tokens,
        title,
        body,
        imageUrl,
        data
      );
    } catch (error) {
      console.error('Failed to process notification batch:', error);
    }
  }
};
