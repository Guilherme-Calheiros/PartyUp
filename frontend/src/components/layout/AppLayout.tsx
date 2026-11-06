import { Outlet } from "react-router";
import { GroupOptionsProvider } from "@/contexts/GroupOptionsProvider";

export default function AppLayout() {
  return (
    <GroupOptionsProvider>
      <div className="min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </GroupOptionsProvider>
  );
}
