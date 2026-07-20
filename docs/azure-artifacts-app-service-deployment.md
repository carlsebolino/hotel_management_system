# Private npm packages and Azure App Service deployment

This guide shows how to consume a private npm package stored in **Azure
Artifacts**, build the React/Vite JavaScript, and deploy the packaged
application to an Azure App Service deployment slot through Azure Pipelines.

## 1. Publish or identify the Azure Artifacts package

In Azure DevOps, open **Artifacts**, create or select an npm feed, and grant
the consuming project's build service account at least **Reader** access. If
the package is in another Azure DevOps project, also grant that project's
`<Project> Build Service (<Organization>)` identity Reader access to the feed.

Record these values:

| Value | Example |
| --- | --- |
| Organization | `fabrikam` |
| Project (project-scoped feeds only) | `hotel-platform` |
| Feed | `shared-ui` |
| Package scope | `@fabrikam` |
| Package name and version | `@fabrikam/hotel-ui@^1.4.0` |

`frontend/.npmrc` is intentionally a template. Replace
`YOUR_NPM_SCOPE`, `YOUR_AZURE_DEVOPS_ORGANIZATION`, and
`YOUR_AZURE_ARTIFACTS_FEED` with the corresponding values. Keep the package
scope and feed registry exact; the scope line makes npm ask Azure Artifacts
only for packages in that scope. Do **not** put a personal access token (PAT)
in `.npmrc` or source control.

Azure Artifacts exposes two feed URL forms. Keep the active organization-scoped
template when the feed belongs to the Azure DevOps organization. If the feed is
project-scoped, comment out that line and activate the second template, replacing
`YOUR_AZURE_DEVOPS_PROJECT` as well. A project-scoped registry URL must include
the project segment between the organization and `_packaging`:

```ini
@fabrikam:registry=https://pkgs.dev.azure.com/fabrikam/hotel-platform/_packaging/shared-ui/npm/registry/
```

For a developer machine, Azure DevOps provides the feed's **Connect to feed**
instructions. Use its generated user-level authentication entry (or an Azure
DevOps credential helper) together with this repository's scope registry. A
PAT, if used, needs **Packaging: Read** scope and should be stored outside the
repository.

## 2. Reference the package in `frontend/package.json`

Add the real package coordinate under `dependencies` (not `devDependencies`
when the browser bundle imports it):

```json
{
  "dependencies": {
    "@fabrikam/hotel-ui": "^1.4.0"
  }
}
```

For example, the command below both adds the dependency and updates the lock
file once `frontend/.npmrc` is configured:

```bash
cd frontend
npm install @fabrikam/hotel-ui@^1.4.0
```

Windows PowerShell uses the same npm command; change directories with
`Set-Location frontend` before running it. The Azure pipeline intentionally
runs on `ubuntu-latest` and targets a Linux App Service, but the local npm and
PowerShell tooling documented in this repository work on Windows.

Commit the resulting `frontend/package-lock.json`. With a lock file, the
pipeline uses `npm ci`, which installs the exact reviewed dependency graph.
This repository does not name a sample package in its actual `package.json`:
package names, scopes, and versions are organization-specific, and committing
a placeholder would make normal local installs fail.

## 3. Configure pipeline access and deployment variables

Create `azure-pipelines.yml` from this repository in Azure DevOps and set the
following variables in the pipeline or a linked variable group:

| Variable | Purpose |
| --- | --- |
| `AZURE_SERVICE_CONNECTION` | Azure Resource Manager service connection authorized for the App Service. |
| `AZURE_WEBAPP_NAME` | Target App Service name. |
| `AZURE_RESOURCE_GROUP` | Target resource group. |
| `AZURE_WEBAPP_SLOT` | Slot name, such as `staging`; it must already exist. |
| `AZURE_DEVOPS_ENVIRONMENT` | Azure DevOps Environment used for deployment history and approvals. |
| `NPM_FEED_SERVICE_CONNECTION` | npm service connection for a feed in a **different** Azure DevOps organization. |

For a feed in the same organization, leave `NPM_FEED_SERVICE_CONNECTION` empty
and authorize the pipeline's build identity as described in step 1. For an
external organization, create an npm service connection with a Packaging Read
PAT, save the PAT as a secret, and use the connection name for that variable.

The deployment job may require approval to use the Azure service connection or
the named Environment. Configure those checks in Azure DevOps; they keep the
pipeline YAML free of credentials.

## 4. What the pipeline does

`azure-pipelines.yml` performs the following work:

1. Selects Node.js 20.19.0, matching `frontend/package.json`.
2. Runs `NpmAuthenticate` against `frontend/.npmrc`; credentials are temporary
   and are not included in the published artifact.
3. Installs dependencies, runs ESLint, and executes `npm run build`. Vite emits
   compiled JavaScript, CSS, and assets in `frontend/dist`.
4. Creates `hotel-management-app.zip` containing the Flask app, Python startup
   files, requirements, and `frontend/dist`. The Flask application serves the
   compiled assets and returns `index.html` for non-API SPA routes.
5. Publishes that ZIP and uses `AzureWebApp@1` to deploy it to the configured
   Linux App Service slot.

The packaged Flask application serves `frontend/dist` at the deployment root:
it serves built files such as `/assets/...`, returns `index.html` for client-side
routes, and preserves JSON 404 responses for `/api/...` paths. Set the normal
Python startup command, runtime, application settings, and database
configuration on the App Service slot. Put slot-specific settings in the slot
configuration, not in the repository or pipeline YAML. After validating the
slot, use an App Service slot swap to promote it to production.

## Troubleshooting

- **`npm` returns 401/403:** verify the `frontend/.npmrc` organization/feed/scope and
  the build identity's feed Reader permission. For cross-organization feeds,
  verify the npm service connection and PAT's Packaging Read scope.
- **`npm` returns 404 for a scoped package:** npm is probably using the public
  registry or the wrong feed URL; confirm the `@scope:registry=...` line matches
  the package scope and includes the Azure DevOps project segment for a
  project-scoped feed.
- **`npm ci` says there is no lock file:** run `npm install` locally after
  adding the package and commit `frontend/package-lock.json`. Until then, this
  pipeline deliberately falls back to `npm install`.
- **Deployment succeeds but the UI is missing:** confirm the production server
  serves `frontend/dist`, and inspect the slot's startup command and deployment
  logs.
