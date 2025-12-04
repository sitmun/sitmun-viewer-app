// =============================================================================
// Patches for TC.Defaults and TC.Cfg objects
// API SITNA version: 4.1.0
// This file contains patches to modify the default configuration objects.
// Additional patches to the Defaults object can be added here in the future.
// =============================================================================

// Patch: Set availableBaseLayers to an empty array
// This prevents default base layers from being available
if (typeof TC !== 'undefined' && TC.Defaults) {
  // Create a patched copy of the Defaults object
  var patchedDefaults = TC.Util.extend(true, {}, TC.Defaults);
  patchedDefaults.availableBaseLayers = [];
  
  // Replace TC.Defaults with the patched version
  TC.Defaults = patchedDefaults;
  
  // TC.Cfg is a deep copy of Defaults created at module load time,
  // so we need to patch it separately
  // SITNA.Cfg it's the same as TC.Cfg, so SITNA.Cfg.availableBaseLayers is not needed to be patched
  if (TC.Cfg) {
    TC.Cfg.availableBaseLayers = [];
  }
}

