import { useState } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/cart";
import type { Address } from "@/lib/types";

export type AddrScreen = "list" | "form";

const EMPTY_FORM: Address = { label: "", line1: "", line2: "", pincode: "", city: "", state: "", phone: "" };

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
          const res = await apiFetch<{ data: Address[] }>(
            url,
            { method, body: JSON.stringify(data) },
            token
          );
          onAddressesChange(res.data);
          setSubScreen("list");
        }}
      />
    );
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
              onClick={() => { setEditIndex(null); setSubScreen("form"); }}
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
                onClick={() => { setEditIndex(null); setSubScreen("form"); }}
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
                          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">{addr.label}</p>
                        )}
                        <p className="font-semibold">{addr.line1}</p>
                        {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                        <p className="text-muted-foreground">
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">📞 {addr.phone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditIndex(i); setSubScreen("form"); }}
                      className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                    >
                      Update
                    </button>
                  </div>
                  {total !== undefined && (
                    <button
                      type="button"
                      onClick={() => onSelect ? onSelect(addr) : undefined}
                      className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-[0.98]"
                    >
                      Deliver here · {formatPrice(total)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
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
  const [form, setForm] = useState<Address>(initialValue ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.line1.trim()) e.line1 = "Address line 1 is required";
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
    try { await onSave(form); } catch { setSaving(false); }
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
            <Field
              label="Address line 1 *"
              value={form.line1}
              onChange={set("line1")}
              placeholder="House / flat no., building name"
              error={errors.line1}
            />
            <Field
              label="Address line 2"
              value={form.line2}
              onChange={set("line2")}
              placeholder="Street, area, landmark (optional)"
            />
            <Field
              label="Pincode *"
              value={form.pincode}
              onChange={set("pincode")}
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              error={errors.pincode}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City *" value={form.city} onChange={set("city")} placeholder="City" error={errors.city} />
              <Field label="State *" value={form.state} onChange={set("state")} placeholder="State" error={errors.state} />
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
  label, value, onChange, placeholder, error, inputMode, maxLength,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
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
        className={`rounded-xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
