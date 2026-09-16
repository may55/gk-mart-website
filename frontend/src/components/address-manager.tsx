import { useState } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import type { Address } from "@/lib/types";

export type AddrScreen = "list" | "form" | "request";

export const SOCIETIES = [
  "Shubh Labh Residency, Khajrana Square, Indore, Madhya Pradesh 452018",
  "Sanjhi Chhat Apartment, Khajrana Square, Indore, Madhya Pradesh 452018",
  "Shubh Labh Prime, Indore, Madhya Pradesh 452018",
] as const;

const EMPTY_FORM: Address = {
  label: "",
  society: "",
  societyAddress: "",
  flatNumber: "",
  block: "",
  floor: "",
  line1: "",
  line2: "",
  pincode: "",
  city: "",
  state: "",
  phone: "",
};

const getUnitDetails = (address: Address) =>
  address.block || address.floor
    ? `${address.flatNumber}, Block ${address.block}, Floor ${address.floor}`
    : address.flatNumber || address.line1;

// ─── AddressManager ───────────────────────────────────────────────────────────
// Handles the full list→form→save flow. Used from both Cart and Profile.
export function AddressManager({
  addresses,
  addrLoading,
  token,
  onAddressesChange,
  onBack,
  total, // if provided → show "Deliver here" button on each address card
  onSelect, // if provided → called when user clicks "Deliver here"
}: {
  addresses: Address[];
  addrLoading: boolean;
  token: string | null;
  onAddressesChange: (a: Address[]) => void;
  onBack: () => void;
  total?: number;
  onSelect?: (addr: Address) => void;
}) {
  const [subScreen, setSubScreen] = useState<AddrScreen>("list");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  if (subScreen === "form") {
    return (
      <AddressForm
        initialValue={editIndex !== null ? addresses[editIndex] : undefined}
        onBack={() => setSubScreen("list")}
        onSave={async (data) => {
          if (!token) return;
          const url = editIndex !== null ? `/user/addresses/${editIndex}` : "/user/addresses";
          const method = editIndex !== null ? "PUT" : "POST";
          const payload = {
            ...data,
            line1: data.flatNumber,
            line2: data.societyAddress,
            city: "Indore",
            state: "Madhya Pradesh",
            pincode: "452018",
          };
          const res = await apiFetch<{ data: Address[] }>(
            url,
            { method, body: JSON.stringify(payload) },
            token,
          );
          onAddressesChange(res.data);
          setSubScreen("list");
        }}
      />
    );
  }

  if (subScreen === "request") {
    return <DeliveryRequestForm token={token} onBack={() => setSubScreen("list")} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-extrabold tracking-tight">Delivery addresses</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditIndex(null);
                setSubScreen("form");
              }}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              + Add address
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 pt-2">
          {addrLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold">No saved addresses</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a delivery address to continue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditIndex(null);
                  setSubScreen("form");
                }}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
              >
                + Add address
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {addresses.map((addr, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 text-sm leading-snug">
                        {addr.label && (
                          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                            {addr.label}
                          </p>
                        )}
                        <p className="font-semibold">{getUnitDetails(addr)}</p>
                        {addr.society && <p className="text-muted-foreground">{addr.society}</p>}
                        <p className="text-muted-foreground">
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">📞 {addr.phone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIndex(i);
                        setSubScreen("form");
                      }}
                      className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                    >
                      Update
                    </button>
                  </div>
                  {total !== undefined && (
                    <button
                      type="button"
                      onClick={() => (onSelect ? onSelect(addr) : undefined)}
                      className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-[0.98]"
                    >
                      Deliver here · {formatPrice(total)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setSubScreen("request")}
            className="mt-6 w-full rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-4 text-left"
          >
            <p className="text-sm font-bold text-primary">Request delivery in another area</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tell us your full address and we’ll review your request.
            </p>
          </button>
        </main>
      </div>
    </div>
  );
}

// ─── AddressForm ──────────────────────────────────────────────────────────────
export function AddressForm({
  initialValue,
  onBack,
  onSave,
}: {
  initialValue?: Address;
  onBack: () => void;
  onSave: (data: Address) => Promise<void>;
}) {
  const [form, setForm] = useState<Address>(() =>
    initialValue
      ? { ...initialValue, flatNumber: getUnitDetails(initialValue), block: "", floor: "" }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.society) e.society = "Select a society";
    if (!form.flatNumber.trim()) e.flatNumber = "Flat, block and floor details are required";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Pincode must be 6 digits";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Phone must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-extrabold tracking-tight">
              {initialValue ? "Update address" : "Add address"}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-5 pt-2">
          <div className="space-y-4">
            <Field
              label="Address name (optional)"
              value={form.label}
              onChange={set("label")}
              placeholder="e.g. Home, Office, Parents'"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Society *</label>
              <select
                value={form.society}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    society: e.target.value,
                    societyAddress: e.target.value,
                    city: "Indore",
                    state: "Madhya Pradesh",
                    pincode: "452018",
                  }))
                }
                className={`rounded-xl border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.society ? "border-destructive" : "border-border"}`}
              >
                <option value="">Select society</option>
                {SOCIETIES.map((society) => (
                  <option key={society} value={society}>
                    {society.split(",")[0]}
                  </option>
                ))}
              </select>
              {errors.society && (
                <p className="text-[11px] font-medium text-destructive">{errors.society}</p>
              )}
              {form.society && (
                <p className="text-xs text-muted-foreground">{form.societyAddress}</p>
              )}
            </div>
            <Field
              label="Flat / block / floor *"
              value={form.flatNumber}
              onChange={set("flatNumber")}
              placeholder="e.g. Flat 402, Block A, Floor 4"
              error={errors.flatNumber}
            />
            <Field
              label="Pincode *"
              value={form.pincode}
              onChange={set("pincode")}
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              readOnly
              error={errors.pincode}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="City *"
                value={form.city}
                onChange={set("city")}
                placeholder="City"
                readOnly
                error={errors.city}
              />
              <Field
                label="State *"
                value={form.state}
                onChange={set("state")}
                placeholder="State"
                readOnly
                error={errors.state}
              />
            </div>
            <Field
              label="Delivery phone *"
              value={form.phone}
              onChange={set("phone")}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              maxLength={10}
              error={errors.phone}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)] active:scale-[0.98] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialValue ? "Update address" : "Save address"}
          </button>
        </main>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
  maxLength,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        readOnly={readOnly}
        className={`rounded-xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function DeliveryRequestForm({ token, onBack }: { token: string | null; onBack: () => void }) {
  const [fullAddress, setFullAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!token || fullAddress.trim().length < 10 || !/^\d{10}$/.test(phone)) {
      setMessage("Enter a complete address and a valid 10-digit phone number.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(
        "/delivery-requests",
        { method: "POST", body: JSON.stringify({ fullAddress, phone }) },
        token,
      );
      setMessage("Request received. We’ll contact you after reviewing the area.");
      setFullAddress("");
      setPhone("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="flex items-center gap-2 px-5 pb-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-extrabold">Request delivery</h1>
        </header>
        <main className="flex-1 space-y-4 px-5 pt-2">
          <p className="text-sm text-muted-foreground">
            We currently deliver only to selected societies. Request delivery by sharing your full
            address.
          </p>
          <textarea
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            rows={6}
            placeholder="Enter your full address"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="Contact phone number"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          {message && (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Submitting…" : "Request delivery"}
          </button>
        </main>
      </div>
    </div>
  );
}
