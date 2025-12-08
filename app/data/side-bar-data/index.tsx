import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import {
  FormOutlined,
  ReadOutlined,
  PlaySquareOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const Sidebar = (): MenuProps["items"] => {
  const router = useRouter();
  return [
    {
      key: "/dashboard/question",
      label: "Pertanyaan Skrining",
      icon: <FormOutlined />,
      onClick: () => router.push("/dashboard/question"),
    },
    {
      key: "/dashboard/news",
      label: "Berita",
      icon: <ReadOutlined />,
      onClick: () => router.push("/dashboard/news"),
    },
    {
      key: "/dashboard/video-information",
      label: "Video Informasi",
      icon: <PlaySquareOutlined />,
      onClick: () => router.push("/dashboard/video-information"),
    },
    {
      key: "/dashboard/user",
      label: "User",
      icon: <UserOutlined />,
      onClick: () => router.push("/dashboard/user"),
    },
  ];
};
