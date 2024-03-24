import { RootState } from '../store'

export const uploadCidsSelector = (state: RootState) => {
  return state.uploadNFT.uploadedCids
}
