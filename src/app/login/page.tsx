import { Suspense } from "react";
import AuthForm from "./auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">
          Cols Pyrénées
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          La checklist des cols à gravir
        </p>

        {message && (
          <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {message}
          </p>
        )}

        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
