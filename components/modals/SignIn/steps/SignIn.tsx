import React, { FC, useContext, useState } from 'react'

import { useAppDispatch } from '../../../../redux/store'
import { Button } from '../../../primitives'
import { authAPI } from '../../../../api/auth'
import style from './steps.module.scss'
import { ToastContext } from '../../../../context/ToastContextProvider'

type Props = {
  onGoConnectWallet: () => void
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
      .then((res) => {
        if (res) {
          if (res.status === 200) {
            addToast?.({ title: 'You are login.', status: 'success' })
            setTimeout(() => {
              onGoConnectWallet()
            }, 1000)
          } else if (res.status === 400) {
            addToast?.({
              title: 'You are have bad credentials',
              status: 'error',
            })
          }
        } else {
          addToast?.({ title: 'Something went wrong', status: 'error' })
        }
      })
      .catch((err) => {
        addToast?.({ title: 'Something went wrong', status: 'error' })
      })
  }

  return (
    <>
      {successMsg ? (
        <p className={style.success_message}>{successMsg}</p>
      ) : (
        <>
          <p className={style.modal_title}>Sign in</p>

          {/*<div className={style.loginMethods}>*/}
          {/*    <img src={ico1} alt="Google" />*/}
          {/*    <p className={style.loginText}>Вход через Google</p>*/}
          {/*</div>*/}

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
