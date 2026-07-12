"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import {
  getCategoryFieldGroups,
  type CategoryField,
  type CategoryFieldGroup,
} from "@/lib/category-fields";

const selectClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm";

type Props = {
  categorySlug: string;
  groups?: CategoryFieldGroup[];
};

function fieldVisible(field: CategoryField, values: Record<string, string>): boolean {
  if (!field.showIf) return true;
  const parent = values[field.showIf.key] ?? "";
  return field.showIf.values.includes(parent);
}

function FieldInput({
  field,
  values,
  onSelectChange,
}: {
  field: CategoryField;
  values: Record<string, string>;
  onSelectChange: (key: string, value: string) => void;
}) {
  const name = `attr_${field.key}`;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm py-2">
        <input type="checkbox" name={name} className="rounded" />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <select
        name={name}
        required={field.required}
        className={selectClass}
        defaultValue=""
        onChange={(e) => onSelectChange(field.key, e.target.value)}
      >
        <option value="">{field.required ? "Выберите" : "—"}</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        name={name}
        required={field.required}
        placeholder={field.placeholder}
        rows={3}
        className={selectClass}
      />
    );
  }

  return (
    <Input
      name={name}
      type={field.type === "number" ? "number" : "text"}
      required={field.required}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step}
    />
  );
}

export function CategoryFieldsForm({ categorySlug, groups }: Props) {
  const fieldGroups = groups ?? getCategoryFieldGroups(categorySlug);
  const [values, setValues] = useState<Record<string, string>>({});

  const visibleGroups = useMemo(() => {
    return fieldGroups.map((group) => ({
      ...group,
      fields: group.fields.filter((f) => fieldVisible(f, values)),
    })).filter((g) => g.fields.length > 0);
  }, [fieldGroups, values]);

  if (!visibleGroups.length) return null;

  const label = "text-sm font-medium text-[var(--text-secondary)] mb-1.5 block";

  function onSelectChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      {visibleGroups.map((group) => (
        <fieldset
          key={group.title}
          className="space-y-4 border border-[var(--border)] rounded-2xl p-5"
        >
          <legend className="font-bold px-2">{group.title}</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.fields.map((field) => (
              <div
                key={field.key}
                className={field.type === "checkbox" ? "sm:col-span-2" : ""}
              >
                {field.type !== "checkbox" && (
                  <label className={label}>
                    {field.label}
                    {field.required && " *"}
                    {field.unit && (
                      <span className="text-[var(--text-muted)] font-normal"> ({field.unit})</span>
                    )}
                  </label>
                )}
                <FieldInput field={field} values={values} onSelectChange={onSelectChange} />
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}
