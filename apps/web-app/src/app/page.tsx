import { H1 } from "@acme/ui/typography";

export default function Page() {
  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <H1></H1>
        <div className="flex w-full max-w-2xl flex-col gap-4 overflow-y-scroll"></div>
      </div>
    </main>
  );
}
