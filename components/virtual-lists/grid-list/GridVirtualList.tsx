import { FixedSizeGrid as Grid } from 'react-window'
import React, { CSSProperties, FC, ReactElement } from 'react'

type Props = {
  columnCount: number
  columnWidth: number
  height: number
  rowCount: number
  rowHeight: number
  width: number
  styles: CSSProperties
  gap: number
  children: any
}

export const GridVirtualList: FC<Props> = ({
  columnCount,
  columnWidth,
  height,
  rowCount,
  rowHeight,
  width,
  gap,
  styles,
  children,
}): ReactElement => {
  // Adjust columnWidth and rowHeight to account for the gap
  const adjustedColumnWidth = columnWidth + gap
  const adjustedRowHeight = rowHeight + gap

  const itemRenderer = ({
    columnIndex,
    rowIndex,
    style,
    data,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
    data: any
  }) => {
    // Subtract gap from adjusted sizes to apply as padding, creating the visual gap effect
    const adjustedStyle: CSSProperties = {
      ...style,
      padding: `${gap / 2}px ${gap / 2}px`,
      //@ts-ignore
      width: style.width - gap,
      //@ts-ignore
      height: style.height - gap,
      boxSizing: 'border-box',
    }

    return React.createElement(children, {
      style: adjustedStyle,
      columnIndex,
      rowIndex,
      data,
    })
  }

  return (
    <Grid
      style={styles}
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={adjustedRowHeight}
      width={width}
    >
      {/*@ts-ignore*/}
      {children}
    </Grid>
  )
}
