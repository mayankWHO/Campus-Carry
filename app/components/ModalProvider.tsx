"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, HelpCircle } from "lucide-react";

interface ConfirmModalContextType {
  confirm: (message: string) => Promise<boolean>;
  showAlert: (message: string) => Promise<void>;
}

const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "confirm" | "alert";
    message: string;
    resolve: ((val: boolean) => void) | null;
  }>({
    isOpen: false,
    type: "confirm",
    message: "",
    resolve: null,
  });

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: "confirm",
        message,
        resolve: (val) => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(val);
        },
      });
    });
  };

  const showAlert = (message: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      setModalState({
        isOpen: true,
        type: "alert",
        message,
        resolve: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve();
        },
      });
    });
  };

  return (
    <ConfirmModalContext.Provider value={{ confirm, showAlert }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] max-w-sm w-full shadow-[6px_6px_0px_0px_rgba(3,89,77,1)] flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-150 text-maggie-primary font-bold">
            {/* Header Icon */}
            <div className={`h-12 w-12 rounded-2xl border-2 border-maggie-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] ${
              modalState.type === "confirm" ? "bg-maggie-yellow" : "bg-maggie-pink"
            }`}>
              {modalState.type === "confirm" ? (
                <HelpCircle className="h-6 w-6 text-maggie-primary" />
              ) : (
                <AlertCircle className="h-6 w-6 text-maggie-primary" />
              )}
            </div>

            {/* Title / Description */}
            <div className="space-y-1">
              <h3 className="text-base font-black uppercase tracking-tight">
                {modalState.type === "confirm" ? "Confirm Action" : "Notice"}
              </h3>
              <p className="text-sm font-semibold text-maggie-primary/80 leading-relaxed">
                {modalState.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3 pt-2">
              {modalState.type === "confirm" ? (
                <>
                  <button
                    onClick={() => modalState.resolve?.(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-maggie-primary/30 hover:border-maggie-primary bg-maggie-clay text-maggie-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => modalState.resolve?.(true)}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint text-maggie-primary text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => modalState.resolve?.(true)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint text-maggie-primary text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
}
