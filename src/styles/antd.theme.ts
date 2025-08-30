import { type MappingAlgorithm } from "antd"
import { Anta } from "next/font/google"
import {
  type AliasToken,
  type MapToken,
  type OverrideToken,
  type SeedToken
} from "antd/es/theme/interface"
import { type GetAntdTheme } from "antd-style/lib/types"

const anta = Anta({
  weight: "400",
  style: ["normal"],
  subsets: ["latin"]
})

interface ThemeConfig<T = unknown> {
  token?: Partial<AliasToken | MapToken | SeedToken> & T
  components?: OverrideToken
  algorithm?: MappingAlgorithm | MappingAlgorithm[]
  hashed?: boolean
  inherit?: boolean
}

export const theme: ThemeConfig = {
  token: {
    fontSize: 14,
    colorPrimary: "#2563eb",
    fontFamily: anta.style.fontFamily
  },
  components: {
    Typography: {
      fontSizeHeading1: 60,
      colorTextHeading: "#fff",
      colorText: "#fff",
      fontSizeLG: 16
    },
    Button: {
      fontSize: 14,
      controlHeight: 40
    }
  }
}

export const getAntdTheme: GetAntdTheme = (
  appearance
): ThemeConfig | undefined => {
  return appearance === "light"
    ? theme
    : {
        ...theme,
        components: {
          ...theme.components,
          Typography: {
            ...theme.components?.Typography,
            colorTextHeading: "black",
            colorText: "black"
          }
        }
      }
}

export interface ICustomToken {
  textSlateColor: string
  grayColor: string
  darkGrayColor: string
  lightGrayColor: string
  lightSilverColor: string
  blackColor: string
  gray64Color: string
  vividOrangeColor: string
  snowColor: string
  semitransparentBlack: string
  charcoalColor: string
  metalicSilverColor: string
  vibrantBlueColor: string
  whiteSmokeColor: string
  royalBlueColor: string
  saphireBlue: string
  regentGrayColor: string
  quilGrayColor: string
  sandStoneColor: string
  springWoodColor: string
  semiTransparentWhiteColor: string
  whiteGray400: string
  successColor: string
  whiteColor: string
}

// By extending the CustomToken object type definition for antd-style, you can add corresponding token objects to useTheme
declare module "antd-style" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface CustomToken extends ICustomToken {}
}
