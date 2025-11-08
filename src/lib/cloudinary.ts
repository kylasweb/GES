import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;

/**
 * Upload a file buffer to Cloudinary
 * @param buffer File buffer
 * @param folder Folder path in Cloudinary
 * @param filename Original filename (optional)
 * @returns Upload result with URL
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string = 'uploads',
    filename?: string
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
        };

        if (filename) {
            uploadOptions.public_id = filename.split('.')[0]; // Remove extension
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                    });
                }
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 * @returns Deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url Cloudinary URL
 * @returns Public ID
 */
export function getPublicIdFromUrl(url: string): string {
    // Extract public ID from Cloudinary URL
    // e.g., https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg
    // Returns: folder/image
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : url;
}
