import { combineReducers } from 'redux'
import { useDispatch } from 'react-redux'
import { AnyAction, configureStore, ThunkDispatch } from '@reduxjs/toolkit'

import modal from './slices/modal'
import auth from './slices/auth'
import uploadNFT from './slices/uploadNFT'

const rootReducer = combineReducers({
  modal,
  auth,
  uploadNFT,
})

const store = configureStore({
  reducer: rootReducer,
})

export type RootStateType = ReturnType<typeof store.getState>
export type AppThunkType = ThunkDispatch<RootStateType, void, AnyAction>
export const useAppDispatch = () => useDispatch<AppThunkType>()

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store
