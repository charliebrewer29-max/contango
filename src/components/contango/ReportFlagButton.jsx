import React, { useState } from "react";
import { Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import ReportSheet from "./ReportSheet";

// Small flag control placed at the bottom-right of a Tango message bubble.
// Writes a report to the AIReport entity (user id via created_by_id; no
// email or name is stored in the record fields) and toasts a confirmation.
export default function ReportFlagButton({ tangoMessage, contextMessage }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit({ reason, note }) {
    setSubmitting(true);
    try {
      await base44.entities.AIReport.create({
        tango_message: tangoMessage || "",
        context_message: contextMessage || "",
        reason,
        note: note || "",
      });
      setOpen(false);
      toast({ title: "Thanks. We'll review this." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Report this response"
        onClick={() => setOpen(true)}
        className="absolute bottom-1 right-1.5 text-slate-400 opacity-40 transition hover:opacity-100 focus:opacity-100 active:opacity-100"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
      {open && (
        <ReportSheet onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </>
  );
}