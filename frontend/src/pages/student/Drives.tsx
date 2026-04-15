import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, formatSalary } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Search, Filter, Loader2 } from "lucide-react";
import { getDrives, Drive as BackendDrive } from "@/api/drives";
import { applyToDrive } from "@/api/applications";
import { toast } from "sonner";

export default function AvailableDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<BackendDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDrives();
      setDrives(res.data.drives);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch drives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (driveId: number) => {
    try {
      setApplying(driveId);
      // For now, we use a fixed jd_id since the full JD system isn't wired yet.
      // In a real scenario, this would come from the drive's JD selection.
      await applyToDrive({
        drive_id: driveId,
        jd_id: 1, // Fallback/Test JD ID
        company_id: 1 // Fallback/Test Company ID
      });
      toast.success("Applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const filtered = drives.filter(d => 
    d.drive_name.toLowerCase().includes(search.toLowerCase()) && d.is_active
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Available Drives</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and apply for campus recruitment drives.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search drives..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drive cards grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(drive => (
            <Card key={drive.drive_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-xl text-primary">
                      {drive.drive_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{drive.drive_name}</h3>
                      <p className="text-sm text-muted-foreground">General Recruitment</p>
                    </div>
                  </div>
                  <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[drive.status as keyof typeof STATUS_COLORS] || ""}`}>{drive.status}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Multiple Locations
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Deadline: {new Date(drive.drive_end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Users className="h-3.5 w-3.5" /> Openings: To be announced
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">{formatSalary(300000)} - {formatSalary(600000)}</span>
                  <Badge variant="outline" className="text-xs">0-1 yrs</Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/student/drives/${drive.drive_id}`)}>View Details</Button>
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    disabled={drive.status !== "ongoing" && drive.status !== "upcoming" || applying === drive.drive_id}
                    onClick={() => handleApply(drive.drive_id)}
                  >
                    {applying === drive.drive_id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No drives found matching your search.</p>
        </div>
      )}
    </div>
  );
}

