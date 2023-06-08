import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
    region: process.env.AWS_REGION_P as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_P as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_P as string,
    },
});
