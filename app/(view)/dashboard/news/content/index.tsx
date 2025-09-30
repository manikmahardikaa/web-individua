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
  PictureOutlined,
} from "@ant-design/icons";

// Komponen uploader (sudah mendukung value/onChange dari Form.Item)
import SupaImageUploader from "@/app/utils/image-uploader";

// Hooks
import { useNews, useNewsById } from "@/app/hooks/news";
import { NewsDataModel, NewsPayloadCreateModel } from "@/app/model/news";

const MAX_TITLE = 200;

/** ===================== Page ===================== */
export default function NewsPage() {
  const { message, notification } = AntdApp.useApp();

  // Hooks list + mutasi dari useNews
  const {
    data: newsData,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useNews({});

  // UI state
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail + update (aktif hanya saat editingId ada)
  const {
    data: detail,
    fetchLoading: detailLoading,
    onUpdate,
    onUpdateLoading,
  } = useNewsById({ id: editingId ?? "" });

  // Data list + filter
  const items = useMemo<NewsDataModel[]>(() => {
    const arr = (newsData ?? []) as NewsDataModel[];
    const q = search.trim().toLowerCase();
    return q ? arr.filter((x) => x.title.toLowerCase().includes(q)) : arr;
  }, [newsData, search]);

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
            News
          </Typography.Title>
          <Typography.Text type="secondary">
            Kelola daftar berita—thumbnail rapi, judul jelas, status aktif.
          </Typography.Text>
        </Space>
        <Space>
          <Input.Search
            placeholder="Cari judul…"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Tambah News
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
              description="Belum ada news"
            />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={items}
            rowKey={(x) => x.id}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  style={{ borderRadius: 16, overflow: "hidden" }}
                  cover={
                    item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
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
                        <PictureOutlined
                          style={{ fontSize: 40, color: "#bbb" }}
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
                      title="Hapus news ini?"
                      okText="Hapus"
                      cancelText="Batal"
                      okButtonProps={{
                        danger: true,
                        loading: !!onDeleteLoading,
                      }}
                      onConfirm={async () => {
                        try {
                          await onDelete?.(item.id);
                          message.success("News berhasil dihapus.");
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
                    <Badge
                      color={item.is_active ? "green" : "red"}
                      text={item.is_active ? "Aktif" : "Nonaktif"}
                    />
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Drawer
        title={editingId ? "Edit News" : "Tambah News"}
        width={640}
        open={open}
        onClose={closeDrawer}
        destroyOnClose
        styles={{ body: { paddingTop: 8 } }}
      >
        <NewsForm
          mode={editingId ? "edit" : "create"}
          submitting={!!(editingId ? onUpdateLoading : onCreateLoading)}
          initialData={
            editingId
              ? {
                  id: detail?.id ?? editingId,
                  title: detail?.title ?? "",
                  thumbnail: detail?.thumbnail ?? null,
                  is_active: detail?.is_active ?? true,
                }
              : undefined
          }
          onSubmit={async (payload) => {
            try {
              if (editingId) {
                await onUpdate?.({ id: editingId, payload });
                message.success("News berhasil diperbarui.");
              } else {
                await onCreate?.(payload);
                message.success("News berhasil dibuat.");
              }
              // ✅ Tutup drawer setelah sukses (create maupun edit)
              setEditingId(null);
              setOpen(false);
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

/** ===================== Form (Create/Edit) ===================== */
function NewsForm({
  mode,
  submitting,
  onSubmit,
  initialData,
}: {
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: NewsPayloadCreateModel) => Promise<void> | void;
  initialData?: {
    id?: string;
    title: string;
    thumbnail: string | null;
    is_active: boolean;
    description?: string | null;
  };
}) {
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm<NewsPayloadCreateModel>();

  const initialValues: NewsPayloadCreateModel =
    mode === "edit" && initialData
      ? {
          title: initialData.title ?? "",
          thumbnail: initialData.thumbnail ?? null,
          is_active: Boolean(initialData.is_active),
          description: initialData.description ?? null,
        }
      : { title: "", thumbnail: null, is_active: true, description: null };

  const handleFinish = async (values: NewsPayloadCreateModel) => {
    try {
      const payload: NewsPayloadCreateModel = {
        title: (values.title ?? "").trim().slice(0, MAX_TITLE),
        thumbnail: values.thumbnail ?? null,
        is_active: Boolean(values.is_active),
        description: values.description ?? null,
      };

      if (!payload.title) throw new Error("Judul wajib diisi.");
      if (!payload.thumbnail) throw new Error("Thumbnail wajib diunggah.");

      await onSubmit(payload);
      form.resetFields();
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
          <Input placeholder="Contoh: Program Posyandu Bulan Ini" />
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

        <Form.Item name="description" label="Deskripsi" required>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="is_active"
          valuePropName="checked"
          tooltip="Tentukan apakah news ini langsung tampil ke pengguna."
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
