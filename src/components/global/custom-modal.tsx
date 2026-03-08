"use client";

import React from "react";

/**
 * CustomModal stub.
 * This will be replaced with a real implementation using shadcn Dialog.
 */
export const CustomModal = ({ 
  title, 
  subheading,
  children,
  defaultOpen
}: { 
  title: string, 
  subheading?: string,
  children: React.ReactNode,
  defaultOpen?: boolean
}) => {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subheading && <p className="text-sm text-muted-foreground">{subheading}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};
