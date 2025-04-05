"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">500</h1>
      <p className="mt-4 text-lg text-gray-600">Internal Server Error</p>
      <Link href="/" className="mt-6 text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
}
