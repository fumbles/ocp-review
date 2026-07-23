// ═══════════════════════════════════════════════════════════════════════════════
// LEARN DATA
// ═══════════════════════════════════════════════════════════════════════════════
export const topics = [
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

{id:'hcp', label:'Hosted Control Planes (HyperShift)', content: `
<h3>Hosted Control Planes &amp; HyperShift</h3>
<p class="topic-desc">Hosted Control Planes (HCP) is the Red Hat product that runs OpenShift control planes as pods on a shared management cluster instead of on dedicated infrastructure. The upstream project and operator are called <strong>HyperShift</strong>. Understanding the naming distinctions is critical for the exam and for customer conversations.</p>

<div class="section-title">Naming Pitfalls — Know the Difference</div>
<div class="warn"><strong>⚠️ management cluster ≠ managed cluster</strong><br>
<strong>Management cluster</strong> (= hosting cluster): where HyperShift runs and control planes live as pods.<br>
<strong>Managed cluster</strong>: an ACM/MCE concept — a cluster that is imported into the hub and managed via ManifestWork. Completely different role.</div>
<div class="warn"><strong>⚠️ hosted cluster ≠ hosted control plane</strong><br>
<strong>Hosted cluster</strong>: the entire logical OCP cluster (control plane pods + data plane workers).<br>
<strong>Hosted control plane</strong>: only the control-plane components (etcd, API server, controller-manager, Konnectivity) running as pods on the management cluster.</div>
<div class="warn"><strong>⚠️ HyperShift = project/operator name only</strong><br>
The upstream project and Kubernetes operator are called HyperShift. The Red Hat product name is <strong>Hosted Control Planes (HCP)</strong>. Do not use "HyperShift" in customer-facing product contexts.</div>
<div class="warn"><strong>⚠️ hub cluster ≠ management cluster (usually co-located, but not always)</strong><br>
Hub cluster: where ACM (MultiClusterHub) server components run.<br>
Management cluster: where HyperShift Operator and control plane pods run. They are often the same cluster, but are architecturally distinct concepts.</div>

<div class="section-title">Architecture Overview</div>
<div class="definition-card"><h4>Management Cluster (Hosting Cluster)</h4><p>The OpenShift cluster where the HyperShift Operator runs. Each hosted control plane is provisioned as a set of pods in a dedicated namespace on this cluster. The management cluster itself is a normal OCP cluster managed by its own control plane. Also called the <em>hosting cluster</em> — these terms are synonyms.</p></div>
<div class="definition-card"><h4>Hosted Control Plane (per cluster namespace)</h4><p>The actual control-plane components of a hosted cluster — <code>etcd</code>, <code>kube-apiserver</code>, <code>kube-controller-manager</code>, and <code>Konnectivity server</code> — all running as pods inside one namespace on the management cluster. Tenants interact with this API server exactly as they would with a standard OCP API server.</p></div>
<div class="definition-card"><h4>Data Plane (Worker Nodes)</h4><p>The worker nodes of a hosted cluster, provisioned on separate infrastructure (often in a different cloud account or region). NodePools define the machine type, count, and OCP version. Workers connect back to the hosted control plane via the Konnectivity tunnel.</p></div>
<div class="definition-card"><h4>Konnectivity Tunnel</h4><p>The VPN-like connection that bridges the hosted control plane pods on the management cluster with the worker nodes on the data-plane infrastructure. Runs as a server in the hosted control plane namespace and as an agent DaemonSet on each worker node. Required because control plane and workers are on separate networks.</p></div>

<div class="section-title">Key CRDs</div>
<div class="definition-card"><h4>HostedCluster (hypershift.openshift.io/v1beta1)</h4><p>Created on the management cluster. Defines the complete configuration for a hosted cluster: OCP version, networking CIDRs, pull secret, SSH key, and references to the infrastructure provider (AWS, Azure, bare metal, etc.). Creating this CR triggers the HyperShift Operator to provision the hosted control plane namespace and all control plane pods.</p></div>
<div class="definition-card"><h4>NodePool (hypershift.openshift.io/v1beta1)</h4><p>Also created on the management cluster. Defines a scalable group of worker nodes for a HostedCluster — machine type, replica count, and OCP version (NodePools can be upgraded independently of the control plane). Multiple NodePools per hosted cluster enable mixed instance types and zone-specific scaling.</p></div>

<div class="section-title">Enabling Components</div>
<div class="definition-card"><h4>multicluster engine (MCE)</h4><p>The Red Hat operator that deploys the HyperShift Operator on the management cluster and provides foundational cluster lifecycle services. MCE is required for Hosted Control Planes. It is bundled with ACM and also available as a standalone operator. Check its status with: <code>oc get mce multiclusterengine</code>.</p></div>
<div class="definition-card"><h4>Hub Cluster (ACM)</h4><p>When using ACM, the hub cluster runs MultiClusterHub server components and can manage imported clusters (including hosted clusters) via ManagedCluster/ManifestWork. The hub and management cluster are often co-located, but the hub role (fleet governance) and the management role (hosting control planes) are distinct.</p></div>

<div class="section-title">Benefits &amp; Use Cases</div>
<div class="tip"><strong>💡 Why Hosted Control Planes?</strong>
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li><strong>Cost:</strong> Dozens of hosted control planes share one management cluster — no dedicated 3-master infrastructure per tenant cluster.</li>
  <li><strong>Speed:</strong> Provisioning a new hosted cluster takes minutes, not the 30–45 min of a full IPI install.</li>
  <li><strong>Independent upgrades:</strong> Control plane and data plane (NodePool) can be upgraded separately, enabling phased rollouts.</li>
  <li><strong>Multi-tenancy:</strong> Each hosted control plane is isolated in its own namespace with dedicated etcd and API server.</li>
  <li><strong>Edge:</strong> Worker nodes can run at edge locations while the control plane stays centrally managed.</li>
</ul></div>

<div class="section-title">Common Commands</div>
<pre><span class="c"># List all hosted clusters on the management cluster</span>
oc get hostedcluster -A

<span class="c"># List all NodePools</span>
oc get nodepool -A

<span class="c"># Check the status of the multicluster engine operator</span>
oc get mce multiclusterengine -o yaml

<span class="c"># Get the kubeconfig for a hosted cluster (hcp CLI)</span>
hcp create kubeconfig --namespace &lt;namespace&gt; --name &lt;cluster-name&gt; &gt; hosted-kubeconfig

<span class="c"># View control plane pods for a hosted cluster</span>
<span class="c"># (namespace = clusters-&lt;hostedcluster-name&gt; by convention)</span>
oc get pods -n clusters-&lt;hosted-cluster-name&gt;

<span class="c"># Check Konnectivity connectivity</span>
oc get pods -n clusters-&lt;hosted-cluster-name&gt; | grep konnectivity</pre>

<div class="tip"><strong>📖 Documentation:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/hosted_control_planes/index" target="_blank" rel="noopener">Hosted Control Planes — OCP 4.21 Docs ↗</a></div>

<div class="section-title">Terminology Deep-Dive</div>
<p>The naming around HCP evolved across upstream projects, product names, API conventions, and documentation over several years. The CLI tool is called <code>hcp</code>, but its version output says <code>openshift/hypershift</code>. The operator is called the HyperShift Operator, but the product name is <em>hosted control planes</em>. The API group is <code>hypershift.openshift.io</code>, but "HyperShift" rarely appears in the official docs anymore. Use the following table to keep these straight. <a href="https://developers.redhat.com/articles/2026/07/01/demystify-terminology-openshift-hosted-control-planes" target="_blank" rel="noopener">Full article ↗</a></p>
<table class="cmd-table">
<tr><th>Term</th><th>What it means</th><th>Watch out</th></tr>
<tr><td><strong>Management cluster</strong></td><td>The OCP cluster where MCE + HyperShift Operator run and where control plane pods live</td><td>Synonymous with <em>hosting cluster</em>. NOT the same as <em>managed cluster</em>.</td></tr>
<tr><td><strong>Hosting cluster</strong></td><td>Synonym for management cluster</td><td>Sounds like <em>hosted cluster</em> but refers to the opposite role — it does the hosting.</td></tr>
<tr><td><strong>Hub cluster</strong></td><td>Where ACM (MultiClusterHub) server components run</td><td>Often co-located with the management cluster, but not required. Hub ≠ management by definition.</td></tr>
<tr><td><strong>Hosted cluster</strong></td><td>The entire logical OCP cluster: control plane pods on management cluster + worker nodes on separate infrastructure</td><td>Not just the workers — the whole cluster, even though the control plane runs elsewhere.</td></tr>
<tr><td><strong>Hosted control plane</strong></td><td>Only the control-plane portion of a hosted cluster (etcd, API server, controller-manager, Konnectivity) running as pods</td><td>A <em>subset</em> of the hosted cluster.</td></tr>
<tr><td><strong>Data plane</strong></td><td>Compute, storage, and networking where workloads run — the worker nodes</td><td>Lives on separate infrastructure from the control plane.</td></tr>
<tr><td><strong>Hosted cluster infrastructure</strong></td><td>Network, compute, and storage resources in the tenant's environment</td><td>Where data-plane workers live, owned by the cluster consumer, not the provider.</td></tr>
<tr><td><strong>Managed cluster</strong></td><td>An ACM/MCE concept — a cluster imported into the hub via ManifestWork</td><td>Completely different from <em>management cluster</em>. A managed cluster is a spoke; a management cluster is the hub that runs HCP.</td></tr>
<tr><td><strong>HostedCluster CR</strong></td><td>Custom resource (<code>hypershift.openshift.io</code>) defining the control plane and data plane configuration, created on the management cluster</td><td>Creating this CR triggers deployment of the hosted control plane pods in a dedicated namespace.</td></tr>
<tr><td><strong>NodePool CR</strong></td><td>Custom resource representing a scalable set of worker nodes attached to a HostedCluster, also lives on the management cluster</td><td>Defines how and where workers are provisioned (bare metal agents, VMs, cloud instances).</td></tr>
</table>

<div class="section-title">Three-Layer Architecture</div>
<p style="margin-bottom:0.5rem"><a href="https://developers.redhat.com/articles/2026/07/08/demystify-architecture-openshift-hosted-control-planes" target="_blank" rel="noopener">Full article ↗</a></p>
<p><strong>Layer 1 — The fundamental split</strong></p>
<img src="https://developers.redhat.com/sites/default/files/styles/article_floated/public/image1_280.png?itok=H2IJj2ip" alt="Diagram showing the split between the management cluster (top) running hosted control plane pods, and the hosted cluster workers (bottom) on separate infrastructure" style="max-width:100%;border-radius:4px;margin:0.75rem 0" />
<p>The management cluster runs MCE + the HyperShift Operator. When you create a <code>HostedCluster</code> CR, the operator provisions a dedicated namespace (<code>clusters-&lt;name&gt;</code>) containing etcd, kube-apiserver, kube-controller-manager, and a Konnectivity server. Worker nodes run on completely separate infrastructure and communicate back to the control plane exclusively through the Konnectivity tunnel — no direct network access to the management cluster is required from the workers.</p>

<p><strong>Layer 2 — API resources and running pods</strong></p>
<img src="https://developers.redhat.com/sites/default/files/styles/article_floated/public/image3_151.png?itok=Drs3F-nO" alt="Diagram showing how HostedCluster and NodePool CRs on the management cluster map to running control plane pods in a dedicated namespace" style="max-width:100%;border-radius:4px;margin:0.75rem 0" />
<p>Both <code>HostedCluster</code> and <code>NodePool</code> CRs live on the management cluster. Creating a <code>HostedCluster</code> causes the HyperShift Operator to create the <code>clusters-&lt;name&gt;</code> namespace and deploy etcd (StatefulSet), kube-apiserver (Deployment), kube-controller-manager (Deployment), and the Konnectivity server. The workers have no awareness of these resources — they only know their API server endpoint.</p>

<p><strong>Layer 3 — One management cluster, many hosted clusters</strong></p>
<img src="https://developers.redhat.com/sites/default/files/styles/article_floated/public/image2_188.png?itok=rOEw8kXX" alt="Diagram of a management cluster hosting control planes for both bare metal (Agent provider) and KubeVirt (OpenShift Virtualization) workers simultaneously" style="max-width:100%;border-radius:4px;margin:0.75rem 0" />
<p>A single management cluster can simultaneously host control planes for multiple clusters. In this example, Hosted Cluster Y uses the Agent provider (bare metal workers discovered via InfraEnv/Agent CRs), while Hosted Cluster Z uses OpenShift Virtualization (KubeVirt) to run workers as VMs. Each hosted control plane gets its own namespace with isolated etcd and API server, but shares the management cluster's compute.</p>

<div class="section-title">Infrastructure Requirements by Platform</div>

<div class="definition-card"><h4>Common to All Platforms</h4>
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li><strong>MCE Operator:</strong> Required on the management cluster. Bundles and manages the HyperShift Operator. Can be installed standalone via OperatorHub — full ACM is not required.</li>
  <li><strong>etcd storage (critical):</strong> Each hosted cluster runs an etcd StatefulSet on the management cluster backed by a PersistentVolume. WAL fsync p99 latency <strong>must stay below 10 ms</strong>. Failing this causes leader election instability, degraded API response, and risk of data corruption. With ten hosted clusters you may have ten etcd instances competing for I/O — validate with <code>fio</code> or <code>etcd-benchmark</code> under realistic multi-instance load before deploying.</li>
  <li><strong>Load balancing:</strong> Each hosted cluster must expose its API server endpoint. Cloud platforms provision load balancers automatically; bare metal and OpenShift Virtualization require MetalLB.</li>
  <li><strong>DNS:</strong> Each hosted cluster needs DNS entries for its API endpoint and a wildcard <code>*.apps</code> ingress record. Plan your DNS strategy (per-cluster records vs. wildcards) before provisioning the first cluster.</li>
</ul></div>

<div class="definition-card"><h4>Bare Metal — Additional Components</h4>
<img src="https://developers.redhat.com/sites/default/files/styles/article_floated/public/image2_189.png?itok=QWlCRjIf" alt="Diagram of bare metal infrastructure components: MetalLB, storage, agent provider, and DNS" style="max-width:100%;border-radius:4px;margin:0.5rem 0" />
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li><strong>MetalLB:</strong> Fills the cloud load-balancer gap. Install the MetalLB Operator on the management cluster and configure IP address pools. <em>L2 mode</em> uses ARP/NDP — simpler but a single node handles all traffic per VIP (bottleneck + failover delay). <em>BGP mode</em> peers with routers for multi-node distribution and faster failover, but requires BGP-capable routers and more config. Plan IP pools carefully — each hosted cluster needs at least one LoadBalancer IP for its API endpoint.</li>
  <li><strong>Agent provider:</strong> Bare metal servers boot a discovery ISO generated by an <code>InfraEnv</code> CR, then appear as <code>Agent</code> CRs on the management cluster with hardware inventory. A <code>NodePool</code> references these agents and triggers RHCOS installation + cluster join.</li>
  <li><strong>Network topology:</strong> Ensure workers can reach the management cluster's API endpoint for Konnectivity, DNS resolves hosted cluster API and ingress, and firewalls allow required ports.</li>
</ul></div>

<div class="definition-card"><h4>OpenShift Virtualization (KubeVirt) — Additional Decisions</h4>
<img src="https://developers.redhat.com/sites/default/files/styles/article_floated/public/image1_282.png?itok=XOt5tLyY" alt="Diagram of KubeVirt infrastructure components: VM workers, networking options (overlay vs localnet), and storage" style="max-width:100%;border-radius:4px;margin:0.5rem 0" />
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li><strong>Co-located vs. separate infrastructure cluster:</strong> Co-located (one cluster runs MCE, HyperShift, OpenShift Virtualization, and worker VMs) is simpler but causes resource contention between control plane pods and VMs. A separate infrastructure cluster for the VMs is recommended for production — better isolation, dedicated resources per role.</li>
  <li><strong>Networking — Overlay (default pod network or UDN):</strong> VMs use OVN-Kubernetes overlay; simplest to configure. The downside: the hosted cluster's pod network runs <em>inside</em> VMs, which themselves run on the management cluster's pod network — double encapsulation makes troubleshooting harder and can impact performance.</li>
  <li><strong>Networking — Localnet (VLAN):</strong> VMs attach directly to a physical VLAN via OVN-Kubernetes localnet topology. Avoids nested overlay, better performance, familiar network model. Trade-off: requires VLAN config on physical switches and <code>NodeNetworkConfigurationPolicy</code> (NNCP) resources on management cluster nodes.</li>
  <li><strong>VM disk storage:</strong> Distinct from etcd storage. Focus is capacity and throughput rather than ultra-low latency. If co-locating, account for management cluster overhead + hosted control plane pods + worker VMs + OpenShift Virtualization operator overhead — all competing on the same cluster.</li>
</ul></div>

<div class="warn"><strong>⚠️ Pre-deployment checklist:</strong>
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li>Validated storage backend meets etcd p99 &lt; 10 ms under multi-instance load?</li>
  <li>Load balancing planned (MetalLB IP pools sized for all hosted clusters)?</li>
  <li>DNS strategy defined (per-cluster records or wildcards)?</li>
  <li>Resource quotas set to prevent any single hosted cluster from starving others (especially when co-locating VMs)?</li>
</ul></div>

<div class="tip"><strong>📖 Documentation:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/hosted_control_planes/index" target="_blank" rel="noopener">Hosted Control Planes — OCP 4.21 Docs ↗</a></div>
`},

{id:'advanced-cli', label:'⚡ Advanced CLI Reference', content:`
<h3>Advanced oc / kubectl Commands</h3>
<p>Power-user commands for day-to-day cluster operations — debugging, introspection, patching, and live manipulation.</p>

<h4>Port-Forwarding &amp; Local Access</h4>
<pre><code><span class="c"># Forward local port 8080 → pod port 8080 (bypass Routes entirely)</span>
oc port-forward pod/&lt;name&gt; 8080:8080

<span class="c"># Forward to a Service (round-robins to a random pod)</span>
oc port-forward svc/&lt;name&gt; 5432:5432

<span class="c"># Forward multiple ports at once</span>
oc port-forward pod/&lt;name&gt; 8080:8080 9090:9090

<span class="c"># Bind to all interfaces (accessible from your LAN)</span>
oc port-forward --address 0.0.0.0 svc/prometheus-operated 9090:9090 -n openshift-monitoring

<span class="c"># Background it; kill when done</span>
oc port-forward svc/mydb 5432:5432 &amp;
kill %1</code></pre>

<h4>Exec, RSH &amp; Debug</h4>
<pre><code><span class="c"># Interactive shell in a running container</span>
oc rsh &lt;pod&gt;
oc exec -it &lt;pod&gt; -- /bin/bash
oc exec -it &lt;pod&gt; -c &lt;container&gt; -- sh    <span class="c"># specific container</span>

<span class="c"># One-off command</span>
oc exec &lt;pod&gt; -- env | sort
oc exec &lt;pod&gt; -- curl -s http://localhost:8080/healthz

<span class="c"># Debug a CRASHED pod (spawns copy, overrides entrypoint)</span>
oc debug pod/&lt;name&gt;
oc debug node/&lt;node-name&gt;          <span class="c"># then: chroot /host</span>
oc debug deployment/&lt;name&gt;
oc debug &lt;pod&gt; --image=nicolaka/netshoot
oc debug &lt;pod&gt; --as-root</code></pre>

<h4>File Transfer</h4>
<pre><code><span class="c"># Copy TO a pod</span>
oc cp ./localfile.txt &lt;pod&gt;:/tmp/file.txt

<span class="c"># Copy FROM a pod</span>
oc cp &lt;pod&gt;:/var/log/app.log ./app.log
oc cp &lt;pod&gt;:/tmp/heapdump.hprof ./dumps/

<span class="c"># rsync (faster for directories, requires rsync in container)</span>
oc rsync ./src/ &lt;pod&gt;:/app/src/ --delete
oc rsync &lt;pod&gt;:/app/data/ ./local-data/</code></pre>

<h4>Logs — Advanced Flags</h4>
<pre><code><span class="c"># Previous crashed container</span>
oc logs &lt;pod&gt; --previous

<span class="c"># Time-bounded</span>
oc logs &lt;pod&gt; --since=1h
oc logs &lt;pod&gt; --since-time='2026-06-01T00:00:00Z'
oc logs &lt;pod&gt; --tail=100

<span class="c"># Stream ALL pods matching a label simultaneously</span>
oc logs -l app=myapp --all-containers=true -f --max-log-requests=10</code></pre>

<h4>Patching &amp; Live Updates</h4>
<pre><code><span class="c"># Strategic merge patch</span>
oc patch deployment/myapp -p '{"spec":{"replicas":5}}'

<span class="c"># JSON patch (array operations)</span>
oc patch svc/myapp --type=json \
  -p '[{"op":"replace","path":"/spec/type","value":"LoadBalancer"}]'

<span class="c"># Rolling image update</span>
oc set image deployment/myapp app=myimage:v2.0

<span class="c"># Set resources, env, secrets inline</span>
oc set resources deployment/myapp --requests=cpu=100m,memory=128Mi --limits=cpu=500m,memory=256Mi
oc set env deployment/myapp LOG_LEVEL=debug
oc set env deployment/myapp --from=secret/my-secret
oc set env deployment/myapp --from=configmap/app-config

<span class="c"># Scale to zero and back</span>
oc scale deployment/myapp --replicas=0
oc scale deployment/myapp --replicas=3</code></pre>

<h4>Output Formatting &amp; JSONPath</h4>
<pre><code><span class="c"># Custom columns</span>
oc get pods -o custom-columns=\
NAME:.metadata.name,\
STATUS:.status.phase,\
NODE:.spec.nodeName,\
IP:.status.podIP

<span class="c"># JSONPath — extract specific fields</span>
oc get pod &lt;name&gt; -o jsonpath='{.status.podIP}'
oc get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'

<span class="c"># Which SCC is assigned to a pod?</span>
oc get pod &lt;name&gt; -o jsonpath='{.metadata.annotations.openshift\.io/scc}'

<span class="c"># Sort events by time (most useful debug command)</span>
oc get events --sort-by='.lastTimestamp'
oc get events --sort-by='.lastTimestamp' --field-selector type=Warning</code></pre>

<h4>Dry-run, Diff &amp; Wait</h4>
<pre><code><span class="c"># Validate without applying</span>
oc apply -f manifest.yaml --dry-run=client    <span class="c"># local only</span>
oc apply -f manifest.yaml --dry-run=server    <span class="c"># hits webhooks + quota</span>
oc diff -f manifest.yaml                      <span class="c"># what WOULD change</span>

<span class="c"># Scaffold YAML from imperative commands</span>
oc create deployment myapp --image=nginx --dry-run=client -o yaml &gt; deployment.yaml

<span class="c"># Wait for conditions (scriptable)</span>
oc wait pod/&lt;name&gt; --for=condition=Ready --timeout=60s
oc wait deployment/myapp --for=condition=Available --timeout=120s
oc rollout status deployment/myapp --timeout=5m

<span class="c"># Rollout history + undo</span>
oc rollout history deployment/myapp
oc rollout undo deployment/myapp
oc rollout undo deployment/myapp --to-revision=3</code></pre>

<div class="tip"><strong>💡 Tip:</strong> Chain wait with restart for zero-touch rollouts in scripts: <code>oc rollout restart deployment/myapp &amp;&amp; oc rollout status deployment/myapp --timeout=5m</code></div>
`},

{id:'debug-workflows', label:'🔬 Debug & Troubleshoot Workflows', content:`
<h3>Systematic Debugging Workflows</h3>
<p>Step-by-step investigation playbooks for the most common production issues.</p>

<h4>CrashLoopBackOff</h4>
<pre><code><span class="c"># 1. Confirm restart count + exit code</span>
oc describe pod &lt;name&gt; | grep -A 10 "Last State\|Exit Code"

<span class="c"># 2. Read the crashed instance's logs</span>
oc logs &lt;pod&gt; --previous

<span class="c"># 3. Check events</span>
oc describe pod &lt;name&gt; | grep -A 10 Events

<span class="c"># 4. Spawn a debug shell (same image, no entrypoint = no crash)</span>
oc debug pod/&lt;name&gt;

<span class="c"># Inside debug shell: verify config, connectivity</span>
env | grep -i "db\|pass\|secret\|url"
ls /app/config/
nc -zv my-database 5432</code></pre>

<h4>ImagePullBackOff / ErrImagePull</h4>
<pre><code><span class="c"># 1. Which image? Which registry?</span>
oc get pod &lt;name&gt; -o jsonpath='{.spec.containers[*].image}'
oc describe pod &lt;name&gt; | grep "Failed\|Back-off"

<span class="c"># 2. Check pull secrets on the ServiceAccount</span>
oc get sa default -o yaml | grep imagePullSecrets -A 5
oc get secret &lt;pull-secret&gt; -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq .

<span class="c"># 3. Link a pull secret</span>
oc secrets link default &lt;pull-secret&gt; --for=pull</code></pre>

<h4>OOMKilled (Exit Code 137)</h4>
<pre><code><span class="c"># 1. Confirm</span>
oc get pod &lt;name&gt; -o jsonpath='{.status.containerStatuses[*].lastState.terminated.exitCode}'
<span class="c"># Should be 137</span>

<span class="c"># 2. Actual vs limit</span>
oc adm top pod &lt;name&gt; --containers
oc get pod &lt;name&gt; -o jsonpath='{.spec.containers[*].resources}'

<span class="c"># 3. Raise the limit or let VPA do it</span>
oc set resources deployment/&lt;name&gt; --limits=memory=512Mi</code></pre>

<h4>Pod Stuck Pending</h4>
<pre><code><span class="c"># Always start here</span>
oc describe pod &lt;name&gt; | grep -A 20 Events

<span class="c"># Insufficient resources?</span>
oc adm top nodes
oc describe nodes | grep -A 5 "Allocated resources"

<span class="c"># PVC not bound?</span>
oc get pvc
oc describe pvc &lt;name&gt;

<span class="c"># Node selector / affinity mismatch?</span>
oc get pod &lt;name&gt; -o jsonpath='{.spec.nodeSelector}'
oc get nodes --show-labels | grep &lt;required-label&gt;

<span class="c"># Taint blocking schedule?</span>
oc get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints

<span class="c"># SCC rejection?</span>
oc get events | grep "forbidden\|unable to validate"</code></pre>

<h4>Network / Service Not Reachable</h4>
<pre><code><span class="c"># Drop a debug pod with full network tools</span>
oc run netshoot --image=nicolaka/netshoot -it --rm -- bash

<span class="c"># DNS check</span>
oc exec &lt;pod&gt; -- nslookup &lt;svc&gt;.&lt;ns&gt;.svc.cluster.local

<span class="c"># TCP connectivity</span>
oc exec &lt;pod&gt; -- nc -zv &lt;service&gt; &lt;port&gt;
oc exec &lt;pod&gt; -- curl -sv http://&lt;service&gt;:&lt;port&gt;/healthz

<span class="c"># NetworkPolicy blocking?</span>
oc get networkpolicy -n &lt;namespace&gt;
oc describe networkpolicy &lt;name&gt;</code></pre>

<h4>Node-Level Debugging</h4>
<pre><code>oc debug node/&lt;node-name&gt;
chroot /host

<span class="c"># Inside chroot:</span>
systemctl status kubelet
journalctl -u kubelet -f --since "10 min ago"
crictl ps                  <span class="c"># running containers via CRI-O</span>
crictl logs &lt;container-id&gt;
df -h /var/lib/containers  <span class="c"># disk pressure?</span></code></pre>

<div class="tip"><strong>💡 must-gather before escalating:</strong> <code>oc adm must-gather --dest-dir=./must-gather-$(date +%F)</code> — collects logs, events, resource state, and cluster config into a tar. Always attach this to support cases.</div>
`},

{id:'pro-tips', label:'🧠 Pro Tips & Power Patterns', content:`
<h3>Pro Tips for Expert Cluster Operators</h3>

<h4>Built-in API Docs (no browser needed)</h4>
<pre><code>oc explain pod.spec.containers
oc explain deployment.spec.strategy.rollingUpdate
oc explain networkpolicy.spec.ingress.ports
oc explain --recursive pod.spec | grep -A 2 tolerations

<span class="c"># Discover all API resources</span>
oc api-resources --namespaced=true
oc api-resources --api-group=route.openshift.io
oc api-resources -o wide    <span class="c"># shows verbs + shortnames</span></code></pre>

<h4>Field Selectors &amp; Label Gymnastics</h4>
<pre><code><span class="c"># Field selector (spec/status fields)</span>
oc get pods --field-selector=status.phase=Running
oc get pods --field-selector=spec.nodeName=worker-1.example.com
oc get events --field-selector=type=Warning,reason=OOMKilling

<span class="c"># Label selector operators</span>
oc get pods -l 'app!=myapp'
oc get pods -l 'env in (prod,staging)'
oc get pods -l 'app,!debug'    <span class="c"># has 'app' but NOT 'debug'</span>

<span class="c"># Bulk-label pods on a node</span>
oc get pods --field-selector=spec.nodeName=worker-1 -o name | \
  xargs -I{} oc label {} drain-target=true</code></pre>

<h4>Impersonation &amp; Auth Testing</h4>
<pre><code><span class="c"># Test permissions without being the user</span>
oc auth can-i get pods --as=system:serviceaccount:myproject:default
oc auth can-i create deployments --as=jane --namespace=prod
oc auth can-i '*' '*' --as=system:admin

<span class="c"># Act as another user (admin only)</span>
oc get pods --as=jane
oc apply -f manifest.yaml --as=system:serviceaccount:myproject:ci-bot

<span class="c"># Find all RoleBindings for a user</span>
oc get rolebinding,clusterrolebinding -A -o json | \
  jq -r '.items[] | select(.subjects[]?.name=="jane") | .metadata.namespace + "/" + .metadata.name'</code></pre>

<h4>Resource Introspection</h4>
<pre><code><span class="c"># Top resource consumers right now</span>
oc adm top pods -A --sort-by=cpu | head -20
oc adm top pods -A --sort-by=memory | head -20

<span class="c"># Find pods with NO resource limits (risky in prod)</span>
oc get pods -A -o json | jq -r '
  .items[] |
  select(.spec.containers[].resources.limits == null) |
  .metadata.namespace + "/" + .metadata.name'

<span class="c"># All unique images in use cluster-wide</span>
oc get pods -A -o jsonpath=\
'{range .items[*]}{range .spec.containers[*]}{.image}{"\n"}{end}{end}' | sort -u

<span class="c"># Non-running pods</span>
oc get pods -A --field-selector=status.phase!=Running | grep -v Completed</code></pre>

<h4>Automation Patterns</h4>
<pre><code><span class="c"># Restart ALL deployments in a namespace</span>
oc get deployment -o name | xargs -I{} oc rollout restart {}

<span class="c"># Delete all Evicted pods cluster-wide</span>
oc get pods -A --field-selector=status.phase=Failed -o json | \
  jq -r '.items[] | select(.status.reason=="Evicted") | .metadata.namespace + " " + .metadata.name' | \
  xargs -n2 oc delete pod -n

<span class="c"># Force-delete a stuck Terminating pod (last resort)</span>
oc delete pod &lt;name&gt; --grace-period=0 --force

<span class="c"># Short-lived SA token for API calls</span>
TOKEN=$(oc create token my-sa --duration=1h)
curl -H "Authorization: Bearer $TOKEN" \
  https://$(oc whoami --show-server)/api/v1/namespaces/default/pods

<span class="c"># Apply to multiple namespaces</span>
for ns in prod staging dev; do oc apply -f configmap.yaml -n $ns; done</code></pre>

<h4>Cluster Health at a Glance</h4>
<pre><code><span class="c"># Any cluster operator degraded?</span>
oc get co | grep -v "True.*False.*False"

<span class="c"># MachineConfigPool update progress</span>
oc get mcp

<span class="c"># etcd health</span>
oc get etcd -o=jsonpath='{range .items[0].status.conditions[*]}{.type}{" "}{.status}{"\n"}{end}'

<span class="c"># Available cluster upgrades</span>
oc adm upgrade

<span class="c"># Node summary with kubelet version</span>
oc get nodes -o custom-columns=\
NAME:.metadata.name,\
STATUS:.status.conditions[-1].type,\
VERSION:.status.nodeInfo.kubeletVersion,\
ARCH:.status.nodeInfo.architecture</code></pre>

<div class="tip"><strong>💡 Golden rule:</strong> Always <code>oc diff -f &lt;file&gt;</code> before <code>oc apply</code> in production. Prefer <code>--dry-run=server</code> over <code>--dry-run=client</code> — it catches webhook rejections and quota violations before they hit.</div>
`},

{id:'log-collection', label:'📦 Log Collection & Must-Gather', content:`
<h3>Log Collection &amp; Must-Gather</h3>
<p class="topic-desc">Collecting diagnostic data is essential for support escalations, post-incident reviews, and proactive cluster health assessments. This section covers every official collection method and the new AI-driven support review feature.</p>

<div class="section-title">oc adm must-gather</div>
<div class="definition-card"><h4>What it does</h4><p>Collects cluster-wide diagnostic data — logs, resource manifests, events, operator state — into a local archive. The default image gathers general OpenShift data; additional <code>--image</code> flags pull component-specific gatherers (ODF, ACM, OADP, etc.).</p></div>
<div class="tip"><strong>📖 Documentation:</strong> <a href="https://docs.openshift.com/container-platform/latest/support/gathering-cluster-data.html" target="_blank" rel="noopener">Gathering cluster data — OpenShift Docs ↗</a></div>

<div class="section-title">Basic must-gather</div>
<pre><span class="c"># Default must-gather (general OCP diagnostics)</span>
oc adm must-gather

<span class="c"># Save to a specific directory</span>
oc adm must-gather --dest-dir=/tmp/must-gather-$(date +%F)

<span class="c"># Limit disk usage (default 30% of node disk; raise for large clusters)</span>
oc adm must-gather --volume-percentage=95

<span class="c"># Use the built-in imagestream (recommended on restricted networks)</span>
oc adm must-gather --image-stream=openshift/must-gather

<span class="c"># Run a specific script inside the gatherer image</span>
oc adm must-gather -- /usr/bin/gather_audit_logs</pre>

<div class="section-title">Common --image flags</div>
<table class="cmd-table">
<tr><th>Component</th><th>--image flag</th></tr>
<tr><td>ODF / Ceph</td><td><code>--image=registry.redhat.io/odf4/odf-must-gather-rhel9:latest</code></td></tr>
<tr><td>OADP / Backup &amp; Restore</td><td><code>--image=registry.redhat.io/oadp/oadp-mustgather-rhel9:latest</code></td></tr>
<tr><td>OpenShift Virtualization (KubeVirt)</td><td><code>--image=registry.redhat.io/container-native-virtualization/cnv-must-gather-rhel9:latest</code></td></tr>
<tr><td>ACM / MultiCluster</td><td><code>--image=registry.redhat.io/rhacm2/acm-must-gather-rhel9:latest</code></td></tr>
<tr><td>Logging (LokiStack / EFK)</td><td><code>--image=registry.redhat.io/openshift-logging/cluster-logging-rhel9-operator:latest</code></td></tr>
<tr><td>RHACS / StackRox</td><td><code>--image=registry.redhat.io/advanced-cluster-security/rhacs-collector-slim-rhel8:latest</code></td></tr>
</table>

<div class="section-title">Component-specific must-gathers</div>
<pre><span class="c"># ODF / Ceph storage diagnostics</span>
oc adm must-gather \
  --image=registry.redhat.io/odf4/odf-must-gather-rhel9:latest

<span class="c"># OADP Backup and Restore</span>
oc adm must-gather \
  --image=registry.redhat.io/oadp/oadp-mustgather-rhel9:latest

<span class="c"># OpenShift Virtualization (KubeVirt / VMs)</span>
oc adm must-gather \
  --image=registry.redhat.io/container-native-virtualization/cnv-must-gather-rhel9:latest

<span class="c"># Combine multiple gatherers in one run</span>
oc adm must-gather \
  --volume-percentage=95 \
  --image-stream=openshift/must-gather \
  --image=registry.redhat.io/odf4/odf-must-gather-rhel9:latest \
  --image=registry.redhat.io/oadp/oadp-mustgather-rhel9:latest \
  --image=registry.redhat.io/container-native-virtualization/cnv-must-gather-rhel9:latest</pre>

<div class="section-title">Dynamic must-gather (all installed Operators)</div>
<p class="topic-desc">This script auto-discovers every must-gather image from installed CSVs — ideal for clusters with many Operators where you don't know what's installed.</p>
<pre><span class="c"># Step 1: capture all CSVs</span>
oc get csv -A -o json &gt; csvs.json

<span class="c"># Step 2: build and run a must-gather from all discovered images</span>
must_gather_cmd="oc adm must-gather \
  --volume-percentage=95 \
  --image-stream=openshift/must-gather \
  --image=quay.io/pg.next/pg-must-gather"

<span class="c"># Add must-gather images from all Succeeded CSVs</span>
while IFS= read -r image; do
  must_gather_cmd="$must_gather_cmd $image"
done &lt; &lt;(
  jq -r '
    .items[]
    | select(.status.phase == "Succeeded")
    | select(.spec.relatedImages != null)
    | .spec.relatedImages
    | map(select(.image | test("must-?gather"; "i")))
    | group_by(.image | split("@")[0] | split("/")[0:3] | join("/"))
    | map(last)
    | .[]
    | "--image=" + .image
  ' csvs.json | sort -u
)

<span class="c"># Also add cluster-logging operator image if present</span>
while IFS= read -r image; do
  must_gather_cmd="$must_gather_cmd $image"
done &lt; &lt;(
  jq -r '
    .items[]
    | select(.status.phase == "Succeeded")
    | select(.metadata.name | contains("cluster-logging"))
    | select(.spec.install.spec.deployments[]?.name == "cluster-logging-operator")
    | .spec.install.spec.deployments[].spec.template.spec.containers[].image
    | "--image=" + .
  ' csvs.json | sort -u
)

<span class="c"># Preview the generated command, then run it</span>
echo "Generated command:"
printf '%s\n' "$must_gather_cmd" | tee must-gather-console.log

eval "$must_gather_cmd" 2&gt;&amp;1 | tee -a must-gather-console.log</pre>
<div class="warn"><strong>⚠️ Note:</strong> <code>eval</code> executes the assembled command — review the generated output before running in production environments.</div>

<div class="section-title">oc adm inspect</div>
<div class="definition-card"><h4>What it does</h4><p>Collects detailed state for a specific resource or operator — lighter-weight than a full must-gather. Useful for targeted investigation of a single component.</p></div>
<pre><span class="c"># Inspect a specific cluster operator</span>
oc adm inspect clusteroperator/authentication

<span class="c"># Inspect a namespace</span>
oc adm inspect ns/openshift-monitoring

<span class="c"># Inspect multiple resources at once</span>
oc adm inspect clusteroperator/network clusteroperator/dns

<span class="c"># Save to a specific directory</span>
oc adm inspect clusteroperator/etcd --dest-dir=/tmp/etcd-inspect</pre>

<div class="section-title">sosreport (node-level collection)</div>
<div class="definition-card"><h4>What it does</h4><p>Collects OS-level diagnostics from an individual node — kernel logs, systemd journal, network configuration, hardware info. Run via <code>oc debug node/</code> since you can't SSH directly to OCP nodes.</p></div>
<pre><span class="c"># Open a debug shell on the node</span>
oc debug node/&lt;node-name&gt;

<span class="c"># Inside the debug pod — chroot to the host</span>
chroot /host

<span class="c"># Run sosreport (RHEL-based nodes)</span>
sosreport --batch --tmp-dir=/var/tmp

<span class="c"># Collect only specific plugins (faster)</span>
sosreport --batch --only-plugins=openshift,crio,container_log,networking

<span class="c"># Copy the archive back to your workstation</span>
<span class="c"># (from a separate terminal)</span>
oc cp &lt;debug-pod-name&gt;:/var/tmp/sosreport-*.tar.xz ./</pre>

<div class="section-title">🤖 AI-Powered Support Review (must-gather for Red Hat AI)</div>
<div class="definition-card"><h4>What it does</h4><p>Red Hat's <strong>Technical Supportability Review with AI</strong> analyses your must-gather archive using AI to proactively identify cluster health issues, misconfigurations, and supportability risks — before they become incidents. Uses the <code>pg-must-gather</code> image from <code>quay.io/pg.next/</code>.</p></div>
<div class="tip"><strong>📖 Documentation:</strong>
  <a href="https://access.redhat.com/solutions/7141255" target="_blank" rel="noopener">Red Hat Technical Supportability Review with AI: Proactive AI-Driven Cluster Assessments ↗</a><br>
  <strong>📤 Upload portal:</strong> <a href="https://access.redhat.com/support/cases/#/analyze" target="_blank" rel="noopener">Red Hat Support — AI Analysis Upload ↗</a>
</div>
<pre><span class="c"># Step 1: capture all CSVs</span>
oc get csv -A -o json &gt; csvs.json

<span class="c"># Step 2: build command — pg-must-gather (AI review) is the base image</span>
must_gather_cmd="oc adm must-gather \
  --volume-percentage=95 \
  --image-stream=openshift/must-gather \
  --image=quay.io/pg.next/pg-must-gather"

<span class="c"># Add must-gather images from all Succeeded CSVs</span>
while IFS= read -r image; do
  must_gather_cmd="$must_gather_cmd $image"
done &lt; &lt;(
  jq -r '
    .items[]
    | select(.status.phase == "Succeeded")
    | select(.spec.relatedImages != null)
    | .spec.relatedImages
    | map(select(.image | test("must-?gather"; "i")))
    | group_by(.image | split("@")[0] | split("/")[0:3] | join("/"))
    | map(last)
    | .[]
    | "--image=" + .image
  ' csvs.json | sort -u
)

<span class="c"># Also add cluster-logging operator image if present</span>
while IFS= read -r image; do
  must_gather_cmd="$must_gather_cmd $image"
done &lt; &lt;(
  jq -r '
    .items[]
    | select(.status.phase == "Succeeded")
    | select(.metadata.name | contains("cluster-logging"))
    | select(.spec.install.spec.deployments[]?.name == "cluster-logging-operator")
    | .spec.install.spec.deployments[].spec.template.spec.containers[].image
    | "--image=" + .
  ' csvs.json | sort -u
)

<span class="c"># Preview the generated command, then run it</span>
echo "Generated command:"
printf '%s\n' "$must_gather_cmd" | tee must-gather-console.log

eval "$must_gather_cmd" 2&gt;&amp;1 | tee -a must-gather-console.log</pre>
<div class="warn"><strong>⚠️ Note:</strong> <code>eval</code> executes the assembled command — review the generated output before running in production environments.</div>
<div class="tip"><strong>📤 Upload the resulting archive at:</strong> <a href="https://access.redhat.com/support/cases/#/analyze" target="_blank" rel="noopener">Red Hat Support — AI Analysis Upload ↗</a></div>
`},

// ── EX280 / EX380 / EX432 Extended Content ───────────────────────────────────

{id:'cluster-upgrades', label:'Cluster Upgrades & MachineConfig', content:`
<h3>Cluster Upgrades &amp; MachineConfig (EX280/EX380)</h3>
<p class="topic-desc">OpenShift upgrades are fully operator-driven. The Cluster Version Operator (CVO) manages the control plane upgrade; the Machine Config Operator (MCO) handles node OS configuration and reboots. Understanding both is critical for the EX280 and EX380 exams.</p>

<div class="section-title">Cluster Version Operator (CVO)</div>
<div class="definition-card"><h4>ClusterVersion CR</h4><p>The single object that controls the desired OCP version for the cluster. The CVO watches this object and drives all operator upgrades. Check upgrade progress here first.</p></div>
<pre><span class="c"># Check current cluster version and available upgrades</span>
oc get clusterversion
oc describe clusterversion version

<span class="c"># Trigger a cluster upgrade</span>
oc adm upgrade --to-latest
oc adm upgrade --to=4.21.3

<span class="c"># Watch upgrade progress</span>
oc get clusteroperators
oc get clusteroperators | grep -v "True.*False.*False"   <span class="c"># find degraded COs</span>

<span class="c"># Pause/resume upgrade (for maintenance windows)</span>
oc patch clusterversion version --type merge \
  -p '{"spec":{"overrides":[{"kind":"Deployment","name":"cluster-version-operator","namespace":"openshift-cluster-version","unmanaged":true}]}}'</pre>
<div class="warn"><strong>⚠️ Upgrade path:</strong> OCP only supports upgrading one minor version at a time (4.20 → 4.21, not 4.19 → 4.21 directly). Use <code>oc adm upgrade --to-latest</code> to follow the recommended channel path.</div>

<div class="section-title">Machine Config Operator (MCO)</div>
<div class="definition-card"><h4>MachineConfig (MC)</h4><p>Defines OS-level node configuration: kernel arguments, systemd units, files written to disk, and CRI-O settings. MachineConfigs are applied to nodes via MachineConfigPools. Never edit rendered MachineConfigs — create your own and let MCO merge them.</p></div>
<div class="definition-card"><h4>MachineConfigPool (MCP)</h4><p>Groups nodes that receive the same set of MachineConfigs. Default pools: <code>master</code> and <code>worker</code>. Custom pools allow different configuration per node role (e.g., infra nodes). When an MCP is updated, MCO cordons, drains, and reboots nodes one at a time (rolling).</p></div>
<pre><span class="c"># List all MachineConfigPools and their status</span>
oc get mcp

<span class="c"># List all MachineConfigs (sorted by name)</span>
oc get mc | sort

<span class="c"># Watch MCO applying a change (shows UPDATING/DEGRADED/READY)</span>
oc get mcp -w

<span class="c"># Pause a pool (prevents MCO from rebooting nodes during a change window)</span>
oc patch mcp worker --type merge -p '{"spec":{"paused":true}}'
oc patch mcp worker --type merge -p '{"spec":{"paused":false}}'   <span class="c"># resume</span>

<span class="c"># Create a custom MachineConfig: add a kernel argument</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: worker
  name: 99-worker-custom-kernel-args
spec:
  kernelArguments:
    - "transparent_hugepage=never"
EOF</pre>
<div class="tip"><strong>💡 MCO rendering:</strong> MCO merges all MachineConfigs in a pool by name sort order and produces a single <em>rendered</em> MachineConfig. The <code>99-</code> prefix convention ensures your custom configs are applied last.</div>

<div class="section-title">Node Maintenance</div>
<pre><span class="c"># Cordon a node (prevent new pod scheduling)</span>
oc adm cordon &lt;node-name&gt;

<span class="c"># Drain a node (evict all pods, respects PDBs)</span>
oc adm drain &lt;node-name&gt; --ignore-daemonsets --delete-emptydir-data

<span class="c"># Uncordon after maintenance</span>
oc adm uncordon &lt;node-name&gt;

<span class="c"># Force drain (bypass PDBs — use with caution)</span>
oc adm drain &lt;node-name&gt; --ignore-daemonsets --delete-emptydir-data --force</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/updating_clusters/index" target="_blank" rel="noopener">Updating clusters — OCP 4.21 ↗</a></div>
`},

{id:'networking-advanced', label:'Advanced Networking (EX280/EX380)', content:`
<h3>Advanced Networking: Routes, NetworkPolicy &amp; Egress</h3>
<p class="topic-desc">The EX280 and EX380 exams both test deep networking knowledge: Route TLS modes, NetworkPolicy isolation, EgressIP, and Multus secondary interfaces.</p>

<div class="section-title">Route TLS Termination Modes</div>
<div class="definition-card"><h4>Edge</h4><p>TLS is terminated at the router (HAProxy). Traffic between the router and the pod is unencrypted. The router presents the certificate. Most common mode — use when the app doesn't handle TLS itself.</p></div>
<div class="definition-card"><h4>Passthrough</h4><p>The router forwards raw TLS to the pod without decrypting it. The pod terminates TLS itself. No HAProxy certificate needed. Required for mutual TLS (mTLS) and non-HTTP protocols like database drivers.</p></div>
<div class="definition-card"><h4>Re-encrypt</h4><p>TLS is terminated at the router, then re-encrypted for the backend pod. Both the external certificate (on the Route) and the service certificate (from ServiceCA) are used. Ensures end-to-end encryption while still allowing the router to inject headers.</p></div>
<pre><span class="c"># Edge TLS Route with custom certificate</span>
oc create route edge myapp \
  --service=myapp \
  --cert=tls.crt --key=tls.key --ca-cert=ca.crt

<span class="c"># Passthrough Route (app handles TLS)</span>
oc create route passthrough myapp --service=myapp

<span class="c"># Re-encrypt Route</span>
oc create route reencrypt myapp \
  --service=myapp \
  --cert=tls.crt --key=tls.key \
  --dest-ca-cert=service-ca.crt</pre>

<div class="section-title">NetworkPolicy</div>
<div class="definition-card"><h4>NetworkPolicy</h4><p>A namespaced Kubernetes resource that defines pod-level firewall rules using label selectors. By default (no NetworkPolicy), all pods can communicate. Once any NetworkPolicy selects a pod, all traffic not explicitly allowed is denied (default-deny behaviour for selected pods).</p></div>
<pre><span class="c"># Deny all ingress to a namespace (baseline isolation)</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: myapp
spec:
  podSelector: {}
  policyTypes: [Ingress]
EOF

<span class="c"># Allow only traffic from the same namespace</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: myapp
spec:
  podSelector: {}
  ingress:
  - from:
    - podSelector: {}
EOF

<span class="c"># Allow ingress from a specific namespace (e.g., monitoring)</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-monitoring
  namespace: myapp
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: openshift-monitoring
EOF</pre>
<div class="warn"><strong>⚠️ Exam gotcha:</strong> <code>podSelector: {}</code> selects ALL pods in the namespace. An empty <code>ingress: []</code> list allows NO ingress. These look similar but behave completely differently.</div>

<div class="section-title">EgressIP</div>
<div class="definition-card"><h4>EgressIP</h4><p>Assigns a stable, predictable source IP to all traffic leaving pods in a namespace. Required when external firewalls restrict traffic by source IP. Configured as an EgressIP CRD (OVN-K) — nodes must have the <code>k8s.ovn.org/egress-assignable</code> label to host EgressIPs.</p></div>
<pre><span class="c"># Label a node as eligible for EgressIP hosting</span>
oc label node &lt;node&gt; k8s.ovn.org/egress-assignable=""

<span class="c"># Create an EgressIP for a namespace</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: k8s.ovn.org/v1
kind: EgressIP
metadata:
  name: prod-egress
spec:
  egressIPs:
  - 10.0.1.100
  namespaceSelector:
    matchLabels:
      environment: prod
EOF

<span class="c"># Verify assignment</span>
oc get egressip prod-egress -o yaml</pre>

<div class="section-title">Multus &amp; Secondary Networks</div>
<div class="definition-card"><h4>Multus CNI</h4><p>The meta-CNI plugin that allows pods to have multiple network interfaces. OpenShift enables Multus by default. Additional interfaces are defined by NetworkAttachmentDefinition (NAD) CRDs and requested via pod annotations.</p></div>
<pre><span class="c"># Create a macvlan NetworkAttachmentDefinition</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: macvlan-net
  namespace: myapp
spec:
  config: |
    {"cniVersion":"0.3.1","type":"macvlan","master":"eth0","mode":"bridge","ipam":{"type":"static","addresses":[{"address":"192.168.1.10/24"}]}}
EOF

<span class="c"># Attach to a pod (annotation)</span>
<span class="c"># metadata.annotations: k8s.v1.cni.cncf.io/networks: macvlan-net</span></pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/networking/index" target="_blank" rel="noopener">OpenShift Networking — OCP 4.21 ↗</a></div>
`},

{id:'security-advanced', label:'Security: SCC, OAuth & Certs (EX280/EX380)', content:`
<h3>Security Context Constraints, OAuth &amp; TLS Certificates</h3>
<p class="topic-desc">Security is a dominant EX280/EX380 exam topic — SCCs, identity providers, RBAC deep-dives, TLS certificate management, and audit logging.</p>

<div class="section-title">Security Context Constraints (SCC)</div>
<div class="definition-card"><h4>SCC Hierarchy</h4><p>From most to least restrictive: <code>restricted-v2</code> → <code>restricted</code> → <code>nonroot-v2</code> → <code>nonroot</code> → <code>anyuid</code> → <code>hostnetwork-v2</code> → <code>hostmount-anyuid</code> → <code>hostaccess</code> → <code>privileged</code>. Always use the least permissive SCC that allows the workload to function.</p></div>
<pre><span class="c"># See what SCC a running pod uses</span>
oc get pod &lt;name&gt; -o jsonpath='{.metadata.annotations.openshift\.io/scc}'

<span class="c"># Check which SCCs a service account can use</span>
oc adm policy who-can use scc anyuid

<span class="c"># Grant a ServiceAccount permission to use a specific SCC</span>
oc adm policy add-scc-to-user anyuid -z &lt;service-account&gt; -n &lt;namespace&gt;

<span class="c"># Remove SCC from service account</span>
oc adm policy remove-scc-from-user anyuid -z &lt;service-account&gt;

<span class="c"># Describe an SCC to see all its settings</span>
oc describe scc anyuid</pre>
<div class="warn"><strong>⚠️ Exam pattern:</strong> When a pod is stuck in a crash loop with permission errors, check SCC first. Common fix: <code>oc adm policy add-scc-to-user anyuid -z default -n &lt;ns&gt;</code>. Never use <code>privileged</code> unless the workload explicitly requires it.</div>

<div class="section-title">OAuth &amp; Identity Providers</div>
<div class="definition-card"><h4>OAuth cluster CR</h4><p>The single cluster-scoped resource at <code>oc get oauth cluster</code> that configures all identity providers for the cluster. Supports: HTPasswd, LDAP, GitHub, GitLab, Google, OIDC (Keycloak, Okta), Request Header. Multiple providers can coexist.</p></div>
<pre><span class="c"># Current OAuth configuration</span>
oc get oauth cluster -o yaml

<span class="c"># Add/update HTPasswd IdP (full replace of identityProviders list)</span>
oc edit oauth cluster

<span class="c"># Create HTPasswd file and secret</span>
htpasswd -cBb /tmp/htpasswd admin redhat123
oc create secret generic htpass-secret \
  --from-file=htpasswd=/tmp/htpasswd \
  -n openshift-config

<span class="c"># Update an existing HTPasswd secret in place</span>
oc get secret htpass-secret -n openshift-config \
  -o jsonpath='{.data.htpasswd}' | base64 -d &gt; /tmp/htpasswd
htpasswd -Bb /tmp/htpasswd newuser password123
oc create secret generic htpass-secret \
  --from-file=htpasswd=/tmp/htpasswd \
  -n openshift-config --dry-run=client -o yaml | oc replace -f -

<span class="c"># Remove the default kubeadmin account (AFTER setting up another admin)</span>
oc delete secret kubeadmin -n kube-system</pre>

<div class="section-title">LDAP Identity Provider</div>
<pre><span class="c"># Test LDAP connectivity from within the cluster</span>
oc run ldaptest --image=registry.access.redhat.com/ubi9/ubi \
  --restart=Never --rm -it -- \
  ldapsearch -x -H ldap://ldap.example.com:389 \
  -D "cn=admin,dc=example,dc=com" -w password \
  -b "dc=example,dc=com" "(uid=testuser)"

<span class="c"># Sync LDAP groups to OpenShift Groups</span>
oc adm groups sync --sync-config=ldap-sync.yaml --confirm

<span class="c"># Prune groups removed from LDAP</span>
oc adm groups prune --sync-config=ldap-sync.yaml --confirm</pre>

<div class="section-title">TLS Certificates &amp; Service CA</div>
<div class="definition-card"><h4>Service CA</h4><p>OpenShift's built-in certificate authority. Automatically provisions TLS certificates for Services annotated with <code>service.beta.openshift.io/serving-cert-secret-name</code>. The CA cert is injected into ConfigMaps annotated with <code>service.beta.openshift.io/inject-cabundle=true</code>.</p></div>
<pre><span class="c"># Request a service serving certificate</span>
oc annotate service myapp \
  service.beta.openshift.io/serving-cert-secret-name=myapp-tls

<span class="c"># Inject the cluster CA bundle into a ConfigMap</span>
oc annotate configmap my-ca-bundle \
  service.beta.openshift.io/inject-cabundle=true

<span class="c"># Rotate service certificates (force regeneration)</span>
oc delete secret myapp-tls   <span class="c"># Service CA recreates it automatically</span>

<span class="c"># Check certificate expiry on a Route</span>
echo | openssl s_client -connect $(oc get route myapp \
  -o jsonpath='{.spec.host}'):443 -servername \
  $(oc get route myapp -o jsonpath='{.spec.host}') 2&gt;/dev/null \
  | openssl x509 -noout -dates</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/authentication_and_authorization/index" target="_blank" rel="noopener">Authentication &amp; Authorization — OCP 4.21 ↗</a></div>
`},

{id:'operators-olm', label:'Operators & OLM Deep Dive (EX280/EX380)', content:`
<h3>Operators &amp; OLM Deep Dive</h3>
<p class="topic-desc">The Operator Lifecycle Manager (OLM) manages the full lifecycle of Operators in OpenShift. Understanding its components, approval modes, and troubleshooting patterns is essential for both EX280 and EX380.</p>

<div class="section-title">OLM Architecture</div>
<div class="definition-card"><h4>CatalogSource</h4><p>A CRD that points OLM to an index of Operators (a registry). Red Hat ships four default CatalogSources: <code>redhat-operators</code>, <code>certified-operators</code>, <code>community-operators</code>, <code>redhat-marketplace</code>. Each is a pod in <code>openshift-marketplace</code> serving a gRPC API.</p></div>
<div class="definition-card"><h4>Subscription</h4><p>Declares intent to install an operator from a channel in a CatalogSource. Drives InstallPlan creation. Has an <code>installPlanApproval</code> field: <code>Automatic</code> (installs immediately) or <code>Manual</code> (requires human approval of each InstallPlan).</p></div>
<div class="definition-card"><h4>InstallPlan</h4><p>Created by OLM in response to a Subscription. Describes the exact CSV, CRDs, and RBAC to install. In Manual mode, must be approved: <code>oc patch installplan &lt;name&gt; -n &lt;ns&gt; --type merge -p '{"spec":{"approved":true}}'</code>.</p></div>
<div class="definition-card"><h4>ClusterServiceVersion (CSV)</h4><p>The operator descriptor — contains its deployment spec, CRDs, permissions, and version. A CSV in <code>Succeeded</code> phase means the operator is healthy. <code>Installing</code> or <code>Failed</code> indicates a problem.</p></div>
<div class="definition-card"><h4>OperatorGroup</h4><p>Defines which namespaces an operator watches. <code>targetNamespaces: []</code> (or omitted) = cluster-wide (AllNamespaces). A single namespace entry = SingleNamespace mode. Required before installing a namespaced operator.</p></div>

<pre><span class="c"># List all installed operators (CSVs) across all namespaces</span>
oc get csv -A

<span class="c"># Show a CSV's status — look for Succeeded</span>
oc get csv -n openshift-operators -o wide

<span class="c"># Inspect a Subscription</span>
oc get sub -A
oc describe sub &lt;name&gt; -n &lt;namespace&gt;

<span class="c"># List and approve a pending InstallPlan (Manual mode)</span>
oc get installplan -n &lt;namespace&gt;
oc patch installplan &lt;name&gt; -n &lt;namespace&gt; \
  --type merge -p '{"spec":{"approved":true}}'

<span class="c"># Check CatalogSources health</span>
oc get catalogsource -n openshift-marketplace
oc get pods -n openshift-marketplace   <span class="c"># each CatalogSource runs a pod</span>

<span class="c"># Uninstall an operator fully</span>
oc delete subscription &lt;name&gt; -n &lt;namespace&gt;
oc delete csv &lt;csv-name&gt; -n &lt;namespace&gt;
<span class="c"># CRDs are NOT removed automatically — delete manually if needed</span></pre>

<div class="section-title">Disconnected / Air-Gapped Operators</div>
<div class="definition-card"><h4>ImageContentSourcePolicy / ImageDigestMirrorSet</h4><p>Redirects operator image pulls from Red Hat registries to an internal mirror. ICSP is the legacy resource (OCP ≤ 4.12); IDMS (ImageDigestMirrorSet) is the replacement in OCP 4.13+. Both are cluster-scoped and cause MCO to restart nodes when applied.</p></div>
<pre><span class="c"># Mirror an operator index to a private registry</span>
oc mirror --config=./imageset-config.yaml \
  docker://registry.internal.example.com/mirror

<span class="c"># Apply the generated ICSP/IDMS and CatalogSource</span>
oc apply -f ./oc-mirror-workspace/results-*/</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/operators/index" target="_blank" rel="noopener">Operators — OCP 4.21 ↗</a></div>
`},

{id:'etcd-backup', label:'etcd Backup & Restore (EX380)', content:`
<h3>etcd Backup &amp; Restore (EX380)</h3>
<p class="topic-desc">etcd holds all cluster state. Backing it up — and knowing how to restore from backup — is a critical EX380 skill and a real-world operational requirement.</p>

<div class="section-title">Why etcd Backup Matters</div>
<div class="tip"><strong>💡 When to restore etcd:</strong> Cluster state corruption, accidental mass deletion, failed upgrade, or a control plane node catastrophically failing and leaving fewer than the quorum of etcd members alive (usually need 2 of 3).</div>

<div class="section-title">Taking an etcd Backup</div>
<pre><span class="c"># SSH to any control-plane node (master)</span>
ssh core@&lt;master-node&gt;

<span class="c"># Run the cluster-backup script (ships with OCP)</span>
sudo /usr/local/bin/cluster-backup.sh /home/core/backup

<span class="c"># This produces two files in the target directory:</span>
<span class="c">#   snapshot_&lt;timestamp&gt;.db   — etcd data snapshot</span>
<span class="c">#   static_kuberesources_&lt;timestamp&gt;.tar.gz — static pod manifests</span>

<span class="c"># Copy the backup off the cluster</span>
scp core@&lt;master-node&gt;:/home/core/backup/* ./etcd-backup/</pre>
<div class="warn"><strong>⚠️ Backup location:</strong> Always copy the backup to an external location (object storage, NFS, another server). A backup stored only on the same node that may need to be restored is useless.</div>

<div class="section-title">Restoring etcd from Backup</div>
<pre><span class="c"># 1. SSH to the control-plane node you will restore FROM</span>
<span class="c">#    (the "recovery host" — usually the node with the most recent backup)</span>

<span class="c"># 2. Copy backup files to the recovery host</span>
scp ./etcd-backup/* core@&lt;recovery-node&gt;:/home/core/backup/

<span class="c"># 3. On the recovery host, run the restore script</span>
sudo /usr/local/bin/cluster-restore.sh /home/core/backup

<span class="c"># 4. The script will:</span>
<span class="c">#   - Stop etcd and the API server static pods</span>
<span class="c">#   - Restore the snapshot to the etcd data directory</span>
<span class="c">#   - Restart static pods</span>

<span class="c"># 5. Wait for the API server to come back</span>
watch oc get nodes   <span class="c"># from a separate terminal with a valid kubeconfig</span>

<span class="c"># 6. Force etcd redeployment to remove stale members</span>
oc get etcd cluster -o yaml
oc patch etcd cluster --type merge \
  -p '{"spec":{"forceRedeploymentReason":"recovery-'$(date --iso-8601=minutes)'"}}'

<span class="c"># 7. Monitor etcd operator recovery</span>
oc get etcd cluster -o jsonpath='{.status.conditions}' | jq</pre>

<div class="section-title">etcd Health Checks</div>
<pre><span class="c"># Check etcd member health from inside a master node</span>
sudo -E etcdctl endpoint health \
  --endpoints=https://localhost:2379 \
  --cacert=/etc/kubernetes/static-pod-resources/etcd-certs/configmaps/etcd-serving-ca/ca-bundle.crt \
  --cert=/etc/kubernetes/static-pod-resources/etcd-certs/secrets/etcd-all-certs/etcd-peer-master-0.crt \
  --key=/etc/kubernetes/static-pod-resources/etcd-certs/secrets/etcd-all-certs/etcd-peer-master-0.key

<span class="c"># Check etcd operator status</span>
oc get clusteroperator etcd
oc describe clusteroperator etcd</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/backup_and_restore/index" target="_blank" rel="noopener">Backup and Restore — OCP 4.21 ↗</a></div>
`},

{id:'cluster-monitoring-config', label:'Monitoring & Alerting Config (EX380)', content:`
<h3>Monitoring, Alerting &amp; Custom Metrics (EX380)</h3>
<p class="topic-desc">EX380 tests deep knowledge of OpenShift's Prometheus-based monitoring stack: configuring retention, persistent storage, alert routing, and enabling user workload monitoring.</p>

<div class="section-title">Cluster Monitoring Stack</div>
<div class="definition-card"><h4>Cluster Monitoring Operator (CMO)</h4><p>Manages the entire monitoring stack in <code>openshift-monitoring</code>: Prometheus (x2 replicas), Alertmanager (x2), Thanos Querier, kube-state-metrics, node-exporter, and Grafana. Configured via a single ConfigMap.</p></div>
<div class="definition-card"><h4>User Workload Monitoring</h4><p>A second Prometheus stack in <code>openshift-user-workload-monitoring</code> that scrapes ServiceMonitor/PodMonitor CRDs created in tenant namespaces. Must be explicitly enabled. Allows developers to define alerts for their own applications without cluster-admin access.</p></div>

<pre><span class="c"># Enable user workload monitoring</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-monitoring-config
  namespace: openshift-monitoring
data:
  config.yaml: |
    enableUserWorkload: true
EOF

<span class="c"># Configure Prometheus retention and persistent storage</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-monitoring-config
  namespace: openshift-monitoring
data:
  config.yaml: |
    enableUserWorkload: true
    prometheusK8s:
      retention: 15d
      volumeClaimTemplate:
        spec:
          storageClassName: gp3-csi
          resources:
            requests:
              storage: 40Gi
    alertmanagerMain:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3-csi
          resources:
            requests:
              storage: 2Gi
EOF</pre>

<div class="section-title">ServiceMonitor &amp; PrometheusRule</div>
<pre><span class="c"># Create a ServiceMonitor for an app (user workload monitoring)</span>
cat &lt;&lt;EOF | oc apply -f - -n myapp
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp-monitor
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
EOF

<span class="c"># Create a custom alert rule</span>
cat &lt;&lt;EOF | oc apply -f - -n myapp
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: myapp-alerts
spec:
  groups:
  - name: myapp.rules
    rules:
    - alert: MyAppHighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) &gt; 0.1
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "High error rate on myapp"
EOF</pre>

<div class="section-title">Alertmanager Configuration</div>
<pre><span class="c"># Get the current alertmanager config secret</span>
oc get secret alertmanager-main -n openshift-monitoring \
  -o jsonpath='{.data.alertmanager\.yaml}' | base64 -d

<span class="c"># Create a custom alertmanager config (routes to Slack)</span>
cat &lt;&lt;EOF &gt; /tmp/alertmanager.yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
route:
  receiver: slack-notifications
  group_by: [alertname, namespace]
receivers:
- name: slack-notifications
  slack_configs:
  - channel: '#alerts'
    text: '{{ .CommonAnnotations.summary }}'
EOF
oc create secret generic alertmanager-main \
  --from-file=alertmanager.yaml=/tmp/alertmanager.yaml \
  -n openshift-monitoring --dry-run=client -o yaml | oc replace -f -</pre>

<div class="section-title">Useful Monitoring Commands</div>
<pre><span class="c"># Access Prometheus UI (port-forward)</span>
oc port-forward svc/prometheus-operated 9090 -n openshift-monitoring

<span class="c"># Query metrics via API</span>
TOKEN=$(oc whoami -t)
curl -H "Authorization: Bearer $TOKEN" \
  "https://$(oc get route thanos-querier -n openshift-monitoring \
  -o jsonpath='{.spec.host}')/api/v1/query?query=up"

<span class="c"># Check Alertmanager status</span>
oc exec -n openshift-monitoring alertmanager-main-0 -- \
  amtool alert query</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/monitoring/index" target="_blank" rel="noopener">Monitoring — OCP 4.21 ↗</a></div>
`},

{id:'acm-governance', label:'ACM Policy & Governance (EX432)', content:`
<h3>ACM Policy, Governance &amp; Cluster Lifecycle (EX432)</h3>
<p class="topic-desc">EX432 (OpenShift Advanced Cluster Management Specialist) tests ACM-specific skills: policy enforcement, cluster lifecycle, GitOps application delivery, and fleet observability across multiple clusters.</p>

<div class="section-title">ACM Hub Architecture</div>
<div class="definition-card"><h4>Hub Cluster</h4><p>Runs the MultiClusterHub operator and all ACM server-side components. Acts as the central management plane for a fleet. One hub manages many managed clusters via the open-cluster-management (OCM) agent on each spoke.</p></div>
<div class="definition-card"><h4>Managed Cluster (spoke)</h4><p>Any OCP or Kubernetes cluster imported into ACM. The <code>klusterlet</code> agent and <code>work-agent</code> run on the managed cluster, receiving ManifestWork objects from the hub and reporting status back.</p></div>

<div class="section-title">Importing a Cluster</div>
<pre><span class="c"># Auto-import via ACM console: Clusters → Import → provide kubeconfig</span>

<span class="c"># CLI import: create ManagedCluster CR and KlusterletAddonConfig</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: cluster.open-cluster-management.io/v1
kind: ManagedCluster
metadata:
  name: spoke-cluster-1
  labels:
    cloud: AWS
    region: us-east-1
    environment: prod
spec:
  hubAcceptsClient: true
EOF

<span class="c"># Get the import command to run on the spoke cluster</span>
oc get secret spoke-cluster-1-import \
  -n spoke-cluster-1 \
  -o jsonpath='{.data.import\.yaml}' | base64 -d | oc apply -f -

<span class="c"># Verify the cluster joined</span>
oc get managedcluster spoke-cluster-1</pre>

<div class="section-title">ACM Governance Policies</div>
<div class="definition-card"><h4>Policy</h4><p>The ACM governance CRD. Defines a desired state that must exist (or must not exist) on managed clusters. <code>remediationAction: inform</code> (report only) or <code>enforce</code> (auto-remediate). Policies are composed of one or more policy templates.</p></div>
<div class="definition-card"><h4>PlacementBinding</h4><p>Binds a Policy (or PolicySet) to a Placement so ACM knows which clusters the policy applies to. Must exist alongside the Policy and Placement for the policy to be evaluated.</p></div>
<pre><span class="c"># Example: enforce that a namespace exists on all prod clusters</span>
cat &lt;&lt;EOF | oc apply -f - -n policies
apiVersion: policy.open-cluster-management.io/v1
kind: Policy
metadata:
  name: require-monitoring-namespace
spec:
  remediationAction: enforce
  disabled: false
  policy-templates:
  - objectDefinition:
      apiVersion: policy.open-cluster-management.io/v1
      kind: ConfigurationPolicy
      metadata:
        name: monitoring-namespace
      spec:
        remediationAction: enforce
        severity: high
        object-templates:
        - complianceType: MustHave
          objectDefinition:
            apiVersion: v1
            kind: Namespace
            metadata:
              name: custom-monitoring
---
apiVersion: cluster.open-cluster-management.io/v1beta2
kind: Placement
metadata:
  name: prod-placement
  namespace: policies
spec:
  predicates:
  - requiredClusterSelector:
      labelSelector:
        matchLabels:
          environment: prod
---
apiVersion: policy.open-cluster-management.io/v1
kind: PlacementBinding
metadata:
  name: require-monitoring-binding
  namespace: policies
placementRef:
  name: prod-placement
  apiGroup: cluster.open-cluster-management.io
  kind: Placement
subjects:
- name: require-monitoring-namespace
  apiGroup: policy.open-cluster-management.io
  kind: Policy
EOF

<span class="c"># Check policy compliance across all clusters</span>
oc get policy -n policies
oc describe policy require-monitoring-namespace -n policies</pre>

<div class="section-title">ApplicationSet (GitOps Fleet Delivery)</div>
<pre><span class="c"># Deploy an app to all prod clusters using ApplicationSet + ACM Placement</span>
cat &lt;&lt;EOF | oc apply -f - -n openshift-gitops
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-fleet
spec:
  generators:
  - clusterDecisionResource:
      configMapRef: acm-placement
      labelSelector:
        matchLabels:
          cluster.open-cluster-management.io/placement: prod-placement
      requeueAfterSeconds: 180
  template:
    metadata:
      name: 'myapp-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/org/myapp-config
        targetRevision: main
        path: overlays/prod
      destination:
        server: '{{server}}'
        namespace: myapp
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
EOF</pre>

<div class="section-title">MultiClusterObservability</div>
<pre><span class="c"># Check observability hub components</span>
oc get pods -n open-cluster-management-observability

<span class="c"># Check that spoke metrics are flowing (query from hub Thanos)</span>
oc port-forward svc/observability-thanos-query-frontend \
  9090 -n open-cluster-management-observability</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes" target="_blank" rel="noopener">Red Hat ACM Documentation ↗</a></div>
`},

{id:'gitops-argocd', label:'OpenShift GitOps / ArgoCD (EX380/EX432)', content:`
<h3>OpenShift GitOps &amp; ArgoCD</h3>
<p class="topic-desc">OpenShift GitOps is based on ArgoCD. It provides continuous delivery driven by Git as the single source of truth. EX380 tests GitOps configuration; EX432 tests fleet-scale GitOps via ApplicationSets and ACM integration.</p>

<div class="section-title">Core Concepts</div>
<div class="definition-card"><h4>Application CR</h4><p>The primary ArgoCD/GitOps object. Defines a source (Git repo + path), a destination (cluster + namespace), and sync policy. ArgoCD continuously compares the live cluster state to the desired state in Git and reports drift (or auto-heals it).</p></div>
<div class="definition-card"><h4>AppProject</h4><p>Defines RBAC for ArgoCD Applications: which source repos are allowed, which destination clusters/namespaces are allowed, and which resource kinds can be deployed. The <code>default</code> project allows everything — create custom projects for multi-team environments.</p></div>
<div class="definition-card"><h4>Sync Policy</h4><p><code>automated.prune: true</code> removes resources from the cluster that are no longer in Git. <code>automated.selfHeal: true</code> reverts manual changes made to the cluster. Both are disabled by default.</p></div>

<pre><span class="c"># Install the OpenShift GitOps Operator (via subscription)</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: openshift-gitops-operator
  namespace: openshift-operators
spec:
  channel: latest
  name: openshift-gitops-operator
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF

<span class="c"># Get the ArgoCD admin password</span>
oc extract secret/openshift-gitops-cluster \
  -n openshift-gitops --to=-

<span class="c"># Create an ArgoCD Application</span>
cat &lt;&lt;EOF | oc apply -f - -n openshift-gitops
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  project: default
  source:
    repoURL: https://github.com/org/myapp-config
    targetRevision: HEAD
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
EOF

<span class="c"># Check sync status</span>
oc get application -n openshift-gitops
oc describe application myapp -n openshift-gitops

<span class="c"># Trigger manual sync</span>
argocd app sync myapp --grpc-web</pre>

<div class="section-title">Adding Private Git Repos</div>
<pre><span class="c"># Add a private repo via HTTPS with credentials</span>
oc create secret generic myrepo-creds \
  --from-literal=type=git \
  --from-literal=url=https://github.com/myorg/private-repo \
  --from-literal=username=myuser \
  --from-literal=password=ghp_xxxxx \
  -n openshift-gitops
oc label secret myrepo-creds \
  argocd.argoproj.io/secret-type=repository \
  -n openshift-gitops</pre>

<div class="section-title">Kustomize &amp; Helm with ArgoCD</div>
<pre><span class="c"># Kustomize overlay — ArgoCD auto-detects kustomization.yaml</span>
<span class="c"># source.path just needs to point to the kustomize directory</span>

<span class="c"># Helm chart from a repo</span>
<span class="c"># In Application spec:</span>
<span class="c">#   source:</span>
<span class="c">#     chart: mychart</span>
<span class="c">#     repoURL: https://charts.example.com</span>
<span class="c">#     targetRevision: 1.2.3</span>
<span class="c">#     helm:</span>
<span class="c">#       valueFiles: [values-prod.yaml]</span>
<span class="c">#       parameters:</span>
<span class="c">#       - name: image.tag</span>
<span class="c">#         value: v2.0.0</span></pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/red_hat_openshift_gitops" target="_blank" rel="noopener">OpenShift GitOps Documentation ↗</a></div>
`},

{id:'tekton-pipelines', label:'Tekton Pipelines & CI/CD (EX280/EX380)', content:`
<h3>Tekton Pipelines &amp; OpenShift CI/CD</h3>
<p class="topic-desc">OpenShift Pipelines is built on Tekton — a cloud-native Kubernetes-native CI/CD framework. Tasks, Pipelines, PipelineRuns, and Triggers are the core objects tested on EX280 and EX380.</p>

<div class="section-title">Core Tekton Objects</div>
<div class="definition-card"><h4>Task</h4><p>The smallest unit of work. Defines a sequence of Steps (each a container). Can have Parameters, Workspaces, and Results. Tasks are reusable and can be shared across Pipelines via the Tekton Hub or a ClusterTask.</p></div>
<div class="definition-card"><h4>Pipeline</h4><p>An ordered graph of Tasks. Defines how parameters flow between tasks, which workspaces are shared, and which tasks run in parallel vs. sequentially. A Pipeline does not run on its own — a PipelineRun instantiates it.</p></div>
<div class="definition-card"><h4>PipelineRun</h4><p>A specific execution of a Pipeline. Provides parameter values, workspace bindings (PVCs), and triggers creation of TaskRuns. Monitor its status to track pipeline progress.</p></div>
<div class="definition-card"><h4>EventListener + TriggerTemplate</h4><p>Receives webhook events (GitHub push, PR) and creates PipelineRuns automatically. The EventListener is a pod that exposes an HTTP endpoint; TriggerBindings extract values from the event payload; TriggerTemplates define what to create.</p></div>

<pre><span class="c"># List all Pipelines and Tasks</span>
oc get pipeline,task -n myapp

<span class="c"># Start a pipeline run interactively</span>
tkn pipeline start my-build-pipeline \
  -p IMAGE=quay.io/myorg/myapp:latest \
  -w name=source,claimName=pipeline-pvc \
  -n myapp

<span class="c"># Watch a PipelineRun</span>
tkn pipelinerun logs --last -f -n myapp

<span class="c"># List recent PipelineRuns</span>
oc get pipelinerun -n myapp --sort-by=.metadata.creationTimestamp

<span class="c"># Describe a failed TaskRun for details</span>
tkn taskrun describe --last -n myapp</pre>

<div class="section-title">S2I Build Pipeline Pattern</div>
<pre><span class="c"># Create a BuildConfig (legacy — still on exam)</span>
oc new-build --strategy=source \
  --image-stream=python:3.11 \
  --name=myapp-build \
  https://github.com/org/myapp.git

<span class="c"># Trigger a build manually</span>
oc start-build myapp-build

<span class="c"># Follow build logs</span>
oc logs -f bc/myapp-build

<span class="c"># Set a webhook trigger on the BuildConfig</span>
oc describe bc/myapp-build | grep -A 5 "Webhook GitHub"</pre>

<div class="section-title">Workspace &amp; PVC Patterns</div>
<pre><span class="c"># Create a PVC for pipeline workspace</span>
cat &lt;&lt;EOF | oc apply -f - -n myapp
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pipeline-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
EOF

<span class="c"># Tekton VolumeClaimTemplate (auto-creates PVC per run)</span>
<span class="c"># In PipelineRun spec:</span>
<span class="c">#   workspaces:</span>
<span class="c">#   - name: source</span>
<span class="c">#     volumeClaimTemplate:</span>
<span class="c">#       spec:</span>
<span class="c">#         accessModes: [ReadWriteOnce]</span>
<span class="c">#         resources:</span>
<span class="c">#           requests:</span>
<span class="c">#             storage: 1Gi</span></pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/red_hat_openshift_pipelines" target="_blank" rel="noopener">OpenShift Pipelines Documentation ↗</a></div>
`},

{id:'acs-security', label:'Advanced Cluster Security (EX430)', content:`
<h3>Red Hat Advanced Cluster Security — RHACS (EX430)</h3>
<p class="topic-desc">RHACS (Red Hat Advanced Cluster Security for Kubernetes) provides vulnerability management, runtime threat detection, compliance scanning, and network policy enforcement for OpenShift workloads. EX430 tests installation, policy authoring, CI/CD integration, and runtime response.</p>

<div class="section-title">Architecture</div>
<div class="definition-card"><h4>Central</h4><p>The RHACS server — hosts the web console, policy engine, image scanner, and PostgreSQL database. Runs in the <code>stackrox</code> namespace. One Central manages many Secured Clusters. Access at <code>https://central-stackrox.apps.&lt;cluster&gt;</code>.</p></div>
<div class="definition-card"><h4>Secured Cluster components</h4><p>Three components deploy on every Secured Cluster:</p>
<ul style="margin:0.4rem 0 0 1rem;padding:0">
  <li><strong>Sensor</strong> — watches Kubernetes API events; enforces deploy-time policies; communicates with Central</li>
  <li><strong>Collector</strong> — DaemonSet; captures runtime process execution and network connections at the kernel level via eBPF</li>
  <li><strong>Admission Controller</strong> — ValidatingWebhook; blocks or warns on deployments violating policies before pods are scheduled</li>
</ul></div>
<div class="tip"><strong>💡 Central ≠ Secured Cluster:</strong> Central can run on a separate cluster (or even the same one). The Secured Cluster is any cluster you want to monitor — it just needs Sensor + Collector + Admission Controller deployed via an init bundle.</div>

<div class="section-title">Installation</div>
<pre><span class="c"># 1. Install the RHACS Operator from OperatorHub</span>
<span class="c">#    (namespace: rhacs-operator)</span>

<span class="c"># 2. Create a Central instance</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: platform.stackrox.io/v1alpha1
kind: Central
metadata:
  name: stackrox-central-services
  namespace: stackrox
spec:
  central:
    exposure:
      route:
        enabled: true
    db:
      isEnabled: Default
  egress:
    connectivityPolicy: Online
  scanner:
    analyzer:
      scaling:
        autoScaling: Enabled
EOF

<span class="c"># 3. Get the admin password</span>
oc get secret central-htpasswd -n stackrox \
  -o jsonpath='{.data.password}' | base64 -d

<span class="c"># 4. Generate an init bundle for a Secured Cluster</span>
roxctl central init-bundles generate my-cluster \
  --output-secrets cluster-init-bundle.yaml \
  --central-endpoint central-stackrox.apps.&lt;cluster&gt;:443

<span class="c"># 5. Apply the bundle on the Secured Cluster</span>
oc apply -f cluster-init-bundle.yaml -n stackrox

<span class="c"># 6. Create a SecuredCluster CR on the Secured Cluster</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: platform.stackrox.io/v1alpha1
kind: SecuredCluster
metadata:
  name: stackrox-secured-cluster-services
  namespace: stackrox
spec:
  clusterName: my-cluster
  admissionControl:
    listenOnCreates: true
    listenOnUpdates: true
    enforceOnCreates: true
EOF</pre>

<div class="section-title">Vulnerability Management</div>
<pre><span class="c"># Scan an image via CLI (roxctl must be configured with Central endpoint)</span>
roxctl image scan \
  --image=quay.io/myorg/myapp:latest \
  --endpoint=central-stackrox.apps.&lt;cluster&gt;:443 \
  --output=table

<span class="c"># Check image against policies (returns non-zero on policy violation)</span>
roxctl image check \
  --image=quay.io/myorg/myapp:latest \
  --endpoint=central-stackrox.apps.&lt;cluster&gt;:443

<span class="c"># Use in CI/CD (fails the pipeline on critical CVE policy violation)</span>
roxctl image check \
  --image=quay.io/myorg/myapp:$(git rev-parse --short HEAD) \
  --endpoint=$ROX_CENTRAL_ADDRESS \
  --token-file=$ROX_API_TOKEN_FILE</pre>

<div class="section-title">Policy Lifecycle Stages</div>
<div class="definition-card"><h4>Build</h4><p>Policy evaluated when an image is built or scanned. Enforced via <code>roxctl image check</code> in CI/CD. Example: "Image must not contain critical CVEs with a fix available."</p></div>
<div class="definition-card"><h4>Deploy</h4><p>Policy evaluated by the Admission Controller when a Deployment/Pod is created or updated. Blocks or warns before the workload runs. Example: "Container must not run as root UID."</p></div>
<div class="definition-card"><h4>Runtime</h4><p>Policy evaluated continuously by Sensor against live process and network activity captured by Collector. Example: "Alert if bash or curl exec'd in a production container."</p></div>
<div class="warn"><strong>⚠️ Enforcement vs. Inform:</strong> ACS policies default to <strong>Inform</strong> (generate violation, no blocking). Set enforcement to <strong>Enforce</strong> to block at deploy time or kill pods at runtime. Always test in Inform mode first.</div>

<div class="section-title">Network Graph &amp; Policy Generator</div>
<pre><span class="c"># In the RHACS console: Network → Network Graph</span>
<span class="c"># View all observed connections between deployments</span>
<span class="c"># Green = active flow, grey = allowed-but-not-observed</span>

<span class="c"># Generate NetworkPolicy YAML from observed traffic</span>
<span class="c"># 1. Select a namespace in the Network Graph</span>
<span class="c"># 2. Click "Network Policy Simulator"</span>
<span class="c"># 3. Download the generated NetworkPolicy YAML</span>
<span class="c"># 4. Apply: oc apply -f generated-netpol.yaml</span></pre>

<div class="section-title">Compliance</div>
<pre><span class="c"># Run a compliance scan from the RHACS console</span>
<span class="c"># Compliance → Compliance (1.0) → Scan Environment</span>
<span class="c"># Profiles: CIS OCP 4, CIS K8s, NIST 800-53, PCI-DSS, HIPAA</span>

<span class="c"># The Compliance Operator integrates with ACS:</span>
<span class="c"># Install Compliance Operator, create ScanSetting + ScanSettingBinding</span>
<span class="c"># ACS pulls results and shows them in the Compliance dashboard</span>

<span class="c"># Check compliance results via CLI</span>
oc get compliancecheckresult -A | grep FAIL | head -20</pre>

<div class="section-title">Key Commands</div>
<pre><span class="c"># Check RHACS components on a secured cluster</span>
oc get pods -n stackrox

<span class="c"># Get Central admin password</span>
oc get secret central-htpasswd -n stackrox \
  -o jsonpath='{.data.password}' | base64 -d &amp;&amp; echo

<span class="c"># List policy violations via roxctl</span>
roxctl central debug dump --output-dir ./debug-dump \
  --endpoint=$ROX_CENTRAL_ADDRESS

<span class="c"># List all ACS policies (REST API)</span>
curl -sk -H "Authorization: Bearer $ROX_API_TOKEN" \
  "https://$ROX_CENTRAL_ADDRESS/v1/policies" | jq '.policies[].name'</pre>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_security_for_kubernetes" target="_blank" rel="noopener">Red Hat ACS Documentation ↗</a></div>
`},

{id:'odf-deep-dive', label:'OpenShift Data Foundation (EX370)', content:`
<h3>OpenShift Data Foundation — ODF (EX370)</h3>
<p class="topic-desc">ODF is Red Hat's software-defined storage platform for OpenShift, built on Rook-Ceph and NooBaa. EX370 tests deploying ODF, provisioning block/file/object storage, configuring disaster recovery, and troubleshooting storage issues.</p>

<div class="section-title">Storage Types &amp; StorageClasses</div>
<div class="definition-card"><h4>Block (Ceph RBD) — ReadWriteOnce</h4><p>Each PVC maps to a Ceph image (raw block device). Best for databases, stateful apps that need dedicated disk I/O. StorageClass: <code>ocs-storagecluster-ceph-rbd</code>. Supports VolumeSnapshots for backup.</p></div>
<div class="definition-card"><h4>File (CephFS) — ReadWriteMany</h4><p>Multiple pods mount the same PVC simultaneously. Best for shared config, media serving, CI artifact caching. StorageClass: <code>ocs-storagecluster-cephfs</code>. Backed by Ceph MDS (metadata server).</p></div>
<div class="definition-card"><h4>Object (S3 / NooBaa MCG) — ObjectBucketClaim</h4><p>S3-compatible object storage via NooBaa Multicloud Gateway. Apps request buckets via ObjectBucketClaim; ODF provisions a bucket and injects endpoint/credentials as a ConfigMap + Secret.</p></div>

<div class="section-title">Ceph Daemon Architecture</div>
<div class="definition-card"><h4>MON (Monitor)</h4><p>Maintains the cluster map quorum. 3 required for production. Failure of 2+ MONs makes the cluster unavailable. Check: <code>oc get pods -n openshift-storage | grep rook-ceph-mon</code></p></div>
<div class="definition-card"><h4>OSD (Object Storage Daemon)</h4><p>One per disk. Handles actual data storage, replication, and recovery. Minimum 3 OSDs for 3-way replication. The most common failure unit — individual OSD failure is tolerated.</p></div>
<div class="definition-card"><h4>MGR (Manager)</h4><p>Hosts the Ceph dashboard, Prometheus exporter, and the CRUSH/balancer modules. Two MGR pods for HA in ODF.</p></div>
<div class="definition-card"><h4>MDS (Metadata Server)</h4><p>Required for CephFS only. Handles filesystem namespace operations. Two MDS pods (active + standby). Data I/O bypasses MDS — only metadata (ls, stat, mkdir) hits it.</p></div>

<pre><span class="c"># Check overall ODF health</span>
oc get storagecluster -n openshift-storage
oc get cephcluster -n openshift-storage

<span class="c"># Check all ODF pods</span>
oc get pods -n openshift-storage

<span class="c"># Check Ceph cluster health via the toolbox</span>
oc rsh -n openshift-storage \
  $(oc get pod -n openshift-storage -l app=rook-ceph-tools \
  -o jsonpath='{.items[0].metadata.name}')
ceph status
ceph osd status
ceph df</pre>

<div class="section-title">Deploying ODF</div>
<pre><span class="c"># 1. Label storage nodes (minimum 3)</span>
oc label node &lt;node1&gt; cluster.ocs.openshift.io/openshift-storage=""
oc label node &lt;node2&gt; cluster.ocs.openshift.io/openshift-storage=""
oc label node &lt;node3&gt; cluster.ocs.openshift.io/openshift-storage=""

<span class="c"># 2. Install ODF Operator from OperatorHub</span>
<span class="c">#    (namespace: openshift-storage)</span>

<span class="c"># 3. Create the StorageSystem (triggers StorageCluster creation)</span>
<span class="c">#    Web console: Storage → Data Foundation → Create StorageSystem</span>
<span class="c">#    OR apply a StorageCluster CR directly:</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: ocs.openshift.io/v1
kind: StorageCluster
metadata:
  name: ocs-storagecluster
  namespace: openshift-storage
spec:
  storageDeviceSets:
  - name: ocs-deviceset
    count: 1
    replica: 3
    dataPVCTemplate:
      spec:
        storageClassName: gp3-csi
        accessModes: [ReadWriteOnce]
        resources:
          requests:
            storage: 512Gi
EOF</pre>

<div class="section-title">ObjectBucketClaim (S3)</div>
<pre><span class="c"># Request an S3 bucket</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: objectbucket.io/v1alpha1
kind: ObjectBucketClaim
metadata:
  name: my-bucket
  namespace: myapp
spec:
  generateBucketName: my-bucket
  storageClassName: openshift-storage.noobaa.io
EOF

<span class="c"># ODF creates a ConfigMap and Secret with the same name</span>
oc get cm my-bucket -n myapp -o yaml   <span class="c"># endpoint, bucket name</span>
oc get secret my-bucket -n myapp -o yaml   <span class="c"># access key, secret key</span>

<span class="c"># Use in a pod (env vars)</span>
<span class="c"># envFrom:</span>
<span class="c">#   - configMapRef: { name: my-bucket }</span>
<span class="c">#   - secretRef:    { name: my-bucket }</span></pre>

<div class="section-title">ODF Disaster Recovery</div>
<div class="definition-card"><h4>Regional DR (Async)</h4><p>Two separate ODF clusters in different sites. Ceph RBD mirroring replicates block volumes asynchronously. RPO &gt; 0. Use when sites are geographically distant (high latency). Requires ACM + ODF DR operator + MirrorPeer exchange between sites.</p></div>
<div class="definition-card"><h4>Metro DR (Sync)</h4><p>Two ODF clusters with synchronous RBD mirroring. RPO = 0 — every write completes on both sites before acknowledging. Requires &lt;5ms latency between sites. A third arbiter site provides quorum. Higher write latency than async DR.</p></div>
<pre><span class="c"># Check MirrorPeer status (on hub cluster)</span>
oc get mirrorpeer

<span class="c"># Check VolumeReplicationGroups (on primary cluster)</span>
oc get volumereplicationgroup -A

<span class="c"># Trigger application failover (on hub cluster)</span>
oc patch drplacementcontrol &lt;name&gt; -n &lt;namespace&gt; \
  --type merge -p '{"spec":{"action":"Failover","failoverCluster":"&lt;secondary-cluster-name&gt;"}}'

<span class="c"># Trigger relocate (move back to primary after recovery)</span>
oc patch drplacementcontrol &lt;name&gt; -n &lt;namespace&gt; \
  --type merge -p '{"spec":{"action":"Relocate","preferredCluster":"&lt;primary-cluster-name&gt;"}}'</pre>

<div class="section-title">Troubleshooting ODF</div>
<pre><span class="c"># Open the Ceph toolbox for raw ceph commands</span>
oc rsh -n openshift-storage \
  $(oc get pod -n openshift-storage -l app=rook-ceph-tools \
  -o jsonpath='{.items[0].metadata.name}')

ceph status                    <span class="c"># overall health: HEALTH_OK / WARN / ERR</span>
ceph osd status                <span class="c"># per-OSD up/down/weight</span>
ceph osd df                    <span class="c"># disk usage per OSD</span>
ceph df                        <span class="c"># pool-level usage</span>
ceph health detail             <span class="c"># full health warning text</span>
ceph pg stat                   <span class="c"># placement group summary</span>
rados df                       <span class="c"># object-level stats</span>

<span class="c"># Check ODF operator logs</span>
oc logs -n openshift-storage \
  $(oc get pod -n openshift-storage -l app=ocs-operator \
  -o jsonpath='{.items[0].metadata.name}') | tail -50

<span class="c"># Check a specific OSD that is down</span>
oc logs -n openshift-storage \
  $(oc get pod -n openshift-storage -l osd=&lt;id&gt; \
  -o jsonpath='{.items[0].metadata.name}')</pre>

<div class="warn"><strong>⚠️ HEALTH_WARN vs HEALTH_ERR:</strong> HEALTH_WARN means the cluster is functional but degraded (e.g. replication below target). HEALTH_ERR means I/O may be blocked. Always check <code>ceph health detail</code> to see the specific cause before taking action.</div>
<div class="tip"><strong>📖 Docs:</strong> <a href="https://access.redhat.com/documentation/en-us/red_hat_openshift_data_foundation" target="_blank" rel="noopener">ODF Documentation ↗</a> &nbsp;|&nbsp; <a href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/storage/index" target="_blank" rel="noopener">OCP Storage — OCP 4.21 ↗</a></div>
`},
];

