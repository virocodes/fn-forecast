"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            FN Forecast
          </div>
          <Button variant="ghost" onClick={() => {
            window.location.href = "/signin"
          }}>Sign In</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="container max-w-4xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">🎮 Fortnite Creative Analytics</Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Analyze & Forecast Map Performance
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter any Fortnite Creative map code to get detailed analytics and future performance predictions. Make data-driven decisions for your map.
              </p>
            </div>
            <div className="space-y-4">
              <Button size="lg" className="w-full md:w-auto" onClick={() => {
                window.location.href = "/signin"
              }}>
                Get Started
              </Button>
              <p className="text-sm text-muted-foreground">
                Start analyzing your map&apos;s performance today
              </p>
            </div>
            <Card className="p-6 bg-muted/50 max-w-2xl mx-auto">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Past Performance</h3>
                    <p className="text-sm text-muted-foreground">View historical player data and engagement metrics</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Future Forecast</h3>
                    <p className="text-sm text-muted-foreground">Get AI-powered predictions for future performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}