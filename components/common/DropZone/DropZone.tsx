import React, { FC, ReactElement } from 'react'
import { useDropzone } from 'react-dropzone'

import styles from './dropzone.module.scss'

type Props = {
  title: string
  multiple: boolean
  accept: { [key: string]: string[] }
  onDrop?: (acceptedFiles: File[]) => void
  isLoading: boolean
}

const Dropzone: FC<Props> = ({
  title,
  multiple,
  accept,
  onDrop,
  isLoading,
}): ReactElement => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept,
    multiple,
  })

  return (
    <div className={styles.dropzone} {...getRootProps()}>
      {isLoading ? (
        <img
          className={styles.loader}
          src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
          alt="loader"
        />
      ) : (
        <>
          <input
            className={styles.dropzone__input}
            {...getInputProps()}
            directory=""
            webkitdirectory=""
            type={'file'}
          />
          <p className={styles.dropzone__title}>{title}</p>
        </>
      )}
    </div>
  )
}

export default Dropzone
