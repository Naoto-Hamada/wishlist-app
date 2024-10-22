import Image from "next/image";
import Link from "next/link";
import { WishlistMatching } from "@/components/pick";
import { Layout } from "@/components/layout";

export default function PickPage() {
  return (
    <Layout>
      <WishlistMatching />
    </Layout>
  );
}
