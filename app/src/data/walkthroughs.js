// ═══════════════════════════════════════════════════════════════════════════════
// WALKTHROUGH DATA
// ═══════════════════════════════════════════════════════════════════════════════
export const walkthroughs = [
{id:'deploy-image', title:'Deploy an App from a Container Image', desc:'Deploy a containerized application to OpenShift using an existing image and expose it externally.', steps:[
{h:'Log in and create a project',b:'Authenticate to the cluster and create an isolated namespace for your application.',cmd:`oc login https://api.&lt;cluster&gt;:6443 -u developer -p password
oc new-project myapp --description="My first application"`},
{h:'Deploy from a container image',b:"Create a Deployment using OpenShift's oc new-app command, which creates a Deployment, Service, and optionally an ImageStream.",cmd:`oc new-app --image=registry.access.redhat.com/ubi9/httpd-24:latest --name=webapp

<span class="c"># Verify resources were created</span>
oc get all`},
{h:'Wait for the pod to become Running',b:'Monitor the rollout. The pod must pull the image and pass health checks before it becomes Running.',cmd:`oc rollout status deployment/webapp
oc get pods -w   <span class="c"># -w watches for changes</span>`},
{h:'Expose the service with a Route',b:'Create an OpenShift Route to expose the Service externally via the cluster ingress router.',cmd:`oc expose svc/webapp
oc get routes     <span class="c"># shows the URL</span>
curl http://$(oc get route webapp -o jsonpath='{.spec.host}')`},
{h:'Scale the deployment',b:'Increase replicas for higher availability. OpenShift schedules pods across nodes automatically.',cmd:`oc scale deployment/webapp --replicas=3
oc get pods       <span class="c"># should show 3 pods</span>`},
]},

{id:'update-rollback', title:'Rolling Update & Rollback', desc:'Update a running application to a new image version and roll back if issues occur.', steps:[
{h:'Check current deployment state',b:'Record the current image and replica count before making changes.',cmd:`oc get deployment webapp -o wide
oc rollout history deployment/webapp`},
{h:'Update the container image',b:"Use 'oc set image' to trigger a rolling update. OpenShift gradually replaces old pods with new ones.",cmd:`oc set image deployment/webapp httpd-24=quay.io/myorg/webapp:v2

<span class="c"># Watch the rollout</span>
oc rollout status deployment/webapp`},
{h:'Verify the new version',b:'Confirm pods are running the new image.',cmd:`oc get pods
oc describe pod &lt;pod-name&gt; | grep Image
oc exec -it &lt;pod&gt; -- env | grep VERSION`},
{h:'Simulate a bad update',b:'Update to a bad image to see rollout behavior when pods fail.',cmd:`oc set image deployment/webapp httpd-24=quay.io/myorg/webapp:broken
oc rollout status deployment/webapp   <span class="c"># will hang/fail</span>
oc get pods   <span class="c"># see CrashLoopBackOff or ImagePullBackOff</span>`},
{h:'Roll back to previous version',b:"OpenShift stores rollout history. Use 'oc rollout undo' to instantly revert.",cmd:`oc rollout undo deployment/webapp
oc rollout status deployment/webapp

<span class="c"># Roll back to specific revision</span>
oc rollout history deployment/webapp
oc rollout undo deployment/webapp --to-revision=1`},
]},

{id:'storage-walkthrough', title:'Attach Persistent Storage to an App', desc:'Provision a PersistentVolumeClaim and attach it to a database pod for durable storage.', steps:[
{h:'Check available StorageClasses',b:"StorageClasses determine how storage is provisioned. Find the default class (marked with 'default' annotation).",cmd:`oc get storageclass
oc get storageclass -o yaml | grep storageclass.kubernetes.io/is-default-class`},
{h:'Create a PersistentVolumeClaim',b:'Define the storage request. The cluster will either bind to an existing PV or dynamically provision one.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF

oc get pvc    <span class="c"># status should be Bound</span>`},
{h:'Deploy a database using the PVC',b:'Create a Deployment that mounts the PVC at the database data directory.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: registry.redhat.io/rhel8/postgresql-13:latest
        env:
        - name: POSTGRESQL_USER
          value: myuser
        - name: POSTGRESQL_PASSWORD
          value: mypassword
        - name: POSTGRESQL_DATABASE
          value: mydb
        volumeMounts:
        - name: db-data
          mountPath: /var/lib/pgsql/data
      volumes:
      - name: db-data
        persistentVolumeClaim:
          claimName: db-data
EOF`},
{h:'Verify data persists across pod restarts',b:"Delete the pod and verify the database still has data when the pod restarts with the same PVC.",cmd:`<span class="c"># Write data to the database</span>
oc exec -it $(oc get pod -l app=postgres -o name) -- psql -U myuser mydb -c "CREATE TABLE test (id int);"

<span class="c"># Delete the pod (Deployment recreates it)</span>
oc delete pod -l app=postgres

<span class="c"># Wait for new pod, verify data</span>
oc exec -it $(oc get pod -l app=postgres -o name) -- psql -U myuser mydb -c "\\dt"`},
]},

{id:'config-secrets', title:'Inject Config & Secrets into Pods', desc:'Separate application configuration from the image using ConfigMaps and Secrets.', steps:[
{h:'Create a ConfigMap',b:'Store non-sensitive application configuration as key-value pairs.',cmd:`oc create configmap app-config \\
  --from-literal=LOG_LEVEL=info \\
  --from-literal=SERVER_PORT=8080 \\
  --from-literal=FEATURE_FLAG=true

oc get configmap app-config -o yaml`},
{h:'Create a Secret',b:'Store sensitive credentials. Values are automatically base64-encoded when using --from-literal.',cmd:`oc create secret generic db-creds \\
  --from-literal=DB_USER=admin \\
  --from-literal=DB_PASS=Secr3tP@ss!

<span class="c"># View secret (base64-encoded values)</span>
oc get secret db-creds -o yaml

<span class="c"># Decode a value</span>
oc get secret db-creds -o jsonpath='{.data.DB_USER}' | base64 -d`},
{h:'Inject into a Deployment',b:'Reference the ConfigMap and Secret in the Deployment pod template using envFrom.',cmd:`oc set env deployment/webapp \\
  --from=configmap/app-config \\
  --from=secret/db-creds

<span class="c"># Verify env vars are set</span>
oc exec -it &lt;pod&gt; -- env | grep -E "LOG_LEVEL|DB_USER"`},
{h:'Mount ConfigMap as files',b:'For config file injection (e.g., nginx.conf), mount the ConfigMap as a volume.',cmd:`<span class="c"># Add volume and mount via oc set</span>
oc set volume deployment/webapp \\
  --add --name=config-vol \\
  --type=configmap \\
  --configmap-name=app-config \\
  --mount-path=/etc/app/config

<span class="c"># Verify the files exist in the pod</span>
oc exec -it &lt;pod&gt; -- ls /etc/app/config`},
]},

{id:'troubleshoot-pod', title:'Troubleshoot a Failing Pod', desc:"Systematic approach to diagnose why a pod isn't starting or is crashing.", steps:[
{h:'Check pod status and events',b:"'oc describe pod' gives the most information: image pull errors, scheduling failures, OOMKills, failed probes.",cmd:`oc get pods
oc describe pod &lt;pod-name&gt;

<span class="c"># Focus on Events section at the bottom</span>
oc describe pod &lt;pod-name&gt; | tail -30`},
{h:'Read container logs',b:'Check stdout/stderr for application errors. Use --previous for crashed containers.',cmd:`oc logs &lt;pod-name&gt;
oc logs &lt;pod-name&gt; --previous    <span class="c"># crashed container logs</span>
oc logs &lt;pod-name&gt; -c &lt;container&gt;  <span class="c"># specific container</span>
oc logs &lt;pod-name&gt; --tail=50     <span class="c"># last 50 lines</span>`},
{h:'Execute commands inside the pod',b:'If the pod is running (even in error state), exec in to inspect the filesystem, env vars, and network.',cmd:`oc exec -it &lt;pod-name&gt; -- bash

<span class="c"># Inside the pod:</span>
env                           <span class="c"># check environment variables</span>
curl localhost:8080/healthz   <span class="c"># test health endpoint</span>
cat /etc/config/app.conf      <span class="c"># check mounted config</span>
ls -la /var/data              <span class="c"># check volume mount</span>`},
{h:'Debug with oc debug',b:"When a pod won't start (CrashLoopBackOff), use 'oc debug' to start a copy with a shell override.",cmd:`<span class="c"># Debug the deployment's pod template</span>
oc debug deployment/webapp

<span class="c"># Debug a specific pod</span>
oc debug pod/&lt;pod-name&gt;

<span class="c"># Inside the debug shell, run the app manually</span>
/usr/bin/run-app --verbose`},
{h:'Check resource quotas and limits',b:'Pods fail to schedule if the namespace quota is exceeded or node resources are insufficient.',cmd:`oc describe resourcequota
oc describe limitrange
oc get events --sort-by='.lastTimestamp' | tail -20`},
]},

{id:'cronjobs', title:'CronJobs, Jobs & Manual Triggers', desc:'Schedule recurring tasks with CronJobs, run one-off Jobs, and manually trigger a CronJob on demand.', steps:[
{h:'Understand Jobs vs CronJobs',b:'A Job runs pods to completion — it keeps retrying until the desired number of completions succeed. A CronJob wraps a Job and fires it on a schedule using standard cron syntax. Both are critical for batch processing, database maintenance, report generation, and cleanup tasks.',cmd:`<span class="c"># Cron syntax reminder:
#  ┌──── minute (0-59)
#  │ ┌── hour (0-23)
#  │ │ ┌─ day of month (1-31)
#  │ │ │ ┌ month (1-12)
#  │ │ │ │ ┌ day of week (0-6, Sun=0)
#  │ │ │ │ │
#  * * * * *
#
# Examples:
#   0 2 * * *     → every day at 2:00 AM
#   */5 * * * *   → every 5 minutes
#   0 9 * * 1     → every Monday at 9 AM
#   0 0 1 * *     → first day of every month at midnight</span>`},
{h:'Create a basic Job',b:'A Job runs a pod to completion. It retries on failure up to backoffLimit times. Use completions for parallel work (e.g., process 10 items) and parallelism to control concurrency.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-seed
spec:
  completions: 1        <span class="c"># total successful runs needed</span>
  parallelism: 1        <span class="c"># pods running at once</span>
  backoffLimit: 3       <span class="c"># retries before marking as Failed</span>
  activeDeadlineSeconds: 300  <span class="c"># hard timeout</span>
  template:
    spec:
      restartPolicy: OnFailure  <span class="c"># Never | OnFailure (required for Jobs)</span>
      containers:
      - name: seeder
        image: registry.access.redhat.com/ubi9/ubi:latest
        command: ["/bin/sh", "-c"]
        args:
        - |
          echo "Starting database seed..."
          sleep 10
          echo "Seed complete!"
EOF

<span class="c"># Watch it run</span>
oc get jobs
oc get pods -l job-name=db-seed
oc logs -l job-name=db-seed`},
{h:'Create a CronJob',b:'CronJobs create Jobs on a schedule. Key fields: schedule (cron expression), successfulJobsHistoryLimit (how many completed jobs to keep), failedJobsHistoryLimit, and concurrencyPolicy (Allow / Forbid / Replace).',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 2 * * *"              <span class="c"># every day at 2 AM</span>
  concurrencyPolicy: Forbid          <span class="c"># don't start if previous is still running</span>
  successfulJobsHistoryLimit: 3      <span class="c"># keep last 3 successful jobs</span>
  failedJobsHistoryLimit: 1          <span class="c"># keep last 1 failed job</span>
  startingDeadlineSeconds: 120       <span class="c"># skip if missed start by >2 min</span>
  jobTemplate:
    spec:
      backoffLimit: 2
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: report
            image: registry.access.redhat.com/ubi9/ubi:latest
            command: ["/bin/sh", "-c"]
            args:
            - |
              echo "Generating report for $(date)..."
              sleep 5
              echo "Report done."
EOF

oc get cronjob nightly-report`},
{h:'Manually trigger a CronJob on demand',b:"This is the most important operational skill with CronJobs. You don't need to wait for the schedule — use 'oc create job' with '--from' to spin up an immediate Job from the CronJob's template. This is identical to what the scheduler would run.",cmd:`<span class="c"># Trigger immediately from the CronJob template</span>
oc create job nightly-report-manual --from=cronjob/nightly-report

<span class="c"># Watch the manually triggered job</span>
oc get jobs
oc get pods -l job-name=nightly-report-manual -w

<span class="c"># Check logs</span>
oc logs -l job-name=nightly-report-manual

<span class="c"># You can also pass a unique name each time</span>
oc create job "report-$(date +%Y%m%d-%H%M)" --from=cronjob/nightly-report`},
{h:'Suspend, resume, and inspect CronJobs',b:"Suspending a CronJob prevents new Jobs from being scheduled — useful during incidents or maintenance. The existing running Job is NOT affected. You can also check when the next run is scheduled.",cmd:`<span class="c"># Suspend the CronJob (stops future scheduling)</span>
oc patch cronjob nightly-report -p '{"spec":{"suspend":true}}'

<span class="c"># Resume it</span>
oc patch cronjob nightly-report -p '{"spec":{"suspend":false}}'

<span class="c"># Inspect state: last schedule time, next schedule, active jobs</span>
oc describe cronjob nightly-report

<span class="c"># List all Jobs created by this CronJob</span>
oc get jobs --selector=cronjob-name=nightly-report

<span class="c"># Clean up a specific job manually</span>
oc delete job nightly-report-manual`},
{h:'Debug a failing CronJob',b:'When a CronJob never fires or keeps failing, work through this checklist: check the schedule syntax, look at recent job history, inspect pod logs, and verify the pod restartPolicy is set correctly (Jobs require OnFailure or Never, not Always).',cmd:`<span class="c"># See recent job history (limited by historyLimit)</span>
oc get jobs
oc describe cronjob nightly-report | grep -A 5 "Events:"

<span class="c"># Describe a failed job for events</span>
oc describe job &lt;failed-job-name&gt;

<span class="c"># Logs from a failed job's pod</span>
oc logs -l job-name=&lt;failed-job-name&gt; --previous

<span class="c"># Common mistakes:
# ✗ restartPolicy: Always  → Jobs require OnFailure or Never
# ✗ backoffLimit: 0        → any failure marks Job as Failed immediately
# ✗ Wrong cron syntax      → use https://crontab.guru to validate
# ✗ concurrencyPolicy: Forbid with a job that runs longer than the interval</span>`},
]},

{id:'networkpolicy', title:'Network Isolation with NetworkPolicies', desc:'Lock down pod-to-pod traffic using NetworkPolicies to implement a defense-in-depth network architecture.', steps:[
{h:'Understand the default network behavior',b:"By default in OpenShift, every pod can talk to every other pod in any namespace. NetworkPolicies are additive deny-by-default rules — once a NetworkPolicy selects a pod, only traffic explicitly allowed by a policy is permitted. Pods with no NetworkPolicy selecting them allow all traffic.",cmd:`<span class="c"># See existing NetworkPolicies</span>
oc get networkpolicy

<span class="c"># Deploy two test pods in different namespaces to observe behavior</span>
oc new-project frontend
oc new-project backend

oc run nginx --image=nginx:alpine -n backend
oc expose pod nginx --port=80 -n backend

oc run client --image=registry.access.redhat.com/ubi9/ubi:latest \
  -n frontend --command -- sleep 3600

<span class="c"># Currently this succeeds (open network):</span>
BACKEND_IP=$(oc get svc nginx -n backend -o jsonpath='{.spec.clusterIP}')
oc exec -n frontend client -- curl -s $BACKEND_IP`},
{h:'Deny all ingress by default',b:"A 'deny all' NetworkPolicy with an empty podSelector ({}) selects ALL pods in the namespace. With no ingress rules, it blocks all incoming traffic. Apply this first, then add explicit allow rules. This is the recommended baseline posture.",cmd:`cat &lt;&lt;EOF | oc apply -n backend -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}     <span class="c"># selects ALL pods in the namespace</span>
  policyTypes:
  - Ingress           <span class="c"># only restricts incoming; egress still open</span>
  <span class="c"># No ingress rules = deny all ingress</span>
EOF

<span class="c"># Now verify access is blocked:</span>
oc exec -n frontend client -- curl -s --max-time 3 $BACKEND_IP
<span class="c"># Should timeout — good!</span>`},
{h:'Allow traffic from a specific namespace',b:'Now allow the frontend namespace to reach the backend service. The namespaceSelector uses labels on the Namespace object itself. OpenShift 4.x automatically adds kubernetes.io/metadata.name labels to all namespaces.',cmd:`cat &lt;&lt;EOF | oc apply -n backend -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-frontend
spec:
  podSelector:
    matchLabels:
      run: nginx        <span class="c"># applies to pods labeled run=nginx</span>
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: frontend   <span class="c"># only from this namespace</span>
    ports:
    - protocol: TCP
      port: 80
EOF

<span class="c"># Verify frontend can now reach backend</span>
oc exec -n frontend client -- curl -s $BACKEND_IP | head -5
<span class="c"># Traffic from other namespaces is still blocked</span>`},
{h:'Allow only specific pods using podSelector',b:'Combine namespaceSelector AND podSelector for the most precise control — only pods with matching labels in the matching namespace can connect.',cmd:`cat &lt;&lt;EOF | oc apply -n backend -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-labeled-pods-only
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: frontend
      podSelector:
        matchLabels:
          role: web-client   <span class="c"># AND must have this label</span>
    ports:
    - protocol: TCP
      port: 8080
EOF

<span class="c"># Note: namespaceSelector + podSelector on the same -from item = AND logic
# Separate -from items = OR logic</span>`},
{h:'Allow ingress from the OpenShift router',b:"Routes stop working when you apply a deny-all policy because the Ingress Router pods can no longer reach your pods. You must explicitly allow traffic from the router's namespace.",cmd:`cat &lt;&lt;EOF | oc apply -n backend -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-openshift-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          network.openshift.io/policy-group: ingress
EOF

<span class="c"># Also allow monitoring (Prometheus scraping)</span>
cat &lt;&lt;EOF | oc apply -n backend -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-openshift-monitoring
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          network.openshift.io/policy-group: monitoring
EOF`},
]},

{id:'hpa-walkthrough', title:'Autoscaling with HPA & Load Testing', desc:'Configure a HorizontalPodAutoscaler and validate it scales under real load using a stress test.', steps:[
{h:'Deploy an app with resource requests',b:'HPA calculates utilization as current usage ÷ request. Without requests set, HPA cannot compute a percentage and will never scale. Resource requests are mandatory.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: php-apache
  template:
    metadata:
      labels:
        app: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 200m       <span class="c"># HPA needs this to calculate %</span>
            memory: 64Mi
          limits:
            cpu: 500m
            memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
spec:
  selector:
    app: php-apache
  ports:
  - port: 80
EOF`},
{h:'Create the HorizontalPodAutoscaler',b:'The HPA watches CPU utilization across all pods in the target deployment. When average CPU exceeds 50% of the request, it scales up (up to maxReplicas). When load drops, it scales down after a stabilization window (default 5 min).',cmd:`<span class="c"># Imperative (quick)</span>
oc autoscale deployment/php-apache \
  --min=1 --max=10 --cpu-percent=50

<span class="c"># Equivalent YAML</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
EOF

<span class="c"># Check HPA status</span>
oc get hpa
oc describe hpa php-apache`},
{h:'Generate load to trigger scaling',b:'Run a busybox pod in a loop sending requests to the service. Watch in a second terminal as the HPA detects high CPU and creates new replicas. The scale-up is fast (default: 15s evaluation period); scale-down is slow (5 min stabilization window).',cmd:`<span class="c"># Terminal 1 — run load generator</span>
oc run load-gen --image=busybox:latest --restart=Never -it --rm -- \
  /bin/sh -c "while true; do wget -q -O- http://php-apache/; done"

<span class="c"># Terminal 2 — watch HPA and pods react</span>
oc get hpa php-apache -w
oc get pods -l app=php-apache -w

<span class="c"># You should see REPLICAS increase as CPU% climbs above 50%</span>`},
{h:'Observe scale-down behavior',b:"Stop the load generator (Ctrl+C) and watch the HPA scale back down. Scale-down is deliberately slow — the HPA waits for the stabilization window (default 300s) to avoid flapping. You can tune this with the 'behavior' field.",cmd:`<span class="c"># Stop load-gen with Ctrl+C, then watch scale-down</span>
oc get hpa -w

<span class="c"># Tune scale-down speed with behavior policy</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 60  <span class="c"># faster scale-down for testing</span>
      policies:
      - type: Pods
        value: 2
        periodSeconds: 60             <span class="c"># remove at most 2 pods per minute</span>
EOF`},
{h:'HPA troubleshooting',b:'If the HPA shows unknown metrics or never scales, work through this checklist.',cmd:`<span class="c"># Check HPA for warnings</span>
oc describe hpa php-apache

<span class="c"># Verify Metrics Server is running</span>
oc get pods -n openshift-monitoring | grep prometheus-adapter
oc top pods   <span class="c"># if this works, metrics pipeline is healthy</span>

<span class="c"># Common issues:
# "unable to get metrics" → Metrics Server not installed or pod not running
# "missing request for cpu" → resource requests not set on the deployment
# HPA shows 0% CPU → app is idle; check if the service is receiving traffic
# HPA scales to max immediately → check for a misconfigured request (too low)</span>`},
]},

{id:'statefulset-walkthrough', title:'StatefulSets for Stateful Applications', desc:'Deploy a multi-replica stateful application with stable pod identities, per-pod storage, and ordered scaling.', steps:[
{h:'Why StatefulSets over Deployments?',b:'Deployments treat pods as interchangeable — any pod can be replaced by any other. StatefulSets guarantee: (1) stable network identity (pod-0, pod-1 are always the same pod), (2) ordered deployment and termination, (3) per-pod PVCs that survive pod rescheduling. Essential for primary/replica databases.',cmd:`<span class="c"># Key differences at a glance:
#
# Deployment: pod-7f8b9-xkqjp (random suffix, any pod = any other)
# StatefulSet: mysql-0, mysql-1, mysql-2 (stable, predictable names)
#
# StatefulSet scaling:
#   Scale up:   creates mysql-0 first, waits until Ready, then mysql-1...
#   Scale down: terminates from highest index first (mysql-2, mysql-1...)
#   This guarantees the primary (mysql-0) is last to be removed.

oc explain statefulset.spec.podManagementPolicy
<span class="c"># OrderedReady (default) vs Parallel (create all at once)</span>`},
{h:'Create a StatefulSet with volumeClaimTemplates',b:"The key differentiator: volumeClaimTemplates creates a separate PVC per pod. mysql-0 gets mysql-data-mysql-0, mysql-1 gets mysql-data-mysql-1. These PVCs are NOT deleted when the pod is deleted — data persists even if a pod is rescheduled to a different node.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql-headless   <span class="c"># must match the headless Service</span>
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: registry.redhat.io/rhel8/mysql-80:latest
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: rootpass
        - name: MYSQL_DATABASE
          value: appdb
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
  volumeClaimTemplates:         <span class="c"># one PVC per pod, automatically created</span>
  - metadata:
      name: mysql-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi
EOF`},
{h:'Create the headless Service for stable DNS',b:"StatefulSets require a Headless Service (clusterIP: None). This gives each pod a stable DNS entry: pod-name.service-name.namespace.svc.cluster.local. For example: mysql-0.mysql-headless.default.svc.cluster.local. Other pods can connect directly to a specific replica.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None       <span class="c"># headless — no virtual IP, just DNS</span>
  selector:
    app: mysql
  ports:
  - port: 3306
---
<span class="c"># Also create a regular Service for app writes (to primary/mysql-0)</span>
apiVersion: v1
kind: Service
metadata:
  name: mysql-primary
spec:
  selector:
    app: mysql
    statefulset.kubernetes.io/pod-name: mysql-0   <span class="c"># always routes to pod-0</span>
  ports:
  - port: 3306
EOF

<span class="c"># Watch ordered pod creation (0, then 1, then 2)</span>
oc get pods -l app=mysql -w`},
{h:'Verify per-pod storage and stable identities',b:'Each pod should have its own bound PVC. Data written to mysql-0 lives in mysql-data-mysql-0 — if mysql-0 is rescheduled to another node, the PVC follows (re-mounts on the new node).',cmd:`<span class="c"># Each pod has its own PVC</span>
oc get pvc

<span class="c"># Stable DNS — resolve from inside the cluster</span>
oc run dns-test --image=busybox --restart=Never --rm -it -- \
  nslookup mysql-0.mysql-headless

<span class="c"># Connect directly to a specific replica</span>
oc exec -it mysql-0 -- mysql -u root -prootpass -e "SHOW DATABASES;"
oc exec -it mysql-1 -- mysql -u root -prootpass -e "SHOW DATABASES;"

<span class="c"># Verify PVC survives pod deletion</span>
oc delete pod mysql-0
oc get pods -w     <span class="c"># mysql-0 recreated with same PVC</span>
oc get pvc         <span class="c"># mysql-data-mysql-0 still Bound</span>`},
{h:'Scale and update a StatefulSet',b:'Scaling up adds pods from the highest index. Scaling down removes from the highest index first — protecting mysql-0 (primary) until last. Updates follow the same ordered strategy by default.',cmd:`<span class="c"># Scale up (adds mysql-3 after mysql-2 is Ready)</span>
oc scale statefulset/mysql --replicas=4

<span class="c"># Scale down (removes mysql-3 first)</span>
oc scale statefulset/mysql --replicas=2

<span class="c"># Update image (ordered rolling update, highest index first by default)</span>
oc set image statefulset/mysql mysql=registry.redhat.io/rhel8/mysql-80:latest

<span class="c"># Partition update: only update pods with index >= 2
# (useful for staged rollouts — test on replicas before primary)</span>
oc patch statefulset mysql -p '{"spec":{"updateStrategy":{"rollingUpdate":{"partition":2}}}}'`},
]},

{id:'multicontainer', title:'Multi-Container Pods: Init & Sidecar Patterns', desc:'Build production-grade pods using init containers for setup and sidecars for cross-cutting concerns like logging and proxying.', steps:[
{h:'Init Containers — guaranteed setup before app starts',b:"Init containers run sequentially to completion before any app container starts. If any init container fails, the pod restarts. Use cases: waiting for dependencies, database migrations, populating shared volumes, fetching secrets.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-with-init
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      initContainers:

      <span class="c"># Init 1: wait for database to be ready</span>
      - name: wait-for-db
        image: busybox:latest
        command: ['sh', '-c',
          'until nc -z postgres-svc 5432; do echo waiting for DB; sleep 2; done']

      <span class="c"># Init 2: run database migrations</span>
      - name: db-migrate
        image: quay.io/myorg/webapp:latest
        command: ['python', 'manage.py', 'migrate']
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-creds
              key: url

      containers:
      - name: app
        image: quay.io/myorg/webapp:latest
        ports:
        - containerPort: 8080
EOF

<span class="c"># Watch init containers run before the app starts</span>
oc get pods -w
oc logs &lt;pod-name&gt; -c wait-for-db
oc logs &lt;pod-name&gt; -c db-migrate`},
{h:'Sidecar pattern — log shipping',b:'Sidecars run alongside the main container for the pod lifetime, sharing the same network and volumes. A log-shipping sidecar reads log files written by the main app and forwards them to a centralized logging system.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-logger
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app-with-logger
  template:
    metadata:
      labels:
        app: app-with-logger
    spec:
      volumes:
      - name: log-volume
        emptyDir: {}        <span class="c"># shared between app and sidecar</span>

      containers:
      <span class="c"># Main app — writes logs to /var/log/app/</span>
      - name: app
        image: registry.access.redhat.com/ubi9/ubi:latest
        command: ["/bin/sh", "-c"]
        args:
        - |
          mkdir -p /var/log/app
          while true; do
            echo "$(date) INFO request processed" >> /var/log/app/app.log
            sleep 1
          done
        volumeMounts:
        - name: log-volume
          mountPath: /var/log/app

      <span class="c"># Sidecar — tails the log file and ships it</span>
      - name: log-shipper
        image: busybox:latest
        command: ["/bin/sh", "-c"]
        args:
        - tail -F /var/log/app/app.log   <span class="c"># replace with fluentd/filebeat</span>
        volumeMounts:
        - name: log-volume
          mountPath: /var/log/app
        resources:
          requests:
            cpu: 10m
            memory: 16Mi
EOF

oc logs &lt;pod-name&gt; -c app
oc logs &lt;pod-name&gt; -c log-shipper`},
{h:'Sidecar pattern — service mesh proxy (conceptual)',b:'In OpenShift Service Mesh (Istio), a proxy sidecar (Envoy) is automatically injected into every pod. This enables mTLS, traffic policies, retries, circuit breaking, and distributed tracing without any app code changes.',cmd:`<span class="c"># Enable automatic sidecar injection for a namespace</span>
oc label namespace myapp istio-injection=enabled

<span class="c"># After deploying, each pod automatically gets an injected sidecar</span>
oc get pod &lt;name&gt; -o jsonpath='{.spec.containers[*].name}'
<span class="c"># Output: app istio-proxy   ← both containers visible</span>

<span class="c"># Check sidecar logs for traffic details</span>
oc logs &lt;pod&gt; -c istio-proxy

<span class="c"># View mesh traffic without changing app code:
# - Automatic mTLS between all services
# - Retry on 503 errors
# - Circuit breaking on consecutive failures
# - Distributed traces in Jaeger
# - Metrics in Kiali</span>`},
{h:'Resource isolation between containers',b:'Each container in a pod has its own resource requests and limits. Sidecar containers should be given small allocations so they don\'t compete with the main app. LimitRanges in the namespace enforce minimums.',cmd:`<span class="c"># Good practice: give sidecars minimal resources</span>
<span class="c"># so they don't starve the main application</span>

containers:
- name: main-app
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 2
      memory: 1Gi

- name: log-sidecar
  resources:
    requests:
      cpu: 10m       <span class="c"># very small — this is intentional</span>
      memory: 32Mi
    limits:
      cpu: 50m
      memory: 64Mi

<span class="c"># Check total pod resource consumption (sum of all containers)</span>
oc describe pod &lt;name&gt; | grep -A 10 "Total Resources"
oc adm top pods --containers   <span class="c"># per-container usage</span>`},
]},

{id:'resourcequota', title:'Resource Quotas, LimitRanges & Quality of Service', desc:'Enforce fair resource sharing across teams using quotas and LimitRanges, and understand pod QoS classes.', steps:[
{h:'ResourceQuota — cap total namespace consumption',b:'A ResourceQuota sets an upper bound on total resource consumption within a namespace. It applies across all pods, services, PVCs, and secrets. When a quota is exceeded, new resource creation is rejected with a 403 Forbidden error.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
spec:
  hard:
    <span class="c"># Compute</span>
    requests.cpu: "4"           <span class="c"># total requested CPU across all pods</span>
    requests.memory: 8Gi        <span class="c"># total requested memory</span>
    limits.cpu: "8"             <span class="c"># total CPU limits</span>
    limits.memory: 16Gi

    <span class="c"># Object counts</span>
    pods: "20"
    services: "10"
    persistentvolumeclaims: "10"
    secrets: "20"
    configmaps: "20"

    <span class="c"># Storage</span>
    requests.storage: 50Gi
EOF

<span class="c"># Check current usage vs quota</span>
oc describe resourcequota team-quota`},
{h:'LimitRange — set per-pod defaults and constraints',b:'A LimitRange sets default requests/limits (applied when a pod omits them) and enforces min/max bounds per container. When a ResourceQuota is active, every pod MUST have requests and limits — LimitRange provides the defaults so pods without them are still accepted.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: team-limits
spec:
  limits:
  - type: Container
    default:              <span class="c"># applied when container omits limits</span>
      cpu: 500m
      memory: 256Mi
    defaultRequest:       <span class="c"># applied when container omits requests</span>
      cpu: 100m
      memory: 64Mi
    max:                  <span class="c"># no single container can exceed this</span>
      cpu: "2"
      memory: 2Gi
    min:                  <span class="c"># minimum allowed request</span>
      cpu: 10m
      memory: 16Mi
  - type: Pod
    max:                  <span class="c"># total across all containers in a pod</span>
      cpu: "4"
      memory: 4Gi
  - type: PersistentVolumeClaim
    max:
      storage: 20Gi
EOF

oc describe limitrange team-limits`},
{h:'Understanding QoS Classes',b:'Kubernetes assigns every pod a Quality of Service class based on its requests and limits. QoS determines priority during node pressure — Guaranteed pods are last to be evicted, BestEffort pods are first.',cmd:`<span class="c"># Guaranteed: requests == limits for ALL containers (never evicted first)</span>
resources:
  requests:
    cpu: 500m
    memory: 256Mi
  limits:
    cpu: 500m        <span class="c"># must equal request</span>
    memory: 256Mi    <span class="c"># must equal request</span>

<span class="c"># Burstable: requests set but limits differ (or only some containers have both)</span>
resources:
  requests:
    cpu: 100m
    memory: 64Mi
  limits:
    cpu: 500m        <span class="c"># higher than request = Burstable</span>
    memory: 256Mi

<span class="c"># BestEffort: no requests or limits set (evicted first under pressure)</span>
resources: {}        <span class="c"># ← avoid this in production</span>

<span class="c"># Check a pod's QoS class</span>
oc get pod &lt;name&gt; -o jsonpath='{.status.qosClass}'`},
{h:'Hitting and debugging quota limits',b:"When a quota is exceeded, Kubernetes rejects the new resource with a clear error. Here's how to diagnose and resolve it.",cmd:`<span class="c"># This will fail if cpu quota is exhausted:</span>
oc run test-pod --image=nginx
<span class="c"># Error: exceeded quota: team-quota, requested: requests.cpu=100m,
#        used: requests.cpu=4, limited: requests.cpu=4</span>

<span class="c"># Check what's consuming quota</span>
oc describe resourcequota team-quota

<span class="c"># Find pods using the most CPU requests</span>
oc get pods -o json | jq -r '
  .items[] |
  .metadata.name + " " +
  (.spec.containers[].resources.requests.cpu // "none")'

<span class="c"># Scale down unused deployments to free quota</span>
oc scale deployment idle-app --replicas=0

<span class="c"># Or request a quota increase from cluster admin</span>
oc edit resourcequota team-quota   <span class="c"># requires admin access</span>`},
]},

{id:'rbac-walkthrough', title:'Configure RBAC & ServiceAccounts', desc:'Set up role-based access control for users and application service accounts.', steps:[
{h:'Understand current access',b:'Check what permissions you have and who has access to the project.',cmd:`oc auth can-i --list
oc get rolebindings
oc get clusterrolebindings | grep myproject`},
{h:'Grant project access to a user',b:'Add a developer to the project with edit access so they can deploy and manage workloads.',cmd:`oc adm policy add-role-to-user edit developer-user
oc adm policy add-role-to-user view qa-user

<span class="c"># Verify the binding was created</span>
oc get rolebindings`},
{h:'Create a ServiceAccount for an app',b:'Applications that need to call the Kubernetes API (e.g., operators, service mesh) need their own ServiceAccount.',cmd:`oc create serviceaccount my-app-sa

<span class="c"># Grant it view access within the project</span>
oc adm policy add-role-to-user view -z my-app-sa

<span class="c"># Assign SA to a deployment</span>
oc set serviceaccount deployment/webapp my-app-sa`},
{h:'Create a custom Role',b:'Define granular permissions when built-in roles are too broad.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
EOF

oc adm policy add-role-to-user pod-reader bob`},
{h:'Verify permissions',b:'Test that permissions work as expected using oc auth can-i --as.',cmd:`<span class="c"># Test as a specific user</span>
oc auth can-i get pods --as=bob
oc auth can-i delete pods --as=bob   <span class="c"># should be no</span>

<span class="c"># Test as a service account</span>
oc auth can-i get pods --as=system:serviceaccount:myproject:my-app-sa`},
]},

{id:'taints-tolerations', title:'Taints, Tolerations & Node Selectors', desc:'Control exactly which nodes pods are scheduled on — reserve nodes for specific workloads, repel unwanted pods, and attract pods with node affinity.', steps:[
{h:'Node Selectors — the simplest scheduling control',b:'A nodeSelector is a map of key-value labels on the node. The pod is only scheduled on nodes that have ALL the specified labels. Simple but inflexible — use nodeAffinity for more complex rules.',cmd:`<span class="c"># Label a node for GPU workloads</span>
oc label node worker-3.example.com gpu=true accelerator=nvidia

<span class="c"># Verify the label was applied</span>
oc get nodes --show-labels | grep gpu

<span class="c"># Pod that only schedules on GPU nodes</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-job
spec:
  nodeSelector:
    gpu: "true"          <span class="c"># must match node label exactly</span>
    accelerator: nvidia
  containers:
  - name: cuda-app
    image: nvidia/cuda:12.0-base
    command: ["nvidia-smi"]
EOF

<span class="c"># If no matching node exists, pod stays Pending:</span>
oc describe pod gpu-job | grep -A 5 Events`},
{h:'Node Affinity — flexible required/preferred rules',b:'nodeAffinity gives you more expressive scheduling rules than nodeSelector. Use requiredDuringScheduling for hard requirements and preferredDuringScheduling for soft preferences with weights.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-preferred-ssd
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      affinity:
        nodeAffinity:
          <span class="c"># HARD rule: must run in us-east zone</span>
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values: [us-east-1a, us-east-1b]
          <span class="c"># SOFT rule: prefer SSD nodes (weight 1-100)</span>
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 80
            preference:
              matchExpressions:
              - key: node-type
                operator: In
                values: [ssd]
      containers:
      - name: web
        image: nginx:alpine
EOF`},
{h:'Taints — repel pods from nodes',b:"Taints are placed ON nodes to repel pods that don't explicitly tolerate them. The effect controls what happens to non-tolerating pods: NoSchedule (don't place new pods), PreferNoSchedule (soft), NoExecute (evict existing pods too).",cmd:`<span class="c"># Taint a node for infra-only workloads</span>
oc adm taint nodes infra-1.example.com dedicated=infra:NoSchedule

<span class="c"># Taint with NoExecute evicts existing pods immediately</span>
oc adm taint nodes infra-1.example.com maintenance=true:NoExecute

<span class="c"># View taints on all nodes</span>
oc get nodes -o custom-columns=\
NAME:.metadata.name,\
TAINTS:.spec.taints

<span class="c"># Remove a taint (append - to the taint key)</span>
oc adm taint nodes infra-1.example.com dedicated-

<span class="c"># OpenShift automatically taints nodes during issues:
# node.kubernetes.io/not-ready:NoExecute
# node.kubernetes.io/unreachable:NoExecute
# node.kubernetes.io/memory-pressure:NoSchedule
# node.cloudprovider.kubernetes.io/uninitialized:NoSchedule</span>`},
{h:'Tolerations — allow pods onto tainted nodes',b:"Tolerations go in the pod spec to allow (not require) scheduling onto tainted nodes. A pod with a toleration CAN land on the tainted node — it doesn't HAVE to. Combine with nodeAffinity to both permit AND attract.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: infra-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: infra-app
  template:
    metadata:
      labels:
        app: infra-app
    spec:
      tolerations:
      <span class="c"># Tolerate the dedicated=infra taint</span>
      - key: dedicated
        operator: Equal
        value: infra
        effect: NoSchedule
      <span class="c"># Tolerate ANY taint with NoSchedule (wildcard)</span>
      - operator: Exists
        effect: NoSchedule
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
            - key: dedicated
              operator: In
              values: [infra]   <span class="c"># also attract to infra nodes</span>
      containers:
      - name: app
        image: nginx:alpine
EOF`},
{h:'Topology Spread Constraints — advanced distribution',b:'Topology Spread Constraints (TSC) give fine-grained control over how pods spread across failure domains (zones, nodes, racks). More powerful than anti-affinity — you specify the max skew (imbalance) allowed.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-webapp
spec:
  replicas: 6
  selector:
    matchLabels:
      app: ha-webapp
  template:
    metadata:
      labels:
        app: ha-webapp
    spec:
      topologySpreadConstraints:
      <span class="c"># Spread evenly across availability zones</span>
      - maxSkew: 1                      <span class="c"># max 1 pod difference between zones</span>
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule <span class="c"># or ScheduleAnyway</span>
        labelSelector:
          matchLabels:
            app: ha-webapp
      <span class="c"># Also spread across individual nodes</span>
      - maxSkew: 2
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app: ha-webapp
      containers:
      - name: app
        image: nginx:alpine
EOF

<span class="c"># Verify distribution across zones</span>
oc get pods -l app=ha-webapp -o wide`},
]},

{id:'operators-olm', title:'Operators, OLM & the Operator Lifecycle', desc:'Understand how OpenShift manages Operators through the Operator Lifecycle Manager — from OperatorHub discovery to CatalogSources, Subscriptions, InstallPlans, and CSVs.', steps:[
{h:'The Operator Framework concepts',b:"An Operator is a Kubernetes controller that encodes operational knowledge — it manages complex stateful applications (databases, caches, monitoring stacks) automatically. OLM (Operator Lifecycle Manager) is the OpenShift system that installs, updates, and manages the lifecycle of Operators.",cmd:`<span class="c"># Key OLM objects and their roles:
#
# CatalogSource    → registry of available operators (like an app store)
# Subscription     → "I want operator X, track channel Y"
# InstallPlan      → approved list of resources to create for an install/upgrade
# ClusterServiceVersion (CSV) → the operator's descriptor: what it does,
#                    what CRDs it owns, what RBAC it needs, its deployment
# OperatorGroup    → defines which namespaces the operator watches
# CustomResourceDefinition (CRD) → extends K8s API with new resource types
# Custom Resource (CR) → an instance of a CRD (how you use the operator)

# View OLM components
oc get pods -n openshift-operator-lifecycle-manager
oc get catalogsource -n openshift-marketplace`},
{h:'Browse and install from OperatorHub',b:'OperatorHub is the curated catalog of Operators. Red Hat, certified partners, and the community all publish operators here. Installing via the web console creates a Subscription object behind the scenes.',cmd:`<span class="c"># List available operators in the catalog</span>
oc get packagemanifest -n openshift-marketplace | head -30

<span class="c"># Get details about a specific operator</span>
oc describe packagemanifest elasticsearch-operator -n openshift-marketplace

<span class="c"># Install an operator via YAML (what the console does behind the scenes)</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: elasticsearch-operator
  namespace: openshift-operators   <span class="c"># for cluster-wide operators</span>
spec:
  channel: stable                  <span class="c"># update channel</span>
  name: elasticsearch-operator     <span class="c"># package name from OperatorHub</span>
  source: redhat-operators         <span class="c"># which CatalogSource</span>
  sourceNamespace: openshift-marketplace
  installPlanApproval: Automatic   <span class="c"># or Manual</span>
EOF`},
{h:'Track the install: Subscription → InstallPlan → CSV',b:'After creating a Subscription, OLM creates an InstallPlan listing all resources to create. With Automatic approval it self-approves; with Manual you review and approve it. Once approved, OLM creates the CSV which deploys the operator.',cmd:`<span class="c"># Watch the subscription status</span>
oc get subscription elasticsearch-operator -n openshift-operators -w

<span class="c"># Find the InstallPlan (created by OLM automatically)</span>
oc get installplan -n openshift-operators

<span class="c"># For Manual approval — inspect then approve</span>
oc describe installplan &lt;installplan-name&gt; -n openshift-operators
oc patch installplan &lt;installplan-name&gt; -n openshift-operators \
  --type merge -p '{"spec":{"approved":true}}'

<span class="c"># Watch the CSV appear and reach Succeeded phase</span>
oc get csv -n openshift-operators -w

<span class="c"># CSV phases: None → Pending → InstallReady → Installing → Succeeded
# If it stays in Installing, check operator pod logs:</span>
oc get pods -n openshift-operators
oc logs -n openshift-operators deploy/elasticsearch-operator`},
{h:'Use the operator — create a Custom Resource',b:"Once the CSV is Succeeded, the operator's CRDs are registered and you can create Custom Resources (CRs). The CR is how you tell the operator what you want — it reconciles the CR into real infrastructure.",cmd:`<span class="c"># See what CRDs the operator installed</span>
oc get crd | grep elasticsearch

<span class="c"># Create a Custom Resource to provision an Elasticsearch cluster</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: my-cluster
  namespace: myapp
spec:
  version: 8.12.0
  nodeSets:
  - name: default
    count: 3
    config:
      node.store.allow_mmap: false
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes: [ReadWriteOnce]
        resources:
          requests:
            storage: 10Gi
EOF

<span class="c"># The operator watches this CR and creates Pods, Services, Secrets, etc.</span>
oc get elasticsearch
oc get pods -l elasticsearch.k8s.elastic.co/cluster-name=my-cluster`},
{h:'Manage operator updates and channels',b:'Channels (stable, alpha, fast) control which update stream you track. OLM can automatically upgrade operators when new versions publish to your channel. Use Manual approval in production to gate upgrades.',cmd:`<span class="c"># Check current CSV version and available upgrades</span>
oc get subscription -n openshift-operators -o yaml | grep -E "channel|currentCSV|installedCSV"

<span class="c"># Switch to a different channel</span>
oc patch subscription elasticsearch-operator -n openshift-operators \
  --type merge -p '{"spec":{"channel":"stable-v8"}}'

<span class="c"># View upgrade graph for an operator</span>
oc get packagemanifest elasticsearch-operator \
  -o jsonpath='{.status.channels[*].name}'

<span class="c"># Uninstall: delete Subscription + CSV (CRDs remain — data safety)</span>
oc delete subscription elasticsearch-operator -n openshift-operators
oc delete csv &lt;csv-name&gt; -n openshift-operators
<span class="c"># To also remove CRDs (WARNING: deletes all Custom Resources):</span>
oc delete crd elasticsearches.elasticsearch.k8s.elastic.co`},
]},

{id:'scc', title:'Security Context Constraints (SCC)', desc:'OpenShift\'s SCC system controls what privileges pods can request — from fully restricted to privileged. Understand the built-in SCCs, how pods get assigned one, and how to write custom SCCs.', steps:[
{h:'What are SCCs and why does OpenShift need them?',b:"SCCs are OpenShift's replacement for (and predecessor to) Kubernetes PodSecurityAdmission. They control what a pod can do: run as root, use host networking, mount host paths, use privileged containers, etc. Every pod must match an SCC or it's rejected.",cmd:`<span class="c"># List all SCCs on the cluster</span>
oc get scc

<span class="c"># Built-in SCCs from most to least restrictive:
#
# restricted-v2    → default for all authenticated users in OCP 4.11+
#                    no root, random UID, no host access whatsoever
# restricted       → legacy default (pre-4.11)
# nonroot          → must run as non-root UID, but you choose the UID
# nonroot-v2       → nonroot with stricter seccomp
# hostmount-anyuid → can mount host paths, any UID
# hostnetwork      → can use host network/ports, non-root
# hostnetwork-v2   → hostnetwork with stricter seccomp
# hostaccess       → host network + host paths
# node-exporter    → for the Prometheus node exporter DaemonSet
# anyuid           → any UID including root (no host access)
# privileged       → everything allowed — only for trusted system components</span>

oc describe scc restricted-v2 | head -40`},
{h:'How pods get assigned an SCC',b:'OLM admission assigns the most restrictive SCC that satisfies the pod\'s security context. The order of evaluation: (1) SCCs granted to the pod\'s ServiceAccount, (2) SCCs granted to the user creating the pod, (3) SCCs granted to groups. The first SCC that validates wins.',cmd:`<span class="c"># Check which SCC a running pod was assigned</span>
oc get pod &lt;name&gt; -o jsonpath='{.metadata.annotations.openshift\.io/scc}'

<span class="c"># Check what SCCs a ServiceAccount can use</span>
oc adm policy who-can use scc anyuid

<span class="c"># Check what SCCs are available to a user</span>
oc get scc -o name | xargs -I{} oc adm policy \
  who-can use {} | grep "system:serviceaccount:myproject:default"

<span class="c"># The most common fix when a pod fails SCC admission:</span>
oc describe pod &lt;name&gt; | grep -i "scc\|security\|forbidden"
<span class="c"># Look for: "unable to validate against any security context constraint"</span>`},
{h:'Grant a ServiceAccount access to a specific SCC',b:"Many third-party Helm charts and operators need the 'anyuid' SCC to run as a specific UID (e.g., UID 1000). Grant it to the pod's ServiceAccount — never grant it to the 'default' SA unnecessarily.",cmd:`<span class="c"># Create a dedicated service account</span>
oc create serviceaccount nginx-sa

<span class="c"># Grant anyuid SCC to the SA (allows running as any UID including root)</span>
oc adm policy add-scc-to-user anyuid -z nginx-sa

<span class="c"># Grant privileged SCC (only for trusted system workloads)</span>
oc adm policy add-scc-to-user privileged -z nginx-sa

<span class="c"># Assign the SA to your deployment</span>
oc set serviceaccount deployment/my-nginx nginx-sa

<span class="c"># Verify</span>
oc adm policy who-can use scc/anyuid | grep nginx-sa

<span class="c"># Remove SCC when no longer needed</span>
oc adm policy remove-scc-from-user anyuid -z nginx-sa`},
{h:'Write a custom SCC for fine-grained control',b:"Instead of granting anyuid (too broad), write a custom SCC that allows exactly what the workload needs and nothing more. This is the principle of least privilege applied to SCCs.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: security.openshift.io/v1
kind: SecurityContextConstraints
metadata:
  name: custom-nonroot
allowPrivilegedContainer: false
allowPrivilegeEscalation: false
allowHostDirVolumePlugin: false
allowHostIPC: false
allowHostNetwork: false
allowHostPID: false
allowHostPorts: false
readOnlyRootFilesystem: false
runAsUser:
  type: MustRunAsRange        <span class="c"># allow range of UIDs</span>
  uidRangeMin: 1000
  uidRangeMax: 65535
seLinuxContext:
  type: MustRunAs
  seLinuxOptions:
    level: "s0:c123,c456"
fsGroup:
  type: MustRunAs
  ranges:
  - min: 1000
    max: 65535
supplementalGroups:
  type: RunAsAny
volumes:
- configMap
- downwardAPI
- emptyDir
- persistentVolumeClaim
- projected
- secret
users: []
groups: []
EOF

oc adm policy add-scc-to-user custom-nonroot -z my-app-sa`},
{h:'SCC and Pod Security Admission (PSA)',b:'Kubernetes 1.25+ introduced Pod Security Admission (PSA) with three profiles: privileged, baseline, restricted. OpenShift 4.11+ enforces both SCC and PSA. PSA is namespace-scoped via labels; SCC is more granular. Both must be satisfied.',cmd:`<span class="c"># PSA is configured via namespace labels</span>
oc label namespace myapp \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/audit=restricted

<span class="c"># Check PSA violations without enforcing (dry-run)</span>
oc label namespace myapp \
  pod-security.kubernetes.io/warn=restricted --overwrite

<span class="c"># PSA profiles:
# privileged → no restrictions (system namespaces)
# baseline   → prevents known privilege escalations
# restricted → follows current hardening best practices
#              (no root, no privileged, seccomp required)

# In OCP 4.11+, new namespaces default to:
# enforce=restricted  warn=restricted  audit=restricted

# Check namespace PSA labels</span>
oc get namespace myapp -o jsonpath='{.metadata.labels}' | jq`},
]},

{id:'monitoring-alerts', title:'Monitoring Stack & Custom Alerts', desc:'Navigate the OpenShift monitoring stack (Prometheus, Alertmanager, Thanos), write PrometheusRules for custom alerts, and create ServiceMonitors to scrape your own applications.', steps:[
{h:'The OpenShift monitoring architecture',b:'OpenShift ships a fully managed Prometheus stack in the openshift-monitoring namespace. A separate user-workload-monitoring stack (when enabled) lets you monitor your own apps without touching the platform stack.',cmd:`<span class="c"># Core monitoring components</span>
oc get pods -n openshift-monitoring

<span class="c"># Key components:
# prometheus-k8s-[0/1]         → scrapes cluster metrics + fires alerts
# alertmanager-main-[0/1/2]    → routes alerts to email/PD/Slack
# thanos-querier                → unified query across both Prometheus stacks
# prometheus-adapter            → serves custom metrics for HPA
# kube-state-metrics            → exposes K8s object state as metrics
# node-exporter (DaemonSet)     → host-level metrics (CPU, disk, network)
# grafana (optional)            → dashboards

# Enable user workload monitoring (required for app metrics)
oc get configmap cluster-monitoring-config -n openshift-monitoring -o yaml</span>`},
{h:'Enable user workload monitoring',b:"By default, you can't add custom scrape targets to the platform Prometheus. Enable user-workload-monitoring to get a separate Prometheus instance in openshift-user-workload-monitoring that you can configure freely.",cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-monitoring-config
  namespace: openshift-monitoring
data:
  config.yaml: |
    enableUserWorkload: true
EOF

<span class="c"># Wait for the user workload stack to start</span>
oc get pods -n openshift-user-workload-monitoring -w

<span class="c"># Components created:
# prometheus-user-workload-[0/1]
# thanos-ruler-user-workload-[0/1]
# prometheus-operator (manages ServiceMonitors/PodMonitors)</span>`},
{h:'Expose app metrics and create a ServiceMonitor',b:'Your application must expose a /metrics endpoint in Prometheus text format. Then create a ServiceMonitor to tell Prometheus where to scrape. The ServiceMonitor is matched to your Service via label selectors.',cmd:`<span class="c"># Example app with /metrics endpoint (uses prom-client)</span>
<span class="c"># Assumes your app exposes metrics on port 8080 at /metrics

# Create a ServiceMonitor in your app namespace</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: webapp-monitor
  namespace: myapp
  labels:
    app: webapp
spec:
  selector:
    matchLabels:
      app: webapp          <span class="c"># matches your Service's labels</span>
  endpoints:
  - port: http             <span class="c"># named port in the Service</span>
    path: /metrics
    interval: 30s          <span class="c"># scrape every 30 seconds</span>
    scheme: http
  namespaceSelector:
    matchNames:
    - myapp
EOF

<span class="c"># Verify Prometheus found the target</span>
<span class="c"># Port-forward to Prometheus UI:</span>
oc port-forward -n openshift-user-workload-monitoring \
  svc/prometheus-operated 9090:9090
<span class="c"># Open http://localhost:9090/targets</span>`},
{h:'Write a PrometheusRule for custom alerts',b:'PrometheusRules define recording rules (precompute expensive queries) and alerting rules (fire an alert when an expression is true for a duration). Write them in PromQL.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: webapp-alerts
  namespace: myapp
  labels:
    openshift.io/prometheus-rule-evaluation-scope: leaf-prometheus
spec:
  groups:
  - name: webapp.rules
    interval: 30s
    rules:
    <span class="c"># Recording rule: precompute request rate</span>
    - record: webapp:http_requests:rate5m
      expr: rate(http_requests_total{job="webapp"}[5m])

    <span class="c"># Alert: high error rate</span>
    - alert: WebappHighErrorRate
      expr: |
        rate(http_requests_total{job="webapp",status=~"5.."}[5m])
        /
        rate(http_requests_total{job="webapp"}[5m]) > 0.05
      for: 2m                   <span class="c"># must be true for 2 min before firing</span>
      labels:
        severity: warning
        team: backend
      annotations:
        summary: "High error rate on webapp"
        description: "Error rate is {{ \$value | humanizePercentage }} (threshold 5%)"

    <span class="c"># Alert: pod restarts</span>
    - alert: PodRestartingTooOften
      expr: |
        increase(kube_pod_container_status_restarts_total{namespace="myapp"}[1h]) > 5
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ \$labels.pod }} restarting frequently"
EOF`},
{h:'Configure Alertmanager routing',b:'Alertmanager receives fired alerts from Prometheus and routes them to receivers (email, PagerDuty, Slack, webhook). In OpenShift, use AlertmanagerConfig objects in your namespace (requires user-workload-monitoring).',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: webapp-alerting
  namespace: myapp
spec:
  route:
    receiver: slack-backend
    matchers:
    - name: team
      value: backend
    groupBy: [alertname, namespace]
    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 4h
  receivers:
  - name: slack-backend
    slackConfigs:
    - apiURL:
        name: slack-webhook-secret  <span class="c"># Secret with Slack webhook URL</span>
        key: webhookURL
      channel: '#alerts-backend'
      sendResolved: true
      title: '{{ .GroupLabels.alertname }}'
      text: |
        {{ range .Alerts }}
        *Alert:* {{ .Labels.alertname }}
        *Severity:* {{ .Labels.severity }}
        *Description:* {{ .Annotations.description }}
        {{ end }}
EOF

<span class="c"># View currently firing alerts</span>
oc port-forward -n openshift-monitoring svc/alertmanager-operated 9093:9093
<span class="c"># Open http://localhost:9093</span>`},
]},

{id:'advanced-builds', title:'Build Strategies: Dockerfile, S2I & Multi-Stage', desc:'Deep dive into OpenShift BuildConfigs — Dockerfile builds, Source-to-Image customization, multi-stage builds for minimal images, and build triggers.', steps:[
{h:'BuildConfig anatomy and build strategies',b:"A BuildConfig (BC) is an OpenShift resource that defines HOW to build an image: what source to use, which strategy to apply, where to push the output, and what triggers fire a new build.",cmd:`<span class="c"># Three build strategies:
#
# Source (S2I) → injects source into a builder image; no Dockerfile needed
# Docker       → runs a standard Dockerfile build
# Custom       → uses a custom builder image you provide
#
# Input sources:
# Git           → clone from a repo (with optional secret for private repos)
# Binary        → pipe local files via 'oc start-build --from-dir'
# Dockerfile    → inline Dockerfile in the BuildConfig itself
# Image         → use another ImageStream as source

# View existing BuildConfigs
oc get bc
oc describe bc &lt;name&gt;</span>`},
{h:'Dockerfile build strategy',b:'Use the Docker strategy when you already have a Dockerfile. OpenShift runs the build in a pod using Buildah (not Docker), which works without a privileged container.',cmd:`cat &lt;&lt;EOF | oc apply -f -
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: webapp-docker
spec:
  source:
    type: Git
    git:
      uri: https://github.com/myorg/webapp.git
      ref: main
    contextDir: /app              <span class="c"># subfolder with the Dockerfile</span>
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile  <span class="c"># relative to contextDir</span>
      buildArgs:                  <span class="c"># ARG values injected at build time</span>
      - name: NODE_ENV
        value: production
      noCache: false
  output:
    to:
      kind: ImageStreamTag
      name: webapp:latest         <span class="c"># push result here</span>
  triggers:
  - type: GitHub                  <span class="c"># webhook trigger</span>
    github:
      secret: my-webhook-secret
  - type: ImageChange             <span class="c"># rebuild if base image updates</span>
EOF

<span class="c"># Start a build manually</span>
oc start-build webapp-docker
oc logs -f bc/webapp-docker`},
{h:'S2I with custom assemble scripts',b:'S2I is powerful because builder images define how to build most apps automatically. But you can override the assemble and run scripts to customize the build without writing a full Dockerfile.',cmd:`<span class="c"># S2I builder images for common runtimes</span>
oc get is -n openshift | grep -E "nodejs|python|ruby|php|java"

<span class="c"># Create S2I BuildConfig with environment overrides</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: webapp-s2i
spec:
  source:
    type: Git
    git:
      uri: https://github.com/myorg/webapp.git
    secrets:
    - secret:
        name: git-ssh-key          <span class="c"># for private repos</span>
      destinationDir: /tmp/git-key
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        namespace: openshift
        name: nodejs:18-ubi8       <span class="c"># builder image</span>
      env:
      - name: NPM_MIRROR
        value: https://registry.npmjs.org
      incremental: true            <span class="c"># reuse previous build artifacts</span>
  output:
    to:
      kind: ImageStreamTag
      name: webapp:latest
EOF

<span class="c"># Stream build logs in real time</span>
oc start-build webapp-s2i --follow</span>`},
{h:'Multi-stage Dockerfile for minimal production images',b:'Multi-stage builds compile/build in a large builder image, then COPY only the artifacts into a minimal runtime image. This dramatically reduces the final image size and attack surface.',cmd:`<span class="c"># Example: Go app built in golang, run in UBI minimal</span>
<span class="c"># Save as Dockerfile in your repo:</span>

<span class="c"># Stage 1: Build</span>
FROM registry.access.redhat.com/ubi9/go-toolset:latest AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

<span class="c"># Stage 2: Minimal runtime image (~30MB vs ~800MB builder)</span>
FROM registry.access.redhat.com/ubi9/ubi-minimal:latest
COPY --from=builder /app/server /usr/local/bin/server
RUN chmod +x /usr/local/bin/server
EXPOSE 8080
USER 1001                 <span class="c"># non-root for OpenShift SCC compatibility</span>
CMD ["/usr/local/bin/server"]

<span class="c"># Build from local directory (binary strategy)</span>
oc new-build --name=go-app --binary --strategy=docker
oc start-build go-app --from-dir=. --follow`},
{h:'Build triggers and webhooks',b:'BuildConfigs can fire automatically on git push (via webhooks), when a base image is updated (ImageChange trigger), or when the BuildConfig itself changes (ConfigChange trigger).',cmd:`<span class="c"># Get the webhook URL for your BuildConfig</span>
oc describe bc webapp-docker | grep -A 2 "Webhook"
<span class="c"># Copy the GitHub webhook URL and add to your repo's Settings → Webhooks</span>

<span class="c"># ImageChange trigger: auto-rebuild when nodejs:18 base image updates</span>
oc set triggers bc/webapp-s2i --from-image=openshift/nodejs:18-ubi8

<span class="c"># Manual build from a specific branch or tag</span>
oc start-build webapp-docker --commit=abc123def
oc start-build webapp-s2i --from-dir=./src --follow

<span class="c"># Cancel a running build</span>
oc cancel-build &lt;build-name&gt;

<span class="c"># List all builds for a BuildConfig</span>
oc get builds -l buildconfig=webapp-docker

<span class="c"># Promote image: tag 'latest' as 'production'</span>
oc tag webapp:latest webapp:production`},
]},

{id:'service-account-tokens', title:'Create Expiring Service Account Tokens for Customer Access', desc:'Generate short-lived kubeconfig tokens for customers or support workflows — namespace-scoped, multi-namespace with CRD access, or cluster-reader — with a fixed expiry window.', steps:[
{h:'Understand the token model',b:'Since OCP 4.11, <code>oc create token</code> generates bound, short-lived tokens (RFC 8693) tied to a ServiceAccount. They expire automatically — no cleanup needed. The old <code>kubernetes.io/service-account-token</code> Secrets still exist but are deprecated. Always prefer <code>oc create token --duration</code> for customer handoffs.',cmd:`<span class="c"># Anatomy of the command</span>
oc create token &lt;service-account&gt; \\
  -n &lt;namespace&gt; \\
  --duration=&lt;Nh&gt;    <span class="c"># e.g. 8h, 24h, 48h</span>

<span class="c"># Inspect a token without using it</span>
oc create token support-ro -n myapp --duration=1h | \\
  python3 -c "import sys,base64,json; p=sys.stdin.read().strip().split('.')[1]; print(json.dumps(json.loads(base64.b64decode(p+'==').decode()),indent=2))"

<span class="c"># Check expiry fields: iat (issued at), exp (expiry) — both Unix timestamps</span>`},

{h:'Pattern 1 — Namespace-scoped read-only access',b:'Create a ServiceAccount, bind the built-in <code>view</code> ClusterRole within a single namespace, then issue a token. The customer can only read resources in that one namespace — pods, logs, events, configmaps, etc.',cmd:`<span class="c"># 1. Create the ServiceAccount</span>
oc create sa support-ro -n myapp

<span class="c"># 2. Bind view role (read-only) within the namespace</span>
oc adm policy add-role-to-user view \\
  system:serviceaccount:myapp:support-ro \\
  -n myapp

<span class="c"># 3. Issue an 8-hour token</span>
TOKEN=$(oc create token support-ro -n myapp --duration=8h)

<span class="c"># 4. Build a kubeconfig for the customer</span>
oc config view --minify --raw > /tmp/customer.kubeconfig
kubectl --kubeconfig=/tmp/customer.kubeconfig config set-credentials support-ro --token="$TOKEN"
kubectl --kubeconfig=/tmp/customer.kubeconfig config set-context --current --user=support-ro
echo "Token expires in 8h. Kubeconfig: /tmp/customer.kubeconfig"`},

{h:'Pattern 2 — Several namespaces + reading CRDs',b:'When a customer needs visibility across multiple namespaces and the ability to read CustomResourceDefinitions (cluster-scoped), you need a ClusterRole with CRD read permissions plus RoleBindings in each target namespace.',cmd:`<span class="c"># 1. Create the ServiceAccount (pick any namespace as home)</span>
oc create sa support-multi -n support-tools

<span class="c"># 2. Create a ClusterRole that allows reading CRDs (cluster-scoped)</span>
cat &lt;&lt;EOF | oc apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: support-crd-reader
rules:
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: ["get","list","watch"]
EOF

<span class="c"># 3. ClusterRoleBinding for CRD access only</span>
oc adm policy add-cluster-role-to-user support-crd-reader \\
  system:serviceaccount:support-tools:support-multi

<span class="c"># 4. Namespace-level view access in each target namespace</span>
for NS in app-team-a app-team-b platform-ops; do
  oc adm policy add-role-to-user view \\
    system:serviceaccount:support-tools:support-multi \\
    -n $NS
done

<span class="c"># 5. Issue a 24-hour token</span>
oc create token support-multi -n support-tools --duration=24h`},

{h:'Pattern 3 — Cluster-reader (full read-only cluster view)',b:'<code>cluster-reader</code> is a built-in OCP ClusterRole that grants read access to almost everything cluster-wide — all namespaces, nodes, operators, routes, SCCs, and most CRDs. Use this for escalated support cases where the customer or engineer needs a full cluster snapshot.',cmd:`<span class="c"># 1. Create the ServiceAccount</span>
oc create sa support-cluster -n support-tools

<span class="c"># 2. Bind cluster-reader — this is cluster-wide, use carefully</span>
oc adm policy add-cluster-role-to-user cluster-reader \\
  system:serviceaccount:support-tools:support-cluster

<span class="c"># 3. Issue a time-boxed token (recommend ≤ 24h for cluster-reader)</span>
oc create token support-cluster -n support-tools --duration=24h

<span class="c"># Verify what the token can see</span>
oc auth can-i --list --as=system:serviceaccount:support-tools:support-cluster | head -20`},

{h:'Build and deliver the kubeconfig',b:'Package the token into a kubeconfig file the customer can drop in and use immediately with <code>oc</code> or <code>kubectl</code>. Always communicate the expiry window explicitly.',cmd:`<span class="c"># Capture current cluster API URL</span>
API=$(oc whoami --show-server)
TOKEN=$(oc create token support-cluster -n support-tools --duration=24h)
CACERT=$(oc config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

<span class="c"># Write a self-contained kubeconfig</span>
cat &lt;&lt;EOF > /tmp/customer-access.kubeconfig
apiVersion: v1
kind: Config
clusters:
- name: ocp-cluster
  cluster:
    server: $API
    certificate-authority-data: $CACERT
users:
- name: support-token
  user:
    token: $TOKEN
contexts:
- name: support
  context:
    cluster: ocp-cluster
    user: support-token
current-context: support
EOF

echo "Deliver /tmp/customer-access.kubeconfig — expires in 24h"
echo "Customer usage: export KUBECONFIG=/tmp/customer-access.kubeconfig"
echo "                oc get pods -A"`},

{h:'Verify and revoke',b:'Test the token before handing it to the customer. To revoke early (before expiry), delete the ServiceAccount — all tokens bound to it immediately become invalid.',cmd:`<span class="c"># Test the token permissions</span>
oc auth can-i get pods -n myapp \\
  --as=system:serviceaccount:support-tools:support-cluster

oc auth can-i create deployments -n myapp \\
  --as=system:serviceaccount:support-tools:support-cluster
<span class="c"># → "no" — read-only confirmed</span>

<span class="c"># Check token expiry from within a running pod using the token</span>
oc whoami --token="$TOKEN"

<span class="c"># Early revocation — delete the SA to invalidate all its tokens immediately</span>
oc delete sa support-cluster -n support-tools

<span class="c"># Or remove just the role binding to reduce scope without deleting the SA</span>
oc adm policy remove-cluster-role-from-user cluster-reader \\
  system:serviceaccount:support-tools:support-cluster`},
]},
];
