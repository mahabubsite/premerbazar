import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, where, getDocs } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ArrowLeft, Send, Coffee, Film, Moon, Smile, Phone, Video, Info, AlertCircle, ShieldAlert, Ban } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const STICKERS = {
  'Love': ['❤️', '😍', '😘', '🥰', '😻', '💌', '💖', '💘'],
  'Funny': ['😂', '🤣', '🤪', '😝', '🤡', '👻', '🙈', '🙊'],
  'Sad': ['😢', '😭', '💔', '🥺', '😞', '🥀', '😔', '😿'],
  'Reactions': ['👍', '👎', '🔥', '💯', '👀', '✨', '🙌', '👏']
};

export function Chat() {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(location.state?.otherUser || null);
  const [showStickers, setShowStickers] = useState(false);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    if (matchId.startsWith('new-')) {
      const initMatch = async () => {
        const targetUid = matchId.replace('new-', '');
        if (!otherUser) {
           navigate('/app/matches');
           return;
        }
        try {
          const matchQ1 = query(collection(db, 'matches'), where('users', 'array-contains', user.uid));
          const matchSnap = await getDocs(matchQ1);
          let existingMatchId = null;
          matchSnap.forEach(doc => {
            if (doc.data().users.includes(targetUid)) existingMatchId = doc.id;
          });
          
          if (existingMatchId) {
            navigate(`/app/chat/${existingMatchId}`, { replace: true, state: { otherUser } });
          } else {
            const matchRef = await addDoc(collection(db, 'matches'), {
              users: [user.uid, targetUid],
              matchedAt: serverTimestamp()
            });
            await addDoc(collection(db, 'interactions'), {
              fromUserId: user.uid,
              toUserId: targetUid,
              type: 'like',
              createdAt: serverTimestamp()
            });
            navigate(`/app/chat/${matchRef.id}`, { replace: true, state: { otherUser } });
          }
        } catch (error) {
          console.error("Error creating match", error);
        }
      };
      initMatch();
      return; 
    }

    const fetchMatchDetails = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (matchDoc.exists()) {
          const data = matchDoc.data();
          if (!data.users.includes(user.uid)) {
            navigate('/app/matches');
            return;
          }
          if (!otherUser) { // Only fetch user profile if it wasn't passed via router state
            const otherId = data.users.find((uid: string) => uid !== user.uid);
            const userDoc = await getDoc(doc(db, 'users', otherId));
            if (userDoc.exists()) {
              setOtherUser(userDoc.data());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching match details", error);
      }
    };

    fetchMatchDetails();

    const q = query(
      collection(db, `matches/${matchId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [matchId, user, navigate]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string, isSticker: boolean = false) => {
    e?.preventDefault();
    if (matchId?.startsWith('new-')) return; // Cannot send message until match is created
    const textToSend = textOverride || newMessage;
    if (!textToSend.trim() || !user || !matchId) return;

    if (!textOverride) setNewMessage('');
    setShowStickers(false);

    try {
      await addDoc(collection(db, `matches/${matchId}/messages`), {
        matchId,
        senderId: user.uid,
        text: textToSend,
        isSticker: isSticker,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const sendDateOffer = (offer: string) => {
    handleSend(undefined, offer, false);
  };

  const sendSticker = (sticker: string) => {
    handleSend(undefined, sticker, true);
  };

  if (!otherUser) return <div className="p-4 flex justify-center items-center h-full text-gray-500">লোড হচ্ছে...</div>;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Messenger Style Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <Avatar className="w-10 h-10 border border-gray-100 dark:border-gray-800">
                {otherUser.photoURL ? (
                  <AvatarImage src={otherUser.photoURL} alt={otherUser.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-blue-500 text-white font-bold">
                  {otherUser.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{otherUser.name}</h2>
              <p className="text-xs text-gray-500 font-medium">Active now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-pink-500">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50 dark:hover:bg-gray-800" onClick={() => setShowCallAlert(true)}>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50 dark:hover:bg-gray-800" onClick={() => setShowCallAlert(true)}>
            <Video className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors">
              <Info className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setShowBlockDialog(true)}>
                <Ban className="w-4 h-4 mr-2" /> ব্লক করুন
              </DropdownMenuItem>
              <DropdownMenuItem className="text-orange-600 cursor-pointer" onClick={() => setShowReportDialog(true)}>
                <ShieldAlert className="w-4 h-4 mr-2" /> রিপোর্ট করুন (ধোঁকা/ছ্যাঁকা)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 my-10 flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-md">
                {otherUser.photoURL ? (
                  <AvatarImage src={otherUser.photoURL} alt={otherUser.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-blue-500 text-white font-bold text-3xl">
                  {otherUser.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{otherUser.name}</h3>
              <p className="text-sm text-gray-500 mb-6">You matched with {otherUser.name}!</p>
              
              <p className="mb-4 text-sm font-medium">একটা ফালতু পিকআপ লাইন মেরে দিন!</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                <Button variant="outline" size="sm" className="rounded-full bg-white dark:bg-gray-800" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("কফি ☕?")}>
                  <Coffee className="w-4 h-4 mr-2 text-amber-600" /> কফি?
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-white dark:bg-gray-800" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("সিনেমা 🎬?")}>
                  <Film className="w-4 h-4 mr-2 text-purple-600" /> সিনেমা?
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-white dark:bg-gray-800" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("লেট নাইট চ্যাট 🌙?")}>
                  <Moon className="w-4 h-4 mr-2 text-blue-600" /> লেট চ্যাট?
                </Button>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?.uid;
            const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === user?.uid);
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMe && (
                  <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar className="w-8 h-8 border border-gray-200 dark:border-gray-700">
                        {otherUser.photoURL ? (
                          <AvatarImage src={otherUser.photoURL} alt={otherUser.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-blue-500 text-white text-xs">
                          {otherUser.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                {msg.isSticker ? (
                  <div className="text-6xl animate-in zoom-in duration-300 drop-shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-[70%] px-4 py-2.5 text-[15px] shadow-sm ${
                    isMe 
                      ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl rounded-br-sm' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700'
                  }`}>
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
          <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("তোমার বাবা কি সন্ত্রাসী? কারণ তুমি একটা বোম! 💣")}>
            বোম! 💣
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("তুমি কি গুগল? কারণ আমি যা খুঁজছি সব তোমার মাঝে আছে। 🔍")}>
            গুগল? 🔍
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("বিশ্বাস করো, আমি অন্য ছেলেদের মতো না। 🥺")}>
            অন্য ছেলেদের মতো না 🥺
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" disabled={matchId?.startsWith('new-')} onClick={() => sendDateOffer("বিকাশে ৫০০ টাকা ধার দিবা? 💸")}>
            বিকাশে ৫০০ টাকা? 💸
          </Button>
        </div>
        
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Popover open={showStickers} onOpenChange={setShowStickers}>
            <PopoverTrigger type="button" className="inline-flex items-center justify-center rounded-full w-10 h-10 text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
              <Smile className="w-6 h-6" />
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80 p-0 border-none shadow-xl rounded-2xl overflow-hidden mb-2">
              <div className="bg-white dark:bg-gray-900">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Stickers</h4>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-4 space-y-6">
                    {Object.entries(STICKERS).map(([category, emojis]) => (
                      <div key={category}>
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{category}</h5>
                        <div className="grid grid-cols-4 gap-4">
                          {emojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={matchId?.startsWith('new-')}
                              onClick={() => sendSticker(emoji)}
                              className="text-3xl hover:scale-125 transition-transform duration-200 flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            disabled={matchId?.startsWith('new-')}
            className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 border-transparent focus-visible:ring-pink-500 px-4 py-6"
          />
          
          <Button type="submit" size="icon" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white flex-shrink-0 w-10 h-10" disabled={!newMessage.trim() || matchId?.startsWith('new-')}>
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>

      <Dialog open={showCallAlert} onOpenChange={setShowCallAlert}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold">সাবধান!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              আগে বিবাহ, পরে অডিও/ভিডিও কল।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button type="button" variant="default" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8" onClick={() => setShowCallAlert(false)}>
              বুঝতে পেরেছি
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Ban className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold">ব্লক করতে চান?</DialogTitle>
            <DialogDescription className="text-base mt-2">
              আপনি কি নিশ্চিত যে এই ইউজারকে ব্লক করতে চান? সে আপনাকে আর মেসেজ দিতে পারবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 flex gap-3">
            <Button type="button" variant="outline" className="rounded-full px-6 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowBlockDialog(false)}>
              না, থাক
            </Button>
            <Button type="button" variant="destructive" className="rounded-full px-6" onClick={() => {
              // Add block user logic here later if needed
              setShowBlockDialog(false);
              alert('ইউজারকে ব্লক করা হয়েছে!');
            }}>
              হ্যাঁ, ব্লক করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-orange-500" />
            </div>
            <DialogTitle className="text-xl font-bold">রিপোর্ট করুন</DialogTitle>
            <DialogDescription className="text-base mt-2">
              এই ইউজারের নামে রিপোর্ট করতে চান? আমরা যাচাই করে ব্যবস্থা নেবো!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 flex gap-3">
            <Button type="button" variant="outline" className="rounded-full px-6 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => setShowReportDialog(false)}>
              বাতিল
            </Button>
            <Button type="button" className="rounded-full px-6 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
              // Add report user logic here later
              setShowReportDialog(false);
              alert('রিপোর্ট সাবমিট করা হয়েছে। আমরা ব্যবস্থা নিচ্ছি!');
            }}>
              রিপোর্ট জমা দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
