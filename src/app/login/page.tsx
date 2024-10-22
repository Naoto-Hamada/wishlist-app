import Image from "next/image";
import Link from "next/link";
import { Login } from "@/components/login";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Login />
    </div>
  )
}
