import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import GridShape from "../../components/common/GridShape";

export default function Unauthorized() {
  return (
    <>
      <PageMeta
        title="Unauthorized | Admin Dashboard"
        description="You do not have permission to access this page."
      />
      <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
        <GridShape />
        <div className="relative mx-auto w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
            <svg
              aria-hidden="true"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008M10.29 3.86 2.82 17.25A1.5 1.5 0 0 0 4.13 19.5h15.74a1.5 1.5 0 0 0 1.31-2.25L13.71 3.86a1.96 1.96 0 0 0-3.42 0Z"
              />
            </svg>
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-500">
            Access restricted
          </p>
          <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white/90 sm:text-4xl">
            You are not authorized
          </h1>
          <p className="mb-8 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            Your account does not have administrator permissions to view this page.
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            Return to sign in
          </Link>
        </div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - TailAdmin
        </p>
      </div>
    </>
  );
}
