import { useState } from "react";
import { RiArrowRightLine } from "@remixicon/react";
import { PageHeader } from "./PageHeader";
import { useNavigate } from "react-router";
import { useMarketplace } from "@/features/mock/MarketplaceContext";

const steps = ["Device", "Issue", "Location", "Review"];

export function RequestPage() {
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState("Phone");
  const [issue, setIssue] = useState("");
  const [method, setMethod] = useState("Shop visit");
  const [location, setLocation] = useState("Colombo, Sri Lanka");
  const [preferredTime, setPreferredTime] = useState("Any time");
  const [budget, setBudget] = useState("");
  const { createRequest } = useMarketplace();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader eyebrow="Create a request" title="Tell us what needs fixing.">
        <p className="mt-3 text-sm text-[#717171]">
          No commitment—compare quotes before you book.
        </p>
      </PageHeader>
      <section className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-9 flex items-center justify-between">
          {steps.map((label, index) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <span
                className={`grid size-6 place-items-center rounded-full ${index <= step ? "bg-[#222] text-white" : "bg-[#ebebeb] text-[#717171]"}`}
              >
                {index + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#ddd] p-6 sm:p-8">
          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold">
                What device needs repair?
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Phone", "Laptop", "Tablet", "Appliance"].map((name) => (
                  <button
                    key={name}
                    onClick={() => setDevice(name)}
                    className={`rounded-lg border p-4 text-left text-sm font-medium ${device === name ? "border-[#222] bg-[#f7f7f7]" : "border-[#ddd]"}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold">What's the issue?</h2>
              <textarea
                className="mt-5 min-h-32 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                placeholder="Describe the problem with your device…"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
              <p className="mt-3 text-sm text-[#717171]">
                You can add photos after the request is created.
              </p>
              <div className="mt-5">
                <label className="block text-sm font-medium text-[#444]">
                  Preferred repair method
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>Shop visit</option>
                  <option>Pickup / drop-off</option>
                  <option>On-site visit</option>
                </select>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">Where and when?</h2>
              <input
                className="mt-5 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <select
                className="mt-3 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              >
                <option>Any time</option>
                <option>Today</option>
                <option>This weekend</option>
              </select>
              <input
                type="number"
                className="mt-3 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                placeholder="Optional budget (Rs.)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold">
                Ready to request quotes?
              </h2>
              <dl className="mt-5 space-y-3 rounded-lg bg-[#f7f7f7] p-4 text-sm">
                <div className="flex justify-between">
                  <dt>Device</dt>
                  <dd className="font-semibold">{device}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Issue</dt>
                  <dd className="max-w-[60%] text-right font-semibold">
                    {issue
                      ? issue.length > 60
                        ? issue.slice(0, 60) + "…"
                        : issue
                      : "No description provided."}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Location</dt>
                  <dd className="font-semibold">{location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Preferred time</dt>
                  <dd className="font-semibold">{preferredTime}</dd>
                </div>
              </dl>
            </>
          )}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className={`text-sm font-semibold underline ${step === 0 ? "invisible" : ""}`}
            >
              Back
            </button>
            <button
              onClick={async () => {
                if (step !== 3) {
                  setStep(step + 1);
                  return;
                }
                const requestId = await createRequest({
                  title: `${device} repair request`,
                  device,
                  issue: issue || "No description provided.",
                  location,
                  preferredTime,
                  method,
                  budget: budget ? Number(budget) : 0,
                });
                navigate(`/consumer/repairs/${requestId}`);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#157a5a] px-5 py-3 text-sm font-semibold text-white"
            >
              {step === 3 ? "Request quotes" : "Continue"}{" "}
              <RiArrowRightLine className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
