import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch, getApiErrorMessage } from "@/lib/api"

export default function DeleteAccountCard() {
    const { refreshUser } = useAuth()
    const navigate = useNavigate()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleDeleteAccount() {
        setIsDeleting(true)
        setError(null)

        try {
            const response = await apiFetch("/auth/deleteAccount", {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(response, "Não foi possível excluir a conta.")
                )
            }

            await refreshUser()
            navigate("/login", { replace: true })
        } catch (error) {
            console.error("Erro ao excluir conta:", error)
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir a conta."
            )
        } finally {
            setIsDeleting(false)
        }
    }

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
                            setError(null)
                            setIsDialogOpen(true)
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
                            Essa ação é permanente e não pode ser desfeita. Todos os
                            seus dados serão removidos.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button variant="outline" disabled={isDeleting} />
                            }
                        >
                            Cancelar
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Excluindo..." : "Excluir conta"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
