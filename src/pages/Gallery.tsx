import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function Gallery() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<{url: string, caption: string} | null>(null);
  const [galleryImages, setGalleryImages] = useState<{url: string, caption: string, order: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const q = query(collection(db, 'pictures'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const images = snap.docs.map(doc => ({
          url: doc.data().imageUrl,
          caption: doc.data().caption,
          order: doc.data().order || 0
        }));
        setGalleryImages(images);
      } catch (error) {
        console.error("Error fetching pictures:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPictures();
  }, []);

  const handleDownload = async (imageUrl: string, caption: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${caption}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
              Premer Picture
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">স্মৃতির পাতা</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            এখানে আপনারা আপনাদের সুন্দর মুহূর্তগুলো দেখতে পাবেন। ডেভেলপার চাইলে কোড বা ফোল্ডার থেকে ছবি যুক্ত করে দিতে পারবেন।
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={image.url} 
                alt={image.caption} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                <div className="p-4 w-full flex justify-between items-end">
                  <p className="text-white font-bold text-lg drop-shadow-md">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Full View */}
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
            <div className="relative max-w-4xl w-full flex flex-col items-center">
              <div className="absolute -top-12 right-0 flex gap-4">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => handleDownload(selectedImage.url, selectedImage.caption)}
                 >
                   <Download className="w-6 h-6" />
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => setSelectedImage(null)}
                 >
                   <X className="w-6 h-6" />
                 </Button>
              </div>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption} 
                className="max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-white text-xl font-bold mt-4">{selectedImage.caption}</p>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedImage(null)}></div>
          </div>
        )}
      </main>
    </div>
  );
}
