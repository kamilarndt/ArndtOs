import React from 'react'
import { Plugin, PluginManifest } from '@/types'
import { pluginRegistry } from './registry'

// Load a plugin dynamically
export async function loadPlugin(manifest: PluginManifest): Promise<Plugin> {
  const pluginId = `${manifest.name}@${manifest.version}`

  try {
    // Dynamically import the plugin component
    const module = await import(/* @vite-ignore */ manifest.entry)

    // Get the default export or named export
    const Component = module.default || module[manifest.name]

    if (!Component) {
      throw new Error(`Plugin ${pluginId} has no valid export`)
    }

    const plugin: Plugin = {
      id: pluginId,
      manifest,
      component: React.lazy(() =>
        Promise.resolve({
          default: Component as React.ComponentType,
        })
      ),
    }

    pluginRegistry.register(plugin)
    pluginRegistry.setStatus(pluginId, 'ready')

    return plugin
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    const plugin: Plugin = {
      id: pluginId,
      manifest,
      component: React.lazy((): any =>
        Promise.resolve({
          default: (() =>
            React.createElement('div', { className: 'p-4 text-red-500' }, `Plugin failed to load: ${errorMessage}`)
          ) as React.ComponentType,
        })
      ),
      error: errorMessage,
    }

    pluginRegistry.register(plugin)
    pluginRegistry.setStatus(pluginId, 'error')

    throw error
  }
}

// Load multiple plugins
export async function loadPlugins(manifests: PluginManifest[]): Promise<Plugin[]> {
  const plugins = await Promise.allSettled(
    manifests.map((manifest) => loadPlugin(manifest))
  )

  return plugins.map((result) =>
    result.status === 'fulfilled' ? result.value : null
  ).filter((plugin): plugin is Plugin => plugin !== null)
}
