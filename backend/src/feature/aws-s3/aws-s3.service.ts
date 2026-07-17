import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { s3Client } from "./aws-s3.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Service for handling AWS S3 operations including file uploads, retrieval, and deletion.
 */
@Injectable()
export class AwsS3Service {
    /**
     * Name of the S3 bucket to operate on.
     */
    private readonly bucketName = process.env.AWS_S3_BUCKET_NAME

    /**
     * Uploads a file from Multer request to the S3 bucket.
     * @param file - The uploaded file object from Multer (contains buffer, mimetype, and other metadata).
     * @param key - The S3 object key/path where the file will be stored.
     * @returns The S3 object key confirming successful upload.
     */
    async uploadFile(file: Express.Multer.File, key: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype, 
        })

        await s3Client.send(command)
        return key
    }

    /**
     * Generates a time-limited signed URL for accessing an S3 object.
     * @param key - The S3 object key/path of the file to retrieve.
     * @returns A pre-signed URL valid for 1 hour that can be used to access the file directly from S3.
     */
    async getFileUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return signedUrl
    }

    /**
     * Deletes a file from the S3 bucket.
     * @param key - The S3 object key/path of the file to delete.
     */
    async deleteFile(key: string) {
        const command = new DeleteObjectCommand ({
            Bucket: this.bucketName,
            Key: key
        })
        await s3Client.send(command)
    }

    /**
     * Uploads a PDF buffer directly to the S3 bucket.
     * @param buffer - The binary content of the PDF file as a Buffer.
     * @param key - The S3 object key/path where the PDF will be stored.
     * @returns The S3 object key confirming successful upload.
     */
    async uploadPdfBuffer(buffer: Buffer, key: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'application/pdf'
        })

        await s3Client.send(command)
        return key
    }
}