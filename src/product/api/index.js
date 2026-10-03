// @ts-check
/* Product Intelligence API surface.

   A named subset of the shared adapter. Domain code imports this rather than
   the whole `api` object, so the boundary is explicit and testable. The
   underlying implementation is unchanged and still single-sourced in
   shared/api/mock.js. */

import { api } from "../../shared/api/index.js";

export const productApi = {
  listRequirements: (projectId) => api.listRequirements(projectId),
  listProductFeatures: (projectId) => api.listProductFeatures(projectId),
  getProductStrategy: (projectId) => api.getProductStrategy(projectId),
  listRoadmapItems: (projectId) => api.listRoadmapItems(projectId),
  runProductMock: (projectId, action, options) =>
    api.runProductMock(projectId, action, options)
};