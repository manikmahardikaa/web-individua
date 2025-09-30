/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  App as AntdApp,
  Badge,
  Button,
  Card,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  YoutubeOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import {
  useVideoInformation,
  useVideoInformations,
} from "@/app/hooks/video-information";
import {
  VideoInformationDataModel,
  VideoInformationPayloadCreateModel,
} from "@/app/model/video-information";
import SupaImageUploader from "@/app/utils/image-uploader";

/* ================= Helpers ================= */
const MAX_TITLE = 200;
const MAX_DESC = 500;
const MAX_URL = 500;

// Ambil videoId YouTube dari berbagai format URL
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // youtube.com/embed/<id> atau /shorts/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "shorts" && parts[1]) return parts[1];
    }
    return null;
  } catch {
    return null;
  }
}

function isValidUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* ================= Page ================= */
export default function VideoInformationPage() {
  const { message, notification } = AntdApp.useApp();

  const {
    data: videos,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useVideoInformations({});

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    data: detail,
    fetchLoading: detailLoading,
    onUpdate,
    onUpdateLoading,
  } = useVideoInformation({ id: editingId ?? "" });

  const items = useMemo<VideoInformationDataModel[]>(() => {
    const arr = (videos ?? []) as VideoInformationDataModel[];
    const q = search.trim().toLowerCase();
    return q
      ? arr.filter(
          (x) =>
            x.title.toLowerCase().includes(q) ||
            (x.description ?? "").toLowerCase().includes(q)
        )
      : arr;
  }, [videos, search]);

  const startCreate = () => {
    setEditingId(null);
    setOpen(true);
  };
  const startEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };
  const closeDrawer = () => setOpen(false);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Video Information
          </Typography.Title>
          <Typography.Text type="secondary">
            Kelola daftar video—judul, tautan YouTube, deskripsi, dan status.
          </Typography.Text>
        </Space>
        <Space>
          <Input.Search
            placeholder="Cari judul/deskipsi…"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Tambah Video
          </Button>
        </Space>
      </Flex>

      <Card bodyStyle={{ padding: 0, borderRadius: 16 }}>
        {fetchLoading ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <Spin />
          </div>
        ) : (items?.length ?? 0) === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty
              image={<PictureOutlined style={{ fontSize: 48 }} />}
              description="Belum ada video"
            />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={items}
            rowKey={(x) => x.id}
            renderItem={(item) => {
              const vid = getYouTubeId(item.url);
              const thumb = vid
                ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
                : null;
              return (
                <List.Item>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, overflow: "hidden" }}
                    cover={
                      thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#fafafa",
                          }}
                        >
                          <YoutubeOutlined
                            style={{ fontSize: 48, color: "#d32d2f" }}
                          />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        key="edit"
                        icon={<EditOutlined />}
                        onClick={() => startEdit(item.id)}
                      >
                        Edit
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Hapus video ini?"
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{
                          danger: true,
                          loading: !!onDeleteLoading,
                        }}
                        onConfirm={async () => {
                          try {
                            await onDelete?.(item.id);
                            message.success("Video berhasil dihapus.");
                          } catch (e: any) {
                            notification.error({
                              message: "Gagal Hapus",
                              description: e?.message || String(e),
                            });
                          }
                        }}
                      >
                        <Button danger type="text" icon={<DeleteOutlined />}>
                          Hapus
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Space
                      direction="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {item.title}
                      </Typography.Text>
                      <Typography.Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 4 }}
                      >
                        {item.description}
                      </Typography.Paragraph>
                      <Space align="center">
                        <Badge
                          color={item.is_active ? "green" : "red"}
                          text={item.is_active ? "Aktif" : "Nonaktif"}
                        />
                        <Button
                          type="link"
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<YoutubeOutlined />}
                        >
                          Buka Link
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Drawer
        title={editingId ? "Edit Video" : "Tambah Video"}
        width={680}
        open={open}
        onClose={closeDrawer}
        destroyOnClose
        styles={{ body: { paddingTop: 8 } }}
      >
        <VideoForm
          mode={editingId ? "edit" : "create"}
          submitting={!!(editingId ? onUpdateLoading : onCreateLoading)}
          initialData={
            editingId
              ? {
                  id: detail?.id ?? editingId,
                  title: detail?.title ?? "",
                  url: detail?.url ?? "",
                  thumbnail: detail?.thumbnail ?? "",
                  description: detail?.description ?? "",
                  is_active: detail?.is_active ?? true,
                }
              : undefined
          }
          onSubmit={async (payload) => {
            try {
              if (editingId) {
                await onUpdate?.({ id: editingId, payload });
                message.success("Video berhasil diperbarui.");
              } else {
                await onCreate?.(payload);
                message.success("Video berhasil dibuat.");
              }
              setEditingId(null);
              closeDrawer(); // ✅ tutup drawer setelah sukses
            } catch (e: any) {
              notification.error({
                message: "Gagal Simpan",
                description: e?.message || String(e),
              });
            }
          }}
        />

        {editingId && detailLoading && (
          <div className="mt-4">
            <Spin /> <Typography.Text>Memuat detail…</Typography.Text>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ===================== Form ===================== */
function VideoForm({
  mode,
  submitting,
  onSubmit,
  initialData,
}: {
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (
    payload: VideoInformationPayloadCreateModel
  ) => Promise<void> | void;
  initialData?: {
    id?: string;
    title: string;
    url: string;
    thumbnail: string | null;
    description?: string;
    is_active: boolean;
  };
}) {
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm<VideoInformationPayloadCreateModel>();

  const initialValues: VideoInformationPayloadCreateModel =
    mode === "edit" && initialData
      ? {
          title: initialData.title ?? "",
          url: initialData.url ?? "",
          thumbnail: initialData.thumbnail ?? "",
          description: initialData.description ?? "",
          is_active: Boolean(initialData.is_active),
        }
      : {
          title: "",
          url: "",
          description: "",
          is_active: true,
          thumbnail: "",
        };

  const handleFinish = async (values: VideoInformationPayloadCreateModel) => {
    try {
      const payload: VideoInformationPayloadCreateModel = {
        title: (values.title ?? "").trim().slice(0, MAX_TITLE),
        url: (values.url ?? "").trim().slice(0, MAX_URL),
        thumbnail: values.thumbnail ?? null,
        description: (values.description ?? "").trim().slice(0, MAX_DESC),
        is_active: Boolean(values.is_active),
      };

      if (!payload.title) throw new Error("Judul wajib diisi.");
      if (!payload.url) throw new Error("Link (URL) wajib diisi.");
      if (!isValidUrl(payload.url)) throw new Error("URL tidak valid.");
      // optional: peringatan jika bukan domain YouTube
      const host = (() => {
        try {
          return new URL(payload.url).hostname;
        } catch {
          return "";
        }
      })();
      const isYT = host.includes("youtube.com") || host.includes("youtu.be");
      if (!isYT) {
        // bukan error fatal, tapi beri info
        notification.info({
          message: "URL Bukan YouTube?",
          description:
            "Link tidak terdeteksi sebagai URL YouTube. Pastikan link benar bila ingin thumbnail otomatis.",
        });
      }

      await onSubmit(payload);
      form.resetFields(); // bersihkan form setelah sukses
    } catch (e: any) {
      notification.error({
        message: "Gagal Simpan",
        description: e?.message || String(e),
      });
    }
  };

  return (
    <Card style={{ borderRadius: 16 }} styles={{ body: { paddingTop: 12 } }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Judul"
          name="title"
          rules={[
            { required: true, message: "Judul wajib diisi" },
            { max: MAX_TITLE, message: `Maksimal ${MAX_TITLE} karakter` },
          ]}
        >
          <Input placeholder="Judul Video" />
        </Form.Item>

        <Form.Item
          label="Link Video (YouTube)"
          name="url"
          rules={[
            { required: true, message: "URL wajib diisi" },
            {
              validator: async (_, v) => {
                const val = String(v ?? "").trim();
                if (!val) return Promise.resolve();
                return isValidUrl(val)
                  ? Promise.resolve()
                  : Promise.reject(new Error("URL tidak valid"));
              },
            },
            { max: MAX_URL, message: `Maksimal ${MAX_URL} karakter` },
          ]}
          tooltip="Tempelkan link video YouTube (watch/shorts/embed atau youtu.be)."
        >
          <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </Form.Item>

        <Form.Item
          label="Thumbnail"
          name="thumbnail"
          required
          rules={[
            {
              validator: async (_, v) =>
                v
                  ? Promise.resolve()
                  : Promise.reject(new Error("Thumbnail wajib diunggah")),
            },
          ]}
        >
          {/* Sesuaikan bucket/folder Supabase-mu */}
          <SupaImageUploader bucket="web-yoga" folder="thumbnails" />
        </Form.Item>

        <Form.Item
          label="Deskripsi"
          name="description"
          rules={[{ max: MAX_DESC, message: `Maksimal ${MAX_DESC} karakter` }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder="Tulis ringkasan atau catatan video (opsional)"
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="is_active"
          valuePropName="checked"
          tooltip="Tentukan apakah video ini langsung tampil ke pengguna."
          initialValue={initialValues.is_active}
        >
          <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
        </Form.Item>

        <Flex gap={12} justify="end">
          <Button onClick={() => form.resetFields()} disabled={!!submitting}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={!!submitting}
          >
            {mode === "edit" ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </Flex>
      </Form>
    </Card>
  );
}
