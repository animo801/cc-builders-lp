import { notFound } from "next/navigation";
import LandingPage from "../landing-page";
import LandingPageB from "../landing-page-b";
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
  // Remodels runs the redesign (tagged as design "b" in the funnel); the other
  // pages still use the original design.
  if (project.slug === "remodels") return <LandingPageB project={project} />;
  return <LandingPage project={project} />;
}
