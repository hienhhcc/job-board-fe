import { AppSidebar } from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { ClipboardListIcon, LayoutDashboard, LogInIcon } from "lucide-react";
import { ReactNode } from "react";

type JobSeekerLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export default function JobSeekerLayout({
  children,
  sidebar,
}: JobSeekerLayoutProps) {
  return (
    <AppSidebar
      content={
        <>
          {sidebar}
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: "/",
                icon: <ClipboardListIcon />,
                label: "Job Board",
              },
              {
                href: "/employer",
                icon: <LayoutDashboard />,
                label: "Employer Dashboard",
                authStatus: "signedIn",
              },
              {
                href: "/sign-in",
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
