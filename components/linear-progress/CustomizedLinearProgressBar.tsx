import { LinearProgress, linearProgressClasses, styled } from '@mui/material'
import { FC, ReactElement } from 'react'

import styles from './CustomizedLinearProgressBar.module.scss'

const ColoredLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#5B5BD6' : '#f9f0cc',
  },
}))

type Props = {
  progress: number
}

export const CustomizedLinearProgressBar: FC<Props> = ({
  progress,
}): ReactElement => {
  return (
    <div className={styles.linear_progress_bar}>
      <div className={styles.progress_bar}>
        <ColoredLinearProgress variant="determinate" value={progress} />
      </div>
      <div className={styles.progress_percent_values}>
        <span className={styles.percent_label}>{progress} %</span>
      </div>
    </div>
  )
}
