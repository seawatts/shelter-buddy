"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

import type { Animal } from "../../types";
import { DIFFICULTY_CONFIG } from "../../difficulty-config";

interface QuickReferenceDialogProps {
  animal: Animal;
  onStartWalk: () => void;
}

export function QuickReferenceDialog({
  animal,
  onStartWalk,
}: QuickReferenceDialogProps) {
  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-footprints"
          >
            <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
            <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
            <path d="M16 17h4" />
            <path d="M4 13h4" />
          </svg>
          Start Walk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Quick Reference for {animal.name}</span>
            <div
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{
                backgroundColor: difficultyConfig.color,
                color: "white",
              }}
            >
              {difficultyConfig.label}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Accordion
          type="multiple"
          className="rounded-lg border bg-muted/40 p-4"
        >
          <AccordionItem value="approved-activities">
            <AccordionTrigger>Approved Activities</AccordionTrigger>
            <AccordionContent>
              {animal.approvedActivities &&
              animal.approvedActivities.length > 0 ? (
                <ul className="space-y-1">
                  {animal.approvedActivities.map((activity, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {activity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No approved activities listed
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="important-notes">
            <AccordionTrigger>Important Notes</AccordionTrigger>
            <AccordionContent>
              {animal.generalNotes
                ?.filter((note) => note.isActive)
                .map((note, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {note.notes}
                  </p>
                )) ?? (
                <p className="text-sm text-muted-foreground">
                  No general notes available
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="kennel-handling">
            <AccordionTrigger>Out of Kennel Handling</AccordionTrigger>
            <AccordionContent>
              {animal.outKennelNotes
                ?.filter((note) => note.isActive)
                .map((note, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {note.notes}
                  </p>
                )) ?? (
                <p className="text-sm text-muted-foreground">
                  No out-of-kennel notes available
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {animal.medicalNotes?.some((note) => note.isActive) && (
            <AccordionItem value="medical-notes">
              <AccordionTrigger className="text-red-500">
                Medical Notes
              </AccordionTrigger>
              <AccordionContent>
                {animal.medicalNotes
                  .filter((note) => note.isActive)
                  .map((note, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {note.notes}
                    </p>
                  ))}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <div className="mt-6 flex justify-end">
          <Button onClick={onStartWalk} size="lg">
            Continue to Walk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
