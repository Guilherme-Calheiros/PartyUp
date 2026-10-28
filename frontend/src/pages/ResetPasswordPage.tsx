import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { useSearchParams } from "react-router"


export default function ResetPasswordPage () {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    const isResettingPassword = Boolean(token && emailFromUrl);

    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {isResettingPassword ? (
                    <ResetPasswordForm />
                ) : (
                    <ForgotPasswordForm />
                )}
            </div>
        </div>
    )
}