import React, { FC, ReactElement, useContext, useState } from 'react'
import { Button } from '../../../primitives'
import style from './steps.module.scss'
import { authAPI } from '../../../../api/auth'
import { ToastContext } from '../../../../context/ToastContextProvider'

type Props = {
  onGoSignIn: (step: string) => void
}

const SignUp: FC<Props> = ({ onGoSignIn }): ReactElement => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const { addToast } = useContext(ToastContext)

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

    authAPI.signUp(data).then((res) => {
      if (res) {
        if (res.status === 201) {
          addToast?.({
            title: 'You are registered. Now sign up',
            status: 'success',
          })

          setTimeout(() => {
            onGoSignIn('signIn')
          }, 1000)
        } else if (res.status === 400) {
          addToast?.({
            title: res.data.message || 'This email already exists.',
            status: 'success',
          })
        }
      } else {
        addToast?.({ title: 'Something went wrong', status: 'error' })
      }
    })
  }

  return (
    <>
      {successMsg ? (
        <p className={style.success_message}>{successMsg}</p>
      ) : (
        <>
          <p className={style.modal_title}>Sign Up</p>
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
            Sign Up
          </Button>
        </>
      )}
    </>
  )
}

export default SignUp
