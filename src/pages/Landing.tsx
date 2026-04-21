import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Heart, Sparkles, ShieldAlert, Laugh, Frown, Map, HelpCircle, BookOpen, Menu, Info, Shield, FileText, AlertTriangle, MessageCircle, User, Download, Share2, Play, Pause, SkipForward, SkipBack, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toJpeg } from 'html-to-image';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function Landing() {
  const { user, loading, loginAnonymously, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHunting, setIsHunting] = useState(false);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const roadmapScrollRef = useRef<HTMLDivElement>(null);
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [newPostText, setNewPostText] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sadPosts, setSadPosts] = useState([
    { text: "তুমি বলেছিলে তুমি চাঁদ ভালোবাসো, তাই আমি জোৎস্না হয়েছিলাম। কিন্তু তুমি তো আসলে আইফোন ভালোবাসতে...", author: "ছ্যাঁকা খাওয়া মজনু", theme: "sad" },
    { text: "রিপ্লাই দিতে ৩ ঘণ্টা লাগতো তোমার। আমি ভাবতাম তুমি বিজি, পরে দেখি তুমি পাবজি খেলছো অন্য কারো সাথে।", author: "অবহেলিত আত্মা", theme: "broken" },
    { text: "প্রথম ডেটে বিল দেওয়ার সময় ওয়াশরুমে যাওয়ার ভান করেছিলাম। এসে দেখি সেও পালিয়েছে। সমানে সমানে টক্কর!", author: "কিপ্টা প্রেমিক", theme: "funny" }
  ]);
  const [roadmapSteps, setRoadmapSteps] = useState([
    { icon: "👀", title: "ক্রাশ খাওয়া", desc: "দূর থেকে দেখা আর মনে মনে বিয়ে করে ফেলা।" },
    { icon: "💬", title: "টেক্সট করা", desc: "৩ ঘণ্টা পর রিপ্লাই পাওয়া আর সেটাকেই ভালোবাসা ভাবা।" },
    { icon: "☕", title: "প্রথম ডেট", desc: "বিল কে দেবে এই নিয়ে মনে মনে যুদ্ধ করা।" },
    { icon: "💔", title: "ব্রেকআপ", desc: "সব শেষে ব্লক খাওয়া আর স্যাড সং শোনা।" }
  ]);
  const [survivalGuides, setSurvivalGuides] = useState<any[]>([
    { icon: "🚫", title: "Ex-কে Follow করবেন না", desc: "ফেসবুক, ইন্সটা, টিকটক—কোথাও না। দেখলে শুধু কষ্টই বাড়বে।", color: "red" },
    { icon: "📱", title: "৩ ঘণ্টা পর রিপ্লাই", desc: "সেম এনার্জি দিন। সে ৩ ঘণ্টা পর রিপ্লাই দিলে আপনি ৬ ঘণ্টা পর দিন।", color: "purple" },
    { icon: "💸", title: "বিলের টাকা", desc: "সবসময় নিজে বিল দেওয়ার হিরোগিরি দেখানোর দরকার নেই।", color: "green" },
    { icon: "🎭", title: "বেশি কেয়ারিং সাজার ভান", desc: "প্রথম দিনেই তাকে দুনিয়ার সব সুখ এনে দেওয়ার মিথ্যা প্রমিস করবেন না।", color: "yellow" }
  ]);

  const [currentRoadmapIndex, setCurrentRoadmapIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsSnap, roaddmapSnap, quizSnap, guideSnap] = await Promise.all([
          getDocs(collection(db, 'sad_posts')),
          getDocs(collection(db, 'roadmaps')),
          getDocs(collection(db, 'quizzes')),
          getDocs(collection(db, 'guides')),
        ]);
        if (!postsSnap.empty) {
          const posts = postsSnap.docs.map(d => d.data() as any);
          posts.sort((a,b) => (a.order || 0) - (b.order || 0));
          setSadPosts(posts);
        }
        if (!roaddmapSnap.empty) setRoadmapSteps(roaddmapSnap.docs.map(d => d.data() as any));
        if (!quizSnap.empty) setQuizzes(quizSnap.docs.map(d => d.data() as any));
        if (!guideSnap.empty) setSurvivalGuides(guideSnap.docs.map(d => d.data() as any));
      } catch (err) {
        console.error("Error fetching admin modules", err);
      }
    };
    fetchData();
  }, []);

  const handleAddPost = () => {
    if (newPostText.trim()) {
      const themes = ["sad", "broken", "funny", "lovely"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      setSadPosts([{ 
        text: newPostText, 
        author: newPostAuthor.trim() || user?.displayName || "অজ্ঞাতনামা দুঃখী", 
        theme: randomTheme 
      }, ...sadPosts]);
      setNewPostText('');
      setNewPostAuthor('');
      setCurrentPostIndex(0);
    }
  };

  const getThemeClasses = (theme: string | undefined) => {
    switch(theme) {
      case 'broken': return "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900";
      case 'lovely': return "bg-gradient-to-br from-pink-600 via-rose-500 to-red-500";
      case 'funny': return "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500";
      case 'sad': 
      default: return "bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900";
    }
  };

  const getBlurClasses1 = (theme: string | undefined) => {
    switch(theme) {
      case 'broken': return "bg-gray-500/20";
      case 'lovely': return "bg-white/20";
      case 'funny': return "bg-yellow-200/20";
      case 'sad': 
      default: return "bg-blue-500/20";
    }
  };

  const getBlurClasses2 = (theme: string | undefined) => {
    switch(theme) {
      case 'broken': return "bg-zinc-500/20";
      case 'lovely': return "bg-rose-300/20";
      case 'funny': return "bg-orange-200/20";
      case 'sad': 
      default: return "bg-pink-500/20";
    }
  };

  const downloadPost = async (index: number) => {
    const element = postRefs.current[index];
    if (element) {
      try {
        const dataUrl = await toJpeg(element, { 
          quality: 0.9,
          pixelRatio: 2
        });
        const link = document.createElement('a');
        link.download = `premerbazar-quote-${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to download image", err);
      }
    }
  };

  const sharePost = (post: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'PremerBazar Quote',
        text: `"${post.text}" - ${post.author}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("আপনার ব্রাউজার শেয়ার সাপোর্ট করে না।");
    }
  };
  if (loading) return null;

  const handleHunt = async (lookingFor: 'male' | 'female') => {
    setIsHunting(true);
    try {
      if (user) {
        await updateProfile({ lookingFor });
      }
      navigate(`/find?target=${lookingFor}`);
    } catch (error) {
      console.error("Error starting hunt:", error);
      setIsHunting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
            PremerBazar
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">আমাদের সম্পর্কে</Link>
            <Link to="/privacy" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">প্রাইভেসি পলিসি</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">ব্লগ</Link>
            <Link to="/report" className="text-sm font-medium text-red-500 hover:text-red-700">রিপোর্ট করুন</Link>
          </div>
          {!user ? (
            <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/login')}>
              লগইন / সাইনআপ
            </Button>
          ) : user.email === 'mdmahbubsite@gmail.com' ? (
            <Link to="/admin" className="hidden sm:flex text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full items-center gap-1 shadow-sm">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          ) : null}
          
          <div className="relative md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} title="মেনু">
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Button>
            
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1">
                  <Link to="/about" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Info className="w-4 h-4 text-blue-500" /> আমাদের সম্পর্কে
                  </Link>
                  <Link to="/privacy" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Shield className="w-4 h-4 text-green-500" /> প্রাইভেসি পলিসি
                  </Link>
                  <Link to="/blog" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <FileText className="w-4 h-4 text-purple-500" /> ব্লগ
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <Link to="/report" className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <AlertTriangle className="w-4 h-4" /> রিপোর্ট করুন
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1 sm:hidden"></div>
                  {!user ? (
                    <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 sm:hidden" onClick={() => { setMenuOpen(false); navigate('/login'); }}>
                      লগইন / সাইনআপ
                    </button>
                  ) : (
                    <>
                      {user.email === 'mdmahbubsite@gmail.com' && (
                        <Link to="/admin" className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-medium sm:hidden flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                          <Shield className="w-4 h-4" /> Admin
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center text-center w-full">
        {/* Hero Section */}
        <div className="relative w-full py-20 sm:py-32 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop" 
              alt="Love Background" 
              className="w-full h-full object-cover opacity-20 dark:opacity-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white dark:from-gray-950/50 dark:to-gray-950"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              বাঁশ খেতে চাইলে <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">একটি প্রেম করুন</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto px-4 font-medium">
              রেড ফ্ল্যাগ দেখে সোয়াইপ করুন, ডেট রেট করুন, আর "প্রফেশনাল হার্টব্রেকার" ব্যাজ জিতুন। 
              কারণ আধুনিক প্রেম একটা জোকস, তাই আমরা এটাকে ফিচার বানিয়েছি।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
              <Button 
                size="lg" 
                onClick={() => handleHunt('female')}
                disabled={isHunting}
                className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 text-lg h-14 w-full sm:w-auto shadow-lg shadow-pink-500/25"
              >
                {isHunting ? 'লোড হচ্ছে...' : 'GF Hunt 🎯'}
              </Button>
              <Button 
                size="lg" 
                onClick={() => handleHunt('male')}
                disabled={isHunting}
                className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 text-lg h-14 w-full sm:w-auto shadow-lg shadow-blue-500/25"
              >
                {isHunting ? 'লোড হচ্ছে...' : 'BF Hunt 🎯'}
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
              <StatCard icon="😢" count="১২,৪৫৬" label="সিঙ্গেল মানুষ" />
              <StatCard icon="💖" count="৩,২18" label="ম্যাচ হয়েছে" />
              <StatCard icon="🍕" count="৮৯২" label="ডেটে গেছে" />
              <StatCard icon="🚫" count="৪৫৬" label="ব্লক হয়েছে" />
            </div>
          </motion.div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full text-left mb-24 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
          
          {/* Love Quiz */}
          <div className="bg-pink-50 dark:bg-pink-950/30 p-6 sm:p-8 rounded-3xl border border-pink-100 dark:border-pink-900/50 flex flex-col w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-xl">
                <HelpCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-pink-900 dark:text-pink-100">প্রেম কুইজ — আপনি কতটা রেডি?</h2>
            </div>
            <p className="text-pink-800 dark:text-pink-200 mb-6">
              প্রেম করার যোগ্য কি না, সেটা আগে টেস্ট করে নিন।
            </p>
            <LoveQuiz customQuestions={quizzes} />
          </div>

          {/* Sad Posts / Testimonials */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/50 flex flex-col w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <Frown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">প্রেম নিয়ে দুঃখের পোস্ট</h2>
              </div>
            </div>
            <p className="text-blue-800 dark:text-blue-200 mb-6">
              ছ্যাঁকা খেয়েছেন? এখানে এসে শায়রি, কবিতা আর দুঃখের লেখা পোস্ট করুন। আমরা সবাই মিলে কাঁদবো।
            </p>
            
            <div className="flex-1 w-full relative py-6 flex items-center justify-center min-h-[400px] sm:min-h-[450px] overflow-hidden">
              <div className="relative w-full max-w-[450px] h-full flex items-center justify-center">
                <AnimatePresence initial={false} mode="popLayout">
                  {sadPosts.map((post, index) => {
                    const diff = index - currentPostIndex;
                    // Render 1 before and 1 after for the coverflow effect
                    if (Math.abs(diff) > 1) return null;

                    const isCenter = diff === 0;
                    const zIndex = isCenter ? 20 : 10;
                    const scale = isCenter ? 1 : 0.85;
                    const xOffset = isCenter ? 0 : diff > 0 ? "18%" : "-18%";
                    const opacity = isCenter ? 1 : 0.5;

                    const textLen = post.text.length;
                    const textSizeClass = textLen < 50 ? "text-2xl sm:text-3xl font-bold" 
                                        : textLen < 100 ? "text-lg sm:text-2xl font-semibold leading-relaxed"
                                        : textLen < 150 ? "text-base sm:text-lg font-medium leading-relaxed"
                                        : "text-sm sm:text-base font-medium leading-snug";

                    return (
                      <motion.div
                        key={`${index}-${post.text.slice(0, 10)}`}
                        className="absolute w-[75vw] sm:w-[350px] max-w-[350px]"
                        initial={{ opacity: 0, scale: 0.8, x: diff > 0 ? "40%" : "-40%", zIndex: 0 }}
                        animate={{ opacity, scale, x: xOffset, zIndex }}
                        exit={{ opacity: 0, scale: 0.8, x: diff > 0 ? "-40%" : "40%", zIndex: 0 }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                        drag={isCenter ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipeThreshold = 40;
                          if (offset.x < -swipeThreshold && currentPostIndex < sadPosts.length - 1) {
                            setCurrentPostIndex(prev => prev + 1);
                          } else if (offset.x > swipeThreshold && currentPostIndex > 0) {
                            setCurrentPostIndex(prev => prev - 1);
                          }
                        }}
                        onClick={() => {
                          if (diff === -1 && currentPostIndex > 0) setCurrentPostIndex(prev => prev - 1);
                          if (diff === 1 && currentPostIndex < sadPosts.length - 1) setCurrentPostIndex(prev => prev + 1);
                        }}
                      >
                        <div className={`relative w-full ${isCenter ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}>
                          
                          {/* The part that gets captured via html-to-image (1:1 aspect ratio) */}
                          <div 
                            ref={el => {
                              if (isCenter && postRefs.current) {
                                postRefs.current[index] = el;
                              }
                            }}
                            className={`aspect-square ${getThemeClasses(post.theme)} rounded-3xl sm:rounded-[2rem] shadow-2xl flex flex-col justify-center relative overflow-hidden text-white`}
                          >
                            {post.imageUrl ? (
                                <img src={post.imageUrl} alt="Sad Post Image" className="absolute inset-0 w-full h-full object-cover opacity-90 z-0" crossOrigin="anonymous" />
                            ) : (
                              <>
                                {/* Decorative blur elements for smarter look */}
                                <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 blur-3xl rounded-full ${getBlurClasses1(post.theme)}`}></div>
                                <div className={`absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 blur-3xl rounded-full ${getBlurClasses2(post.theme)}`}></div>
                              </>
                            )}

                            {/* Dark Overlay if image exists */}
                            {post.imageUrl && <div className="absolute inset-0 bg-black/40 z-0" />}
                            
                            {/* Watermark Logo */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-60 z-10">
                              <Heart className="w-4 h-4 fill-current text-white" />
                              <span className="font-bold text-[10px] sm:text-xs tracking-widest uppercase text-white shadow-sm">PremerBazar</span>
                            </div>
                            
                            <div className="z-10 flex flex-col items-center justify-center px-4 sm:px-8 h-full w-full py-8 max-h-full">
                              <div className="w-full text-left">
                                <div className="text-3xl sm:text-5xl text-white/40 font-serif leading-none h-4 sm:h-6 drop-shadow-sm">"</div>
                              </div>
                              
                              <div className="flex-1 flex items-center justify-center w-full overflow-hidden my-1">
                                <p className={`text-center text-white px-1 drop-shadow-md ${textSizeClass}`}>
                                  {post.text}
                                </p>
                              </div>
                              
                              <div className="w-full text-right">
                                <div className="text-3xl sm:text-5xl text-white/40 font-serif leading-none h-4 sm:h-6 drop-shadow-sm">"</div>
                              </div>
                            </div>

                            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 border-r-2 border-white/60 pr-3 bg-black/30 backdrop-blur-sm rounded-l-full py-1 pl-4">
                              <div className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-widest">{post.author}</div>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Placed below the capture area */}
                          <div className={`flex justify-center gap-3 sm:gap-4 mt-5 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-blue-600 border-blue-200 bg-white/80 hover:bg-white shadow-sm text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); downloadPost(index); }}>
                              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ডাউনলোড
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-pink-600 border-pink-200 bg-white/80 hover:bg-white shadow-sm text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); sharePost(post); }}>
                              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> শেয়ার
                            </Button>
                          </div>
                          
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
                <input 
                  type="text" 
                  placeholder="আপনার দুঃখের কথা লিখুন..." 
                  className="flex-[2] w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPost()}
                />
                <input 
                  type="text" 
                  placeholder="কবির নাম (ঐচ্ছিক)" 
                  className="flex-1 w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPost()}
                />
              </div>
              <Button 
                onClick={handleAddPost}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-[50px] w-full flex-shrink-0 sm:w-auto"
              >
                পোস্ট
              </Button>
            </div>
          </div>

          {/* Relationship Roadmap */}
          <div className="bg-purple-50 dark:bg-purple-950/30 p-6 sm:p-8 rounded-3xl border border-purple-100 dark:border-purple-900/50 w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Map className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">সম্পর্কের রোডম্যাপ</h2>
            </div>
            <p className="text-purple-800 dark:text-purple-200 mb-6">
              কোথায় শুরু, কোথায় শেষ? জেনে নিন প্রেমের আঁকাবাঁকা রাস্তার ম্যাপ।
            </p>
            
            <div className="relative w-full group">
              {/* Desktop Navigation Arrows */}
              <button 
                onClick={() => {
                  if (roadmapScrollRef.current) {
                    roadmapScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg items-center justify-center z-10 text-purple-600 hover:bg-purple-50 transition-colors border border-purple-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div 
                ref={roadmapScrollRef}
                className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 pt-2 px-4"
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const itemWidth = e.currentTarget.children[0].clientWidth;
                  const newIndex = Math.round(scrollLeft / (itemWidth + 16)); // 16 is gap-4
                  if (newIndex >= 0 && newIndex < roadmapSteps.length) {
                    setCurrentRoadmapIndex(newIndex);
                  }
                }}
              >
                {roadmapSteps.map((step, index) => (
                  <div key={index} className="w-[85%] sm:w-[350px] flex-shrink-0 snap-center mx-auto">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-800 text-center flex flex-col items-center h-full">
                      <div className="text-5xl mb-4">{step.icon}</div>
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">ধাপ {index + 1}: {step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (roadmapScrollRef.current) {
                    roadmapScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg items-center justify-center z-10 text-purple-600 hover:bg-purple-50 transition-colors border border-purple-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {roadmapSteps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === currentRoadmapIndex ? 'bg-purple-600' : 'bg-purple-200 dark:bg-purple-800'}`} />
              ))}
            </div>
          </div>

          {/* Survival Guide */}
          <div className="bg-green-50 dark:bg-green-950/30 p-6 sm:p-8 rounded-3xl border border-green-100 dark:border-green-900/50 w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">প্রেমের সারভাইভাল গাইড</h2>
            </div>
            <p className="text-green-800 dark:text-green-200 mb-6">
              সম্পর্ক টিকিয়ে রাখার কিছু অব্যর্থ (বা ব্যর্থ) টিপস। এগুলো মানলে প্রেম টিকতেও পারে, আবার ভাঙতেও পারে।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-red-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">🚫</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Ex-কে Follow করবেন না</h4>
                  <p className="text-xs text-gray-500">ফেসবুক, ইন্সটা, টিকটক—কোথাও না। দেখলে শুধু কষ্টই বাড়বে।</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">📱</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">রিপ্লাই দিন তাড়াতাড়ি</h4>
                  <p className="text-xs text-gray-500">৩ ঘণ্টা পর রিপ্লাই দিলে অপর পাশ থেকে ব্লক খাওয়ার সম্ভাবনা ৯৯%।</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-pink-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">🎂</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">জন্মদিন মনে রাখুন</h4>
                  <p className="text-xs text-gray-500">ভুলে গেলে আপনার নিজের জন্মদিনটাই শেষ জন্মদিন হতে পারে।</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-orange-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">🍔</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">খাবার অর্ডার করুন</h4>
                  <p className="text-xs text-gray-500">রাগ ভাঙানোর সবচেয়ে সহজ উপায় হলো পিৎজা বা বিরিয়ানি।</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-purple-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">🤐</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">তর্ক করবেন না</h4>
                  <p className="text-xs text-gray-500">সবসময় বলবেন "তুমিই ঠিক"। এতে আপনার আয়ু বাড়বে।</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border-l-4 border-green-500 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="text-2xl mt-1">🕵️</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">ফোন চেক করবেন না</h4>
                  <p className="text-xs text-gray-500">যা জানবেন না, তা নিয়ে কষ্টও পাবেন না। ইগনোরেন্স ইজ ব্লিস।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premer Picture Gallery Demo */}
          <div className="bg-pink-50 dark:bg-pink-950/30 p-6 sm:p-8 rounded-3xl border border-pink-100 dark:border-pink-900/50 w-full overflow-hidden mt-8 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-xl">
                    <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-pink-900 dark:text-pink-100 text-left">Premer Picture</h2>
                   <p className="text-sm text-pink-700 dark:text-pink-300 text-left">রোমান্টিক কিছু মুহূর্তের ঝলক</p>
                 </div>
               </div>
               
               <Button onClick={() => navigate('/gallery')} variant="outline" className="rounded-full bg-white dark:bg-gray-900 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 text-sm">
                 সবগুলো দেখুন
               </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
               {/* Demo Pictures */}
               <div className="aspect-square rounded-2xl overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Memory 1" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">প্রেমের শুরু</p>
                 </div>
               </div>
               <div className="aspect-square rounded-2xl overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Memory 2" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">প্রথম ডেট</p>
                 </div>
               </div>
               <div className="aspect-square rounded-2xl overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Memory 3" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">ঝগড়ার পর</p>
                 </div>
               </div>
               <div className="aspect-square rounded-2xl overflow-hidden relative group">
                 <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Memory 4" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">যুগলবন্দী</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>

      <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe sticky bottom-0 z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavItem to="/" icon={<Heart />} label="হোম" active={location.pathname === '/'} />
          <NavItem to="/app/matches" icon={<MessageCircle />} label="কথা" active={location.pathname.startsWith('/app/matches')} />
          <NavItem to="/app/profile" icon={<User />} label="প্রোফাইল" active={location.pathname === '/app/profile'} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
        active ? 'text-pink-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      <div className={`[&>svg]:w-6 [&>svg]:h-6 ${active ? '[&>svg]:fill-pink-100 dark:[&>svg]:fill-pink-900/30' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function StatCard({ icon, count, label }: { icon: string, count: string, label: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{count}</h3>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const quizQuestions = [
  {
    q: "আপনার ক্রাশ যদি ৩ ঘণ্টা পর রিপ্লাই দেয়, আপনি কী করবেন?",
    options: ["আমিও ৩ ঘণ্টা পর রিপ্লাই দেব", "সাথে সাথে রিপ্লাই দেব", "ব্লক করে দেব", "স্ট্যাটাস দিয়ে বোঝাবো আমি কষ্ট পেয়েছি"]
  },
  {
    q: "প্রথম ডেটে বিল কে দেবে?",
    options: ["যে ইনভাইট করেছে", "ফিফটি-ফিফটি (Dutch)", "অবশ্যই ছেলেটা", "আমি ওয়াশরুমে যাওয়ার ভান করে পালাবো"]
  },
  {
    q: "পার্টনারের ফোনে পাসওয়ার্ড থাকা কি জরুরি?",
    options: ["হ্যাঁ, প্রাইভেসি বলে কথা", "না, প্রেমে কোনো লুকোচুরি নেই", "পাসওয়ার্ড থাকলেও আমার ফিঙ্গারপ্রিন্ট থাকতে হবে", "আমি নিজেই ওর ফোন হ্যাক করে নেবো"]
  },
  {
    q: "আপনার পার্টনার যদি আপনার বেস্ট ফ্রেন্ডের সাথে বেশি কথা বলে?",
    options: ["খুব ভালো, তারা বন্ধু হয়ে গেছে", "একটু জেলাস হবো", "বেস্ট ফ্রেন্ডকে ব্লক মারবো", "দুজনকেই একসাথে বাঁশ দেবো"]
  },
  {
    q: "রাতের বেলা ঝগড়া হলে কী করবেন?",
    options: ["মিটমাট না করে ঘুমাবো না", "ফোন সাইলেন্ট করে ঘুমিয়ে পড়বো", "সকাল বেলা উঠে আবার ঝগড়া শুরু করবো", "ফেসবুকে স্যাড সং শেয়ার করবো"]
  },
  {
    q: "আপনার পার্টনারের প্রাক্তন (Ex) যদি হঠাৎ মেসেজ দেয়?",
    options: ["পার্টনারকে বলবো ইগনোর করতে", "আমি নিজে রিপ্লাই দিয়ে গালি দেবো", "স্ক্রিনশট নিয়ে রেখে দেবো প্রমাণের জন্য", "Ex-এর বর্তমান পার্টনারকে জানিয়ে দেবো"]
  },
  {
    q: "ভ্যালেন্টাইন্স ডে-তে কী উপহার আশা করেন?",
    options: ["দামি গিফট (আইফোন/ঘড়ি)", "ফুল আর চকলেট", "একসাথে সময় কাটানোই যথেষ্ট", "কিছু না, ওসব কর্পোরেট ধান্দা"]
  },
  {
    q: "আপনার পার্টনার যদি আপনার চেয়ে বেশি ইনকাম করে?",
    options: ["খুব ভালো, আমার খরচ বেঁচে যাবে", "একটু ইগোতে লাগবে", "আমিও বেশি ইনকাম করার চেষ্টা করবো", "ওর টাকায় আমি শপিং করবো"]
  },
  {
    q: "সোশ্যাল মিডিয়ায় রিলেশনশিপ স্ট্যাটাস দেওয়া কি জরুরি?",
    options: ["হ্যাঁ, সবাইকে জানাতে হবে", "না, নজর লেগে যাবে", "শুধু ক্লোজ ফ্রেন্ডস জানলেই হবে", "আগে বিয়ে হোক, তারপর দেখা যাবে"]
  },
  {
    q: "আপনার পার্টনার যদি আপনার রান্না খেয়ে বলে 'লবণ বেশি হয়েছে'?",
    options: ["পরের বার কম দেবো", "রাগ করে আর রান্নাই করবো না", "ওর প্লেটে আরও লবণ ঢেলে দেবো", "বলবো 'বেশি করে পানি খেয়ে নাও'"]
  }
];

function LoveQuiz({ customQuestions }: { customQuestions?: any[] }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : quizQuestions;

  const handleAnswer = (index: number) => {
    // Just a random scoring logic for fun
    setScore(score + (index === 3 ? -5 : index * 10));
    
    if (currentQ < activeQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    let resultText = "";
    if (score > 60) resultText = "আপনি প্রেম করার জন্য পুরোপুরি প্রস্তুত! (অথবা বাঁশ খাওয়ার জন্য)";
    else if (score > 30) resultText = "আপনার আরও ট্রেনিং দরকার। আপাতত সিঙ্গেল থাকাই ভালো।";
    else resultText = "ভাই/বোন, আপনি সন্ন্যাস নিয়ে নিন। প্রেম আপনার জন্য না।";

    return (
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm text-center">
        <h3 className="text-xl font-bold mb-3">ফলাফল</h3>
        <p className="mb-6">{resultText}</p>
        <Button onClick={resetQuiz} variant="outline" className="rounded-full">আবার ট্রাই করুন</Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-sm text-gray-500">প্রশ্ন {currentQ + 1}/{activeQuestions.length}</p>
        <div className="flex gap-1">
          {activeQuestions.map((_, i) => (
            <div key={i} className={`h-1.5 w-3 rounded-full ${i === currentQ ? 'bg-pink-500' : i < currentQ ? 'bg-pink-200' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>
      <p className="font-semibold mb-4 text-lg">{activeQuestions[currentQ].q || activeQuestions[currentQ].question}</p>
      <div className="space-y-2">
        {(activeQuestions[currentQ].options && Array.isArray(activeQuestions[currentQ].options) 
          ? activeQuestions[currentQ].options 
          : typeof activeQuestions[currentQ].options === 'string' 
            ? activeQuestions[currentQ].options.split(',') 
            : []).map((opt: string, i: number) => (
          <div 
            key={i} 
            onClick={() => handleAnswer(i)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-200 cursor-pointer transition-colors"
          >
            {opt.trim()}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline Badge component to avoid import issues if not created
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;
}
