# ProxmoxNG

**ProxmoxNG** is a plugin for the **Proxmox VE** hypervisor that adds advanced features for control, fault tolerance, and intelligent assistance directly into the Proxmox web interface.

## Features

The plugin introduces a new dropdown menu called **"ProxmoxNG Control"** located in the top-right corner of the Proxmox VE web UI. From this menu, users can access the following functionalities:

### ✅ Smart Shutdown Policy
- Modify the cluster's shutdown behavior.
- When a **node is manually shut down**, the VMs running on it are **automatically migrated** to another node in the cluster.

### 🔄 Fault Tolerance
- Automatically create **live snapshots** of running VMs at regular intervals.
- In the event of a node failure, VMs can be restarted using the **most recent snapshot state**.
- Users can specify which VMs should have fault tolerance enabled via the plugin interface.

### 🌐 Remote Migration via UI
- Enables use of **remote migration**, a feature of Proxmox VE typically only accessible via CLI, now made available through the web interface.

---

## 📦 Installation

To install **ProxmoxNG**, simply run the installation script provided in the official repository:

👉 [https://github.com/rodrigo-gom3s/proxmoxng-install](https://github.com/rodrigo-gom3s/proxmoxng-install)

Follow the installation guide included in the repository for step-by-step instructions.

---

## 📘 Requirements

- Proxmox VE 8.3 - 8.4 
- Administrator access to the cluster  
- Internet access to download and install the plugin  

---

## 📜 License

This project is licensed under the terms of the [MIT License](LICENSE).
