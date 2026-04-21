import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, LayoutDashboard, HelpCircle, Frown, Map, BookOpen, AlertTriangle, ShieldCheck, HeartPulse, ArrowLeft, Plus, Edit2, Trash2, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function GenericCRUD({ collectionName, title, fields, seedData }: { collectionName: string; title: string; fields: any[], seedData?: any[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, collectionName));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!seedData) return;
    setSeeding(true);
    try {
      await Promise.all(seedData.map(data => 
        addDoc(collection(db, collectionName), { ...data, createdAt: new Date().toISOString() })
      ));
      await fetchItems();
    } catch (e) {
      console.error("Error seeding data:", e);
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, collectionName, editId), formData);
      } else {
        await addDoc(collection(db, collectionName), { ...formData, createdAt: new Date().toISOString() });
      }
      setFormData({});
      setEditId(null);
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteDoc(doc(db, collectionName, id));
      fetchItems();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title} Management</h2>
        {items.length === 0 && seedData && (
          <button 
            onClick={handleSeed} 
            disabled={seeding}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors"
          >
            {seeding ? 'Seeding...' : 'Load Default Data'}
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
             <div key={f.key}>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea 
                    className="w-full p-2 border rounded-lg" 
                    value={formData[f.key] || ''} 
                    onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    required
                  />
                ) : (
                  <input 
                    type={f.type || 'text'}
                    className="w-full p-2 border rounded-lg" 
                    value={formData[f.key] || ''} 
                    onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    required
                  />
                )}
             </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
             {editId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
             {editId ? 'Update' : 'Add New'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setFormData({}); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
          )}
        </div>
      </form>

      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm">
              <tr>
                {fields.map(f => <th key={f.key} className="p-4">{f.label}</th>)}
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-gray-100 text-sm">
                  {fields.map(f => (
                    <td key={f.key} className="p-4 max-w-[200px] truncate">{item[f.key]}</td>
                  ))}
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={fields.length + 1} className="p-4 text-center">No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  
  const [users, setUsers] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email === 'mdmahbubsite@gmail.com') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersSnap, interactionsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'interactions'))
      ]);
      const activeUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const allInteractions = interactionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setUsers(activeUsers);
      setInteractions(allInteractions);
      
      setStats({
        totalUsers: activeUsers.length,
        singles: activeUsers.filter(u => u.relationshipStatus === 'single').length,
        matched: activeUsers.filter(u => u.relationshipStatus === 'matched').length,
        likes: allInteractions.filter((i: any) => i.type === 'like').length,
        dislikes: allInteractions.filter((i: any) => i.type === 'dislike').length,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string) => {
    if(window.confirm("Are you sure you want to remove this user?")) {
      await deleteDoc(doc(db, 'users', id));
      fetchData();
    }
  };

  if (user?.email !== 'mdmahbubsite@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You do not have admin permissions.</p>
          <Link to="/" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg">Return to Site</Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const chartData = [
          { name: 'Singles', count: stats.singles || 0 },
          { name: 'Matched', count: stats.matched || 0 },
        ];
        const pieData = [
          { name: 'Likes', value: stats.likes || 0 },
          { name: 'Dislikes', value: stats.dislikes || 0 },
        ];
        const COLORS = ['#EC4899', '#9CA3AF'];

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 text-indigo-600">
                  <Users className="w-6 h-6" />
                  <h3 className="font-bold">Total Users</h3>
                </div>
                <p className="text-4xl font-black">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 text-pink-600">
                  <HeartPulse className="w-6 h-6" />
                  <h3 className="font-bold">Total Singles</h3>
                </div>
                <p className="text-4xl font-black">{stats.singles || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 text-green-600">
                  <HeartPulse className="w-6 h-6" />
                  <h3 className="font-bold">Matches Made</h3>
                </div>
                <p className="text-4xl font-black">{stats.matched || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="font-bold">Total Swipes</h3>
                </div>
                <p className="text-4xl font-black">{(stats.likes || 0) + (stats.dislikes || 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px]">
                <h3 className="font-bold text-gray-700 mb-4">User Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px]">
                <h3 className="font-bold text-gray-700 mb-4">Interactions Flow</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Users Management</h2>
              <button onClick={fetchData} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100">Refresh Data</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Age</th>
                    <th className="p-4">Looking For</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-gray-100 text-sm">
                      <td className="p-4 font-medium">{u.name || u.displayName}</td>
                      <td className="p-4">{u.gender}</td>
                      <td className="p-4">{u.age}</td>
                      <td className="p-4">{u.lookingFor}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded">Remove</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'quiz':
        return <GenericCRUD 
          collectionName="quizzes" 
          title="Prem Quiz" 
          fields={[
            { key: 'question', label: 'Question', type: 'text' },
            { key: 'options', label: 'Options (comma separated)', type: 'textarea' }
          ]} 
          seedData={[
            { question: "আপনার ক্রাশ যদি ৩ ঘণ্টা পর রিপ্লাই দেয়, আপনি কী করবেন?", options: "আমিও ৩ ঘণ্টা পর রিপ্লাই দেব, সাথে সাথে রিপ্লাই দেব, ব্লক করে দেব, স্ট্যাটাস দিয়ে বোঝাবো আমি কষ্ট পেয়েছি" },
            { question: "প্রথম ডেটে বিল কে দেবে?", options: "যে ইনভাইট করেছে, ফিফটি-ফিফটি (Dutch), অবশ্যই ছেলেটা, আমি ওয়াশরুমে যাওয়ার ভান করে পালাবো" },
            { question: "পার্টনারের ফোনে পাসওয়ার্ড থাকা কি জরুরি?", options: "হ্যাঁ প্রাইভেসি বলে কথা, না প্রেমে কোনো লুকোচুরি নেই, পাসওয়ার্ড থাকলেও আমার ফিঙ্গারপ্রিন্ট থাকতে হবে, আমি নিজেই ওর ফোন হ্যাক করে নেবো" },
            { question: "আপনার পার্টনার যদি আপনার বেস্ট ফ্রেন্ডের সাথে বেশি কথা বলে?", options: "খুব ভালো তারা বন্ধু হয়ে গেছে, একটু জেলাস হবো, বেস্ট ফ্রেন্ডকে ব্লক মারবো, দুজনকেই একসাথে বাঁশ দেবো" },
            { question: "রাতের বেলা ঝগড়া হলে কী করবেন?", options: "মিটমাট না করে ঘুমাবো না, ফোন সাইলেন্ট করে ঘুমিয়ে পড়বো, সকাল বেলা উঠে আবার ঝগড়া শুরু করবো, ফেসবুকে স্যাড সং শেয়ার করবো" },
            { question: "আপনার পার্টনারের প্রাক্তন (Ex) যদি হঠাৎ মেসেজ দেয়?", options: "পার্টনারকে বলবো ইগনোর করতে, আমি নিজে রিপ্লাই দিয়ে গালি দেবো, স্ক্রিনশট নিয়ে রেখে দেবো প্রমাণের জন্য, Ex-এর বর্তমান পার্টনারকে জানিয়ে দেবো" },
            { question: "ভ্যালেন্টাইন্স ডে-তে কী উপহার আশা করেন?", options: "দামি গিফট (আইফোন/ঘড়ি), ফুল আর চকলেট, একসাথে সময় কাটানোই যথেষ্ট, কিছু না ওসব কর্পোরেট ধান্দা" },
            { question: "আপনার পার্টনার যদি আপনার চেয়ে বেশি ইনকাম করে?", options: "খুব ভালো আমার খরচ বেঁচে যাবে, একটু ইগোতে লাগবে, আমিও বেশি ইনকাম করার চেষ্টা করবো, ওর টাকায় আমি শপিং করবো" },
            { question: "সোশ্যাল মিডিয়ায় রিলেশনশিপ স্ট্যাটাস দেওয়া কি জরুরি?", options: "হ্যাঁ সবাইকে জানাতে হবে, না নজর লেগে যাবে, শুধু ক্লোজ ফ্রেন্ডস জানলেই হবে, আগে বিয়ে হোক তারপর দেখা যাবে" },
            { question: "আপনার পার্টনার যদি আপনার রান্না খেয়ে বলে 'লবণ বেশি হয়েছে'?", options: "পরের বার কম দেবো, রাগ করে আর রান্নাই করবো না, ওর প্লেটে আরও লবণ ঢেলে দেবো, বলবো 'বেশি করে পানি খেয়ে নাও'" }
          ]}
        />;
      case 'sad':
        return <GenericCRUD 
          collectionName="sad_posts" 
          title="Sad Posts" 
          fields={[
            { key: 'text', label: 'Post Text', type: 'textarea' },
            { key: 'imageUrl', label: 'Image URL', type: 'text' },
            { key: 'order', label: 'Order/Position', type: 'number' },
            { key: 'author', label: 'Author Name', type: 'text' },
            { key: 'theme', label: 'Theme (sad, broken, funny, lovely)', type: 'text' },
            { key: 'likes', label: 'Initial Likes (Number)', type: 'number' }
          ]} 
          seedData={[
            { text: "তুমি বলেছিলে তুমি চাঁদ ভালোবাসো, তাই আমি জোৎস্না হয়েছিলাম। কিন্তু তুমি তো আসলে আইফোন ভালোবাসতে...", imageUrl: "", order: 1, author: "ছ্যাঁকা খাওয়া মজনু", theme: "sad", likes: 12 },
            { text: "রিপ্লাই দিতে ৩ ঘণ্টা লাগতো তোমার। আমি ভাবতাম তুমি বিজি, পরে দেখি তুমি পাবজি খেলছো অন্য কারো সাথে।", imageUrl: "", order: 2, author: "অবহেলিত আত্মা", theme: "broken", likes: 45 },
            { text: "প্রথম ডেটে বিল দেওয়ার সময় ওয়াশরুমে যাওয়ার ভান করেছিলাম। এসে দেখি সেও পালিয়েছে। সমানে সমানে টক্কর!", imageUrl: "", order: 3, author: "কিপ্টা প্রেমিক", theme: "funny", likes: 89 }
          ]}
        />;
      case 'roadmap':
        return <GenericCRUD 
          collectionName="roadmaps" 
          title="Roadmap Steps" 
          fields={[
            { key: 'icon', label: 'Emoji Icon', type: 'text' },
            { key: 'title', label: 'Step Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' }
          ]} 
          seedData={[
            { icon: "👀", title: "ক্রাশ খাওয়া", desc: "দূর থেকে দেখা আর মনে মনে বিয়ে করে ফেলা।" },
            { icon: "💬", title: "টেক্সট করা", desc: "৩ ঘণ্টা পর রিপ্লাই পাওয়া আর সেটাকেই ভালোবাসা ভাবা।" },
            { icon: "☕", title: "প্রথম ডেট", desc: "বিল কে দেবে এই নিয়ে মনে মনে যুদ্ধ করা।" },
            { icon: "💔", title: "ব্রেকআপ", desc: "সব শেষে ব্লক খাওয়া আর স্যাড সং শোনা।" }
          ]}
        />;
      case 'survival':
        return <GenericCRUD 
          collectionName="guides" 
          title="Survival Guide" 
          fields={[
            { key: 'icon', label: 'Emoji Icon', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
            { key: 'color', label: 'Color (red/green/purple/yellow)', type: 'text' }
          ]} 
          seedData={[
            { icon: "🚫", title: "Ex-কে Follow করবেন না", desc: "ফেসবুক, ইন্সটা, টিকটক—কোথাও না। দেখলে শুধু কষ্টই বাড়বে।", color: "red" },
            { icon: "📱", title: "৩ ঘণ্টা পর রিপ্লাই", desc: "সেম এনার্জি দিন। সে ৩ ঘণ্টা পর রিপ্লাই দিলে আপনি ৬ ঘণ্টা পর দিন।", color: "purple" },
            { icon: "💸", title: "বিলের টাকা", desc: "সবসময় নিজে বিল দেওয়ার হিরোগিরি দেখানোর দরকার নেই।", color: "green" },
            { icon: "🎭", title: "বেশি কেয়ারিং সাজার ভান", desc: "প্রথম দিনেই তাকে দুনিয়ার সব সুখ এনে দেওয়ার মিথ্যা প্রমিস করবেন না।", color: "yellow" }
          ]}
        />;
      case 'blog':
        return <GenericCRUD 
          collectionName="blogs" 
          title="Vlog & Blog" 
          fields={[
            { key: 'title', label: 'Blog Title', type: 'text' },
            { key: 'imageUrl', label: 'Image URL', type: 'text' },
            { key: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
            { key: 'content', label: 'Full Content', type: 'textarea' }
          ]} 
          seedData={[
            { title: "কীভাবে বুঝবেন সে আপনাকে ঘোরাচ্ছে?", imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7", excerpt: "৩ ঘণ্টা পর রিপ্লাই, আর 'বিজি ছিলাম' অজুহাত? জেনে নিন বাঁশ খাওয়ার আগে সতর্ক হওয়ার উপায়।", content: "রিলেশনশিপে সবচেয়ে বড় রেড ফ্ল্যাগ হলো ইগনোরেন্স। যদি দেখেন আপনার ক্রাশ খুব সুন্দর করে অনলাইনে থেকেও আপনার মেসেজ ডেলিভার হওয়ার পর ৩ ঘণ্টা পর 'ওহ সরি, দেখলাম না' বলে, তাহলে বুঝে নিতে হবে ডাল মে কুছ কালা হ্যায়। ভালোবাসার প্রথম ধাপ হলো প্রায়োরিটি। যদি সে অনলাইনে এসে সবার স্ট্যাটাসে হাহা দেয়, রিল শেয়ার করে, কিন্তু আপনার মেসেজের বেলায় সে 'বিজি', তাহলে ভাই/বোন, সে আসলে আপনাকে অপশনে রেখেছে। এখান থেকে কেটে পড়াই শ্রেয়।" },
            { title: "প্রথম ডেটে বিল কে দেবে?", imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24", excerpt: "বিল দেওয়ার সময় ওয়াশরুমে যাওয়ার ভান করা কি আসলেই কাজ করে? বিস্তারিত পড়ুন।", content: "প্রথম ডেটে বিল কে দেবে এটা নিয়ে একটা বিশ্বযুদ্ধ হয়ে যেতে পারে। নিয়ম অনুযায়ী যে ইনভাইট করেছে তার দেওয়া উচিৎ। কিন্তু বর্তমান আধুনিক যুগে ফিফটি-ফিফটি (Dutch) করাটাই সবচেয়ে স্মার্ট উপায়। এতে কারোর ইগোতে লাগে না আর পকেটের ওপরও খুব বেশি চাপ পড়ে না। তবে কেউ কেউ মনে করেন ছেলেরা দেবে। আবার কেউ বিল দেওয়ার ঠিক ২ মিনিট আগে 'আমার একটু ওয়াশরুমে যাওয়া লাগবে' বলে কেটে পড়ে। যাই করুন, অন্তত মানিব্যাগটা সাথে নিয়ে যাবেন!" },
            { title: "সিঙ্গেল থাকার ১০টি উপকারিতা", imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643", excerpt: "টাকা বাঁচে, শান্তি থাকে, আর কেউ পাসওয়ার্ড চায় না। সিঙ্গেল লাইফ ইজ দ্য বেস্ট লাইফ!", content: "১. আপনার টাকা সব আপনারই। ভ্যালেন্টাইন্স ডে-তে গিফট কিনার প্যারা নেই।\n২. রাতে শান্তিমতো ঘুমাতে পারবেন। রাত ৩টা পর্যন্ত ফোনে 'বাবু খাইছো?' শোনার দরকার নেই।\n৩. আপনার ফোনের পাসওয়ার্ড কেউ চাইবে না। ফিঙ্গারপ্রিন্টও সেফ।\n৪. বন্ধুবান্ধবদের সময় দিতে পারবেন। 'বন্ধুদের সাথে আড্ডা দিচ্ছ, আমাকে সময় দিচ্ছ না'- এই ডায়লগ শুনতে হবে না।\n৫. আপনি যা ইচ্ছা খেতে পারেন, যেখানে ইচ্ছা যেতে পারেন। কোনো জবাবদিহিতা নেই। সিঙ্গেল লাইফ আসলেই প্রো লেভেলের শান্তি!" }
          ]}
        />;
      case 'pictures':
        return <GenericCRUD 
          collectionName="pictures" 
          title="Premer Pictures" 
          fields={[
            { key: 'imageUrl', label: 'Image URL', type: 'text' },
            { key: 'caption', label: 'Caption', type: 'text' },
            { key: 'order', label: 'Order/Position', type: 'number' }
          ]} 
          seedData={[
            { imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop", caption: "প্রেমের শুরু", order: 1 },
            { imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop", caption: "প্রথম ডেট", order: 2 },
            { imageUrl: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=600&auto=format&fit=crop", caption: "ঝগড়ার পর", order: 3 },
            { imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop", caption: "যুগলবন্দী", order: 4 }
          ]}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 shrink-0 shadow-sm z-10 sticky top-0 md:h-screen flex flex-col">
        <div className="flex flex-col gap-4 mb-8 mt-2">
          <Link to="/" className="flex items-center gap-2 px-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="font-medium">Back to Main Site</span>
          </Link>
          <div className="flex items-center gap-2 px-2 border-t pt-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <h2 className="text-xl font-black text-indigo-900">Admin Panel</h2>
          </div>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5 flex-shrink-0" /> Users
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'quiz' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <HelpCircle className="w-5 h-5 flex-shrink-0" /> Prem Quiz
          </button>
          <button onClick={() => setActiveTab('sad')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sad' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Frown className="w-5 h-5 flex-shrink-0" /> Sad Post
          </button>
          <button onClick={() => setActiveTab('roadmap')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'roadmap' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Map className="w-5 h-5 flex-shrink-0" /> Roadmap
          </button>
          <button onClick={() => setActiveTab('survival')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'survival' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" /> Survival Guide
          </button>
          <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'blog' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BookOpen className="w-5 h-5 flex-shrink-0" /> Blog / Vlog
          </button>
          <button onClick={() => setActiveTab('pictures')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pictures' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Image className="w-5 h-5 flex-shrink-0" /> Premer Pictures
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50/50">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 capitalize">{activeTab}</h1>
        {renderTabContent()}
      </div>
    </div>
  );
}
