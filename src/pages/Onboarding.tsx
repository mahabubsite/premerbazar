import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

export function Onboarding() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || user?.displayName || '',
    age: profile?.age || 18,
    gender: profile?.gender || 'other',
    lookingFor: profile?.lookingFor || 'everyone',
    bio: profile?.bio || '',
    redFlags: profile?.redFlags || '',
    greenFlags: profile?.greenFlags || '',
    whyDateMe: profile?.whyDateMe || '',
    pastRelationships: profile?.pastRelationships || 0,
    heartbreaks: profile?.heartbreaks || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'age' || name === 'pastRelationships' || name === 'heartbreaks') ? parseInt(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      navigate('/app/profile');
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 py-12 relative">
      {profile && (
        <Link to="/app/profile" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          ফিরে যান
        </Link>
      )}
      <Card className="w-full max-w-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">আপনার প্রোফাইল বানান</CardTitle>
          <CardDescription>
            সত্যি কথা বলেন। অথবা ফাইজলামি করেন। আমরা ফাইজলামিটাই বেশি পছন্দ করি।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">নাম / ডাকনাম</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">বয়স (মানসিক বা শারীরিক)</Label>
                <Input id="age" name="age" type="number" min="18" max="120" value={formData.age} onChange={handleChange} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">আমি একজন...</Label>
                <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="জেন্ডার সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ছেলে (Guy)</SelectItem>
                    <SelectItem value="female">মেয়ে (Girl)</SelectItem>
                    <SelectItem value="other">অন্য কিছু / রহস্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lookingFor">আমি খুঁজছি...</Label>
                <Select value={formData.lookingFor} onValueChange={(val) => handleSelectChange('lookingFor', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="কাকে খুঁজছেন সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">বয়ফ্রেন্ড</SelectItem>
                    <SelectItem value="female">গার্লফ্রেন্ড</SelectItem>
                    <SelectItem value="everyone">যে রিপ্লাই দেয় তাকেই চলবে</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">বায়ো (বোরিং কিছু লিখবেন না)</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="আমি ফ্রিজের দিকে লম্বা হাঁটা পছন্দ করি..." 
                value={formData.bio} 
                onChange={handleChange}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="redFlags">আমার রেড ফ্ল্যাগ 🚩</Label>
                <Textarea 
                  id="redFlags" 
                  name="redFlags" 
                  placeholder="আমি ৩ কর্মদিবস পর রিপ্লাই দেই" 
                  value={formData.redFlags} 
                  onChange={handleChange}
                  className="resize-none"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="greenFlags">আমার গ্রিন ফ্ল্যাগ ✅</Label>
                <Textarea 
                  id="greenFlags" 
                  name="greenFlags" 
                  placeholder="আমার নেটফ্লিক্স সাবস্ক্রিপশন আছে" 
                  value={formData.greenFlags} 
                  onChange={handleChange}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pastRelationships">কয়টা প্রেম করেছেন?</Label>
                <Input 
                  id="pastRelationships" 
                  name="pastRelationships" 
                  type="number" 
                  min="0" 
                  placeholder="সত্যি কথা বলবেন" 
                  value={formData.pastRelationships || ''} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartbreaks">কয়বার ছ্যাঁকা খেয়েছেন? 💔</Label>
                <Input 
                  id="heartbreaks" 
                  name="heartbreaks" 
                  type="number" 
                  min="0" 
                  placeholder="লুকানোর কিছু নাই" 
                  value={formData.heartbreaks || ''} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyDateMe">কেন আমাকে ডেট করবেন</Label>
              <Input 
                id="whyDateMe" 
                name="whyDateMe" 
                placeholder="আমার আম্মু বলছে আমি অনেক সুন্দর/সুন্দরী" 
                value={formData.whyDateMe} 
                onChange={handleChange} 
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600" disabled={loading}>
              {loading ? 'সেভ হচ্ছে...' : 'সোয়াইপ শুরু করেন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
