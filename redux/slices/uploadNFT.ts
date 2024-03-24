import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InitialStateUploadNFT } from './types'

const initialState = {
  uploadedCids: [],
} as InitialStateUploadNFT

const uploadNFT = createSlice({
  name: 'uploadNFT',
  initialState,
  reducers: {
    addCid: (state, action: PayloadAction<{ cid: string }>) => {
      const cid = action.payload.cid
      const isValidCid = cid && !state.uploadedCids.includes(cid)
      if (isValidCid) {
        state.uploadedCids.push(cid)
      }
    },
    clearCids: (state) => {
      state.uploadedCids = []
    },
  },
})

export const { addCid, clearCids } = uploadNFT.actions
export default uploadNFT.reducer
