import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#7132f5',
    colorSuccess: '#149e61',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#7132f5',
    borderRadius: 12,
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 16,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f9fa',
    colorBorder: '#dedee5',
    colorText: '#101114',
    colorTextSecondary: '#686b82',
    colorTextTertiary: '#9497a9',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 44,
      paddingContentHorizontal: 16,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 44,
    },
    Select: {
      borderRadius: 12,
      controlHeight: 44,
    },
    Table: {
      borderRadius: 12,
    },
    Modal: {
      borderRadius: 12,
    },
    Menu: {
      borderRadius: 12,
    },
    Tag: {
      borderRadius: 6,
    },
    Badge: {
      borderRadius: 6,
    },
    Tabs: {
      borderRadius: 12,
    },
  },
};

export const colors = {
  primary: '#7132f5',
  primaryDark: '#5741d8',
  primaryDeep: '#5b1ecf',
  primarySubtle: 'rgba(133, 91, 251, 0.16)',
  text: '#101114',
  gray: '#686b82',
  grayLight: '#9497a9',
  border: '#dedee5',
  white: '#ffffff',
  bgGray: 'rgba(148, 151, 169, 0.08)',
  success: '#149e61',
  successBg: 'rgba(20, 158, 97, 0.16)',
  successText: '#026b3f',
  warning: '#d97706',
  error: '#dc2626',
  errorBg: 'rgba(220, 38, 38, 0.12)',
  neutralBg: 'rgba(104, 107, 130, 0.12)',
  neutralText: '#484b5e',
};
