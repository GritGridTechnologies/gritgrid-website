"use client";

import { useState } from "react";

const services = [
  {
    number: "01",
    title: "AI & Machine Learning",
    description:
      "Practical AI and machine learning solutions, predictive models, automation and intelligent data-driven systems.",
  },
  {
    number: "02",
    title: "Data Analytics",
    description:
      "Transform complex data into useful insights through analytics, visualization, statistical analysis and reporting.",
  },
  {
    number: "03",
    title: "Software Development",
    description:
      "Modern web and software solutions designed around real business requirements, usability and scalability.",
  },
  {
    number: "04",
    title: "Full-Stack Development",
    description:
      "End-to-end application development covering frontend, backend, APIs, databases and deployment.",
  },
  {
    number: "05",
    title: "Cloud & DevOps",
    description:
      "Cloud-ready infrastructure, deployment workflows, automation, monitoring and reliable application delivery.",
  },
  {
    number: "06",
    title: "Research & Technical Solutions",
    description:
      "Technical research, analytical projects, prototypes, documentation and technology-focused problem solving.",
  },
];

const technologies = [
  "Python",
  "Java",
  "C# / .NET",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "FastAPI",
  "Spring Boot",
  "SQL",
  "PostgreSQL",
  "AWS",
  "Azure",
  "Docker",
  "Git",
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-lg font-bold text-white">
              G
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-gray-950">
                GritGrid
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-purple-600">
                Technologies
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#home" className="hover:text-purple-600">
              Home
            </a>
            <a href="#about" className="hover:text-purple-600">
              About
            </a>
            <a href="#services" className="hover:text-purple-600">
              Services
            </a>
            <a href="#technologies" className="hover:text-purple-600">
              Technologies
            </a>
            <a href="#leadership" className="hover:text-purple-600">
              Leadership
            </a>
            <a href="#careers" className="hover:text-purple-600">
              Careers
            </a>
          </nav>

          <a
            href="#contact"
            className="hidden rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 md:block"
          >
            Start a Conversation
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-gray-200 px-3 py-2 md:hidden"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-purple-100 bg-white px-6 py-5 md:hidden">
            <div className="container flex flex-col gap-4 text-sm font-medium">
              <a href="#home" onClick={() => setMenuOpen(false)}>
                Home
              </a>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>
              <a href="#services" onClick={() => setMenuOpen(false)}>
                Services
              </a>
              <a href="#technologies" onClick={() => setMenuOpen(false)}>
                Technologies
              </a>
              <a href="#leadership" onClick={() => setMenuOpen(false)}>
                Leadership
              </a>
              <a href="#careers" onClick={() => setMenuOpen(false)}>
                Careers
              </a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#faf9ff] py-24 md:py-32"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700 shadow-sm">
              GritGrid Technologies
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 md:text-7xl">
              Technology.
              <br />
              <span className="gradient-text">Intelligence.</span>
              <br />
              Built with Grit.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              We are an emerging technology company building practical
              solutions across software, data, artificial intelligence,
              cloud and digital technologies.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#services"
                className="rounded-full gradient-bg px-7 py-4 text-center font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5"
              >
                Explore Our Services →
              </a>
              <a
                href="#contact"
                className="rounded-full border border-gray-300 bg-white px-7 py-4 text-center font-semibold text-gray-900 transition hover:border-purple-400 hover:text-purple-700"
              >
                Talk to GritGrid
              </a>
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Technology-first"],
              ["02", "Data-driven"],
              ["03", "Future-focused"],
            ].map(([number, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm"
              >
                <span className="text-sm font-bold text-purple-600">
                  {number}
                </span>
                <p className="mt-3 font-semibold text-gray-900">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section bg-white">
        <div className="container grid gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
              Who We Are
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              Starting small.
              <br />
              Thinking bigger.
            </h2>
          </div>

          <div className="space-y-6 text-gray-600">
            <p className="text-lg leading-8">
              GritGrid Technologies is an early-stage technology venture
              focused on building practical digital and technical solutions.
            </p>

            <p className="leading-7">
              Our initial focus is on developing strong technical capabilities,
              delivering quality projects and creating a foundation for a
              larger technology organization.
            </p>

            <p className="leading-7">
              Our long-term ambition is to grow from a small technology team
              into an organization capable of working with startups,
              institutions and major enterprises.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section bg-[#faf9ff]">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
              What We Do
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              Technology capabilities for real-world problems.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our capabilities are designed to evolve as GritGrid grows.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.number}
                className="group rounded-3xl border border-purple-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/60"
              >
                <span className="text-sm font-bold text-purple-500">
                  {service.number}
                </span>

                <h3 className="mt-8 text-xl font-bold text-gray-950">
                  {service.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {service.description}
                </p>

                <div className="mt-7 text-sm font-semibold text-purple-600">
                  Learn more →
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section bg-gray-950 text-white">
        <div className="container">
          <div className="grid gap-14 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
                Why GritGrid
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Built on learning, execution and ambition.
              </h2>
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              {[
                ["01", "Practical thinking"],
                ["02", "Continuous learning"],
                ["03", "Quality-focused delivery"],
                ["04", "Long-term vision"],
              ].map(([number, title]) => (
                <div key={number} className="border-t border-gray-700 pt-5">
                  <span className="text-sm text-purple-300">{number}</span>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section id="technologies" className="section bg-white">
        <div className="container">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Technology
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            A growing technical foundation.
          </h2>

          <div className="mt-12 flex flex-wrap gap-3">
            {technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-full border border-purple-200 bg-[#faf9ff] px-5 py-3 text-sm font-medium text-gray-800 transition hover:border-purple-500 hover:text-purple-700"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section id="leadership" className="section bg-[#faf9ff]">
        <div className="container">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Leadership
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            The people building GritGrid.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-purple-100 bg-white p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg text-xl font-bold text-white">
                D
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-950">
                Deekshith
              </h3>

              <p className="mt-1 font-medium text-purple-600">Founder</p>

              <p className="mt-5 leading-7 text-gray-600">
                Driving the overall direction, technology strategy and
                long-term vision of GritGrid Technologies.
              </p>
            </div>

            <div className="rounded-3xl border border-purple-100 bg-white p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg text-xl font-bold text-white">
                D
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-950">
                Divya
              </h3>

              <p className="mt-1 font-medium text-purple-600">Co-Founder</p>

              <p className="mt-5 leading-7 text-gray-600">
                Contributing to data, analytics, business development and the
                strategic growth of GritGrid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAREERS */}
      <section id="careers" className="section bg-white">
        <div className="container rounded-[2rem] gradient-bg px-7 py-14 text-white md:px-14 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-200">
              Future Opportunities
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Learn. Build. Grow with GritGrid.
            </h2>

            <p className="mt-6 text-lg leading-8 text-purple-50">
              As we grow, we plan to create opportunities for students and
              emerging technologists to gain practical experience through
              internships and project-based work.
            </p>

            <a
              href="#contact"
              className="mt-8 inline-block rounded-full bg-white px-7 py-4 font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              Explore Opportunities →
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section bg-gray-950 text-white">
        <div className="container grid gap-12 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
              Contact
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Have an idea?
              <br />
              Let&apos;s talk.
            </h2>

            <p className="mt-6 max-w-xl text-gray-400">
              Tell us about your requirement, idea or technical challenge and
              our team will get back to you.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-7">
            <p className="text-sm text-gray-400">General enquiries</p>

            <a
              href="mailto:hello@gritgrid.in"
              className="mt-2 block text-xl font-semibold text-white hover:text-purple-300"
            >
              hello@gritgrid.in
            </a>

            <p className="mt-6 text-sm text-gray-400">Support</p>

            <a
              href="mailto:support@gritgrid.in"
              className="mt-2 block text-lg font-semibold text-white hover:text-purple-300"
            >
              support@gritgrid.in
            </a>

            <a
              href="mailto:contact@gritgrid.in"
              className="mt-8 block rounded-full bg-white px-6 py-3 text-center font-semibold text-gray-950 transition hover:bg-purple-100"
            >
              Email GritGrid →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-gray-950 py-8 text-gray-400">
        <div className="container flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} GritGrid Technologies. All rights
            reserved.
          </div>

          <div className="flex gap-5">
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
