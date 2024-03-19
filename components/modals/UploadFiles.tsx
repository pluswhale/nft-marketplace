// pages/upload.js or a component file

export default function UploadFiles({url}: {url: string}) {
    const handleFileUpload = async (event: any) => {
        console.log('event.target.files.files', event.target.files.files)
        event.preventDefault();
        const files = event.target.files.files; // Assuming your input's name is "files"
        const formData = new FormData();

        // Append files to formData
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        // Send the files to your API endpoint
        await fetch(url, {
            method: 'POST',
            body: formData,
        });
    };

    return (
        <form onSubmit={handleFileUpload}>
            <input type="file" name="files" multiple />
            <button type="submit">Upload Files</button>
        </form>
    );
}