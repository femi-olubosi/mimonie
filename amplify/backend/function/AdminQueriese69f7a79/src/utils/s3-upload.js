const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const uploadsUtils = {
  async getUploadUrl(fileType) {
    const key = `notifications${fileType.split('/')[1]}`;

    const params = new PutObjectCommand({
      Bucket: 'mimonies3storageb7338-dev',
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(s3, params, { expiresIn: 60 * 5 });

    return {
      cover_url: key,
      upload_url: url,
      expiresIn: '5min',
    };
  },
};

module.exports = uploadsUtils;
