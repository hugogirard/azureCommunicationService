param suffix string
param location string
param serverFarmId string

resource eventViewer 'Microsoft.Web/sites@2024-11-01' = {
  name: 'event-grid-viewer-${suffix}'
  location: location
  properties: {
    serverFarmId: serverFarmId
    siteConfig: {
      webSocketsEnabled: true
      netFrameworkVersion: 'v8.0'
      linuxFxVersion: 'DOTNETCORE|8.0'
    }
    httpsOnly: true
  }
}
