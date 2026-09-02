const { storage } = require("../config/firebase");
const logger = require("../utils/logger");

class StorageService {
    getBucket() {
        return storage.bucket();
    }

    async uploadFile(fileBuffer, destinationPath, mimeType) {
        try {
            const bucket = this.getBucket();
            const file = bucket.file(destinationPath);
            await file.save(fileBuffer, {
                metadata: { contentType: mimeType }
            });
            await file.makePublic();
            return {
                path: destinationPath,
                publicUrl: `https://storage.googleapis.com/${bucket.name}/${destinationPath}`
            };
        } catch (error) {
            logger.error("Storage upload failed", { error: error.message });
            throw error;
        }
    }

    async deleteFile(destinationPath) {
        try {
            const bucket = this.getBucket();
            const file = bucket.file(destinationPath);
            await file.delete();
            return true;
        } catch (error) {
            logger.error("Storage delete failed", { error: error.message });
            return false;
        }
    }

    async getFileMetadata(destinationPath) {
        try {
            const bucket = this.getBucket();
            const file = bucket.file(destinationPath);
            const [metadata] = await file.getMetadata();
            return metadata;
        } catch (error) {
            logger.error("Storage metadata fetch failed", { error: error.message });
            return null;
        }
    }
}

module.exports = new StorageService();

