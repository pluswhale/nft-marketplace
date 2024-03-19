import { useEffect, useState } from 'react';

function DriveFiles() {
    const [files, setFiles] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/drive/list')
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error('Failed to fetch');
            })
            .then((data) => setFiles(data))
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (!files) return <div>Loading...</div>;

    return (
        <div>
            <h2>Drive Files</h2>
            <ul>
                {files.files.map((file: any) => (
                    <li key={file.id}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default DriveFiles;