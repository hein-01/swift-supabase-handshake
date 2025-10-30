import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import jobBannerBg from "@/assets/job-banner-bg.jpg";

interface JobPosting {
  id: string;
  business_name: string;
  job_title: string;
  salary_amount: number;
  salary_type: string;
  job_location: string;
  job_type: string;
  education_requirement: string;
  age_min: number | null;
  age_max: number | null;
  benefits: string[] | null;
  application_deadline: string;
  description: string;
  contact_number: string;
}

const FindJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 pb-8">
        {/* Banner Section */}
        <div 
          className="relative h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${jobBannerBg})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content */}
          <div className="relative z-10 text-center px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Listing your job for free, click here
            </h2>
            <Button 
              size="lg"
              onClick={() => navigate("/post-a-job")}
              className="text-lg px-8 py-6 hover-scale"
            >
              Post a job FREE
            </Button>
          </div>
        </div>

        {/* Jobs Listing Section */}
        <div className="container mx-auto px-4 pt-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find Jobs</h1>
            <p className="text-muted-foreground mb-8">Browse available job opportunities</p>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs posted yet. Be the first to post a job!
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    businessName={job.business_name}
                    jobTitle={job.job_title}
                    salaryAmount={job.salary_amount}
                    salaryType={job.salary_type}
                    jobLocation={job.job_location}
                    jobType={job.job_type}
                    educationRequirement={job.education_requirement}
                    ageMin={job.age_min}
                    ageMax={job.age_max}
                    benefits={job.benefits}
                    applicationDeadline={job.application_deadline}
                    description={job.description}
                    contactNumber={job.contact_number}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindJobs;
