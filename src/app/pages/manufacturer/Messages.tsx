import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { MessageCircle, Send, Search, User } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender: 'me' | 'other';
}

interface Thread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

export default function ManufacturerMessages() {
  const [threads] = useState<Thread[]>([
    {
      id: '1',
      name: 'Lagos Mega Store',
      lastMessage: 'When can you ship the order?',
      timestamp: '2 hours ago',
      unread: 2,
      avatar: 'https://ui-avatars.com/api/?name=Lagos+Mega&background=BE220E&color=fff',
    },
    {
      id: '2',
      name: 'Sunny Mart Network',
      lastMessage: 'Thank you for the quick delivery!',
      timestamp: '1 day ago',
      unread: 0,
      avatar: 'https://ui-avatars.com/api/?name=Sunny+Mart&background=2563EB&color=fff',
    },
    {
      id: '3',
      name: 'Quick Shop Express',
      lastMessage: 'Do you have more stock available?',
      timestamp: '2 days ago',
      unread: 1,
      avatar: 'https://ui-avatars.com/api/?name=Quick+Shop&background=7C3AED&color=fff',
    },
  ]);

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', from: 'Lagos Mega Store', content: 'Hi, I placed an order yesterday', timestamp: '10:30 AM', isRead: true, sender: 'other' },
    { id: '2', from: 'Me', content: 'Yes, I see it. We are processing it now', timestamp: '10:45 AM', isRead: true, sender: 'me' },
    { id: '3', from: 'Lagos Mega Store', content: 'When can you ship the order?', timestamp: '11:00 AM', isRead: false, sender: 'other' },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      from: 'Me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      sender: 'me',
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with your customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <Card className="lg:col-span-1 p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredThreads.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title={searchQuery ? 'No conversations found' : 'No messages yet'}
                  description={searchQuery ? 'Try a different search term' : 'Your conversations will appear here'}
                  action={searchQuery ? { label: 'Clear Search', onClick: () => setSearchQuery('') } : undefined}
                />
              ) : filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedThread === thread.id ? 'bg-[#BE220E] text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={thread.avatar} alt={thread.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate">{thread.name}</div>
                        {thread.unread > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedThread === thread.id ? 'bg-white text-[#BE220E]' : 'bg-[#BE220E] text-white'
                          }`}>
                            {thread.unread}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm truncate ${selectedThread === thread.id ? 'opacity-90' : 'text-gray-600'}`}>
                        {thread.lastMessage}
                      </div>
                      <div className={`text-xs mt-1 ${selectedThread === thread.id ? 'opacity-75' : 'text-gray-500'}`}>
                        {thread.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-2 p-4 flex flex-col" style={{ height: '600px' }}>
            {selectedThread ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <img
                    src={threads.find((t) => t.id === selectedThread)?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{threads.find((t) => t.id === selectedThread)?.name}</div>
                    <div className="text-sm text-gray-600">Active now</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'me'
                            ? 'bg-[#BE220E] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/75' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} style={{ backgroundColor: '#BE220E' }} className="text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
