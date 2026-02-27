import type { ComponentType, LazyExoticComponent } from 'react'

export type IsolationType = 'iframe' | 'realm' | 'none'

export type FileSystemAccess = 'none' | 'readonly' | 'full'

export interface PluginPermissions {
  network: boolean
  fileSystem: FileSystemAccess
  websocket: boolean
  localStorage: boolean
  sessionStorage: boolean
  camera: boolean
  microphone: boolean
  geolocation: boolean
  allowedDomains?: string[] // Whitelisted domains for network requests
}

export interface ContentSecurityPolicy {
  'default-src': string[]
  'script-src': string[]
  'style-src': string[]
  'img-src': string[]
  'font-src': string[]
  'connect-src': string[]
  'media-src': string[]
  'object-src': string[]
  'base-uri': string[]
  'form-action': string[]
  'frame-ancestors': string[]
}

export interface IsolationConfig {
  type: IsolationType
  sandbox?: string[]
  csp?: ContentSecurityPolicy
}

export interface ResourceLimits {
  maxMemory: number // bytes
  maxCPU: number // percentage (0-1)
  maxExecutionTime: number // milliseconds
  maxFileSize: number // bytes
}

export interface PluginManifest {
  name: string
  version: string
  displayName: string
  description: string
  icon: string
  entry: string
  enabled: boolean
  permissions: PluginPermissions
  isolation?: IsolationConfig
  resources?: ResourceLimits
}

export interface Plugin {
  id: string
  manifest: PluginManifest
  component: LazyExoticComponent<ComponentType>
  error?: string
}

export type PluginStatus = 'loading' | 'ready' | 'error'
