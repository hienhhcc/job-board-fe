import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { BellIcon, FileUserIcon } from "lucide-react";

export default function UserSettingsSidebar() {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          href: "/user-settings/notifications",
          icon: <BellIcon />,
          label: "Notifications",
        },
        {
          href: "/user-settings/resume",
          icon: <FileUserIcon />,
          label: "Resume",
        },
      ]}
    />
  );
}
