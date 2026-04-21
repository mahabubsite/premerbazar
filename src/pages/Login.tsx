import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';

export function Login() {
  const { user, signInWithGoogle, loginAnonymously, signInWithEmail, signUpWithEmail, linkEmailAccount, linkGoogleAccount } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // If user is logged in AND not anonymous, redirect to app.
  // If they are anonymous, they can stay on this page to link/log in.
  if (user && !user.isAnonymous) {
    return <Navigate to="/app" />;
  }

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      if (user && user.isAnonymous) {
        await linkGoogleAccount();
      } else {
        await signInWithGoogle();
      }
      navigate('/app');
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setError('এই গুগল অ্যাকাউন্টটি দিয়ে আগে থেকেই অ্যাকাউন্ট খোলা আছে।');
      } else {
        setError('গুগল দিয়ে লগইন/লিংক করতে সমস্যা হয়েছে।');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginAnonymously();
      navigate('/app');
    } catch (err) {
      setError('বেনামে লগইন করতে সমস্যা হয়েছে।');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('ইমেইল এবং পাসওয়ার্ড দিন।');
      return;
    }
    try {
      setError('');
      setLoading(true);
      if (user && user.isAnonymous) {
        if (isSignUp) {
          await linkEmailAccount(email, password);
        } else {
          // They want to sign in to an existing account - this abandons the anonymous one
          await signInWithEmail(email, password);
        }
      } else {
        if (isSignUp) {
          await signUpWithEmail(email, password);
        } else {
          await signInWithEmail(email, password);
        }
      }
      navigate('/app');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে। দয়া করে সাইন ইন করুন।');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('ইমেইল বা পাসওয়ার্ড ভুল।');
      } else {
        setError('লগইন/সাইনআপ করতে সমস্যা হয়েছে।');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-pink-50 dark:bg-gray-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop" 
            alt="Love Background" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 to-purple-600/40 dark:from-pink-900/60 dark:to-purple-900/60 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">PremerBazar</h1>
          <p className="text-xl font-medium text-white/90 drop-shadow-md leading-relaxed">
            যেখানে পারফেক্ট মানুষ খোঁজা বারণ। আসুন, ভুল মানুষের সাথে সঠিক স্মৃতি তৈরি করি।
          </p>
          <div className="mt-12 flex items-center justify-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full border border-white/20 w-fit mx-auto">
            <Sparkles className="w-4 h-4" />
            <span>১০০% আনসিরিয়াস ডেটিং প্ল্যাটফর্ম</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" />
          ফিরে যান
        </Link>
        
        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              {user?.isAnonymous 
                ? (isSignUp ? 'ইমেইল দিয়ে অ্যাকাউন্ট লিংক করুন' : 'বর্তমান অ্যাকাউন্টে লগইন করুন')
                : (isSignUp ? 'নতুন অ্যাকাউন্ট খুলুন' : 'স্বাগতম ফিরে আসার জন্য')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.isAnonymous 
                ? (isSignUp ? 'আপনার বর্তমান বেনামি ডেটা সেভ করতে একটি নতুন ইমেইল ও পাসওয়ার্ড দিন।' : 'আপনার আগে থেকে খোলা অ্যাকাউন্ট থাকলে লগইন করুন। (বর্তমান বেনামি ডেটা মুছে যাবে)')
                : (isSignUp ? 'আপনার ডিটেইলস দিয়ে শুরু করুন।' : 'লগইন করে আপনার ত্রুটিপূর্ণ ম্যাচ খোঁজা শুরু করুন।')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </div>
          )}
          
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">ইমেইল ঠিকানা</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">পাসওয়ার্ড</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg" 
              disabled={loading}
            >
              {user?.isAnonymous 
                ? (isSignUp ? 'ইমেইল দিয়ে লিংক করুন' : 'লগইন করুন') 
                : (isSignUp ? 'সাইন আপ করুন' : 'লগইন করুন')}
            </Button>
          </form>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium hover:underline transition-all"
            >
              {user?.isAnonymous 
                ? (isSignUp ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন ইমেইল দিয়ে বর্তমান প্রোফাইল সেভ করুন')
                : (isSignUp ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'অ্যাকাউন্ট নেই? সাইন আপ করুন')}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-4 text-gray-500 font-medium">অথবা</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium shadow-sm" 
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              গুগল দিয়ে কন্টিনিউ করুন
            </Button>

            {!(user && user.isAnonymous) && (
              <Button 
                className="w-full h-12 bg-gray-900 dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 rounded-xl font-medium shadow-sm" 
                onClick={handleAnonymousLogin}
                disabled={loading}
              >
                নাম-পরিচয় গোপন রেখে শুরু করুন (Anonymous)
              </Button>
            )}
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8">
            লগইন করার মাধ্যমে আপনি স্বীকার করছেন যে আপনার সেন্স অফ হিউমার আছে এবং ডেট বোরিং হলে আমাদের নামে মামলা করবেন না।
          </p>
        </div>
      </div>
    </div>
  );
}
