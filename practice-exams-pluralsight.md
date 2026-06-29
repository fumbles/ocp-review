Set Up htpasswd as the Identity Provider and Add Users and Permissions
Create htpasswd file with these users with the password doubletap:
columbus
wichita
littlerock
tallahassee
admin
Create HTPasswd Secret from file.
Download the HTPasswd Custom Resource (using the link provided on the lab page).
Add the name of your HTPasswd Secret to the file.
Apply your custom resource to your cluster.
Create a project called zLand.
Give columbus admin permissions to the zLand project.
Give wichita and littlerock edit permissions to the zLand project.
Give tallahassee basic user permissions to the zLand project.
Give admin cluster admin permissions.
Remove the kubeadmin user from the cluster.
Challenge

Role-Based Access and Groups
Create a project called twinkies.
Create a group called yum.
Add columbus, wichita, and littlerock to the yum group.
Grant admin access to the yum group for the project twinkies.
Create a custom resource that allows tallahassee to get pod information from the twinkies project and call it gettwinkies.
Challenge

Quotas and Resource Limits
Download the quota and resource limit templates (using the links provided on the lab page).
Modify the quota.yaml file with the following values:
Max number of pods = 3
Max amount of memory = 2 GB
Max number of replication controllers = 2
Max number of services allowed = 8
Create quota and apply it to the zLand project.
Modify the resource_limits.yaml file with the following values:
Max number of pods = 4
Requested cpus = 1
Requested memory = 1 GB
Requested Ephemeral storage = 2 GB
Limit cpus to 4
Limit memory to 4 GB
Limit Ephemeral storage to 8 GB
Create resource limit and apply it to the twinkies project.
Challenge

Application Creation and Management
Note: Use https://github.com/sclorg/cakephp-ex example app to create applications

Create test-app1, test-app2, test-app3, test-app4, and test-app5 projects.
Create an application named cake and make sure it is accessible to the outside world in project test-app1.
Create an application using a route called twinkiesforall in the test-app2 project.
Create an application using a secured route called mytwinkie in the test-app3 project. Use self-signed cert from lab repo to secure the route (the links are provided on the lab page).
Create an application that can use the dont-tell secret project test-app4.
Create a secret called dont-tell in the test-app4 project. Download the secret.yaml file (using the link provided on the lab page).
Populate with the user dXN1ci1uYW11 and password dGHcz4dvCmQ=.
Create a service account called madison in the test-app5 project.
Create an application that can be edited by the madison service account in the test-app5 project.
Manually scale the application in the test-app2 project to 2 pods.
Set an autoscaler for min of 1 pod and a max of 3 pods based of 75% CPU utilization for the application in the test-app5 project.
