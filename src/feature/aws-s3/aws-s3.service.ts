import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { s3Client } from "./aws-s3.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class AwsS3Service {
    private readonly bucketName = process.env.AWS_S3_BUCKET_NAME

    async uploadFile( file: Express.Multer.File, key: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype, 
        })

        await s3Client.send(command)
        return key
    }

    async getFileUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return signedUrl
    }

    async deleteFile(key: string) {
        const command = new DeleteObjectCommand ({
            Bucket: this.bucketName,
            Key: key
        })
        await s3Client.send(command)
    }
}