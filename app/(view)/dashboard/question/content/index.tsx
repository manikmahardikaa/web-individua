/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  App as AntdApp,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { theme as antdTheme } from "antd";
import { useQuestions, useQuestion } from "@/app/hooks/question";

/** ===================== Tipe lokal ====================== */
type QuestionOptionInput = { value: string };
type QuestionPayload = { question: string; options: QuestionOptionInput[] };

const MAX_QUESTION = 255; // @db.VarChar(255)
const MAX_VALUE = 100; // @db.VarChar(100)

/** ===================== Util ====================== */
function ensureUnique(arr: Array<Record<string, any>>, key: string) {
  const seen = new Set<string>();
  for (const it of arr) {
    const v = String(it?.[key] ?? "").trim();
    if (!v) return false;
    if (seen.has(v)) return false;
    seen.add(v);
  }
  return true;
}

/** ===================== Halaman Utama ====================== */
export default function QuestionContent() {
  const { message, notification } = AntdApp.useApp();

  const { token } = antdTheme.useToken();

  // List + actions
  const {
    data,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useQuestions({});

  // State drawer / edit
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const arr = data ?? [];
    const q = search.trim().toLowerCase();
    return q
      ? arr.filter((x: any) => String(x.question).toLowerCase().includes(q))
      : arr;
  }, [data, search]);

  // Detail + update (hanya aktif saat editingId ada)
  const {
    data: detail,
    fetchLoading: detailLoading,
    onUpdate,
    onUpdateLoading,
  } = useQuestion({ id: editingId ?? "" });

  const currentEditing = useMemo(() => {
    if (!editingId) return null;
    if (detail?.id) return detail as any;
    return (data ?? []).find((q: any) => q.id === editingId) || null;
  }, [editingId, detail, data]);

  const openCreate = () => {
    setEditingId(null);
    setOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };
  const closeDrawer = () => setOpen(false);

  const handleDelete = async (id: string) => {
    try {
      await onDelete?.(id);
      message.success("Pertanyaan dihapus.");
    } catch (e: any) {
      notification.error({
        message: "Gagal Hapus",
        description: e?.message || String(e),
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Pertanyaan
          </Typography.Title>
          <Typography.Text type="secondary">
            Kelola bank pertanyaan yang akan dipakai di screening.
          </Typography.Text>
        </Space>
        <Space>
          <Input.Search
            allowClear
            placeholder="Cari pertanyaan…"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tambah Pertanyaan
          </Button>
        </Space>
      </Flex>

      <Card
        style={{
          borderRadius: 16,
          borderColor: token.colorBorderSecondary,
        }}
        bodyStyle={{ padding: 0 }}
      >
        {fetchLoading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <Spin />
          </div>
        ) : (items?.length ?? 0) === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty
              description={
                <Space direction="vertical" size={0}>
                  <Typography.Text>Belum ada pertanyaan</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Klik “Tambah Pertanyaan” untuk membuat yang pertama.
                  </Typography.Text>
                </Space>
              }
            />
          </div>
        ) : (
          <List
            dataSource={items}
            rowKey={(q: any) => q.id}
            renderItem={(q: any, idx) => (
              <>
                {idx !== 0 && <Divider style={{ margin: 0 }} />}
                <div style={{ padding: 20 }}>
                  <Flex
                    align="start"
                    justify="space-between"
                    gap={16}
                    wrap="wrap"
                  >
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ flex: 1, minWidth: 240 }}
                    >
                      <Flex align="center" gap={8} wrap="wrap">
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {q.question}
                        </Typography.Title>
                        <Badge
                          count={`${(q.options ?? []).length} opsi`}
                          style={{ backgroundColor: token.colorPrimary }}
                        />
                      </Flex>
                      <Space wrap>
                        {(q.options ?? []).map((op: any) => (
                          <Tag key={op.id || op.value}>{op.value}</Tag>
                        ))}
                      </Space>
                    </Space>

                    <Space split={<Divider type="vertical" />} wrap>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => openEdit(q.id)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Hapus pertanyaan ini?"
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{
                          danger: true,
                          loading: !!onDeleteLoading,
                        }}
                        onConfirm={() => handleDelete(q.id)}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          loading={!!onDeleteLoading}
                        >
                          Hapus
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Flex>
                </div>
              </>
            )}
          />
        )}
      </Card>

      <Drawer
        title={editingId ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
        width={720}
        open={open}
        onClose={closeDrawer}
        destroyOnClose
        styles={{ body: { paddingTop: 8 } }}
      >
        <QuestionForm
          mode={editingId ? "edit" : "create"}
          loadingSubmit={!!(editingId ? onUpdateLoading : onCreateLoading)}
          initialData={
            editingId
              ? {
                  id: currentEditing?.id,
                  question: currentEditing?.question ?? "",
                  options: (currentEditing?.options || []).map((o: any) => ({
                    value: String(o?.value ?? ""),
                  })) || [{ value: "" }],
                }
              : undefined
          }
          onSubmit={async (payload) => {
            try {
              if (editingId) {
                await onUpdate?.({ id: editingId, payload });
                message.success("Pertanyaan diperbarui.");
              } else {
                await onCreate?.(payload);
                message.success("Pertanyaan dibuat.");
              }

              // ⬇️ penting: tutup drawer & reset state setelah sukses
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

/** ===================== Form (Create/Edit) ====================== */
function QuestionForm({
  mode,
  loadingSubmit,
  onSubmit,
  initialData,
}: {
  mode: "create" | "edit";
  loadingSubmit?: boolean;
  onSubmit: (payload: QuestionPayload) => Promise<void> | void;
  initialData?: {
    id?: string;
    question: string;
    options: QuestionOptionInput[];
  };
}) {
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm<QuestionPayload>();

  const initialValues: QuestionPayload =
    mode === "edit" && initialData
      ? {
          question: initialData.question ?? "",
          options: initialData.options?.length
            ? initialData.options
            : [{ value: "" }],
        }
      : { question: "", options: [{ value: "" }] };

  const handleFinish = async (values: QuestionPayload) => {
    try {
      const cleanedOptions = (values.options || [])
        .map((o) => ({ value: (o.value ?? "").trim().slice(0, MAX_VALUE) }))
        .filter((o) => !!o.value);

      if (!values.question?.trim()) {
        throw new Error("Pertanyaan wajib diisi.");
      }
      if (cleanedOptions.length < 1) {
        throw new Error("Minimal diperlukan 1 opsi jawaban.");
      }
      if (!ensureUnique(cleanedOptions, "value")) {
        throw new Error(
          "Nilai 'value' pada opsi harus unik dan tidak boleh kosong."
        );
      }

      const payload: QuestionPayload = {
        question: values.question.trim(),
        options: cleanedOptions,
      };

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
    <Card style={{ borderRadius: 16 }} styles={{ body: { paddingTop: 16 } }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Teks Pertanyaan"
          name="question"
          rules={[
            { required: true, message: "Pertanyaan wajib diisi" },
            { max: MAX_QUESTION, message: `Maksimal ${MAX_QUESTION} karakter` },
          ]}
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="Contoh: Apakah Anda siap merencanakan kehamilan?"
          />
        </Form.Item>

        <Divider orientation="left">Opsi Jawaban (value)</Divider>

        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card
                  key={field.key}
                  size="small"
                  style={{ marginBottom: 12, borderRadius: 12 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Form.Item
                      label="Value"
                      name={[field.name, "value"]}
                      rules={[
                        { required: true, message: "Value wajib diisi" },
                        {
                          max: MAX_VALUE,
                          message: `Maksimal ${MAX_VALUE} karakter`,
                        },
                        {
                          validator: async (_, v) => {
                            const all = (form.getFieldValue(["options"]) || [])
                              .map((o: any) => String(o?.value ?? "").trim())
                              .filter(Boolean);
                            const current = String(v ?? "").trim();
                            const count = all.filter(
                              (s: string) => s === current
                            ).length;
                            if (current && count > 1)
                              return Promise.reject(
                                new Error("Value harus unik.")
                              );
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Contoh: YA" allowClear />
                    </Form.Item>

                    <Flex justify="end">
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        type="text"
                        onClick={() => remove(field.name)}
                        disabled={fields.length <= 1}
                      >
                        Hapus Opsi
                      </Button>
                    </Flex>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ value: "" })}
                block
              >
                Tambah Opsi
              </Button>
            </>
          )}
        </Form.List>

        <Divider />

        <Flex gap={12} justify="end">
          <Button onClick={() => form.resetFields()} disabled={!!loadingSubmit}>
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={!!loadingSubmit}
          >
            {mode === "edit" ? "Simpan Perubahan" : "Simpan Pertanyaan"}
          </Button>
        </Flex>
      </Form>
    </Card>
  );
}
