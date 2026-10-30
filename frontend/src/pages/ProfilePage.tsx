import DeleteAccountCard from "@/components/profile/DeleteAccountCard"
import ProfileDetailsCard from "@/components/profile/ProfileDetailsCard"
import SecurityCard from "@/components/profile/SecurityCard"
import { useAuth } from "@/contexts/AuthContext"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Meu perfil
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie suas informações pessoais e a segurança da sua conta.
                </p>
            </div>

            <ProfileDetailsCard user={user} />
            <SecurityCard />
            <DeleteAccountCard />
        </div>
    )
}
