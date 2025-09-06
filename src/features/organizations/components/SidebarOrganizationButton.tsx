import { SidebarMenuButton } from "@/components/ui/sidebar";
import SidebarOrganizationButtonClient from "@/features/organizations/components/SidebarOrganizationButtonClient";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";

export default function SidebarOrganizationButton() {
  return (
    <Suspense>
      <SidebarOrganizationButtonSuspense />
    </Suspense>
  );
}

async function SidebarOrganizationButtonSuspense() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);
  console.log({ user, organization });

  if (user == null || organization == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient user={user} organization={organization} />
  );
}
