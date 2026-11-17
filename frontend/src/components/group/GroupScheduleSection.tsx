import { CalendarClock } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { Card } from "../ui/card";

export default function GroupScheduleSection() {
  return (
    <Card className="gap-4 px-5 py-5 sm:px-6">
      <SectionHeader title="Agenda" description="Organize os encontros do grupo." />

      {/* TODO: adicionar conteúdo da agenda do grupo quando a funcionalidade estiver disponível. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center">
        <CalendarClock className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Em breve você poderá ver e criar eventos do grupo.
        </p>
      </div>
    </Card>
  );
}
