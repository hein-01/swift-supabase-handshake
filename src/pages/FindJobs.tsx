import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import jobBannerBg from "@/assets/job-banner-bg.jpg";
import { ChevronDown } from "lucide-react";

type JobRow = {
  id: string;
  business_name: string | null;
  job_title_key: string | null;
  job_title_custom: string | null;
  job_title?: string | null;
  job_titles_translation?: { label_en: string; label_my: string } | null;
  job_location_key: string | null;
  locations_translation?: { label_en: string; label_my: string } | null;
  education_key: string | null;
  education_custom: string | null;
  education_translation?: { label_en: string; label_my: string } | null;
  salary_structure: string;
  salary_type: 'monthly' | 'daily' | 'hourly';
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  age_min: number | null;
  age_max: number | null;
  benefits: string[] | null;
  application_deadline: string | null;
  description_my: string | null;
  phone_number: string | null;
};

type Title = { key: string; en: string; my: string };
type Location = { key: string; en: string; my: string };
type Education = { key: string; en: string; my: string };

type CardData = {
  id: string;
  businessName: string;
  jobTitleMy: string;
  salaryDisplay: string;
  jobLocationMy: string;
  jobType: string;
  educationMy: string;
  ageMin: number | null;
  ageMax: number | null;
  benefits: string[] | null;
  applicationDeadline: string;
  descriptionMy: string;
  contactNumber?: string | null;
};

const FindJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);
  const [titles, setTitles] = useState<Title[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [refsLoaded, setRefsLoaded] = useState(false);
  const titleMap = useMemo(() => Object.fromEntries(titles.map(t => [t.key, t])), [titles]);
  const locMap = useMemo(() => Object.fromEntries(locations.map(l => [l.key, l])), [locations]);
  const eduMap = useMemo(() => Object.fromEntries(educations.map(e => [e.key, e])), [educations]);

  useEffect(() => {
    if (!triggerRef.current) return;
    const el = triggerRef.current;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setTriggerWidth(rect.width);
    });
    ro.observe(el);
    // Initial measure
    setTriggerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  // Filters: use title keys
  const [selectedTitleKeys, setSelectedTitleKeys] = useState<string[]>([]);
  const [appliedTitleKeys, setAppliedTitleKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        type TitleRow = { title_key: string; label_en: string; label_my: string };
        type LocRow = { location_key: string; label_en: string; label_my: string };
        type EduRow = { education_key: string; label_en: string; label_my: string };

        const [{ data: jt, error: e1 }, { data: lc, error: e2 }, { data: ed, error: e3 }] = await Promise.all([
          supabase.from('job_titles_translation').select('title_key,label_en,label_my'),
          supabase.from('locations_translation').select('location_key,label_en,label_my'),
          supabase.from('education_translation').select('education_key,label_en,label_my'),
        ]);
        if (e1 || e2 || e3) throw (e1 || e2 || e3);
        const jtRows = (jt ?? []) as TitleRow[];
        const lcRows = (lc ?? []) as LocRow[];
        const edRows = (ed ?? []) as EduRow[];

        setTitles(jtRows.map(r => ({ key: r.title_key, en: r.label_en, my: r.label_my })));
        setLocations(lcRows.map(r => ({ key: r.location_key, en: r.label_en, my: r.label_my })));
        setEducations(edRows.map(r => ({ key: r.education_key, en: r.label_en, my: r.label_my })));
        setRefsLoaded(true);
      } catch (err) {
        console.error('Error fetching reference data', err);
        toast({ title: 'Error', description: 'Failed to load reference lists', variant: 'destructive' });
      }
    };
    fetchRefs().then(() => {
      // Only fetch jobs after references are ready so mapping to label_my works
      fetchJobs();
    });
  }, []);

  const buildSalaryText = (row: JobRow) => {
    const typeText = row.salary_type === 'monthly' ? '(Monthly)' : row.salary_type === 'daily' ? '(Daily)' : '(Hourly)';
    const isMonthly = row.salary_type === 'monthly';
    const toDisplay = (v: number | null | undefined) => {
      if (v === null || v === undefined) return undefined;
      return isMonthly ? (v / 100000) : v;
    };
    const unit = isMonthly ? 'Lakhs' : 'MMK';
    const min = toDisplay(row.salary_min);
    const max = toDisplay(row.salary_max);
    switch (row.salary_structure) {
      case 'negotiable':
        return `Salary: Negotiable ${typeText}`;
      case 'fixed':
        return `${min} ${unit} ${typeText}`;
      case 'range':
        return `${min} - ${max} ${unit} ${typeText}`;
      case 'min_only':
        return `From ${min} ${unit} ${typeText}`;
      case 'max_only':
        return `Up to ${max} ${unit} ${typeText}`;
      default:
        return '';
    }
  };

  const toCard = (row: JobRow): CardData => {
    // Prefer embedded translations from DB; fall back to client-side maps; then legacy columns
    const titleFromEmbed = row.job_titles_translation?.label_my || row.job_titles_translation?.label_en;
    const titleFromMap = row.job_title_key ? (titleMap[row.job_title_key]?.my || titleMap[row.job_title_key]?.en) : undefined;
    const title = row.job_title_key === 'custom'
      ? (row.job_title_custom || row.job_title || '')
      : (titleFromEmbed || titleFromMap || row.job_title || row.job_title_key || '');

    const locFromEmbed = row.locations_translation?.label_my || row.locations_translation?.label_en;
    const locFromMap = row.job_location_key ? (locMap[row.job_location_key]?.my || locMap[row.job_location_key]?.en) : undefined;
    const loc = locFromEmbed || locFromMap || row.job_location_key || '';

    const eduFromEmbed = row.education_translation?.label_my || row.education_translation?.label_en;
    const eduFromMap = row.education_key ? (eduMap[row.education_key]?.my || eduMap[row.education_key]?.en) : undefined;
    const edu = row.education_key === 'custom'
      ? (row.education_custom || '')
      : (eduFromEmbed || eduFromMap || row.education_key || '');
    return {
      id: row.id,
      businessName: row.business_name || '',
      jobTitleMy: title,
      salaryDisplay: buildSalaryText(row),
      jobLocationMy: loc,
      jobType: row.job_type || '',
      educationMy: edu,
      ageMin: row.age_min,
      ageMax: row.age_max,
      benefits: row.benefits,
      applicationDeadline: row.application_deadline || new Date().toISOString(),
      descriptionMy: row.description_my || '',
      contactNumber: row.phone_number,
    };
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("id,business_name,job_title_key,job_title_custom,job_title,job_titles_translation(label_en,label_my),job_location_key,locations_translation(label_en,label_my),education_key,education_custom,education_translation(label_en,label_my),salary_structure,salary_type,salary_min,salary_max,job_type,age_min,age_max,benefits,application_deadline,description_my,phone_number")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      const rows = (data || []) as unknown as JobRow[];
      setJobs(rows.map(toCard));
      setHasMore(rows.length === PAGE_SIZE);
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

  // Build and run a filtered page query
  const fetchFirstPageWithFilters = async (titleKeys: string[]) => {
    try {
      setLoading(true);
      let query = supabase
        .from("job_postings")
        .select("id,business_name,job_title_key,job_title_custom,job_title,job_titles_translation(label_en,label_my),job_location_key,locations_translation(label_en,label_my),education_key,education_custom,education_translation(label_en,label_my),salary_structure,salary_type,salary_min,salary_max,job_type,age_min,age_max,benefits,application_deadline,description_my,phone_number")
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (titleKeys.length > 0) {
        query = query.in('job_title_key', titleKeys);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []) as unknown as JobRow[];
      setJobs(rows.map(toCard));
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching filtered jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreJobs = async () => {
    try {
      setLoadingMore(true);
      const from = jobs.length;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from("job_postings")
        .select("id,business_name,job_title_key,job_title_custom,job_title,job_titles_translation(label_en,label_my),job_location_key,locations_translation(label_en,label_my),education_key,education_custom,education_translation(label_en,label_my),salary_structure,salary_type,salary_min,salary_max,job_type,age_min,age_max,benefits,application_deadline,description_my,phone_number")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (appliedTitleKeys.length > 0) {
        query = query.in('job_title_key', appliedTitleKeys);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []) as unknown as JobRow[];
      setJobs((prev) => [...prev, ...rows.map(toCard)]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load more job postings",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    const next = selectedTitleKeys;
    setAppliedTitleKeys(next);
    fetchFirstPageWithFilters(next);
  };
  
  const isTitleSelected = (key: string) => selectedTitleKeys.includes(key);
  const toggleTitle = (key: string) => {
    setSelectedTitleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
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
            
            {/* Filters Section (Dropdown) */}
            <div className="mb-8 p-4 md:p-6 border rounded-lg bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                <div className="flex-1 md:flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-full md:rounded-r-none justify-between"
                        ref={triggerRef}
                      >
                        <span>
                          Select job types{selectedTitleKeys.length > 0 ? ` (${selectedTitleKeys.length})` : ""}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="max-h-80 overflow-auto"
                      style={{ width: triggerWidth || undefined }}
                    >
                      <DropdownMenuLabel>Job filters</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        key="all"
                        checked={selectedTitleKeys.length === 0}
                        onCheckedChange={() => setSelectedTitleKeys([])}
                      >
                        All Jobs
                      </DropdownMenuCheckboxItem>
                      {titles.map((t) => (
                        <DropdownMenuCheckboxItem
                          key={t.key}
                          checked={isTitleSelected(t.key)}
                          onCheckedChange={() => toggleTitle(t.key)}
                        >
                          {t.en} / {t.my}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Actions */}
                <div className="md:w-auto flex flex-row md:flex-row gap-2 md:gap-0 md:justify-start justify-end items-center">
                  <Button
                    onClick={applyFilters}
                    className="w-full md:w-auto md:rounded-l-none md:rounded-r-none"
                  >
                    Find Jobs
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto rounded-none md:-ml-px"
                    onClick={() => {
                      setSelectedTitleKeys([]);
                      setAppliedTitleKeys([]);
                      fetchJobs();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              {/* Applied hint */}
              <div className="mt-3 text-xs text-muted-foreground">
                {appliedTitleKeys.length === 0
                  ? "Showing all jobs"
                  : `Applied filters: ${appliedTitleKeys.map(k => `${titleMap[k]?.en || k}`).join(", ")}`}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs posted yet. Be the first to post a job!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      businessName={job.businessName}
                      jobTitleMy={job.jobTitleMy}
                      salaryDisplay={job.salaryDisplay}
                      jobLocationMy={job.jobLocationMy}
                      jobType={job.jobType}
                      educationMy={job.educationMy}
                      ageMin={job.ageMin}
                      ageMax={job.ageMax}
                      benefits={job.benefits}
                      applicationDeadline={job.applicationDeadline}
                      descriptionMy={job.descriptionMy}
                      contactNumber={job.contactNumber}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMoreJobs} disabled={loadingMore} className="rounded-none">
                      {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindJobs;
