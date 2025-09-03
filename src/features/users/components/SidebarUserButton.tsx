import SidebarUserButtonClient from "@/features/users/components/SidebarUserButtonClient";

export default function SidebarUserButton() {
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
