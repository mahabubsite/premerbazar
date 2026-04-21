import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">প্রাইভেসি পলিসি</h1>
        <div className="prose dark:prose-invert prose-pink max-w-none">
          <p className="text-lg mb-4">
            আপনার প্রাইভেসি আমাদের কাছে খুবই গুরুত্বপূর্ণ (অন্তত আপনার Ex-এর চেয়ে তো বেশিই)। 
            আমরা আপনার ডেটা কীভাবে ব্যবহার করি, তা নিচে দেওয়া হলো:
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">১. আমরা কী ডেটা সংগ্রহ করি?</h2>
          <p className="text-lg mb-4">
            আপনার নাম, বয়স, জেন্ডার, আর আপনার সেই সব অদ্ভুত "রেড ফ্ল্যাগ" যা আপনি প্রোফাইলে দিয়েছেন।
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">২. ডেটা কীভাবে ব্যবহার হয়?</h2>
          <p className="text-lg mb-4">
            আপনাকে পারফেক্ট ম্যাচ (বা বাঁশ খাওয়ার পার্টনার) খুঁজে দিতে। আমরা আপনার ডেটা কোনো থার্ড-পার্টির কাছে বিক্রি করি না (কারণ কেউ কিনবে না)।
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">৩. আপনার অধিকার</h2>
          <p className="text-lg mb-4">
            আপনি চাইলে যেকোনো সময় আপনার প্রোফাইল ডিলিট করে সন্ন্যাস নিতে পারেন। আমরা আপনাকে আটকাবো না।
          </p>
        </div>
      </main>
    </div>
  );
}
