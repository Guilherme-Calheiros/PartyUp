import { Outlet } from "react-router";
import { GroupOptionsProvider } from "@/contexts/GroupOptionsProvider";

export default function AppLayout() {
  return (
    <GroupOptionsProvider>
      <div className="min-h-0 flex-1 px-4 pt-6 pb-[calc(6rem_+_env(safe-area-inset-bottom))] sm:px-6 md:pb-6 lg:px-8">
        <Outlet />
      </div>
    </GroupOptionsProvider>
  );
}
