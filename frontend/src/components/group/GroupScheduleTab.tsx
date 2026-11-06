import { CalendarDays } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";

export default function GroupScheduleTab() {
  return (
    <EmptyState
      icon={CalendarDays}
      title="Agenda vazia"
      description="Os próximos eventos do grupo aparecerão aqui."
    />
  );
}
