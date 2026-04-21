import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function Blog() {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // default static posts inline mapping fallback
  const staticPosts = [
    {
      id: 'static-1',
      title: "কীভাবে বুঝবেন সে আপনাকে ঘোরাচ্ছে?",
      excerpt: "৩ ঘণ্টা পর রিপ্লাই, আর 'বিজি ছিলাম' অজুহাত? জেনে নিন বাঁশ খাওয়ার আগে সতর্ক হওয়ার উপায়।",
      content: "রিলেশনশিপে সবচেয়ে বড় রেড ফ্ল্যাগ হলো ইগনোরেন্স। যদি দেখেন আপনার ক্রাশ খুব সুন্দর করে অনলাইনে থেকেও আপনার মেসেজ ডেলিভার হওয়ার পর ৩ ঘণ্টা পর 'ওহ সরি, দেখলাম না' বলে, তাহলে বুঝে নিতে হবে ডাল মে কুছ কালা হ্যায়। ভালোবাসার প্রথম ধাপ হলো প্রায়োরিটি। যদি সে অনলাইনে এসে সবার স্ট্যাটাসে হাহা দেয়, রিল শেয়ার করে, কিন্তু আপনার মেসেজের বেলায় সে 'বিজি', তাহলে ভাই/বোন, সে আসলে আপনাকে অপশনে রেখেছে। এখান থেকে কেটে পড়াই শ্রেয়।"
    },
    {
      id: 'static-2',
      title: "প্রথম ডেটে বিল কে দেবে?",
      excerpt: "বিল দেওয়ার সময় ওয়াশরুমে যাওয়ার ভান করা কি আসলেই কাজ করে? বিস্তারিত পড়ুন।",
      content: "প্রথম ডেটে বিল কে দেবে এটা নিয়ে একটা বিশ্বযুদ্ধ হয়ে যেতে পারে। নিয়ম অনুযায়ী যে ইনভাইট করেছে তার দেওয়া উচিৎ। কিন্তু বর্তমান আধুনিক যুগে ফিফটি-ফিফটি (Dutch) করাটাই সবচেয়ে স্মার্ট উপায়। এতে কারোর ইগোতে লাগে বৈদেশিক না আর পকেটের ওপরও খুব বেশি চাপ পড়ে না। তবে কেউ কেউ মনে করেন ছেলেরা দেবে। আবার কেউ বিল দেওয়ার ঠিক ২ মিনিট আগে 'আমার একটু ওয়াশরুমে যাওয়া লাগবে' বলে কেটে পড়ে। যাই করুন, অন্তত মানিব্যাগটা সাথে নিয়ে যাবেন!"
    },
    {
      id: 'static-3',
      title: "সিঙ্গেল থাকার ১০টি উপকারিতা",
      excerpt: "টাকা বাঁচে, শান্তি থাকে, আর কেউ পাসওয়ার্ড চায় না। সিঙ্গেল লাইফ ইজ দ্য বেস্ট লাইফ!",
      content: "১. আপনার টাকা সব আপনারই। ভ্যালেন্টাইন্স ডে-তে গিফট কিনার প্যারা নেই।\n২. রাতে শান্তিমতো ঘুমাতে পারবেন। রাত ৩টা পর্যন্ত ফোনে 'বাবু খাইছো?' শোনার দরকার নেই।\n৩. আপনার ফোনের পাসওয়ার্ড কেউ চাইবে না। ফিঙ্গারপ্রিন্টও সেফ।\n৪. বন্ধুবান্ধবদের সময় দিতে পারবেন। 'বন্ধুদের সাথে আড্ডা দিচ্ছ, আমাকে সময় দিচ্ছ না'- এই ডায়লগ শুনতে হবে না।\n৫. আপনি যা ইচ্ছা খেতে পারেন, যেখানে ইচ্ছা যেতে পারেন। কোনো জবাবদিহিতা নেই। সিঙ্গেল লাইফ আসলেই প্রো লেভেলের শান্তি!"
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'blogs')));
        if (!snap.empty) {
          setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setPosts(staticPosts);
        }
      } catch (error) {
        console.error("Error fetching blogs", error);
        setPosts(staticPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col">
      <header className="px-6 py-4 flex items-center gap-4 max-w-6xl mx-auto w-full border-b border-gray-100 dark:border-gray-800">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
            SatireDate
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8">ব্লগ</h1>
        
        {loading ? (
          <p className="text-gray-500">লোড হচ্ছে...</p>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} className="block group">
                <article className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 group-hover:shadow-lg group-hover:border-pink-200 dark:group-hover:border-pink-900">
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-pink-600 transition-colors">{post.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 inline-flex font-semibold text-pink-600 items-center">
                    আরও পড়ুন <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
