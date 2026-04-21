import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Report() {
  const [submitted, setSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReason) {
      setSubmitted(true);
    }
  };

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

      <main className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400">রিপোর্ট করুন</h1>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-900/50 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">রিপোর্ট সফলভাবে জমা হয়েছে!</h2>
            <p className="text-green-700 dark:text-green-300 mb-6">
              আমরা বিষয়টি গুরুত্বের সাথে দেখছি (আসলে দেখছি না, বাট আপনাকে সান্ত্বনা দিলাম)।
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">
              আরেকটা রিপোর্ট করুন
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              কেউ কি আপনার সাথে প্রতারণা করেছে? ৩ ঘণ্টা পর রিপ্লাই দিয়েছে? নাকি প্রথম ডেটে বিল দেয়নি? 
              নির্দ্বিধায় রিপোর্ট করুন!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">রিপোর্টের কারণ (যেকোনো একটি বেছে নিন):</label>
                <div className="space-y-3">
                  {[
                    "৩ ঘণ্টা পর রিপ্লাই দেয়",
                    "অন্য মেয়ের/ছেলের ছবিতে হাহা রিয়েক্ট দিয়েছে",
                    "পাসওয়ার্ড দিতে চায় না",
                    "সাবেক প্রেমিকের (Ex) সাথে কথা বলে",
                    "প্রথম ডেটে বিল দেয় নাই",
                    "আমাকে 'তুমি খুব ভালো বন্ধু' বলেছে (Friendzoned)",
                    "আমার মিমস বুঝে না"
                  ].map((reason, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <input 
                        type="radio" 
                        name="reportReason" 
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                        required
                      />
                      <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">বিস্তারিত (ঐচ্ছিক):</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none h-32"
                  placeholder="আপনার দুঃখের কথা বিস্তারিত লিখুন..."
                ></textarea>
              </div>

              <Button type="submit" className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold">
                রিপোর্ট জমা দিন 😡
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
