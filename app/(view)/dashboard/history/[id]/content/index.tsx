"use client";

import React, { useMemo } from "react";
import {
  Badge,
  Card,
  Descriptions,
  Empty,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/user";
import { useAnswerSessions } from "@/app/hooks/answer-session";
import { AnswerSessionDataModel } from "@/app/model/answer-session";

const gridStyles: React.CSSProperties = {
  borderRadius: 16,
  borderColor: "#e5e7eb",
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
};

export default function HistoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const { data: user, fetchLoading: userLoading } = useUser({ id: userId });
  const { data: sessions, fetchLoading: sessionsLoading } = useAnswerSessions({
    userId,
  });

  const totalAnswers = useMemo(
    () =>
      (sessions ?? []).reduce((acc, s) => acc + (s.answers?.length || 0), 0),
    [sessions]
  );

  const latestSubmitted = useMemo(() => {
    const sorted = [...(sessions ?? [])].sort((a, b) => {
      const t1 = new Date(a.submittedAt ?? a.startedAt ?? 0).getTime();
      const t2 = new Date(b.submittedAt ?? b.startedAt ?? 0).getTime();
      return t2 - t1;
    });
    return sorted[0];
  }, [sessions]);

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-14">
      <Flex
        align="center"
        justify="space-between"
        wrap
        gap={12}
        style={{ paddingTop: 4 }}
      >
        <Space size={10}>
          <ArrowLeftOutlined
            onClick={() => router.push("/dashboard/history")}
            style={{
              fontSize: 18,
              cursor: "pointer",
              color: "#1677ff",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #d6e4ff",
              background: "#f0f6ff",
            }}
          />
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Detail Riwayat
            </Typography.Title>
            <Typography.Text type="secondary">
              Ringkasan aktivitas jawaban untuk {user?.name || "User"}.
            </Typography.Text>
          </div>
        </Space>
      </Flex>

      {/* Profil + Ringkasan */}
      <Flex gap={16} wrap>
        <Card style={{ ...gridStyles, flex: 1, minWidth: 260, padding: 4 }}>
          {userLoading ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Spin />
            </div>
          ) : (
            <Space direction="vertical" size={10}>
              <Space align="center" size={12}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#1677ff",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {(user?.name ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {user?.name || "User"}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {user?.email || "-"}
                  </Typography.Text>
                </div>
              </Space>
              <Tag color={user?.role === "ADMIN" ? "blue" : "green"}>
                {user?.role || "USER"}
              </Tag>
            </Space>
          )}
        </Card>

        <Card style={{ ...gridStyles, flex: 1, minWidth: 260, padding: 4 }}>
          <Space direction="vertical" size={8}>
            <Typography.Text type="secondary">Total Sesi</Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {sessions?.length ?? 0}
            </Typography.Title>
            <Typography.Text type="secondary">
              pengisian screening
            </Typography.Text>
          </Space>
        </Card>

        <Card style={{ ...gridStyles, flex: 1, minWidth: 260, padding: 4 }}>
          <Space direction="vertical" size={8}>
            <Typography.Text type="secondary">Total Jawaban</Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {totalAnswers}
            </Typography.Title>
            <Typography.Text type="secondary">
              pertanyaan terisi
            </Typography.Text>
          </Space>
        </Card>

        <Card style={{ ...gridStyles, flex: 1, minWidth: 260, padding: 4 }}>
          <Space direction="vertical" size={8}>
            <Typography.Text type="secondary">Terakhir Isi</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {latestSubmitted
                ? formatDate(
                    latestSubmitted.submittedAt ?? latestSubmitted.startedAt
                  )
                : "-"}
            </Typography.Title>
            <Typography.Text type="secondary">sesi paling baru</Typography.Text>
          </Space>
        </Card>
      </Flex>

      {/* Detail Sesi */}
      <div className="space-y-10">
        <Flex justify="space-between" align="center" wrap gap={8}>
          <Typography.Title
            level={4}
            style={{ margin: 0, marginTop: 20, marginBottom: 20 }}
          >
            Daftar Sesi Jawaban
          </Typography.Title>
          <Badge
            count={`${sessions?.length ?? 0} sesi`}
            style={{ backgroundColor: "#1677ff" }}
          />
        </Flex>

        {sessionsLoading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <Spin size="large" />
          </div>
        ) : (sessions?.length ?? 0) === 0 ? (
          <Empty description="Belum ada riwayat jawaban" />
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {(sessions as AnswerSessionDataModel[]).map((session) => (
              <Card
                key={session.id}
                style={{ ...gridStyles, borderColor: "#e5e7eb", padding: 4 }}
                headStyle={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingInline: 18,
                  paddingBlock: 12,
                }}
                title={
                  <Flex justify="space-between" align="center" wrap gap={8}>
                    <Space align="center" size={8}>
                      <CalendarOutlined />
                      <Typography.Text strong>
                        {formatDate(session.startedAt)}
                      </Typography.Text>
                    </Space>
                    <Space size={8}>
                      {session.percentage !== null &&
                      session.percentage !== undefined ? (
                        <Tag color="blue" style={{ borderRadius: 999 }}>
                          {session.percentage}%
                        </Tag>
                      ) : null}
                      {session.answers?.length ? (
                        <Badge
                          count={`${session.answers.length} jawaban`}
                          style={{ backgroundColor: "#52c41a" }}
                        />
                      ) : null}
                    </Space>
                  </Flex>
                }
              >
                <div style={{ paddingInline: 12, paddingBottom: 8 }}>
                  <Descriptions
                    size="small"
                    column={1}
                    labelStyle={{ fontWeight: 600 }}
                    contentStyle={{ marginBottom: 6 }}
                    items={[
                      {
                        key: "pasien",
                        label: "Pasien",
                        children: (
                          <Space>
                            <UserOutlined />
                            {session.pasien?.name || "-"}
                          </Space>
                        ),
                      },
                      {
                        key: "waktu",
                        label: "Waktu",
                        children: (
                          <Typography.Text>
                            Mulai: {formatDate(session.startedAt)} · Selesai:{" "}
                            {formatDate(session.submittedAt)}
                          </Typography.Text>
                        ),
                      },
                    ]}
                  />

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={10}
                  >
                    {session.answers.map((ans) => (
                      <Card
                        key={ans.id}
                        size="small"
                        style={{ borderRadius: 12, borderColor: "#f0f0f0" }}
                        bodyStyle={{ padding: 12 }}
                      >
                        <Typography.Text strong>
                          {ans.question?.question || "Pertanyaan"}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary">
                          Jawaban: {ans.selectedOption?.value || "-"}
                        </Typography.Text>
                      </Card>
                    ))}
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}
