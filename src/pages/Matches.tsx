import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';

// Global cache for users so switching tabs is instant
const globalUserCache: { [key: string]: any } = {};

export function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Read'>('All');

  useEffect(() => {
    if (!user) return;
    
    // Using a ref or component-level variable to store unsubscribes 
    // so we can clean them up when the component unmounts.
    const messageUnsubscribes: { [key: string]: () => void } = {};

    // 1. Listen to matches in real-time
    const qMatches = query(collection(db, 'matches'), where('users', 'array-contains', user.uid));
    
    const unsubscribeMatches = onSnapshot(qMatches, async (querySnapshot) => {
      if (querySnapshot.empty) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // If we already have matches, we don't show the loading spinner to the user
      // so it remains fast without flicker
      
      const updatedMatchesData = await Promise.all(querySnapshot.docs.map(async (matchDoc) => {
        const data = matchDoc.data();
        const otherUserId = data.users.find((id: string) => id !== user.uid);
        
        if (!globalUserCache[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            globalUserCache[otherUserId] = userDoc.exists() ? userDoc.data() : { name: 'অজানা ইউজার' };
          } catch (e) {
            globalUserCache[otherUserId] = { name: 'অজানা ইউজার' };
          }
        }
        
        return {
          id: matchDoc.id,
          ...data,
          otherUser: globalUserCache[otherUserId],
          // Start with null, will be populated by the message listener
          lastMessage: data.lastMessage || null, 
          // Default unread count
          unreadCount: 0 
        };
      }));

      // Set matches immediately so UI renders FAST
      setMatches(current => {
        // Merge with existing state so we don't lose lastMessages we've already listened to
        const merged = updatedMatchesData.map(newMatch => {
          const existing = current.find(m => m.id === newMatch.id);
          return existing ? { ...newMatch, lastMessage: existing.lastMessage || newMatch.lastMessage, unreadCount: existing.unreadCount || newMatch.unreadCount } : newMatch;
        });
        
        return merged.sort((a: any, b: any) => {
          const timeA = a.lastMessage?.createdAt?.getTime() || a.matchedAt?.toDate()?.getTime() || 0;
          const timeB = b.lastMessage?.createdAt?.getTime() || b.matchedAt?.toDate()?.getTime() || 0;
          return timeB - timeA;
        });
      });
      setLoading(false);

      // 2. Set up real-time connection to the last message of EVERY match
      querySnapshot.docs.forEach((matchDoc) => {
        if (!messageUnsubscribes[matchDoc.id]) {
          const messagesQ = query(
            collection(db, `matches/${matchDoc.id}/messages`),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          messageUnsubscribes[matchDoc.id] = onSnapshot(messagesQ, (msgSnap) => {
            let newLastMessage: any = null;
            
            if (!msgSnap.empty) {
              const msgData = msgSnap.docs[0].data();
              newLastMessage = {
                text: msgData.isSticker ? 'Sent a sticker' : msgData.text,
                createdAt: msgData.createdAt?.toDate() || new Date(),
                senderId: msgData.senderId,
                // App logic: real read-receipt logic involves another system, mocking it here
                isRead: msgData.senderId === user.uid ? true : Math.random() > 0.5
              };
            }

            setMatches(currentMatches => {
              const updated = currentMatches.map(m => {
                if (m.id === matchDoc.id) {
                  return {
                    ...m,
                    lastMessage: newLastMessage || m.lastMessage,
                    unreadCount: newLastMessage && !newLastMessage.isRead && newLastMessage.senderId !== user.uid ? Math.floor(Math.random() * 3) + 1 : 0
                  };
                }
                return m;
              });
              
              return updated.sort((a: any, b: any) => {
                const timeA = a.lastMessage?.createdAt?.getTime() || a.matchedAt?.toDate()?.getTime() || 0;
                const timeB = b.lastMessage?.createdAt?.getTime() || b.matchedAt?.toDate()?.getTime() || 0;
                return timeB - timeA;
              });
            });
          });
        }
      });
    });

    return () => {
      unsubscribeMatches();
      // Cleanup all message listeners
      Object.values(messageUnsubscribes).forEach(unsub => unsub());
    };
  }, [user]);

  const formatTime = (date: Date) => {
    if (!date) return '';
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return match.unreadCount > 0;
    if (activeTab === 'Read') return match.unreadCount === 0;
    return true;
  });

  const totalUnread = matches.reduce((sum, match) => sum + (match.unreadCount > 0 ? 1 : 0), 0);

  if (loading && matches.length === 0) {
    return <div className="p-4 flex justify-center items-center h-full text-gray-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Tabs Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-10 sticky top-0 shrink-0">
        <div className="flex items-center justify-between w-full p-1 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-x-auto scx">
          <button 
            onClick={() => setActiveTab('All')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 font-semibold text-sm rounded-lg transition-all whitespace-nowrap min-w-0 ${activeTab === 'All' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 transparent'}`}
          >
            All
            {totalUnread > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'All' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {totalUnread}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('Unread')}
            className={`flex-1 flex justify-center items-center py-2.5 px-4 font-semibold text-sm rounded-lg transition-all whitespace-nowrap min-w-0 ${activeTab === 'Unread' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 transparent'}`}
          >
            Unread
          </button>
          
          <button 
            onClick={() => setActiveTab('Read')}
            className={`flex-1 flex justify-center items-center py-2.5 px-4 font-semibold text-sm rounded-lg transition-all whitespace-nowrap min-w-0 ${activeTab === 'Read' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 transparent'}`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-4xl">
              🏜️
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">কোনো চ্যাট নেই</h2>
            <p className="text-gray-500 text-sm">এখনো কোনো মেসেজ নাই।</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredMatches.map((match, index) => (
              <Link key={match.id} to={`/app/chat/${match.id}`} state={{ otherUser: match.otherUser }}>
                <div className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${index !== filteredMatches.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/50' : ''}`}>
                  <Avatar className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border border-gray-100 dark:border-gray-800">
                    {match.otherUser.photoURL ? (
                      <AvatarImage src={match.otherUser.photoURL} alt={match.otherUser.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-lg font-bold text-gray-700 dark:text-gray-300 bg-transparent">
                      {match.otherUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold text-[16px] truncate ${match.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                        {match.otherUser.name}
                      </h3>
                      <span className={`text-xs whitespace-nowrap ml-2 ${match.unreadCount > 0 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}>
                        {match.lastMessage ? formatTime(match.lastMessage.createdAt) : 'New'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate pr-2 ${match.unreadCount > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {match.lastMessage ? match.lastMessage.text : 'চ্যাট শুরু করতে ট্যাপ করুন'}
                      </p>
                      
                      {match.unreadCount > 0 ? (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {match.unreadCount}
                        </div>
                      ) : match.lastMessage && match.lastMessage.senderId === user?.uid ? (
                        <div className="flex-shrink-0 text-blue-400">
                          <CheckCheck className="w-4 h-4" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
