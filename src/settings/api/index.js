// @ts-check
/* Settings Control Plane API surface.
   A named subset of the shared adapter. Domain code imports this rather than
   the whole `api` object so the boundary is explicit and testable. */

import { api } from "../../shared/api/index.js";

/**
 * Creates a settings API client bound to an adapter.
 * @param {typeof api} [adapter]
 */
export function createSettingsApi(adapter = api) {
  return {
    getEffectiveSettings: (section, context) => adapter.getEffectiveSettings(section, context),
    getSettingDefinitions: (section) => adapter.getSettingDefinitions(section),
    updateSetting: (settingId, payload, options) => adapter.updateSetting(settingId, payload, options),
    resetSettings: (settingIds, options) => adapter.resetSettings(settingIds, options),

    listProviders: () => adapter.listProviders(),
    getAgentPolicy: (agentId) => adapter.getAgentPolicy(agentId),
    updateAgentPolicy: (agentId, patch, options) => adapter.updateAgentPolicy(agentId, patch, options),

    listApiKeys: () => adapter.listApiKeys(),
    createApiKey: (payload, options) => adapter.createApiKey(payload, options),
    revokeApiKey: (keyId, options) => adapter.revokeApiKey(keyId, options),

    listConnectors: () => adapter.listConnectors(),
    updateConnector: (connectorId, patch, options) => adapter.updateConnector(connectorId, patch, options),

    listAutomations: () => adapter.listAutomations(),
    updateAutomation: (id, patch, options) => adapter.updateAutomation(id, patch, options),

    getUsageSummary: () => adapter.getUsageSummary(),
    exportWorkspaceData: (options, opts) => adapter.exportWorkspaceData(options, opts),
    validateImportData: (payload) => adapter.validateImportData(payload)
  };
}

export const settingsApi = createSettingsApi(api);
