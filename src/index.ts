import { traceExpress, tracer, captureConsoleLogs } from '@recap.dev/client'
import Hook from 'require-in-the-middle'

export default function recapDevHook(sails) {
  sails.log.info('Initializing `Recap.Dev` hook...');

  const config = sails.config['recap-dev'] || {}

  if (!process.env.RECAP_DEV_SYNC_ENDPOINT && config.syncEndpoint) {
    process.env.RECAP_DEV_SYNC_ENDPOINT = config.syncEndpoint
  }

  if (!process.env.RECAP_DEV_SYNC_ENDPOINT) {
    sails.log.info('recap.dev: No RECAP_DEV_SYNC_ENDPOINT environment variable or sails.config.recap-dev.syncEndpoint option set, the application won\'t be traced.');
  }

  // eslint-disable-next-line global-require
  Hook(['express'], (express) => {
    traceExpress(express, {
      filterRequest: config.filterRequest || ((request) => request.originalUrl.startsWith('/api/'))
    });

    return express
  })

  captureConsoleLogs();

  if (!config.disableAutomaticUnitNames) {
    sails.on('router:route', (route) => {
      if (route.options.detectedVerb.path.startsWith('/api/')) {
        tracer.setUnitName(sails.config.environment + route.options.detectedVerb.path)
      }
    })
  }

  return {};
}
