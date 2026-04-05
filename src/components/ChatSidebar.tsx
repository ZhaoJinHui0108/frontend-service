import { useState, useEffect, useRef } from 'react';
import { chatApi, ChatMessage } from '../api/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'system',
  content: '你是一个有帮助的AI助手，可以回答关于这个系统的问题。系统信息：这是一个用户管理系统，包含用户管理、角色管理、权限管理、笔记管理等功能。',
};

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(newMessages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error.response?.data?.detail || '抱歉，发生了错误，请稍后重试。',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="chat-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
        }}
      />

      {/* Sidebar */}
      <div
        className="chat-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>AI 助手</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.slice(1).map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--primary-500)'
                      : 'var(--bg-secondary)',
                  color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                padding: '8px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--border-default)',
                  borderTopColor: 'var(--primary-500)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '13px' }}>思考中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '14px',
                minHeight: '44px',
                maxHeight: '120px',
                outline: 'none',
                lineHeight: 1.5,
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor:
                  input.trim() && !isLoading
                    ? 'var(--primary-500)'
                    : 'var(--bg-secondary)',
                color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '12px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
