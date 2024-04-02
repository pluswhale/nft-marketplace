import { useState } from 'react'
import { UploadFilesModal } from './UploadFiles/UploadFilesModal'
import styles from './create_nft.module.scss'

const CreateNft = () => {
  const [isModalUploadFilesOpened, setItsModalUploadFilesOpened] =
    useState<boolean>(false)

  const onOpenUploadFilesModal = () => {
    setItsModalUploadFilesOpened(true)
  }

  const onCloseUploadFilesModal = () => {
    setItsModalUploadFilesOpened(false)
  }

  return (
    <div className={styles.create_nft}>
      <div className={styles.create_nft__container}>
        <button
          style={{ marginTop: '20px' }}
          className={styles.create_nft__button}
          onClick={onOpenUploadFilesModal}
          type="button"
        >
          Upload Files
        </button>

        {isModalUploadFilesOpened && (
          <UploadFilesModal onClose={onCloseUploadFilesModal} />
        )}
      </div>
    </div>
  )
}

export default CreateNft
