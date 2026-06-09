"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hourglass } from "@/components/design/Hourglass";
import { PaperTex } from "@/components/design/PaperTex";
import { GardenButton } from "@/components/design/GardenButton";
import { MarginNote } from "@/components/design/MarginNote";
import { PaperInput } from "@/components/design/PaperInput";
import { StepDots } from "@/components/design/StepDots";
import { trpc } from "@/lib/trpc/client";
import { format, addYears, isAfter } from "date-fns";

const WIZ_STEPS = ["The cover", "The date", "For whom", "What to put in", "Seal"];

interface WizardChromeProps {
  step: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

function WizardChrome({ step, children, onNext, onBack, isLastStep }: WizardChromeProps) {
  return (
    <div className="relative min-h-screen bg-bone text-walnut font-body overflow-hidden flex flex-col">
      <PaperTex seed={step + 11} />

      {/* Top bar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 border-b border-rule bg-bone/80 backdrop-blur-sm">
        <Link href="/dashboard" className="text-[13px] text-walnut-soft hover:text-walnut transition-colors">
          ← Save & leave
        </Link>
        <div className="flex items-center gap-3">
          <Hourglass size={18} progress={0.45} accent />
          <span className="font-display text-lg font-medium tracking-tight text-walnut">Time Capsule</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-walnut-mute">
          <div className="w-1.5 h-1.5 rounded-full bg-moss" />
          autosaved just now
        </div>
      </nav>

      {/* Step tracker */}
      <div className="relative z-10 px-6 py-4 md:px-12 border-b border-rule-soft flex items-center justify-between bg-bone/40">
        <StepDots steps={WIZ_STEPS} current={step} />
        <div className="hidden md:block text-[10px] md:text-[11px] text-walnut-mute tracking-[0.16em] uppercase font-medium">
          Step {step + 1} of 5
        </div>
      </div>

      {/* Content area */}
      <main className="relative flex-1 overflow-y-auto px-6 py-12 md:px-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="relative z-50 px-6 py-5 md:px-12 border-t border-rule bg-bone/80 backdrop-blur-sm flex items-center justify-between">
        <GardenButton ghost size="md" onClick={onBack} disabled={step === 0}>
          ← Back
        </GardenButton>
        <div className="hidden md:block text-[12.5px] text-walnut-mute italic">
          Take your time. We&apos;ll be here.
        </div>
        <GardenButton 
          size="md" 
          onClick={onNext}
          className={isLastStep ? "bg-terra hover:bg-terra-deep" : ""}
        >
          {isLastStep ? "Press to seal ↦" : "Continue →"}
        </GardenButton>
      </footer>
    </div>
  );
}

export default function NewCapsulePage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("For Maya, on your sixteenth");
  const [description, setDescription] = useState(
    "From Mom and Dad, sealed in the spring of 2026 — sixteen years out from the rainy Tuesday we brought you home."
  );
  const [unlockAt, setUnlockAt] = useState(format(addYears(new Date(), 5), "yyyy-MM-dd"));
  const [recipients, setRecipients] = useState<{ name: string; email: string }[]>([
    { name: "Maya Lin", email: "maya@lin-family.com" }
  ]);

