import { DatabaseFilled } from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const Sidebar = (): MenuProps["items"] => {
  const router = useRouter();
  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/dashboard/question",
      label: "Pertanyaan Skrining",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/dashboard/question");
      },
    },
    {
      key: "/dashboard/news",
      label: "Berita",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/dashboard/news");
      },
    },
    {
      key: "/dashboard/video-information",
      label: "Video Informasi",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/dashboard/video-information");
      },
    },
  ];

  return sidebarMenu;
};
