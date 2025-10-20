targetScope = 'subscription'

param location string

@allowed(['canada'])
param dataLocation string

param resourceGroupName string

param createPublicAzureDnsZone bool

param domainName string

resource rg 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
}

var suffix = uniqueString(rg.id)

module loganalytics 'br/public:avm/res/operational-insights/workspace:0.11.1' = {
  scope: rg
  params: {
    name: 'log-ai-${suffix}'
    location: location
    dailyQuotaGb: 1
    dataRetention: 30
  }
}

// module registry 'br/public:avm/res/container-registry/registry:0.9.1' = {
//   scope: rg
//   params: {
//     name: 'acr${suffix}'
//     location: location
//     acrAdminUserEnabled: true
//     acrSku: 'Standard'
//     publicNetworkAccess: 'Enabled'
//   }
// }

module serverfarm 'br/public:avm/res/web/serverfarm:0.5.0' = {
  scope: rg
  params: {
    name: 'asp-${suffix}'
    kind: 'linux'
    skuName: 'P1v3'
    skuCapacity: 1
    zoneRedundant: false
  }
}

module communicationService 'br/public:avm/res/communication/communication-service:0.4.1' = {
  scope: rg
  params: {
    dataLocation: dataLocation
    name: 'acs-${suffix}'
    diagnosticSettings: [
      {
        workspaceResourceId: loganalytics.outputs.resourceId
      }
    ]
  }
}

module emailService 'br/public:avm/res/communication/email-service:0.4.0' = {
  scope: rg
  params: {
    name: 'email-${suffix}'
    dataLocation: dataLocation
  }
}

module dnsDomain 'br/public:avm/res/network/dns-zone:0.5.4' = if (createPublicAzureDnsZone) {
  scope: rg
  params: {
    name: domainName
  }
}

module eventViewer 'br/public:avm/res/web/site:0.19.3' = {
  scope: rg
  params: {
    name: 'viewer-${suffix}'
    kind: 'app,linux'
    serverFarmResourceId: serverfarm.outputs.resourceId
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'DOTNETCORE|8.0'
    }
    publicNetworkAccess: 'Enabled'
  }
}
