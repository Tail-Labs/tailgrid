/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: "src/**/*.stories.{ts,tsx}",
  viteConfig: "./vite.config.ts",
  defaultStory: "tailgrid--default",
  addons: {
    width: {
      enabled: true,
      options: {
        xsmall: 414,
        small: 640,
        medium: 768,
        large: 1024,
        xlarge: 1280,
      },
      defaultState: 0, // full width
    },
    theme: {
      enabled: true,
      defaultState: "light",
    },
    rtl: {
      enabled: false,
    },
    ladle: {
      enabled: true,
    },
    source: {
      enabled: true,
      defaultState: false,
    },
  },
};
