import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/nav";
import HandoverForm from "@/components/handover-form";

export default async function NewHandoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Nav userName={user.name} userRole={user.role} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#e8edf4] tracking-tight">New Handover</h1>
          <p className="text-[#7a8ca8] text-sm mt-1">Complete each section and generate your AI summary</p>
        </div>
        <HandoverForm />
      </main>
    </div>
  );
}
