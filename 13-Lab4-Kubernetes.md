---
marp: true
theme: default
html: true
inlineSVG: true
paginate: true
header: "Cloud Services | HS Fulda – Bachelor AI"
footer: "Sebastian Rieger · MMNet · Hochschule Fulda"
style: |
  :root {
    --color-primary: #003366;
    --color-accent:  #0066cc;
    --color-light:   #e8f0f8;
  }
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 20px;
    line-height: 1.4;
    padding: 56px 62px;
    color: #1a1a1a;
    background: #ffffff;
  }
  h1 {
    color: var(--color-primary);
    font-size: 1.8em;
    border-bottom: 3px solid var(--color-accent);
    padding-bottom: 0.2em;
  }
  h2 {
    color: var(--color-accent);
    font-size: 1.3em;
  }
  section.title {
    background: var(--color-primary);
    color: #ffffff;
    text-align: center;
    justify-content: center;
  }
  section.title h1 {
    color: #ffffff;
    border-bottom: 3px solid #ffffff;
    font-size: 2em;
  }
  section.title p, section.title h2 {
    color: #cce0ff;
  }
  section.section-break {
    background: var(--color-accent);
    color: #ffffff;
    justify-content: center;
    text-align: center;
  }
  section.section-break h1 {
    color: #ffffff;
    border-color: #ffffff;
    font-size: 2.2em;
  }
  section.section-break p {
    color: #cce0ff;
    font-size: 1.1em;
  }
  ul { margin: 0.4em 0; padding-left: 1.4em; }
  li { margin: 0.3em 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
  th { background: var(--color-primary); color: white; padding: 6px 10px; }
  td { padding: 5px 10px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) td { background: var(--color-light); }
  code { background: var(--color-light); padding: 2px 6px; border-radius: 3px; font-size: 0.85em; }
  blockquote {
    border-left: 4px solid var(--color-accent);
    background: var(--color-light);
    padding: 0.5em 1em;
    margin: 0.5em 0;
    border-radius: 0 4px 4px 0;
  }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }
  .columns3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8em; }
  .card {
    background: var(--color-light);
    border-left: 4px solid var(--color-accent);
    border-radius: 0 6px 6px 0;
    padding: 0.6em 0.8em;
  }
  .research-card {
    background: rgba(102,170,255,0.12);
    border-left: 4px solid #66aaff;
    border-radius: 0 6px 6px 0;
    padding: 0.6em 0.8em;
  }
  img[alt~="center"] { display: block; margin: 0 auto; }
---

<!-- _class: title -->

# Lab 4 – Kubernetes

## Orchestrierung mit RKE2, Helm und OpenStack

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda

<!--
Ziel: In diesem Lab bauen Sie einen echten Kubernetes-Cluster in OpenStack auf, deployen einen Workload und
beobachten Selbstheilung, Storage und Load-Balancing — und räumen alles reproduzierbar wieder ab.
💡 Lab-README: https://github.com/srieger1/cloud-services-examples/tree/main/lab4
💡 RKE2-Terraform-Beispiel (hs-fulda): https://github.com/srieger1/terraform-openstack-rke2/tree/hsfulda-example/examples/hs-fulda
Zeitbedarf: ~90 Minuten (Cluster-Provisionierung dauert ca. 10 Minuten).
-->

---

## Was Sie heute bauen

- **Cluster:** RKE2 per Terraform in OpenStack — 1 Controller + 1 Worker; `kubeconfig` holen und mit `kubectl`/`k9s` inspizieren
- **Workloads:** nginx-Beispiel deployen, WordPress per Helm-Chart installieren
- **Beobachten:** Volumes, Load-Balancer und Server-Groups in Horizon; einen Pod löschen und die Selbstheilung sehen
- **Verstehen:** Aufbau des Helm-Charts (`Chart.yaml`, `values.yaml`, Templates) und die wichtigsten `kubectl`-Befehle
- **Aufräumen:** `helm uninstall` vor `terraform destroy`; danach OpenStack auf Reste prüfen

<!--
Bezug: Lab-README Task 1–5. Task 1 (Repo/Module verstehen) und Task 5 (Logs, Shell im Pod, ReplicaSet) sind
im Punkt „Verstehen" gebündelt — sie laufen nebenbei während der Beobachtung.
-->

---

## Kernkonzepte

- **Control Plane vs. Worker:** Controller (API-Server, `etcd`, Scheduler) hält den Soll-Zustand, Worker führen die Pods aus
- **Pod → ReplicaSet → Deployment:** Deployment beschreibt den Soll-Zustand, ReplicaSet hält die Pod-Anzahl, Rolling Updates
- **Service & Ingress:** `ClusterIP` intern, `LoadBalancer` über OpenStack (Octavia), Ingress für HTTP-Routing
- **Namespace · ConfigMap · Secret · PVC/PV:** Trennung, Konfiguration, Zugangsdaten, StorageClass (CSI-Cinder)
- **Warum orchestrieren statt Compose?** Selbstheilung, Skalierung und Rollouts über mehrere Nodes; Helm verpackt das Ganze als Chart

