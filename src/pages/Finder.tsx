import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { X, Heart, Star, Flag, BadgeCheck, MessageCircle, Search, Users, User, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Global cache so switching pages makes it instant
let globalPotentialMatches: any[] = [];
let globalInteractions: Record<string, string> = {};

export function Finder() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetFilter = searchParams.get('target') || profile?.lookingFor || 'everyone';
  
  const [potentialMatches, setPotentialMatches] = useState<any[]>(globalPotentialMatches);
  const [interactions, setInteractions] = useState<Record<string, string>>(globalInteractions);
  const [loading, setLoading] = useState(globalPotentialMatches.length === 0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        let targetInteractions: Record<string, string> = {};
        
        let users: any[] = [];
        
        // If user is logged in, fetch interactions too
        if (profile) {
          const interactionsQ = query(collection(db, 'interactions'), where('fromUserId', '==', profile.uid));
          const [querySnapshot, interactionsSnap] = await Promise.all([
            getDocs(q),
            getDocs(interactionsQ)
          ]);
          
          users = querySnapshot.docs.map(doc => doc.data());
          interactionsSnap.docs.forEach(doc => {
            const data = doc.data();
            targetInteractions[data.toUserId] = data.type;
          });
        } else {
          // If not logged in, just fetch the users
          const querySnapshot = await getDocs(q);
          users = querySnapshot.docs.map(doc => doc.data());
        }
        
        const allUsers = users; 
        
        setPotentialMatches(allUsers);
        setInteractions(targetInteractions);
        globalPotentialMatches = allUsers;
        globalInteractions = targetInteractions;
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [profile]);

  const handleInteraction = async (type: 'like' | 'dislike', targetUid: string) => {
    const targetUser = potentialMatches.find(p => p.uid === targetUid);
    if (!targetUser || interactions[targetUid]) return;

    if (!user) {
      if (type === 'like') {
        alert("ম্যাচ করতে হলে আগে লগইন করুন!");
      }
      return;
    }
    
    // Allow users to like/dislike their OWN profile as an easter egg or standard behavior as requested
    // Optimistically update local state so you can't click twice
    setInteractions(prev => {
       const next = { ...prev, [targetUid]: type };
       globalInteractions = next;
       return next;
    });

    try {
      await addDoc(collection(db, 'interactions'), {
        fromUserId: user.uid,
        toUserId: targetUser.uid,
        type,
        createdAt: serverTimestamp()
      });
      
      // Update counts via increment on the user's profile
      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, {
         [type === 'like' ? 'likesCount' : 'dislikesCount']: increment(1)
      });
      
      // Update local profile representation
      setPotentialMatches(prev => prev.map(p => {
         if (p.uid === targetUid) {
             return { ...p, [type === 'like' ? 'likesCount' : 'dislikesCount']: (p[type === 'like' ? 'likesCount' : 'dislikesCount'] || 0) + 1 };
         }
         return p;
      }));

      if (type === 'like' && targetUser.uid !== user.uid) {
        const matchQ = query(collection(db, 'interactions'), 
          where('fromUserId', '==', targetUser.uid),
          where('toUserId', '==', user.uid),
          where('type', '==', 'like')
        );
        const matchSnap = await getDocs(matchQ);
        
        if (!matchSnap.empty) {
          const matchRef = await addDoc(collection(db, 'matches'), {
            users: [user.uid, targetUser.uid],
            matchedAt: serverTimestamp()
          });
          
          if (window.confirm(`ম্যাচ হয়েছে ${targetUser.name} এর সাথে! এখনই মেসেজ দিতে চান?`)) {
            navigate(`/app/chat/${matchRef.id}`);
          }
        }
      }

    } catch (error) {
      console.error("Error recording interaction:", error);
      // Revert optimism if failed
      setInteractions(prev => {
        const next = { ...prev };
        delete next[targetUid];
        globalInteractions = next;
        return next;
      });
    }
  };

  const handleDirectMessage = async (targetUser: any) => {
    if (!user) {
      alert("মেসেজ করতে হলে আগে লগইন করুন!");
      return;
    }
    if (targetUser.uid === user.uid) {
      alert("নিজেকে মেসেজ দেওয়া যায় না!");
      return;
    }
    
    // INSTANT NAVIGATION
    navigate(`/app/chat/new-${targetUser.uid}`, { state: { otherUser: targetUser } });
  };

  if (loading && potentialMatches.length === 0) {
    return <div className="flex items-center justify-center h-full font-medium text-gray-500">সম্ভাব্য বিপদ খোঁজা হচ্ছে...</div>;
  }

  const filteredMatches = potentialMatches.filter(p => {
    // text search
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // direct hunt target filtering
    // targetFilter is 'male' | 'female' | 'everyone'
    if (targetFilter === 'male' && (p.gender !== 'male' && p.gender !== 'other')) return false;
    if (targetFilter === 'female' && (p.gender !== 'female' && p.gender !== 'other')) return false;
    
    return true;
  });

  let pageTitle = "সবাইকে দেখুন";
  if (targetFilter === 'male') pageTitle = "BF Hunt 🎯";
  if (targetFilter === 'female') pageTitle = "GF Hunt 🎯";

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pb-20">
      <div className="flex flex-col mb-6 px-2 gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <h2 className="text-2xl font-bold hidden sm:block">{pageTitle}</h2>
          <div className="relative w-full sm:max-w-xs">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="নাম দিয়ে খুঁজুন..." 
               className="w-full pl-10 pr-4 py-2 border rounded-full bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>
      
      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold">এখানে কেউ নেই!</h2>
          <p className="text-gray-500">আপনার মনমতো কাউকে পাওয়া গেল না।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          {filteredMatches.map((currentProfile) => (
            <Card key={currentProfile.uid} className={`w-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl group flex flex-col h-full relative ${currentProfile.uid === user?.uid ? 'ring-2 ring-pink-500' : ''}`}>
              {currentProfile.uid === user?.uid && (
                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow">
                  আপনার প্রোফাইল
                </div>
              )}
              <div className="flex flex-col h-full">
                {/* Top side / Mobile Left - Image & Name */}
                <div className="w-full p-4 flex flex-col items-center justify-center text-white relative overflow-hidden flex-shrink-0 min-h-[220px]">
                   {currentProfile.gender === 'female' ? (
                     <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-500 -z-10"></div>
                   ) : currentProfile.gender === 'male' ? (
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 -z-10"></div>
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 -z-10"></div>
                   )}
                   
                   {currentProfile.photoURL ? (
                     <img src={currentProfile.photoURL} alt={currentProfile.name} referrerPolicy="no-referrer" className="w-28 h-28 object-cover rounded-full border-4 border-white/30 mb-3 shadow-lg z-10" />
                   ) : (
                     <div className="w-28 h-28 bg-white/20 flex items-center justify-center text-5xl font-bold border-4 border-white/30 mb-3 rounded-full shadow-lg z-10 backdrop-blur-sm">
                       {currentProfile.name.charAt(0)}
                     </div>
                   )}
                   <span className="font-extrabold text-xl text-center z-10 drop-shadow-md">{currentProfile.name}</span>
                   <span className="text-sm text-white/90 font-medium z-10">{currentProfile.age} বছর</span>
                   
                   {/* Interactions stats display */}
                   <div className="mt-2 flex items-center gap-3 z-10 bg-black/20 px-4 py-1.5 rounded-full text-xs font-bold justify-center">
                      <div className="flex items-center gap-1 text-pink-200" title="Likes">
                        <Heart className="w-4 h-4 fill-current" /> {currentProfile.likesCount || 0}
                      </div>
                      <div className="flex items-center gap-1 text-gray-300" title="Dislikes">
                        <X className="w-4 h-4" /> {currentProfile.dislikesCount || 0}
                      </div>
                   </div>

                   {currentProfile.ratingAverage && (
                     <div className="mt-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold z-10 shadow-sm">
                       <Star className="w-3 h-3 fill-current" /> {currentProfile.ratingAverage}
                     </div>
                   )}
                   {/* Decorative background elements */}
                   <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0 pointer-events-none"></div>
                </div>
                
                {/* Bottom side / Mobile Right - Details */}
                <div className="w-full p-4 sm:p-5 flex flex-col justify-between bg-pink-50/10 dark:bg-gray-900 flex-grow border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-4 flex-1">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">"{currentProfile.bio || 'কোনো বায়ো নেই'}"</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-pink-100/50 dark:bg-pink-900/20 py-2 px-1 rounded-xl text-center border border-pink-200 dark:border-pink-800/30">
                        <div className="text-lg sm:text-xl font-black text-pink-600 dark:text-pink-400">{currentProfile.pastRelationships || 0}</div>
                        <div className="text-[10px] sm:text-xs text-pink-800/70 dark:text-pink-300/70 font-bold uppercase tracking-wider">প্রেম করেছে</div>
                      </div>
                      <div className="bg-blue-100/50 dark:bg-blue-900/20 py-2 px-1 rounded-xl text-center border border-blue-200 dark:border-blue-800/30">
                        <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">{currentProfile.heartbreaks || 0}</div>
                        <div className="text-[10px] sm:text-xs text-blue-800/70 dark:text-blue-300/70 font-bold uppercase tracking-wider">ছ্যাঁকা খেয়েছে</div>
                      </div>
                    </div>

                    <div className="text-xs space-y-2.5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Flag className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 dark:text-gray-400 flex-1"><span className="font-bold text-red-500">রেড ফ্ল্যাগ:</span> {currentProfile.redFlags || 'নাই'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <BadgeCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 dark:text-gray-400 flex-1"><span className="font-bold text-green-500">গ্রিন ফ্ল্যাগ:</span> {currentProfile.greenFlags || 'নাই'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Buttons - Fixed Responsiveness */}
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button 
                      size="sm"
                      variant={interactions[currentProfile.uid] === 'dislike' ? 'secondary' : 'outline'}
                      disabled={!!interactions[currentProfile.uid] || currentProfile.uid === user?.uid}
                      className={`w-full rounded-xl text-sm h-10 ${interactions[currentProfile.uid] === 'dislike' ? 'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300' : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400'} transition-all`}
                      onClick={() => handleInteraction('dislike', currentProfile.uid)}
                    >
                      <X className="w-4 h-4 sm:mr-1 shrink-0" /> <span className="hidden sm:inline-block truncate">{interactions[currentProfile.uid] === 'dislike' ? 'বাদ' : 'বাদ'}</span>
                    </Button>
                    <Button 
                      size="sm"
                      disabled={!!interactions[currentProfile.uid] || currentProfile.uid === user?.uid}
                      className={`w-full rounded-xl text-sm h-10 ${interactions[currentProfile.uid] === 'like' ? 'bg-pink-100 text-pink-600 border border-pink-300 dark:bg-pink-900/40 dark:border-pink-800 cursor-default shadow-inner' : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20'} transition-all`}
                      onClick={() => handleInteraction('like', currentProfile.uid)}
                    >
                      <Heart className={`w-4 h-4 sm:mr-1 shrink-0 ${interactions[currentProfile.uid] === 'like' ? 'fill-current' : ''}`} /> <span className="hidden sm:inline-block truncate">{interactions[currentProfile.uid] === 'like' ? 'লাইকড' : 'পছন্দ'}</span>
                    </Button>
                    <Button 
                      size="sm"
                      disabled={currentProfile.uid === user?.uid}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-blue-500/20 text-sm h-10"
                      onClick={() => handleDirectMessage(currentProfile)}
                    >
                      <MessageCircle className="w-4 h-4 sm:mr-1 shrink-0" /> <span className="hidden sm:inline-block truncate">মেসেজ</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
