import Image from "next/image";
import Link from "next/link";
import { Settings } from "@/components/settings";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <Settings />
    </Layout>
  );
}
