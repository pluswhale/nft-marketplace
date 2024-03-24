import Dropzone from '../../common/DropZone/DropZone'
import { useCallback, useEffect, useRef, useState } from 'react'
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

import styles from './upload_files_modal.module.scss'
import { File, NFTStorage } from 'nft.storage'
import { CustomizedLinearProgressBar } from '../../linear-progress/CustomizedLinearProgressBar'
import { normalizeProgress } from '../../../utils/normilizeProgress'
import { useAppDispatch } from '../../../redux/store'
import { addCid, clearCids } from '../../../redux/slices/uploadNFT'
import { FaPauseCircle } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'

import store from '../../../redux/store'
import { uploadNFT } from '../../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../../redux/selectors/authSelectors'

type Props = {
  onClose: () => void
}

const testJson = {
  name: 'First Art',
  description: 'The description of first art',
  attributes: [
    {
      trait_type: 'Background',
      value: 'Pastel Blue',
    },
    {
      trait_type: 'Body',
      value: 'Original',
    },
    {
      trait_type: 'Expression',
      value: 'Eyes',
    },
    {
      trait_type: 'Top Tentacle Items',
      value: 'Pink Umbrella',
    },
    {
      trait_type: 'Neck Item',
      value: 'White Ribbon',
    },
    {
      trait_type: 'Head Item',
      value: 'Sleeping Mask',
    },
    {
      trait_type: 'Center Left Tentacle Item',
      value: 'Calculator',
    },
    {
      trait_type: 'Center Right Tentacle Item',
      value: 'Yacht',
    },
    {
      trait_type: 'Mid Left Tentacle Item',
      value: 'ETH',
    },
    {
      trait_type: 'Lore',
      value: '263',
    },
  ],
}

const LENGTH_OF_MOCK_FILES = 50

