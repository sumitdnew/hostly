import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Calendar, Home, Wifi, BookOpen, Phone, CheckCircle2, Building2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

interface CheckInData {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  idVerified: boolean;
  guestIdNumber: string;
}

interface VerifyResponse {
  success: boolean;
  checkInInstructions: string;
  wifiPassword: string;
  houseRules: string;
  emergencyContact: string;
}

export default function CheckIn() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const [verifyData, setVerifyData] = useState<VerifyResponse | null>(null);

  const { data, isLoading, error } = useQuery<CheckInData>({
    queryKey: ["/api/checkin", bookingId],
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/checkin/${bookingId}/verify`);
      return res.json();
    },
    onSuccess: (data: VerifyResponse) => {
      setVerifyData(data);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border border-card-border">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Booking not found or invalid link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold" data-testid="checkin-title">Guest Check-in</h1>
          <p className="text-sm text-muted-foreground mt-1">Verify guest identity and complete check-in</p>
        </div>

        {/* Guest Info */}
        <Card className="border border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Guest Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold" data-testid="guest-name">{data.guestName}</p>
                <p className="text-xs text-muted-foreground">ID: {data.guestIdNumber || "Not provided"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs">{data.propertyName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs tabular-nums">{data.checkIn}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        {!data.idVerified && !verifyData ? (
          <Card className="border border-card-border">
            <CardContent className="py-6 text-center space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
              <div>
                <p className="text-sm font-semibold">ID Verification Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check the guest's ID matches: <strong>{data.guestIdNumber}</strong>
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                data-testid="button-verify-id"
              >
                {verifyMutation.isPending ? "Verifying..." : "Confirm ID Verified"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Verified Badge */}
            <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="py-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">ID Verified</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Guest has been checked in successfully</p>
                </div>
              </CardContent>
            </Card>

            {/* Check-in Details */}
            {(verifyData || data.idVerified) && (
              <Card className="border border-card-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Check-in Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verifyData?.checkInInstructions && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Instructions</span>
                      </div>
                      <p className="text-sm leading-relaxed" data-testid="checkin-instructions">
                        {verifyData.checkInInstructions}
                      </p>
                    </div>
                  )}

                  {verifyData?.wifiPassword && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Wi-Fi</span>
                      </div>
                      <Badge variant="secondary" className="font-mono text-sm" data-testid="wifi-password">
                        {verifyData.wifiPassword}
                      </Badge>
                    </div>
                  )}

                  {verifyData?.houseRules && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">House Rules</span>
                      </div>
                      <p className="text-sm leading-relaxed">{verifyData.houseRules}</p>
                    </div>
                  )}

                  {verifyData?.emergencyContact && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Emergency</span>
                      </div>
                      <p className="text-sm font-mono">{verifyData.emergencyContact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="pt-4">
          <PerplexityAttribution />
        </div>
      </div>
    </div>
  );
}
