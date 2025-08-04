"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Zap, 
  Clock, 
  HardDrive, 
  RefreshCw,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useDashboard } from "@/context/dashboard-context";

export function SmartDashboardMonitor() {
  const { smartMetrics, refreshData, isLoading } = useDashboard();

  if (!smartMetrics) return null;

  const {
    totalCount,
    loadedCount,
    pagesLoaded,
    totalPages,
    memoryUsageMB,
    isLoadingMore,
    isComplete,
    loadingProgress
  } = smartMetrics;

  const coveragePercentage = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;
  const isHighMemory = memoryUsageMB > 50;
  const isCriticalMemory = memoryUsageMB > 100;

  return (
    <React.Fragment>
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Smart Dashboard Monitor
            {isComplete ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : isLoadingMore ? (
              <Badge variant="outline">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            ) : (
              <Badge variant="secondary">
                Optimized
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Coverage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Data Coverage
            </span>
            <span className="font-mono">
              {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
            </span>
          </div>
          <Progress value={coveragePercentage} className="h-1.5" />
          <div className="text-xs text-muted-foreground">
            {coveragePercentage}% of incidents loaded across {pagesLoaded}/{totalPages} pages
          </div>
        </div>

        {/* Loading Progress */}
        {!isComplete && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Loading Progress
              </span>
              <span className="font-mono">{Math.round(loadingProgress)}%</span>
            </div>
            <Progress value={loadingProgress} className="h-1.5" />
          </div>
        )}

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Memory Usage
            </span>
            <Badge 
              variant={isCriticalMemory ? "destructive" : isHighMemory ? "secondary" : "outline"}
              className="text-xs font-mono"
            >
              {memoryUsageMB.toFixed(1)} MB
            </Badge>
          </div>
          {isCriticalMemory && (
            <div className="text-xs text-destructive">
              ⚠️ High memory usage detected
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span>Pages</span>
            <span className="font-mono">{pagesLoaded}/{totalPages}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span>Strategy</span>
            <span className="font-mono">Parallel</span>
          </div>
        </div>

        {/* Performance Tips */}
        {isComplete && coveragePercentage < 100 && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
            💡 Smart loading active: Only showing most relevant {loadedCount.toLocaleString()} incidents 
            to optimize performance
          </div>
        )}
      </CardContent>
    </Card>
    </React.Fragment>
  );
}