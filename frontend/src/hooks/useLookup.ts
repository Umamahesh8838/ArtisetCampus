import { useState, useEffect } from 'react';
import client from '@/api/client';

export function useCountries() {
    const [countries, setCountries] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/countries').then(res => setCountries(res.data?.data || [])).catch(console.error);
    }, []);
    return countries;
}

export function useStates(countryId: string | number) {
    const [states, setStates] = useState([]);
    useEffect(() => {
        if (countryId) client.get('/api/lookup/states/' + countryId).then(res => setStates(res.data?.data || [])).catch(console.error);
        else setStates([]);
    }, [countryId]);
    return states;
}

export function useCities(stateId: string | number) {
    const [cities, setCities] = useState([]);
    useEffect(() => {
        if (stateId) client.get('/api/lookup/cities/' + stateId).then(res => setCities(res.data?.data || [])).catch(console.error);
        else setCities([]);
    }, [stateId]);
    return cities;
}

export function usePincodes(cityId: string | number) {
    const [pincodes, setPincodes] = useState([]);
    useEffect(() => {
        if (cityId) client.get('/api/lookup/pincodes/' + cityId).then(res => setPincodes(res.data?.data || [])).catch(console.error);
        else setPincodes([]);
    }, [cityId]);
    return pincodes;
}

export function useLanguages() {
    const [languages, setLanguages] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/languages').then(res => setLanguages(res.data?.data || [])).catch(console.error);
    }, []);
    return languages;
}

export function useSalutations() {
    const [salutations, setSalutations] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/salutations').then(res => setSalutations(res.data?.data || [])).catch(console.error);
    }, []);
    return salutations;
}

export function useCourses() {
    const [courses, setCourses] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/courses').then(res => setCourses(res.data?.data || [])).catch(console.error);
    }, []);
    return courses;
}

export function useSkills() {
    const [skills, setSkills] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/skills').then(res => setSkills(res.data?.data || [])).catch(console.error);
    }, []);
    return skills;
}

export function useInterests() {
    const [interests, setInterests] = useState([]);
    useEffect(() => {
        client.get('/api/lookup/interests').then(res => setInterests(res.data?.data || [])).catch(console.error);
    }, []);
    return interests;
}
