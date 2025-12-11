"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { ArrowRightOutlined, HistoryOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUsers } from "@/app/hooks/user";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export default function HistoryContent() {
  const router = useRouter();
  const { data, fetchLoading } = useUsers({});
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo<UserRow[]>(() => {
    // tampilkan riwayat hanya untuk role USER
    const arr = ((data ?? []) as UserRow[]).filter((u) => u.role === "USER");
    const term = search.trim().toLowerCase();
    return term
      ? arr.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
      : arr;
  }, [data, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card
        style={{
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(35,112,255,0.08), rgba(53,178,255,0.04))",
          borderColor: "transparent",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Space direction="vertical" size={0}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Riwayat Jawaban
            </Typography.Title>
            <Typography.Text type="secondary">
              Lihat riwayat pengisian screening per user.
            </Typography.Text>
          </Space>
          <Input.Search
            placeholder="Cari user berdasarkan nama atau email…"
            allowClear
            style={{ width: 320, maxWidth: "100%" }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Flex>
      </Card>

      {fetchLoading ? (
        <div className="flex items-center justify-center min-h-[220px]">
          <Spin size="large" />
        </div>
      ) : (filteredUsers?.length ?? 0) === 0 ? (
        <Empty description="Belum ada user" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              hoverable
              style={{
                borderRadius: 16,
                borderColor: "#eef1f7",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{
                padding: 20,
              }}
              onClick={() => router.push(`/dashboard/history/${user.id}`)}
            >
              <Flex align="center" justify="space-between" gap={12} wrap>
                <Space direction="vertical" size={4}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {user.name}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {user.email}
                  </Typography.Text>
                  <Tag color={user.role === "ADMIN" ? "blue" : "green"}>
                    {user.role}
                  </Tag>
                </Space>

                <Space align="center" size={12}>
                  <Badge
                    count="Detail"
                    style={{
                      background: "#fff",
                      color: "#1890ff",
                      border: "1px solid #1890ff",
                    }}
                  />
                  <Button
                    icon={<HistoryOutlined />}
                    type="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/history/${user.id}`);
                    }}
                    iconPosition="start"
                  >
                    Lihat Detail
                    <ArrowRightOutlined style={{ marginLeft: 6 }} />
                  </Button>
                </Space>
              </Flex>
            </Card>
          ))}
        </Space>
      )}
    </div>
  );
}
