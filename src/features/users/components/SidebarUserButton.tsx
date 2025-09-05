import SidebarUserButtonClient from "@/features/users/components/SidebarUserButtonClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { Suspense } from "react";

export default function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserButtonSuspense />
    </Suspense>
  );
}

async function SidebarUserButtonSuspense() {
  const test = await getCurrentUser({ allData: true });
  console.log(test);

  return (
    <SidebarUserButtonClient
      user={{
        name: "Hien Vu Vinh",
        email: "vuvinhhien.work@gmail.com",
        imageUrl: "",
      }}
    />
  );
}
