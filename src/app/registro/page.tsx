import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";

export default function RegisterPage() {
  return (
    <AuthFrame
      title="Crear cuenta"
      description="El registro público es para estudiantes."
    >
      <AuthForm mode="registro" />
    </AuthFrame>
  );
}
