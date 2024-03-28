import Dropzone from '../../common/DropZone/DropZone'
import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import styles from './upload_files_modal.module.scss'
import { File, NFTStorage } from 'nft.storage'
import { CustomizedLinearProgressBar } from '../../linear-progress/CustomizedLinearProgressBar'
import { normalizeProgress } from '../../../utils/normilizeProgress'
import { useAppDispatch } from '../../../redux/store'
import { addCid, clearCids } from '../../../redux/slices/uploadNFT'
import { FaPauseCircle } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { FcFullTrash } from 'react-icons/fc'
import store from '../../../redux/store'
import { uploadNFT } from '../../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../../redux/selectors/authSelectors'
import { generateMetadataContent } from '../../../utils/generateRandomPhrases'
import { GridVirtualList } from '../../virtual-lists/index'
import { ToastContext } from '../../../context/ToastContextProvider'

const NFT_STORAGE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

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
  const [isStartClearingUploadedFiles, setIsStartClearingUploadedFiles] =
    useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const isPaused = useRef<any>(false)
  const isCancelled = useRef<any>(false)
  const authUserId = useSelector(authUserIdSelector, shallowEqual)
  let estimationTimeOfUploading = Math.ceil((images?.length * 2) / 60) // in mins
  const { addToast } = useContext(ToastContext)

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const waitForResume = async () => {
    while (isPaused.current) {
      await sleep(100)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isLoadingToIPFS) {
        event.preventDefault()
        event.returnValue =
          'Are you sure you want to leave? All progress will be lost.'
        return event.returnValue
      }
    }

    if (isLoadingToIPFS) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoadingToIPFS])

  useEffect(() => {
    let globalImageIndex = 1
    const fetchBatch = async (batchSize: number, startIndex = 0) => {
      const endIndex = startIndex + batchSize
      const imageUrls = Array.from(
        { length: batchSize },
        (_, index) =>
          `https://picsum.photos/200/300?random=${startIndex + index}`
      )

      const imageResponses = await Promise.all(
        imageUrls.map((url) => fetch(url))
      )
      const imageBlobs = await Promise.all(
        imageResponses.map((response) => response.blob())
      )

      const imageFiles = imageBlobs.map((blob) => {
        // Use the global image index for naming
        const fileName = `ak${globalImageIndex}.jpg`
        globalImageIndex++ // Increment for the next image
        return new File([blob], fileName, {
          type: 'image/jpeg',
        })
      })

      const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))

      setImages((prevImages) => [...prevImages, ...imageFiles])
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      const generatedMetadata = imageFiles.map((file, index: number) => {
        const cutFilaName = file?.name?.split('.')[0]

        const data = {
          name: generateMetadataContent(2)?.name,
          description: generateMetadataContent(5)?.description,
        }

        return new File([JSON.stringify(data)], `${cutFilaName}.json`, {
          type: 'application/json',
        })
      })

      //@ts-ignore
      setMetadatas((prevMetadatas) => [...prevMetadatas, ...generatedMetadata])

      await sleep(1000)
    }

    const totalFiles = LENGTH_OF_MOCK_FILES
    let batchSize = 10

    // for (let startIndex = 0; startIndex < totalFiles; startIndex += batchSize) {
    //   const remainingFiles = totalFiles - startIndex
    //   batchSize = Math.min(batchSize, remainingFiles)
    //
    //   fetchBatch(batchSize, startIndex).catch(console.error)
    // }
  }, [])

  const onDropImages = useCallback(
    (acceptedFiles: File[]) => {
      setIsLoadingImages(true)

      const filteredFiles = acceptedFiles.filter((newFile) => {
        return !images.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
      })

      const sortedFiles = sortFilesByName(filteredFiles)

      const updatedFiles = [...images, ...sortedFiles]

      setImages(updatedFiles)

      const newPreviewUrls = sortedFiles.map((file) =>
        URL.createObjectURL(file)
      )

      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      const generatedMetadata = sortedFiles.map((file, index: number) => {
        const cutFilaName = file?.name?.split('.')[0]

        const data = {
          name: generateMetadataContent(2)?.name,
          description: generateMetadataContent(5)?.description,
        }

        return new File([JSON.stringify(data)], `${cutFilaName}.json`, {
          type: 'application/json',
        })
      })

      //@ts-ignore
      setMetadatas((prevMetadatas) => [...prevMetadatas, ...generatedMetadata])

      setIsLoadingImages(false)
    },
    [images]
  )

  function sortFilesByName(files: File[]) {
    return files.sort((a, b) => {
      const nameA = a.name.replace(/^\D+/g, '')
      const nameB = b.name.replace(/^\D+/g, '')

      const numA = parseInt(nameA, 10)
      const numB = parseInt(nameB, 10)

      return numA - numB
    })
  }

  const handleUploadFiles = async () => {
    setIsLoadingToIPFS(true)
    const delayBetweenUploads = 500 // Delay in milliseconds, adjust as needed
    const filesLength = Math.ceil(images?.length) || 0
    let curFile = 0

    for (let index = 0; index < filesLength; index++) {
      if (isCancelled.current) {
        break
      }

      await waitForResume()

      const imageFile = images[index]
      const metadataFile = metadatas[index]
      if (!metadataFile) {
        continue
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

      curFile = curFile + 1

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

    setProgress(0)
    !isCancelled.current &&
      addToast?.({ title: 'Your arts was uploaded.', status: 'success' })
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

  const handleDeleteFile = (fileIndex: number) => {
    const newImages = images.filter(
      (_: File, index: number) => index !== fileIndex
    )
    setImages(newImages)

    const newMetadata = metadatas.filter(
      (_: File, index: number) => index !== fileIndex
    )
    setMetadatas(newMetadata)

    const newPreviewUrls = previewUrls.filter(
      (_: string, index: number) => index !== fileIndex
    )
    setPreviewUrls(newPreviewUrls)
  }

  function cleanUp() {
    dispatch(clearCids())
  }

  const pauseUpload = () => {
    isPaused.current = true
  }
  const resumeUpload = () => {
    isPaused.current = false
  }
  const cancelUpload = () => {
    isCancelled.current = true
  }

  const imagePreview = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
  }) => {
    const index = rowIndex * 10 + columnIndex // Calculate index based on row and column

    if (index >= images.length) {
      return null
    }

    return (
      <div style={style} className={styles.preview_image_wrapper}>
        <img
          className={styles.preview_image}
          src={previewUrls[index]}
          alt={images.length ? images?.[index]?.name : 'image preview'}
        />
        <div className={styles.overlay}>
          <span className={styles.preview_image_name}>
            {images?.[index]?.name}
          </span>
          <FcFullTrash
            title="Delete file"
            onClick={() => handleDeleteFile(index)}
          />
        </div>
      </div>
    )
  }

  const jsonPreview = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
  }) => {
    const index = rowIndex * 10 + columnIndex // Calculate index based on row and column

    if (index >= images.length) {
      return null
    }

    return (
      <div style={style} className={styles.json_preview}>
        <div>{metadatas?.[index]?.name}</div>
        <img
          className={styles.preview_image}
          src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/json_format_icon.png`}
          alt={metadatas?.length ? metadatas?.[index]?.name : 'image preview'}
        />
      </div>
    )
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
              width: '100%',
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
                  wait and don't close the window. <br />
                  Approximately time for uploading is:{' '}
                  {estimationTimeOfUploading} minutes.
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

              {previewUrls?.length ? (
                <GridVirtualList
                  styles={{ gridGap: '10px' }}
                  columnCount={10}
                  columnWidth={100}
                  height={previewUrls?.length < 11 ? 150 : 250}
                  rowCount={Math.ceil(previewUrls?.length / 10)}
                  rowHeight={150}
                  width={1105}
                  gap={10}
                >
                  {imagePreview}
                </GridVirtualList>
              ) : null}
            </div>
            <div className={styles.metadata}>
              {metadatas?.length ? <p>Your Metadata</p> : null}
              <div className={styles.react_window_list_container}>
                {metadatas?.length ? (
                  <GridVirtualList
                    styles={{ gridGap: '10px' }}
                    columnCount={10}
                    columnWidth={100}
                    height={metadatas?.length < 11 ? 150 : 250}
                    rowCount={Math.ceil(metadatas?.length / 10)}
                    rowHeight={150}
                    width={1105}
                    gap={10}
                  >
                    {jsonPreview}
                  </GridVirtualList>
                ) : null}
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
    const client = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY || NFT_STORAGE_TOKEN,
    })

    const nftStorageFile = new File([file], file.name, { type: file.type })

    const nft = {
      image: nftStorageFile,
      name,
      description,
      external_url: externalUrl,
      attributes: metadataAttributes,
    }

    return await client.store(nft)
  }
}

async function deleteFileFromNFTStorage(cid: string) {
  const client = new NFTStorage({
    token: process.env.NFT_STORAGE_API_KEY || NFT_STORAGE_TOKEN,
  })

  return await client.delete(cid)
}
