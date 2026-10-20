import { Suspense } from "react";
import { notFound } from "next/navigation";
import BidShell from "../bid-shell";
import BidFlow from "../bid-flow";
import { projects } from "../../projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(projects).map((project) => ({ project }));
}

export async function generateMetadata({ params }) {
  const project = projects[(await params).project];
  return { title: `Get your ${project.name.toLowerCase()} bid | CC Builders` };
}

export default async function BidPage({ params }) {
  const { project } = await params;
  if (!projects[project]) notFound();
  return (
    <BidShell>
      <Suspense>
        <BidFlow slug={project} />
      </Suspense>
    </BidShell>
  );
}
