"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type FormData = {
  projectName: string;
  client: string;
  siteAddress: string;
  contractValue: string;
  startDate: string;
  duration: string;
  scopeMain: string;
  inclusions: string;
  exclusions: string;
  pricingAssumptions: string;
  commercialRisks: string;
  programmeRisks: string;
  siteAccess: string;
  labourRequirements: string;
  specialistMaterials: string;
  clientCommitments: string;
  immediateActions: string;
};

const EMPTY_FORM: FormData = {
  projectName: "", client: "", siteAddress: "", contractValue: "", startDate: "", duration: "",
  scopeMain: "", inclusions: "", exclusions: "",
  pricingAssumptions: "", commercialRisks: "", programmeRisks: "",
  siteAccess: "", labourRequirements: "", specialistMaterials: "", clientCommitments: "", immediateActions: "",
};

const SECTIONS = [
  {
    title: "Project Overview",
    number: 1,
    fields: [
      { key: "projectName", label: "Project Name", type: "input" as const, required: true },
      { key: "client", label: "Client", type: "input" as const },
      { key: "siteAddress", label: "Site Address", type: "textarea" as const },
      { key: "contractValue", label: "Contract Value", type: "input" as const },
      { key: "startDate", label: "Anticipated Start", type: "input" as const },
      { key: "duration", label: "Programme Duration", type: "input" as const },
    ],
  },
  {
    title: "Scope of Works",
    number: 2,
    fields: [
      { key: "scopeMain", label: "Main Scope of Works", type: "textarea" as const },
      { key: "inclusions", label: "Key Inclusions", type: "textarea" as const },
      { key: "exclusions", label: "Key Exclusions", type: "textarea" as const },
    ],
  },
  {
    title: "Risks & Assumptions",
    number: 3,
    fields: [
      { key: "pricingAssumptions", label: "Pricing Assumptions", type: "textarea" as const },
      { key: "commercialRisks", label: "Commercial Risks", type: "textarea" as const },
      { key: "programmeRisks", label: "Programme Concerns", type: "textarea" as const },
    ],
  },
  {
    title: "Delivery & Site",
    number: 4,
    fields: [
      { key: "siteAccess", label: "Site Access & Restrictions", type: "textarea" as const },
      { key: "labourRequirements", label: "Labour Requirements", type: "textarea" as const },
      { key: "specialistMaterials", label: "Specialist Materials & Lead Times", type: "textarea" as const },
      { key: "clientCommitments", label: "Client Commitments / Promises Made", type: "textarea" as const },
      { key: "immediateActions", label: "Items Contract Manager Must Act On Immediately", type: "textarea" as const },
    ],
  },
];

interface HandoverFormProps {
  handoverId?: string;
  initialData?: Partial<FormData>;
}

