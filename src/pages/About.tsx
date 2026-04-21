import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function About() {
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
        <h1 className="text-4xl font-bold mb-8">আমাদের সম্পর্কে</h1>
        <div className="prose dark:prose-invert prose-pink max-w-none">
          <p className="text-lg mb-4">
            SatireDate হলো এমন একটি ডেটিং অ্যাপ, যেটা নিজেকে খুব বেশি সিরিয়াসলি নেয় না। 
            আমরা জানি আধুনিক প্রেম কতটা জটিল আর হাস্যকর হতে পারে, তাই আমরা সেটাকেই ফিচার বানিয়েছি!
          </p>
          <p className="text-lg mb-4">
            এখানে আপনি শুধু পারফেক্ট ম্যাচ খুঁজবেন না, বরং রেড ফ্ল্যাগ দেখে সোয়াইপ করবেন, ডেট রেট করবেন, আর "প্রফেশনাল হার্টব্রেকার" ব্যাজ জিতবেন।
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">আমাদের লক্ষ্য</h2>
          <p className="text-lg mb-4">
            আমাদের লক্ষ্য হলো ডেটিংয়ের এই সিরিয়াস দুনিয়ায় একটু হাসি আর মজা ছড়িয়ে দেওয়া। 
            বাঁশ খেতে চাইলে একটি প্রেম করুন, আর সেই গল্প আমাদের সাথে শেয়ার করুন!
          </p>
        </div>
      </main>
    </div>
  );
}
