export type InitialState = {
  activeModals: Modal[]
}

export type Modal = {
  id: number
  name: string
  isOverlay: boolean
  isCloseByClickOutside: boolean
}

export type InitialStateType = {
  authData: any
  accounts: { email: string; password: string }[]
  isAuth: boolean
}

export type InitialStateUploadNFT = {
  uploadedCids: string[]
}
