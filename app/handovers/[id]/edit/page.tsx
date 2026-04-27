import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/nav";
import HandoverForm from "@/components/handover-form";

export default async function EditHandoverPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const handover = await prisma.handover.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!handover) notFound();
  if (handover.status === "LOCKED") redirect(`/handovers/${id}`);

  const formData = (handover.form_data as Record<string, string>) || {};

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Nav userName={user.name} userRole={user.role} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-1">Editing Draft</div>
          <h1 className="text-xl font-bold text-[#e8edf4] tracking-tight">
            {handover.project.name || "Untitled Handover"}
          </h1>
        </div>
        <HandoverForm
          handoverId={id}
          initialData={formData}
        />
      </main>
    </div>
  );
}
