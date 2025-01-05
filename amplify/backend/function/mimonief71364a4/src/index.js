/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const { processContributions } = require('../../../../../api/payment.service');

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const res = await processContributions();
  return {
    statusCode: 200,

    body: JSON.stringify({
      message: 'Success',
      data: res,
    }),
  };
};

exports.handler.event = {
  schedule: 'cron(5 21 * * ? )',
};
