import Image from "next/image";
import Link from "next/link";
import { ContactFormComponent } from "@/components/contact-form";
import { Layout } from "@/components/layout";

export default function COntact() {
  return (
    <Layout>
      <ContactFormComponent />
    </Layout>
  );
}
