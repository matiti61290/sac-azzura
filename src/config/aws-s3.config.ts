import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region:'eu-west-3',
    credentials: {
        accessKeyId:  process.env.AWS_ACCESS_KEY || 'cle',
        secretAccessKey:process.env.AWS_SECRET_KEY || 'cle'
    },
})