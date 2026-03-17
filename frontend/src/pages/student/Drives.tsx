import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DRIVES, formatSalary, STATUS_COLORS } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Search, Filter } from "lucide-react";

export default function AvailableDrives() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");

  const locations = [...new Set(DRIVES.map(d => d.location))];
  const experiences = [...new Set(DRIVES.map(d => d.experience))];

  const filtered = DRIVES.filter(d => {
    if (search && !d.company.toLowerCase().includes(search.toLowerCase()) && !d.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (locationFilter !== "all" && d.location !== locationFilter) return false;
    if (experienceFilter !== "all" && d.experience !== experienceFilter) return false;
    return true;
  });

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
              <Input placeholder="Search company or role..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Experience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                {experiences.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drive cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(drive => (
          <Card key={drive.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-xl text-primary">{drive.logo}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{drive.company}</h3>
                    <p className="text-sm text-muted-foreground">{drive.role}</p>
                  </div>
                </div>
                <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[drive.status]}`}>{drive.status}</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {drive.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Deadline: {drive.deadline}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {drive.openings} openings
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">{formatSalary(drive.salaryMin)} - {formatSalary(drive.salaryMax)}</span>
                <Badge variant="outline" className="text-xs">{drive.experience}</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/student/drives/${drive.id}`)}>View Details</Button>
                <Button size="sm" className="flex-1" disabled={drive.status !== "open"}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No drives found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
