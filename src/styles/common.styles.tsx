import type React from "react"
import { createStyles } from "antd-style"

export const commonStyles = createStyles(
  ({ token, css }, props: { stylesVal?: React.CSSProperties }) => ({
    container: {
      ...props.stylesVal
    }
  })
)
