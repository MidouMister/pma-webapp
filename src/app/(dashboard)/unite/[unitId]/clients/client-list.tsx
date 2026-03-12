"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, Search, Phone, Mail, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClientForm } from "@/components/forms/client-form";
import { ClientActions } from "./client-actions";

interface Client {
  id: string;
  name: string;
  wilaya: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  projectCount: number;
  totalTTC: number;
}

interface ClientListProps {
  clients: Client[];
  unitId: string;
  isAdmin: boolean;
}

type SortField = "name" | "totalTTC";
type SortDirection = "asc" | "desc";

export function ClientList({ clients: initialClients, unitId, isAdmin }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredAndSortedClients = useMemo(() => {
    let result = [...initialClients];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.wilaya?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "totalTTC") {
        comparison = a.totalTTC - b.totalTTC;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [initialClients, debouncedSearch, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    );
  };

  if (initialClients.length === 0) {
    return <EmptyState isAdmin={isAdmin} unitId={unitId} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium pl-2">
                <button
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="pb-3 font-medium">Wilaya</th>
              <th className="pb-3 font-medium">Contact</th>
              <th className="pb-3 font-medium text-right">
                <button
                  className="flex items-center ml-auto hover:text-foreground transition-colors"
                  onClick={() => handleSort("totalTTC")}
                >
                  Total TTC
                  <SortIcon field="totalTTC" />
                </button>
              </th>
              <th className="pb-3 font-medium text-center">Projects</th>
              {isAdmin && <th className="pb-3 font-medium pr-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClients.map((client) => (
              <tr
                key={client.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="py-3 pl-2">
                  <Link href={`/unite/${unitId}/clients/${client.id}`} className="block">
                    <span className="font-medium text-sm">{client.name}</span>
                  </Link>
                </td>
                <td className="py-3">
                  <Link href={`/unite/${unitId}/clients/${client.id}`} className="block">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {client.wilaya || "—"}
                    </div>
                  </Link>
                </td>
                <td className="py-3">
                  <Link href={`/unite/${unitId}/clients/${client.id}`} className="block">
                    <div className="flex flex-col gap-1 text-sm">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                      )}
                      {!client.phone && !client.email && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="py-3 text-right">
                  <Link href={`/unite/${unitId}/clients/${client.id}`} className="block">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {formatAmount(client.totalTTC)}
                    </Badge>
                  </Link>
                </td>
                <td className="py-3 text-center">
                  <Link href={`/unite/${unitId}/clients/${client.id}`} className="block">
                    <span className="text-sm">{client.projectCount}</span>
                  </Link>
                </td>
                {isAdmin && (
                  <td className="py-3 pr-2">
                    <ClientActions client={client} unitId={unitId} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedClients.length === 0 && debouncedSearch && (
        <div className="text-center py-8 text-muted-foreground">
          No clients found matching &quot;{debouncedSearch}&quot;
        </div>
      )}
    </div>
  );
}

function EmptyState({ isAdmin, unitId }: { isAdmin: boolean; unitId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No clients yet</h3>
      <p className="text-muted-foreground text-center text-sm mb-4">
        {isAdmin
          ? "Add your first client to start managing projects."
          : "No clients linked to your assigned projects."}
      </p>
      {isAdmin && (
        <ClientForm
          unitId={unitId}
          trigger={
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Client
            </Button>
          }
        />
      )}
    </div>
  );
}
