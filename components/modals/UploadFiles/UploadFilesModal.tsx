// @flow
import * as React from 'react';
import Dropzone from "../../common/DropZone/DropZone";
import {useCallback, useState} from "react";

import jsonFormatIcon from '../../../public/icons/json_format_icon.jpg';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

import styles from './upload_files_modal.module.scss'
import {File, NFTStorage} from "nft.storage";

type Props = {
 onClose: () => void;
};

export function UploadFilesModal({onClose}: Props) {

    const [images, setImages] = useState<File[]>([]);
    const [metadatas, setMetadatas] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoadingToIPFS, setIsLoadingToIPFS] = useState<boolean>(false)

    const onDropImages = useCallback((acceptedFiles: File[]) => {
        // Filter out files that are already in the state
        const filteredFiles = acceptedFiles.filter((newFile) => {
            return !images.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size);
        });

        // Update the files state by appending the new, filtered files
        const updatedFiles = [...images, ...filteredFiles];

        // Sort files in name order
        const sortedFiles= sortFilesByName(updatedFiles);

        setImages(sortedFiles);

        // Generate URLs for the newly accepted files
        const newPreviewUrls = sortedFiles.map((file) => URL.createObjectURL(file));

        // Update the previewUrls state by appending the new URLs
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }, [images]);

    const onDropMetadata = useCallback((acceptedFiles: File[]) => {
        // Filter out files that are already in the state
        const filteredFiles = acceptedFiles.filter((newFile) => {
            return !metadatas.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size);
        });

        // Update the files state by appending the new, filtered files
        const updatedFiles = [...metadatas, ...filteredFiles];

        // Sort files in name order
          const sortedFiles = sortFilesByName(updatedFiles);

        setMetadatas(sortedFiles);
    }, [metadatas]);


    function sortFilesByName(files: File[]) {
        return files.sort((a, b) => {
            const nameA = a.name.split('.')[0];
            const nameB = b.name.split('.')[0];
            const isNameANumber = !isNaN(Number(nameA));
            const isNameBNumber = !isNaN(Number(nameB));

            if (isNameANumber && isNameBNumber) {
                // Both file names start with numbers, sort numerically
                return Number(nameA) - Number(nameB);
            } else {
                // At least one file name does not start with a number, sort alphabetically
                return nameA.localeCompare(nameB);
            }
        });
    }

    const handleUploadFiles = async () => {
        setIsLoadingToIPFS(true);

        // Assuming each image corresponds to a metadata file by the same index
        images.forEach((imageFile: File, index: number) => {
            const metadataFile = metadatas[index];
            if (metadataFile) {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    try {
                        const text = e?.target?.result;
                        const json = JSON.parse(text as string);

                        const response = await uploadFile(
                            imageFile,
                            json?.name ?? '',
                            json?.description ?? '',
                            json?.external_url ?? '',
                            json.attributes ?? '',
                        )

                        console.log('response', response)

                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };

                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                };

                reader.readAsText(metadataFile);
            }
        });

        // Once all files are processed, reset loading state or proceed with further actions
        setIsLoadingToIPFS(false);
    };


    return (
        <div className={styles.container} role={'dialog'}>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.content}>
                <div className={styles.images}>
                    <p>Upload the images</p>
                    <Dropzone
                        title={'Drag and drop images or selected in files'}
                        accept={{
                            'image/*': ['.jpeg', '.png']
                        }}
                        multiple={true}
                        onDrop={onDropImages}
                    />
                    <div className={styles.images_preview}>
                        {previewUrls && previewUrls?.map((previewUrl: string, index) =>
                            <img
                                className={styles.preview_image}
                                src={previewUrl}
                                alt={images.length ? images[index].name : 'image preview'}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.metadata}>
                    <p>Upload the metadata</p>
                    <Dropzone
                        title={'Drag and drop json or selected in files'}
                        accept={{
                            'application/json': ['.json']
                        }}
                        multiple={true}
                        onDrop={onDropMetadata}
                    />
                    <div className={styles.images_preview}>
                        {metadatas && metadatas?.map((metadata: File, index) =>
                            <div className={styles.json_preview}>
                                <p>{metadata.name}</p>
                                {/*<img*/}
                                {/*    className={styles.preview_image}*/}
                                {/*    src={jsonFormatIcon}*/}
                                {/*    alt={metadatas.length ? metadatas[index].name : 'image preview'}*/}
                                {/*/>*/}
                            </div>
                        )}
                    </div>
                </div>
                <button
                  className={styles.button}
                  onClick={handleUploadFiles}
                  type="button"
                >
                    Upload files
                </button>
            </div>
        </div>
    );


    async function uploadFile(
        file: File,
        name: string,
        description: string,
        externalUrl: string,
        metadataAttributes: any,
    ) {
        const client = new NFTStorage({ token })

        // Preparing the file for upload
        const nftStorageFile = new File([file], file.name, { type: file.type })

        const nft = {
            image: nftStorageFile,
            name,
            description,
            external_url: externalUrl,
            attributes: metadataAttributes,
        }

        // Ensure you await the store function
        return await client.store(nft)
    }
}