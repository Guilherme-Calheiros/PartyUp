import { Link } from "react-router";

export default function CreateGroupPage({ title }: { title: string }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">Esta página será construída em breve.</p>
      <Link to="/grupos" className="text-sm font-medium text-primary hover:underline">
        Voltar para meus grupos
      </Link>
    </div>
  );
}
