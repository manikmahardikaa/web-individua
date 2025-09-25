"use client";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Image, message, Upload, Popconfirm, UploadProps } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import { cropCenterAndResizeLandscape } from "./image-crop";

interface ImageItem {
  url: string;
  path: string;
}

const thumbnailW = 400;
const thumbnailH = 225;

interface SupaImageUploaderProps {
  bucket?: string;
  folder?: string;
  onUpload?: (path: string, url: string) => void;
  onDelete?: (path: string) => void;
  label?: string;
  previewStyle?: React.CSSProperties;
  value?: string | null; // <-- agar support Form.Item controlled
  onChange?: (value: string | null) => void; // <-- agar support Form.Item controlled
}

export default function SupaImageUploader({
  bucket = "",
  folder = "",
  onUpload,
  onDelete,
  value,
  onChange,
}: SupaImageUploaderProps) {
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(
    value ? { url: value, path: "" } : null
  );

  // Sinkronisasi dengan value dari Form.Item (edit/reset)
  useEffect(() => {
    if (value && (!previewImage || previewImage.url !== value)) {
      setPreviewImage({ url: value, path: "" });
    }
    if (!value) {
      setPreviewImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
  }: RcCustomRequestOptions) => {
    try {
      if (typeof file === "string" || !(file instanceof File)) {
        throw new Error("File upload tidak valid");
      }
      let urlImage;
      if (folder === "thumbnails") {
        urlImage = await cropCenterAndResizeLandscape(
          file,
          thumbnailW,
          thumbnailH
        );
      } else {
        urlImage = file;
      }

      const fileName = file.name ?? "uploaded-image";
      const filePath = folder
        ? `${folder}/${Date.now()}-${fileName}`
        : `${Date.now()}-${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, urlImage);

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        setPreviewImage({ url: publicUrl, path: filePath });
        onUpload?.(filePath, publicUrl);
        onChange?.(publicUrl); // <-- trigger Form.Item value!
        message.success("Upload berhasil!");
        onSuccess?.(filePath, publicUrl);
      } else {
        throw new Error("Gagal mendapatkan URL publik");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      message.error("Upload gagal: " + err.message);
      onError?.(err);
    }
  };

  const handleDelete = async () => {
    if (!previewImage?.path && !previewImage?.url) {
      onChange?.(null);
      setPreviewImage(null);
      return;
    }
    // Hapus dari Supabase hanya jika ada path
    if (previewImage?.path) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([previewImage.path]);
      if (error) {
        message.error("Gagal menghapus gambar: " + error.message);
        return;
      }
    }
    setPreviewImage(null);
    onDelete?.(previewImage?.path);
    onChange?.(null); // <-- kosongkan form
    message.success("Gambar berhasil dihapus!");
  };

  return (
    <div>
      {!previewImage && (
        <Upload.Dragger
          customRequest={handleUpload as UploadProps["customRequest"]}
          showUploadList={false}
          accept="image/*"
          multiple={false}
          style={{
            border: "2px dashed #d9d9d9",
            borderRadius: 12,
            background: "#fcfcfc",
            minHeight: 170,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div style={{ padding: 20, textAlign: "center" }}>
            <InboxOutlined style={{ fontSize: 40, color: "#aaa" }} />
            <div style={{ fontWeight: 600, fontSize: 16, marginTop: 10 }}>
              Drop your file here, or{" "}
              <span
                style={{
                  color: "#3a7bd5",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                browse
              </span>
            </div>
            <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
              JPG, PNG up to 5MB
            </div>
          </div>
        </Upload.Dragger>
      )}

      {previewImage && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#fcfcfc",
            border: "1.5px dashed #d9d9d9",
            padding: 0,
            borderRadius: 12,
            width: thumbnailW,
            height: thumbnailH,
            position: "relative", // <- wajib!
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          {/* Preview Image */}
          <Image
            src={previewImage.url}
            alt="Preview"
            width={thumbnailW}
            height={thumbnailH}
            style={{
              width: thumbnailW,
              height: thumbnailH,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #eee",
              background: "#fafbfc",
              display: "block",
              margin: "auto",
            }}
          />
          {/* Tombol Hapus di pojok kanan atas */}
          <Popconfirm
            title="Hapus gambar ini?"
            onConfirm={handleDelete}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="primary"
              size="small"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                background: "red",
                boxShadow: "0 2px 8px #00000014",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            />
          </Popconfirm>
        </div>
      )}
    </div>
  );
}
