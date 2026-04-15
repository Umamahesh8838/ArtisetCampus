import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import client from "@/api/client";

interface RoundModule {
  module_id: number;
  module_name?: string;
  weightage: number;
  difficulty: string;
  mandatory: boolean;
}

interface Round {
  round_config_id?: number;
  round_number?: number;
  label?: string; 
  isExam: boolean;
  modules: RoundModule[];
}

export default function RoundConfigPage() {
  const { id: jdId } = useParams();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [jdDetails, setJdDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!jdId) return;
      try {
        setLoading(true);
        
        let jdName = jdId;
        try {
           const jdRes = await client.get(`/jds/${jdId}`);
           setJdDetails(jdRes.data.jd);
           jdName = jdRes.data.jd?.title || jdId;
        } catch(e) {
           console.log("Could not fetch JD details directly")
        }

        // Fetch Configured Rounds
        const res = await client.get(`/rounds/jd/${jdId}`);
        
        // Fetch available modules safely
        let fetchedModules: any[] = [];
        try {
           const modRes = await client.get('/questions/modules');
           fetchedModules = modRes.data.modules || [];
           setAvailableModules(fetchedModules);
        } catch(e) {
           console.log("Could not fetch modules natively, might default");
        }

        const backendRounds = res.data.rounds?.map((r: any) => ({
          round_config_id: r.round_config_id,
          round_number: r.round_number,
          label: r.round_label,
          isExam: Boolean(r.is_exam),
          modules: r.modules?.map((m: any) => ({
             module_id: m.module_id,
             module_name: m.module_name,
             weightage: parseFloat(m.weightage) || 0.1,
             difficulty: m.difficulty_id || "medium",
             mandatory: !!m.is_mandatory
          })) || []
        })) || [];

        if (backendRounds.length > 0) {
          setRounds(backendRounds);
        } else {
          setRounds([
            { round_number: 1, label: "Aptitude Test", isExam: true, modules: [] },
            { round_number: 2, label: "Technical Interview", isExam: false, modules: [] },
          ]);
        }
      } catch (err: any) {
        toast.error("Failed to fetch round configurations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jdId]);

  const addRound = () => {
    setRounds([...rounds, { round_number: rounds.length + 1, label: "", isExam: false, modules: [] }]);
  };

  const addModule = (roundIndex: number) => {
    if (availableModules.length === 0) {
      toast.error("No valid test modules found in database to map");
      return;
    }
    const fallbackId = availableModules[0].module_id;
    const updated = [...rounds];
    updated[roundIndex].modules.push({ module_id: fallbackId, weightage: 0.1, difficulty: "medium", mandatory: true });
    setRounds(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await client.put(`/rounds/${jdId}`, { rounds });
      toast.success("Round configuration saved!");
      
      // Navigate back
      setTimeout(() => navigate('/admin/job-descriptions'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save configuration"); 
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
             <h1 className="font-display text-2xl font-bold text-foreground">Round Configuration</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1 ml-10">Configure selection rounds for JD ID: {jdDetails ? jdDetails.title : jdId}</p>
        </div>
        <Button className="gap-2" onClick={addRound}><Plus className="h-4 w-4" /> Add Round</Button>
      </div>

      <div className="space-y-4 ml-10">
        {rounds.map((round, ri) => (
          <Card key={ri}>
            <CardHeader className="pb-3 bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{round.round_number}</div>
                  <div className="flex items-center gap-3">
                    <Input value={round.label} onChange={e => { const u = [...rounds]; u[ri].label = e.target.value; setRounds(u); }} placeholder="Round name" className="w-56 h-9 font-medium" />
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm font-medium text-foreground">Exam Round?</span>
                      <Switch checked={round.isExam} onCheckedChange={v => { const u = [...rounds]; u[ri].isExam = v; setRounds(u); }} />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRounds(rounds.filter((_, i) => i !== ri))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {round.isExam && (
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between mt-2">
                   <h4 className="text-sm font-semibold">Test Modules</h4>
                   <Button variant="outline" size="sm" onClick={() => addModule(ri)}><Plus className="h-3 w-3 mr-2" /> Add Module</Button>
                </div>
                
                {round.modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No modules added yet.</p>
                ) : (
                    <div className="space-y-2 mt-3">
                      {round.modules.map((mod, mi) => (
                         <div key={mi} className="flex items-center gap-3 bg-white p-2 rounded border">
                            <select 
                               className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                               value={mod.module_id} 
                               onChange={e => { const u = [...rounds]; u[ri].modules[mi].module_id = parseInt(e.target.value); setRounds(u); }}
                            >
                               {availableModules.map(av => (
                                  <option key={av.module_id} value={av.module_id}>{av.module_name}</option>
                               ))}
                            </select>
                            
                            <Input 
                               type="number" 
                               placeholder="Weight (0.1)" 
                               className="w-24 h-9" 
                               value={mod.weightage} 
                               step="0.1"
                               onChange={e => { const u = [...rounds]; u[ri].modules[mi].weightage = parseFloat(e.target.value); setRounds(u); }} 
                            />
                            
                            <div className="flex items-center gap-2 px-2">
                               <Switch checked={mod.mandatory} onCheckedChange={v => { const u = [...rounds]; u[ri].modules[mi].mandatory = v; setRounds(u); }} />
                               <span className="text-xs text-muted-foreground whitespace-nowrap">Mandatory</span>
                            </div>
                            
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-auto" onClick={() => { const u = [...rounds]; u[ri].modules = u[ri].modules.filter((_, i) => i !== mi); setRounds(u); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      ))}
                    </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
        
        {rounds.length === 0 && (
           <div className="text-center py-10 bg-slate-50 border border-dashed rounded-lg text-muted-foreground">
             No rounds configured. Click Add Round to begin.
           </div>
        )}
      </div>

      <div className="flex justify-end pt-4 mt-6 border-t ml-10">
         <Button onClick={handleSave} size="lg" disabled={saving}>
           {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
           Save Round Configuration
         </Button>
      </div>
    </div>
  );
}