  const createCapsule = trpc.capsule.create.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
  });

  const handleCreate = () => {
    createCapsule.mutate({
      title,
      description,
      unlockAt: new Date(unlockAt),
      recipients: recipients.filter(r => r.name && r.email),
    });
  };

  const addRecipient = () => {
    setRecipients([...recipients, { name: "", email: "" }]);
  };

  const updateRecipient = (index: number, field: "name" | "email", value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  return (
    <WizardChrome
      step={step}
      isLastStep={step === 4}
      onNext={() => {
        if (step === 4) {
          handleCreate();
        } else {
          setStep((s) => Math.min(s + 1, 4));
        }
      }}
      onBack={() => setStep((s) => Math.max(s - 1, 0))}
    >
      {/* STEP 1: THE COVER */}
      {step === 0 && (
        <div className="grid md:grid-cols-5 gap-16 items-start">
          <div className="md:col-span-3 space-y-8">
            <div>
              <MarginNote rotate={-2} size={20}>begin with the cover</MarginNote>
              <h2 className="font-display text-4xl md:text-5xl font-normal mt-2 mb-4 leading-none tracking-tight text-walnut">
                What are you <span className="italic text-moss">setting aside?</span>
              </h2>
              <p className="text-base leading-relaxed text-walnut-soft max-w-md mb-8">
                A title for the cover, and a few words for the person who&apos;ll open it.
                Don&apos;t worry about getting it right — you can come back.
              </p>

              <div className="space-y-10">
                <PaperInput
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  suffix={`${title.length} / 80`}
                  hint="This is the only thing they'll see before it opens."
                />

                <PaperInput
                  label="A few words on the cover"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  hint="Visible while the capsule is still sealed."
                />
              </div>
            </div>
          </div>

          {/* Right preview */}
          <div className="md:col-span-2 flex flex-col items-center pt-12 md:pt-24">
            <div className="text-[10.5px] text-walnut-mute tracking-[0.22em] uppercase mb-6 font-medium">
              preview · the cover
            </div>
            <div className="w-full max-w-[320px] p-7 bg-bone-hi border border-rule rounded-lg shadow-xl shadow-walnut/5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="text-[10.5px] text-walnut-mute tracking-[0.16em] uppercase">
                  not yet sealed
                </div>
                <Hourglass size={36} progress={0} accent />
              </div>
              <div className="font-display text-2xl text-walnut leading-tight italic font-normal">
                {title || "Untitled Capsule"}
              </div>
              <div className="text-[12.5px] text-walnut-soft mt-3.5 leading-relaxed">
                {description || "No description provided."}
              </div>
              <div className="h-px bg-rule-soft my-5" />
              <div className="text-[10.5px] text-walnut-mute tracking-[0.16em] uppercase">
                opens · — pick a date next
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: THE DATE */}
      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div>
              <MarginNote rotate={-2} size={20}>choose a date that means something</MarginNote>
              <h2 className="font-display text-4xl md:text-5xl font-normal mt-2 mb-4 leading-none tracking-tight text-walnut">
                When should this <span className="italic text-moss">open?</span>
              </h2>
              <p className="text-base leading-relaxed text-walnut-soft max-w-md mb-8">
                This is the most important choice. Once sealed, the date cannot
                be moved earlier — only later.
              </p>

              <div className="space-y-6">
                <PaperInput
                  label="Unlock Date"
                  type="date"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
                
                <div className="p-6 bg-bone-hi border border-rule rounded-lg flex items-center gap-4">
                  <Hourglass size={30} progress={0.05} accent />
                  <div>
                    <div className="font-display text-lg font-medium text-walnut">
                      {format(new Date(unlockAt), "d MMMM yyyy")}
                    </div>
                    <div className="font-hand text-lg text-terra mt-0.5">
                      pick a date that carries weight
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center h-full opacity-30 select-none">
             <Hourglass size={300} progress={0.1} accent stroke={1.5} />
          </div>
        </div>
      )}

      {/* STEP 3: FOR WHOM */}
      {step === 2 && (
        <div className="space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
             <div className="p-7 border border-rule rounded-xl bg-bone-hi relative">
                <div className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-walnut-mute mb-4">1</div>
                <div className="font-display text-xl font-medium text-walnut mb-2">For yourself</div>
                <div className="text-sm text-walnut-soft">A letter for the you who shows up to open it.</div>
             </div>
             <div className="p-7 border-2 border-terra rounded-xl bg-bone-hi relative">
                <div className="w-8 h-8 rounded-full bg-terra flex items-center justify-center text-bone mb-4 font-bold">✓</div>
                <div className="font-display text-xl font-medium text-walnut mb-2">For someone you choose</div>
                <div className="text-sm text-walnut-soft">They get a private link by email. No account needed.</div>
             </div>
             <div className="p-7 border border-rule rounded-xl bg-bone-hi relative opacity-50">
                <div className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-walnut-mute mb-4">3</div>
                <div className="font-display text-xl font-medium text-walnut mb-2">For a group</div>
                <div className="text-sm text-walnut-soft italic">Coming soon</div>
             </div>
          </div>

          <div className="max-w-2xl">
            <MarginNote rotate={-2} size={20}>name them, the way you would on the envelope</MarginNote>
            <h3 className="font-display text-3xl font-normal mt-2 mb-8 leading-tight text-walnut tracking-tight">
              Who is this <span className="italic text-moss">for?</span>
            </h3>

            <div className="space-y-4">
              {recipients.map((r, i) => (
                <div key={i} className="p-6 bg-bone-hi border border-rule rounded-xl flex flex-col md:flex-row gap-4 items-end">
                   <div className="flex-1 w-full space-y-4">
                      <PaperInput 
                        label="Name" 
                        value={r.name} 
                        onChange={(e) => updateRecipient(i, "name", e.target.value)}
                        placeholder="e.g. Maya Lin"
                      />
                      <PaperInput 
                        label="Email" 
                        type="email"
                        value={r.email} 
                        onChange={(e) => updateRecipient(i, "email", e.target.value)}
                        placeholder="e.g. maya@email.com"
                      />
                   </div>
                   <button 
                    onClick={() => removeRecipient(i)}
                    className="text-xs text-walnut-mute hover:text-terra uppercase tracking-wider font-medium mb-4"
                   >
                    Remove
                   </button>
                </div>
              ))}

              <button 
                onClick={addRecipient}
                className="w-full p-8 border-2 border-dashed border-rule rounded-xl text-walnut-mute hover:text-walnut hover:border-walnut-mute transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="text-2xl font-display">＋</div>
                <div className="font-display italic text-lg text-walnut-mute">Add another recipient</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: WHAT TO PUT IN */}
      {step === 3 && (
        <div className="grid md:grid-cols-5 gap-16 items-start">
          <div className="md:col-span-3 space-y-8">
            <div>
              <MarginNote rotate={-2} size={20}>letters, photos, recordings — anything they should find</MarginNote>
              <h2 className="font-display text-4xl md:text-5xl font-normal mt-2 mb-4 leading-none tracking-tight text-walnut">
                What goes <span className="italic text-moss">inside?</span>
              </h2>
              <p className="text-base leading-relaxed text-walnut-soft max-w-md mb-8">
                Drag things in, or write directly. Drag items by their handle to reorder — that&apos;s the order they&apos;ll appear on opening day.
              </p>

              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {[
                  ["✎", "Write a letter"],
                  ["◧", "Add photos"],
                  ["▷", "Record video"],
                  ["♪", "Record audio"],
                ].map(([icon, label]) => (
                  <button
                    key={label}
                    className="flex items-center gap-2 px-4 py-2.5 bg-bone-hi border border-rule rounded-full text-[13px] text-walnut hover:bg-bone-soft transition-colors whitespace-nowrap"
                  >
                    <span className="font-display text-base">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-bone-hi border border-rule rounded-lg flex items-center gap-4">
                  <span className="text-walnut-mute text-lg">⋮⋮</span>
                  <div className="w-10 h-10 bg-bone border border-rule rounded flex items-center justify-center font-display text-lg">✎</div>
                  <div className="flex-1">
                    <div className="font-display text-lg font-medium text-walnut">A letter for sixteen-year-old Maya</div>
                    <div className="text-[11px] text-walnut-mute uppercase tracking-wider">letter · 1,840 words</div>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-rule rounded-xl text-center">
                   <p className="text-walnut-mute italic text-sm">
                      or drop files here — photos, video, audio, pdfs,<br/>anything up to 2 GB per capsule
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8 pt-12 md:pt-24">
             <div className="text-[10.5px] text-walnut-mute tracking-[0.22em] uppercase font-medium">The contents · so far</div>
             <div className="p-7 bg-bone-hi border border-rule rounded-xl shadow-xl shadow-walnut/5">
                <div className="flex justify-between items-center mb-6">
                   <div className="font-display text-3xl font-medium text-walnut">1 thing</div>
                   <Hourglass size={36} progress={0} accent />
                </div>
                <div className="space-y-2 text-sm text-walnut-soft">
                   <div className="flex justify-between"><span>1 letter</span><span>1,840 words</span></div>
                </div>
                <div className="h-px bg-rule-soft my-5" />
                <div className="flex justify-between text-[13px] text-walnut">
                   <span className="text-walnut-mute">Total size</span>
                   <span className="font-medium">0.1 MB / 2 GB</span>
                </div>
             </div>
             <div className="p-4 border border-dashed border-rule rounded-lg flex items-center gap-4 text-xs text-walnut-soft leading-relaxed">
                <Hourglass size={20} progress={0.5} />
                Everything is encrypted on your device before it leaves. We carry it, we don&apos;t read it.
             </div>
          </div>
        </div>
      )}

      {/* STEP 5: SEAL */}
      {step === 4 && (
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <div>
              <MarginNote rotate={-2} size={20}>this is the last quiet moment before</MarginNote>
              <h2 className="font-display text-4xl md:text-5xl font-normal mt-2 mb-4 leading-none tracking-tight text-walnut">
                Ready to <span className="italic text-moss">seal it?</span>
              </h2>
              <p className="text-base leading-relaxed text-walnut-soft max-w-md">
                Once sealed, the contents cannot be changed or opened early — by you, by us, or by anyone.
              </p>
            </div>

            <div className="p-6 border border-terra rounded-lg bg-terra/5 flex gap-4 items-start">
               <div className="text-terra font-display text-2xl italic leading-none">!</div>
               <p className="text-sm text-walnut-soft leading-relaxed">
                  <strong className="text-walnut">This is the irreversible part.</strong> Once you press that button, the garden will hold these memories until {format(new Date(unlockAt), "d MMMM yyyy")}.
               </p>
            </div>
          </div>

          <div className="p-8 bg-bone-hi border border-rule rounded-xl shadow-xl shadow-walnut/5">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] text-walnut-mute tracking-[0.2em] uppercase font-bold">Summary</div>
                  <div className="font-display text-2xl italic text-walnut mt-1">{title}</div>
                </div>
                <Hourglass size={40} progress={0} accent />
             </div>
             <div className="h-px bg-rule-soft my-6" />
             <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                <div>
                  <div className="text-[9px] text-walnut-mute tracking-widest uppercase mb-1">Opens</div>
                  <div className="font-medium text-walnut">{format(new Date(unlockAt), "d MMM yyyy")}</div>
                </div>
                <div>
                  <div className="text-[9px] text-walnut-mute tracking-widest uppercase mb-1">For</div>
                  <div className="font-medium text-walnut truncate">{recipients[0]?.name || "Yourself"}</div>
                </div>
                <div>
                  <div className="text-[9px] text-walnut-mute tracking-widest uppercase mb-1">Recipients</div>
                  <div className="font-medium text-walnut">{recipients.length}</div>
                </div>
                <div>
                  <div className="text-[9px] text-walnut-mute tracking-widest uppercase mb-1">Status</div>
                  <div className="font-medium text-moss italic">Ready to bloom</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </WizardChrome>
  );
}
