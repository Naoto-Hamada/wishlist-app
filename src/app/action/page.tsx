import Image from "next/image";
import Link from "next/link";
import { WishlistDetailComponent } from "@/components/wishlist-detail";
import { Layout } from "@/components/layout";

export default function Action() {
  return (
    <Layout>
      <WishlistDetailComponent />
    </Layout>
  );
}
