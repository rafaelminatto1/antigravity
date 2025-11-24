import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiFileSearchService {
    /**
     * Create a new FileSearchStore
     * @param name Display name for the store
     * @returns Store ID
     */
    static async createStore(name: string): Promise<string> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ displayName: name })
                }
            );

            const data = await response.json();
            return data.name; // Returns the store ID
        } catch (error) {
            console.error('Error creating FileSearchStore:', error);
            throw error;
        }
    }

    /**
     * Upload file directly to FileSearchStore
     * @param fileBuffer File buffer
     * @param fileName File name
     * @param mimeType File MIME type
     * @param storeId FileSearchStore ID
     * @returns Upload result with file ID
     */
    static async uploadToStore(
        fileBuffer: ArrayBuffer,
        fileName: string,
        mimeType: string,
        storeId: string
    ): Promise<{ fileId: string; importStatus: string }> {
        try {
            // Create form data for multipart upload
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: mimeType });
            formData.append('file', blob, fileName);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/upload/v1beta/${storeId}/files?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            return {
                fileId: data.file?.name || '',
                importStatus: data.state || 'processing'
            };
        } catch (error) {
            console.error('Error uploading to FileSearchStore:', error);
            throw error;
        }
    }

    /**
     * Perform semantic search using Gemini File Search
     * @param query Search query
     * @param storeId FileSearchStore ID
     * @returns Search results with answer and citations
     */
    static async search(
        query: string,
        storeId: string
    ): Promise<{ answer: string; citations?: any }> {
        try {
            // The SDK's Tool type may not include the fileSearch helper in its typings.
            // Cast the tools array to 'any' to avoid a TypeScript error while keeping runtime behavior.
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                tools: [
                    {
                        // @ts-ignore
                        fileSearch: {
                            fileSearchRetrievalResource: {
                                fileSearchStore: storeId
                            }
                        }
                    }
                ] as any
            });

            const result = await model.generateContent(query);
            const response = result.response;

            return {
                answer: response.text(),
                citations: response.candidates?.[0]?.citationMetadata
            };
        } catch (error) {
            console.error('Error performing search:', error);
            throw error;
        }
    }

    /**
     * List all FileSearchStores
     * @returns Array of stores
     */
    static async listStores(): Promise<any[]> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${process.env.GEMINI_API_KEY}`
            );

            const data = await response.json();
            return data.fileSearchStores || [];
        } catch (error) {
            console.error('Error listing FileSearchStores:', error);
            throw error;
        }
    }

    /**
     * Delete a file from FileSearchStore
     * @param fileId File ID to delete
     */
    static async deleteFile(fileId: string): Promise<void> {
        try {
            await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${fileId}?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'DELETE'
                }
            );
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
}
