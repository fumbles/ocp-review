// ═══════════════════════════════════════════════════════════════════════════════
// LEARN DATA
// ═══════════════════════════════════════════════════════════════════════════════
const topics = [
{id:'k8s-arch', label:'K8s Architecture', content: `
<h3>Kubernetes Architecture</h3>
<p class="topic-desc">Kubernetes (K8s) is an open-source container orchestration platform. OpenShift is Red Hat's enterprise distribution built on top of Kubernetes, adding developer and operational features.</p>

<div class="section-title">Control Plane Components</div>
<div class="definition-card"><h4>kube-apiserver</h4><p>The front door to the cluster. All management operations (kubectl, oc, web console) communicate with the API server. It validates and persists objects to etcd. Stateless — can run multiple replicas.</p></div>
<div class="definition-card"><h4>etcd</h4><p>Distributed key-value store that holds the entire cluster state. Every resource definition, status, and secret lives in etcd. Should be backed up regularly. Uses Raft consensus for data consistency.</p></div>
<div class="definition-card"><h4>kube-scheduler</h4><p>Assigns Pods to Nodes. Evaluates resource requests, node selectors, taints/tolerations, affinity rules, and available capacity. Does NOT start the pod — just picks the node.</p></div>
<div class="definition-card"><h4>kube-controller-manager</h4><p>Runs control loops (controllers) that watch the desired state and reconcile actual state. Includes: Node controller, ReplicaSet controller, Endpoints controller, etc. "Desired state drives actual state."</p></div>

<div class="section-title">Worker Node Components</div>
<div class="definition-card"><h4>kubelet</h4><p>Agent running on every node. Reads PodSpecs assigned to its node by the scheduler and ensures the described containers are running and healthy. Reports node and pod status back to the API server.</p></div>
<div class="definition-card"><h4>kube-proxy</h4><p>Network proxy on each node. Maintains iptables/IPVS rules to route traffic to correct Pod IPs for Services. Enables the virtual IP abstraction of Services.</p></div>
<div class="definition-card"><h4>Container Runtime</h4><p>Software that actually runs containers. OpenShift 4.x uses <code>CRI-O</code> (Container Runtime Interface - OCI). It pulls images, manages container lifecycle, and implements the CRI spec the kubelet talks to.</p></div>

<div class="section-title">OpenShift Additions</div>
<div class="definition-card"><h4>OpenShift API Server</h4><p>Extends the Kubernetes API with OpenShift-specific resources: Routes, Projects, ImageStreams, BuildConfigs, etc. Runs alongside kube-apiserver.</p></div>
<div class="definition-card"><h4>Web Console</h4><p>Browser-based UI at <code>https://console-openshift-console.apps.&lt;cluster&gt;</code>. Provides Developer and Administrator perspectives for managing all cluster resources.</p></div>

<div class="section-title">Key Concepts</div>
<div class="tip"><strong>💡 OpenShift vs Kubernetes:</strong> OpenShift Projects = Kubernetes Namespaces (with extra metadata). <code>oc</code> is a superset of <code>kubectl</code> — all kubectl commands work with oc.</div>
<pre><span class="c"># Check cluster version</span>
oc version
oc get clusterversion

<span class="c"># View all nodes</span>
oc get nodes
oc get nodes -o wide   <span class="c"># includes IP, OS, kernel</span>

<span class="c"># Describe a node for resource info</span>
oc describe node &lt;node-name&gt;</pre>
`},

{id:'pods', label:'Pods & Containers', content:`
<h3>Pods &amp; Containers</h3>
<p class="topic-desc">A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share the same network namespace and storage volumes.</p>

<div class="section-title">Pod Fundamentals</div>
<div class="definition-card"><h4>Pod</h4><p>One or more containers co-located on the same node, sharing a network namespace (same IP), storage volumes, and lifecycle. Containers in a pod communicate over <code>localhost</code>. Pods are ephemeral — they are created and destroyed, not updated in place.</p></div>
<div class="definition-card"><h4>Init Containers</h4><p>Special containers that run to completion before app containers start. Used for setup tasks: waiting for a DB to be ready, populating shared volumes, running migrations. If an init container fails, the pod restarts.</p></div>
<div class="definition-card"><h4>Sidecar Pattern</h4><p>A secondary container that extends or supports the main container — e.g., a logging agent, service mesh proxy, or config reloader. Shares the pod's lifecycle and volumes.</p></div>

<div class="section-title">Pod Lifecycle States</div>
<table class="cmd-table">
<tr><th>Phase</th><th>Meaning</th></tr>
<tr><td>Pending</td><td>Accepted but containers not yet running (scheduling, image pull)</td></tr>
<tr><td>Running</td><td>At least one container is running</td></tr>
<tr><td>Succeeded</td><td>All containers exited with status 0 (Jobs)</td></tr>
<tr><td>Failed</td><td>All containers exited, at least one with non-zero status</td></tr>
<tr><td>Unknown</td><td>Node communication failure</td></tr>
<tr><td>CrashLoopBackOff</td><td>Container keeps crashing; kubelet backs off restart timing</td></tr>
</table>

<div class="section-title">Pod Manifest Example</div>
<pre><span class="p">apiVersion:</span> v1
<span class="p">kind:</span> Pod
<span class="p">metadata:</span>
  <span class="p">name:</span> my-app
  <span class="p">labels:</span>
    <span class="p">app:</span> my-app
<span class="p">spec:</span>
  <span class="p">containers:</span>
  - <span class="p">name:</span> app
    <span class="p">image:</span> registry.access.redhat.com/ubi9/httpd-24:latest
    <span class="p">ports:</span>
    - <span class="p">containerPort:</span> 8080
    <span class="p">resources:</span>
      <span class="p">requests:</span>
        <span class="p">memory:</span> <span class="s">"64Mi"</span>
        <span class="p">cpu:</span> <span class="s">"250m"</span>
      <span class="p">limits:</span>
        <span class="p">memory:</span> <span class="s">"128Mi"</span>
        <span class="p">cpu:</span> <span class="s">"500m"</span>
    <span class="p">env:</span>
    - <span class="p">name:</span> ENV_VAR
      <span class="p">value:</span> <span class="s">"production"</span></pre>

<div class="section-title">Essential Pod Commands</div>
<table class="cmd-table">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>oc get pods</td><td>List pods in current project</td></tr>
<tr><td>oc get pods -A</td><td>List pods across all namespaces</td></tr>
<tr><td>oc describe pod &lt;name&gt;</td><td>Full pod details, events, conditions</td></tr>
<tr><td>oc logs &lt;pod&gt;</td><td>Container stdout/stderr</td></tr>
<tr><td>oc logs &lt;pod&gt; -c &lt;container&gt;</td><td>Logs from specific container</td></tr>
<tr><td>oc logs &lt;pod&gt; --previous</td><td>Logs from previous crashed container</td></tr>
<tr><td>oc exec -it &lt;pod&gt; -- bash</td><td>Interactive shell in pod</td></tr>
<tr><td>oc exec &lt;pod&gt; -- &lt;cmd&gt;</td><td>Run command in pod</td></tr>
<tr><td>oc delete pod &lt;name&gt;</td><td>Delete pod (recreated if managed)</td></tr>
<tr><td>oc run &lt;name&gt; --image=&lt;img&gt;</td><td>Create a pod imperatively</td></tr>
</table>
<div class="warn"><strong>⚠️ Important:</strong> Deleting a pod managed by a Deployment or ReplicaSet simply triggers a new pod to be created. To remove permanently, delete the Deployment.</div>
`},

{id:'deployments', label:'Deployments & ReplicaSets', content:`
<h3>Deployments &amp; ReplicaSets</h3>
<p class="topic-desc">Deployments manage stateless application workloads by maintaining a desired number of pod replicas and enabling rolling updates with rollback capability.</p>

<div class="section-title">Resource Hierarchy</div>
<div class="definition-card"><h4>Deployment</h4><p>Declares desired state: what image to run, how many replicas, update strategy. Manages ReplicaSets — creates new ones on update, scales down old ones. The primary way to run stateless applications.</p></div>
<div class="definition-card"><h4>ReplicaSet</h4><p>Ensures a specified number of Pod replicas run at all times. Owned by a Deployment. Rarely created directly — use Deployments. Uses label selectors to identify its pods.</p></div>
<div class="definition-card"><h4>DeploymentConfig (OpenShift)</h4><p>OpenShift-specific predecessor to Deployment. Adds triggers (image change, config change) and lifecycle hooks. In OCP 4.14+, Deployments are preferred. <code>dc</code> is the short form.</p></div>

<div class="section-title">Deployment Manifest</div>
<pre><span class="p">apiVersion:</span> apps/v1
<span class="p">kind:</span> Deployment
<span class="p">metadata:</span>
  <span class="p">name:</span> webapp
  <span class="p">namespace:</span> myproject
<span class="p">spec:</span>
  <span class="p">replicas:</span> 3
  <span class="p">selector:</span>
    <span class="p">matchLabels:</span>
      <span class="p">app:</span> webapp
  <span class="p">strategy:</span>
    <span class="p">type:</span> RollingUpdate
    <span class="p">rollingUpdate:</span>
      <span class="p">maxUnavailable:</span> 1     <span class="c"># pods that can be down during update</span>
      <span class="p">maxSurge:</span> 1            <span class="c"># extra pods during update</span>
  <span class="p">template:</span>
    <span class="p">metadata:</span>
      <span class="p">labels:</span>
        <span class="p">app:</span> webapp
    <span class="p">spec:</span>
      <span class="p">containers:</span>
      - <span class="p">name:</span> webapp
        <span class="p">image:</span> quay.io/myorg/webapp:v2
        <span class="p">ports:</span>
        - <span class="p">containerPort:</span> 8080</pre>

<div class="section-title">Update Strategies</div>
<table class="cmd-table">
<tr><th>Strategy</th><th>Behavior</th><th>Downtime</th></tr>
<tr><td>RollingUpdate</td><td>Gradually replaces old pods with new ones</td><td>None (with overlap)</td></tr>
<tr><td>Recreate</td><td>Kills all old pods, then starts new ones</td><td>Yes</td></tr>
</table>

<div class="section-title">Deployment Commands</div>
<table class="cmd-table">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>oc create deployment &lt;name&gt; --image=&lt;img&gt;</td><td>Create deployment imperatively</td></tr>
<tr><td>oc scale deployment &lt;name&gt; --replicas=5</td><td>Scale to 5 replicas</td></tr>
<tr><td>oc set image deployment/&lt;name&gt; &lt;c&gt;=&lt;img&gt;</td><td>Update container image (triggers rollout)</td></tr>
<tr><td>oc rollout status deployment/&lt;name&gt;</td><td>Watch rollout progress</td></tr>
<tr><td>oc rollout history deployment/&lt;name&gt;</td><td>List revisions</td></tr>
<tr><td>oc rollout undo deployment/&lt;name&gt;</td><td>Roll back to previous revision</td></tr>
<tr><td>oc rollout undo deployment/&lt;name&gt; --to-revision=2</td><td>Roll back to specific revision</td></tr>
<tr><td>oc rollout pause deployment/&lt;name&gt;</td><td>Pause updates</td></tr>
<tr><td>oc rollout resume deployment/&lt;name&gt;</td><td>Resume updates</td></tr>
</table>
<div class="tip"><strong>💡 Pro tip:</strong> Use <code>oc set env deployment/&lt;name&gt; KEY=value</code> to add environment variables — this also triggers a rollout.</div>
`},

{id:'services', label:'Services & Networking', content:`
<h3>Services &amp; Networking</h3>
<p class="topic-desc">Services provide stable network endpoints for pods. Since pods are ephemeral with changing IPs, Services give a consistent DNS name and IP to reach a set of pods via label selectors.</p>

<div class="section-title">Service Types</div>
<div class="definition-card"><h4>ClusterIP (default)</h4><p>Exposes the service on a cluster-internal IP. Only reachable within the cluster. DNS: <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>. The base type — other types build on it.</p></div>
<div class="definition-card"><h4>NodePort</h4><p>Exposes the service on each node's IP at a static port (30000–32767). External traffic: <code>NodeIP:NodePort</code>. Not recommended for production — use Routes or LoadBalancer.</p></div>
<div class="definition-card"><h4>LoadBalancer</h4><p>Provisions an external load balancer (cloud provider). Gives a public IP. On bare-metal OpenShift, use MetalLB or the Ingress operator instead.</p></div>
<div class="definition-card"><h4>ExternalName</h4><p>Maps the service to a DNS name (CNAME). No proxying. Used to abstract external dependencies: <code>db.example.com</code> → <code>database.myproject.svc</code>.</p></div>

<div class="section-title">OpenShift Routes</div>
<div class="definition-card"><h4>Route</h4><p>OpenShift-specific resource that exposes a Service to external traffic via the HAProxy-based Ingress Router. Supports TLS termination, path-based routing, and hostname-based virtual hosting. Routes are the standard way to expose apps externally in OpenShift.</p></div>

<div class="section-title">Service &amp; Route Manifests</div>
<pre><span class="c"># Service</span>
<span class="p">apiVersion:</span> v1
<span class="p">kind:</span> Service
<span class="p">metadata:</span>
  <span class="p">name:</span> webapp
<span class="p">spec:</span>
  <span class="p">selector:</span>
    <span class="p">app:</span> webapp      <span class="c"># matches pods with this label</span>
  <span class="p">ports:</span>
  - <span class="p">port:</span> 80          <span class="c"># service port</span>
    <span class="p">targetPort:</span> 8080  <span class="c"># pod port</span>
---
<span class="c"># Route (OpenShift)</span>
<span class="p">apiVersion:</span> route.openshift.io/v1
<span class="p">kind:</span> Route
<span class="p">metadata:</span>
  <span class="p">name:</span> webapp
<span class="p">spec:</span>
  <span class="p">to:</span>
    <span class="p">kind:</span> Service
    <span class="p">name:</span> webapp
  <span class="p">port:</span>
    <span class="p">targetPort:</span> 8080
  <span class="p">tls:</span>
    <span class="p">termination:</span> edge   <span class="c"># edge | passthrough | reencrypt</span></pre>

<div class="section-title">TLS Termination Types</div>
<table class="cmd-table">
<tr><th>Type</th><th>Description</th></tr>
<tr><td>edge</td><td>TLS terminated at the router; traffic to pod is plain HTTP</td></tr>
<tr><td>passthrough</td><td>Encrypted all the way to the pod; router doesn't decrypt</td></tr>
<tr><td>reencrypt</td><td>Router decrypts then re-encrypts to the pod</td></tr>
</table>

<div class="section-title">Networking Commands</div>
<table class="cmd-table">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>oc expose svc/&lt;name&gt;</td><td>Create Route from Service</td></tr>
<tr><td>oc expose svc/&lt;name&gt; --hostname=app.example.com</td><td>Custom hostname</td></tr>
<tr><td>oc get routes</td><td>List all routes + URLs</td></tr>
<tr><td>oc get svc</td><td>List services</td></tr>
<tr><td>oc describe svc &lt;name&gt;</td><td>Show endpoints, selectors</td></tr>
<tr><td>oc get endpoints &lt;name&gt;</td><td>Show pod IPs backing a service</td></tr>
</table>
<div class="tip"><strong>💡 DNS inside the cluster:</strong> Service DNS format is <code>&lt;svc&gt;.&lt;namespace&gt;.svc.cluster.local</code>. Within the same namespace, just <code>&lt;svc&gt;</code> works.</div>
`},

{id:'config', label:'ConfigMaps & Secrets', content:`
<h3>ConfigMaps &amp; Secrets</h3>
<p class="topic-desc">ConfigMaps and Secrets decouple configuration from container images — a core 12-factor app principle. They allow you to change app behavior without rebuilding images.</p>

<div class="section-title">ConfigMap</div>
<div class="definition-card"><h4>ConfigMap</h4><p>Stores non-sensitive key-value pairs or file content. Used to inject configuration into pods as environment variables or mounted files. Not encrypted — don't store passwords here.</p></div>
<pre><span class="c"># Create from literal values</span>
oc create configmap app-config \\
  --from-literal=DB_HOST=postgres \\
  --from-literal=LOG_LEVEL=info

<span class="c"># Create from a file</span>
oc create configmap nginx-conf --from-file=nginx.conf

<span class="c"># YAML definition</span>
<span class="p">apiVersion:</span> v1
<span class="p">kind:</span> ConfigMap
<span class="p">metadata:</span>
  <span class="p">name:</span> app-config
<span class="p">data:</span>
  <span class="p">DB_HOST:</span> postgres
  <span class="p">LOG_LEVEL:</span> info
  <span class="p">app.properties:</span> |
    server.port=8080
    feature.flag=true</pre>

<div class="section-title">Secret</div>
<div class="definition-card"><h4>Secret</h4><p>Like ConfigMap but for sensitive data. Values are base64-encoded (NOT encrypted by default). OpenShift can integrate with HashiCorp Vault or use etcd encryption. Types: <code>Opaque</code> (generic), <code>kubernetes.io/tls</code>, <code>kubernetes.io/dockerconfigjson</code>.</p></div>
<pre><span class="c"># Create generic secret</span>
oc create secret generic db-creds \\
  --from-literal=DB_USER=admin \\
  --from-literal=DB_PASS=s3cur3

<span class="c"># Create TLS secret</span>
oc create secret tls my-tls --cert=tls.crt --key=tls.key

<span class="c"># YAML (values are base64)</span>
<span class="p">apiVersion:</span> v1
<span class="p">kind:</span> Secret
<span class="p">metadata:</span>
  <span class="p">name:</span> db-creds
<span class="p">type:</span> Opaque
<span class="p">stringData:</span>            <span class="c"># use stringData for plain text (auto-encoded)</span>
  <span class="p">DB_USER:</span> admin
  <span class="p">DB_PASS:</span> s3cur3</pre>

<div class="section-title">Consuming in Pods</div>
<pre><span class="c"># As environment variables</span>
<span class="p">envFrom:</span>
- <span class="p">configMapRef:</span>
    <span class="p">name:</span> app-config
- <span class="p">secretRef:</span>
    <span class="p">name:</span> db-creds

<span class="c"># Single key as env var</span>
<span class="p">env:</span>
- <span class="p">name:</span> DB_HOST
  <span class="p">valueFrom:</span>
    <span class="p">configMapKeyRef:</span>
      <span class="p">name:</span> app-config
      <span class="p">key:</span> DB_HOST

<span class="c"># Mounted as files</span>
<span class="p">volumes:</span>
- <span class="p">name:</span> config-vol
  <span class="p">configMap:</span>
    <span class="p">name:</span> app-config
<span class="p">volumeMounts:</span>
- <span class="p">name:</span> config-vol
  <span class="p">mountPath:</span> /etc/config</pre>
<div class="warn"><strong>⚠️ Secret caveat:</strong> Base64 is encoding, not encryption. Enable etcd encryption at rest for true secret protection. Use RBAC to restrict who can <code>get/list</code> secrets.</div>
`},

{id:'storage', label:'Storage (PV/PVC)', content:`
<h3>Storage — PersistentVolumes &amp; Claims</h3>
<p class="topic-desc">Kubernetes abstracts storage with PersistentVolumes (PV) — cluster-scoped storage resources — and PersistentVolumeClaims (PVC) — namespace-scoped requests for that storage.</p>

<div class="section-title">Storage Objects</div>
<div class="definition-card"><h4>PersistentVolume (PV)</h4><p>A cluster-level storage resource provisioned by an admin or dynamically by a StorageClass. Has a capacity, access mode, and reclaim policy. Lifecycle independent of any pod.</p></div>
<div class="definition-card"><h4>PersistentVolumeClaim (PVC)</h4><p>A user's request for storage. Specifies size and access mode. The control plane binds it to a matching PV. Pods mount PVCs as volumes. If no PV matches and a StorageClass is configured, a PV is dynamically provisioned.</p></div>
<div class="definition-card"><h4>StorageClass</h4><p>Defines a "class" of storage (fast SSD, NFS, etc.) with a provisioner. When a PVC references a StorageClass, a PV is dynamically created. The <code>default</code> StorageClass is used when no class is specified in a PVC.</p></div>

<div class="section-title">Access Modes</div>
<table class="cmd-table">
<tr><th>Mode</th><th>Short</th><th>Description</th></tr>
<tr><td>ReadWriteOnce</td><td>RWO</td><td>Mounted read-write by a single node</td></tr>
<tr><td>ReadOnlyMany</td><td>ROX</td><td>Mounted read-only by many nodes</td></tr>
<tr><td>ReadWriteMany</td><td>RWX</td><td>Mounted read-write by many nodes (NFS, CephFS)</td></tr>
<tr><td>ReadWriteOncePod</td><td>RWOP</td><td>Mounted read-write by a single pod (K8s 1.22+)</td></tr>
</table>

<div class="section-title">Reclaim Policies</div>
<table class="cmd-table">
<tr><th>Policy</th><th>Behavior when PVC is deleted</th></tr>
<tr><td>Retain</td><td>PV stays with data — manual cleanup required</td></tr>
<tr><td>Delete</td><td>PV and underlying storage are deleted</td></tr>
<tr><td>Recycle</td><td>Deprecated — basic scrub then make available again</td></tr>
</table>

<div class="section-title">PVC Manifest &amp; Pod Usage</div>
<pre><span class="p">apiVersion:</span> v1
<span class="p">kind:</span> PersistentVolumeClaim
<span class="p">metadata:</span>
  <span class="p">name:</span> data-pvc
<span class="p">spec:</span>
  <span class="p">accessModes:</span>
  - ReadWriteOnce
  <span class="p">resources:</span>
    <span class="p">requests:</span>
      <span class="p">storage:</span> 5Gi
  <span class="p">storageClassName:</span> standard   <span class="c"># omit to use default</span>
---
<span class="c"># Using PVC in a pod</span>
<span class="p">volumes:</span>
- <span class="p">name:</span> data
  <span class="p">persistentVolumeClaim:</span>
    <span class="p">claimName:</span> data-pvc
<span class="p">volumeMounts:</span>
- <span class="p">name:</span> data
  <span class="p">mountPath:</span> /var/data</pre>

<div class="section-title">Storage Commands</div>
<table class="cmd-table">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>oc get pvc</td><td>List PVCs in project</td></tr>
<tr><td>oc get pv</td><td>List all PVs (cluster-wide)</td></tr>
<tr><td>oc describe pvc &lt;name&gt;</td><td>Show binding status, events</td></tr>
<tr><td>oc get storageclass</td><td>List available storage classes</td></tr>
</table>
<div class="tip"><strong>💡 Debugging PVCs:</strong> If a PVC stays <code>Pending</code>, check: (1) does a matching PV exist? (2) is a StorageClass configured? (3) is the cluster's storage provisioner healthy? Use <code>oc describe pvc &lt;name&gt;</code> to see events.</div>
`},

{id:'ha', label:'HA & Reliability', content:`
<h3>High Availability &amp; Reliability</h3>
<p class="topic-desc">Configuring workloads for high availability means ensuring they tolerate failures, self-heal, and distribute load — without manual intervention.</p>

<div class="section-title">Resource Requests &amp; Limits</div>
<div class="definition-card"><h4>requests</h4><p>The amount of CPU/memory the scheduler uses to find a node with enough capacity. The pod is guaranteed at least this much. Setting requests enables proper scheduling and autoscaling.</p></div>
<div class="definition-card"><h4>limits</h4><p>The maximum CPU/memory a container may use. CPU is throttled if exceeded; memory causes an OOMKill if exceeded. Always set limits to prevent noisy neighbors.</p></div>
<pre><span class="p">resources:</span>
  <span class="p">requests:</span>
    <span class="p">cpu:</span> <span class="s">"100m"</span>     <span class="c"># 100 millicores = 0.1 CPU</span>
    <span class="p">memory:</span> <span class="s">"128Mi"</span>
  <span class="p">limits:</span>
    <span class="p">cpu:</span> <span class="s">"500m"</span>
    <span class="p">memory:</span> <span class="s">"256Mi"</span></pre>

<div class="section-title">Health Probes</div>
<div class="definition-card"><h4>livenessProbe</h4><p>Checks if the container is still alive. If it fails, kubelet <strong>restarts</strong> the container. Use for deadlock detection. Should probe a lightweight endpoint.</p></div>
<div class="definition-card"><h4>readinessProbe</h4><p>Checks if the container is ready to serve traffic. If it fails, the pod is removed from Service endpoints (no traffic sent). Use during startup and for dependency checks.</p></div>
<div class="definition-card"><h4>startupProbe</h4><p>For slow-starting containers. Disables liveness/readiness until the startup probe succeeds. Prevents premature restarts of apps that take time to initialize.</p></div>
<pre><span class="p">livenessProbe:</span>
  <span class="p">httpGet:</span>
    <span class="p">path:</span> /healthz
    <span class="p">port:</span> 8080
  <span class="p">initialDelaySeconds:</span> 15
  <span class="p">periodSeconds:</span> 20
  <span class="p">failureThreshold:</span> 3
<span class="p">readinessProbe:</span>
  <span class="p">httpGet:</span>
    <span class="p">path:</span> /ready
    <span class="p">port:</span> 8080
  <span class="p">initialDelaySeconds:</span> 5
  <span class="p">periodSeconds:</span> 10</pre>

<div class="section-title">HorizontalPodAutoscaler (HPA)</div>
<div class="definition-card"><h4>HPA</h4><p>Automatically scales the number of pod replicas based on observed CPU/memory utilization or custom metrics. Requires resource requests to be set on the target deployment.</p></div>
<pre>oc autoscale deployment/webapp \\
  --min=2 --max=10 --cpu-percent=70</pre>

<div class="section-title">Pod Disruption Budget (PDB)</div>
<div class="definition-card"><h4>PodDisruptionBudget</h4><p>Limits how many pods can be voluntarily disrupted (node drain, rolling update) at once. Protects against having too few replicas during maintenance.</p></div>
<pre><span class="p">apiVersion:</span> policy/v1
<span class="p">kind:</span> PodDisruptionBudget
<span class="p">metadata:</span>
  <span class="p">name:</span> webapp-pdb
<span class="p">spec:</span>
  <span class="p">minAvailable:</span> 2   <span class="c"># or maxUnavailable: 1</span>
  <span class="p">selector:</span>
    <span class="p">matchLabels:</span>
      <span class="p">app:</span> webapp</pre>

<div class="section-title">Anti-Affinity</div>
<pre><span class="c"># Spread pods across nodes</span>
<span class="p">affinity:</span>
  <span class="p">podAntiAffinity:</span>
    <span class="p">preferredDuringSchedulingIgnoredDuringExecution:</span>
    - <span class="p">weight:</span> 100
      <span class="p">podAffinityTerm:</span>
        <span class="p">labelSelector:</span>
          <span class="p">matchLabels:</span>
            <span class="p">app:</span> webapp
        <span class="p">topologyKey:</span> kubernetes.io/hostname</pre>
<div class="tip"><strong>💡 HA checklist:</strong> replicas ≥ 2 · resource requests set · readiness probe configured · PDB defined · pods spread across nodes with anti-affinity.</div>
`},

{id:'projects', label:'Projects & RBAC', content:`
<h3>Projects, Namespaces &amp; RBAC</h3>
<p class="topic-desc">OpenShift Projects are Kubernetes Namespaces with additional metadata and policies. RBAC (Role-Based Access Control) controls who can do what within a project or cluster.</p>

<div class="section-title">Projects vs Namespaces</div>
<div class="definition-card"><h4>Namespace</h4><p>Kubernetes construct for isolating resources. Provides scope for names, resource quotas, and RBAC. Resources like Pods, Services, Deployments are namespace-scoped.</p></div>
<div class="definition-card"><h4>Project (OpenShift)</h4><p>A Namespace with additional OpenShift metadata (requester, display name, description). When you create a project, OpenShift automatically creates the namespace and assigns default roles. <code>oc new-project</code> is the OpenShift way.</p></div>

<div class="section-title">RBAC Hierarchy</div>
<div class="definition-card"><h4>Role</h4><p>Defines a set of permissions (verbs on resources) scoped to a single namespace. Example: allow <code>get,list,watch</code> on <code>pods</code>.</p></div>
<div class="definition-card"><h4>ClusterRole</h4><p>Like Role, but cluster-scoped. Can be applied to all namespaces or to non-namespaced resources (nodes, PVs). Reusable across namespaces via RoleBinding.</p></div>
<div class="definition-card"><h4>RoleBinding</h4><p>Grants a Role or ClusterRole to a subject (User, Group, ServiceAccount) within a namespace.</p></div>
<div class="definition-card"><h4>ClusterRoleBinding</h4><p>Grants a ClusterRole to a subject cluster-wide (all namespaces).</p></div>

<div class="section-title">OpenShift Default Roles</div>
<table class="cmd-table">
<tr><th>Role</th><th>Can do</th></tr>
<tr><td>cluster-admin</td><td>Everything on the cluster</td></tr>
<tr><td>admin</td><td>Manage all resources within a project (can grant others access)</td></tr>
<tr><td>edit</td><td>CRUD on most project resources; cannot manage roles</td></tr>
<tr><td>view</td><td>Read-only within a project</td></tr>
<tr><td>basic-user</td><td>Get info about themselves and their projects</td></tr>
</table>

<div class="section-title">RBAC Commands</div>
<pre><span class="c"># Create a project</span>
oc new-project myapp --description="My Application"

<span class="c"># Grant role to user in current project</span>
oc adm policy add-role-to-user edit alice

<span class="c"># Grant cluster-admin (use carefully!)</span>
oc adm policy add-cluster-role-to-user cluster-admin alice

<span class="c"># View current permissions</span>
oc auth can-i get pods
oc auth can-i --list

<span class="c"># Check what a user can do</span>
oc auth can-i get pods --as=alice</pre>

<div class="section-title">ServiceAccounts</div>
<div class="definition-card"><h4>ServiceAccount</h4><p>An identity for processes running in pods. Each pod runs as a ServiceAccount (default: <code>default</code>). Grant RBAC permissions to ServiceAccounts instead of users when pods need API access.</p></div>
<pre>oc create serviceaccount my-sa
oc adm policy add-role-to-user view -z my-sa   <span class="c"># -z = serviceaccount</span></pre>
<div class="warn"><strong>⚠️ Least privilege:</strong> Never run workloads as cluster-admin. Grant the minimum permissions required. Use the <code>view</code> role for read-only automation.</div>
`},

{id:'imagestreams', label:'Images & ImageStreams', content:`
<h3>Images, ImageStreams &amp; Builds</h3>
<p class="topic-desc">OpenShift extends Kubernetes with ImageStreams for tracking image versions and BuildConfigs for building images directly in the cluster.</p>

<div class="section-title">ImageStream</div>
<div class="definition-card"><h4>ImageStream</h4><p>An OpenShift resource that tracks a series of container images in one or more image repositories. Acts as an abstraction layer — your Deployment references an ImageStream, and when the image updates (new tag pushed), OpenShift can automatically trigger a redeployment.</p></div>
<div class="definition-card"><h4>ImageStreamTag</h4><p>A named pointer within an ImageStream to a specific image version. e.g., <code>python:3.11</code> is the tag <code>3.11</code> on the <code>python</code> ImageStream.</p></div>

<div class="section-title">Pulling from External Registries</div>
<pre><span class="c"># Import an image from an external registry</span>
oc import-image myapp:latest \\
  --from=quay.io/myorg/myapp:latest \\
  --confirm

<span class="c"># Create pull secret for private registry</span>
oc create secret docker-registry regcred \\
  --docker-server=quay.io \\
  --docker-username=myuser \\
  --docker-password=mypass

<span class="c"># Link secret to default service account</span>
oc secrets link default regcred --for=pull</pre>

<div class="section-title">Source-to-Image (S2I)</div>
<div class="definition-card"><h4>S2I (Source-to-Image)</h4><p>OpenShift build strategy that takes application source code and injects it into a base builder image, producing a runnable image — no Dockerfile required. Supports Node.js, Python, Ruby, PHP, Java, .NET, Go, and more.</p></div>
<pre><span class="c"># Deploy from source code (S2I)</span>
oc new-app python:3.11~https://github.com/org/repo.git

<span class="c"># Deploy from image</span>
oc new-app --image=quay.io/myorg/myapp:latest

<span class="c"># Deploy from template</span>
oc new-app --template=mysql-persistent</pre>

<div class="section-title">Image Commands</div>
<table class="cmd-table">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>oc get imagestreams</td><td>List ImageStreams</td></tr>
<tr><td>oc get istag</td><td>List ImageStreamTags</td></tr>
<tr><td>oc describe is &lt;name&gt;</td><td>Show image history and tags</td></tr>
<tr><td>oc import-image &lt;is&gt; --confirm</td><td>Re-import latest from source</td></tr>
<tr><td>oc tag &lt;src&gt; &lt;dst&gt;</td><td>Tag an image into an ImageStream</td></tr>
</table>
<div class="tip"><strong>💡 OpenShift Internal Registry:</strong> OpenShift has a built-in registry at <code>image-registry.openshift-image-registry.svc:5000</code>. Builds push here automatically; pods pull from it using internal service account credentials.</div>
`},
];

