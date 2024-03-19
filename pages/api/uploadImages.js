import { IncomingForm } from 'formidable'; // Note the correct import
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disabling body parsing
    },
};

export default function handler(req, res) {
    const form = new IncomingForm({
        uploadDir: "./", // Adjusted directory
        keepExtensions: true,
        multiples: true, // Enable multiple file uploads
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: "Something went wrong during the upload." });
        }

        // Function to handle file moving
        const moveFile = (file) => {
            const targetDir = path.join(__dirname, '../../../public/uploads/images'); // Adjust the path as needed
            fs.mkdirSync(targetDir, { recursive: true });

            const originalName = file.originalFilename || 'defaultFileName';
            const newPath = path.join(targetDir, originalName);
            fs.renameSync(file.filepath, newPath);
        };

        // Check if `files` contains arrays (multiple files under the same field name) or single file objects
        Object.values(files).forEach((fileOrFiles) => {
            if (Array.isArray(fileOrFiles)) {
                // If it's an array, iterate over the files and move them
                fileOrFiles.forEach((file) => {
                    moveFile(file);
                });
            } else {
                // If it's a single file object, move it directly
                moveFile(fileOrFiles);
            }
        });

        res.status(200).json({ message: "Files uploaded successfully." });
    });
}