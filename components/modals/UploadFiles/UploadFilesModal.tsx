import Dropzone from '../../common/DropZone/DropZone'
import { useCallback, useState } from 'react'
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

import styles from './upload_files_modal.module.scss'
import { File, NFTStorage } from 'nft.storage'

type Props = {
  onClose: () => void
}

export function UploadFilesModal({ onClose }: Props) {
  const [images, setImages] = useState<File[]>([])
  const [metadatas, setMetadatas] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoadingToIPFS, setIsLoadingToIPFS] = useState<boolean>(false)

  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)

  const onDropImages = useCallback(
    (acceptedFiles: File[]) => {
      setIsLoadingImages(true)

      // Filter out files that are already in the state
      const filteredFiles = acceptedFiles.filter((newFile) => {
        return !images.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
      })

      // Update the files state by appending the new, filtered files
      const updatedFiles = [...images, ...filteredFiles]

      // Sort files in name order
      const sortedFiles = sortFilesByName(updatedFiles)

      setImages(sortedFiles)

      // Generate URLs for the newly accepted files
      const newPreviewUrls = sortedFiles.map((file) =>
        URL.createObjectURL(file)
      )

      // Update the previewUrls state by appending the new URLs
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      setIsLoadingImages(false)
    },
    [images]
  )

  const onDropMetadata = useCallback(
    (acceptedFiles: File[]) => {
      setIsLoadingMetadata(true)

      // Filter out files that are already in the state
      const filteredFiles = acceptedFiles.filter((newFile) => {
        return !metadatas.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
      })

      // Update the files state by appending the new, filtered files
      const updatedFiles = [...metadatas, ...filteredFiles]

      // Sort files in name order
      const sortedFiles = sortFilesByName(updatedFiles)

      setMetadatas(sortedFiles)

      setIsLoadingMetadata(false)
    },
    [metadatas]
  )

  function sortFilesByName(files: File[]) {
    return files.sort((a, b) => {
      const nameA = a.name.split('.')[0]
      const nameB = b.name.split('.')[0]
      const isNameANumber = !isNaN(Number(nameA))
      const isNameBNumber = !isNaN(Number(nameB))

      if (isNameANumber && isNameBNumber) {
        // Both file names start with numbers, sort numerically
        return Number(nameA) - Number(nameB)
      } else {
        // At least one file name does not start with a number, sort alphabetically
        return nameA.localeCompare(nameB)
      }
    })
  }

  const handleUploadFiles = async () => {
    setIsLoadingToIPFS(true) // Start loading

    // Map each image to a Promise that resolves when its corresponding metadata is processed
    const uploadPromises = images.map(
      async (imageFile: File, index: number) => {
        const metadataFile = metadatas[index]
        if (!metadataFile) {
          return // Skip if no corresponding metadata file
        }

        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = async (e) => {
            try {
              const text = e?.target?.result as string
              const json = JSON.parse(text)

              // Upload file, assuming uploadFile returns a Promise
              const response = await uploadFile(
                imageFile,
                json?.name ?? '',
                json?.description ?? '',
                json?.external_url ?? '',
                json.attributes ?? []
              )

              // Check response and handle accordingly
              //@ts-ignore
              if (!response?.ok) {
                // Handle non-ok response if needed
              }
              console.log('response', response)
              resolve()
            } catch (error) {
              console.error('Error parsing JSON:', error)
              reject(error)
            }
          }

          reader.onerror = (error) => {
            console.error('Error reading file:', error)
            reject(error)
          }

          reader.readAsText(metadataFile)
        })
      }
    )

    try {
      await Promise.all(uploadPromises) // Wait for all uploads to complete
    } catch (error) {
      console.error('An error occurred during the upload process:', error)
    } finally {
      setIsLoadingToIPFS(false) // End loading regardless of result
    }
  }

  const handleCloseModal = () => {
    if (isLoadingToIPFS) return
    onClose()
  }

  return (
    <div className={styles.container} role={'dialog'}>
      <div className={styles.overlay} onClick={handleCloseModal}></div>
      <div className={styles.content}>
        {isLoadingToIPFS ? (
          <>
            <img
              className={styles.loader}
              style={{ width: '100px', height: '100px' }}
              src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
              alt="loader"
            />
            <p className={styles.loader_title}>
              Your files is uploading to a decentralized storage. Please wait
              and don't close the window.
            </p>
          </>
        ) : (
          <>
            <div className={styles.images}>
              <p>Upload the images</p>
              <Dropzone
                title={'Drag and drop images or selected in files'}
                accept={{
                  'image/*': ['.jpeg', '.png', '.jpg'],
                }}
                multiple={true}
                onDrop={onDropImages}
                isLoading={isLoadingImages}
              />
              <div className={styles.images_preview}>
                {previewUrls &&
                  previewUrls?.map((previewUrl: string, index) => (
                    <img
                      className={styles.preview_image}
                      src={previewUrl}
                      alt={
                        images.length ? images?.[index]?.name : 'image preview'
                      }
                    />
                  ))}
              </div>
            </div>
            <div className={styles.metadata}>
              <p>Upload the metadata</p>
              <Dropzone
                title={'Drag and drop json or selected in files'}
                accept={{
                  'application/json': ['.json'],
                }}
                multiple={true}
                onDrop={onDropMetadata}
                isLoading={isLoadingMetadata}
              />
              <div className={styles.images_preview}>
                {metadatas &&
                  metadatas?.map((metadata: File, index) => (
                    <div className={styles.json_preview}>
                      <p>{metadata.name}</p>
                      {/*<img*/}
                      {/*    className={styles.preview_image}*/}
                      {/*    src={jsonFormatIcon}*/}
                      {/*    alt={metadatas.length ? metadatas[index].name : 'image preview'}*/}
                      {/*/>*/}
                    </div>
                  ))}
              </div>
            </div>
            <button
              className={styles.button}
              onClick={handleUploadFiles}
              type="button"
            >
              Upload files
            </button>
          </>
        )}
      </div>
    </div>
  )

  async function uploadFile(
    file: File,
    name: string,
    description: string,
    externalUrl: string,
    metadataAttributes: any
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
