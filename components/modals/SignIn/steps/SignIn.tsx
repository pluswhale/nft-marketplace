import React, { FC, useContext, useState } from 'react'

import { useAppDispatch } from '../../../../redux/store'
import { Button } from '../../../primitives'
import { authAPI } from '../../../../api/auth'
import style from './steps.module.scss'
import { ToastContext } from '../../../../context/ToastContextProvider'
import { setAuthData } from '../../../../redux/slices/auth'

type Props = {
  onGoConnectWallet: (step: string) => void
}

const SignIn: FC<Props> = ({ onGoConnectWallet }) => {
  const dispatch = useAppDispatch()
  const { addToast } = useContext(ToastContext)

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  const handleChangeEmail = (email: string) => {
    setEmail(email)
  }

  const handleChangePassword = (password: string) => {
    setPassword(password)
  }

  const handleLoginUser = () => {
    const data = {
      email,
      password,
    }

    authAPI
      .signIn(data)
      .then((res: any) => {
        if (res) {
          if (res.status === 200) {
            addToast?.({ title: 'You are login.', status: 'success' })
            if (res.data.token) {
              dispatch(setAuthData({ data: res.data?.user }))
              localStorage.setItem('accessToken', res.data.token)
            }
            setTimeout(() => {
              onGoConnectWallet('cw')
            }, 1000)
          } else if (res.status === 400) {
            addToast?.({
              title: 'You are have bad credentials',
              status: 'error',
            })
          }
        } else {
          addToast?.({
            title: res?.data?.message || 'Something went wrong',
            status: 'error',
          })
        }
      })
      .catch((err) => {
        console.log('err', err)
        addToast?.({
          title: err.response.data.message || 'Something went wrong',
          status: 'error',
        })
      })
  }

  const handleLoginThroughGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google'
  }

  return (
    <>
      {successMsg ? (
        <p className={style.success_message}>{successMsg}</p>
      ) : (
        <>
          <p className={style.modal_title}>Sign in</p>

          <div
            onClick={handleLoginThroughGoogle}
            className={style.loginMethods}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/google-icon.png`}
              alt="Google"
            />
            <p className={style.loginText}>Вход через Google</p>
          </div>

          {/*<div className={style.loginMethods}>*/}
          {/*    <img src={ico2} alt="Facebook" />*/}
          {/*    <p className={style.loginText}>Вход через Facebook</p>*/}
          {/*</div>*/}

          {/*<div className={style.loginMethods}>*/}
          {/*    <img src={ico3} alt="Apple" />*/}
          {/*    <p className={style.loginText}>Вход через Apple</p>*/}
          {/*</div>*/}

          {/*<div className={style.block_or}>*/}
          {/*  <div className={style.decor_line}></div>*/}
          {/*  <p>или</p>*/}
          {/*  <div className={style.decor_line}></div>*/}
          {/*</div>*/}

          <div className={style.block_input_data}>
            <input
              className={style.input}
              placeholder="E-mail"
              value={email}
              onChange={({ target }) => handleChangeEmail(target.value)}
            />

            <input
              className={style.input}
              placeholder="Password"
              value={password}
              onChange={({ target }) => handleChangePassword(target.value)}
              type={'password'}
            />
          </div>

          <Button
            size="large"
            css={{ my: '$5', justifyContent: 'center' }}
            color="primary"
            onClick={handleLoginUser}
          >
            Sign In
          </Button>
        </>
      )}
    </>
  )
}

export default SignIn
