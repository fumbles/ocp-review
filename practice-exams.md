Practice Exams
Find the following Practice Exams to review core concepts and challenge yourself while preparing for the exam:

Practice Exam LVL1
Set Up htpasswd as the Identity Provider and Add Users and Permissions
Set up the htpasswd file.
Verify the file contents.
Set up the rest of the users and their passwords.
Verify the file contents.
Check if there's an existing HTPasswd Secret file.
Delete the htpass-secret file.
Create the secret from the htpasswd file.
Download the HTPasswd Custom Resource.
Open the file.
Under identityProviders, replace my_htpasswd_provider with users.htpassword.
Save and exit the file by pressing Escape followed by :wq.
Apply the changes.
Log in as the root user.
Verify you're logged in as root.
Log in as the alpha user.
Verify you're logged in as alpha.
Log in as the beta user.
Verify you're logged in as beta.
Log in as the gamma user.
Verify you're logged in as gamma.
Log in as the delta user.
Verify you're logged in as delta.
Log in as kubeadmin.
Create the NewProject project.
Give alpha admin permissions to the NewProject project.
Give beta and gamma edit permissions to the NewProject project.
Give delta basic user permissions to the NewProject project.
Give the root user cluster admin permissions.
Log in as root.
Remove the kubeadmin user from the cluster.
Role-Based Access and Groups
Create a project called snacks.
Create a group called group1.
Add alpha, beta, and gamma to the group1 group.
Grant admin access to the group1 group for the project snacks.
Create a custom getpods role.
Assign the getpods role to delta, allowing the user to get pod information from the snacks project.
Verify it worked.
Quotas and Resource Limits
Download the quota and resource limit templates, modify them to limit cpu and memory for snacks project.
Practice Exam LVL2
Create a network policy to only allow ingress traffic from an specific namespace, pod label and port. Refer to below YAML file for reference
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
spec:
  podSelector:
    matchLabels:
      deployment: hello
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            network: different-namespace
        podSelector:
          matchLabels:
            deployment: sample-app
      ports:
      - port: 8080
        protocol: TCP

Create a network policy that allows traffic to the hello pod via the exposed route

Create cluster logs to upload for support