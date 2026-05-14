"use client";

import Link from "next/link";

interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <nav className="max-w-full overflow-hidden">
        <ol className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
