"use client";

import { useState, useRef, useEffect, useId } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { mockBeneficiarios } from "@/lib/mocks";
import type { Beneficiario } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCpf } from "@/lib/utils/cpf";

interface BeneficiarioAutocompleteProps {
  value: Beneficiario | null;
  onChange: (b: Beneficiario | null) => void;
  error?: string;
  disabled?: boolean;
}

export function BeneficiarioAutocomplete({
  value,
  onChange,
  error,
  disabled,
}: BeneficiarioAutocompleteProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results =
    query.trim().length < 2
      ? []
      : mockBeneficiarios
          .filter((b) => {
            const q = query.toLowerCase();
            return (
              b.nome.toLowerCase().includes(q) ||
              b.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
            );
          })
          .slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(b: Beneficiario) {
    onChange(b);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
  }

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>Beneficiário</Label>
        <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
          <span className="flex-1 font-medium">{value.nome}</span>
          <span className="text-muted-foreground font-mono text-xs">
            {formatCpf(value.cpf)}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remover beneficiário"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <Label htmlFor={inputId}>Beneficiário</Label>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id={inputId}
          className="pl-8"
          placeholder="Buscar por nome ou CPF..."
          value={query}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && results.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md text-sm max-h-60 overflow-auto"
          >
            {results.map((b) => (
              <li
                key={b.id}
                role="option"
                aria-selected={false}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(b);
                }}
              >
                <span className="font-medium">{b.nome}</span>
                <span className="text-muted-foreground font-mono text-xs ml-3">
                  {formatCpf(b.cpf)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {open && query.trim().length >= 2 && results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-4 text-sm text-center text-muted-foreground">
            Nenhum beneficiário encontrado.
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
