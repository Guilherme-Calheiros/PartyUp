import { ChevronDown, LockKeyhole, ShieldCheck } from "lucide-react"

import ChangePasswordForm from "@/components/profile/ChangePasswordForm"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function SecurityCard() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <ShieldCheck className="size-5" />
                    </span>
                    <div>
                        <CardTitle>Segurança</CardTitle>
                        <CardDescription>
                            Gerencie a segurança e o acesso da sua conta.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Collapsible>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <CollapsibleTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    className="group h-16 w-full justify-between rounded-none px-3"
                                />
                            }
                        >
                            <span className="flex items-center gap-2">
                                <LockKeyhole />
                                Alterar senha
                            </span>
                            <ChevronDown className="transition-transform group-data-[panel-open]:rotate-180" />
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className="border-t border-border p-4">
                                <ChangePasswordForm />
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            </CardContent>
        </Card>
    )
}
