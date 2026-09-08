import type { ThemeConfig } from "antd";

/** Ant Design, dressed as the dashboard: ink primary, soft radii, shadow-thin borders, one font. */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#141414",
    colorInfo: "#141414",
    colorSuccess: "#4f7a00",
    colorWarning: "#a8690f",
    colorError: "#c73e3e",
    colorText: "#141414",
    colorTextSecondary: "#5c5c59",
    colorBorder: "#e6e6e2",
    colorBorderSecondary: "#eeeeea",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f6f6f4",
    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 14,
    controlHeight: 38,
    controlItemBgActive: "#f4f4f1",
    controlItemBgActiveHover: "#eeeeea",
    controlItemBgHover: "#fafaf8",
    motionDurationFast: "0.12s",
    motionDurationMid: "0.18s",
    motionEaseOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  components: {
    Button: { fontWeight: 600, primaryShadow: "none", defaultShadow: "none" },
    Table: { headerBg: "#fafaf8", headerColor: "#5c5c59", borderColor: "#eeeeea", rowHoverBg: "#fafaf8", cellPaddingBlock: 13 },
    Tag: { borderRadiusSM: 999 },
    Select: { optionSelectedBg: "#f4f4f1", optionSelectedColor: "#141414", optionSelectedFontWeight: 600, optionActiveBg: "#fafaf8" },
    Menu: { itemSelectedBg: "#f4f4f1", itemSelectedColor: "#141414" },
    Segmented: { itemSelectedBg: "#141414", itemSelectedColor: "#ffffff", trackBg: "#efefec" },
    Form: { labelColor: "#5c5c59", labelFontSize: 13 },
  },
};
