// @flow
import * as React from 'react'
import { Box } from '../../../primitives'
import { ConnectWalletButton } from '../../../ConnectWalletButton'

import style from './steps.module.scss'

type Props = {}

const ConnectWallet = (props: Props) => {
  return (
    <div>
      <Box css={{ width: '100%', padding: '0 20px' }}>
        <p className={style.connect_wallet_placeholder}>
          Now you should connect your crypto wallet
        </p>

        <ConnectWalletButton />
      </Box>
    </div>
  )
}

export default ConnectWallet
