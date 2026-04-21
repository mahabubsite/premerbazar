import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Edit, Star, Flag, BadgeCheck, MapPin, Heart, Coffee, Music, Book, Info, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

export function Profile() {
  const { user, profile, logout, linkGoogleAccount, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [linking, setLinking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);

  if (!profile) return null;

  const handleLinkGoogle = async () => {
    try {
      setLinking(true);
      await linkGoogleAccount();
    } catch (error) {
      console.error("Error linking account", error);
      alert("অ্যাকাউন্ট লিংক করতে সমস্যা হয়েছে।");
    } finally {
      setLinking(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      // @ts-ignore - allow import.meta.env fallback
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY/VITE_GEMINI_API_KEY পাওয়া যায়নি। আপনি যদি লোকাল পিসিতে রান করেন, তবে দয়া করে .env ফাইলে API Key সেট করুন।");
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      let response;
      let pollinationsUrl = '';
      
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: {
            parts: [{ text: imagePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          },
        });
      } catch (err: any) {
        // Fallback to gemini-2.5-flash-image if 3.1 fails (e.g. quota limits)
        if (err?.message?.includes('429') || err?.message?.includes('Quota') || err?.status === 429) {
          console.log("3.1 image model quota reached, falling back to 2.5...");
          try {
            response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [{ text: imagePrompt }],
              },
              config: {
                imageConfig: {
                  aspectRatio: "1:1",
                  imageSize: "1K"
                }
              },
            });
          } catch (err2: any) {
             if (err2?.message?.includes('429') || err2?.message?.includes('Quota') || err2?.status === 429) {
                console.log("2.5 image model quota reached, falling back to free Pollinations API...");
                pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=400&height=400&nologo=true`;
             } else {
                throw err2;
             }
          }
        } else {
          throw err;
        }
      }
      
      let imageUrl = '';
      let textResponse = '';
      
      if (pollinationsUrl) {
         // Use the direct URL from the free fallback service
         imageUrl = pollinationsUrl;
      } else if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const originalImageUrl = `data:image/png;base64,${base64EncodeString}`;
            
            // Compress image
            const img = new Image();
            img.src = originalImageUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            imageUrl = canvas.toDataURL('image/jpeg', 0.9); // Compress to JPEG with 90% quality
            break;
          } else if (part.text) {
            textResponse += part.text + ' ';
          }
        }
      }
      
      if (imageUrl) {
        await updateProfile({ photoURL: imageUrl });
        setShowImagePrompt(false);
        setImagePrompt('');
      } else {
        console.error("No image data. Text response was:", textResponse);
        alert("ছবি তৈরি করা সম্ভব হয়নি। AI বলছে: " + (textResponse || "অজানা সমস্যা"));
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("ছবি তৈরি করতে সমস্যা হয়েছে: " + (error as Error).message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">প্রোফাইল</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/onboarding')} className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50">
          <Edit className="w-4 h-4 mr-2" /> এডিট
        </Button>
      </div>

      {user?.isAnonymous && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-800 mb-6 flex items-start gap-3 shadow-sm flex-col">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">আপনি এখন বেনামে (Anonymous) আছেন</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                আপনার প্রোফাইল এবং ম্যাচগুলো সেভ রাখতে অ্যাকাউন্ট তৈরি করুন বা লিংক করুন।
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleLinkGoogle} disabled={linking} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full">
                  গুগল দিয়ে লিংক করুন
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/login')} className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full">
                  লগইন/সাইনআপ পেজে যান
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden border border-pink-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 bg-white dark:bg-gray-900 rounded-[2rem]">
        <div className="relative mb-16">
          <div className="h-48 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
              <div className="absolute top-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl"></div>
            </div>
          </div>
          
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-2xl relative group z-10">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-5xl font-bold text-gray-400 border-4 border-white dark:border-gray-900">
                  {profile.name.charAt(0)}
                </div>
              )}
              <button 
                onClick={() => setShowImagePrompt(!showImagePrompt)}
                className="absolute bottom-0 right-0 bg-pink-500 text-white p-2.5 rounded-full shadow-lg hover:bg-pink-600 transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-gray-900 z-20"
                title="AI দিয়ে ছবি তৈরি করুন"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-4 pb-8 px-8">
          {showImagePrompt && (
            <div className="mb-8 bg-pink-50/50 dark:bg-pink-900/10 p-5 rounded-2xl border border-pink-100 dark:border-pink-900/30 shadow-inner">
              <h3 className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> AI দিয়ে প্রোফাইল পিকচার তৈরি করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">যেমন: "Create a romantic image for a profile picture" বা "Generate a funny dating app profile picture"</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="আপনার প্রম্পট লিখুন..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm min-w-0"
                />
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={isGeneratingImage || !imagePrompt}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-6 shadow-md shadow-pink-500/20 w-full sm:w-auto"
                >
                  {isGeneratingImage ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                {profile.name}, {profile.age}
                <BadgeCheck className="w-6 h-6 text-pink-500" />
              </h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                <Heart className="w-4 h-4 text-pink-500 fill-current" /> 
                খুঁজছেন: <span className="capitalize">{profile.lookingFor === 'everyone' ? 'যে কাউকে' : profile.lookingFor === 'male' ? 'ছেলে' : 'মেয়ে'}</span>
              </p>
            </div>
            <div className="flex flex-col items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 text-yellow-500 text-lg font-black">
                <Star className="w-5 h-5 fill-current" />
                {profile.ratingAverage || '0.0'}
              </div>
              <span className="text-xs text-gray-500 font-medium">({profile.ratingCount || 0} রিভিউ)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-5 rounded-2xl text-center border border-pink-100 dark:border-pink-800/30 shadow-sm">
              <div className="text-3xl font-black text-pink-600 dark:text-pink-400 mb-1">{profile.pastRelationships || 0}</div>
              <div className="text-[10px] text-pink-800/70 dark:text-pink-300/70 font-bold uppercase tracking-widest">প্রেম করেছে</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl text-center border border-blue-100 dark:border-blue-800/30 shadow-sm">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{profile.heartbreaks || 0}</div>
              <div className="text-[10px] text-blue-800/70 dark:text-blue-300/70 font-bold uppercase tracking-widest">ছ্যাঁকা খেয়েছে</div>
            </div>
          </div>

          <div className="space-y-6">
            {profile.bio && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 relative">
                <div className="absolute -top-3 left-6 bg-white dark:bg-gray-900 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Book className="w-3 h-3" /> বায়ো
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">"{profile.bio}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.redFlags && (
                <div className="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Flag className="w-3.5 h-3.5" /> রেড ফ্ল্যাগ
                  </h3>
                  <p className="text-red-900 dark:text-red-200 text-sm font-medium">{profile.redFlags}</p>
                </div>
              )}
              {profile.greenFlags && (
                <div className="bg-green-50/50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/20">
                  <h3 className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <BadgeCheck className="w-3.5 h-3.5" /> গ্রিন ফ্ল্যাগ
                  </h3>
                  <p className="text-green-900 dark:text-green-200 text-sm font-medium">{profile.greenFlags}</p>
                </div>
              )}
            </div>

            {profile.whyDateMe && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> কেন আমাকে ডেট করবেন
                </h3>
                <p className="text-purple-900 dark:text-purple-200 font-medium">"{profile.whyDateMe}"</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> অর্জিত ব্যাজ
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 px-3 py-1 text-xs rounded-full font-bold">
                  নতুন 🐣
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 text-xs rounded-full font-bold">
                  সিঙ্গেল লেজেন্ড 👑
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-8 font-bold" onClick={logout}>
          লগআউট করুন
        </Button>
      </div>
    </div>
  );
}
