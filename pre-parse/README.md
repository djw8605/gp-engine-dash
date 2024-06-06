Pre-Parse for GP-ENGINE dashboard
=================================

These scripts gather data from NRP prometheus and store it in NRP's S3. 
The GP-ENGINE dashboard then reads this data from S3 and displays it.

## Secret creation
```bash
kubectl create secret generic nautilus-secret --from-literal=NAUTILUS_ID=<id> --from-literal=NAUTILUS_ACCESS_KEY=<key> --dry-run=client -o yaml > secrets.yaml
```