import type { ThemeConfig } from "antd";

/** Ant Design, dressed as the dashboard: lime primary, ink text, soft radii, one font. */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#2c2c2c",
    colorInfo: "#2c2c2c",
    colorSuccess: "#5f8a00",
    colorWarning: "#b7791f",
    colorError: "#c73e3e",
    colorText: "#161616",
    colorTextSecondary: "#5f5f5c",
    colorBorder: "#e8e8e4",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f4f4f1",
    borderRadius: 14,
    borderRadiusLG: 22,
    borderRadiusSM: 10,
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 14,
    controlHeight: 40,
  },
  components: {
    Button: { borderRadius: 999, borderRadiusLG: 999, borderRadiusSM: 999, fontWeight: 700, primaryShadow: "none" },
    Input: { borderRadius: 999, paddingInline: 16 },
    Select: { borderRadius: 999 },
    Table: { headerBg: "#f4f4f1", headerColor: "#5f5f5c", borderColor: "#eeeeea", rowHoverBg: "#fafaf7", cellPaddingBlock: 14 },
    Tag: { borderRadiusSM: 999 },
    Card: { borderRadiusLG: 22 },
    Modal: { borderRadiusLG: 22 },
    Form: { labelColor: "#5f5f5c" },
  },
};
