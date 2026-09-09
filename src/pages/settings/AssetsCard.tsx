import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Space, Upload } from "antd";
import { toast } from "sonner";
import { saveSetting, useSettings, type Settings } from "../../data/fake/settings";
import { SettingsCard } from "./SettingsCard";

const MAX_CLIPS = 6;
const IMAGE = "image/png,image/jpeg,image/webp";
const VIDEO = "video/mp4";

/** A file picked here stays in the tab as an object URL; the API build signs an upload into storage instead. */
const pickUrl = (file: File) => URL.createObjectURL(file);

type SlotProps = { label: string; hint: string; accept: string; url: string | null; onPick: (url: string) => void; onClear: () => void };

function Slot({ label, hint, accept, url, onPick, onClear }: SlotProps) {
  return (
    <div className="asset-slot">
      <div className="asset-slot__text">
        <b>{label}</b>
        <span className="cell-muted">{hint}</span>
      </div>
      {url && <img className="cell-thumb" src={url} alt="" />}
      <Space>
        <Upload accept={accept} showUploadList={false} beforeUpload={(file) => { onPick(pickUrl(file)); return Upload.LIST_IGNORE; }}>
          <Button size="small" icon={<UploadOutlined />}>{url ? "Replace" : "Upload"}</Button>
        </Upload>
        {url && <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={`Remove ${label}`} onClick={onClear} />}
      </Space>
    </div>
  );
}

/** The logo, the backdrop and the onboarding clips the app shows; each saved the moment it is picked. */
export function AssetsCard() {
  const { assets } = useSettings();
  const put = (next: Settings["assets"], what: string) => {
    saveSetting("assets", next);
    toast.success(`${what} saved`, { description: "The app picks it up on its next launch." });
  };
  const clips = assets.onboarding_clip_urls;
  const full = clips.length >= MAX_CLIPS;
  return (
    <SettingsCard title="Assets" spot="assets">
      <p className="cell-muted" style={{ marginTop: 0 }}>The logo, the backdrop behind every screen, and the onboarding clips. Images and mp4 only.</p>
      <Slot label="Logo" hint="PNG or WebP with transparency, 512 × 512." accept={IMAGE} url={assets.logo_url} onPick={(url) => put({ ...assets, logo_url: url }, "Logo")} onClear={() => put({ ...assets, logo_url: null }, "Logo")} />
      <Slot label="Backdrop" hint="The picture every screen sits on. Portrait, 1080 × 1920 or larger." accept={IMAGE} url={assets.backdrop_url} onPick={(url) => put({ ...assets, backdrop_url: url }, "Backdrop")} onClear={() => put({ ...assets, backdrop_url: null }, "Backdrop")} />
      <div className="asset-slot asset-slot--clips">
        <div className="asset-slot__text">
          <b>Onboarding clips</b>
          <span className="cell-muted">Up to {MAX_CLIPS} short mp4s, played behind the intro in this order.</span>
        </div>
        <div className="asset-clips">
          {clips.map((url, i) => (
            <span key={url} className="chip chip--lavender">
              Clip {i + 1}
              <button type="button" aria-label={`Remove clip ${i + 1}`} onClick={() => put({ ...assets, onboarding_clip_urls: clips.filter((u) => u !== url) }, "Clips")}>×</button>
            </span>
          ))}
          <Upload accept={VIDEO} showUploadList={false} disabled={full} beforeUpload={(file) => { put({ ...assets, onboarding_clip_urls: [...clips, pickUrl(file)] }, "Clips"); return Upload.LIST_IGNORE; }}>
            <Button size="small" icon={<UploadOutlined />} disabled={full}>{full ? "Six clips is the most" : "Add clip"}</Button>
          </Upload>
        </div>
      </div>
    </SettingsCard>
  );
}
