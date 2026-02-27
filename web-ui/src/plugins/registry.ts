import { Plugin, PluginStatus } from '@/types'

export interface PluginNavItem {
  id: string
  label: string
  icon: string
}

// Full registry with both Plugin management and Nav items
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private statusMap: Map<string, PluginStatus> = new Map()
  
  // Navigation items for sidebar - plugins appear as nav items
  private navItems: Map<string, PluginNavItem> = new Map()

  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin)
    this.statusMap.set(plugin.id, plugin.error ? 'error' : 'ready')
    
    // Also register as nav item if manifest exists
    if (plugin.manifest) {
      this.navItems.set(plugin.id, {
        id: plugin.id,
        label: plugin.manifest.displayName,
        icon: plugin.manifest.icon
      })
    }
  }

  registerNavItem(navItem: PluginNavItem): void {
    this.statusMap.set(navItem.id, 'ready')
    this.navItems.set(navItem.id, navItem)
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id)
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getStatus(id: string): PluginStatus {
    return this.statusMap.get(id) ?? 'loading'
  }

  setStatus(id: string, status: PluginStatus): void {
    this.statusMap.set(id, status)
  }

  remove(id: string): void {
    this.plugins.delete(id)
    this.statusMap.delete(id)
    this.navItems.delete(id)
  }
  
  // Get all navigation items (including plugins)
  getNavItems(): PluginNavItem[] {
    return Array.from(this.navItems.values())
  }
  
  getNavItem(id: string): PluginNavItem | undefined {
    return this.navItems.get(id)
  }
}

export const pluginRegistry = new PluginRegistry()

// Register built-in plugins
import { manifest as tldrawManifest } from '@/plugins/tldraw-canvas'

pluginRegistry.registerNavItem({
  id: tldrawManifest.name,
  label: tldrawManifest.displayName,
  icon: tldrawManifest.icon
})
