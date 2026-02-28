'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { ErrorBoundary } from './ErrorBoundary'

const AVAILABLE_MODELS = [
  { id: 'glm-4.7', label: 'GLM 4.7' },
  { id: 'glm-4', label: 'GLM 4' },
  { id: 'gpt-4', label: 'GPT-4' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'claude-3-opus', label: 'Claude 3 Opus' },
  { id: 'local-llama', label: 'Local Llama' },
]

export default function FloatingChat() {
  const {
    isOpen,
    selectedModel,
    assignedAgent,
    messages,
    openChat,
    closeChat,
    setSelectedModel,
    addMessage,
  } = useChatStore()

  const [inputText, setInputText] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isMobileChat, setIsMobileChat] = useState(false)
  const [capturedCanvas, setCapturedCanvas] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileChat(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCaptureCanvas = () => {
    try {
      const bridge = (globalThis as any).__tlDrawAgentBridge
      if (bridge && typeof bridge.exportSnapshot === 'function') {
        const canvasData = bridge.exportSnapshot()
        setCapturedCanvas(JSON.stringify(canvasData))
      } else {
        console.warn('TLDrawAgentBridge not available')
      }
    } catch (error) {
      console.error('Failed to capture canvas:', error)
    }
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const metadata = capturedCanvas ? { canvas: capturedCanvas } : undefined

    addMessage({
      role: 'user',
      content: inputText.trim(),
      metadata,
    })

    setInputText('')
    setCapturedCanvas(null)

    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: 'This is a simulated response. Connect to actual agent system.',
      })
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <ErrorBoundary>
        <button
          onClick={openChat}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 ease-out group no-tap-highlight"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium hidden md:inline">Chat</span>
        </button>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      {isMobileChat ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md md:hidden animate-scale-in safe-area-top">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-semibold text-white text-base">AI Assistant</h2>
              {assignedAgent && (
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {assignedAgent}
                </span>
              )}
            </div>
            <button
              onClick={closeChat}
              className="btn btn-icon btn-ghost"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showModelSelector && (
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-base">Start a conversation</p>
                <p className="text-sm opacity-75 mt-1">
                  Ask me anything about the system
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-base ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-700/50 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-50 mt-2 block">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {capturedCanvas && (
            <div className="px-4 py-3 bg-emerald-900/30 border-b border-emerald-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-emerald-300 font-medium">Canvas captured</span>
              </div>
              <button
                onClick={() => setCapturedCanvas(null)}
                className="btn btn-secondary text-sm py-2"
              >
                Clear
              </button>
            </div>
          )}

          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 safe-area-bottom">
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="btn btn-icon btn-secondary flex-shrink-0"
                aria-label="Change model"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 input resize-none"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={handleCaptureCanvas}
                className="btn btn-icon btn-secondary flex-shrink-0"
                aria-label="Capture canvas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="btn btn-icon btn-primary flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 transition-all duration-300 ease-out w-96 max-h-[600px] animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-semibold text-white">AI Assistant</h2>
              {assignedAgent && (
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {assignedAgent}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                title="Change Model"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {showModelSelector && (
            <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-800/30">
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <svg
                  className="w-12 h-12 mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">Start a conversation</p>
                <p className="text-xs opacity-75">
                  Ask me anything about system
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-700/50 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-50 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {capturedCanvas && (
            <div className="px-4 py-2 bg-emerald-900/30 border-b border-emerald-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-emerald-300 font-medium">Canvas captured</span>
              </div>
              <button
                onClick={() => setCapturedCanvas(null)}
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 rounded-b-xl">
            <div className="flex items-end gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={handleCaptureCanvas}
                className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"
                title="Capture Canvas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                title="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}
