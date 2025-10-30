import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobCardProps {
  id: string;
  businessName: string;
  jobTitle: string;
  salaryAmount: number;
  salaryType: string;
  jobLocation: string;
  jobType: string;
  educationRequirement: string;
  ageMin: number | null;
  ageMax: number | null;
  benefits: string[] | null;
  applicationDeadline: string;
  description: string;
  contactNumber: string;
}

export const JobCard = ({
  businessName,
  jobTitle,
  salaryAmount,
  salaryType,
  jobLocation,
  jobType,
  educationRequirement,
  ageMin,
  ageMax,
  benefits,
  applicationDeadline,
  description,
  contactNumber,
}: JobCardProps) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleApply = () => {
    const viberLink = `viber://chat?url=viber://call&uri=viber://call/chat?number=+95${contactNumber.replace(/\+/g, '')}`;
    window.open(viberLink, '_blank');
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log("Report job clicked");
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase mb-1">{businessName}</p>
            <h3 className="text-2xl font-bold text-foreground mb-2">{jobTitle}</h3>
            <p className="text-lg font-semibold text-[hsl(var(--primary))]">
              $ {salaryAmount} per {salaryType}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReport}
            className="text-xs"
          >
            REPORT THIS JOB
          </Button>
        </div>

        {/* Info Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-[hsl(200,80%,85%)] text-[hsl(200,80%,30%)] hover:bg-[hsl(200,80%,80%)]">
            {jobLocation}
          </Badge>
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {jobType}
          </Badge>
          <Badge variant="secondary" className="bg-[hsl(120,40%,85%)] text-[hsl(120,40%,30%)] hover:bg-[hsl(120,40%,80%)]">
            {educationRequirement}
          </Badge>
        </div>

        {/* Age Range */}
        {(ageMin || ageMax) && (
          <p className="text-sm text-[hsl(30,100%,50%)] mb-2">
            {ageMin} - {ageMax}
          </p>
        )}

        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-[hsl(180,60%,40%)] mb-1">benefits</p>
            {benefits.map((benefit, index) => (
              <p key={index} className="text-sm text-foreground">
                {benefit}
              </p>
            ))}
          </div>
        )}

        {/* Deadline and Description Button */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowDescription(true)}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            SEE JOB DESCRIPTION
          </Button>
          <p className="text-sm text-muted-foreground">
            Deadline: {new Date(applicationDeadline).toLocaleDateString()}
          </p>
        </div>

        {/* Apply Section */}
        <div className="bg-[hsl(var(--primary))] text-primary-foreground p-4 rounded-md -mx-6 -mb-6 mt-4">
          <p className="text-sm mb-3">
            When ready to apply, please click the button to open the chat with this job poster on WhatsApp. 
            Send your CV or ask them anything. (Make sure you have WhatsApp installed!)
          </p>
          <Button
            onClick={handleApply}
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
          >
            APPLY
          </Button>
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{jobTitle}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-foreground">
            {description}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
