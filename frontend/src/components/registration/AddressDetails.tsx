import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { useCountries, useStates, useCities, usePincodes } from "@/hooks/useLookup";

const emptyAddress = () => ({
  line1: '', line2: '', careOf: '', landmark: '',
  country: '', state: '', city: '', pincode: '',
  lat: '19.0760', lng: '72.8777',
});

const REQUIRED = ['line1', 'country', 'state', 'city', 'pincode'];

const AddressFields = ({ data, onChange, type }: { data: ReturnType<typeof emptyAddress>; onChange: (f: string, v: string) => void; type: string }) => {        
  const countries = useCountries();
  const states = useStates(data.country);
  const cities = useCities(data.state);
  const pincodes = usePincodes(data.city);

  return (
  <div className="space-y-4 animate-fade-in">
    <Badge variant="outline" className="mb-2">{type}</Badge>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">      
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
        <label className="field-label">Address Line 1 <span className="field-required">*</span></label>
        <Input value={data.line1 || ""} onChange={e => onChange('line1', e.target.value)} placeholder="Street address" />
      </div>
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
        <label className="field-label">Address Line 2</label>
        <Input value={data.line2 || ""} onChange={e => onChange('line2', e.target.value)} placeholder="Apartment, suite, etc." />
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Care Of</label>
        <Input value={data.careOf || ""} onChange={e => onChange('careOf', e.target.value)} placeholder="C/O" />
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Landmark</label>
        <Input value={data.landmark || ""} onChange={e => onChange('landmark', e.target.value)} placeholder="Near..." />
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Country <span className="field-required">*</span></label>
        <Select value={data.country?.toString() || ""} onValueChange={v => { onChange('country', v); onChange('state', ''); onChange('city', ''); onChange('pincode', ''); }}>
          <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
          <SelectContent>{(countries || []).map((c: any) => <SelectItem key={c.country_id} value={c.country_id.toString()}>{c.country_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="field-label">State <span className="field-required">*</span></label>
        <Select value={data.state?.toString() || ""} onValueChange={v => { onChange('state', v); onChange('city', ''); onChange('pincode', ''); }} disabled={!data.country}>
          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
          <SelectContent>{(states || []).map((s: any) => <SelectItem key={s.state_id} value={s.state_id.toString()}>{s.state_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="field-label">City <span className="field-required">*</span></label>
        <Select value={data.city?.toString() || ""} onValueChange={v => { onChange('city', v); onChange('pincode', ''); }} disabled={!data.state}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>{(cities || []).map((c: any) => <SelectItem key={c.city_id} value={c.city_id.toString()}>{c.city_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Pincode <span className="field-required">*</span></label>
        <Select value={data.pincode?.toString() || ""} onValueChange={v => onChange('pincode', v)} disabled={!data.city}>
          <SelectTrigger><SelectValue placeholder={pincodes?.length ? "Select Pincode" : "Enter Pincode"} /></SelectTrigger>
          <SelectContent>{(pincodes || []).map((p: any) => <SelectItem key={p.pincode_id} value={p.pincode_id.toString()}>{p.pincode}</SelectItem>)}</SelectContent>
        </Select>
        {(!pincodes || pincodes.length === 0) && (
           <Input value={data.pincode || ""} onChange={e => onChange('pincode', e.target.value)} placeholder="e.g. 400001" disabled={!data.city} className="mt-2" />
        )}
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Latitude</label>
        <Input value={data.lat || ""} readOnly className="bg-muted text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Longitude</label>
        <Input value={data.lng || ""} readOnly className="bg-muted text-muted-foreground" />
      </div>
    </div>
  </div>
  );
};

const AddressDetails = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, goToNextSection, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.address) {
      if (resumeData.address.current) setCurrent(resumeData.address.current as any);
      if (resumeData.address.permanent) setPermanent(resumeData.address.permanent as any);
    }
  }, [resumeData]);

  const [current, setCurrent] = useState(draftData.address?.current || emptyAddress());
  const [permanent, setPermanent] = useState(draftData.address?.permanent || emptyAddress());
  const [sameAsCurrent, setSameAsCurrent] = useState(draftData.address?.sameAsCurrent || false);

  useEffect(() => {
    try {
      if (draftData && draftData.address) {
        if (draftData.address.current) setCurrent(draftData.address.current);
        if (draftData.address.permanent) setPermanent(draftData.address.permanent);
        if (draftData.address.sameAsCurrent !== undefined) setSameAsCurrent(draftData.address.sameAsCurrent);
      }
    } catch (e) {
      console.error("Error setting address data:", e);
    }
  }, [draftData?.address]);

  const updateCurrent = (f: string, v: string) => setCurrent(prev => ({ ...prev, [f]: v }));
  const updatePermanent = (f: string, v: string) => setPermanent(prev => ({ ...prev, [f]: v }));

  useEffect(() => {
    if (sameAsCurrent) setPermanent({ ...current });
  }, [sameAsCurrent, current]);

  useEffect(() => {
    const currentFilled = REQUIRED.filter(f => current[f as keyof typeof current]).length;
    const permFilled = REQUIRED.filter(f => permanent[f as keyof typeof permanent]).length;
    const total = REQUIRED.length * 2;
    updateSectionCompletion('address', Math.round(((currentFilled + permFilled) / total) * 100));
  }, [current, permanent, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <Accordion type="multiple" defaultValue={["current"]} className="space-y-3">
        <AccordionItem value="current" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Current Address</AccordionTrigger>
          <AccordionContent>
            <AddressFields data={current} onChange={updateCurrent} type="Current Address" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="permanent" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Permanent Address</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox id="same" checked={sameAsCurrent} onCheckedChange={v => setSameAsCurrent(!!v)} />
              <label htmlFor="same" className="text-sm cursor-pointer">Same as Current Address</label>
            </div>
            <AddressFields data={permanent} onChange={sameAsCurrent ? () => { } : updatePermanent} type="Permanent Address" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Address saved!"); updateDraftAndGoNext('address', { current, permanent, sameAsCurrent }); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default AddressDetails;
