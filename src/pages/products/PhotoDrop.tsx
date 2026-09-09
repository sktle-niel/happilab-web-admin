import { CloudUploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { useRef } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp";

type Props = { value?: string; onChange?: (url: string) => void };

/**
 * The product photo: drop it or click to browse. On bundled data the file
 * stays in the browser as an object URL; the API build signs an upload,
 * puts the file into storage and keeps the public URL instead. A saved
 * URL is never revoked, only a pick that was replaced before saving.
 */
export function PhotoDrop({ value, onChange }: Props) {
  const picked = useRef<string | null>(null);

  const pick = (file: File) => {
    if (picked.current) URL.revokeObjectURL(picked.current);
    picked.current = URL.createObjectURL(file);
    onChange?.(picked.current);
    return Upload.LIST_IGNORE;
  };

  return (
    <Upload.Dragger className="photo-drop" accept={ACCEPT} multiple={false} showUploadList={false} beforeUpload={pick}>
      <CloudUploadOutlined className="photo-drop__icon" />
      <span className="upload-btn">{value ? "Replace photo" : "Upload"}</span>
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
