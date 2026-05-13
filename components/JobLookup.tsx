"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mergeFields } from "@/lib/dictation/mergeFields";
import type { ProjectData } from "@/lib/integrations/types";

// Maps ProjectData keys → form field keys
const PROJECT_TO_FORM: Record<keyof ProjectData, string> = {
  projectName:       "projectName",
  client:            "client",
  siteAddress:       "siteAddress",
  contractValue:     "contractValue",
  anticipatedStart:  "startDate",
  programmeDuration: "duration",
};

type JobLookupState = "idle" | "loading" | "success" | "not-found" | "error";

type JobLookupProps = {
  existingValues: Record<string, string>;
  onProjectFilled: (fields: Record<string, string>) => void;
};

export function JobLookup({ existingValues, onProjectFilled }: JobLookupProps) {
  const [jobNumber, setJobNumber] = useState("");
  const [state, setState] = useState<JobLookupState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePrefill = async () => {
    const trimmed = jobNumber.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/integrations/project?jobNumber=${encodeURIComponent(trimmed)}`);
      const body = await res.json();

      if (res.status === 404) {
        setState("not-found");
        return;
      }
      if (!res.ok) {
        setErrorMessage(body.error || "Failed to fetch project data");
        setState("error");
        return;
      }

      const project: ProjectData = body.project;
      const incoming: Record<string, string> = {};
      for (const [apiKey, formKey] of Object.entries(PROJECT_TO_FORM)) {
        const value = project[apiKey as keyof ProjectData];
        if (value) incoming[formKey] = value;
      }

      const { merged } = mergeFields(existingValues, incoming, "fill-empty-only");
      onProjectFilled(merged);
      setState("success");
    } catch {
      setErrorMessage("Failed to fetch project data");
      setState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePrefill();
  };

  return (
    <div className="border border-[#1e3048] bg-[#060f1e] p-4 mb-2">
      <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">
        Pull from Simpro
      </div>
      <div className="flex gap-2">
        <Input
          value={jobNumber}
          onChange={(e) => {
            setJobNumber(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Job number"
          disabled={state === "loading"}
          className="bg-[#0a1628] border-[#1e3048] text-[#e8edf4] focus:border-[#29B6D5] focus:ring-0 rounded-none h-10 flex-1 placeholder:text-[#3a5070]"
        />
        <Button
          onClick={handlePrefill}
          disabled={state === "loading" || !jobNumber.trim()}
          className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-10 px-4 rounded-none transition-colors disabled:opacity-40 shrink-0"
        >
          {state === "loading" ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading
            </span>
          ) : (
            "Pre-fill"
          )}
        </Button>
      </div>
      {state === "success" && (
        <p className="text-[#29B6D5] text-xs mt-2">Fields pre-filled from Simpro.</p>
      )}
      {state === "not-found" && (
        <p className="text-amber-400 text-xs mt-2">No job found for &ldquo;{jobNumber.trim()}&rdquo;.</p>
      )}
      {state === "error" && (
        <p className="text-red-400 text-xs mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
