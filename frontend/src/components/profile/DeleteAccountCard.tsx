import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, throwIfApiError } from "@/lib/api";

export default function DeleteAccountCard() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/auth/deleteAccount", {
        method: "DELETE",
      });

      await throwIfApiError(response, "Não foi possível excluir a conta.");
    },
    onSuccess: async () => {
      await refreshUser();
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      console.error("Erro ao excluir conta:", error);
    },
  });

  function handleDeleteAccount() {
    deleteAccountMutation.mutate();
  }

  const isDeleting = deleteAccountMutation.isPending;
  const error = deleteAccountMutation.error?.message ?? null;

  return (
    <>
      <Card className="ring-destructive/20">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-medium text-destructive">
              <Trash2 className="size-4" />
              Excluir conta
            </p>
            <p className="text-sm text-muted-foreground">
              Exclua permanentemente sua conta e todos os seus dados.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              deleteAccountMutation.reset();
              setIsDialogOpen(true);
            }}
          >
            <Trash2 />
            Excluir conta
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta?</DialogTitle>
            <DialogDescription>
              Essa ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isDeleting} />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