export default function HandoverForm({ handoverId: initialHandoverId, initialData }: HandoverFormProps) {
  const router = useRouter();
  const [section, setSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM, ...initialData });
  const [handoverId, setHandoverId] = useState<string | null>(initialHandoverId || null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSave = useRef(!initialHandoverId);

  const saveData = useCallback(async (data: FormData) => {
    if (!data.projectName) return;
    setSaveStatus("saving");
    try {
      if (isFirstSave.current || !handoverId) {
        const res = await fetch("/api/handovers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Save failed");
        const result = await res.json();
        setHandoverId(result.handover.id);
        isFirstSave.current = false;
        setSaveStatus("saved");
      } else {
        const res = await fetch(`/api/handovers/${handoverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [handoverId]);

  const handleChange = (key: keyof FormData, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveData(updated), 2000);
  };

  const handleGenerate = async () => {
    if (!handoverId) await saveData(formData);
    const id = handoverId;
    if (!id) return;

    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch(`/api/handovers/${id}/generate`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      router.push(`/handovers/${id}`);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate");
      setGenerating(false);
    }
  };

  const currentSection = SECTIONS[section];
  const canGenerate = !!formData.projectName;

  return (
    <>
      {/* Full-screen loading overlay during AI generation */}
      {generating && (
        <div className="fixed inset-0 bg-[#060f1e]/95 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#1e3048]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#29B6D5] animate-spin" />
            </div>
            <div>
              <div className="text-[#e8edf4] text-sm font-bold tracking-widest uppercase mb-2">
                Generating Handover
              </div>
              <div className="text-[#7a8ca8] text-xs leading-relaxed">
                The AI is analysing your handover data and building the summary. This typically takes 20–30 seconds.
              </div>
            </div>
            <div className="w-full bg-[#1e3048] h-px">
              <div className="h-px bg-[#29B6D5] animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Section tabs — scrollable on mobile */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 gap-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {SECTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSection(i)}
                  className={`whitespace-nowrap text-xs tracking-wider uppercase transition-colors px-3 py-1.5 border ${
                    i === section
                      ? "text-[#29B6D5] border-[#29B6D5]/40 bg-[#29B6D5]/10"
                      : i < section
                      ? "text-[#7a8ca8] border-[#1e3048]"
                      : "text-[#3a5070] border-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">{i + 1}. {s.title}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              ))}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {saveStatus === "saving" && <span className="text-[#7a8ca8] text-xs">Saving...</span>}
              {saveStatus === "saved" && <span className="text-green-500 text-xs">Saved</span>}
              {saveStatus === "error" && <span className="text-red-400 text-xs">Save failed</span>}
            </div>
          </div>
          <Progress value={((section + 1) / SECTIONS.length) * 100} className="h-0.5 bg-[#162540]" />
        </div>

        {/* Section header */}
        <div className="mb-6">
          <div className="text-[#29B6D5] text-xs tracking-widest uppercase mb-1">
            Section {currentSection.number} of {SECTIONS.length} — {currentSection.title}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 bg-[#0f1e35] border border-[#1e3048] p-4 sm:p-6 mb-6">
          {currentSection.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-[#7a8ca8] text-xs tracking-widest uppercase">
                {field.label}
                {field.required && <span className="text-[#29B6D5] ml-1">*</span>}
              </Label>
              {field.type === "input" ? (
                <Input
                  value={formData[field.key as keyof FormData]}
                  onChange={(e) => handleChange(field.key as keyof FormData, e.target.value)}
                  className="bg-[#0a1628] border-[#1e3048] text-[#e8edf4] focus:border-[#29B6D5] focus:ring-0 rounded-none h-11"
                />
              ) : (
                <Textarea
                  value={formData[field.key as keyof FormData]}
                  onChange={(e) => handleChange(field.key as keyof FormData, e.target.value)}
                  rows={4}
                  className="bg-[#0a1628] border-[#1e3048] text-[#e8edf4] focus:border-[#29B6D5] focus:ring-0 rounded-none resize-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={() => setSection(Math.max(0, section - 1))}
            disabled={section === 0}
            variant="outline"
            className="border-[#1e3048] text-[#7a8ca8] hover:text-[#e8edf4] hover:border-[#7a8ca8] bg-transparent rounded-none text-xs tracking-widest uppercase"
          >
            Back
          </Button>

          <div className="flex items-center gap-3">
            {generateError && (
              <span className="text-red-400 text-xs hidden sm:inline">{generateError}</span>
            )}

            {section === SECTIONS.length - 1 ? (
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-10 px-6 rounded-none transition-colors disabled:opacity-40"
              >
                Generate Handover &rarr;
              </Button>
            ) : (
              <Button
                onClick={() => setSection(Math.min(SECTIONS.length - 1, section + 1))}
                className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-10 px-6 rounded-none transition-colors"
              >
                Next &rarr;
              </Button>
            )}
          </div>
        </div>

        {generateError && (
          <p className="text-red-400 text-xs mt-3 text-right sm:hidden">{generateError}</p>
        )}

        {!canGenerate && section === SECTIONS.length - 1 && (
          <p className="text-[#7a8ca8] text-xs mt-3 text-right">
            Fill in Project Name (Section 1) to enable generation
          </p>
        )}
      </div>
    </>
  );
}
