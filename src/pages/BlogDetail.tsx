import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';

export function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        if (id.startsWith('static-')) {
          const staticPosts = [
            {
              id: 'static-1',
              title: "কীভাবে বুঝবেন সে আপনাকে ঘোরাচ্ছে?",
              imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=2070",
              content: "রিলেশনশিপে সবচেয়ে বড় রেড ফ্ল্যাগ হলো ইগনোরেন্স। যদি দেখেন আপনার ক্রাশ খুব সুন্দর করে অনলাইনে থেকেও আপনার মেসেজ ডেলিভার হওয়ার পর ৩ ঘণ্টা পর 'ওহ সরি, দেখলাম না' বলে, তাহলে বুঝে নিতে হবে ডাল মে কুছ কালা হ্যায়। ভালোবাসার প্রথম ধাপ হলো প্রায়োরিটি। যদি সে অনলাইনে এসে সবার স্ট্যাটাসে হাহা দেয়, রিল শেয়ার করে, কিন্তু আপনার মেসেজের বেলায় সে 'বিজি', তাহলে ভাই/বোন, সে আসলে আপনাকে অপশনে রেখেছে। এখান থেকে কেটে পড়াই শ্রেয়।"
            },
            {
              id: 'static-2',
              title: "প্রথম ডেটে বিল কে দেবে?",
              imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=2047",
              content: "প্রথম ডেটে বিল কে দেবে এটা নিয়ে একটা বিশ্বযুদ্ধ হয়ে যেতে পারে। নিয়ম অনুযায়ী যে ইনভাইট করেছে তার দেওয়া উচিৎ। কিন্তু বর্তমান আধুনিক যুগে ফিফটি-ফিফটি (Dutch) করাটাই সবচেয়ে স্মার্ট উপায়। এতে কারোর ইগোতে লাগে না আর পকেটের ওপরও খুব বেশি চাপ পড়ে না। তবে কেউ কেউ মনে করেন ছেলেরা দেবে। আবার কেউ বিল দেওয়ার ঠিক ২ মিনিট আগে 'আমার একটু ওয়াশরুমে যাওয়া লাগবে' বলে কেটে পড়ে। যাই করুন, অন্তত মানিব্যাগটা সাথে নিয়ে যাবেন!"
            },
            {
              id: 'static-3',
              title: "সিঙ্গেল থাকার ১০টি উপকারিতা",
              imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070",
              content: "১. আপনার টাকা সব আপনারই। ভ্যালেন্টাইন্স ডে-তে গিফট কিনার প্যারা নেই।\n২. রাতে শান্তিমতো ঘুমাতে পারবেন। রাত ৩টা পর্যন্ত ফোনে 'বাবু খাইছো?' শোনার দরকার নেই।\n৩. আপনার ফোনের পাসওয়ার্ড কেউ চাইবে না। ফিঙ্গারপ্রিন্টও সেফ।\n৪. বন্ধুবান্ধবদের সময় দিতে পারবেন। 'বন্ধুদের সাথে আড্ডা দিচ্ছ, আমাকে সময় দিচ্ছ না'- এই ডায়লগ শুনতে হবে না।\n৫. আপনি যা ইচ্ছা খেতে পারেন, যেখানে ইচ্ছা যেতে পারেন। কোনো জবাবদিহিতা নেই। সিঙ্গেল লাইফ আসলেই প্রো লেভেলের শান্তি!"
            }
          ];
          setPost(staticPosts.find(p => p.id === id));
        } else {
          const docSnap = await getDoc(doc(db, 'blogs', id));
          if (docSnap.exists()) {
            setPost({ id: docSnap.id, ...docSnap.data() });
          }
        }
      } catch (error) {
        console.error("Error fetching blog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col">
      <header className="px-6 py-4 flex items-center gap-4 max-w-6xl mx-auto w-full border-b border-gray-100 dark:border-gray-800">
        <Link to="/blog">
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
        {loading ? (
          <p className="text-gray-500">লোড হচ্ছে...</p>
        ) : post ? (
          <article className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-64 sm:h-96 object-cover rounded-3xl mb-8 shadow-md"
              />
            )}
            <h1 className="text-3xl sm:text-5xl font-black mb-8 leading-tight text-gray-900 dark:text-white">{post.title}</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </article>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">পোস্টটি পাওয়া যায়নি</h2>
            <Link to="/blog">
              <Button>ব্লগে ফেরত যান</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
