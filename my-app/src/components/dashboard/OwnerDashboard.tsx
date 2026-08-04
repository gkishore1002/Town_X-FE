import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, IndianRupee, Plus, Trash2 } from "lucide-react";

import { propertyAPI } from "@/services/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatInr } from "@/lib/finance";
// CreatePostModal is the existing, working listing-creation flow (image
// upload, multi-step form) — reused as-is rather than rebuilt.
import CreatePostModal from "@/components/CreatePostModal.jsx";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => propertyAPI.getMyProperties(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => propertyAPI.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setPendingDeleteId(null);
    },
  });

  const totalValue = properties.reduce((sum: number, p: { expected_price: number }) => sum + (p.expected_price || 0), 0);
  const forRentCount = properties.filter((p: { property_for: string }) => p.property_for === "Rent/Lease").length;

  return (
    <DashboardShell
      title="Your listings"
      subtitle="Manage the properties you've posted"
      actions={
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4" />
          Add property
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total listings" value={properties.length} icon={Building2} />
        <MetricCard label="Listed for rent" value={forRentCount} icon={Building2} />
        <MetricCard label="Combined asking value" value={formatInr(totalValue, { compact: true })} icon={IndianRupee} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-secondary" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-10 text-center">
          <Building2 className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium text-foreground">You haven't listed any properties yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Post your first listing to start reaching buyers and renters.</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
            <Plus className="size-4" />
            Add property
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: { id: number; images?: { url: string }[]; bhk_type: string; apartment_type: string; locality: string; city: string; expected_price: number; property_for: string }) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="h-36 bg-secondary">
                {property.images?.[0]?.url && (
                  <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">
                  {property.bhk_type} {property.apartment_type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.locality}, {property.city}
                </p>
                <p className="font-display text-lg font-semibold text-primary">
                  {formatInr(property.expected_price, { compact: true })}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/property/${property.id}`)}>
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={() => setPendingDeleteId(property.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries({ queryKey: ["my-properties"] });
        }}
      />

      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this listing?</DialogTitle>
            <DialogDescription>
              This removes the listing and its photos permanently. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
