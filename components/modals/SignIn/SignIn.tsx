import React, { useState } from 'react'
import style from './sign_in.module.scss'

import { useAppDispatch } from '../../../redux/store'
import { Button } from '../../primitives'
import { accountsSelector } from '../../../redux/selectors/authSelectors'
import { useSelector } from 'react-redux'
import { deleteLastModal } from '../../../redux/slices/modal'
import { setAuthData } from '../../../redux/slices/auth'

const SignIn = () => {
  const dispatch = useAppDispatch()

  const mockAccounts = useSelector(accountsSelector)

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

    const isUserCorrect = mockAccounts.find(
      (mockAcc) => mockAcc.email === data.email && mockAcc.password === password
    )

    if (isUserCorrect) {
      dispatch(setAuthData({ data: {} }))
      setSuccessMsg('Your account exists. You can start explore our platform!')

      setTimeout(() => {
        handleCloseModal()
        return
      }, 4000)
    } else {
      setSuccessMsg(
        'It is seems you are type wrong email or password. Try again!'
      )
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    }
  }

  const handleCloseModal = () => {
    dispatch(deleteLastModal())
  }

  return (
    <div className={style.modal_bg}>
      <div className={style.modal_block}>
        <div className={style.close_ico} onClick={handleCloseModal}>
          <img
            id={style.modal_close_icon}
            className={style.close_modal}
            src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/close-icon.png`}
            alt="Close icon"
          />
        </div>
        {successMsg ? (
          <p className={style.success_message}>{successMsg}</p>
        ) : (
          <>
            <p className={style.modal_title}>Welcome to Art fusion</p>

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
      </div>
    </div>
  )
}

export default SignIn
