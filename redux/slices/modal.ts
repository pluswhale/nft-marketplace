import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InitialState, Modal } from './types'

const initialState = {
  activeModals: [],
} as InitialState

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    pushModal: (state, action: PayloadAction<{ modal: Modal }>) => {
      state.activeModals.push(action.payload.modal)
    },
    deleteModal: (state, action: PayloadAction<{ id: number }>) => {
      state.activeModals = state.activeModals.filter(
        (modal) => modal.id !== action.payload.id
      )
    },
    deleteLastModal: (state) => {
      if (state.activeModals.length) {
        state.activeModals.length = state.activeModals.length - 1
      }
    },
  },
})

export const { pushModal, deleteModal, deleteLastModal } = modalSlice.actions
export default modalSlice.reducer
