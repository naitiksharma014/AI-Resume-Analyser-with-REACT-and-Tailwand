import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeAI" },
    { name: "description", content: "Analyze your resume for better future!" },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
  if (isLoading) return;

  if (!auth?.isAuthenticated) {
    window.location.href = "/auth?next=/";
  }
}, [isLoading, auth?.isAuthenticated]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Application & Resume Ratings</h1>
          <h2>Review your submission and check AI-powered feedback</h2>
        </div>

        {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume: any) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}