import React, { useState } from 'react';
import { Brain, Search, Book, Video, FileText, Mail, LogOut, MessageCircle } from 'lucide-react';
import DiscussionModal from '../components/DiscussionModal';
import AiChatModal from '../components/AiChatModal';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('books');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{ id: number; title: string; date: string } | null>(null);

  const discussionTopics = [
    { id: 1, title: "دور الأسرة في تعزيز الأمن الفكري", date: "2024/03/15" },
    { id: 2, title: "التحديات المعاصرة للشباب", date: "2024/03/14" },
    { id: 3, title: "الوسطية في الإسلام", date: "2024/03/13" }
  ];

  const upcomingEvents = [
    { id: 1, title: "ورشة عمل تعزيز الهوية الوطنية", date: "2024/03/20", type: "ورشة" },
    { id: 2, title: "دورة مهارات التفكير النقدي", date: "2024/03/25", type: "دورة" },
    { id: 3, title: "محاضرة الأمن الفكري في العصر الرقمي", date: "2024/03/28", type: "محاضرة" }
  ];

  const libraryContent = {
    books: [
      { id: 1, title: "أسس الأمن الفكري", desc: "دليل شامل لفهم وتطبيق مبادئ الأمن الفكري", date: "2024/03/01", likes: 167, image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg" },
      { id: 2, title: "تعزيز الهوية الوطنية", desc: "دراسة عن أهمية الهوية الوطنية وحمايتها", date: "2024/03/20", likes: 189, image: "https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg" },
      { id: 3, title: "التربية الإسلامية والأمن الفكري", desc: "العلاقة بين التربية الإسلامية وتحقيق الأمن الفكري", date: "2024/03/05", likes: 145, image: "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg" },
      { id: 4, title: "مهارات التفكير النقدي", desc: "دليل عملي لتنمية مهارات التفكير النقدي", date: "2024/03/10", likes: 178, image: "https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg" }
    ],
    videos: [
      { id: 1, title: "الوسطية في الإسلام", desc: "سلسلة تعليمية عن مفهوم الوسطية", date: "2024/03/13", likes: 278, image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg" },
      { id: 2, title: "محاضرة عن التطرف الفكري", desc: "محاضرة توعوية حول مخاطر التطرف", date: "2024/03/15", likes: 312, image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg" },
      { id: 3, title: "دور الأسرة في التربية", desc: "حلقة نقاشية عن دور الأسرة", date: "2024/03/18", likes: 245, image: "https://images.pexels.com/photos/7282476/pexels-photo-7282476.jpeg" },
      { id: 4, title: "حماية الشباب من الانحراف", desc: "ندوة حول حماية الشباب", date: "2024/03/20", likes: 198, image: "https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg" }
    ],
    articles: [
      { id: 1, title: "التحديات المعاصرة للأمن الفكري", desc: "تحليل للتحديات التي تواجه الشباب", date: "2024/03/10", likes: 203, image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" },
      { id: 2, title: "دور الأسرة في تعزيز الأمن الفكري", desc: "مقال يناقش أهمية دور الأسرة", date: "2024/03/18", likes: 156, image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg" },
      { id: 3, title: "الإعلام والأمن الفكري", desc: "تأثير وسائل الإعلام على الأمن الفكري", date: "2024/03/15", likes: 167, image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg" },
      { id: 4, title: "التعليم ودوره في الأمن الفكري", desc: "أهمية التعليم في تحقيق الأمن الفكري", date: "2024/03/12", likes: 189, image: "https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg" }
    ]
  };

  const handleTopicClick = (topic: typeof selectedTopic) => {
    setSelectedTopic(topic);
    setShowDiscussion(true);
  };

  return (
    <div className="min-h-screen bg-[#F4EFE9]">
      {/* Header */}
      <div className="bg-[#8B7355] text-white py-2">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="logo-container w-8 h-8">
              <div className="logo-shield"></div>
              <Brain className="logo-brain" />
            </div>
            <div className="bg-white/10 rounded-lg py-1.5 px-4 max-w-xl overflow-hidden">
              <p className="animate-marquee whitespace-nowrap text-sm">
                🎓 ورشة عمل: "تعزيز الأمن الفكري" - السبت القادم | 📚 دورة: "مهارات التفكير النقدي" - التسجيل مفتوح | 🌟 محاضرة: "الهوية الوطنية" - الأربعاء القادم
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 transition flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>تواصل معنا</span>
            </button>
            <button className="text-sm px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 transition flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="flex gap-4 mb-8">
              <button className="px-6 py-2 rounded-lg bg-[#8B7355] text-white text-sm">
                جميع المحتويات
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="ابحث في المكتبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5DED5] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-sm"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355]" />
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'books' ? 'bg-[#8B7355] text-white' : 'bg-white text-[#8B7355] hover:bg-[#F4EFE9]'
                }`}
              >
                <Book className="w-4 h-4" />
                <span>الكتب</span>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'videos' ? 'bg-[#8B7355] text-white' : 'bg-white text-[#8B7355] hover:bg-[#F4EFE9]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>مقاطع الفيديو</span>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'articles' ? 'bg-[#8B7355] text-white' : 'bg-white text-[#8B7355] hover:bg-[#F4EFE9]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>المقالات</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-4">
              {libraryContent[activeTab].map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-[#654321] font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-[#8B7355] mb-2 line-clamp-2">{item.desc}</p>
                    <div className="flex justify-between items-center text-sm text-[#8B7355]/70">
                      <span>{item.date}</span>
                      <div className="flex items-center gap-1">
                        <span>{item.likes}</span>
                        <span>❤️</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80">
            {/* Discussion Topics */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="text-lg font-semibold text-[#654321] mb-3">مواضيع النقاش</h3>
              <div className="space-y-2">
                {discussionTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="w-full p-2 rounded-lg hover:bg-[#F4EFE9] transition-colors text-right"
                  >
                    <h4 className="font-medium text-[#8B7355]">{topic.title}</h4>
                    <p className="text-sm text-[#8B7355]/70 mt-1">{topic.date}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-[#654321] mb-3">الفعاليات القادمة</h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border-b border-[#F4EFE9] last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#F4EFE9] text-[#8B7355] text-sm rounded">
                        {event.type}
                      </span>
                      <span className="text-sm text-[#8B7355]/70">{event.date}</span>
                    </div>
                    <h4 className="text-[#654321] font-medium">{event.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Button */}
      <button
        onClick={() => setShowAiChat(true)}
        className="fixed bottom-8 left-8 p-3 border border-[#8B7355]/20 bg-white text-[#8B7355] rounded-full shadow-lg hover:bg-[#F4EFE9] transition-colors flex items-center justify-center"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <Brain className="w-3 h-3 absolute -top-1 -right-1" />
        </div>
      </button>

      {/* Modals */}
      {selectedTopic && (
        <DiscussionModal
          isOpen={showDiscussion}
          onClose={() => setShowDiscussion(false)}
          topic={selectedTopic}
        />
      )}
      
      <AiChatModal
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
      />
    </div>
  );
};

export default Dashboard;