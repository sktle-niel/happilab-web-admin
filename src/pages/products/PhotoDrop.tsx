import { CloudUploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { useState } from "react";
import { toast } from "sonner";
import { uploadFile } from "../../lib/uploads";

const ACCEPT = "image/png,image/jpeg,image/webp";

type Props = { value?: string; onChange?: (url: string) => void };

/**
 * The product photo: drop it or click to browse. The file goes straight
 * into storage through a URL the API signs, and the public URL is what
 * the form keeps; until it lands, the drop zone says so.
 */
export function PhotoDrop({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  const pick = (file: File) => {
    setBusy(true);
    uploadFile("product", file)
      .then((url) => onChange?.(url), (error: Error) => toast.error(error.message))
      .finally(() => setBusy(false));
    return Upload.LIST_IGNORE;
  };

  return (
    <Upload.Dragger className="photo-drop" accept={ACCEPT} multiple={false} showUploadList={false} disabled={busy} beforeUpload={pick}>
      <CloudUploadOutlined className="photo-drop__icon" />
      <span className="upload-btn">{busy ? "Uploading…" : value ? "Replace photo" : "Upload"}</span>
      <p className="photo-drop__title">Drop the product photo here, or click to browse</p>
      <p className="photo-drop__hint">Square, 800 × 800 or larger. PNG, JPG or WebP.</p>
      {value && (
        <div className="photo-drop__file">
          <img src={value} alt="" />
          <span>This is the photo members will see.</span>
        </div>
      )}
    </Upload.Dragger>
  );
}
