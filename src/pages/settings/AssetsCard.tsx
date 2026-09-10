import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Space, Upload } from "antd";
import { useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../../data/types";
import { uploadFile, type UploadKind } from "../../lib/uploads";
import { useSaveSetting, useSettings } from "../../lib/useSettings";
import { useIsOwner } from "../../providers/session";
import { SettingsCard } from "./SettingsCard";

const MAX_CLIPS = 6;
const IMAGE = "image/png,image/jpeg,image/webp";
const VIDEO = "video/mp4";

type SlotProps = { label: string; hint: string; accept: string; kind: UploadKind; url: string | null; busy: boolean; canChange: boolean; onPick: (file: File) => void; onClear: () => void };

function Slot({ label, hint, accept, url, busy, canChange, onPick, onClear }: SlotProps) {
  return (
    <div className="asset-slot">
      <div className="asset-slot__text">
        <b>{label}</b>
        <span className="cell-muted">{hint}</span>
      </div>
      {url && <img className="cell-thumb" src={url} alt="" />}
      {canChange && (
      <Space>
        <Upload accept={accept} showUploadList={false} disabled={busy} beforeUpload={(file) => { onPick(file); return Upload.LIST_IGNORE; }}>
          <Button size="small" icon={<UploadOutlined />} loading={busy}>{url ? "Replace" : "Upload"}</Button>
        </Upload>
        {url && <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={`Remove ${label}`} onClick={onClear} />}
      </Space>
      )}
    </div>
  );
}

/** The logo, the backdrop and the onboarding clips the app shows; each goes into storage and is saved the moment it lands. */
export function AssetsCard() {
  const { settings } = useSettings();
  const { save } = useSaveSetting();
  const owner = useIsOwner();
  const [busy, setBusy] = useState<UploadKind | null>(null);
  const assets = settings?.assets;
  if (!assets) return <SettingsCard title="Assets" spot="assets"><p className="cell-muted">Loading…</p></SettingsCard>;

  const put = (next: Settings["assets"], what: string) => save({ key: "assets", value: next }).then(() => toast.success(`${what} saved`, { description: "The app picks it up on its next launch." }), (error: Error) => toast.error(error.message));
  const upload = (kind: UploadKind, file: File, keep: (url: string) => Settings["assets"], what: string) => {
    setBusy(kind);
    uploadFile(kind, file)
      .then((url) => put(keep(url), what), (error: Error) => toast.error(error.message))
      .finally(() => setBusy(null));
  };
  const clips = assets.onboardingClipUrls;
  const full = clips.length >= MAX_CLIPS;
  return (
    <SettingsCard title="Assets" spot="assets">
      <p className="cell-muted" style={{ marginTop: 0 }}>The logo, the backdrop behind every screen, and the onboarding clips. Images and mp4 only.</p>
      <Slot canChange={owner} label="Logo" hint="PNG or WebP with transparency, 512 × 512." accept={IMAGE} kind="logo" url={assets.logoUrl} busy={busy === "logo"} onPick={(file) => upload("logo", file, (url) => ({ ...assets, logoUrl: url }), "Logo")} onClear={() => put({ ...assets, logoUrl: null }, "Logo")} />
      <Slot canChange={owner} label="Backdrop" hint="The picture every screen sits on. Portrait, 1080 × 1920 or larger." accept={IMAGE} kind="backdrop" url={assets.backdropUrl} busy={busy === "backdrop"} onPick={(file) => upload("backdrop", file, (url) => ({ ...assets, backdropUrl: url }), "Backdrop")} onClear={() => put({ ...assets, backdropUrl: null }, "Backdrop")} />
      <div className="asset-slot asset-slot--clips">
        <div className="asset-slot__text">
          <b>Onboarding clips</b>
          <span className="cell-muted">Up to {MAX_CLIPS} short mp4s, played behind the intro in this order.</span>
        </div>
        <div className="asset-clips">
          {clips.map((url, i) => (
            <span key={url} className="chip chip--lavender">
              Clip {i + 1}
              <button type="button" aria-label={`Remove clip ${i + 1}`} onClick={() => put({ ...assets, onboardingClipUrls: clips.filter((u) => u !== url) }, "Clips")}>×</button>
            </span>
          ))}
          <Upload accept={VIDEO} showUploadList={false} disabled={full || busy === "clip"} beforeUpload={(file) => { upload("clip", file, (url) => ({ ...assets, onboardingClipUrls: [...clips, url] }), "Clips"); return Upload.LIST_IGNORE; }}>
            <Button size="small" icon={<UploadOutlined />} disabled={full} loading={busy === "clip"}>{full ? "Six clips is the most" : "Add clip"}</Button>
          </Upload>
        </div>
      </div>
    </SettingsCard>
  );
}
