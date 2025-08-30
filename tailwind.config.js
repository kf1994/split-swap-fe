/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./@next/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#141414",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#70ED7E",
          foreground: "#36451B"
        },
        secondary: {
          DEFAULT: "#141414",
          foreground: "hsl(var(--secondary-foreground))"
        },
        gray: {
          DEFAULT: "#252222",
          light: "#B1B1B1",
          dark: "#403E3E",
          bold: "#2B2B2B",
          middle: "#737978",
          gray1: "#474747",
          gray2: "#1F1F1F",
          grayBlack: "#151515",
          regular: "#8A8C8B"
        },
        green: {
          default: "#9EF502",
          dark: "#2b341b",
          middle: "#36451b",
          bold: "#202D23",
          gradient: "linear-gradient(90deg, #70ED7E 0%, #FDF174 100%)"
        },
        tints: {
          DEFAULT: "#302F2F",
          shade: "#434141",
          shade1: "#737978",
          shade2: "#403E3E"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        yellow: {
          DEFAULT: "#F0B90B"
        },
        orange: {
          DEFAULT: "#FF7B31"
        },
        red: {
          DEFAULT: "#FF5050"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      // borderRadius: {
      //   xl: "48px",
      //   lg: "24px",
      //   md: "16px",
      //   sm: "8px"
      // },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #70ED7E 0%, #FDF174 100%)",
        "secondary-gradient": "linear-gradient(90deg, #FDF174 0%, #70ED7E 100%)"
      }
    }
  }
  // plugins: [require("tailwindcss-animate")],
}
