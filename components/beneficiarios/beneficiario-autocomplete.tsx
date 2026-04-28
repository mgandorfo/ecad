"use client";

import { useState, useRef, useEffect, useId, useTransition } from "react";
import { createPortal } from "react-dom";
import { SearchIcon, XIcon, LoaderIcon } from "lucide-react";

import { listarBeneficiarios } from "@/app/(app)/beneficiarios/actions";
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
  const [results, setResults] = useState<Beneficiario[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const { items } = await listarBeneficiarios(query.trim(), 1, 8);
        setResults(items);
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Recalcula a posição do dropdown sempre que abre
  useEffect(() => {
    if (open && inputWrapRef.current) {
      setDropdownRect(inputWrapRef.current.getBoundingClientRect());
    }
  }, [open, results]);

  function handleSelect(b: Beneficiario) {
    onChange(b);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
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

  const showDropdown = open && query.trim().length >= 2;

  const dropdown =
    showDropdown && dropdownRect ? (
      <div
        style={{
          position: "fixed",
          top: dropdownRect.bottom + 4,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 9999,
        }}
      >
        {results.length > 0 ? (
          <ul
            role="listbox"
            className="rounded-md border bg-popover shadow-md text-sm max-h-60 overflow-auto"
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
        ) : !isPending ? (
          <div className="rounded-md border bg-popover shadow-md px-3 py-4 text-sm text-center text-muted-foreground">
            Nenhum beneficiário encontrado.
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <Label htmlFor={inputId}>Beneficiário</Label>
      <div className="relative" ref={inputWrapRef}>
        {isPending ? (
          <LoaderIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none animate-spin" />
        ) : (
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          id={inputId}
          className="pl-8"
          placeholder="Buscar por nome ou CPF..."
          value={query}
          disabled={disabled}
          aria-invalid={!!error}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
