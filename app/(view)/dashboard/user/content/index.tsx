"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  App as AntdApp,
  Button,
  Card,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useUser, useUsers } from "@/app/hooks/user";
import {
  UserPayloadCreateModel,
  UserPayloadUpdateModel,
} from "@/app/model/user";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

const roleOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "User", value: "USER" },
];

export default function UserContent() {
  const { message, notification } = AntdApp.useApp();

  const {
    data,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useUsers({});

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: detail,
    fetchLoading: detailLoading,
    onUpdate,
    onUpdateLoading,
  } = useUser({ id: editingId ?? "" });

  const items = useMemo<UserRow[]>(() => {
    const arr = (data ?? []) as UserRow[];
    const term = search.trim().toLowerCase();
    return term
      ? arr.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
      : arr;
  }, [data, search]);

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
    <div className="max-w-5xl mx-auto p-4">
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            User
          </Typography.Title>
          <Typography.Text type="secondary">
            Kelola akun admin dan pengguna yang dapat mengakses sistem.
          </Typography.Text>
        </Space>
        <Space>
          <Input.Search
            allowClear
            placeholder="Cari nama atau email…"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Tambah User
          </Button>
        </Space>
      </Flex>

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        <Table<UserRow>
          rowKey="id"
          columns={[
            { title: "Nama", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Role",
              dataIndex: "role",
              render: (role: UserRow["role"]) => (
                <Tag color={role === "ADMIN" ? "blue" : "green"}>{role}</Tag>
              ),
            },
            {
              title: "Aksi",
              key: "actions",
              width: 200,
              render: (_: unknown, record: UserRow) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => startEdit(record.id)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Hapus user ini?"
                    okText="Hapus"
                    cancelText="Batal"
                    okButtonProps={{
                      danger: true,
                      loading: !!onDeleteLoading,
                    }}
                    onConfirm={async () => {
                      try {
                        await onDelete?.(record.id);
                        message.success("User berhasil dihapus.");
                      } catch (e: unknown) {
                        notification.error({
                          message: "Gagal Hapus",
                          description:
                            e instanceof Error ? e.message : String(e),
                        });
                      }
                    }}
                  >
                    <Button danger type="text" icon={<DeleteOutlined />}>
                      Hapus
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={items}
          loading={fetchLoading}
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ padding: 32 }}>
                <Empty description="Belum ada user" />
              </div>
            ),
          }}
        />
      </Card>

      <Drawer
        title={editingId ? "Edit User" : "Tambah User"}
        width={520}
        open={open}
        onClose={closeDrawer}
        destroyOnClose
        styles={{ body: { paddingTop: 8 } }}
      >
        <UserForm
          mode={editingId ? "edit" : "create"}
          submitting={!!(editingId ? onUpdateLoading : onCreateLoading)}
          initialData={
            editingId
              ? {
                  id: detail?.id ?? editingId,
                  name: detail?.name ?? "",
                  email: detail?.email ?? "",
                  role: (detail?.role as UserRow["role"]) ?? "USER",
                }
              : undefined
          }
          onSubmit={async (payload) => {
            try {
              if (editingId) {
                await onUpdate?.({
                  id: editingId,
                  payload: payload as UserPayloadUpdateModel,
                });
                message.success("User berhasil diperbarui.");
              } else {
                await onCreate?.(payload as UserPayloadCreateModel);
                message.success("User berhasil dibuat.");
              }
              setEditingId(null);
              setOpen(false);
            } catch (e: unknown) {
              notification.error({
                message: "Gagal Simpan",
                description: e instanceof Error ? e.message : String(e),
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

type UserFormPayload = UserPayloadCreateModel | UserPayloadUpdateModel;

function UserForm({
  mode,
  submitting,
  onSubmit,
  initialData,
}: {
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: UserFormPayload) => Promise<void> | void;
  initialData?: {
    id: string;
    name: string;
    email: string;
    role: UserRow["role"];
  };
}) {
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm<UserPayloadCreateModel>();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
      });
    }
  }, [form, initialData]);

  const initialValues =
    mode === "edit" && initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
        }
      : {
          name: "",
          email: "",
          password: "",
          role: "USER" as UserRow["role"],
        };

  const handleFinish = async (values: UserPayloadCreateModel) => {
    try {
      const basePayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: (values.role as UserRow["role"]) ?? "USER",
      };

      if (mode === "create") {
        const payload: UserPayloadCreateModel = {
          ...basePayload,
          password: values.password,
        };

        if (!payload.password) {
          throw new Error("Password wajib diisi.");
        }

        await onSubmit(payload);
        form.resetFields();
      } else {
        const payload: UserPayloadUpdateModel = { ...basePayload };
        await onSubmit(payload);
      }
    } catch (e: unknown) {
      notification.error({
        message: "Gagal Simpan",
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <Card style={{ borderRadius: 12 }} styles={{ body: { paddingTop: 12 } }}>
      <Form
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Masukkan nama" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email wajib diisi" },
            { type: "email", message: "Format email tidak valid" },
          ]}
        >
          <Input placeholder="nama@email.com" />
        </Form.Item>

        {mode === "create" && (
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password wajib diisi" },
              { min: 6, message: "Minimal 6 karakter" },
            ]}
          >
            <Input.Password placeholder="Minimal 6 karakter" />
          </Form.Item>
        )}

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role wajib dipilih" }]}
        >
          <Select options={roleOptions} />
        </Form.Item>

        <Flex justify="end" gap={12}>
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
