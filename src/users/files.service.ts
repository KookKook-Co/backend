import * as AWS from 'aws-sdk';

export interface IFileService {
    uploadFile(file: any, name: string): Promise<string>;
    getFile(name: string): string;
}

// TODO implement real file service with S3
export class FileService implements IFileService {
    private BUCKET_ID: string;
    private BUCKET_SECRET: string;
    private BUCKET_NAME: string;
    private s3: AWS.S3;
    constructor() {
        this.BUCKET_ID = process.env.BUCKET_ID;
        this.BUCKET_SECRET = process.env.BUCKET_SECRET;
        this.BUCKET_NAME = process.env.BUCKET_NAME;
        this.s3 = new AWS.S3({
            accessKeyId: this.BUCKET_ID,
            secretAccessKey: this.BUCKET_SECRET,
        });
    }

    uploadFile(file: any, name: string): Promise<string> {
        const params = {
            Bucket: this.BUCKET_NAME,
            Key: name,
            Body: file,
            ACL: 'public-read-write',
        };
        return new Promise((resolve, reject) => {
            this.s3.upload(params, function(err: any, data: any) {
                if (err) {
                    return reject(err);
                }
                return resolve(
                    'https://' + this.BUCKET_NAME + '.s3.amazonaws.com/' + name,
                );
            });
        });
    }

    getFile(name: string) {
        return 'https://' + this.BUCKET_NAME + '.s3.amazonaws.com/' + name;
    }
}
