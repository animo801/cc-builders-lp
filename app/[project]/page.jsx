import { notFound } from "next/navigation";
import LandingPage from "../landing-page";
import { projects } from "../projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(projects).map((project) => ({ project }));
}

export async function generateMetadata({ params }) {
  const project = projects[(await params).project];
  return { title: `${project.title} | CC Builders` };
}

export default async function ProjectPage({ params }) {
  const project = projects[(await params).project];
  if (!project) notFound();
  return <LandingPage project={project} />;
}
