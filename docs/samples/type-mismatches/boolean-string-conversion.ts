// Config might be a string in web but boolean in electron
interface ElectronConfig {
  enableFeature: boolean;
}

interface WebConfig {
  enableFeature: string; // "true" or "false" as string
}

function processConfig(config: ElectronConfig) {
  if (config.enableFeature) {
    // Do something
  }
}

const webConfig: WebConfig = {
  enableFeature: "true"
};

// Type error: string is not assignable to boolean
processConfig(webConfig);