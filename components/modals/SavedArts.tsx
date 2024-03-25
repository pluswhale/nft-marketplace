// @flow
import * as React from 'react'
import { useEffect, useState } from 'react'
import { uploadNFT } from '../../api/userNFT'

type Props = {}

export function SavedArts(props: Props) {
  const [savedArts, setSavedArts] = useState<any[]>([])

  useEffect(() => {
    uploadNFT.getAllSavedArts(16).then((res) => {
      if (res) {
        setSavedArts(res.data?.userItems)
      }
    })
  }, [])

  return (
    <div>
      {savedArts &&
        savedArts.map((art, index: number) => {
          return (
            <div style={{ display: 'flex', gap: '10px' }}>
              <p>{index + 1}</p>
              <p>Name: {art.name}</p>
              <p>Description: {art.description}</p>
              <p>Created: {art.created_at}</p>
              <p>CID: {art.cid}</p>
            </div>
          )
        })}
    </div>
  )
}
