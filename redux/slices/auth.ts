import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InitialStateType } from './types'

const initialState = {
  authData: {},
} as InitialStateType

const modalSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ data: any }>) => {
      state.authData = action.payload.data
      state.isAuth = true
    },
    setIsAuth: (state, action: PayloadAction<{ isAuth: boolean }>) => {
      state.isAuth = action.payload.isAuth
    },
  },
})

export const { setAuthData, setIsAuth } = modalSlice.actions
export default modalSlice.reducer
