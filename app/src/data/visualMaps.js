export const visualMaps = [
  {
    id: 'cluster-architecture', category: 'architecture', title: 'OpenShift Cluster Architecture',
    summary: 'See how users, control plane services, and worker nodes cooperate.',
    mentalModel: 'The control plane decides and records; worker nodes execute.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/architecture/control-plane',
    sourceLabel: 'Red Hat control plane architecture',
    secondarySourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html-single/architecture/index#architecture-platform-introduction_architecture',
    secondarySourceLabel: 'Red Hat architecture visual guide',
    topicId: 'k8s-arch',
    stages: [
      { label: 'People & automation', nodes: [
        { id: 'clients', label: 'oc / Web Console', subtitle: 'Intent enters here', detail: 'Administrators, developers, controllers, and CI systems submit desired state through the Kubernetes and OpenShift APIs.', command: 'oc whoami --show-server' },
      ] },
      { label: 'Control plane', nodes: [
        { id: 'api', label: 'API servers', subtitle: 'Validate and expose state', detail: 'The Kubernetes API server is the front door for resource operations. OpenShift APIs add Routes, Projects, Builds, and other platform resources.', command: 'oc api-resources' },
        { id: 'etcd', label: 'etcd', subtitle: 'Persistent cluster state', detail: 'etcd stores the authoritative state of Kubernetes resources. Controllers watch that state and continually reconcile toward it.', command: 'oc get etcd -o wide' },
        { id: 'controllers', label: 'Scheduler & controllers', subtitle: 'Decide and reconcile', detail: 'The scheduler assigns unscheduled pods to nodes. Controllers compare desired and actual state, then create or update resources.', command: 'oc get clusteroperators' },
      ] },
      { label: 'Worker nodes', nodes: [
        { id: 'kubelet', label: 'kubelet', subtitle: 'Node agent', detail: 'The kubelet watches pods assigned to its node and asks the container runtime to keep their containers running.', command: 'oc get nodes -o wide' },
        { id: 'crio', label: 'CRI-O + crun', subtitle: 'Run containers', detail: 'CRI-O implements the Kubernetes container runtime interface; crun or runC creates the low-level container processes.', command: 'oc debug node/<node>' },
        { id: 'workloads', label: 'Pods & workloads', subtitle: 'Application execution', detail: 'Pods run application containers and supporting sidecars. Higher-level controllers replace them when they fail.', command: 'oc get pods -A -o wide' },
      ] },
    ],
  },
  {
    id: 'workload-hierarchy', category: 'workloads', title: 'Workload Ownership Chain',
    summary: 'Build a mental tree from a cluster down to a running container.',
    mentalModel: 'Edit the highest controller you own—not the disposable child it creates.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/building_applications/deployments',
    topicId: 'deployments',
    stages: [
      { label: 'Scope', nodes: [
        { id: 'project', label: 'Project / Namespace', subtitle: 'Isolation boundary', detail: 'Namespaces scope names, RBAC, quotas, and most application resources. OpenShift Projects add platform metadata to namespaces.', command: 'oc project <name>' },
      ] },
      { label: 'Desired workload', nodes: [
        { id: 'deployment', label: 'Deployment', subtitle: 'Rollout strategy', detail: 'A Deployment declares the pod template, replica count, and rolling-update behavior. Change this object for application updates.', command: 'oc rollout status deploy/<name>' },
      ] },
      { label: 'Revision', nodes: [
        { id: 'replicaset', label: 'ReplicaSet', subtitle: 'One pod-template revision', detail: 'Deployments create ReplicaSets for each revision. ReplicaSets maintain the requested number of matching pods.', command: 'oc get rs' },
      ] },
      { label: 'Execution', nodes: [
        { id: 'pod', label: 'Pod', subtitle: 'Scheduling unit', detail: 'A pod is assigned to one node and wraps one or more containers sharing networking and volumes. Treat controller-owned pods as replaceable.', command: 'oc get pod <name> -o yaml' },
        { id: 'container', label: 'Container', subtitle: 'Application process', detail: 'Containers inside a pod share its IP and can share mounted volumes, but retain separate filesystems and resource limits.', command: 'oc logs <pod> -c <container>' },
      ] },
    ],
  },
  {
    id: 'route-request-flow', category: 'networking', title: 'External Route Request Flow',
    summary: 'Trace a browser request from DNS to the application container.',
    mentalModel: 'Route chooses the Service; Service chooses healthy pod endpoints.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/ingress_and_load_balancing/configuring-routes',
    topicId: 'services',
    stages: [
      { label: 'Outside cluster', nodes: [
        { id: 'dns', label: 'DNS + client', subtitle: 'Resolve app hostname', detail: 'The application hostname resolves to the cluster ingress load balancer. The client sends HTTP or HTTPS traffic to that address.', command: 'dig <route-host>' },
      ] },
      { label: 'Ingress', nodes: [
        { id: 'router', label: 'IngressController / Router', subtitle: 'Terminate or pass TLS', detail: 'OpenShift router pods receive the request and match its host and path against Route resources.', command: 'oc get ingresscontroller -n openshift-ingress-operator' },
        { id: 'route', label: 'Route', subtitle: 'Host → Service', detail: 'A Route exposes a Service and defines hostname, path, TLS termination, and optional traffic weighting.', command: 'oc describe route <name>' },
      ] },
      { label: 'Application network', nodes: [
        { id: 'service', label: 'Service', subtitle: 'Stable virtual endpoint', detail: 'The Service selector identifies application pods and provides a stable ClusterIP and port mapping.', command: 'oc describe svc <name>' },
        { id: 'endpoints', label: 'EndpointSlice', subtitle: 'Ready pod addresses', detail: 'EndpointSlices contain the ready backend pod IPs selected by the Service. An empty list usually means labels or readiness are wrong.', command: 'oc get endpointslice -l kubernetes.io/service-name=<service>' },
        { id: 'routepod', label: 'Ready Pod', subtitle: 'Handle request', detail: 'Traffic reaches a ready pod on the Service target port, then the container process must listen on that port.', command: 'oc get pod -l app=<label> -o wide' },
      ] },
    ],
  },
  {
    id: 'ovn-ovs-three-node', category: 'networking', title: 'OVN-Kubernetes / OVS: Three-Node Map',
    summary: 'See how logical networking, per-node OVS bridges, and the Geneve overlay connect pods across three nodes.',
    mentalModel: 'OVN describes the logical network; ovn-controller programs OVS on every node; Geneve carries pod traffic between nodes.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/ovn-kubernetes_network_plugin/about-ovn-kubernetes',
    sourceLabel: 'Red Hat OVN-Kubernetes guide',
    secondarySourceUrl: 'https://ovn-kubernetes.io/design/topology/',
    secondarySourceLabel: 'OVN-Kubernetes topology design',
    sourceNote: 'Original interactive synthesis based on current Red Hat and OVN-Kubernetes documentation.',
    referenceImage: 'visuals/ovn-kubernetes-ovs-traffic-flow.webp',
    referenceImageAlt: 'Two-node OVN-Kubernetes traffic flow showing pods connected through veth pairs and Open vSwitch, the OVN control plane databases, logical switches and router, a Geneve overlay tunnel, and the physical underlay network.',
    referenceImageTitle: 'OVN-Kubernetes / OVS detailed traffic flow',
    referenceImageCaption: 'Two-node reference view. Follow Pod A through veth, OVS, the OVN logical switches and router, the Geneve overlay, and OVS on Node 2 to Pod B. Addresses are illustrative.',
    topicId: 'networking-advanced',
    layout: 'three-node',
    shared: {
      label: 'Logical network control',
      nodes: [
        { id: 'ovn-intent', label: 'Kubernetes network intent', subtitle: 'Pods, Services, policies, routes', detail: 'OpenShift and Kubernetes resources describe the desired network: pod attachment, Services, NetworkPolicies, egress behavior, and gateway configuration.', command: 'oc get network.operator cluster -o yaml' },
        { id: 'ovn-logical', label: 'OVN logical topology', subtitle: 'Switches, routers, ports, load balancers', detail: 'OVN models the cluster as logical switches, routers, ports, and load balancers. Node controllers translate this logical state into local forwarding behavior.', command: 'oc get pods -n openshift-ovn-kubernetes -o wide' },
      ],
    },
    connectionLabel: 'Geneve overlay / OVN transit path',
    externalLabel: 'Physical network through each node gateway and OVS br-ex',
    stages: [
      { label: 'Node 1', nodes: [
        { id: 'node1-pods', label: 'Pods + logical switch ports', subtitle: 'Pod IPs on the overlay', detail: 'Pods attach to the node-local logical switch. Their interfaces become OVN logical switch ports and receive addresses from the cluster network.', command: 'oc get pods -A -o wide --field-selector spec.nodeName=<node-1>' },
        { id: 'node1-ovs', label: 'ovn-controller → OVS', subtitle: 'Programs local OpenFlow rules', detail: 'The node-local OVN controller converts logical network state into OpenFlow rules in Open vSwitch. OVS then forwards pod, Service, policy, and gateway traffic.', command: 'oc debug node/<node-1> -- chroot /host ovs-vsctl show' },
        { id: 'node1-gateway', label: 'Gateway router + br-ex', subtitle: 'North-south traffic', detail: 'The node gateway connects the overlay to the external network. The OVS br-ex bridge provides the node-facing connection to the physical network.', command: 'oc debug node/<node-1> -- chroot /host ovs-vsctl list-br' },
      ] },
      { label: 'Node 2', nodes: [
        { id: 'node2-pods', label: 'Pods + logical switch ports', subtitle: 'Pod IPs on the overlay', detail: 'Node 2 has its own node-local pod switch and logical ports. OVN routing makes these pod addresses reachable from the other node zones.', command: 'oc get pods -A -o wide --field-selector spec.nodeName=<node-2>' },
        { id: 'node2-ovs', label: 'ovn-controller → OVS', subtitle: 'Programs local OpenFlow rules', detail: 'OVS on Node 2 independently enforces the forwarding decisions generated for this node, including network policy and Service traffic behavior.', command: 'oc debug node/<node-2> -- chroot /host ovs-ofctl dump-flows br-int' },
        { id: 'node2-gateway', label: 'Gateway router + br-ex', subtitle: 'North-south traffic', detail: 'The gateway path handles traffic entering or leaving the cluster network according to the configured gateway mode and routing behavior.', command: 'oc debug node/<node-2> -- chroot /host ovs-vsctl show' },
      ] },
      { label: 'Node 3', nodes: [
        { id: 'node3-pods', label: 'Pods + logical switch ports', subtitle: 'Pod IPs on the overlay', detail: 'Node 3 follows the same pattern. The repeated node-local design makes the topology easier to reason about and limits node-specific forwarding work to that node.', command: 'oc get pods -A -o wide --field-selector spec.nodeName=<node-3>' },
        { id: 'node3-ovs', label: 'ovn-controller → OVS', subtitle: 'Programs local OpenFlow rules', detail: 'The OVN controller watches logical state and keeps the local OVS flows synchronized as pods, Services, endpoints, and policies change.', command: 'oc debug node/<node-3> -- chroot /host ovs-ofctl dump-flows br-int' },
        { id: 'node3-gateway', label: 'Gateway router + br-ex', subtitle: 'North-south traffic', detail: 'Node 3 also exposes a gateway connection to the physical network, while Geneve encapsulation carries east-west overlay traffic between nodes.', command: 'oc debug node/<node-3> -- chroot /host ovs-vsctl list-ports br-ex' },
      ] },
    ],
  },
  {
    id: 'storage-provisioning', category: 'storage', title: 'Dynamic Storage Provisioning',
    summary: 'Follow a storage request from application intent to a mounted backend volume.',
    mentalModel: 'PVC asks, StorageClass describes, CSI creates, PV records, Pod mounts.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/storage/dynamic-provisioning',
    topicId: 'storage',
    stages: [
      { label: 'Application asks', nodes: [
        { id: 'pvc', label: 'PersistentVolumeClaim', subtitle: 'Size + access + class', detail: 'A PVC expresses the application storage requirement without requiring knowledge of the physical storage backend.', command: 'oc describe pvc <name>' },
      ] },
      { label: 'Cluster provisions', nodes: [
        { id: 'sc', label: 'StorageClass', subtitle: 'Provisioning policy', detail: 'The StorageClass names the CSI provisioner and supplies backend parameters, reclaim policy, binding mode, and expansion behavior.', command: 'oc get storageclass' },
        { id: 'csi', label: 'CSI provisioner', subtitle: 'Backend integration', detail: 'The CSI driver calls the storage system to create a volume matching the request.', command: 'oc get csidriver' },
      ] },
      { label: 'Storage binds', nodes: [
        { id: 'pv', label: 'PersistentVolume', subtitle: 'Cluster volume record', detail: 'The dynamically created PV represents the backend volume and binds one-to-one with the PVC.', command: 'oc get pv,pvc' },
        { id: 'backend', label: 'Storage backend', subtitle: 'Disk, file, or object system', detail: 'The actual storage may live in a cloud block service, SAN, NAS, or OpenShift Data Foundation.', command: 'oc get storagecluster -n openshift-storage' },
      ] },
      { label: 'Application uses', nodes: [
        { id: 'mount', label: 'Pod volume mount', subtitle: 'Filesystem inside container', detail: 'The scheduler and CSI node plugin attach and mount the bound volume on the selected node for the pod.', command: 'oc describe pod <name>' },
      ] },
    ],
  },
  {
    id: 'operator-lifecycle', category: 'operations', title: 'Operator Lifecycle Manager',
    summary: 'See how an Operator moves from catalog metadata to active reconciliation.',
    mentalModel: 'Catalog offers, Subscription requests, InstallPlan executes, CSV describes.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/observability/operators/olm-v1',
    topicId: 'operators-olm',
    stages: [
      { label: 'Discover', nodes: [
        { id: 'catalog', label: 'CatalogSource', subtitle: 'Available bundles', detail: 'A CatalogSource makes Operator packages, channels, versions, and dependencies available to OLM.', command: 'oc get catalogsource -n openshift-marketplace' },
      ] },
      { label: 'Request', nodes: [
        { id: 'subscription', label: 'Subscription', subtitle: 'Package + channel intent', detail: 'A Subscription chooses a package, channel, source, and automatic or manual approval strategy.', command: 'oc get subscription -A' },
      ] },
      { label: 'Install', nodes: [
        { id: 'installplan', label: 'InstallPlan', subtitle: 'Resources to apply', detail: 'OLM resolves dependencies and creates an InstallPlan. Manual plans wait for explicit approval.', command: 'oc get installplan -A' },
        { id: 'csv', label: 'ClusterServiceVersion', subtitle: 'Installed version metadata', detail: 'The CSV describes the Operator deployment, owned CRDs, permissions, version, and lifecycle status.', command: 'oc get csv -A' },
      ] },
      { label: 'Operate', nodes: [
        { id: 'operator', label: 'Operator controller', subtitle: 'Watch and reconcile', detail: 'The installed controller watches its custom resources and drives the managed application toward the requested state.', command: 'oc get deployment -n <operator-namespace>' },
        { id: 'customresource', label: 'Custom Resource', subtitle: 'Product-specific intent', detail: 'Users create custom resources such as a DataProtectionApplication or StorageCluster; the Operator implements them.', command: 'oc api-resources --api-group=<group>' },
      ] },
    ],
  },
  {
    id: 'gitops-loop', category: 'operations', title: 'GitOps Reconciliation Loop',
    summary: 'Understand why GitOps is a continuous control loop rather than a one-time deployment.',
    mentalModel: 'Git is desired state; Argo CD compares, applies, observes, and repeats.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/red_hat_openshift_gitops/1.18/html/understanding_openshift_gitops/about-redhat-openshift-gitops',
    topicId: 'gitops-argocd',
    stages: [
      { label: 'Declare', nodes: [
        { id: 'git', label: 'Git repository', subtitle: 'Desired manifests', detail: 'Git stores versioned Kubernetes YAML, Helm charts, or Kustomize overlays and provides the audit trail for changes.', command: 'git log --oneline' },
      ] },
      { label: 'Compare', nodes: [
        { id: 'application', label: 'Argo CD Application', subtitle: 'Source + destination', detail: 'The Application points to a Git path and target cluster/namespace, then reports Synced and Healthy status.', command: 'oc get applications.argoproj.io -A' },
        { id: 'diff', label: 'Desired ↔ Live diff', subtitle: 'Detect drift', detail: 'Argo CD continually compares rendered Git resources with live API objects and identifies drift.', command: 'argocd app diff <app>' },
      ] },
      { label: 'Reconcile', nodes: [
        { id: 'sync', label: 'Sync', subtitle: 'Apply required changes', detail: 'Manual or automated sync creates, updates, and optionally prunes resources to match Git.', command: 'argocd app sync <app>' },
        { id: 'health', label: 'Health assessment', subtitle: 'Observe outcomes', detail: 'Argo CD watches workloads and reports whether resources are progressing, healthy, degraded, missing, or unknown.', command: 'argocd app get <app>' },
      ] },
    ],
  },
  {
    id: 'backup-restore', category: 'data-protection', title: 'OADP / Velero Backup Paths',
    summary: 'Separate Kubernetes metadata protection from persistent-volume data protection.',
    mentalModel: 'Objects go to object storage; volume data goes by snapshot or file backup.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/backup_and_restore/backup-restore-overview',
    topicId: 'application-backup-recovery',
    stages: [
      { label: 'Request', nodes: [
        { id: 'dpa', label: 'DataProtectionApplication', subtitle: 'OADP configuration', detail: 'The DPA configures Velero, credentials, backup locations, snapshot locations, and node-agent behavior.', command: 'oc get dpa -n openshift-adp' },
        { id: 'backupcr', label: 'Backup / Schedule CR', subtitle: 'What and when', detail: 'Backup resources select namespaces, labels, resource types, hooks, and volume-protection behavior.', command: 'oc get backup,schedule -n openshift-adp' },
      ] },
      { label: 'Orchestrate', nodes: [
        { id: 'velero', label: 'Velero controller', subtitle: 'Coordinate backup', detail: 'Velero discovers selected Kubernetes objects, invokes plugins, and records backup phase and errors.', command: 'oc logs deployment/velero -n openshift-adp' },
      ] },
      { label: 'Protect objects', nodes: [
        { id: 'objectstore', label: 'Object storage', subtitle: 'Resource archive + metadata', detail: 'Kubernetes resource archives and backup metadata are stored in an S3-compatible backup location.', command: 'oc get backupstoragelocation -n openshift-adp' },
      ] },
      { label: 'Protect volume data', nodes: [
        { id: 'snapshot', label: 'CSI / native snapshot', subtitle: 'Storage-level copy', detail: 'A compatible CSI or cloud snapshot API captures persistent volumes efficiently at the storage layer.', command: 'oc get volumesnapshot -A' },
        { id: 'fsb', label: 'File System Backup', subtitle: 'Kopia or Restic copy', detail: 'The node agent copies files from mounted pod volumes when storage snapshots are unavailable or unsuitable.', command: 'oc get podvolumebackup -n openshift-adp' },
      ] },
    ],
  },
  {
    id: 'mtv-migration', category: 'virtualization', title: 'MTV Migration Pipeline',
    summary: 'Map the journey from a source provider to an OpenShift Virtualization VM.',
    mentalModel: 'Provider supplies, Plan selects and maps, Migration copies and converts, KubeVirt runs.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.12/html/planning_your_migration_to_red_hat_openshift_virtualization/assembly_cold-warm-migration_mtv',
    topicId: null,
    stages: [
      { label: 'Inventory', nodes: [
        { id: 'provider', label: 'Source Provider', subtitle: 'VMware, RHV, OVA, or OpenStack', detail: 'MTV connects to a source provider and inventories virtual machines, networks, and storage.', command: 'oc get providers.forklift.konveyor.io -A' },
      ] },
      { label: 'Design', nodes: [
        { id: 'maps', label: 'Network & Storage Maps', subtitle: 'Translate dependencies', detail: 'Maps connect source networks and datastores to destination NetworkAttachmentDefinitions and StorageClasses.', command: 'oc get networkmap,storagemap -A' },
        { id: 'plan', label: 'Migration Plan', subtitle: 'VMs + mappings + mode', detail: 'The Plan selects VMs and binds provider, network, storage, hooks, and cold or warm migration choices.', command: 'oc get plans.forklift.konveyor.io -A' },
      ] },
      { label: 'Move', nodes: [
        { id: 'copy', label: 'Disk transfer', subtitle: 'Cold copy or warm precopy', detail: 'Cold migration powers off first. Warm migration performs precopies before a final cutover window.', command: 'oc get migrations.forklift.konveyor.io -A' },
        { id: 'convert', label: 'Conversion', subtitle: 'Adapt guest and disks', detail: 'MTV converts disk formats and guest configuration when required for KubeVirt compatibility.', command: 'oc logs -n openshift-mtv -l app=virt-v2v' },
      ] },
      { label: 'Run', nodes: [
        { id: 'vm', label: 'OpenShift Virtualization VM', subtitle: 'Destination workload', detail: 'The resulting VirtualMachine references migrated DataVolumes, destination networks, and KubeVirt devices.', command: 'oc get vm,vmi,dv -A' },
      ] },
    ],
  },
  {
    id: 'troubleshooting-funnel', category: 'troubleshooting', title: 'Troubleshooting Funnel',
    summary: 'Move from broad symptoms to the smallest failing layer without guessing.',
    mentalModel: 'State → Events → Logs → Dependencies → Node or Operator.',
    sourceUrl: 'https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/support/troubleshooting',
    topicId: 'debug-workflows',
    stages: [
      { label: 'Observe', nodes: [
        { id: 'state', label: 'Current state', subtitle: 'What is not Ready?', detail: 'Start with resource status, conditions, restart counts, node placement, and cluster operator health.', command: 'oc get all -n <namespace>' },
      ] },
      { label: 'Explain', nodes: [
        { id: 'describe', label: 'Describe + Events', subtitle: 'Why did Kubernetes act?', detail: 'Conditions and chronological events reveal scheduling failures, probe failures, mount problems, and image errors.', command: 'oc describe pod <pod>' },
      ] },
      { label: 'Inspect process', nodes: [
        { id: 'logs', label: 'Current & previous logs', subtitle: 'What did the process report?', detail: 'Read the correct container logs. For crash loops, previous logs often contain the only useful failure message.', command: 'oc logs <pod> -c <container> --previous' },
      ] },
      { label: 'Trace dependencies', nodes: [
        { id: 'network', label: 'Service, DNS, config, storage', subtitle: 'Can dependencies connect?', detail: 'Verify selectors, endpoints, ports, DNS, mounted configuration, secrets, PVC binding, and NetworkPolicies.', command: 'oc get svc,endpointslice,pvc,networkpolicy' },
      ] },
      { label: 'Escalate layer', nodes: [
        { id: 'nodeop', label: 'Node or Operator', subtitle: 'Is the platform layer unhealthy?', detail: 'If multiple workloads share the symptom, inspect node conditions, cluster operators, machine configuration, and must-gather data.', command: 'oc get nodes,clusteroperators' },
      ] },
    ],
  },
]
