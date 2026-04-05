import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatApi, ChatMessage, ApiKeyInfo, ModelInfo } from '../api/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('MiniMax-M2.7');
  const [currentModel, setCurrentModel] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available api keys and models on mount
  useEffect(() => {
    if (isOpen) {
      chatApi.listApiKeys().then((response) => {
        setApiKeys(response.api_keys);
        if (response.api_keys.length > 0) {
          setSelectedApiKey(response.api_keys[0].key);
        }
      }).catch(console.error);
      
      chatApi.listModels().then((response) => {
        setModels(response.models);
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedApiKey) return;

    setError('');
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setCurrentModel(selectedModel);

    try {
      const response = await chatApi.sendMessage({
        messages: newMessages,
        api_key_name: selectedApiKey,
        model: selectedModel,
      });
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '抱歉，发生了错误，请稍后重试。';
      setError(errorMsg);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `错误: ${errorMsg}`,
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
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '440px',
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
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
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

          {/* API Key Selector */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>API Key:</span>
              <Link
                to="/sensitive-configs"
                target="_blank"
                style={{
                  fontSize: '11px',
                  color: 'var(--primary-500)',
                  textDecoration: 'none',
                }}
                onClick={onClose}
              >
                + 配置新的 Key
              </Link>
            </div>
            {apiKeys.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--error)', padding: '8px', backgroundColor: 'var(--error-bg)', borderRadius: '6px' }}>
                未配置 API Key，请先{' '}
                <Link to="/sensitive-configs" style={{ color: 'var(--primary-500)' }}>
                  添加配置
                </Link>
              </div>
            ) : (
              <select
                value={selectedApiKey}
                onChange={(e) => setSelectedApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                {apiKeys.map((ak) => (
                  <option key={ak.key} value={ak.key}>
                    {ak.key}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Model Selector */}
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>模型:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={apiKeys.length === 0}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: 'white',
                cursor: apiKeys.length === 0 ? 'not-allowed' : 'pointer',
                opacity: apiKeys.length === 0 ? 0.5 : 1,
              }}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
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
              <span style={{ fontSize: '13px' }}>
                {currentModel ? `${currentModel} 思考中...` : '思考中...'}
              </span>
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
              placeholder={apiKeys.length === 0 ? "请先配置 API Key" : "输入消息..."}
              disabled={isLoading || apiKeys.length === 0}
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
                opacity: apiKeys.length === 0 ? 0.5 : 1,
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || apiKeys.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor:
                  input.trim() && !isLoading && apiKeys.length > 0
                    ? 'var(--primary-500)'
                    : 'var(--bg-secondary)',
                color:
                  input.trim() && !isLoading && apiKeys.length > 0
                    ? 'white'
                    : 'var(--text-muted)',
                border: 'none',
                borderRadius: '12px',
                cursor:
                  input.trim() && !isLoading && apiKeys.length > 0
                    ? 'pointer'
                    : 'not-allowed',
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
