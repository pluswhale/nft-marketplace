import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InitialStateType } from './types'

const initialState = {
  authData: {},
  accounts: [
    { email: 'saranyaprasertsang@yahoo.com', password: 'Hodbos929%' },
    { email: 'ferrucio_@hotmail.com', password: 'Phpwp902J99$' },
    { email: 'anyakaewthamai@gmail.com', password: 'sojsIos92L' },
  ],
} as InitialStateType

const modalSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ data: any }>) => {
      state.authData = action.payload.data
      state.isAuth = true
    },
  },
})

export const { setAuthData } = modalSlice.actions
export default modalSlice.reducer
