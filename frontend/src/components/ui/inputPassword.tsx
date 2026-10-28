"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type InputPasswordProps = {
  label?: string
  placeholder?: string
  htmlFor?: string
  forgotPasswordLink?: string
  value: string,
  onChange: (value: string) => void
  required?: boolean
}

const InputPassword = ({
  label = "Senha",
  placeholder = "Digite sua senha",
  htmlFor = "password",
  forgotPasswordLink,
  value,
  onChange,
  required = false,
}: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        {forgotPasswordLink && (
          <a
            href={forgotPasswordLink}
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            Esqueceu a senha?
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          id={htmlFor}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          required={required}
        />
        <Button
          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default InputPassword
