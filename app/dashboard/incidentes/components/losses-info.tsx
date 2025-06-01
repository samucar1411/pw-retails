"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign } from "lucide-react";
import { Incident } from "@/types/incident";
import { parseNumeric, formatCurrency } from "@/lib/format-utils";

interface LossesInfoProps {
  incident: Incident;
}

export const LossesInfo = React.memo(function LossesInfo({ incident }: LossesInfoProps) {
  const cashLoss = parseNumeric(incident.CashLoss || incident.cashLoss);
  const merchandiseLoss = parseNumeric(incident.MerchandiseLoss || incident.merchandiseLoss);
  const otherLosses = parseNumeric(incident.OtherLosses || incident.otherLosses);
  const totalLoss = parseNumeric(incident.TotalLoss || incident.totalLoss);
  
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 font-medium">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(totalLoss)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[300px] text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Desglose de pérdidas</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span>Efectivo:</span>
              <span>{formatCurrency(cashLoss)}</span>
              
              <span>Mercadería:</span>
              <span>{formatCurrency(merchandiseLoss)}</span>
              
              <span>Otros:</span>
              <span>{formatCurrency(otherLosses)}</span>
              
              <div className="col-span-2 border-t mt-1 pt-1"></div>
              
              <span>Total:</span>
              <span>{formatCurrency(totalLoss)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
