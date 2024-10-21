import Image from "next/image";
import Link from "next/link";
import { HomeComponent } from "@/components/home";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <HomeComponent />
    </Layout>
  );
}
