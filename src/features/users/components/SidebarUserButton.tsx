import { SidebarMenuButton } from "@/components/ui/sidebar";
import SidebarUserButtonClient from "@/features/users/components/SidebarUserButtonClient";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";

export default function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserButtonSuspense />
    </Suspense>
  );
}

async function SidebarUserButtonSuspense() {
  const { user } = await getCurrentUser({ allData: true });

  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
}