## Grundlagen-Kasten

<div class="card">

**kubeconfig** – Cluster-Endpunkt + Zertifikate (`KUBECONFIG`; RKE2: `/etc/rancher/rke2/rke2.yaml`)
**kubectl / k9s** – CLI bzw. Terminal-UI gegen den API-Server (`get`, `describe`, `logs`, `exec`, `delete`)
**Node · Pod · Namespace · Chart** – Maschine · kleinste Ausführungseinheit · logische Abgrenzung · installierbares Paket

</div>

<!--
Server-Groups und Anti-Affinity sind Terraform-seitig sichtbar: Worker landen bewusst auf verschiedenen Compute-Hosts.
kubectl-Basics Schritt für Schritt: https://kubernetes.io/docs/reference/kubectl/quick-reference/
-->

---

## Live-Demo

Ablauf: Cluster steht → Pods und Services ansehen → WordPress per Helm installieren → einen Pod löschen und beim Neuaufbau zusehen.

```bash
kubectl get nodes,pods,svc -A -o wide
helm install my-release oci://registry-1.docker.io/bitnamicharts/wordpress
kubectl delete pod <pod-name> -n default
```

💡 k9s – Terminal-UI für Kubernetes: https://k9scli.io/

<!--
Fallback: Falls die Umgebung nicht erreichbar ist, zeigen Sie einen Screenshot bzw. die Kommando-Zeile und
erklären Sie das erwartete Ergebnis (Pod wird sofort neu erstellt, `EXTERNAL-IP` erscheint nach einigen Minuten).
Nach dem `delete pod`: `kubectl get pods -w` laufen lassen — der Pod kommt mit neuem Namen zurück.
-->

---

## Abnahmekriterien

- Kubernetes-Manifeste (**Deployment, Service, ConfigMap, Secret**) *oder* ein eigenes **Helm-Chart** im Repo
- **Service-Exposure** nachvollziehbar: `ClusterIP`, `LoadBalancer` oder `Ingress` — Ingress inklusive Ingress-Controller
- **Workload aus dem Repo deploybar:** README mit Schritten, eine fremde Person schafft es in 30 Minuten
- **Konfiguration getrennt vom Image:** ConfigMap/Secret statt hartkodierter Werte, keine Passwörter im Repo
- **Aufräumen belegt:** `helm uninstall` dokumentiert, danach `terraform destroy` — keine Reste in OpenStack

---

## Deep Dive (freiwillig)

- **Talos Linux statt RKE2 (Wahl):** immutables, komplett über die API verwaltetes Kubernetes-OS — keine SSH-Shell, kein Paketmanagement auf den Nodes. 💡 Talos: https://www.talos.dev/
- **Gateway API statt Ingress (Wahl):** getrennte Rollen `GatewayClass`/`Gateway`/`HTTPRoute`, HTTP/2 und gRPC, Traffic-Splitting; nächste Stufe: **NetworkPolicies** und **RBAC**. 💡 Gateway API: https://gateway-api.sigs.k8s.io/

<!--
Beides ist ein Angebot für Fortgeschrittene, keine Pflicht für die Abgabe.
NetworkPolicies: https://kubernetes.io/docs/concepts/services-networking/network-policies/
RBAC: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
-->

---

## Story: „Mal eben schnell … schleichend im Betrieb"

Platzhalter — die Praxisgeschichte trägt der Dozent hier mündlich nach.

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder „… schleichend im Betrieb").
Template (D14): 1) Keyword aus der Kategorie wählen; 2) 2–4 Sätze Erzählung (anonymisiert, ohne Firmennamen);
3) zwei Merker — Herausforderung / Konsequenz; 4) genau eine 🧠-Frage am Ende, die auf die Studierenden zeigt.
-->

---

## Lessons Learned

- **MTU/VXLAN:** In der VM stimmt die MTU, im Pod nicht — Dienste sind aus dem Pod heraus nicht erreichbar (mehrere Gruppen betroffen)
- **Volumes bleiben:** Die StorageClass `retain` behält Cinder-Volumes nach `helm uninstall` — manuell löschen, sonst laufen die Kosten weiter
- **Kein Einsteiger-Chart:** `kube-prometheus-stack` mit ~5000 Zeilen `values.yaml` überfordert — mit einem kleinen Chart beginnen
- **Reihenfolge beim Aufräumen:** Erst `helm uninstall`, sonst blockieren Load-Balancer und Volumes das `terraform destroy`

💡 Persistent Volumes – Kubernetes-Doku: https://kubernetes.io/docs/concepts/storage/persistent-volumes/

🧠 Warum stimmt die MTU in der VM, aber nicht im Pod?
