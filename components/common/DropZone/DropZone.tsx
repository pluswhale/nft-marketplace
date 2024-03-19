import React, {FC, ReactElement, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

import styles from './dropzone.module.scss';

type Props = {
    title: string,
    multiple: boolean,
    accept: {[key: string]: string[]}
    onDrop?: (acceptedFiles: File[]) => void;
}

const Dropzone: FC<Props> = ({ title, multiple, accept, onDrop}): ReactElement => {

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: accept,
        multiple,
    });

    return (
        <div className={styles.dropzone}  {...getRootProps()}>
            <input className={styles.dropzone__input} {...getInputProps()} />
            <p className={styles.dropzone__title}>{title}</p>
        </div>
    )
}

export default Dropzone;