import { useState } from "react";
import { RiArrowRightLine, RiCheckLine } from "@remixicon/react";
import { PageHeader } from "./PageHeader";

const steps = ["Device", "Issue", "Location", "Review"];

export function RequestPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [device, setDevice] = useState("Phone");

  if (submitted)
    return (
      <>
        <PageHeader eyebrow="Repair request" title="Your request is live." />
        <section className="mx-auto max-w-xl px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#dff3e4] text-[#008a05]">
            <RiCheckLine className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold">
            We’ll find the right repairers.
          </h2>
          <p className="mt-3 text-[#717171]">
            Your request for a {device.toLowerCase()} repair has been shared
            with verified repairers near Colombo.
          </p>
          <a
            className="mt-7 inline-flex rounded-lg bg-[#222] px-5 py-3 text-sm font-semibold text-white"
            href="/dashboard"
          >
            View my repairs
          </a>
        </section>
      </>
    );
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
              <h2 className="text-xl font-semibold">What’s the issue?</h2>
              <textarea
                className="mt-5 min-h-32 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                defaultValue="My screen is cracked and the display flickers."
              />
              <p className="mt-3 text-sm text-[#717171]">
                You can add photos after the request is created.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">Where and when?</h2>
              <input
                className="mt-5 w-full rounded-lg border border-[#ddd] p-3 text-sm"
                defaultValue="Colombo, Sri Lanka"
              />
              <select className="mt-3 w-full rounded-lg border border-[#ddd] p-3 text-sm">
                <option>Any time</option>
                <option>Today</option>
                <option>This weekend</option>
              </select>
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
                  <dt>Location</dt>
                  <dd className="font-semibold">Colombo</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reply preference</dt>
                  <dd className="font-semibold">In-app messages</dd>
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
              onClick={() =>
                step === 3 ? setSubmitted(true) : setStep(step + 1)
              }
              className="flex items-center gap-2 rounded-lg bg-[#ff385c] px-5 py-3 text-sm font-semibold text-white"
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
