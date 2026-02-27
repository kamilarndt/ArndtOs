import React, { useRef, useEffect, useState } from 'react'
import type { IsolationConfig, PluginManifest } from '@/types/plugin'

interface PluginSandboxProps {
  manifest: PluginManifest
  children: React.ReactNode
}

export const PluginSandbox: React.FC<PluginSandboxProps> = ({ manifest, children }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Validate permissions before loading plugin
    validatePermissions(manifest.permissions)
  }, [manifest])

  const validatePermissions = (permissions: PluginManifest['permissions']) => {
    // Reject plugins with excessive permissions
    if (permissions.fileSystem === 'full') {
      console.error(`Plugin ${manifest.name} requests dangerous permission: full file system access`)
      throw new Error('Plugin permission denied: full file system access not allowed')
    }

    if (permissions.camera && permissions.microphone) {
      console.error(`Plugin ${manifest.name} requests both camera and microphone`)
      throw new Error('Plugin permission denied: cannot request both camera and microphone')
    }
  }

  const getSandboxAttributes = (isolation?: IsolationConfig): string[] => {
    if (!isolation || isolation.type === 'none') {
      return []
    }

    const defaultSandbox = [
      'allow-scripts', // Allow JavaScript
      'allow-same-origin', // Allow same origin for certain operations
    ]

    // Only add allowed permissions from manifest
    if (manifest.permissions.websocket) {
      defaultSandbox.push('allow-popups')
    }

    return isolation.sandbox || defaultSandbox
  }

  const buildCSP = (csp?: IsolationConfig['csp']): string => {
    if (!csp) {
      // Default strict CSP
      return "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none';"
    }

    const directives = Object.entries(csp)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')

    return directives + ';'
  }

  const handleIframeLoad = () => {
    setIsReady(true)
  }

  const handlePostMessage = (event: MessageEvent) => {
    // Validate message origin
    const allowedOrigin = window.location.origin
    if (event.origin !== allowedOrigin) {
      console.warn('Rejected message from unauthorized origin:', event.origin)
      return
    }

    // Validate message type
    const allowedTypes = ['plugin-event', 'plugin-request', 'plugin-response']
    if (!allowedTypes.includes(event.data?.type)) {
      console.warn('Rejected message with invalid type:', event.data?.type)
      return
    }

    // Handle secure plugin-main app communication
    console.log('Received secure message from plugin:', event.data)
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage)
    return () => window.removeEventListener('message', handlePostMessage)
  }, [])

  const isolation = manifest.isolation
  const sandbox = getSandboxAttributes(isolation)
  const csp = buildCSP(isolation?.csp)

  if (isolation?.type === 'none') {
    // No isolation - render directly (only for trusted plugins)
    return <>{children}</>
  }

  if (isolation?.type === 'realm') {
    // JavaScript Realm isolation (conceptual - needs actual implementation)
    // For now, render with error boundary
    return (
      <ErrorBoundary fallback={<div className="p-4 text-red-500">Realm isolation not yet implemented</div>}>
        {children}
      </ErrorBoundary>
    )
  }

  // Iframe isolation (default)
  return (
    <div className="plugin-sandbox w-full h-full relative">
      <iframe
        ref={iframeRef}
        title={manifest.displayName}
        sandbox={sandbox.join(' ')}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta http-equiv="Content-Security-Policy" content="${csp}">
              <style>
                body { margin: 0; padding: 0; overflow: hidden; }
              </style>
            </head>
            <body>
              <div id="plugin-root"></div>
              <script>
                // Restrict global window access
                const restrictedWindow = new Proxy(window, {
                  get: (target, prop) => {
                    const allowedProps = ['postMessage', 'addEventListener', 'removeEventListener'];
                    if (!allowedProps.includes(prop.toString())) {
                      console.warn('Access to window.' + prop + ' is restricted');
                      return undefined;
                    }
                    return target[prop];
                  },
                  set: (target, prop, value) => {
                    console.warn('Setting window.' + prop + ' is restricted');
                    return false;
                  }
                });

                // Override window with restricted version
                // Note: This is a simplified example - actual implementation needs more
              </script>
            </body>
          </html>
        `}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading plugin...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Error Boundary for plugin isolation
interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Plugin error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Plugin Error</h3>
            <p className="text-red-700 text-sm">
              {this.state.error?.message || 'An error occurred in the plugin'}
            </p>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default PluginSandbox
