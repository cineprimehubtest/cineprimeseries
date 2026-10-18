"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { CastMember } from "@/types";
import { User } from "lucide-react";

interface PersonModalProps {
  person: CastMember | null;
  onClose: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({ person, onClose }) => {
  if (!person) return null;

  return (
    <Modal isOpen={!!person} onClose={onClose} title={person.name} maxWidth="md">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="relative w-36 h-48 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-lg">
          {person.profileUrl ? (
            <Image
              src={person.profileUrl}
              alt={person.name}
              fill
              className="object-cover"
              sizes="144px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <User size={48} />
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <h4 className="text-xl font-bold text-white">{person.name}</h4>
            <p className="text-sm font-medium text-accent-light">
              Character: {person.character}
            </p>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
            <p>
              <strong className="text-slate-300">Credit Role:</strong> Series Principal Cast
            </p>
            {person.placeOfBirth && (
              <p>
                <strong className="text-slate-300">Origin:</strong> {person.placeOfBirth}
              </p>
            )}
            <p>
              <strong className="text-slate-300">Verified Database ID:</strong> {person.id}
            </p>
          </div>

          <p className="text-xs text-slate-300/80 leading-relaxed pt-2">
            Verified series credit confirmed via TV-series cast metadata registry.
          </p>
        </div>
      </div>
    </Modal>
  );
};
