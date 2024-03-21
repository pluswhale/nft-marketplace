// @flow
import * as React from 'react'
import { Box } from '../../../primitives'
import { ConnectWalletButton } from '../../../ConnectWalletButton'

import style from './steps.module.scss'

type Props = {}

const ConnectWallet = (props: Props) => {
  return (
    <div>
      <Box css={{ maxWidth: '185px' }}>
        <ConnectWalletButton />
      </Box>
    </div>
  )
}

export default ConnectWallet
