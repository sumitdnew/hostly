import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Bed, Bath, Users, Wifi, MapPin, Edit2, Building2, Home } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/schema";

// Color palette for property card headers based on property name hash
const cardColors = [
  "from-primary/12 to-primary/4",
  "from-emerald-500/12 to-emerald-500/4",
  "from-amber-500/12 to-amber-500/4",
  "from-blue-500/12 to-blue-500/4",
  "from-violet-500/12 to-violet-500/4",
  "from-rose-500/12 to-rose-500/4",
];

function getCardColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return cardColors[Math.abs(hash) % cardColors.length];
}

export default function Properties() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Property>) => apiRequest("POST", "/api/properties", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDialogOpen(false);
      toast({ title: "Property created", description: "You can now add bookings for this property." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      apiRequest("PATCH", `/api/properties/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setEditingProperty(null);
      setIsDialogOpen(false);
      toast({ title: "Property updated" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      address: fd.get("address") as string,
      city: fd.get("city") as string,
      bedrooms: parseInt(fd.get("bedrooms") as string) || 1,
      bathrooms: parseInt(fd.get("bathrooms") as string) || 1,
      maxGuests: parseInt(fd.get("maxGuests") as string) || 2,
      wifiPassword: fd.get("wifiPassword") as string,
      checkInInstructions: fd.get("checkInInstructions") as string,
      houseRules: fd.get("houseRules") as string,
      emergencyContact: fd.get("emergencyContact") as string,
      status: "active",
    };

    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (property: Property) => {
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProperty(null);
    setIsDialogOpen(true);
  };

  const PropertyForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" name="name" placeholder="e.g. Palermo Soho Loft" defaultValue={editingProperty?.name || ""} required data-testid="input-property-name" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" placeholder="Full street address" defaultValue={editingProperty?.address || ""} required data-testid="input-property-address" />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="Buenos Aires" defaultValue={editingProperty?.city || ""} required />
        </div>
        <div>
          <Label htmlFor="wifiPassword">Wi-Fi Password</Label>
          <Input id="wifiPassword" name="wifiPassword" placeholder="Network password" defaultValue={editingProperty?.wifiPassword || ""} />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min={1} defaultValue={editingProperty?.bedrooms || 1} />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" name="bathrooms" type="number" min={1} defaultValue={editingProperty?.bathrooms || 1} />
        </div>
        <div>
          <Label htmlFor="maxGuests">Max Guests</Label>
          <Input id="maxGuests" name="maxGuests" type="number" min={1} defaultValue={editingProperty?.maxGuests || 2} />
        </div>
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input id="emergencyContact" name="emergencyContact" placeholder="+54 11 ..." defaultValue={editingProperty?.emergencyContact || ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="checkInInstructions">Check-in Instructions</Label>
        <Textarea id="checkInInstructions" name="checkInInstructions" rows={3} placeholder="How guests access the property..." defaultValue={editingProperty?.checkInInstructions || ""} data-testid="input-checkin-instructions" />
      </div>
      <div>
        <Label htmlFor="houseRules">House Rules</Label>
        <Textarea id="houseRules" name="houseRules" rows={3} placeholder="No smoking, quiet hours, etc." defaultValue={editingProperty?.houseRules || ""} />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || updateMutation.isPending}
        data-testid="button-submit-property"
      >
        {editingProperty ? "Save Changes" : "Add Property"}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          {properties && properties.length > 0 && (
            <p className="text-sm text-muted-foreground">{properties.length} {properties.length === 1 ? "property" : "properties"} managed</p>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-1.5" data-testid="button-add-property">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProperty ? "Edit Property" : "Add Property"}</DialogTitle>
            </DialogHeader>
            <PropertyForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : !properties || properties.length === 0 ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">No properties yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
            Add your first property to start managing bookings, guest check-ins, and maintenance.
          </p>
          <Button onClick={openCreateDialog} className="gap-1.5" data-testid="empty-add-property">
            <Plus className="w-4 h-4" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        /* ── Property Grid ── */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="border border-card-border overflow-hidden group"
              data-testid={`property-card-${property.id}`}
            >
              {/* Colored header with initial */}
              <div className={`h-28 bg-gradient-to-br ${getCardColor(property.name)} flex items-center justify-center relative`}>
                <span className="text-4xl font-bold text-foreground/10">
                  {property.name.charAt(0).toUpperCase()}
                </span>
                <Badge
                  variant="secondary"
                  className="absolute top-3 right-3 text-[10px]"
                >
                  {property.status}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{property.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{property.address}, {property.city}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms} bed</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} bath</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{property.maxGuests} guests</span>
                  {property.wifiPassword && <Wifi className="w-3.5 h-3.5" />}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => openEditDialog(property)}
                  data-testid={`button-edit-${property.id}`}
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
