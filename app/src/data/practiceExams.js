// ═══════════════════════════════════════════════════════════════════════════════
// PRACTICE EXAM DATA
// Sourced from practice-exams.md and practice-exams-pluralsight.md
// ═══════════════════════════════════════════════════════════════════════════════

export const practiceExams = [
  // ── Level 1 ────────────────────────────────────────────────────────────────
  {
    id: 'lvl1-htpasswd',
    title: 'HTPasswd Identity Provider & RBAC',
    level: 'Level 1',
    levelType: 'green',
    source: 'DO180 / EX280',
    desc: 'Configure HTPasswd as the cluster identity provider, create users, assign project-scoped roles, and remove the default kubeadmin account.',
    tasks: [
      {
        id: 't1',
        title: 'Create the HTPasswd file',
        objective: 'Create a local htpasswd file containing users: root, alpha, beta, gamma, delta — all with the password doubletap.',
        hint: 'Use the htpasswd command. The -c flag creates the file, -B uses bcrypt (required by OCP), and -b reads the password non-interactively.',
        help: 'Create the file and add each user:\n\nhtpasswd -cBb users.htpasswd root doubletap\nhtpasswd -Bb users.htpasswd alpha doubletap\nhtpasswd -Bb users.htpasswd beta doubletap\nhtpasswd -Bb users.htpasswd gamma doubletap\nhtpasswd -Bb users.htpasswd delta doubletap\n\n# Verify the file\ncat users.htpasswd',
      },
      {
        id: 't2',
        title: 'Create the HTPasswd Secret',
        objective: 'Check for an existing htpass-secret Secret in openshift-config, delete it if present, and recreate it from your htpasswd file.',
        hint: 'The Secret must live in the openshift-config namespace and be of type Opaque. Use oc create secret generic.',
        help: '# Check for existing secret\noc get secret htpass-secret -n openshift-config\n\n# Delete if it exists\noc delete secret htpass-secret -n openshift-config\n\n# Create from file\noc create secret generic htpass-secret \\\n  --from-file=htpasswd=users.htpasswd \\\n  -n openshift-config',
      },
      {
        id: 't3',
        title: 'Configure the OAuth CR',
        objective: 'Edit the cluster OAuth Custom Resource to add the HTPasswd identity provider pointing at your htpass-secret Secret.',
        hint: 'The resource to edit is: oc edit oauth cluster. Look for spec.identityProviders and add an entry of type HTPasswd.',
        help: 'oc edit oauth cluster\n\n# Add under spec.identityProviders:\n# - name: users.htpassword\n#   mappingMethod: claim\n#   type: HTPasswd\n#   htpasswd:\n#     fileData:\n#       name: htpass-secret\n\n# Or apply with a file:\noc apply -f oauth.yaml',
      },
      {
        id: 't4',
        title: 'Verify logins',
        objective: 'Log in as each user (root, alpha, beta, gamma, delta) and verify you are authenticated correctly.',
        hint: 'Use oc login with --insecure-skip-tls-verify if the cluster uses a self-signed cert. Verify identity with oc whoami after each login.',
        help: 'oc login -u alpha -p doubletap\noc whoami   # should print: alpha\n\noc login -u beta -p doubletap\noc whoami   # should print: beta\n\n# Repeat for gamma and delta',
      },
      {
        id: 't5',
        title: 'Create NewProject and assign roles',
        objective: 'Create the NewProject project. Give alpha admin, beta and gamma edit, delta view (basic-user). Give root cluster-admin. Remove kubeadmin.',
        hint: 'Use oc adm policy add-role-to-user for project-scoped roles. Use oc adm policy add-cluster-role-to-user for cluster-admin. kubeadmin is removed by deleting the kube-system/kubeadmin Secret.',
        help: '# Create project\noc new-project NewProject\n\n# Project-level roles\noc adm policy add-role-to-user admin alpha -n NewProject\noc adm policy add-role-to-user edit beta -n NewProject\noc adm policy add-role-to-user edit gamma -n NewProject\noc adm policy add-role-to-user view delta -n NewProject\n\n# Cluster-admin for root\noc adm policy add-cluster-role-to-user cluster-admin root\n\n# Login as root, then remove kubeadmin\noc login -u root -p doubletap\noc delete secret kubeadmin -n kube-system',
      },
    ],
  },

  {
    id: 'lvl1-groups',
    title: 'Groups & Custom Roles',
    level: 'Level 1',
    levelType: 'green',
    source: 'DO180 / EX280',
    desc: 'Create a project, manage user groups, grant group-level RBAC, and define a custom ClusterRole scoped to a single resource verb.',
    tasks: [
      {
        id: 't1',
        title: 'Create the snacks project',
        objective: 'Create a project called snacks.',
        hint: 'oc new-project creates a project and switches your context to it.',
        help: 'oc new-project snacks',
      },
      {
        id: 't2',
        title: 'Create a group and add members',
        objective: 'Create a group called group1. Add alpha, beta, and gamma to the group.',
        hint: 'oc adm groups new creates the group. oc adm groups add-users adds members.',
        help: 'oc adm groups new group1\noc adm groups add-users group1 alpha beta gamma\n\n# Verify\noc get group group1 -o yaml',
      },
      {
        id: 't3',
        title: 'Grant admin to group1 on snacks',
        objective: 'Grant the group1 group admin-level access to the snacks project.',
        hint: 'Use oc adm policy add-role-to-group. The group name is the subject, not a user.',
        help: 'oc adm policy add-role-to-group admin group1 -n snacks\n\n# Verify\noc get rolebinding -n snacks | grep group1',
      },
      {
        id: 't4',
        title: 'Create a custom getpods role',
        objective: 'Create a custom Role in the snacks namespace that only allows get on pods. Assign it to the user delta.',
        hint: 'Use oc create role (namespace-scoped) not oc create clusterrole. Specify --verb=get --resource=pods.',
        help: '# Create the role\noc create role getpods \\\n  --verb=get \\\n  --resource=pods \\\n  -n snacks\n\n# Assign to delta\noc adm policy add-role-to-user getpods delta \\\n  --role-namespace=snacks \\\n  -n snacks\n\n# Verify: log in as delta and test\noc login -u delta -p doubletap\noc get pods -n snacks   # should work\noc delete pod <name> -n snacks  # should be forbidden',
      },
    ],
  },

  {
    id: 'lvl1-quotas',
    title: 'ResourceQuotas & LimitRanges',
    level: 'Level 1',
    levelType: 'green',
    source: 'DO180 / Pluralsight',
    desc: 'Apply resource quotas and limit ranges to projects to enforce CPU, memory, pod, and storage constraints.',
    tasks: [
      {
        id: 't1',
        title: 'Create a ResourceQuota for zLand',
        objective: 'Apply a ResourceQuota to the zLand project: max 3 pods, 2 GB memory, 2 replication controllers, 8 services.',
        hint: 'Create a quota.yaml with kind: ResourceQuota. Use resource names: pods, memory, replicationcontrollers, services under spec.hard.',
        help: 'cat <<EOF | oc apply -f - -n zLand\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: zland-quota\nspec:\n  hard:\n    pods: "3"\n    limits.memory: 2Gi\n    replicationcontrollers: "2"\n    services: "8"\nEOF\n\n# Verify\noc describe quota zland-quota -n zLand',
      },
      {
        id: 't2',
        title: 'Create a LimitRange for twinkies',
        objective: 'Apply a LimitRange to the twinkies project: container defaults of 1 CPU request / 1 GB memory request / 4 CPU limit / 4 GB memory limit / 2 GB ephemeral-storage request / 8 GB ephemeral-storage limit.',
        hint: 'Use kind: LimitRange with spec.limits[].type: Container. Separate requests from limits with the default and defaultRequest fields.',
        help: 'cat <<EOF | oc apply -f - -n twinkies\napiVersion: v1\nkind: LimitRange\nmetadata:\n  name: twinkies-limits\nspec:\n  limits:\n  - type: Container\n    default:\n      cpu: "4"\n      memory: 4Gi\n      ephemeral-storage: 8Gi\n    defaultRequest:\n      cpu: "1"\n      memory: 1Gi\n      ephemeral-storage: 2Gi\n    max:\n      cpu: "4"\n      memory: 4Gi\n      ephemeral-storage: 8Gi\nEOF\n\noc describe limitrange twinkies-limits -n twinkies',
      },
    ],
  },

  // ── Level 2 ────────────────────────────────────────────────────────────────
  {
    id: 'lvl2-networkpolicy',
    title: 'NetworkPolicy Isolation',
    level: 'Level 2',
    levelType: 'teal',
    source: 'DO180 / EX280',
    desc: 'Write NetworkPolicy resources to restrict ingress to pods by namespace selector, pod label, and port. Also allow traffic from the ingress router for external Route access.',
    tasks: [
      {
        id: 't1',
        title: 'Namespace + pod + port ingress policy',
        objective: 'Create a NetworkPolicy that allows ingress to pods with label deployment=hello only from pods labelled deployment=sample-app in namespaces labelled network=different-namespace, on TCP port 8080.',
        hint: 'The podSelector at the top level selects what this policy protects. The ingress.from block combines namespaceSelector AND podSelector (same list entry = AND logic, separate entries = OR logic).',
        help: 'cat <<EOF | oc apply -f -\nkind: NetworkPolicy\napiVersion: networking.k8s.io/v1\nmetadata:\n  name: allow-specific-ingress\nspec:\n  podSelector:\n    matchLabels:\n      deployment: hello\n  ingress:\n    - from:\n      - namespaceSelector:\n          matchLabels:\n            network: different-namespace\n        podSelector:\n          matchLabels:\n            deployment: sample-app\n      ports:\n      - port: 8080\n        protocol: TCP\nEOF',
      },
      {
        id: 't2',
        title: 'Allow ingress router traffic (Route access)',
        objective: 'Create a NetworkPolicy that allows the OpenShift HAProxy ingress router to reach the hello pods so the Route works.',
        hint: 'The ingress router pods run in the openshift-ingress namespace. Select that namespace with a namespaceSelector matching the label network.openshift.io/policy-group=ingress.',
        help: 'cat <<EOF | oc apply -f -\nkind: NetworkPolicy\napiVersion: networking.k8s.io/v1\nmetadata:\n  name: allow-from-openshift-ingress\nspec:\n  podSelector:\n    matchLabels:\n      deployment: hello\n  ingress:\n    - from:\n      - namespaceSelector:\n          matchLabels:\n            network.openshift.io/policy-group: ingress\nEOF\n\n# Verify the route still responds\ncurl http://$(oc get route hello -o jsonpath=\'{.spec.host}\')',
      },
      {
        id: 't3',
        title: 'Collect cluster logs for support',
        objective: 'Generate a must-gather log bundle that can be uploaded to a Red Hat support case.',
        hint: 'oc adm must-gather downloads diagnostic data from all cluster operators into a local directory. The output is a tarball you upload to access.redhat.com.',
        help: '# Run must-gather (takes several minutes)\noc adm must-gather --dest-dir=./must-gather-output\n\n# Create the tarball\ntar czf must-gather-$(date +%Y%m%d).tar.gz must-gather-output/\n\n# Upload the tarball to your Red Hat support case at:\n# https://access.redhat.com/support/cases/',
      },
    ],
  },

  // ── Level 3 (App Management) ───────────────────────────────────────────────
  {
    id: 'lvl3-apps',
    title: 'Application Creation & Management',
    level: 'Level 3',
    levelType: 'purple',
    source: 'Pluralsight',
    desc: 'Deploy applications via S2I, configure Routes (plain and TLS-secured), use Secrets, create ServiceAccounts, and configure manual and automatic scaling.',
    tasks: [
      {
        id: 't1',
        title: 'Deploy app and expose with a Route',
        objective: 'In the test-app1 project, deploy an app called cake from https://github.com/sclorg/cakephp-ex and ensure it is accessible from outside the cluster.',
        hint: 'oc new-app with a Git URL triggers an S2I build. After the build completes, oc expose creates a Route.',
        help: 'oc new-project test-app1\noc new-app https://github.com/sclorg/cakephp-ex --name=cake\n\n# Wait for build\noc logs -f bc/cake\n\n# Expose with a Route\noc expose svc/cake\noc get route cake\ncurl http://$(oc get route cake -o jsonpath=\'{.spec.host}\')',
      },
      {
        id: 't2',
        title: 'Deploy app with a custom Route name',
        objective: 'In test-app2, deploy an app and create a Route named twinkiesforall.',
        hint: 'oc expose accepts --name to override the default route name derived from the service.',
        help: 'oc new-project test-app2\noc new-app https://github.com/sclorg/cakephp-ex --name=cake2\noc logs -f bc/cake2\n\noc expose svc/cake2 --name=twinkiesforall\noc get route twinkiesforall',
      },
      {
        id: 't3',
        title: 'Secured Route with a self-signed cert',
        objective: 'In test-app3, deploy an app and expose it via an edge-terminated TLS Route named mytwinkie using a self-signed certificate.',
        hint: 'Generate a self-signed cert with openssl, then use oc create route edge with --cert, --key flags.',
        help: '# Generate self-signed cert\nopenssl req -x509 -newkey rsa:4096 -keyout tls.key \\\n  -out tls.crt -days 365 -nodes \\\n  -subj "/CN=mytwinkie.apps.$(oc whoami --show-server | cut -d. -f2-)"\n\noc new-project test-app3\noc new-app https://github.com/sclorg/cakephp-ex --name=cake3\noc logs -f bc/cake3\n\n# Create edge-TLS route\noc create route edge mytwinkie \\\n  --service=cake3 \\\n  --cert=tls.crt \\\n  --key=tls.key\n\noc get route mytwinkie',
      },
      {
        id: 't4',
        title: 'Mount a Secret into an application',
        objective: 'In test-app4, create a Secret called dont-tell with user=dXN1ci1uYW11 and password=dGHcz4dvCmQ=. Deploy an app that mounts the Secret.',
        hint: 'Create the Secret with oc create secret generic using --from-literal. Mount it via oc set env --from or as a volume with oc set volume.',
        help: '# Create the Secret\noc new-project test-app4\noc create secret generic dont-tell \\\n  --from-literal=user=dXN1ci1uYW11 \\\n  --from-literal=password=dGHcz4dvCmQ=\n\n# Deploy app\noc new-app https://github.com/sclorg/cakephp-ex --name=cake4\noc logs -f bc/cake4\n\n# Mount Secret as environment variables\noc set env deployment/cake4 --from=secret/dont-tell\n\n# Verify\noc exec deployment/cake4 -- env | grep -E \'user|password\'',
      },
      {
        id: 't5',
        title: 'ServiceAccount with edit permissions',
        objective: 'In test-app5, create a ServiceAccount called madison. Deploy an app that runs as madison. Grant madison edit access to the project.',
        hint: 'oc create sa creates the ServiceAccount. Use oc set serviceaccount to assign it to a Deployment. Use oc adm policy add-role-to-user with the SA subject.',
        help: 'oc new-project test-app5\noc create sa madison\n\n# Grant edit to the SA\noc adm policy add-role-to-user edit \\\n  system:serviceaccount:test-app5:madison \\\n  -n test-app5\n\n# Deploy app\noc new-app https://github.com/sclorg/cakephp-ex --name=cake5\noc logs -f bc/cake5\n\n# Assign SA to the deployment\noc set serviceaccount deployment/cake5 madison\n\n# Verify\noc get pod -o yaml | grep serviceAccountName',
      },
      {
        id: 't6',
        title: 'Manual and automatic scaling',
        objective: 'Scale the test-app2 deployment to 2 pods manually. Configure a HorizontalPodAutoscaler on test-app5 for min=1, max=3, target 75% CPU.',
        hint: 'oc scale sets replicas directly. oc autoscale creates an HPA. CPU-based HPA requires resource requests to be set on the container.',
        help: '# Manual scale\noc scale deployment/cake2 --replicas=2 -n test-app2\noc get pods -n test-app2\n\n# Ensure resource requests are set (required for HPA)\noc set resources deployment/cake5 \\\n  --requests=cpu=100m,memory=128Mi \\\n  -n test-app5\n\n# Create HPA\noc autoscale deployment/cake5 \\\n  --min=1 --max=3 \\\n  --cpu-percent=75 \\\n  -n test-app5\n\n# Check HPA status\noc get hpa -n test-app5',
      },
    ],
  },
]
