import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageCircle, CalendarCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Booking, Property, Message } from "@shared/schema";

export default function GuestChat() {
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });
  const { data: properties } = useQuery<Property[]>({ queryKey: ["/api/properties"] });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeBookings = bookings?.filter(
    (b) => b.status === "confirmed" || b.status === "checked-in"
  );

  // Auto-select first booking
  useEffect(() => {
    if (!selectedBookingId && activeBookings && activeBookings.length > 0) {
      setSelectedBookingId(activeBookings[0].id);
    }
  }, [activeBookings, selectedBookingId]);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/bookings", selectedBookingId, "messages"],
    enabled: !!selectedBookingId,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/bookings/${selectedBookingId}/messages`, {
        content,
        sender: "guest",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/bookings", selectedBookingId, "messages"],
      });
      setInputValue("");
    },
  });

  const sendHostMessage = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/bookings/${selectedBookingId}/messages`, {
        content,
        sender: "host",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/bookings", selectedBookingId, "messages"],
      });
      setInputValue("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPropertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name || "\u2014";

  const selectedBooking = bookings?.find((b) => b.id === selectedBookingId);

  const handleSend = (asHost: boolean) => {
    if (!inputValue.trim()) return;
    if (asHost) {
      sendHostMessage.mutate(inputValue.trim());
    } else {
      sendMutation.mutate(inputValue.trim());
    }
  };

  // No bookings at all
  if (bookings && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No conversations yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
          Messages appear here when guests send questions about their stay. Add a booking first to get started.
        </p>
        <Link href="/admin/bookings">
          <Button variant="secondary" className="gap-1.5">
            <CalendarCheck className="w-4 h-4" />
            Go to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  // No active bookings
  if (!activeBookings || activeBookings.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No active conversations</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Guest messaging is available for confirmed and checked-in bookings. Messages will appear here when guests communicate.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] max-w-6xl">
      {/* Booking List */}
      <Card className="w-64 shrink-0 border border-card-border hidden md:flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Guests
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-1 pt-0 pb-2">
            {activeBookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBookingId(b.id)}
                className={`w-full text-left p-2.5 rounded-lg transition-colors text-sm ${
                  selectedBookingId === b.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
                data-testid={`chat-booking-${b.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold ${
                    selectedBookingId === b.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/8 text-primary"
                  }`}>
                    {b.guestName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-[13px]">{b.guestName}</p>
                    <p className={`text-[11px] mt-0.5 truncate ${
                      selectedBookingId === b.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {getPropertyName(b.propertyId)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border border-card-border flex flex-col min-w-0">
        {selectedBooking ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-card-border shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedBooking.guestName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {getPropertyName(selectedBooking.propertyId)} · {selectedBooking.checkIn} — {selectedBooking.checkOut}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {selectedBooking.status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-3/4" />
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-xs">
                    Use "Guest" to simulate a guest question (AI auto-responds) or "Host" to send as yourself.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === "guest" ? "" : "flex-row-reverse"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          msg.sender === "guest"
                            ? "bg-secondary"
                            : msg.sender === "ai"
                            ? "bg-primary/10"
                            : "bg-emerald-100 dark:bg-emerald-900/30"
                        }`}
                      >
                        {msg.sender === "guest" ? (
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : msg.sender === "ai" ? (
                          <Bot className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm ${
                          msg.sender === "guest"
                            ? "bg-secondary text-foreground"
                            : msg.sender === "ai"
                            ? "bg-primary/6 text-foreground"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            {msg.sender === "ai" ? "AI Assistant" : msg.sender}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-card-border shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(false);
                    }
                  }}
                  data-testid="input-chat-message"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSend(false)}
                  disabled={!inputValue.trim() || sendMutation.isPending}
                  title="Simulate a guest message — AI will auto-respond"
                  className="gap-1 shrink-0"
                  data-testid="button-send-as-guest"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Guest
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSend(true)}
                  disabled={!inputValue.trim() || sendHostMessage.isPending}
                  title="Send as host"
                  className="gap-1 shrink-0"
                  data-testid="button-send-as-host"
                >
                  <Send className="w-3.5 h-3.5" />
                  Host
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
                "Guest" simulates a guest question (AI responds automatically). "Host" sends as you.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a guest to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
