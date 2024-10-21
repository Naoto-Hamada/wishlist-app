import Image from "next/image";
import Link from "next/link";
import { HomeComponent } from "@/components/home";
import { Layout } from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <HomeComponent />
    </Layout>
  );
}
