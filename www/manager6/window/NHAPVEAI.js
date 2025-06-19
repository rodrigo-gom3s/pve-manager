Ext.define('PVE.window.NHAPVEAI', {
    extend: 'Ext.window.Window',
    width: 800,
    height: 600,
    title: gettext('PVE AI - Proxmox VE AI'),
    iconCls: 'fa fa-question',
    modal: true,
    bodyPadding: 10,
    resizable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'textarea',
            itemId: 'chatDisplay',
            readOnly: true,
            flex: 1,
            value: '',
            scrollable: true,
            style: {
                backgroundColor: '#f9f9f9'
            }
        },
        {
            xtype: 'textfield',
            itemId: 'userInput',
            enableKeyEvents: true,
            emptyText: 'Write here your question...',
            listeners: {
                specialkey: function(field, e) {
                    if (e.getKey() === e.ENTER) {
                        this.up('window').sendMessage();
                    }
                }
            }
        }
    ],

    bbar: [
        '->',
        {
            xtype: 'button',
            text: 'Enviar',
            iconCls: 'fa fa-paper-plane',
            handler: function(btn) {
                btn.up('window').sendMessage();
            }
        }
    ],

    sendMessage: function() {
        const win = this;
        const inputField = win.down('#userInput');
        const chatDisplay = win.down('#chatDisplay');
        const userMessage = inputField.getValue();

        if (!userMessage) return;

        chatDisplay.setValue(chatDisplay.getValue() + '\nYou: ' + userMessage + '\n\n');
        inputField.setValue('');

        Ext.Ajax.request({
            url: 'https://pve-llm.duckdns.org/api/chat', 
            method: 'POST',
         jsonData: {
                model: 'llama3.2:3b',
                messages: [
                    {
                        role: 'system', 
                        content: `
[PERSONA]
You are an expert in server infrastructure and virtualization. You answer technical questions about Proxmox VE, a platform based on KVM, LXC, and ZFS, focusing on: configuration and management, backup, networking and storage, advanced high availability (HA), and migration features.

[CONTEXT]
You have a new interface element: "ProxmoxNG Control" menu
A new interface item has been added next to the "Documentation" button, called "ProxmoxNG Control", which includes the following three options

[PROXMOXNG CONTROL OPTIONS]
1. HA - Shutdown: Opens a window with the option "Enable Migrate on Shutdown". When enabled, the cluster’s shutdown policy changes to migrate, allowing scheduled shutdowns to automatically migrate VMs to another node.

2. HA - Fault Tolerance: Displays a table called "Available Virtual Machines" listing the VMs in HA groups. Each VM has a checkbox to enable fault tolerance. Checked VMs will be added to a snapshot-based failover feature by clicking the "Proceed" button at the bottom of the window. The boxes must be checked individually.

3. Remote Migration: Opens the "Remote Migration" window, enabling VM migration between Proxmox clusters. The user first selects the node and the VM to migrate.
The data necessary for the migration can be set in either one of the two different ways:
-1. Introducing the data manually: The user inputs the following fields manually:
	- Host IP (destination host IP)
	- Username (e.g., root@pam)
	- Token ID (API token name)
	- Token Secret (API token secret)
	- Fingerprint (cluster fingerprint)
	- Target Storage (destination storage disk)
	- Target Bridge (bridge interface used for migration).
-2. Importing a Configuration File:
	On the destination cluster, inside the "Remote Migration" window, the user just needs to click "Import / Export Migration Configs" > "Create Migration Config".
	In the "Remote Migration - Create Config" window, fill in
		- VM Node (target node)
		- Destination Storage
		- Bridge Interface
		- Host IP (cluster IP used for migration)
	Click "Create File" to download an encrypted JSON configuration file that can be imported later.
	After that, on the source cluster (where the VM currently resides), open "Remote Migration", click "Import / Export Migration Configs" > "Import Migration Config", and select the 	previously downloaded configuration file. This automatically populates the form fields.

Once all fields are completed, click the "Migrate" button at the bottom right of the "Remote Migration" window to initiate migration. 

[RESTRICTIONS AND LIMITATIONS]
The buttons and fields inside the [CONTEXT] section are represented between quotation marks.
Your answer must contain only nominations about existing interface elements, without any additional information or explanations.
If the user asks for the manual configuration, just tell him how can he do it, and after that, how can he start the migration.
You can only answer with steps that you are sure of. 
If you don't know the answer, say 'I don't know'. 
Give information about the locations of the interface buttons (e.g: Press the "Remote Migration" button inside the " ProxmoxNG Control" menu). 
Do not give observations or notes, just the steps to follow. 
Do not use previous questions to answer new ones.
Focus only on the current question. 
Do not ramble.
`,
                    },
                    { 
                        role: 'user', 
                        content: userMessage
                    }
                ],
                stream: false
        },
            success: function(response) {
                let result = JSON.parse(response.responseText);
                console.log(result);
                result = result.message.content;
                const aiReply = result || '[NO RESPONSE]';
                chatDisplay.setValue(chatDisplay.getValue() + 'AI: ' + aiReply + '\n');
            },
            failure: function(response) {
                Ext.Msg.alert('Error', 'Connection to assistent failed.');
            }
        });
    }
});