export function UploadFilesModal({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const [images, setImages] = useState<File[]>([])
  const [metadatas, setMetadatas] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoadingToIPFS, setIsLoadingToIPFS] = useState<boolean>(false)
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false)
  const [isStartClearingUploadedFiles, setIsStartClearingUploadedFiles] =
    useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const isPaused = useRef<any>(false)
  const isCancelled = useRef<any>(false)
  const authUserId = useSelector(authUserIdSelector, shallowEqual)
  let estimationTimeOfUploading = Math.ceil((images?.length * 2) / 60) // in mins

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const waitForResume = async () => {
    while (isPaused.current) {
      await sleep(100) // Check every 100ms if still paused
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isLoadingToIPFS) {
        // Standard for most modern browsers
        event.preventDefault()
        // For some older browsers
        event.returnValue =
          'Are you sure you want to leave? All progress will be lost.'
        // Display the confirmation dialog
        return event.returnValue
      }
    }

    // Add event listener if isLoadingToIPFS is true
    if (isLoadingToIPFS) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoadingToIPFS]) // Only re-run the effect if isLoadingToIPFS changes

  useEffect(() => {
    const fetchImagesAndMetadata = async () => {
      const imageUrls = Array.from(
        { length: LENGTH_OF_MOCK_FILES },
        (_, index) => `https://picsum.photos/200/300?random=${index}`
      )

      const imageResponses = await Promise.all(
        imageUrls.map((url) => fetch(url))
      )
      const imageBlobs = await Promise.all(
        imageResponses.map((response) => response.blob())
      )

      const imageFiles = imageBlobs.map((blob, index) => {
        return new File([blob], `${index}.jpg`, { type: 'image/jpeg' })
      })

      setImages(imageFiles)

      const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))

      // Update the previewUrls state by appending the new URLs
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      const jsonFiles = Array.from(
        { length: LENGTH_OF_MOCK_FILES },
        (_, index) => {
          return new File([JSON.stringify(testJson)], `${index}.json`, {
            type: 'application/json',
          })
        }
      )

      setMetadatas(jsonFiles)
    }

    fetchImagesAndMetadata()
  }, [])

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
    setIsLoadingToIPFS(true)
    const delayBetweenUploads = 500 // Delay in milliseconds, adjust as needed
    const filesLength = Math.ceil(images?.length) || 0
    let curFile = 0

    for (let index = 0; index < filesLength; index++) {
      if (isCancelled.current) {
        break // Exit the loop if cancelled
      }

      // Wait if paused
      await waitForResume()

      const imageFile = images[index]
      const metadataFile = metadatas[index]
      if (!metadataFile) {
        continue // Skip if no corresponding metadata file
      }

      try {
        const metadataText: any = await readMetadataFile(metadataFile)
        const metadataJson = JSON.parse(metadataText)

        const response: any = await uploadFile(
          imageFile,
          metadataJson.name,
          metadataJson.description,
          metadataJson.external_url,
          metadataJson.attributes
        )

        if (response.ipnft) {
          const savedData = {
            userId: authUserId,
            itemId: response?.ipnft,
            name: metadataJson?.name,
            description: metadataJson.description,
            cid: response.ipnft,
            minted: false,
          }

          const res = await uploadNFT.saveUserUploadedArt(savedData)

          if (res.status === 200) {
            dispatch(addCid({ cid: response?.ipnft }))
          }
        }

        if (!response) {
          console.error(`Failed to upload image ${index + 1}`)
        }
      } catch (error) {
        console.error('An error occurred during the upload process:', error)
      }

      setProgress(Math.floor((curFile / filesLength) * 100))

      // Increment cur file count
      curFile = curFile + 1

      // Wait before making the next request
      await sleep(delayBetweenUploads)
    }

    if (isCancelled.current) {
      const currentUploadedCids = store.getState().uploadNFT.uploadedCids // Adjust according to your state structure
      setIsStartClearingUploadedFiles(true)
      if (currentUploadedCids?.length) {
        for (const cid of currentUploadedCids) {
          try {
            await deleteFileFromNFTStorage(cid)
            await uploadNFT.deleteUserUploadedArt(cid)
          } catch (error) {
            console.error(`Failed to delete CID: ${cid}`, error)
          }

          await sleep(delayBetweenUploads)
        }

        setIsStartClearingUploadedFiles(false)
      }

      cleanUp()
      console.log('Upload cancelled.')
    }

    setIsLoadingToIPFS(false)
    isPaused.current = false
    isCancelled.current = false
  }

  const readMetadataFile = async (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event: any) => {
        resolve(event.target.result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsText(file)
    })
  }

  const handleCloseModal = () => {
    if (isLoadingToIPFS) return
    onClose()
  }

  function cleanUp() {
    setProgress(0)
    dispatch(clearCids())
  }

  // Handlers to pause, resume, and cancel the upload
  const pauseUpload = () => {
    isPaused.current = true
  }
  const resumeUpload = () => {
    isPaused.current = false
  }
  const cancelUpload = () => {
    isCancelled.current = true
  }

  return (
    <div className={styles.container} role={'dialog'}>
      <div className={styles.overlay} onClick={handleCloseModal}></div>
      <div className={styles.content}>
        {isLoadingToIPFS ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            {!isStartClearingUploadedFiles ? (
              <>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CustomizedLinearProgressBar
                    progress={normalizeProgress(progress)}
                  />

                  <div style={{ display: 'flex', gap: '5px' }}>
                    {isPaused.current && (
                      <FaPlay
                        title={'Resume uploading'}
                        style={{ cursor: 'pointer', color: '#5B5BD6' }}
                        onClick={resumeUpload}
                      />
                    )}
                    {!isPaused.current && (
                      <FaPauseCircle
                        title={'Pause uploading'}
                        style={{ cursor: 'pointer', color: '#5B5BD6' }}
                        onClick={pauseUpload}
                      />
                    )}
                    <MdCancel
                      title={'Cancel uploading'}
                      style={{ cursor: 'pointer', color: '#5B5BD6' }}
                      onClick={cancelUpload}
                    />
                  </div>
                </div>
                <p className={styles.loader_title}>
                  Your files is uploading to a decentralized storage. Please
                  wait and don't close the window. Approximately time for
                  uploading is: {estimationTimeOfUploading} minutes.
                </p>
              </>
            ) : (
              <>
                <img
                  className={styles.loader}
                  style={{ width: '100px', height: '100px' }}
                  src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
                  alt="loader"
                />
                <p className={styles.loader_title}>
                  Your files will be deleted from storages in due to safe the
                  space.
                </p>
              </>
            )}
          </div>
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
                      <div>{metadata.name}</div>
                      <img
                        className={styles.preview_image}
                        src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/json_format_icon.png`}
                        alt={
                          metadatas.length
                            ? metadatas[index].name
                            : 'image preview'
                        }
                      />
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

async function deleteFileFromNFTStorage(cid: string) {
  const client = new NFTStorage({ token })

  return await client.delete(cid)
}
