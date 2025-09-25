"use client";

import {
  UploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Upload,
  Popconfirm,
  Typography,
  Progress,
} from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase-client";

const { Text } = Typography;

type MediaItem = {
  url: string;
  path: string; // path di bucket (untuk delete)
  name: string;
};

type SupaVideoUploaderProps = {
  bucket: string;
  folder?: string;
  label?: string;
  maxSizeMB?: number;
  value?: string | null;
  onChange?: (val: string | null) => void;
  onUpload?: (path: string, url: string) => void;
  onDelete?: (path: string | null) => void;
  accept?: string;
  upsert?: boolean;
};

export default function SupaVideoUploader({
  bucket,
  folder = "",
  label = "Upload Video",
  maxSizeMB = 300,
  value,
  onChange,
  onUpload,
  onDelete,
  accept = "video/mp4,video/webm,video/ogg,video/quicktime",
  upsert = false,
}: SupaVideoUploaderProps) {
  const [media, setMedia] = useState<MediaItem | null>(
    value
      ? { url: value, path: "", name: value.split("/").pop() || "video" }
      : null
  );

  // ---- upload animation states ----
  const [isUploading, setIsUploading] = useState(false);
  const [uploadName, setUploadName] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // sinkronkan dari value (controlled)
  useEffect(() => {
    if (value && (!media || media.url !== value)) {
      setMedia({
        url: value,
        path: "",
        name: value.split("/").pop() || "video",
      });
    }
    if (!value) setMedia(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const mbToBytes = (mb: number) => mb * 1024 * 1024;

  const canShowPlayer = useMemo(() => {
    if (!media?.url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(media.url);
  }, [media?.url]);

  // ---- fake progress controller ----
  const startProgress = () => {
    setPercent(0);
    setIsUploading(true);
    // naik pelan ke 90%
    timerRef.current = setInterval(() => {
      setPercent((p) => {
        if (p >= 90) return p;
        // naik acak 2-5%
        const inc = 2 + Math.round(Math.random() * 3);
        return Math.min(p + inc, 90);
      });
    }, 220);
  };

  const finishProgress = () => {
    // loncat ke 100 lalu tutup animasi
    setPercent(100);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeout(() => {
      setIsUploading(false);
      setUploadName("");
      setPercent(0);
    }, 350);
  };

  const failProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPercent(0);
    setIsUploading(false);
  };

  const handleUpload = async ({
    file,
    onError,
    onSuccess,
  }: RcCustomRequestOptions) => {
    try {
      if (typeof file === "string" || !(file instanceof File)) {
        throw new Error("File upload tidak valid");
      }
      // validasi ukuran
      if (file.size > mbToBytes(maxSizeMB)) {
        throw new Error(`Ukuran maksimal ${maxSizeMB}MB`);
      }
      // validasi tipe
      const mime = file.type || "";
      if (!/^video\//.test(mime)) {
        throw new Error("Tipe file harus video");
      }

      // mulai animasi
      setUploadName(file.name);
      startProgress();

      const safeName = file.name.replace(/\s+/g, "_");
      const filePath = folder
        ? `${folder}/${Date.now()}-${safeName}`
        : `${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: mime || "video/mp4",
          upsert,
          cacheControl: "3600",
        });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Gagal mendapatkan URL publik");

      const item: MediaItem = {
        url: publicUrl,
        path: filePath,
        name: file.name,
      };
      setMedia(item);
      onChange?.(publicUrl);
      onUpload?.(filePath, publicUrl);
      message.success("Video berhasil diupload!");

      // akhiri animasi
      finishProgress();
      onSuccess?.(filePath);
    } catch (err) {
      const e = err as Error;
      message.error(`Upload gagal: ${e.message}`);
      failProgress();
      onError?.(e);
    }
  };

  const handleDelete = async () => {
    if (!media) return;
    if (media.path) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([media.path]);
      if (error) {
        message.error(`Gagal menghapus video: ${error.message}`);
        return;
      }
    }
    onDelete?.(media.path || null);
    setMedia(null);
    onChange?.(null);
    message.success("Video berhasil dihapus!");
  };

  return (
    <div>
      {/* Tombol Upload */}
      {!media && !isUploading && (
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          multiple={false}
          accept={accept}
          disabled={isUploading}
        >
          <Button icon={<UploadOutlined />}>{label}</Button>
        </Upload>
      )}

      {/* Panel Animasi Upload */}
      {isUploading && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            border: "1px dashed #d9d9d9",
            background:
              "linear-gradient(90deg, #fafafa 0%, #fff 50%, #fafafa 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s linear infinite",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#1677ff",
                boxShadow: "0 0 0 0 rgba(22,119,255,0.7)",
                animation: "pulse 1.4s infinite",
                flexShrink: 0,
              }}
            />
            <Text strong>Mengunggah video…</Text>
            {uploadName && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {uploadName}
              </Text>
            )}
            <LoadingOutlined style={{ marginLeft: "auto", color: "#1677ff" }} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Progress percent={percent} status="active" />
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: 0% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
            @keyframes pulse {
              0% {
                transform: scale(0.9);
                box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.7);
              }
              70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(22, 119, 255, 0);
              }
              100% {
                transform: scale(0.9);
                box-shadow: 0 0 0 0 rgba(22, 119, 255, 0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Preview + Hapus */}
      {media && !isUploading && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 12,
            background: "#f7f7f7",
            border: "1px dashed #d9d9d9",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PlayCircleOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            <div style={{ lineHeight: 1.2 }}>
              <Text strong>{media.name}</Text>
              <div>
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  Buka di tab baru
                </a>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Popconfirm
                title="Hapus video ini?"
                onConfirm={handleDelete}
                okText="Ya"
                cancelText="Batal"
              >
                <Button danger type="primary" icon={<DeleteOutlined />}>
                  Hapus
                </Button>
              </Popconfirm>
            </div>
          </div>

          {canShowPlayer && (
            <video
              key={media.url}
              controls
              style={{
                width: "100%",
                maxHeight: 380,
                borderRadius: 8,
                background: "#000",
              }}
              src={media.url}
            />
          )}
        </div>
      )}
    </div>
  );
}
